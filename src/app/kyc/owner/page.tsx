// app/kyc/owner/page.tsx
'use client';

import Footer from '@/app/component/Footer';
import HomeHeader from '@/app/home/HomeHeader';
import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Types
interface OwnerKYCFormData {
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  permanentAddress: string;
  citizenshipNumber: string;
  citizenshipFrontImage: File | string | null;
  citizenshipBackImage: File | string | null;
  drivingLicenseNumber: string;
  drivingLicenseExpiryDate: string;
  drivingLicenseImage: File | string | null;
  vehicleBluebookNumber: string;
  vehicleBluebookImage: File | string | null;
  vehicleOwnershipCertificate: File | string | null;
  bankAccountNumber: string;
  bankName: string;
  bankAccountHolderName: string;
  panNumber: string;
}

interface FormErrors {
  [key: string]: string;
}

type TextFieldName =
  | 'fullName'
  | 'dateOfBirth'
  | 'phoneNumber'
  | 'permanentAddress'
  | 'citizenshipNumber'
  | 'drivingLicenseNumber'
  | 'drivingLicenseExpiryDate'
  | 'vehicleBluebookNumber'
  | 'bankAccountNumber'
  | 'bankName'
  | 'bankAccountHolderName'
  | 'panNumber';

type FileFieldName = 'citizenshipFrontImage' | 'citizenshipBackImage' | 'drivingLicenseImage' | 'vehicleBluebookImage' | 'vehicleOwnershipCertificate';

interface InputFieldProps {
  name: TextFieldName;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}

interface FileUploadProps {
  field: FileFieldName;
  label: string;
  previewUrl: string;
  required?: boolean;
}

export default function OwnerKYCPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OwnerKYCFormData>({
    fullName: '', dateOfBirth: '', phoneNumber: '', permanentAddress: '',
    citizenshipNumber: '', citizenshipFrontImage: null, citizenshipBackImage: null,
    drivingLicenseNumber: '', drivingLicenseExpiryDate: '', drivingLicenseImage: null,
    vehicleBluebookNumber: '', vehicleBluebookImage: null, vehicleOwnershipCertificate: null,
    bankAccountNumber: '', bankName: '', bankAccountHolderName: '', panNumber: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewUrls, setPreviewUrls] = useState({
    citizenshipFront: '', citizenshipBack: '', drivingLicense: '',
    vehicleBluebook: '', vehicleOwnership: ''
  });

  const totalSteps = 4;

  const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

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

      if (!formData.permanentAddress.trim()) newErrors.permanentAddress = 'Permanent address is required';
    }

    if (step === 2) {
      if (!formData.citizenshipNumber.trim()) newErrors.citizenshipNumber = 'Citizenship number is required';
      if (!formData.citizenshipFrontImage) newErrors.citizenshipFrontImage = 'Citizenship front image is required';
      if (!formData.citizenshipBackImage) newErrors.citizenshipBackImage = 'Citizenship back image is required';
      if (!formData.drivingLicenseNumber.trim()) newErrors.drivingLicenseNumber = 'Driving license number is required';
      if (!formData.drivingLicenseExpiryDate) newErrors.drivingLicenseExpiryDate = 'License expiry date is required';
      else if (new Date(formData.drivingLicenseExpiryDate) <= today) newErrors.drivingLicenseExpiryDate = 'Expiry date must be in the future';
      if (!formData.drivingLicenseImage) newErrors.drivingLicenseImage = 'Driving license image is required';
    }

    if (step === 3) {
      if (!formData.vehicleBluebookNumber.trim()) newErrors.vehicleBluebookNumber = 'Vehicle Bluebook number is required';
      if (!formData.vehicleBluebookImage) newErrors.vehicleBluebookImage = 'Vehicle Bluebook image is required';
    }

    if (step === 4) {
      if (!formData.bankAccountNumber.trim()) newErrors.bankAccountNumber = 'Bank account number is required';
      if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
      if (!formData.bankAccountHolderName.trim()) newErrors.bankAccountHolderName = 'Account holder name is required';
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
    else if (field === 'vehicleBluebookImage') setPreviewUrls(prev => ({ ...prev, vehicleBluebook: url }));
    else if (field === 'vehicleOwnershipCertificate') setPreviewUrls(prev => ({ ...prev, vehicleOwnership: url }));

    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) {
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

      const citizenshipFrontBase64 = await fileToBase64(formData.citizenshipFrontImage);
      const citizenshipBackBase64 = await fileToBase64(formData.citizenshipBackImage);
      const drivingLicenseBase64 = await fileToBase64(formData.drivingLicenseImage);
      const vehicleBluebookBase64 = await fileToBase64(formData.vehicleBluebookImage);
      const vehicleOwnershipBase64 = await fileToBase64(formData.vehicleOwnershipCertificate);

      const payload = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        permanentAddress: formData.permanentAddress,
        citizenshipNumber: formData.citizenshipNumber,
        citizenshipFrontImage: citizenshipFrontBase64,
        citizenshipBackImage: citizenshipBackBase64,
        drivingLicenseNumber: formData.drivingLicenseNumber,
        drivingLicenseExpiryDate: formData.drivingLicenseExpiryDate,
        drivingLicenseImage: drivingLicenseBase64,
        vehicleBluebookNumber: formData.vehicleBluebookNumber,
        vehicleBluebookImage: vehicleBluebookBase64,
        vehicleOwnershipCertificate: vehicleOwnershipBase64,
        bankAccountNumber: formData.bankAccountNumber,
        bankName: formData.bankName,
        bankAccountHolderName: formData.bankAccountHolderName,
        panNumber: formData.panNumber,
      };

      const response = await fetch('http://localhost:8080/api/kyc/owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Owner KYC submission failed');
      }

      setSubmitStatus({ type: 'success', message: data.message || 'Owner KYC submitted successfully! Our team will verify your documents.' });

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
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm
                ${currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {step}
              </div>
              <span className={`text-xs mt-2 ${currentStep >= step ? 'text-green-700 dark:text-green-300 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                {step === 1 ? 'Personal' : step === 2 ? 'Identity' : step === 3 ? 'Vehicle' : 'Payment'}
              </span>
            </div>
            {step < totalSteps && <div className={`w-10 sm:w-16 h-0.5 mx-2 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  ), [currentStep]);

  const renderInputField = useCallback(({ name, label, type = "text", placeholder, required = true, maxLength }: InputFieldProps) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label} {required && '*'}</label>
      <input
        type={type}
        name={name}
        value={formData[name] as string}
        onChange={handleInputChange}
        maxLength={maxLength}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${errors[name] ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
        placeholder={placeholder}
      />
      {errors[name] && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{errors[name]}</p>}
    </div>
  ), [formData, errors, handleInputChange]);

  const renderTextArea = useCallback(({ name, label, placeholder, required = true }: InputFieldProps) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label} {required && '*'}</label>
      <textarea
        name={name}
        value={formData[name] as string}
        onChange={handleInputChange}
        rows={3}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${errors[name] ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
        placeholder={placeholder}
      />
      {errors[name] && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{errors[name]}</p>}
    </div>
  ), [formData, errors, handleInputChange]);

  const renderFileUpload = useCallback(({ field, label, previewUrl, required = true }: FileUploadProps) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label} {required && '*'}</label>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, field)}
          className="w-full text-sm dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-green-900/20 file:text-green-700 dark:file:text-green-300 hover:file:bg-green-100 dark:hover:file:bg-green-900/30"
        />
        {previewUrl && <div className="mt-3"><img src={previewUrl} alt={label} className="max-h-32 w-full object-contain mx-auto rounded border" /></div>}
      </div>
      {errors[field] && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{errors[field]}</p>}
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
              {renderInputField({ name: "phoneNumber", label: "Phone Number", type: "tel", placeholder: "Enter 10-digit phone number", maxLength: 10 })}
            </div>
            {renderTextArea({ name: "permanentAddress", label: "Permanent Address", type: "textarea", placeholder: "Enter your permanent address" })}
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
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Driving License Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInputField({ name: "drivingLicenseNumber", label: "Driving License Number", placeholder: "e.g., DL-1234567890" })}
                {renderInputField({ name: "drivingLicenseExpiryDate", label: "License Expiry Date", type: "date" })}
              </div>
              {renderFileUpload({ field: "drivingLicenseImage", label: "Driving License Image", previewUrl: previewUrls.drivingLicense })}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                ⚠️ Vehicle ownership documents are mandatory for listing vehicles on MobilityHub.
                Please ensure your Bluebook and ownership certificate are clear and valid.
              </p>
            </div>
            {renderInputField({ name: "vehicleBluebookNumber", label: "Vehicle Bluebook Number", placeholder: "Enter Bluebook number" })}
            {renderFileUpload({ field: "vehicleBluebookImage", label: "Vehicle Bluebook Image", previewUrl: previewUrls.vehicleBluebook })}
            {renderFileUpload({ field: "vehicleOwnershipCertificate", label: "Vehicle Ownership Certificate (Optional)", previewUrl: previewUrls.vehicleOwnership, required: false })}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInputField({ name: "bankAccountNumber", label: "Bank Account Number", placeholder: "Enter account number" })}
              {renderInputField({ name: "bankName", label: "Bank Name", placeholder: "e.g., Nepal Bank Limited" })}
            </div>
            {renderInputField({ name: "bankAccountHolderName", label: "Account Holder Name", placeholder: "Enter name as per bank account" })}
            {renderInputField({ name: "panNumber", label: "PAN Number (Optional)", placeholder: "Enter PAN number", required: false })}
          </div>
        );
      default: return null;
    }
  }, [currentStep, renderInputField, renderTextArea, renderFileUpload, previewUrls]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950 dark:via-gray-950 dark:to-emerald-950">
      <HomeHeader />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Owner KYC Verification</h1>
            <p className="text-gray-600 dark:text-gray-300">Complete verification to list your vehicles for rent</p>
          </div>

          {stepIndicator}

          {submitStatus && (
            <div className={`mb-6 p-4 rounded-lg ${submitStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'}`}>
              {submitStatus.message}
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-green-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-green-700 to-emerald-600">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Step {currentStep}: {currentStep === 1 ? 'Personal Information' : currentStep === 2 ? 'Identity Documents' : currentStep === 3 ? 'Vehicle Documents' : 'Payment Information'}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-4 sm:p-6">{renderStep()}</div>
              <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-col-reverse sm:flex-row justify-between gap-3">
                <button type="button" onClick={handlePrevious}
                  className={`w-full sm:w-auto px-6 py-2 rounded-lg font-semibold transition-colors ${currentStep === 1 ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                  disabled={currentStep === 1}>
                  Previous
                </button>
                {currentStep < totalSteps ? (
                  <button type="button" onClick={handleNext}
                    className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                    Next
                  </button>
                ) : (
                  <button type="submit" disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50">
                    {isSubmitting ? 'Submitting...' : 'Submit Owner KYC'}
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