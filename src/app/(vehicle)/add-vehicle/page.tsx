// app/vehicles/add/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Car,
  Upload,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Info,
  Calendar,
  Fuel,
  Gauge,
  Users,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Camera,
  Trash2,
  Move,
  Star,
  Wifi,
  Snowflake,
  Coffee,
  Battery,
  Shield,
  Music,
  Wind,
  Smartphone,
  Briefcase,
  Clock
} from 'lucide-react';
import HomeHeader from '../../home/HomeHeader';
import Footer from '../../component/Footer';

// Define the KYC status response interface (matching your HomeHeader)
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

export default function AddVehiclePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<'verified' | 'pending' | 'rejected' | 'not_submitted'>('not_submitted');
  const [kycLoading, setKycLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    // Basic Information
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    licensePlate: '',
    vin: '',

    // Vehicle Details
    fuelType: 'petrol',
    transmission: 'automatic',
    seats: 5,
    doors: 4,
    luggageCapacity: 2,

    // Features
    features: [] as string[],

    // Pricing
    pricePerDay: 0,
    pricePerWeek: 0,
    pricePerMonth: 0,
    securityDeposit: 500,

    // Location
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',

    // Availability
    availableFrom: '',
    availableTo: '',
    minimumRentalDays: 1,
    maximumRentalDays: 30,

    // Description
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

  // Map API status to frontend status
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages([...uploadedImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const toggleFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Vehicle added successfully!');
      router.push('/owner/vehicles');
    }, 2000);
  };

  // Fetch KYC status on component mount
  useEffect(() => {
    async function fetchKycStatus() {
      try {
        const token = localStorage.getItem('accessToken'); // Changed from 'authToken' to 'accessToken' to match your HomeHeader

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

        console.log('Response status:', response.status);

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

        // Use ownerKycStatus from the response (matching your HomeHeader)
        const ownerStatus = mapKYCStatus(data.ownerKycStatus);
        console.log('Mapped owner KYC status:', ownerStatus);

        // Also check the canList flag as a backup
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
  }, [router]);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading KYC status...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Show popup only if KYC is not verified
  if (!kycLoading && kycStatus !== 'verified') {
    // Determine the message based on KYC status
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
          {/* Blurred page background */}
          <div
            className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 filter blur-sm pointer-events-none select-none"
            aria-hidden="true"
          >
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">List Your Vehicle</h1>
                    <p className="text-gray-600 mt-1">Start earning by sharing your vehicle</p>
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
                        <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 bg-white border-gray-300 text-gray-400">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="mt-2 text-center">
                          <p className="text-sm font-medium text-gray-500">{step.title}</p>
                        </div>
                        {index !== steps.length - 1 && (
                          <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-300" style={{ transform: 'translateX(50%)' }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 h-64 opacity-60" />
            </div>
          </div>

          {/* KYC Modal overlay */}
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${kycStatus === 'pending' ? 'bg-yellow-100' :
                  kycStatus === 'rejected' ? 'bg-red-100' :
                    'bg-emerald-100'
                }`}>
                {kycStatus === 'pending' ? (
                  <Clock className="w-8 h-8 text-yellow-600" />
                ) : kycStatus === 'rejected' ? (
                  <AlertCircle className="w-8 h-8 text-red-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-emerald-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{kycMessage.title}</h2>
              <p className="text-gray-500 mb-6">
                {kycMessage.message}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.back()}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">List Your Vehicle</h1>
                <p className="text-gray-600 mt-1">Start earning by sharing your vehicle</p>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                        isCompleted ? 'bg-emerald-100 border-emerald-600 text-emerald-600' :
                          'bg-white border-gray-300 text-gray-400'}
                    `}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {step.title}
                      </p>
                    </div>
                    {index !== steps.length - 1 && (
                      <div className={`absolute top-6 left-1/2 w-full h-0.5 ${isCompleted ? 'bg-emerald-600' : 'bg-gray-300'}`}
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., Toyota, Honda, BMW"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., Camry, CR-V, X5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                    <input
                      type="number"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                    <input
                      type="text"
                      required
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., Black, White, Red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Plate *</label>
                    <input
                      type="text"
                      required
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="License plate number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VIN (Vehicle Identification Number)
                    </label>
                    <input
                      type="text"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="17-character VIN"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Vehicle Details */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Vehicle Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type *</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {fuelTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transmission *</label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {transmissionTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Seats *</label>
                    <input
                      type="number"
                      required
                      value={formData.seats}
                      onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      min="1"
                      max="15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Doors *</label>
                    <input
                      type="number"
                      required
                      value={formData.doors}
                      onChange={(e) => setFormData({ ...formData, doors: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      min="2"
                      max="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Luggage Capacity (bags)</label>
                    <input
                      type="number"
                      value={formData.luggageCapacity}
                      onChange={(e) => setFormData({ ...formData, luggageCapacity: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      min="0"
                      max="10"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Description *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Describe your vehicle's condition, special features, and any important details renters should know..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Features */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Features & Amenities</h2>
                <p className="text-gray-600 mb-6">Select all the features your vehicle offers</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableFeatures.map(feature => {
                    const Icon = feature.icon;
                    const isSelected = formData.features.includes(feature.id);
                    return (
                      <button
                        key={feature.id}
                        type="button"
                        onClick={() => toggleFeature(feature.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{feature.label}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Pricing */}
            {currentStep === 4 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price per Day ($) *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        required
                        value={formData.pricePerDay}
                        onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0"
                        min="0"
                        step="5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price per Week ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        value={formData.pricePerWeek}
                        onChange={(e) => setFormData({ ...formData, pricePerWeek: parseFloat(e.target.value) })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0"
                        min="0"
                        step="10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price per Month ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        value={formData.pricePerMonth}
                        onChange={(e) => setFormData({ ...formData, pricePerMonth: parseFloat(e.target.value) })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0"
                        min="0"
                        step="50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit ($) *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        required
                        value={formData.securityDeposit}
                        onChange={(e) => setFormData({ ...formData, securityDeposit: parseFloat(e.target.value) })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0"
                        min="0"
                        step="50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rental Days</label>
                    <input
                      type="number"
                      value={formData.minimumRentalDays}
                      onChange={(e) => setFormData({ ...formData, minimumRentalDays: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      min="1"
                      max="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Rental Days</label>
                    <input
                      type="number"
                      value={formData.maximumRentalDays}
                      onChange={(e) => setFormData({ ...formData, maximumRentalDays: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Location */}
            {currentStep === 5 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Pickup Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="ZIP code"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Photos */}
            {currentStep === 6 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Vehicle Photos</h2>
                <p className="text-gray-600 mb-6">Upload clear photos of your vehicle (at least 5 photos recommended)</p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                        <img src={image} alt={`Vehicle ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload Photo</span>
                  </label>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Photo Tips</p>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• Include exterior shots from all angles</li>
                        <li>• Take clear photos of the interior (seats, dashboard, trunk)</li>
                        <li>• Highlight any special features or damage</li>
                        <li>• Ensure good lighting and clean vehicle</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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
                  disabled={isSubmitting || uploadedImages.length === 0}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
    </>
  );
}