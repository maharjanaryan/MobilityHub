// app/admin/bookings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Search,
  Eye,
  Clock,
  DollarSign,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock as ClockIcon,
  Download,
  RefreshCw,
  Phone,
  Mail,
  CreditCard,
  Calendar as CalendarIcon,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Booking {
  id: number;
  bookingReference: string;
  renterId: number;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  vehicleId: number;
  vehicleName: string;
  vehicleImage?: string;
  ownerId: number;
  ownerName: string;
  pickupDate: string;
  dropoffDate: string;
  totalDays: number;
  dailyRate: number;
  totalAmount: number;
  bookingStatus: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'COMPLETED';
  paymentMethod: 'CARD' | 'CASH' | 'WALLET';
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
}

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  rejected: number;
  totalRevenue: number;
}

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg ${type === 'success'
          ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
          : 'bg-red-600 dark:bg-red-500 text-white'
        }`}
    >
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
    </motion.div>
  );
};

export default function BookingManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
    totalRevenue: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [size] = useState(20);

  const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  useEffect(() => {
    const token = getAccessToken();
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/signin');
      return;
    }

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'ADMIN') {
          router.push('/home');
          return;
        }
      } catch (e) {
        router.push('/signin');
        return;
      }
    }

    fetchBookings();
  }, [page]);

  const fetchBookings = async () => {
    setLoading(true);
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/bookings/admin/bookings?page=${page}&size=${size}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        router.push('/signin');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const bookingList = data.content || data || [];
        setBookings(bookingList);
        setTotalPages(data.totalPages || 1);
        calculateStats(bookingList);
      } else {
        const error = await response.text();
        console.error('API Error:', error);
        setToast({ message: 'Failed to fetch bookings', type: 'error' });
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setToast({ message: 'Error loading bookings', type: 'error' });
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingList: Booking[]) => {
    const statsData = {
      total: bookingList.length,
      pending: bookingList.filter(b => b.bookingStatus === 'PENDING').length,
      confirmed: bookingList.filter(b => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'APPROVED').length,
      ongoing: bookingList.filter(b => b.bookingStatus === 'ACTIVE').length,
      completed: bookingList.filter(b => b.bookingStatus === 'COMPLETED').length,
      cancelled: bookingList.filter(b => b.bookingStatus === 'CANCELLED').length,
      rejected: bookingList.filter(b => b.bookingStatus === 'REJECTED').length,
      totalRevenue: bookingList
        .filter(b => b.bookingStatus === 'COMPLETED' || b.bookingStatus === 'ACTIVE')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    };
    setStats(statsData);
  };

  const handleConfirmPayment = async (bookingId: number) => {
    setActionLoading(true);
    const token = getAccessToken();
    if (!token) {
      setActionLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/bookings/admin/bookings/${bookingId}/payment/confirm`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setToast({
          message: 'Payment confirmed successfully! Booking can now be approved.',
          type: 'success'
        });
        await fetchBookings();
        setShowPaymentModal(false);
        setSelectedBooking(null);
      } else {
        const error = await response.json();
        setToast({
          message: error.message || 'Failed to confirm payment',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      setToast({ message: 'Error confirming payment', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (bookingId: number, action: 'approve' | 'reject' | 'cancel' | 'complete' | 'ongoing') => {
    setActionLoading(true);
    const token = getAccessToken();
    if (!token) {
      setActionLoading(false);
      return;
    }

    try {
      let endpoint = '';
      let method = 'POST';
      let body = null;

      switch (action) {
        case 'approve':
          endpoint = `/api/bookings/admin/bookings/${bookingId}/approve`;
          break;
        case 'reject':
          endpoint = `/api/bookings/admin/bookings/${bookingId}/reject`;
          body = JSON.stringify({ reason: 'Rejected by admin' });
          break;
        case 'cancel':
          endpoint = `/api/bookings/admin/bookings/${bookingId}/cancel`;
          body = JSON.stringify({ reason: 'Cancelled by admin' });
          break;
        case 'ongoing':
          endpoint = `/api/bookings/admin/bookings/${bookingId}/ongoing`;
          break;
        case 'complete':
          endpoint = `/api/bookings/admin/bookings/${bookingId}/complete`;
          break;
      }

      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: body
      });

      if (response.ok) {
        const actionLabel = action === 'ongoing' ? 'marked as ongoing' : `${action}d`;
        setToast({
          message: `Booking ${actionLabel} successfully!`,
          type: 'success'
        });
        await fetchBookings();
        setShowCancelModal(false);
        setShowConfirmModal(false);
        setSelectedBooking(null);
      } else {
        const error = await response.json();
        setToast({
          message: error.message || `Failed to ${action} booking`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      setToast({ message: `Error ${action}ing booking`, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { icon: any; color: string; label: string }> = {
      'PENDING': { icon: AlertCircle, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', label: 'Pending' },
      'APPROVED': { icon: CheckCircle, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', label: 'Approved' },
      'CONFIRMED': { icon: CheckCircle, color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', label: 'Confirmed' },
      'ACTIVE': { icon: ClockIcon, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', label: 'Ongoing' },
      'COMPLETED': { icon: CheckCircle, color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300', label: 'Completed' },
      'CANCELLED': { icon: XCircle, color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', label: 'Cancelled' },
      'REJECTED': { icon: XCircle, color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', label: 'Rejected' }
    };

    const config = statusMap[status] || statusMap['PENDING'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Paid</span>;
      case 'REFUNDED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">Refunded</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Pending</span>;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' ? true : booking.bookingStatus === filterStatus;
    const matchesPayment = filterPayment === 'all' ? true : booking.paymentStatus === filterPayment;
    const matchesSearch = searchTerm === '' ||
      (booking.bookingReference?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (booking.renterName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (booking.vehicleName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPayment && matchesSearch;
  });

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                Booking Management
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all vehicle bookings and reservations</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchBookings}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => {
                  setToast({ message: 'Export feature coming soon!', type: 'success' });
                }}
                className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-8 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Confirmed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.confirmed}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ongoing</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.ongoing}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Completed</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Rejected</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.rejected}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Revenue</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${stats.totalRevenue}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by booking ID, user, or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">⏳ Pending</option>
                  <option value="APPROVED">✅ Approved</option>
                  <option value="CONFIRMED">✅ Confirmed</option>
                  <option value="ACTIVE">🔄 Ongoing</option>
                  <option value="COMPLETED">✔️ Completed</option>
                  <option value="CANCELLED">❌ Cancelled</option>
                  <option value="REJECTED">🚫 Rejected</option>
                </select>

                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Payments</option>
                  <option value="PENDING">⏳ Pending</option>
                  <option value="PAID">✅ Paid</option>
                  <option value="REFUNDED">🔄 Refunded</option>
                </select>

                {(searchTerm || filterStatus !== 'all' || filterPayment !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterPayment('all');
                    }}
                    className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-b-xl flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Showing {filteredBookings.length} of {bookings.length} bookings</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Booking ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Renter</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehicle</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dates</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No bookings found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{booking.bookingReference || `#${booking.id}`}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              {getInitials(booking.renterName)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{booking.renterName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{booking.renterEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{booking.vehicleName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Owner: {booking.ownerName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                            <span>{new Date(booking.pickupDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <ClockIcon className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                            <span>{new Date(booking.dropoffDate).toLocaleDateString()}</span>
                          </div>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{booking.totalDays} days</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">${booking.totalAmount}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">${booking.dailyRate}/day</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(booking.bookingStatus)}
                      </td>
                      <td className="px-4 py-4">
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Details - Always visible */}
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Confirm Payment - Only for PENDING payment status and PENDING booking status */}
                          {(booking.paymentStatus === 'PENDING' || booking.paymentStatus === 'PAID' === false) &&
                            booking.bookingStatus === 'PENDING' && (
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowPaymentModal(true);
                                }}
                                disabled={actionLoading}
                                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                                title="Confirm Payment"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}

                          {/* Approve/Reject - Only for PENDING booking status with PAID payment */}
                          {booking.bookingStatus === 'PENDING' && booking.paymentStatus === 'PAID' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowConfirmModal(true);
                                }}
                                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowCancelModal(true);
                                }}
                                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Mark as Ongoing - Only for CONFIRMED status */}
                          {booking.bookingStatus === 'CONFIRMED' && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowConfirmModal(true);
                              }}
                              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Mark as Ongoing"
                            >
                              <ClockIcon className="w-4 h-4" />
                            </button>
                          )}

                          {/* Mark as Completed - Only for ACTIVE status */}
                          {booking.bookingStatus === 'ACTIVE' && (
                            <button
                              onClick={() => {
                                if (confirm('Mark this booking as completed?')) {
                                  handleAction(booking.id, 'complete');
                                }
                              }}
                              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title="Mark as Completed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {page + 1} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && !showCancelModal && !showConfirmModal && !showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 md:p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Booking Details</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedBooking.bookingReference || `#${selectedBooking.id}`}</p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Booking Timeline</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Pickup</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                              {new Date(selectedBooking.pickupDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <CalendarIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Dropoff</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                              {new Date(selectedBooking.dropoffDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                              {selectedBooking.totalDays} days
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Payment Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount</span>
                          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${selectedBooking.totalAmount}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Payment Status</span>
                          <span>{getPaymentStatusBadge(selectedBooking.paymentStatus)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 capitalize">
                            {selectedBooking.paymentMethod?.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Renter Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                              {getInitials(selectedBooking.renterName)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedBooking.renterName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{selectedBooking.renterEmail}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Phone className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">{selectedBooking.renterPhone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Vehicle Information</h3>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <Car className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{selectedBooking.vehicleName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Owner: {selectedBooking.ownerName}</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">${selectedBooking.dailyRate}/day</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Status</h3>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(selectedBooking.bookingStatus)}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Created: {new Date(selectedBooking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Confirmation Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center mb-2">
                  Confirm Payment
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                  Are you sure you want to confirm payment for booking <strong className="text-gray-800 dark:text-gray-200">{selectedBooking.bookingReference}</strong>?
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">${selectedBooking.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Renter:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{selectedBooking.renterName}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Vehicle:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{selectedBooking.vehicleName}</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedBooking(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmPayment(selectedBooking.id)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-yellow-600 dark:bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Confirm Payment
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm/Approve Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center mb-2">
                  {selectedBooking.bookingStatus === 'PENDING' ? 'Approve Booking' : 'Mark as Ongoing'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                  {selectedBooking.bookingStatus === 'PENDING'
                    ? `Are you sure you want to approve booking ${selectedBooking.bookingReference}?`
                    : `Mark booking ${selectedBooking.bookingReference} as ongoing?`}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setSelectedBooking(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const action = selectedBooking.bookingStatus === 'PENDING' ? 'approve' : 'ongoing';
                      handleAction(selectedBooking.id, action as any);
                    }}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {selectedBooking.bookingStatus === 'PENDING' ? 'Approve' : 'Mark as Ongoing'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel/Reject Modal */}
      <AnimatePresence>
        {showCancelModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center mb-2">
                  {selectedBooking.bookingStatus === 'PENDING' ? 'Reject Booking' : 'Cancel Booking'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                  {selectedBooking.bookingStatus === 'PENDING'
                    ? `Are you sure you want to reject booking ${selectedBooking.bookingReference}?`
                    : `Are you sure you want to cancel booking ${selectedBooking.bookingReference}?`}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setSelectedBooking(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    No, Keep It
                  </button>
                  <button
                    onClick={() => {
                      const action = selectedBooking.bookingStatus === 'PENDING' ? 'reject' : 'cancel';
                      handleAction(selectedBooking.id, action as any);
                    }}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {selectedBooking.bookingStatus === 'PENDING' ? 'Reject' : 'Cancel'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}