// components/VehicleDetailModal.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, X, MapPin, Calendar, DollarSign, Fuel, Gauge, Users,
  CheckCircle, XCircle, Clock, AlertCircle, Star, Phone, Mail
} from 'lucide-react';

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
}

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onRent?: (vehicle: Vehicle) => void;
}

// Helper function for fuel type icon
const getFuelTypeIcon = (fuelType: string) => {
  const icons: Record<string, string> = {
    electric: '🔋',
    hybrid: '⚡',
    petrol: '⛽',
    diesel: '🛢️'
  };
  return icons[fuelType?.toLowerCase()] || '⛽';
};

// Helper function for vehicle status badge with dark mode support
const getVehicleStatusBadge = (vehicle: Vehicle) => {
  if (!vehicle.isVerified) {
    return {
      label: 'Pending Verification',
      icon: Clock,
      className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700'
    };
  }
  if (vehicle.isAvailable) {
    return {
      label: 'Available',
      icon: CheckCircle,
      className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-700'
    };
  }
  return {
    label: 'Unavailable',
    icon: XCircle,
    className: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'
  };
};

export default function VehicleDetailModal({
  isOpen,
  onClose,
  vehicle,
  onRent
}: VehicleDetailModalProps) {
  if (!isOpen || !vehicle) return null;

  const status = getVehicleStatusBadge(vehicle);
  const StatusIcon = status.icon;

  const handleRent = () => {
    if (onRent) {
      onRent(vehicle);
    } else {
      alert(`Renting ${vehicle.brand} ${vehicle.model}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{
                type: "spring",
                duration: 0.5,
                bounce: 0.3,
                damping: 25
              }}
              className="relative w-full max-w-4xl pointer-events-auto"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all duration-200 group"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
                </button>

                {/* Hero Image Section */}
                <div className="relative h-72 md:h-96 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900">
                  {vehicle.photos && vehicle.photos.length > 0 ? (
                    <img
                      src={vehicle.photos[0]}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-24 h-24 text-gray-600 dark:text-gray-500" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${status.className}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </div>

                  {/* Vehicle Title */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">
                      {vehicle.brand} {vehicle.model}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-white/80">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {vehicle.year}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/40" />
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {vehicle.city || 'Location not set'}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/40" />
                      <span className="flex items-center gap-1">
                        <span className="text-xl font-bold text-green-400">
                          ₹{vehicle.pricePerDay}
                        </span>
                        <span className="text-sm">/ day</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-24rem)]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-6">
                      {/* Description */}
                      {vehicle.description && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                            Description
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {vehicle.description}
                          </p>
                        </div>
                      )}

                      {/* Specifications Grid */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                          Specifications
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                              <Fuel className="w-4 h-4" />
                              Fuel Type
                            </div>
                            <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">
                              {getFuelTypeIcon(vehicle.fuelType)} {vehicle.fuelType}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                              <Gauge className="w-4 h-4" />
                              Transmission
                            </div>
                            <p className="font-medium text-gray-800 dark:text-gray-200 mt-1 capitalize">
                              {vehicle.transmission}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                              <Users className="w-4 h-4" />
                              Seats
                            </div>
                            <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">
                              {vehicle.seats} Seats
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                              <Car className="w-4 h-4" />
                              License Plate
                            </div>
                            <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">
                              {vehicle.licensePlate}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                              <span className="text-lg">🎨</span>
                              Color
                            </div>
                            <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">
                              {vehicle.color}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                              <Clock className="w-4 h-4" />
                              Listed
                            </div>
                            <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">
                              {new Date(vehicle.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Rejection Reason with dark mode support */}
                      {vehicle.rejectionReason && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-red-800 dark:text-red-400">Rejection Reason</p>
                              <p className="text-sm text-red-700 dark:text-red-300">{vehicle.rejectionReason}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sidebar - Owner & Actions */}
                    <div className="space-y-4">
                      {/* Owner Card with dark mode support */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                          Owner
                        </h3>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                            {vehicle.ownerName?.[0] || 'O'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                              {vehicle.ownerName || 'Vehicle Owner'}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span>4.8</span>
                              <span className="text-gray-400 dark:text-gray-500">(24 reviews)</span>
                            </div>
                          </div>
                        </div>
                        {vehicle.ownerPhone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <Phone className="w-4 h-4" />
                            {vehicle.ownerPhone}
                          </div>
                        )}
                        {vehicle.ownerEmail && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4" />
                            {vehicle.ownerEmail}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons with dark mode support */}
                      <div className="space-y-2">
                        {vehicle.isAvailable && vehicle.isVerified ? (
                          <button
                            onClick={handleRent}
                            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            <Car className="w-5 h-5" />
                            Rent Now - ₹{vehicle.pricePerDay}/day
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Clock className="w-5 h-5" />
                            {vehicle.isVerified ? 'Currently Unavailable' : 'Pending Verification'}
                          </button>
                        )}

                        <button
                          onClick={onClose}
                          className="w-full py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}