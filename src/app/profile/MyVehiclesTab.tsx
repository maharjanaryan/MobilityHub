// app/profile/MyVehiclesTab.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Shield, Plus, Loader2, CheckCircle, Clock, AlertCircle,
  XCircle, Users, MapPin, Eye, ChevronRight, Navigation, X, Edit3
} from 'lucide-react';
import EditVehicleModal from './EditVehicleModal';

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

  // Check if there's any booking with AWAITING_RETURN_CONFIRMATION status
  const hasAwaitingReturn = status?.activeBookings?.some(
    b => b.status?.toUpperCase() === 'AWAITING_RETURN_CONFIRMATION'
  ) || false;

  // Also check if there are any active bookings (CONFIRMED, ACTIVE, or AWAITING_RETURN_CONFIRMATION)
  // that overlap with current date/time
  const now = new Date();
  const hasOverlappingBooking = status?.activeBookings?.some(b => {
    const pickupDate = new Date(b.pickupDate);
    const dropoffDate = new Date(b.dropoffDate);
    // If status is AWAITING_RETURN_CONFIRMATION, the vehicle is still considered "booked" until owner confirms return
    if (b.status?.toUpperCase() === 'AWAITING_RETURN_CONFIRMATION') {
      return true;
    }
    return now >= pickupDate && now <= dropoffDate;
  }) || false;

  // Check booking status - if there are ANY active bookings (confirmed, active, or awaiting return)
  const hasActiveBookings = (status?.totalActiveBookings || 0) > 0;
  const isCurrentlyBooked = status?.isCurrentlyBooked || hasActiveBookings || hasOverlappingBooking || false;

  return {
    isBooked: isCurrentlyBooked,
    hasAwaitingReturn: hasAwaitingReturn,
    message: hasAwaitingReturn ? 'Awaiting Return Confirmation' :
      isCurrentlyBooked ? 'Currently Rented' : 'Available for booking',
    type: hasAwaitingReturn ? 'awaiting_return' :
      isCurrentlyBooked ? 'booked' : 'available',
    isAvailable: !isCurrentlyBooked && !hasAwaitingReturn
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

  // Edit Vehicle Modal state
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Confirm Return Modal state
  const [showConfirmReturnModal, setShowConfirmReturnModal] = useState(false);
  const [confirmReturnBookingId, setConfirmReturnBookingId] = useState<number | null>(null);
  const [confirmReturnVehicleName, setConfirmReturnVehicleName] = useState('');
  const [confirmReturnRenterName, setConfirmReturnRenterName] = useState('');
  const [vehicleDamaged, setVehicleDamaged] = useState(false);
  const [damageNotes, setDamageNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
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

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || localStorage.getItem('token');
    }
    return null;
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    // Refresh the page data
    window.dispatchEvent(new Event('vehicle-status-updated'));
  };

  const openConfirmReturnModal = (bookingId: number, vehicleName: string, renterName: string) => {
    setConfirmReturnBookingId(bookingId);
    setConfirmReturnVehicleName(vehicleName);
    setConfirmReturnRenterName(renterName);
    setVehicleDamaged(false);
    setDamageNotes('');
    setShowConfirmReturnModal(true);
  };

  const handleConfirmReturn = async () => {
    if (!confirmReturnBookingId) return;

    setActionLoading(true);
    try {
      const token = getToken();
      if (!token) {
        router.push('/signin');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/bookings/${confirmReturnBookingId}/confirm-return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vehicleDamaged: vehicleDamaged,
          damageNotes: damageNotes || null
        })
      });

      if (response.ok) {
        setShowConfirmReturnModal(false);
        setResultModal({
          isOpen: true,
          title: '✅ Vehicle Return Confirmed!',
          message: vehicleDamaged
            ? `Vehicle return for ${confirmReturnVehicleName} confirmed with damage reported. Security deposit will be assessed.`
            : `Vehicle return for ${confirmReturnVehicleName} confirmed! Security deposit has been released to ${confirmReturnRenterName}.`,
          type: 'success'
        });
        // Refresh the page data
        window.dispatchEvent(new Event('vehicle-status-updated'));
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const text = await response.text();
        let msg = 'Failed to confirm vehicle return';
        try { const data = JSON.parse(text); msg = data.message || data.error || msg; } catch { msg = text || msg; }
        setResultModal({
          isOpen: true,
          title: 'Failed to Confirm Return',
          message: msg,
          type: 'error'
        });
      }
    } catch {
      setResultModal({
        isOpen: true,
        title: 'Network Error',
        message: 'Please check your connection and try again.',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

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

  // Check if vehicle has any booking awaiting return confirmation
  const getAwaitingReturnBooking = (vehicleId: number): { bookingId: number | null; renterName: string } => {
    const status = vehicleStatuses.find(vs => vs.vehicleId === vehicleId);
    if (status && status.activeBookings && status.activeBookings.length > 0) {
      const awaitingReturn = status.activeBookings.find(
        b => b.status?.toUpperCase() === 'AWAITING_RETURN_CONFIRMATION'
      );
      return {
        bookingId: awaitingReturn ? awaitingReturn.bookingId : null,
        renterName: awaitingReturn ? awaitingReturn.renterName : ''
      };
    }
    return { bookingId: null, renterName: '' };
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 shadow-sm">
      {/* Edit Vehicle Modal */}
      <EditVehicleModal
        vehicle={editingVehicle}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
      />

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
          const activeTripBookingId = getActiveTripBookingId(vehicle.id);
          const { bookingId: awaitingReturnBookingId, renterName: awaitingRenterName } = getAwaitingReturnBooking(vehicle.id);
          const hasAwaitingReturn = awaitingReturnBookingId !== null;

          // Get the active booking for display
          const activeBooking = status?.activeBookings?.[0];

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
                    {hasAwaitingReturn ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-500 text-white shadow-lg animate-pulse">
                        <Clock className="w-3 h-3 mr-1" />
                        Awaiting Return
                      </span>
                    ) : bookingStatus.isBooked ? (
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

                {/* Booking Status Section - CLEAN & CONSISTENT */}
                {showStatus && !isRejected && !isPending && (
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-h-[60px] flex items-center justify-center">
                    {hasAwaitingReturn ? (
                      <div className="text-center w-full">
                        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">
                          ⏳ Awaiting Return Confirmation
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Renter: {awaitingRenterName}
                        </p>
                        <button
                          onClick={() => openConfirmReturnModal(awaitingReturnBookingId!, vehicle.brand + ' ' + vehicle.model, awaitingRenterName)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm Return
                        </button>
                      </div>
                    ) : bookingStatus.isBooked && activeBooking ? (
                      <div className="text-center w-full">
                        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                          Currently Rented by {activeBooking.renterName}
                        </p>
                        {status?.nextAvailableDate && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                            Next available: {new Date(status.nextAvailableDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : bookingStatus.isAvailable ? (
                      <div className="text-center">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          ✅ Vehicle is available for booking
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          No upcoming bookings
                        </p>
                      </div>
                    ) : null}
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
                  <div className="mb-3 p-5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
                      <Clock className="w-4 h-4 inline mr-1" />
                      This vehicle is pending admin verification
                    </p>
                  </div>
                )}

                {/* Bottom Row - Location, Track, Edit, View Details */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {vehicle.city || 'Location not set'}
                  </span>
                  <div className="flex items-center gap-2">
                    {activeTripBookingId && !isRejected && !isPending && (
                      <button
                        onClick={() => router.push(`/tracking?bookingId=${activeTripBookingId}`)}
                        className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Track
                      </button>
                    )}
                    {/* Edit Button - Only show for non-rejected, non-pending vehicles, or allow editing of rejected/pending to fix issues */}
                    <button
                      onClick={() => handleEditVehicle(vehicle)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => onViewDetails(vehicle)}
                      className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
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

      {/* Confirm Return Modal - Owner Only */}
      <AnimatePresence>
        {showConfirmReturnModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
            onClick={() => setShowConfirmReturnModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Confirm Vehicle Return
                  </h3>
                  <button
                    onClick={() => setShowConfirmReturnModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-sm text-orange-700 dark:text-orange-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    Confirm the return of <strong>{confirmReturnVehicleName}</strong> from <strong>{confirmReturnRenterName}</strong>
                  </p>
                </div>

                {/* Damage Checkbox */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vehicleDamaged}
                      onChange={(e) => setVehicleDamaged(e.target.checked)}
                      className="w-4 h-4 text-red-500 rounded border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Vehicle has damage
                    </span>
                  </label>
                </div>

                {/* Damage Notes */}
                {vehicleDamaged && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Damage Description
                    </label>
                    <textarea
                      value={damageNotes}
                      onChange={(e) => setDamageNotes(e.target.value)}
                      placeholder="Describe any damage to the vehicle..."
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm resize-none h-20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                    />
                  </div>
                )}

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <p>• Confirming return will complete the trip</p>
                  <p>• Security deposit will be {vehicleDamaged ? 'held for damage assessment' : 'released to the renter'}</p>
                  <p className="font-semibold text-orange-600 dark:text-orange-400">
                    ⚠️ This action cannot be undone
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmReturnModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReturn}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {actionLoading ? 'Processing...' : 'Confirm Return'}
                  </button>
                </div>
              </div>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4"
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
                  onClick={() => setResultModal({ ...resultModal, isOpen: false })}
                  className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition shadow-lg shadow-emerald-500/25"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}