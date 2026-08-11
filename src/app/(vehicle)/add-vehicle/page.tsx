// app/(vehicle)/add-vehicle/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Car,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  Camera,
  Trash2,
  Move,
  Star,
  Wifi,
  Snowflake,
  Coffee,
  Shield,
  Music,
  Smartphone,
  Users,
  MapPin,
  DollarSign,
  Clock,
  Gauge,
  Fuel,
  Loader2
} from 'lucide-react';
import HomeHeader from '../../home/HomeHeader';
import Footer from '../../component/Footer';
import LocationPicker from '../../component/LocationPicker';

// Define the KYC status response interface
interface KYCStatusResponse {
  success: boolean;
  message: string;
  kycStatus: string;
  kycLevel: string;
  kycType: string;
  renterKycStatus: string;
  ownerKycStatus: string;
  canBook: boolean;
  canList: boolean;
  userId: number;
  userFullName: string;
  userEmail: string;
  dailyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number;
  kycVerifiedAt: string | null;
  kycSubmittedAt: string | null;
  rejectionReason: string | null;
}

// Notification Popup Component
function NotificationPopup({
  type,
  message,
  onClose
}: {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`max-w-md w-full mx-4 ${getBgColor()} border rounded-2xl shadow-2xl p-6 transform animate-in zoom-in-95 duration-200`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${getTextColor()} mb-2`}>
              {type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : type === 'warning' ? 'Warning!' : 'Info'}
            </h3>
            <p className={`text-sm ${getTextColor()} opacity-90`}>
              {message}
            </p>
            <div className="mt-4 pt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="animate-progress-bar bg-current h-full rounded-full" style={{
                  width: '100%',
                  animation: 'progress 3s linear forwards'
                }} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-progress-bar {
          animation: progress 3s linear forwards;
        }
      `}</style>
    </div>
  );
}

// Image compression utility
const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

// Main component
export default function AddVehiclePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<'verified' | 'pending' | 'rejected' | 'not_submitted'>('not_submitted');
  const [kycLoading, setKycLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    licensePlate: '',
    vin: '',
    fuelType: 'petrol',
    transmission: 'automatic',
    seats: 5,
    doors: 4,
    luggageCapacity: 2,
    features: [] as string[],
    pricePerDay: '',
    pricePerWeek: '',
    pricePerMonth: '',
    securityDeposit: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    availableFrom: '',
    availableTo: '',
    minimumRentalDays: 1,
    maximumRentalDays: 30,
    description: '',
    terms: ''
  });

  const availableFeatures = [
    { id: 'ac', label: 'Air Conditioning', icon: Snowflake },
    { id: 'gps', label: 'GPS Navigation', icon: MapPin },
    { id: 'bluetooth', label: 'Bluetooth', icon: Wifi },
    { id: 'backupCamera', label: 'Backup Camera', icon: Camera },
    { id: 'parkingSensors', label: 'Parking Sensors', icon: AlertCircle },
    { id: 'cruiseControl', label: 'Cruise Control', icon: Gauge },
    { id: 'heatedSeats', label: 'Heated Seats', icon: Coffee },
    { id: 'sunroof', label: 'Sunroof', icon: Move },
    { id: 'usbPorts', label: 'USB Ports', icon: Smartphone },
    { id: 'premiumSound', label: 'Premium Sound', icon: Music },
    { id: 'keylessEntry', label: 'Keyless Entry', icon: Shield },
    { id: 'childSeat', label: 'Child Seat Available', icon: Users }
  ];

  const fuelTypes = [
    { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  const transmissionTypes = [
    { value: 'automatic', label: 'Automatic' },
    { value: 'manual', label: 'Manual' }
  ];

  const parseNumberInput = (value: string | number): number => {
    if (value === '' || value === null || value === undefined) return 0;
    const parsed = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value;
    if (value === '' || value === '-') {
      setFormData(prev => ({ ...prev, [field]: value }));
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const filesToBase64 = async (files: File[]): Promise<string[]> => {
    const base64Promises = files.map(file => fileToBase64(file));
    return await Promise.all(base64Promises);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsCompressing(true);
      setUploadError('');

      const newFiles = Array.from(files);

      // Validate total count
      if (uploadedImages.length + newFiles.length > 5) {
        setUploadError('Maximum 5 photos allowed');
        setIsCompressing(false);
        return;
      }

      // Validate individual file sizes
      const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setUploadError('Each image must be less than 10MB. Please compress your images.');
        setIsCompressing(false);
        return;
      }

      // Compress images
      const compressedFiles = await Promise.all(
        newFiles.map(file => compressImage(file, 1200, 1200, 0.7))
      );

      // Create previews
      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));

      setUploadedImages(prev => [...prev, ...compressedFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Image processing failed:', error);
      setUploadError('Failed to process images. Please try with smaller images.');
    } finally {
      setIsCompressing(false);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const toggleFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
      address: address
    }));
  };

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string, autoRedirect?: boolean, redirectPath?: string) => {
    setNotification({ type, message });
    if (autoRedirect && redirectPath) {
      setTimeout(() => {
        router.push(redirectPath);
      }, 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== FORM SUBMISSION STARTED ===');

    try {
      if (uploadedImages.length === 0) {
        showNotification('error', 'Please upload at least one photo of your vehicle', false);
        return;
      }

      const pricePerDay = parseNumberInput(formData.pricePerDay);
      const securityDeposit = parseNumberInput(formData.securityDeposit);

      if (pricePerDay <= 0) {
        showNotification('warning', 'Please set a valid price per day', false);
        return;
      }

      if (securityDeposit <= 0) {
        showNotification('warning', 'Please set a valid security deposit', false);
        return;
      }

      setIsSubmitting(true);
      setUploadError('');

      const token = localStorage.getItem('accessToken');
      if (!token) {
        showNotification('error', 'Authentication failed. Please login again.', true, '/signin');
        setIsSubmitting(false);
        return;
      }

      // Convert images to base64 with size check
      let base64Images: string[] = [];
      try {
        base64Images = await filesToBase64(uploadedImages);
        console.log(`Converted ${base64Images.length} images to base64`);

        // Check total payload size
        const totalSize = JSON.stringify(base64Images).length;
        console.log(`Total images size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

        if (totalSize > 10 * 1024 * 1024) {
          showNotification('error', 'Images are too large. Please use smaller images (max 2MB each).', false);
          setIsSubmitting(false);
          return;
        }
      } catch (convertErr) {
        console.error('Image conversion failed:', convertErr);
        showNotification('error', 'Failed to process images. Please try again with smaller images.', false);
        setIsSubmitting(false);
        return;
      }

      const requestBody: any = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: formData.year,
        color: formData.color.trim(),
        licensePlate: formData.licensePlate.trim().toUpperCase(),
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        seats: formData.seats,
        doors: formData.doors,
        luggageCapacity: formData.luggageCapacity || 0,
        features: formData.features,
        pricePerDay: pricePerDay,
        securityDeposit: securityDeposit,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        minRentalDays: formData.minimumRentalDays,
        maxRentalDays: formData.maximumRentalDays,
        description: formData.description.trim(),
        photos: base64Images
      };

      if (formData.vin && formData.vin.trim()) {
        requestBody.vin = formData.vin.trim().toUpperCase();
      }

      const pricePerWeek = parseNumberInput(formData.pricePerWeek);
      if (pricePerWeek > 0) {
        requestBody.pricePerWeek = pricePerWeek;
      }

      const pricePerMonth = parseNumberInput(formData.pricePerMonth);
      if (pricePerMonth > 0) {
        requestBody.pricePerMonth = pricePerMonth;
      }

      if (formData.latitude && formData.latitude.trim()) {
        requestBody.latitude = parseFloat(formData.latitude);
      }
      if (formData.longitude && formData.longitude.trim()) {
        requestBody.longitude = parseFloat(formData.longitude);
      }
      if (formData.availableFrom) {
        requestBody.availableFrom = new Date(formData.availableFrom).toISOString();
      }
      if (formData.availableTo) {
        requestBody.availableTo = new Date(formData.availableTo).toISOString();
      }
      if (formData.terms && formData.terms.trim()) {
        requestBody.terms = formData.terms.trim();
      }

      console.log('Sending request to:', 'http://localhost:8080/api/vehicles');

      const response = await fetch('http://localhost:8080/api/vehicles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);

      if (response.status === 413) {
        showNotification('error', 'Images are too large for the server. Please use smaller images.', false);
        setIsSubmitting(false);
        return;
      }

      if (response.status === 401 || response.status === 403) {
        showNotification('error', 'Session expired. Please login again.', true, '/signin');
        setIsSubmitting(false);
        return;
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      console.log('Response data:', responseData);

      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || 'Failed to add vehicle';
        throw new Error(errorMessage);
      }

      console.log('Vehicle added successfully:', responseData);
      showNotification(
        'success',
        responseData.message || 'Vehicle added successfully! Redirecting to your vehicles...',
        true,
        '/vehicles'
      );

    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = error.message || 'Failed to add vehicle. Please try again.';
      showNotification('error', errorMessage, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch KYC status on component mount
  useEffect(() => {
    async function fetchKycStatus() {
      try {
        const token = localStorage.getItem('accessToken');

        if (!token) {
          console.log('No access token found');
          router.push('/signin');
          return;
        }

        console.log('Fetching KYC status...');

        const response = await fetch('http://localhost:8080/api/kyc/status', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.status === 401 || response.status === 403) {
          console.log('Unauthorized, redirecting to login');
          router.push('/signin');
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: KYCStatusResponse = await response.json();
        console.log('KYC Status Response:', data);

        const ownerStatus = mapKYCStatus(data.ownerKycStatus);

        if (data.canList === true) {
          console.log('User can list vehicles (canList=true)');
          setKycStatus('verified');
        } else {
          setKycStatus(ownerStatus);
        }

      } catch (error) {
        console.error('Failed to fetch KYC status:', error);
        setKycStatus('not_submitted');
      } finally {
        setKycLoading(false);
      }
    }

    fetchKycStatus();

    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [router]);

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.brand || !formData.model || !formData.year || !formData.color || !formData.licensePlate) {
        showNotification('warning', 'Please fill in all required fields in Basic Information', false);
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.description) {
        showNotification('warning', 'Please provide a vehicle description', false);
        return;
      }
    } else if (currentStep === 4) {
      const pricePerDay = parseNumberInput(formData.pricePerDay);
      const securityDeposit = parseNumberInput(formData.securityDeposit);

      if (pricePerDay <= 0) {
        showNotification('warning', 'Please set a valid price per day', false);
        return;
      }
      if (securityDeposit <= 0) {
        showNotification('warning', 'Please set a valid security deposit', false);
        return;
      }
    } else if (currentStep === 5) {
      if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
        showNotification('warning', 'Please fill in all location fields', false);
        return;
      }
    }

    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mapKYCStatus = (status: string): 'verified' | 'pending' | 'rejected' | 'not_submitted' => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
        return 'verified';
      case 'SUBMITTED':
        return 'pending';
      case 'REJECTED':
        return 'rejected';
      default:
        return 'not_submitted';
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: Car },
    { number: 2, title: 'Vehicle Details', icon: Gauge },
    { number: 3, title: 'Features', icon: Star },
    { number: 4, title: 'Pricing', icon: DollarSign },
    { number: 5, title: 'Location', icon: MapPin },
    { number: 6, title: 'Photos', icon: Camera }
  ];

  if (kycLoading) {
    return (
      <>
        <HomeHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading KYC status...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Show popup only if KYC is not verified
  if (!kycLoading && kycStatus !== 'verified') {
    const getKycMessage = () => {
      switch (kycStatus) {
        case 'pending':
          return {
            title: 'Owner KYC Verification Pending',
            message: 'Your owner KYC verification is currently pending. Our team is reviewing your documents. You will be notified once verified. Please wait for approval before adding a vehicle.',
            buttonText: 'Check Status',
            buttonAction: '/kyc/status'
          };
        case 'rejected':
          return {
            title: 'Owner KYC Verification Rejected',
            message: 'Your owner KYC verification was rejected. Please check the reason and resubmit your documents with correct information.',
            buttonText: 'Resubmit Owner KYC',
            buttonAction: '/kyc/owner'
          };
        default:
          return {
            title: 'Owner KYC Verification Required',
            message: 'You must complete and verify your Owner KYC before adding a vehicle. This includes submitting your citizenship, driving license, and vehicle bluebook.',
            buttonText: 'Complete Owner KYC',
            buttonAction: '/kyc/owner'
          };
      }
    };

    const kycMessage = getKycMessage();

    return (
      <>
        <HomeHeader />
        <div className="relative">
          <div
            className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-950 to-gray-100 dark:to-gray-900 filter blur-sm pointer-events-none select-none"
            aria-hidden="true"
          >
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">List Your Vehicle</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Start earning by sharing your vehicle</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="flex justify-between items-center mb-8">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.number} className="flex-1 relative">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="mt-2 text-center">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{step.title}</p>
                        </div>
                        {index !== steps.length - 1 && (
                          <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-300 dark:bg-gray-700" style={{ transform: 'translateX(50%)' }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 h-64 opacity-60" />
            </div>
          </div>

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${kycStatus === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                kycStatus === 'rejected' ? 'bg-red-100 dark:bg-red-900/20' :
                  'bg-emerald-100 dark:bg-emerald-900/20'
                }`}>
                {kycStatus === 'pending' ? (
                  <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-300" />
                ) : kycStatus === 'rejected' ? (
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-300" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-300" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">{kycMessage.title}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {kycMessage.message}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.back()}
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => router.push(kycMessage.buttonAction)}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  {kycMessage.buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <HomeHeader />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-950 to-gray-100 dark:to-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">List Your Vehicle</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Start earning by sharing your vehicle</p>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex-1 relative">
                  <div className={`flex flex-col items-center ${index !== steps.length - 1 ? 'relative' : ''}`}>
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                      ${isActive ? 'bg-emerald-600 border-emerald-600 text-white' :
                        isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-600 text-emerald-600 dark:text-emerald-300' :
                          'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400'}
                    `}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${isActive ? 'text-emerald-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        {step.title}
                      </p>
                    </div>
                    {index !== steps.length - 1 && (
                      <div className={`absolute top-6 left-1/2 w-full h-0.5 ${isCompleted ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                        style={{ transform: 'translateX(50%)' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand *</label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder="e.g., Toyota, Honda, BMW"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model *</label>
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder="e.g., Camry, CR-V, X5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year *</label>
                    <input
                      type="number"
                      required
                      value={formData.year}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setFormData({ ...formData, year: val });
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color *</label>
                    <input
                      type="text"
                      required
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder="e.g., Black, White, Red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">License Plate *</label>
                    <input
                      type="text"
                      required
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder="License plate number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">VIN</label>
                    <input
                      type="text"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder="17-character VIN"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Vehicle Details */}
            {currentStep === 2 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Vehicle Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fuel Type *</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                    >
                      {fuelTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transmission *</label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                    >
                      {transmissionTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seats *</label>
                    <input
                      type="number"
                      required
                      value={formData.seats}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setFormData({ ...formData, seats: val });
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      min="1"
                      max="15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Doors *</label>
                    <input
                      type="number"
                      required
                      value={formData.doors}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setFormData({ ...formData, doors: val });
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      min="2"
                      max="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Luggage Capacity</label>
                    <input
                      type="number"
                      value={formData.luggageCapacity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setFormData({ ...formData, luggageCapacity: val });
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      min="0"
                      max="10"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                    placeholder="Describe your vehicle..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Features */}
            {currentStep === 3 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableFeatures.map(feature => {
                    const Icon = feature.icon;
                    const isSelected = formData.features.includes(feature.id);
                    return (
                      <button
                        key={feature.id}
                        type="button"
                        onClick={() => toggleFeature(feature.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-600 dark:text-gray-300'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{feature.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Pricing */}
            {currentStep === 4 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price per Day *</label>
                    <input
                      type="number"
                      required
                      value={formData.pricePerDay}
                      onChange={(e) => handleNumberChange(e, 'pricePerDay')}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder="0"
                      min="0"
                      step="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price per Week</label>
                    <input
                      type="number"
                      value={formData.pricePerWeek}
                      onChange={(e) => handleNumberChange(e, 'pricePerWeek')}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder="0"
                      min="0"
                      step="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price per Month</label>
                    <input
                      type="number"
                      value={formData.pricePerMonth}
                      onChange={(e) => handleNumberChange(e, 'pricePerMonth')}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder="0"
                      min="0"
                      step="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Security Deposit *</label>
                    <input
                      type="number"
                      required
                      value={formData.securityDeposit}
                      onChange={(e) => handleNumberChange(e, 'securityDeposit')}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder="0"
                      min="0"
                      step="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Rental Days</label>
                    <input
                      type="number"
                      value={formData.minimumRentalDays}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1) {
                          setFormData({ ...formData, minimumRentalDays: val });
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      min="1"
                      max="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Rental Days</label>
                    <input
                      type="number"
                      value={formData.maximumRentalDays}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1) {
                          setFormData({ ...formData, maximumRentalDays: val });
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Location */}
            {currentStep === 5 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">📍 Pickup Location</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Select the exact location where renters can pick up the vehicle.
                </p>

                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLat={formData.latitude || 27.7172}
                  initialLng={formData.longitude || 85.324}
                  initialAddress={formData.address || ''}
                  height={450}
                />

                <input type="hidden" name="latitude" value={formData.latitude} />
                <input type="hidden" name="longitude" value={formData.longitude} />

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder="ZIP code"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Photos */}
            {currentStep === 6 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Photos</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Upload photos of your vehicle (at least 1 photo required, max 5 photos)</p>

                {uploadError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-red-600 dark:text-red-300 text-sm">
                    {uploadError}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
                      <img src={preview} alt={`Vehicle ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {uploadedImages.length < 5 && (
                    <label className="aspect-square bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isCompressing}
                      />
                      {isCompressing ? (
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400 mb-2" />
                      )}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {isCompressing ? 'Compressing...' : 'Upload Photo'}
                      </span>
                    </label>
                  )}
                </div>

                {uploadedImages.length > 0 && (
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    {uploadedImages.length} of 5 photos uploaded
                  </p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Previous
                </button>
              )}
              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors ml-auto"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || uploadedImages.length === 0 || isCompressing}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Listing Vehicle...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>List Vehicle</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <Footer />

      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}