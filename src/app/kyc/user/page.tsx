// app/kyc/page.tsx
'use client';

import Footer from '@/app/component/Footer';
import HomeHeader from '@/app/home/HomeHeader';
import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface KYCFormData {
  fullName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phoneNumber: string;
  email: string;
  permanentAddress: string;
  temporaryAddress: string;
  citizenshipNumber: string;
  citizenshipFrontImage: File | string | null;
  citizenshipBackImage: File | string | null;
  drivingLicenseNumber: string;
  drivingLicenseIssueDate: string;
  drivingLicenseExpiryDate: string;
  drivingLicenseImage: File | string | null;
}

type TextFieldName = keyof Omit<KYCFormData, 'citizenshipFrontImage' | 'citizenshipBackImage' | 'drivingLicenseImage'>;
type FileFieldName = 'citizenshipFrontImage' | 'citizenshipBackImage' | 'drivingLicenseImage';

export default function MultiStepKYCForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<KYCFormData>({
    fullName: '', dateOfBirth: '', gender: 'MALE', phoneNumber: '', email: '',
    permanentAddress: '', temporaryAddress: '', citizenshipNumber: '',
    citizenshipFrontImage: null, citizenshipBackImage: null, drivingLicenseNumber: '',
    drivingLicenseIssueDate: '', drivingLicenseExpiryDate: '', drivingLicenseImage: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({ citizenshipFront: '', citizenshipBack: '', drivingLicense: '' });

  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePrevious = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      setFormData(prev => ({ ...prev, phoneNumber: value.replace(/\D/g, '').slice(0, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name as TextFieldName]: value }));
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, field: FileFieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, [field]: file }));
    const url = URL.createObjectURL(file);

    if (field === 'citizenshipFrontImage') setPreviewUrls(prev => ({ ...prev, citizenshipFront: url }));
    else if (field === 'citizenshipBackImage') setPreviewUrls(prev => ({ ...prev, citizenshipBack: url }));
    else setPreviewUrls(prev => ({ ...prev, drivingLicense: url }));
  }, []);

  const fileToBase64 = (file: File | string | null): Promise<string | null> => {
    if (!file) return Promise.resolve(null);
    if (typeof file === 'string') return Promise.resolve(file);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const token = getToken();
      if (!token) throw new Error('Please login again');

      const payload = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        permanentAddress: formData.permanentAddress,
        temporaryAddress: formData.temporaryAddress,
        citizenshipNumber: formData.citizenshipNumber,
        citizenshipFrontImage: await fileToBase64(formData.citizenshipFrontImage),
        citizenshipBackImage: await fileToBase64(formData.citizenshipBackImage),
        drivingLicenseNumber: formData.drivingLicenseNumber,
        drivingLicenseIssueDate: formData.drivingLicenseIssueDate,
        drivingLicenseExpiryDate: formData.drivingLicenseExpiryDate,
        drivingLicenseImage: await fileToBase64(formData.drivingLicenseImage),
      };

      const response = await fetch('http://localhost:8080/api/kyc/renter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'KYC submission failed');
      }

      setSubmitStatus({
        type: 'success',
        message: data.message || 'KYC submitted successfully! Our team will review your documents.'
      });
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        router.push('/home');
      }, 3000);
    } catch (error: any) {
      console.error('Submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to submit. Please try again.'
      });
      setShowModal(true);
      setTimeout(() => setShowModal(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSubmitStatus(null);
    if (submitStatus?.type === 'success') {
      router.push('/home');
    }
  }, [router, submitStatus]);

  const inputClass = "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";

  const renderInputField = useCallback(({ name, label, type = "text", placeholder, required = true, ...props }: {
    name: TextFieldName; label: string; type?: string; placeholder?: string; required?: boolean;
    maxLength?: number; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label} {required && '*'}</label>
      {type === 'textarea' ? (
        <textarea name={name} value={formData[name] as string} onChange={handleInputChange} rows={2}
          className={inputClass} placeholder={placeholder} {...props} />
      ) : (
        <input type={type} name={name} value={formData[name] as string} onChange={handleInputChange}
          className={inputClass} placeholder={placeholder} {...props} />
      )}
    </div>
  ), [formData, handleInputChange]);

  const renderFileUpload = useCallback(({ field, label, previewUrl }: { field: FileFieldName; label: string; previewUrl: string }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label} *</label>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors">
        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, field)}
          className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-green-900/30 file:text-green-700 dark:file:text-green-300 hover:file:bg-green-100 dark:hover:file:bg-green-900/50" />
        {previewUrl && <div className="mt-3"><img src={previewUrl} alt={label} className="max-h-32 w-full object-contain mx-auto rounded border border-gray-200 dark:border-gray-700" /></div>}
      </div>
    </div>
  ), [handleFileChange]);

  const renderStep = useCallback(() => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            {renderInputField({ name: "fullName", label: "Full Name", placeholder: "Enter your full name" })}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInputField({ name: "dateOfBirth", label: "Date of Birth", type: "date" })}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className={inputClass}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInputField({ name: "phoneNumber", label: "Phone Number", type: "tel", placeholder: "Enter 10-digit phone number", maxLength: 10, inputMode: "numeric" })}
              {renderInputField({ name: "email", label: "Email Address", type: "email", placeholder: "you@example.com", required: false })}
            </div>
            {renderInputField({ name: "permanentAddress", label: "Permanent Address", type: "textarea", placeholder: "Enter your permanent address" })}
            {renderInputField({ name: "temporaryAddress", label: "Temporary Address", type: "textarea", placeholder: "Enter your temporary address" })}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            {renderInputField({ name: "citizenshipNumber", label: "Citizenship Number", placeholder: "e.g., 01-01-12345678" })}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderFileUpload({ field: "citizenshipFrontImage", label: "Citizenship Front Image", previewUrl: previewUrls.citizenshipFront })}
              {renderFileUpload({ field: "citizenshipBackImage", label: "Citizenship Back Image", previewUrl: previewUrls.citizenshipBack })}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            {renderInputField({ name: "drivingLicenseNumber", label: "Driving License Number", placeholder: "e.g., DL-1234567890" })}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInputField({ name: "drivingLicenseIssueDate", label: "Issue Date", type: "date" })}
              {renderInputField({ name: "drivingLicenseExpiryDate", label: "Expiry Date", type: "date" })}
            </div>
            {renderFileUpload({ field: "drivingLicenseImage", label: "Driving License Image", previewUrl: previewUrls.drivingLicense })}
          </div>
        );
      default: return null;
    }
  }, [step, renderInputField, renderFileUpload, previewUrls, formData.gender, handleInputChange]);

  const stepIndicator = useMemo(() => (
    <div className="mb-8 overflow-x-auto pb-2">
      <div className="flex min-w-max items-center justify-center px-1">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm
                ${step >= s ? 'bg-green-600 dark:bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                {s}
              </div>
              <span className={`text-xs mt-2 ${step >= s ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                {s === 1 ? 'Personal' : s === 2 ? 'Citizenship' : 'License'}
              </span>
            </div>
            {s < 3 && <div className={`w-10 sm:w-16 h-0.5 mx-2 ${step > s ? 'bg-green-600 dark:bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  ), [step]);

  // Modal Component
  const StatusModal = () => {
    if (!showModal || !submitStatus) return null;

    const isSuccess = submitStatus.type === 'success';
    const icon = isSuccess ? (
      <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
          <div className="text-center">
            <div className="mb-4">{icon}</div>
            <h3 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isSuccess ? 'Success!' : 'Error!'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{submitStatus.message}</p>
            <button
              onClick={closeModal}
              className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors ${isSuccess
                  ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                  : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                }`}
            >
              {isSuccess ? 'Continue to Home' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <HomeHeader />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-700 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">KYC Verification</h1>
            <p className="text-gray-600 dark:text-gray-400">Complete your identity verification in 3 easy steps</p>
          </div>

          {stepIndicator}

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-green-100 dark:border-gray-800 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-green-700 to-emerald-600 dark:from-gray-800 dark:to-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Step {step}: {step === 1 ? 'Personal Information' : step === 2 ? 'Citizenship Details' : 'Driving License Details'}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-4 sm:p-6">{renderStep()}</div>
              <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex flex-col-reverse sm:flex-row justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className={`w-full sm:w-auto px-6 py-2 rounded-lg font-semibold transition-colors ${step === 1
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                  disabled={step === 1}>
                  Previous
                </button>
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full sm:w-auto px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-colors">
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 transition-all disabled:opacity-50">
                    {isSubmitting ? 'Submitting...' : 'Submit KYC'}
                  </button>
                )}
              </div>
            </form>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">Step {step} of 3</div>
        </div>
      </main>
      <Footer />
      <StatusModal />
    </div>
  );
}