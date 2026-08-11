// app/kyc/page.tsx
'use client';

import Footer from '@/app/component/Footer';
import HomeHeader from '@/app/home/HomeHeader';
import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Types
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

interface FormErrors {
  [key: string]: string;
}

type TextFieldName =
  | 'fullName'
  | 'dateOfBirth'
  | 'gender'
  | 'phoneNumber'
  | 'email'
  | 'permanentAddress'
  | 'temporaryAddress'
  | 'citizenshipNumber'
  | 'drivingLicenseNumber'
  | 'drivingLicenseIssueDate'
  | 'drivingLicenseExpiryDate';

type FileFieldName = 'citizenshipFrontImage' | 'citizenshipBackImage' | 'drivingLicenseImage';

interface InputFieldProps {
  name: TextFieldName;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

interface FileUploadProps {
  field: FileFieldName;
  label: string;
  previewUrl: string;
}

export default function MultiStepKYCForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<KYCFormData>({
    fullName: '', dateOfBirth: '', gender: 'MALE', phoneNumber: '', email: '',
    permanentAddress: '', temporaryAddress: '', citizenshipNumber: '',
    citizenshipFrontImage: null, citizenshipBackImage: null, drivingLicenseNumber: '',
    drivingLicenseIssueDate: '', drivingLicenseExpiryDate: '', drivingLicenseImage: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewUrls, setPreviewUrls] = useState({ citizenshipFront: '', citizenshipBack: '', drivingLicense: '' });

  const totalSteps = 3;

  // Get access token from localStorage
  const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: FormErrors = {};
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      else if (formData.fullName.length < 3) newErrors.fullName = 'Minimum 3 characters';

      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      else if (new Date(formData.dateOfBirth) > eighteenYearsAgo) newErrors.dateOfBirth = 'You must be at least 18 years old';

      if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
      else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Exactly 10 digits required';

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';

      if (!formData.permanentAddress.trim()) newErrors.permanentAddress = 'Permanent address is required';
      if (!formData.temporaryAddress.trim()) newErrors.temporaryAddress = 'Temporary address is required';
    }

    if (step === 2) {
      if (!formData.citizenshipNumber.trim()) newErrors.citizenshipNumber = 'Citizenship number is required';
      if (!formData.citizenshipFrontImage) newErrors.citizenshipFrontImage = 'Front image is required';
      if (!formData.citizenshipBackImage) newErrors.citizenshipBackImage = 'Back image is required';
    }

    if (step === 3) {
      if (!formData.drivingLicenseNumber.trim()) newErrors.drivingLicenseNumber = 'License number is required';
      if (!formData.drivingLicenseIssueDate) newErrors.drivingLicenseIssueDate = 'Issue date is required';

      if (!formData.drivingLicenseExpiryDate) {
        newErrors.drivingLicenseExpiryDate = 'Expiry date is required';
      } else if (new Date(formData.drivingLicenseExpiryDate) <= today) {
        newErrors.drivingLicenseExpiryDate = 'Expiry date must be in the future';
      }

      if (!formData.drivingLicenseImage) newErrors.drivingLicenseImage = 'License image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validateStep, currentStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [field]: 'Please upload an image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [field]: 'File size must be less than 5MB' }));
      return;
    }

    setFormData(prev => ({ ...prev, [field]: file }));
    const url = URL.createObjectURL(file);

    if (field === 'citizenshipFrontImage') setPreviewUrls(prev => ({ ...prev, citizenshipFront: url }));
    else if (field === 'citizenshipBackImage') setPreviewUrls(prev => ({ ...prev, citizenshipBack: url }));
    else if (field === 'drivingLicenseImage') setPreviewUrls(prev => ({ ...prev, drivingLicense: url }));

    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  // Convert file to base64 or upload to server
  const fileToBase64 = (file: File | string | null): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      if (typeof file === 'string') {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) {
      setSubmitStatus({ type: 'error', message: 'Please fix the errors above' });
      setTimeout(() => setSubmitStatus(null), 5000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Please login again');
      }

      // Convert files to base64 strings for JSON payload
      const citizenshipFrontBase64 = await fileToBase64(formData.citizenshipFrontImage);
      const citizenshipBackBase64 = await fileToBase64(formData.citizenshipBackImage);
      const drivingLicenseBase64 = await fileToBase64(formData.drivingLicenseImage);

      const payload = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        permanentAddress: formData.permanentAddress,
        temporaryAddress: formData.temporaryAddress,
        citizenshipNumber: formData.citizenshipNumber,
        citizenshipFrontImage: citizenshipFrontBase64,
        citizenshipBackImage: citizenshipBackBase64,
        drivingLicenseNumber: formData.drivingLicenseNumber,
        drivingLicenseIssueDate: formData.drivingLicenseIssueDate,
        drivingLicenseExpiryDate: formData.drivingLicenseExpiryDate,
        drivingLicenseImage: drivingLicenseBase64,
      };

      const response = await fetch('http://localhost:8080/api/kyc/renter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'KYC submission failed');
      }

      setSubmitStatus({ type: 'success', message: data.message || 'KYC submitted successfully! Our team will review your documents.' });

      // Reset form after successful submission
      setTimeout(() => {
        router.push('/home');
      }, 3000);

    } catch (error: any) {
      console.error('Submission error:', error);
      setSubmitStatus({ type: 'error', message: error.message || 'Failed to submit. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  }, [validateStep, formData, router]);

  const stepIndicator = useMemo(() => (
    <div className="mb-8 overflow-x-auto pb-2">
      <div className="flex min-w-max items-center justify-center px-1">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm
                ${currentStep >= step ? 'bg-green-600 dark:bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                {step}
              </div>
              <span className={`text-xs mt-2 ${currentStep >= step ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                {step === 1 ? 'Personal' : step === 2 ? 'Citizenship' : 'License'}
              </span>
            </div>
            {step < totalSteps && <div className={`w-10 sm:w-16 h-0.5 mx-2 ${currentStep > step ? 'bg-green-600 dark:bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  ), [currentStep]);

  const renderInputField = useCallback(({ name, label, type = "text", placeholder, required = true, ...props }: InputFieldProps) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label} {required && '*'}</label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={formData[name] as string}
          onChange={handleInputChange}
          rows={2}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors[name] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
          placeholder={placeholder}
          {...props}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] as string}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${errors[name] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
          placeholder={placeholder}
          {...props}
        />
      )}
      {errors[name] && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[name]}</p>}
    </div>
  ), [formData, errors, handleInputChange]);

  const renderFileUpload = useCallback(({ field, label, previewUrl }: FileUploadProps) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label} *</label>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, field)}
          className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-green-900/30 file:text-green-700 dark:file:text-green-300 hover:file:bg-green-100 dark:hover:file:bg-green-900/50"
        />
        {previewUrl && <div className="mt-3"><img src={previewUrl} alt={label} className="max-h-32 w-full object-contain mx-auto rounded border border-gray-200 dark:border-gray-700" /></div>}
      </div>
      {errors[field] && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[field]}</p>}
    </div>
  ), [errors, handleFileChange]);

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            {renderInputField({ name: "fullName", label: "Full Name", placeholder: "Enter your full name" })}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInputField({ name: "dateOfBirth", label: "Date of Birth", type: "date" })}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {renderInputField({ name: "phoneNumber", label: "Phone Number", type: "tel", placeholder: "Enter 10-digit phone number", maxLength: 10, inputMode: "numeric" })}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Only numbers allowed, exactly 10 digits</p>
              </div>
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
  }, [currentStep, renderInputField, renderFileUpload, previewUrls, formData.gender, handleInputChange]);

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

          {submitStatus && (
            <div className={`mb-6 p-4 rounded-lg ${submitStatus.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'}`}>
              {submitStatus.message}
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-green-100 dark:border-gray-800 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-green-700 to-emerald-600 dark:from-gray-800 dark:to-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Step {currentStep}: {currentStep === 1 ? 'Personal Information' : currentStep === 2 ? 'Citizenship Details' : 'Driving License Details'}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-4 sm:p-6">{renderStep()}</div>
              <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex flex-col-reverse sm:flex-row justify-between gap-3">
                <button type="button" onClick={handlePrevious}
                  className={`w-full sm:w-auto px-6 py-2 rounded-lg font-semibold transition-colors ${currentStep === 1
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                  disabled={currentStep === 1}>
                  Previous
                </button>
                {currentStep < totalSteps ? (
                  <button type="button" onClick={handleNext}
                    className="w-full sm:w-auto px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-colors">
                    Next
                  </button>
                ) : (
                  <button type="submit" disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 transition-all disabled:opacity-50">
                    {isSubmitting ? 'Submitting...' : 'Submit KYC'}
                  </button>
                )}
              </div>
            </form>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">Step {currentStep} of {totalSteps}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}