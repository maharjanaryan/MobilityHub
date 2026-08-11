"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck, Car, Clock, MapPin, X, ChevronDown,
  Loader2, Filter, ArrowUpDown, Calendar, Users, Wallet,
  CheckCircle, XCircle, Clock as ClockIcon, AlertCircle,
  Eye, TrendingUp, Search, Info
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
}

const statusConfig: Record<string, any> = {
  PENDING: { color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700", icon: ClockIcon, label: "Pending" },
  APPROVED: { color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-700", icon: CheckCircle, label: "Confirmed" },
  REJECTED: { color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-700", icon: XCircle, label: "Rejected" },
  CANCELLED: { color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600", icon: XCircle, label: "Cancelled" },
  COMPLETED: { color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-700", icon: CheckCircle, label: "Completed" },
  CONFIRMED: { color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-700", icon: CheckCircle, label: "Confirmed" }
};

const defaultStatus = { color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600", icon: AlertCircle, label: "Unknown" };
const getStatusConfig = (status: string) => statusConfig[status?.toUpperCase()?.trim() || 'PENDING'] || defaultStatus;

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
  { label: "Completed", value: "COMPLETED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" }
];

const StatusBadge = ({ status }: { status: string }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${config.color}`}>
      <Icon className="w-3 h-3" /> {config.label}
    </span>
  );
};

// Helper function to get payment status color with dark mode support
const getPaymentStatusColor = (paymentStatus: string) => {
  const status = paymentStatus?.toUpperCase() || 'PENDING';
  if (status === 'COMPLETED' || status === 'PAID' || status === 'SUCCESS') {
    return 'text-green-600 dark:text-green-400';
  } else if (status === 'PENDING') {
    return 'text-yellow-600 dark:text-yellow-400';
  } else if (status === 'FAILED') {
    return 'text-red-600 dark:text-red-400';
  } else if (status === 'REFUNDED') {
    return 'text-purple-600 dark:text-purple-400';
  }
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
  const [cancellingId, setCancellingId] = useState<number | null>(null);

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

  const mapBooking = (b: any): Booking => ({
    id: b.id || b.bookingId || 0,
    vehicleId: b.vehicleId || 0,
    vehicleName: b.vehicleName || b.vehicle?.name || 'Unknown Vehicle',
    vehicleBrand: b.vehicleBrand || b.vehicle?.brand || '',
    vehicleModel: b.vehicleModel || b.vehicle?.model || '',
    vehicleImage: b.vehicleImage || b.vehicle?.photos?.[0] || '/car-placeholder.jpg',
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
    pickupLocation: b.pickupLocation || b.location || 'N/A',
    dropoffLocation: b.dropoffLocation || b.returnLocation || 'N/A',
    paymentStatus: b.paymentStatus || b.payment?.status || 'PENDING',
    rejectionReason: b.rejectionReason || null
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) { router.push('/signin'); return; }

      const res = await fetch('http://localhost:8080/api/bookings/my-bookings?page=0&size=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
        mapped.sort((a: Booking, b: Booking) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
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

  const handleCancelBooking = async (bookingId: number) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (booking.status?.toUpperCase() !== 'PENDING') {
      alert(`Cannot cancel a booking with status: ${booking.status}`);
      return;
    }

    const cancelCheck = canCancel(booking.pickupDate);
    if (!cancelCheck.allowed) {
      alert(`❌ Cannot cancel this booking.\n\n${cancelCheck.message}`);
      return;
    }

    if (!confirm(`Cancel booking for ${booking.vehicleName}?\nPickup: ${formatDate(booking.pickupDate)}\nAmount: Rs. ${booking.totalAmount}`)) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const token = getToken();
      if (!token) { router.push('/signin'); return; }

      const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        alert('✅ Booking cancelled successfully!');
        await fetchBookings();
        setShowDetailModal(false);
      } else {
        const text = await response.text();
        let msg = 'Failed to cancel booking';
        try { const data = JSON.parse(text); msg = data.message || data.error || msg; } catch { msg = text || msg; }
        alert(`❌ ${msg}`);
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

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
            {/* Search */}
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
              {/* Sort */}
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

              {/* Filter toggle */}
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
              const isPending = booking.status?.toUpperCase() === 'PENDING';
              const isRejected = booking.status?.toUpperCase() === 'REJECTED';
              const cancelCheck = isPending ? canCancel(booking.pickupDate) : null;

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

                        {/* Payment Status with dark mode support */}
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {booking.pickupLocation}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Booked: {formatDate(booking.createdAt)}
                          </span>
                          <span className={`font-medium flex items-center gap-1 ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            <Wallet className="w-3.5 h-3.5" /> {booking.paymentStatus || 'PENDING'}
                          </span>
                        </div>

                        {/* 24hr warning with dark mode support */}
                        {isPending && cancelCheck && !cancelCheck.allowed && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            {cancelCheck.message}
                          </div>
                        )}

                        {isRejected && <RejectionReason reason={booking.rejectionReason} />}

                        {/* Actions with dark mode support */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); }}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg text-sm font-medium transition"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </button>

                          {isPending && cancelCheck?.allowed && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={cancellingId === booking.id}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-sm font-medium transition disabled:opacity-50"
                            >
                              {cancellingId === booking.id
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling...</>
                                : <><XCircle className="w-3.5 h-3.5" /> Cancel</>}
                            </button>
                          )}

                          {(booking.status?.toUpperCase() === 'APPROVED' || booking.status?.toUpperCase() === 'CONFIRMED') && (
                            <button
                              onClick={() => router.push(`/tracking?bookingId=${booking.id}`)}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg text-sm font-medium transition"
                            >
                              <MapPin className="w-3.5 h-3.5" /> Track
                            </button>
                          )}
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

      {/* Detail Modal with dark mode support */}
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

                {/* Vehicle */}
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

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Booking ID</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">#{selectedBooking.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <div className="mt-1"><StatusBadge status={selectedBooking.status} /></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pickup Date</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedBooking.pickupDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dropoff Date</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedBooking.dropoffDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">Rs. {selectedBooking.totalAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment</p>
                    <p className={`font-medium ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                      {selectedBooking.paymentStatus || 'PENDING'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pickup Location</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{selectedBooking.pickupLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Booked On</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedBooking.createdAt)}</p>
                  </div>
                </div>

                {/* Owner info */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle Owner</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{selectedBooking.ownerName}</p>
                </div>

                {/* Rejection reason with dark mode support */}
                {selectedBooking.status?.toUpperCase() === 'REJECTED' && selectedBooking.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                    <Info className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Rejection Reason</p>
                      <p className="text-sm text-red-600 dark:text-red-300">{selectedBooking.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {/* Modal actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {selectedBooking.status?.toUpperCase() === 'PENDING' && canCancel(selectedBooking.pickupDate).allowed && (
                    <button
                      onClick={() => handleCancelBooking(selectedBooking.id)}
                      disabled={cancellingId === selectedBooking.id}
                      className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {cancellingId === selectedBooking.id
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</>
                        : 'Cancel Booking'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}