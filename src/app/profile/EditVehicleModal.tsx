// app/profile/EditVehicleModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Car, AlertCircle, CheckCircle, Edit3, Camera, FileText, Trash2 } from 'lucide-react';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  fuelType: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  isAvailable: boolean;
  isVerified: boolean;
  rejectionReason?: string;
  photos: string[];
  city: string;
  createdAt: string;
  description?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  address?: string;
  zipCode?: string;
  state?: string;
  bluebookDocuments?: string[];
  vin?: string;
  doors?: number;
  luggageCapacity?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  securityDeposit?: number;
  availableFrom?: string;
  availableTo?: string;
  minRentalDays?: number;
  maxRentalDays?: number;
  terms?: string;
  latitude?: number;
  longitude?: number;
  features?: string[];
}

interface EditVehicleModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

// Generate a unique VIN
const generateUniqueVIN = (id: number, brand: string, model: string, year: number): string => {
  const prefix = brand.substring(0, 3).toUpperCase();
  const suffix = model.substring(0, 3).toUpperCase();
  const yearStr = year.toString().slice(-2);
  const uniqueId = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
  return `${prefix}${suffix}${yearStr}${id}${uniqueId}`.substring(0, 17).toUpperCase();
};

export default function EditVehicleModal({ vehicle, isOpen, onClose, onSuccess }: EditVehicleModalProps) {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    licensePlate: '',
    fuelType: 'PETROL',
    transmission: 'MANUAL',
    seats: 4,
    pricePerDay: 0,
    city: '',
    address: '',
    state: '',
    zipCode: '',
    description: '',
    photos: [] as string[],
    existingBluebookDocuments: [] as string[],
  });

  // New photo uploads
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // New bluebook uploads
  const [newBluebookFiles, setNewBluebookFiles] = useState<File[]>([]);
  const [newBluebookPreviews, setNewBluebookPreviews] = useState<string[]>([]);
  const [isCompressingBluebook, setIsCompressingBluebook] = useState(false);
  const bluebookInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultModal, setResultModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  useEffect(() => {
    if (vehicle) {
      const bluebookDocs = vehicle.bluebookDocuments || [];

      setFormData({
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        color: vehicle.color || '',
        licensePlate: vehicle.licensePlate || '',
        fuelType: vehicle.fuelType || 'PETROL',
        transmission: vehicle.transmission || 'MANUAL',
        seats: vehicle.seats || 4,
        pricePerDay: vehicle.pricePerDay || 0,
        city: vehicle.city || '',
        address: vehicle.address || '',
        state: vehicle.state || '',
        zipCode: vehicle.zipCode || '',
        description: vehicle.description || '',
        photos: vehicle.photos || [],
        existingBluebookDocuments: bluebookDocs,
      });

      setNewPhotos([]);
      setNewPhotoPreviews([]);
      setNewBluebookFiles([]);
      setNewBluebookPreviews([]);
      setError(null);
    }
  }, [vehicle]);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || localStorage.getItem('token');
    }
    return null;
  };

  // ---- Vehicle photo upload ----
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsCompressingPhoto(true);
      setError('');

      const newFiles = Array.from(files);

      if (newPhotos.length + newFiles.length > 5) {
        setError('Maximum 5 photos allowed');
        setIsCompressingPhoto(false);
        return;
      }

      const compressedFiles = await Promise.all(
        newFiles.map(file => compressImage(file, 1200, 1200, 0.7))
      );

      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));

      setNewPhotos(prev => [...prev, ...compressedFiles]);
      setNewPhotoPreviews(prev => [...prev, ...newPreviews]);

      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Image processing failed:', error);
      setError('Failed to process images. Please try with smaller images.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const removeNewPhoto = (index: number) => {
    URL.revokeObjectURL(newPhotoPreviews[index]);
    setNewPhotos(newPhotos.filter((_, i) => i !== index));
    setNewPhotoPreviews(newPhotoPreviews.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // ---- Bluebook upload ----
  const handleBluebookUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsCompressingBluebook(true);
      setError('');

      const newFiles = Array.from(files);

      if (newBluebookFiles.length + newFiles.length > 2) {
        setError('You can upload up to 2 images (front and back of the bluebook)');
        setIsCompressingBluebook(false);
        return;
      }

      const compressedFiles = await Promise.all(
        newFiles.map(file => compressImage(file, 1600, 1600, 0.75))
      );

      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));

      setNewBluebookFiles(prev => [...prev, ...compressedFiles]);
      setNewBluebookPreviews(prev => [...prev, ...newPreviews]);

      if (bluebookInputRef.current) {
        bluebookInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Bluebook image processing failed:', error);
      setError('Failed to process bluebook image. Please try with a smaller image.');
    } finally {
      setIsCompressingBluebook(false);
    }
  };

  const removeNewBluebook = (index: number) => {
    URL.revokeObjectURL(newBluebookPreviews[index]);
    setNewBluebookFiles(newBluebookFiles.filter((_, i) => i !== index));
    setNewBluebookPreviews(newBluebookPreviews.filter((_, i) => i !== index));
  };

  const removeExistingBluebook = (index: number) => {
    setFormData(prev => ({
      ...prev,
      existingBluebookDocuments: prev.existingBluebookDocuments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    // Validate required fields
    if (!formData.brand.trim() || !formData.model.trim() || !formData.licensePlate.trim() || !formData.city.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }

    if (!formData.zipCode.trim()) {
      setError('ZIP code is required');
      return;
    }

    // REMOVED: Bluebook validation - now optional
    // if (formData.existingBluebookDocuments.length === 0 && newBluebookFiles.length === 0) {
    //   setError('At least one bluebook document is required');
    //   return;
    // }

    if (formData.pricePerDay <= 0) {
      setError('Price per day must be greater than 0');
      return;
    }

    // Allow 1 or more seats (for motorcycles, bicycles, etc.)
    if (formData.seats < 1) {
      setError('Vehicle must have at least 1 seat');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        setError('Please sign in to edit your vehicle');
        return;
      }

      // Convert new bluebook files to base64
      let newBluebookBase64: string[] = [];
      if (newBluebookFiles.length > 0) {
        newBluebookBase64 = await filesToBase64(newBluebookFiles);
      }

      const allBluebookDocuments = [
        ...formData.existingBluebookDocuments,
        ...newBluebookBase64
      ];

      // Handle VIN properly to avoid duplicate key constraint
      let vin = vehicle?.vin || '';

      // If VIN is empty, null, 'N/A', or 'null', generate a unique one
      if (!vin || vin === 'N/A' || vin === 'null' || vin.trim() === '') {
        vin = generateUniqueVIN(vehicle.id, formData.brand, formData.model, formData.year);
      }

      const payload = {
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        licensePlate: formData.licensePlate,
        vin: vin,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        seats: formData.seats,
        doors: vehicle?.doors || 4,
        luggageCapacity: vehicle?.luggageCapacity || 2,
        features: vehicle?.features || [],
        pricePerDay: formData.pricePerDay,
        pricePerWeek: vehicle?.pricePerWeek || formData.pricePerDay * 7,
        pricePerMonth: vehicle?.pricePerMonth || formData.pricePerDay * 30,
        securityDeposit: vehicle?.securityDeposit || 5000,
        address: formData.address,
        city: formData.city,
        state: formData.state || 'N/A',
        zipCode: formData.zipCode,
        latitude: vehicle?.latitude || 0.0,
        longitude: vehicle?.longitude || 0.0,
        availableFrom: vehicle?.availableFrom || null,
        availableTo: vehicle?.availableTo || null,
        minRentalDays: vehicle?.minRentalDays || 1,
        maxRentalDays: vehicle?.maxRentalDays || 30,
        description: formData.description || '',
        terms: vehicle?.terms || '',
        photos: formData.photos,
        bluebookDocuments: allBluebookDocuments,
      };

      console.log('Sending payload:', {
        ...payload,
        bluebookDocuments: `${allBluebookDocuments.length} documents`,
        vin: vin
      });

      const response = await fetch(`http://localhost:8080/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setResultModal({
          isOpen: true,
          title: '✅ Vehicle Updated Successfully!',
          message: `Your ${formData.brand} ${formData.model} has been updated.`,
          type: 'success'
        });
        onSuccess();
        setTimeout(() => {
          setResultModal({ ...resultModal, isOpen: false });
          onClose();
          window.location.reload();
        }, 2000);
      } else {
        const text = await response.text();
        let errorMessage = 'Failed to update vehicle';
        try {
          const data = JSON.parse(text);
          errorMessage = data.message || data.error || text;
        } catch {
          errorMessage = text || 'Failed to update vehicle';
        }

        if (errorMessage.includes('Duplicate') && errorMessage.includes('vin')) {
          setError('VIN conflict detected. Please try again with a different VIN.');
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !vehicle) return null;

  const totalBluebookCount = formData.existingBluebookDocuments.length + newBluebookFiles.length;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b border-gray-100 dark:border-gray-700 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-emerald-500" />
                      Edit Vehicle
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.brand} {vehicle.model} ({vehicle.year})
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {error}
                    </p>
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      placeholder="e.g., Toyota"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      placeholder="e.g., Camry"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      min={1900}
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      placeholder="e.g., Red"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      License Plate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition uppercase"
                      placeholder="e.g., KA01AB1234"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      placeholder="e.g., Mumbai"
                      required
                    />
                  </div>
                </div>

                {/* Address Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      placeholder="e.g., 123 Main St"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      placeholder="e.g., Karnataka"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                    placeholder="e.g., 560001"
                    required
                  />
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fuel Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                    >
                      <option value="PETROL">Petrol</option>
                      <option value="DIESEL">Diesel</option>
                      <option value="ELECTRIC">Electric</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="MAN_POWER">Man Power</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Transmission <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData(prev => ({ ...prev, transmission: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                    >
                      <option value="MANUAL">Manual</option>
                      <option value="AUTOMATIC">Automatic</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Seats <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.seats}
                      onChange={(e) => setFormData(prev => ({ ...prev, seats: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      min={1}
                      max={20}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price per Day (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.pricePerDay}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricePerDay: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                      min={0}
                      step={100}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm resize-y min-h-[100px] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                    placeholder="Describe your vehicle features, condition, and any special notes..."
                    rows={4}
                  />
                </div>

                {/* Bluebook Documents Section - Optional now */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bluebook / Vehicle Registration Document <span className="text-gray-400">(Optional)</span>
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Upload clear photos of your vehicle's bluebook (front and back). This is optional and not required for all vehicles.
                  </p>

                  {formData.existingBluebookDocuments.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Existing Documents:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.existingBluebookDocuments.map((doc, index) => (
                          <div key={`existing-${index}`} className="relative group inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                            <FileText className="w-4 h-4 text-purple-500" />
                            <span className="text-xs text-purple-700 dark:text-purple-400 truncate max-w-[150px]">
                              {doc.length > 30 ? doc.substring(0, 30) + '...' : doc}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeExistingBluebook(index)}
                              className="text-purple-500 hover:text-red-500 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mb-3">
                    {newBluebookPreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
                        <img src={preview} alt={`Bluebook ${index + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-xs rounded">
                          {index === 0 ? 'Front' : 'Back'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewBluebook(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {totalBluebookCount < 2 && (
                      <label className="w-24 h-24 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                        <input
                          ref={bluebookInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleBluebookUpload}
                          className="hidden"
                          disabled={isCompressingBluebook}
                        />
                        {isCompressingBluebook ? (
                          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Upload
                        </span>
                      </label>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {totalBluebookCount} of 2 bluebook images uploaded (Optional)
                  </p>
                </div>

                {/* Vehicle Photos Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle Photos
                  </label>

                  {formData.photos.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Existing Photos:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.photos.map((photo, index) => (
                          <div key={`existing-photo-${index}`} className="relative w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
                            <img src={photo} alt={`Vehicle ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeExistingPhoto(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {newPhotoPreviews.map((preview, index) => (
                      <div key={`new-photo-${index}`} className="relative w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
                        <img src={preview} alt={`New vehicle ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewPhoto(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {(formData.photos.length + newPhotos.length) < 5 && (
                      <label className="w-20 h-20 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={isCompressingPhoto}
                        />
                        {isCompressingPhoto ? (
                          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Add
                        </span>
                      </label>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formData.photos.length + newPhotos.length} of 5 photos
                  </p>
                </div>

                {/* Info Section */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
                    <span className="text-lg">ℹ️</span>
                    <span>
                      <strong>Note:</strong> Your vehicle details will be updated immediately.
                      No re-verification is required for edits.
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || isCompressingPhoto || isCompressingBluebook}
                    className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {resultModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
            onClick={() => setResultModal({ ...resultModal, isOpen: false })}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border ${resultModal.type === 'success' ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800'
                } overflow-hidden`}
              onClick={e => e.stopPropagation()}
            >
              <div className={`p-6 text-center ${resultModal.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                <div className={`w-20 h-20 rounded-full ${resultModal.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40'
                  } flex items-center justify-center mx-auto mb-4`}>
                  {resultModal.type === 'success' ? (
                    <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <h3 className={`text-2xl font-bold ${resultModal.type === 'success' ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
                  } mb-2`}>
                  {resultModal.title}
                </h3>
                <p className={`text-sm ${resultModal.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                  {resultModal.message}
                </p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => {
                    setResultModal({ ...resultModal, isOpen: false });
                    if (resultModal.type === 'success') {
                      onClose();
                      window.location.reload();
                    }
                  }}
                  className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition shadow-lg shadow-emerald-500/25"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}