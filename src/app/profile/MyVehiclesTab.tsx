// app/profile/MyVehiclesTab.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Car, Shield, Plus, Loader2, CheckCircle, Clock, AlertCircle,
  XCircle, Users, MapPin, Eye, ChevronRight, Navigation
} from 'lucide-react';

interface UserProfileData {
  id: number;
  username: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  renterKycStatus: string;
  ownerKycStatus: string;
  canBook: boolean;
  canList: boolean;
}

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

interface BookingSummary {
  bookingId: number;
  bookingReference: string;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  pickupDate: string;
  dropoffDate: string;
  status: string;
  totalAmount: number;
  totalDays: number;
  paymentStatus: string;
  paymentMethod: string;
}

interface VehicleBookingStatus {
  vehicleId: number;
  vehicleName: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  isCurrentlyBooked: boolean;
  activeBookings: BookingSummary[];
  nextAvailableDate: string | null;
  totalActiveBookings: number;
}

const getFuelTypeIcon = (fuelType: string) => {
  const icons: Record<string, string> = {
    electric: '🔋',
    hybrid: '⚡',
    petrol: '⛽',
    diesel: '🛢️'
  };
  return icons[fuelType?.toLowerCase()] || '⛽';
};

const getVehicleStatusColor = (vehicle: Vehicle) => {
  if (vehicle.rejectionReason && vehicle.rejectionReason.length > 0) {
    return 'border-red-200 dark:border-red-800';
  }
  if (!vehicle.isVerified) {
    return 'border-yellow-200 dark:border-yellow-800';
  }
  if (vehicle.isAvailable) {
    return 'border-green-200 dark:border-green-800';
  }
  return 'border-gray-200 dark:border-gray-700';
};

const getVehicleBookingAvailability = (vehicle: Vehicle, status?: VehicleBookingStatus) => {
  // Check for rejection
  if (vehicle.rejectionReason && vehicle.rejectionReason.length > 0) {
    return { isBooked: false, message: 'Vehicle rejected by admin', type: 'rejected', isAvailable: false };
  }

  // Check for pending verification
  if (!vehicle.isVerified) {
    return { isBooked: false, message: 'Pending verification', type: 'pending', isAvailable: false };
  }

  // Check if vehicle is set as unavailable by owner
  if (!vehicle.isAvailable) {
    return { isBooked: false, message: 'Vehicle unavailable', type: 'unavailable', isAvailable: false };
  }

  // Check booking status - if there are ANY active bookings (confirmed or active)
  const hasActiveBookings = (status?.totalActiveBookings || 0) > 0;
  const isCurrentlyBooked = status?.isCurrentlyBooked || hasActiveBookings || false;

  return {
    isBooked: isCurrentlyBooked,
    message: isCurrentlyBooked ? 'Currently Booked' : 'Available for booking',
    type: isCurrentlyBooked ? 'booked' : 'available',
    isAvailable: !isCurrentlyBooked
  };
};

export default function MyVehiclesTab({
  vehicles,
  loading,
  onViewDetails,
  userData,
  vehicleStatuses,
  statusLoading
}: {
  vehicles: Vehicle[];
  loading: boolean;
  onViewDetails: (vehicle: Vehicle) => void;
  userData: UserProfileData;
  vehicleStatuses: VehicleBookingStatus[];
  statusLoading: boolean;
}) {
  const router = useRouter();
  const [showStatus, setShowStatus] = useState(true);

  if (userData.ownerKycStatus !== 'VERIFIED') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-yellow-600 dark:text-yellow-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Owner KYC Required</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {userData.ownerKycStatus === 'SUBMITTED' && 'Your Owner KYC is currently under review. You\'ll be able to manage vehicles once verified.'}
            {userData.ownerKycStatus === 'REJECTED' && 'Your Owner KYC was rejected. Please resubmit your documents for verification.'}
            {userData.ownerKycStatus === 'NOT_SUBMITTED' && 'Complete your Owner KYC verification to list and manage your vehicles.'}
          </p>
          <button
            onClick={() => router.push('/kyc/owner')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 dark:bg-yellow-500 text-white rounded-xl hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors font-semibold"
          >
            <Shield className="w-4 h-4" />
            Complete KYC
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-sm">Loading your vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No Vehicles Listed</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            You haven't listed any vehicles yet. Start earning by sharing your vehicle with the community.
          </p>
          <button
            onClick={() => router.push('/add-vehicle')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Your First Vehicle
          </button>
        </div>
      </div>
    );
  }

  // Only return a booking ID if the renter has actually STARTED the trip
  // (status === 'ACTIVE'). A CONFIRMED/APPROVED booking is "currently booked"
  // but has no location data yet — tracking that would always 404.
  const getActiveTripBookingId = (vehicleId: number): number | null => {
    const status = vehicleStatuses.find(vs => vs.vehicleId === vehicleId);
    if (status && status.activeBookings && status.activeBookings.length > 0) {
      const ongoingTrip = status.activeBookings.find(
        b => b.status?.toUpperCase() === 'ACTIVE'
      );
      return ongoingTrip ? ongoingTrip.bookingId : null;
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="font-extrabold text-gray-800 dark:text-gray-100 text-lg">
            My Vehicles ({vehicles.length})
          </h3>
          {statusLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-green-600 dark:text-green-400" />
          ) : (
            <button
              onClick={() => setShowStatus(!showStatus)}
              className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center gap-1 transition-colors"
            >
              {showStatus ? 'Hide Status' : 'Show Status'}
            </button>
          )}
        </div>
        <button
          onClick={() => router.push('/add-vehicle')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((vehicle) => {
          const status = vehicleStatuses.find(vs => vs.vehicleId === vehicle.id);
          const bookingStatus = getVehicleBookingAvailability(vehicle, status);
          const isRejected = vehicle.rejectionReason && vehicle.rejectionReason.length > 0;
          const isPending = !vehicle.isVerified && !isRejected;
          const isBooked = bookingStatus.isBooked;
          const activeTripBookingId = getActiveTripBookingId(vehicle.id);

          return (
            <div
              key={vehicle.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border overflow-hidden hover:shadow-md transition-shadow ${getVehicleStatusColor(vehicle)}`}
            >
              <div className="relative h-40 bg-gray-100 dark:bg-gray-700">
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
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <Car className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}

                {/* Booking Status Badge - Top Left */}
                {showStatus && !isRejected && !isPending && (
                  <div className="absolute top-3 left-3">
                    {bookingStatus.isBooked ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-500 text-white shadow-lg">
                        <Clock className="w-3 h-3 mr-1 animate-pulse" />
                        Currently Booked
                      </span>
                    ) : bookingStatus.isAvailable ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500 text-white shadow-lg">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Available
                      </span>
                    ) : null}
                  </div>
                )}

                {/* Rejected Banner */}
                {isRejected && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-50/95 dark:bg-red-900/90 backdrop-blur-sm p-2 px-3 border-t border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-700 dark:text-red-300">
                      <strong>Rejected:</strong> {vehicle.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Pending Banner */}
                {isPending && (
                  <div className="absolute bottom-0 left-0 right-0 bg-yellow-50/95 dark:bg-yellow-900/90 backdrop-blur-sm p-2 px-3 border-t border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      <strong>Pending:</strong> Waiting for admin verification
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className={`font-semibold ${isRejected ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                      {vehicle.brand} {vehicle.model}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.year} • {vehicle.color}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isRejected ? 'text-gray-400 dark:text-gray-500' : 'text-green-600 dark:text-green-400'}`}>
                      ₹{vehicle.pricePerDay}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">per day</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                    <Users className="w-3 h-3" />
                    {vehicle.seats}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                    <span>{getFuelTypeIcon(vehicle.fuelType)}</span>
                    {vehicle.fuelType}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                    <span>{vehicle.transmission}</span>
                  </div>
                </div>

                {/* Booking Details Section */}
                {showStatus && !isRejected && !isPending && status && (
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {bookingStatus.isBooked ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                            🚗 Currently Rented
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {status.totalActiveBookings} active booking{status.totalActiveBookings > 1 ? 's' : ''}
                          </span>
                        </div>
                        {status.activeBookings && status.activeBookings.length > 0 ? (
                          <>
                            {status.activeBookings.slice(0, 2).map((booking) => (
                              <div key={booking.bookingId} className="text-xs text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-600 pt-1.5 mt-1.5 first:border-t-0 first:pt-0 first:mt-0">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="font-medium">{booking.renterName}</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${booking.status?.toUpperCase() === 'ACTIVE'
                                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                    }`}>
                                    {booking.status?.toUpperCase() === 'ACTIVE' ? 'Trip Active' : 'Confirmed'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-gray-500 dark:text-gray-400 mt-0.5">
                                  <span>
                                    {new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.dropoffDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-gray-400 dark:text-gray-500">
                                  <span>{booking.totalDays} days</span>
                                  <span>₹{booking.totalAmount}</span>
                                </div>
                              </div>
                            ))}
                            {status.activeBookings.length > 2 && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                +{status.activeBookings.length - 2} more booking{status.activeBookings.length - 2 > 1 ? 's' : ''}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            No active booking details available
                          </p>
                        )}
                        {status.nextAvailableDate && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 font-medium">
                            Next available: {new Date(status.nextAvailableDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-1">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          ✅ Vehicle is available for booking
                        </p>
                        {status.totalActiveBookings === 0 && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            No upcoming bookings
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Show booking status even if status is null but vehicle should be available */}
                {showStatus && !isRejected && !isPending && !status && (
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-center py-1">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✅ Vehicle is available for booking
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        No active bookings
                      </p>
                    </div>
                  </div>
                )}

                {/* Rejected Message */}
                {isRejected && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-xs text-red-600 dark:text-red-400 text-center">
                      <XCircle className="w-4 h-4 inline mr-1" />
                      This vehicle has been rejected by admin and cannot be rented
                    </p>
                  </div>
                )}

                {/* Pending Message */}
                {isPending && (
                  <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
                      <Clock className="w-4 h-4 inline mr-1" />
                      This vehicle is pending admin verification
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {vehicle.city || 'Location not set'}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Track Button - only shown once the renter has actually STARTED the trip (status === ACTIVE) */}
                    {isBooked && !isRejected && !isPending && activeTripBookingId && (
                      <button
                        onClick={() => router.push(`/tracking?bookingId=${activeTripBookingId}`)}
                        className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Track
                      </button>
                    )}
                    <button
                      onClick={() => onViewDetails(vehicle)}
                      className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}