"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck, Car, Clock, MapPin, X, ChevronDown,
  Loader2, Filter, ArrowUpDown, Calendar, Users, Wallet,
  CheckCircle, XCircle, Clock as ClockIcon, AlertCircle,
  Eye, TrendingUp, Search, Info, FileText, ShieldCheck, ZoomIn,
  Play, Flag
} from "lucide-react";
import { useRouter } from "next/navigation";
import HomeHeader from "@/app/home/HomeHeader";
import Footer from "@/app/component/Footer";

interface Booking {
  id: number;
  vehicleId: number;
  vehicleName: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleImage: string;
  vehicleBluebookDocuments: string[];
  renterId: number;
  renterName: string;
  ownerId: number;
  ownerName: string;
  pickupDate: string;
  dropoffDate: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  pickupLocation: string;
  dropoffLocation: string;
  paymentStatus: string;
  rejectionReason?: string;
  tripStartedAt?: string;
  tripEndedAt?: string;
  vehicleDamaged?: boolean;
  damageNotes?: string;
  securityDepositReturned?: boolean;
  securityDepositReturnedAmount?: number;
}

const statusConfig: Record<string, any> = {
  PENDING: { color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700", icon: ClockIcon, label: "Pending" },
  APPROVED: { color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-700", icon: CheckCircle, label: "Confirmed" },
  REJECTED: { color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-700", icon: XCircle, label: "Rejected" },
  CANCELLED: { color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600", icon: XCircle, label: "Cancelled" },
  COMPLETED: { color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-700", icon: CheckCircle, label: "Completed" },
  CONFIRMED: { color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-700", icon: CheckCircle, label: "Confirmed" },
  ACTIVE: { color: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-700", icon: ClockIcon, label: "Active" },
  AWAITING_RETURN_CONFIRMATION: {
    color: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-700",
    icon: ClockIcon,
    label: "Awaiting Return Confirmation"
  },
};

const defaultStatus = { color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600", icon: AlertCircle, label: "Unknown" };
const getStatusConfig = (status: string) => statusConfig[status?.toUpperCase()?.trim() || 'PENDING'] || defaultStatus;

// ─────────────────────────────────────────────
// SORT & FILTER OPTIONS
// ─────────────────────────────────────────────

const sortOptions = [
  { label: "Newest First", icon: Calendar },
  { label: "Oldest First", icon: Calendar },
  { label: "Price: Low to High", icon: TrendingUp },
  { label: "Price: High to Low", icon: TrendingUp }
];

const filterOptions = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Active", value: "ACTIVE" },
  { label: "Awaiting Return", value: "AWAITING_RETURN_CONFIRMATION" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" }
];

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${config.color}`}>
      <Icon className="w-3 h-3" /> {config.label}
    </span>
  );
};

const getPaymentStatusColor = (paymentStatus: string) => {
  const status = paymentStatus?.toUpperCase() || 'PENDING';
  if (status === 'COMPLETED' || status === 'PAID' || status === 'SUCCESS') return 'text-green-600 dark:text-green-400';
  if (status === 'PENDING') return 'text-yellow-600 dark:text-yellow-400';
  if (status === 'FAILED') return 'text-red-600 dark:text-red-400';
  if (status === 'REFUNDED') return 'text-purple-600 dark:text-purple-400';
  return 'text-gray-600 dark:text-gray-400';
};

const RejectionReason = ({ reason }: { reason?: string }) => {
  if (!reason) return null;
  return (
    <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
      <Info className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-medium text-red-700 dark:text-red-400">Rejection Reason:</p>
        <p className="text-sm text-red-600 dark:text-red-300">{reason}</p>
      </div>
    </div>
  );
};

const formatDate = (date: string) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch { return 'Invalid Date'; }
};

const formatDateShort = (date: string) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return 'Invalid Date'; }
};

// ─────────────────────────────────────────────
// RESULT MODAL
// ─────────────────────────────────────────────

const ResultModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
  icon: Icon,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error';
  icon?: any;
}) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20';
  const borderColor = isSuccess ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800';
  const iconColor = isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  const iconBg = isSuccess ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40';
  const titleColor = isSuccess ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300';
  const messageColor = isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  const buttonBg = isSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600';

  const DefaultIcon = isSuccess ? CheckCircle : XCircle;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 20 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border ${borderColor} overflow-hidden`}
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-6 text-center ${bgColor}`}>
              <div className={`w-20 h-20 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-4`}>
                {Icon ? <Icon className={`w-10 h-10 ${iconColor}`} /> : <DefaultIcon className={`w-10 h-10 ${iconColor}`} />}
              </div>
              <h3 className={`text-2xl font-bold ${titleColor} mb-2`}>
                {title}
              </h3>
              <p className={`text-sm ${messageColor}`}>
                {message}
              </p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={onClose}
                className={`w-full px-6 py-3 ${buttonBg} text-white rounded-xl font-medium transition shadow-lg shadow-${isSuccess ? 'emerald' : 'red'}-500/25`}
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────
// TRIP ACTION MODAL
// ─────────────────────────────────────────────

const TripActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  subMessage,
  confirmText,
  confirmColor = "bg-green-500 hover:bg-green-600",
  loading = false,
  icon: Icon = Play,
  bookingDetails
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  subMessage?: string;
  confirmText: string;
  confirmColor?: string;
  loading?: boolean;
  icon?: any;
  bookingDetails?: {
    vehicleName: string;
    pickupDate: string;
    dropoffDate: string;
    totalAmount: number;
  };
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="mb-4">
                <div className={`p-4 rounded-lg border ${title === 'Start Trip'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                  }`}>
                  <p className={`text-sm flex items-start gap-2 ${title === 'Start Trip'
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-orange-700 dark:text-orange-400'
                    }`}>
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{message}</span>
                  </p>
                </div>
              </div>

              {bookingDetails && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Booking Summary</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Vehicle</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{bookingDetails.vehicleName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Pickup</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{formatDate(bookingDetails.pickupDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Dropoff</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{formatDate(bookingDetails.dropoffDate)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-gray-500 dark:text-gray-400">Total Amount</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Rs. {bookingDetails.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {subMessage && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{subMessage}</span>
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 ${confirmColor}`}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                  {loading ? 'Processing...' : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT - Renter's View
// ─────────────────────────────────────────────

export default function MyBookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("Newest First");
  const [showSort, setShowSort] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [cancelStatus, setCancelStatus] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [cancelMessage, setCancelMessage] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [tripAction, setTripAction] = useState<'start' | 'end' | null>(null);
  const [tripBookingId, setTripBookingId] = useState<number | null>(null);

  // Result modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalData, setResultModalData] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error';
    icon?: any;
  }>({
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

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/signin');
      return;
    }
    fetchBookings();
  }, []);

  const getRenterLocation = (booking: any): string => {
    const possibleFields = [
      booking.renterLocation,
      booking.pickupLocation,
      booking.pickup_location,
      booking.pickupAddress,
      booking.pickup_address,
      booking.location,
      booking.pickup,
      booking.startLocation,
      booking.start_location,
      booking.address,
      booking.city,
      booking.renterAddress,
      booking.renter_address,
      booking.renter?.address,
      booking.renter?.location
    ];

    for (const field of possibleFields) {
      if (field && field.trim() !== "" && field !== "null" && field !== "undefined") {
        return field.trim();
      }
    }

    if (booking.renterLatitude && booking.renterLongitude) {
      return `${booking.renterLatitude}, ${booking.renterLongitude}`;
    }

    return "Location N/A";
  };

  const getOwnerLocation = (booking: any): string => {
    const possibleFields = [
      booking.ownerLocation,
      booking.ownerAddress,
      booking.owner_address,
      booking.owner?.address,
      booking.owner?.location,
      booking.vehicleLocation,
      booking.vehicleAddress,
      booking.vehicle_address,
      booking.vehicle?.address,
      booking.vehicle?.location,
      booking.dropoffLocation,
      booking.dropoff_location,
      booking.dropoffAddress,
      booking.dropoff_address,
      booking.returnLocation,
      booking.return_location,
      booking.endLocation,
      booking.end_location
    ];

    for (const field of possibleFields) {
      if (field && field.trim() !== "" && field !== "null" && field !== "undefined") {
        return field.trim();
      }
    }

    if (booking.ownerLatitude && booking.ownerLongitude) {
      return `${booking.ownerLatitude}, ${booking.ownerLongitude}`;
    }

    return "Return at owner's location";
  };

  const mapBooking = (b: any): Booking => {
    const pickupLocation = getRenterLocation(b);
    const dropoffLocation = getOwnerLocation(b);

    return {
      id: b.id || b.bookingId || 0,
      vehicleId: b.vehicleId || 0,
      vehicleName: b.vehicleName || b.vehicle?.name || 'Unknown Vehicle',
      vehicleBrand: b.vehicleBrand || b.vehicle?.brand || '',
      vehicleModel: b.vehicleModel || b.vehicle?.model || '',
      vehicleImage: b.vehicleImage || b.vehicle?.photos?.[0] || '/car-placeholder.jpg',
      vehicleBluebookDocuments: b.vehicleBluebookDocuments || b.vehicle?.bluebookDocuments || [],
      renterId: b.renterId || b.userId || 0,
      renterName: b.renterName || b.renter?.fullName || b.renter?.username || 'N/A',
      ownerId: b.ownerId || b.vehicle?.ownerId || 0,
      ownerName: b.ownerName || b.owner?.fullName || b.owner?.username || 'N/A',
      pickupDate: b.pickupDate || b.startDate || '',
      dropoffDate: b.dropoffDate || b.endDate || '',
      totalAmount: b.totalAmount || b.amount || 0,
      status: b.bookingStatus || b.status || 'PENDING',
      createdAt: b.createdAt || b.createdDate || new Date().toISOString(),
      updatedAt: b.updatedAt || b.updatedDate || new Date().toISOString(),
      pickupLocation: pickupLocation,
      dropoffLocation: dropoffLocation,
      paymentStatus: b.paymentStatus || b.payment?.status || 'PENDING',
      rejectionReason: b.rejectionReason || null,
      tripStartedAt: b.tripStartedAt || null,
      tripEndedAt: b.tripEndedAt || null,
      vehicleDamaged: b.vehicleDamaged || false,
      damageNotes: b.damageNotes || null,
      securityDepositReturned: b.securityDepositReturned || false,
      securityDepositReturnedAmount: b.securityDepositReturnedAmount || 0
    };
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) { router.push('/signin'); return; }

      const res = await fetch('http://localhost:8080/api/bookings/my-bookings?page=0&size=100', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (res.status === 401) {
        localStorage.clear();
        router.push('/signin');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const content = data.content || data || [];
        const mapped = (Array.isArray(content) ? content : []).map((b: any) => mapBooking(b));
        mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBookings(mapped);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.vehicleName?.toLowerCase().includes(q) ||
        b.ownerName?.toLowerCase().includes(q) ||
        b.vehicleBrand?.toLowerCase().includes(q) ||
        b.vehicleModel?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter(b => {
        const status = b.status?.toUpperCase() || '';
        if (statusFilter === "CONFIRMED") return status === "APPROVED" || status === "CONFIRMED";
        return status === statusFilter;
      });
    }

    switch (sortBy) {
      case "Oldest First":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "Price: Low to High":
        result.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));
        break;
      case "Price: High to Low":
        result.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [bookings, searchQuery, statusFilter, sortBy]);

  const canCancel = (pickupDate: string) => {
    const now = new Date();
    const pickup = new Date(pickupDate);
    const hours = (pickup.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hours < 24) {
      const h = Math.max(0, Math.floor(hours));
      const m = Math.max(0, Math.floor((hours - h) * 60));
      return { allowed: false, message: `Pickup is in ${h}h ${m}m. Must cancel at least 24 hours before.` };
    }
    return { allowed: true, message: '' };
  };

  // ─────────────────────────────────────────────
  // CANCEL BOOKING
  // ─────────────────────────────────────────────

  const openCancelModal = (bookingId: number) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (booking.status?.toUpperCase() !== 'PENDING') {
      setResultModalData({
        title: 'Cannot Cancel',
        message: `Cannot cancel a booking with status: ${booking.status}`,
        type: 'error',
        icon: AlertCircle
      });
      setShowResultModal(true);
      return;
    }

    const cancelCheck = canCancel(booking.pickupDate);
    if (!cancelCheck.allowed) {
      setResultModalData({
        title: 'Cannot Cancel',
        message: cancelCheck.message,
        type: 'error',
        icon: AlertCircle
      });
      setShowResultModal(true);
      return;
    }

    setCancelBookingId(bookingId);
    setCancelStatus('confirm');
    setCancelMessage('');
    setShowCancelModal(true);
  };

  const handleCancelBooking = async () => {
    if (!cancelBookingId) return;

    setCancelStatus('processing');
    setCancelMessage('Processing your cancellation request...');

    try {
      const token = getToken();
      if (!token) { router.push('/signin'); return; }

      const response = await fetch(`http://localhost:8080/api/bookings/${cancelBookingId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setCancelStatus('success');
        setCancelMessage('✅ Booking cancelled successfully!');
        await fetchBookings();
        setShowDetailModal(false);
        setTimeout(() => {
          setShowCancelModal(false);
          setCancelBookingId(null);
        }, 1500);
      } else {
        const text = await response.text();
        let msg = 'Failed to cancel booking';
        try { const data = JSON.parse(text); msg = data.message || data.error || msg; } catch { msg = text || msg; }
        setCancelStatus('error');
        setCancelMessage(`❌ ${msg}`);
      }
    } catch {
      setCancelStatus('error');
      setCancelMessage('❌ Network error. Please try again.');
    }
  };

  // ─────────────────────────────────────────────
  // START / END TRIP (Renter only)
  // ─────────────────────────────────────────────

  const openTripModal = (bookingId: number, action: 'start' | 'end') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const status = booking.status?.toUpperCase() || '';

    if (action === 'start') {
      if (status !== 'CONFIRMED' && status !== 'APPROVED') {
        setResultModalData({
          title: 'Cannot Start Trip',
          message: `Cannot start trip. Booking status: ${booking.status}`,
          type: 'error',
          icon: AlertCircle
        });
        setShowResultModal(true);
        return;
      }
      const pickupDate = new Date(booking.pickupDate);
      if (new Date() < pickupDate) {
        setResultModalData({
          title: 'Cannot Start Trip',
          message: `Pickup is scheduled for ${formatDate(booking.pickupDate)}. You can only start on or after the pickup date.`,
          type: 'error',
          icon: AlertCircle
        });
        setShowResultModal(true);
        return;
      }
    } else {
      if (status !== 'ACTIVE') {
        setResultModalData({
          title: 'Cannot End Trip',
          message: `Cannot end trip. Booking status: ${booking.status}`,
          type: 'error',
          icon: AlertCircle
        });
        setShowResultModal(true);
        return;
      }
    }

    setTripBookingId(bookingId);
    setTripAction(action);
    setShowTripModal(true);
  };

  const handleTripAction = async () => {
    if (!tripBookingId || !tripAction) return;

    setActionLoading(tripBookingId);
    try {
      const token = getToken();
      if (!token) { router.push('/signin'); return; }

      const endpoint = tripAction === 'start' ? 'start-trip' : 'end-trip';
      const response = await fetch(`http://localhost:8080/api/bookings/${tripBookingId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setShowTripModal(false);
        setTripBookingId(null);
        setTripAction(null);

        const successMsg = tripAction === 'start'
          ? 'Trip started successfully! Drive safe!'
          : 'Trip ended successfully! The owner will now confirm the vehicle return. 🚗';

        setResultModalData({
          title: tripAction === 'start' ? 'Trip Started!' : 'Trip Ended!',
          message: successMsg,
          type: 'success',
          icon: tripAction === 'start' ? Play : Flag
        });
        setShowResultModal(true);

        await fetchBookings();
        setShowDetailModal(false);
      } else {
        const text = await response.text();
        let msg = `Failed to ${tripAction} trip`;
        try { const data = JSON.parse(text); msg = data.message || data.error || msg; } catch { msg = text || msg; }

        setShowTripModal(false);
        setTripBookingId(null);
        setTripAction(null);

        setResultModalData({
          title: tripAction === 'start' ? 'Failed to Start Trip' : 'Failed to End Trip',
          message: msg,
          type: 'error',
          icon: AlertCircle
        });
        setShowResultModal(true);
      }
    } catch {
      setShowTripModal(false);
      setTripBookingId(null);
      setTripAction(null);

      setResultModalData({
        title: 'Network Error',
        message: 'Please check your connection and try again.',
        type: 'error',
        icon: AlertCircle
      });
      setShowResultModal(true);
    } finally {
      setActionLoading(null);
    }
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <HomeHeader />

      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                My <span className="text-emerald-300">Bookings</span>
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <button
              onClick={() => router.push('/vehicles')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition border border-white/20"
            >
              <Car className="w-4 h-4 inline mr-2" /> Browse Vehicles
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 -mt-4 relative z-10 w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by vehicle, owner..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="hidden sm:inline">{sortBy}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showSort && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-20 overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                      {sortOptions.map(opt => (
                        <button
                          key={opt.label}
                          onClick={() => { setSortBy(opt.label); setShowSort(false); }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 dark:hover:bg-gray-700 transition flex items-center gap-3 group"
                        >
                          <opt.icon className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                          <span className="text-gray-700 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{opt.label}</span>
                          {sortBy === opt.label && <div className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${showFilters
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                  }`}
              >
                <Filter className="w-4 h-4" /> Filter
                {statusFilter !== "ALL" && <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                  {filterOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setStatusFilter(opt.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition ${statusFilter === opt.value
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bookings List */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
            <CalendarCheck className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">No bookings found</h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {bookings.length === 0 ? "You haven't made any bookings yet." : "Try adjusting your filters."}
            </p>
            {bookings.length === 0 && (
              <button
                onClick={() => router.push('/vehicles')}
                className="mt-4 px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition"
              >
                Browse Vehicles
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => {
              const status = booking.status?.toUpperCase() || '';
              const isPending = status === 'PENDING';
              const isRejected = status === 'REJECTED';
              const isCancelled = status === 'CANCELLED';
              const isConfirmed = status === 'CONFIRMED' || status === 'APPROVED';
              const isActive = status === 'ACTIVE';
              const isAwaitingReturn = status === 'AWAITING_RETURN_CONFIRMATION';
              const cancelCheck = isPending ? canCancel(booking.pickupDate) : null;
              const isPickupDateArrived = new Date() >= new Date(booking.pickupDate);

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.005 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-600 overflow-hidden"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Vehicle Image */}
                      <div className="md:w-40 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        <img
                          src={booking.vehicleImage}
                          alt={booking.vehicleName}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target as HTMLImageElement).src = '/car-placeholder.jpg'}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{booking.vehicleName}</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDateShort(booking.pickupDate)} → {formatDateShort(booking.dropoffDate)}
                              </span>
                              <span className="hidden sm:inline">•</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                Owner: {booking.ownerName}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <StatusBadge status={booking.status} />
                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              Rs. {booking.totalAmount?.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Booked: {formatDate(booking.createdAt)}
                          </span>
                          <span className={`font-medium flex items-center gap-1 ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            <Wallet className="w-3.5 h-3.5" /> {booking.paymentStatus || 'PENDING'}
                          </span>
                        </div>

                        {/* Awaiting Return Notice - Renter sees this but no action button */}
                        {isAwaitingReturn && (
                          <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-sm text-orange-700 dark:text-orange-400 flex items-center gap-2">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            Awaiting owner confirmation to complete the return. You will be notified once confirmed.
                          </div>
                        )}

                        {isPending && cancelCheck && !cancelCheck.allowed && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            {cancelCheck.message}
                          </div>
                        )}

                        {isRejected && <RejectionReason reason={booking.rejectionReason} />}

                        {isCancelled && (
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <XCircle className="w-4 h-4 flex-shrink-0" />
                            This booking has been cancelled
                          </div>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); }}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg text-sm font-medium transition"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </button>

                          {isPending && cancelCheck?.allowed && (
                            <button
                              onClick={() => openCancelModal(booking.id)}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-sm font-medium transition"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancel
                            </button>
                          )}

                          {isConfirmed && isPickupDateArrived && (
                            <button
                              onClick={() => openTripModal(booking.id, 'start')}
                              disabled={actionLoading === booking.id}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                            >
                              {actionLoading === booking.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                              Start Trip
                            </button>
                          )}

                          {isActive && (
                            <button
                              onClick={() => openTripModal(booking.id, 'end')}
                              disabled={actionLoading === booking.id}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                            >
                              {actionLoading === booking.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Flag className="w-3.5 h-3.5" />
                              )}
                              End Trip
                            </button>
                          )}

                          {/* NO CONFIRM RETURN BUTTON - This is for owners only */}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cancel Booking Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={() => {
              if (cancelStatus === 'confirm' || cancelStatus === 'error') {
                setShowCancelModal(false);
                setCancelBookingId(null);
              }
            }}
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
                    {cancelStatus === 'confirm' && 'Cancel Booking'}
                    {cancelStatus === 'processing' && 'Processing...'}
                    {cancelStatus === 'success' && 'Success!'}
                    {cancelStatus === 'error' && 'Error'}
                  </h3>
                  {(cancelStatus === 'confirm' || cancelStatus === 'error') && (
                    <button
                      onClick={() => { setShowCancelModal(false); setCancelBookingId(null); }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  )}
                </div>

                {cancelStatus === 'confirm' && (
                  <div>
                    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        Are you sure you want to cancel this booking?
                      </p>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                      <p>• This action cannot be undone</p>
                      <p>• You will receive a full refund</p>
                      <p>• The vehicle will be available for others to book</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setShowCancelModal(false); setCancelBookingId(null); }}
                        className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition"
                      >
                        Keep Booking
                      </button>
                      <button
                        onClick={handleCancelBooking}
                        className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Yes, Cancel
                      </button>
                    </div>
                  </div>
                )}

                {cancelStatus === 'processing' && (
                  <div className="text-center py-8">
                    <Loader2 className="w-16 h-16 text-emerald-500 dark:text-emerald-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{cancelMessage}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please wait...</p>
                  </div>
                )}

                {cancelStatus === 'success' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-green-600 dark:text-green-400 font-medium text-lg">{cancelMessage}</p>
                  </div>
                )}

                {cancelStatus === 'error' && (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-red-600 dark:text-red-400 font-medium">{cancelMessage}</p>
                    <button
                      onClick={() => { setShowCancelModal(false); setCancelBookingId(null); }}
                      className="mt-4 px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trip Action Modal */}
      <TripActionModal
        isOpen={showTripModal}
        onClose={() => { setShowTripModal(false); setTripBookingId(null); setTripAction(null); }}
        onConfirm={handleTripAction}
        title={tripAction === 'start' ? 'Start Trip' : 'End Trip'}
        message={tripAction === 'start'
          ? 'You are about to start your rental journey. Please ensure you have inspected the vehicle and received the keys from the owner.'
          : 'You are about to end your rental journey. The owner will confirm the vehicle return and release your security deposit.'
        }
        subMessage={tripAction === 'start'
          ? 'Once started, the trip timer will begin. You cannot undo this action.'
          : 'Once ended, the owner must confirm the vehicle return before the trip is completed.'
        }
        confirmText={tripAction === 'start' ? 'Start Trip' : 'End Trip'}
        confirmColor={tripAction === 'start' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}
        loading={!!actionLoading}
        icon={tripAction === 'start' ? Play : Flag}
        bookingDetails={
          tripBookingId ? bookings.find(b => b.id === tripBookingId) : undefined
        }
      />

      {/* Result Modal */}
      <ResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title={resultModalData.title}
        message={resultModalData.message}
        type={resultModalData.type}
        icon={resultModalData.icon}
      />

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Booking Details</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl mb-4">
                  <img
                    src={selectedBooking.vehicleImage}
                    alt={selectedBooking.vehicleName}
                    className="w-20 h-20 rounded-xl object-cover"
                    onError={(e) => (e.target as HTMLImageElement).src = '/car-placeholder.jpg'}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{selectedBooking.vehicleName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedBooking.vehicleBrand} {selectedBooking.vehicleModel}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-gray-500 dark:text-gray-400">Booking ID</p><p className="font-medium text-gray-800 dark:text-gray-200">#{selectedBooking.id}</p></div>
                  <div><p className="text-sm text-gray-500 dark:text-gray-400">Status</p><div className="mt-1"><StatusBadge status={selectedBooking.status} /></div></div>
                  <div><p className="text-sm text-gray-500 dark:text-gray-400">Pickup Date</p><p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedBooking.pickupDate)}</p></div>
                  <div><p className="text-sm text-gray-500 dark:text-gray-400">Dropoff Date</p><p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedBooking.dropoffDate)}</p></div>

                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pickup Location</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {selectedBooking.pickupLocation}
                    </p>
                  </div>

                  <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p><p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">Rs. {selectedBooking.totalAmount?.toLocaleString()}</p></div>
                  <div><p className="text-sm text-gray-500 dark:text-gray-400">Payment</p><p className={`font-medium ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>{selectedBooking.paymentStatus || 'PENDING'}</p></div>
                  <div className="col-span-2"><p className="text-sm text-gray-500 dark:text-gray-400">Booked On</p><p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedBooking.createdAt)}</p></div>
                </div>

                {selectedBooking.tripStartedAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Trip Started</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedBooking.tripStartedAt)}</p>
                  </div>
                )}
                {selectedBooking.tripEndedAt && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Trip Ended</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedBooking.tripEndedAt)}</p>
                  </div>
                )}

                {/* Security Deposit Info - Renter sees this */}
                {selectedBooking.status?.toUpperCase() === 'COMPLETED' && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Security Deposit</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {selectedBooking.securityDepositReturned ? (
                        <span className="text-green-600 dark:text-green-400">
                          ✅ Released (Rs. {selectedBooking.securityDepositReturnedAmount?.toLocaleString() || '0'})
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">
                          ⚠️ Held - Damage reported
                        </span>
                      )}
                    </p>
                    {selectedBooking.damageNotes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="font-medium">Damage Notes:</span> {selectedBooking.damageNotes}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle Owner</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{selectedBooking.ownerName}</p>
                </div>

                {/* Bluebook section */}
                {selectedBooking.status?.toUpperCase() !== 'COMPLETED' &&
                  selectedBooking.status?.toUpperCase() !== 'REJECTED' &&
                  selectedBooking.status?.toUpperCase() !== 'CANCELLED' &&
                  selectedBooking.vehicleBluebookDocuments &&
                  selectedBooking.vehicleBluebookDocuments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Vehicle Bluebook</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Shown for verification purposes
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedBooking.vehicleBluebookDocuments.map((doc, idx) => (
                          <div
                            key={idx}
                            className="relative h-28 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer group border border-gray-200 dark:border-gray-600"
                            onClick={() => setZoomedImage(doc)}
                          >
                            <img src={doc} alt={`Bluebook ${idx === 0 ? 'Front' : 'Back'}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded">
                              {idx === 0 ? 'Front' : 'Back'}
                            </span>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedBooking.status?.toUpperCase() === 'REJECTED' && selectedBooking.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                    <Info className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Rejection Reason</p>
                      <p className="text-sm text-red-600 dark:text-red-300">{selectedBooking.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {selectedBooking.status?.toUpperCase() === 'CANCELLED' && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Booking Cancelled</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">This booking has been cancelled and is no longer active.</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {(() => {
                    const status = selectedBooking.status?.toUpperCase() || '';
                    const isPending = status === 'PENDING';
                    const isConfirmed = status === 'CONFIRMED' || status === 'APPROVED';
                    const isActive = status === 'ACTIVE';
                    const isPickupDateArrived = new Date() >= new Date(selectedBooking.pickupDate);

                    return (
                      <>
                        {isPending && canCancel(selectedBooking.pickupDate).allowed && (
                          <button
                            onClick={() => { setShowDetailModal(false); openCancelModal(selectedBooking.id); }}
                            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" /> Cancel Booking
                          </button>
                        )}

                        {isConfirmed && isPickupDateArrived && (
                          <button
                            onClick={() => { setShowDetailModal(false); openTripModal(selectedBooking.id, 'start'); }}
                            disabled={actionLoading === selectedBooking.id}
                            className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {actionLoading === selectedBooking.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            Start Trip
                          </button>
                        )}

                        {isActive && (
                          <button
                            onClick={() => { setShowDetailModal(false); openTripModal(selectedBooking.id, 'end'); }}
                            disabled={actionLoading === selectedBooking.id}
                            className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {actionLoading === selectedBooking.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Flag className="w-4 h-4" />
                            )}
                            End Trip
                          </button>
                        )}

                        <button
                          onClick={() => setShowDetailModal(false)}
                          className={`${(isPending && canCancel(selectedBooking.pickupDate).allowed) || isConfirmed || isActive ? 'flex-1' : 'w-full'
                            } px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition`}
                        >
                          Close
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bluebook Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setZoomedImage(null)}
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomedImage}
              alt="Bluebook document"
              className="max-w-full max-h-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}