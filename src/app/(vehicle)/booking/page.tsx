// app/owner/bookings/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  DollarSign,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from "lucide-react";
import HomeHeader from "../../home/HomeHeader";
import Footer from "../../component/Footer";

// Types
interface Booking {
  id: number;
  bookingReference: string;
  vehicleId: number;
  vehicleName: string;
  vehicleImage: string;
  ownerId: number;
  ownerName: string;
  renterId: number;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  pickupDate: string;
  dropoffDate: string;
  totalDays: number;
  dailyRate: number;
  totalAmount: number;
  securityDeposit: number;
  insuranceType: string;
  insuranceCost: number;
  bookingStatus: string;
  paymentStatus: string;
  rejectionReason: string | null;
  createdAt: string;
  approvedAt: string | null;
}

// Helper functions
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
  }
  return null;
};

const getUserRole = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role?.toUpperCase() || user.userType?.toUpperCase() || 'USER';
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }
  return null;
};

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "Not set";
  return `Rs. ${Number(value).toLocaleString()}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "Not set";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusBadge = (status: string) => {
  const upperStatus = status?.toUpperCase() || '';
  switch (upperStatus) {
    case 'PENDING':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</span>;
    case 'CONFIRMED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</span>;
    case 'REJECTED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</span>;
    case 'CANCELLED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</span>;
    case 'COMPLETED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status || 'Unknown'}</span>;
  }
};

// Toast Notification Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white ${colors[type]}`}>
      {type === 'success' && <CheckCircle className="w-5 h-5" />}
      {type === 'error' && <AlertCircle className="w-5 h-5" />}
      {type === 'info' && <AlertCircle className="w-5 h-5" />}
      {message}
    </div>
  );
};

// Action Modal Component
function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  booking,
  loading
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string, notes?: string) => void;
  action: 'approve' | 'reject';
  booking: Booking | null;
  loading: boolean;
}) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [ownerNotes, setOwnerNotes] = useState('');

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {action === 'approve' ? 'Approve Booking' : 'Reject Booking'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Booking:</strong> {booking.bookingReference}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Vehicle:</strong> {booking.vehicleName}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Dates:</strong> {formatDate(booking.pickupDate)} - {formatDate(booking.dropoffDate)}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Total Amount:</strong> {formatCurrency(booking.totalAmount)}
          </p>
        </div>

        {action === 'reject' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Please provide a reason for rejection..."
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner Notes (Optional)
          </label>
          <textarea
            value={ownerNotes}
            onChange={(e) => setOwnerNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Add any notes for the renter..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(rejectionReason, ownerNotes)}
            disabled={loading || (action === 'reject' && !rejectionReason.trim())}
            className={[
              "flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2",
              action === 'approve' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            ].join(" ")}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {action === 'approve' ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Booking Card Component
function BookingCard({
  booking,
  onApprove,
  onReject
}: {
  booking: Booking;
  onApprove: (booking: Booking) => void;
  onReject: (booking: Booking) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPending = booking.bookingStatus?.toUpperCase() === 'PENDING';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
              {booking.vehicleImage ? (
                <img src={booking.vehicleImage} alt={booking.vehicleName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{booking.vehicleName}</h3>
              <p className="text-xs text-gray-500">Booking #{booking.bookingReference}</p>
            </div>
          </div>
          {getStatusBadge(booking.bookingStatus)}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            {formatDate(booking.pickupDate)} - {formatDate(booking.dropoffDate)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            {booking.totalDays} days
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            {booking.renterName}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
            {formatCurrency(booking.totalAmount)}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Renter Email</p>
                <p className="font-medium text-gray-700">{booking.renterEmail || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Renter Phone</p>
                <p className="font-medium text-gray-700">{booking.renterPhone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Insurance Type</p>
                <p className="font-medium text-gray-700 capitalize">{booking.insuranceType || 'None'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Insurance Cost</p>
                <p className="font-medium text-gray-700">{formatCurrency(booking.insuranceCost)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Security Deposit</p>
                <p className="font-medium text-gray-700">{formatCurrency(booking.securityDeposit)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Daily Rate</p>
                <p className="font-medium text-gray-700">{formatCurrency(booking.dailyRate)}</p>
              </div>
            </div>
            {booking.rejectionReason && (
              <div className="mt-3 p-2 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600 font-medium">Rejection Reason:</p>
                <p className="text-sm text-red-700">{booking.rejectionReason}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="w-4 h-4" />
            {expanded ? 'Show Less' : 'View Details'}
          </button>

          {isPending && (
            <>
              <button
                onClick={() => onApprove(booking)}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
              >
                <ThumbsUp className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => onReject(booking)}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function OwnerBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, total: 0 });
  const [isAuthorized, setIsAuthorized] = useState(true);

  const checkUserRole = useCallback(() => {
    const role = getUserRole();
    const isOwnerUser = role === 'OWNER' || role === 'ADMIN';

    if (!isOwnerUser) {
      setIsAuthorized(false);
      setToast({
        message: 'Access denied. Only vehicle owners can access this page.',
        type: 'error'
      });
      // Redirect after 2 seconds
      setTimeout(() => router.push('/home'), 2000);
      return false;
    }
    setIsAuthorized(true);
    return true;
  }, [router]);

  const fetchBookings = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/signin');
      return;
    }

    // Check if user has owner role
    const role = getUserRole();
    if (role !== 'OWNER' && role !== 'ADMIN') {
      setToast({ message: 'Access denied. Owner role required.', type: 'error' });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Use the correct API endpoint with pagination
      let url = `http://localhost:8080/api/bookings/owner-bookings?page=0&size=50`;
      if (filterStatus !== 'all') {
        url = `http://localhost:8080/api/bookings/owner-bookings?status=${filterStatus.toUpperCase()}&page=0&size=50`;
      }

      console.log('Fetching bookings from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        router.push('/signin');
        return;
      }

      if (response.status === 403) {
        setToast({ message: 'Access forbidden. You need owner privileges.', type: 'error' });
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      console.log('Bookings data:', data);

      // Handle paginated response
      const bookingsList = data.content || data || [];
      setBookings(bookingsList);

      // Calculate stats from all bookings (not filtered)
      if (filterStatus === 'all') {
        const pending = bookingsList.filter((b: Booking) => b.bookingStatus?.toUpperCase() === 'PENDING').length;
        const confirmed = bookingsList.filter((b: Booking) => b.bookingStatus?.toUpperCase() === 'CONFIRMED').length;
        setStats({ pending, confirmed, total: bookingsList.length });
      } else {
        // Re-fetch total stats without filter
        const allResponse = await fetch(`http://localhost:8080/api/bookings/owner-bookings?page=0&size=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (allResponse.ok) {
          const allData = await allResponse.json();
          const allBookings = allData.content || allData || [];
          const pending = allBookings.filter((b: Booking) => b.bookingStatus?.toUpperCase() === 'PENDING').length;
          const confirmed = allBookings.filter((b: Booking) => b.bookingStatus?.toUpperCase() === 'CONFIRMED').length;
          setStats({ pending, confirmed, total: allBookings.length });
        }
      }

    } catch (error) {
      console.error('Error fetching bookings:', error);
      setToast({ message: 'Failed to load bookings', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, router]);

  useEffect(() => {
    checkUserRole();
  }, [checkUserRole]);

  useEffect(() => {
    if (isAuthorized) {
      fetchBookings();
    }
  }, [fetchBookings, isAuthorized, filterStatus]);

  const handleApprove = async (booking: Booking, rejectionReason?: string, ownerNotes?: string) => {
    const token = getAuthToken();
    if (!token) return;

    setActionLoading(true);
    try {
      const requestBody: { ownerNotes?: string } = {};
      if (ownerNotes) requestBody.ownerNotes = ownerNotes;

      console.log('Approving booking:', booking.id, requestBody);

      const response = await fetch(`http://localhost:8080/api/bookings/${booking.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 403) {
        setToast({ message: 'Access forbidden. You need owner privileges.', type: 'error' });
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve booking');
      }

      setToast({ message: `Booking ${booking.bookingReference} approved successfully!`, type: 'success' });
      await fetchBookings();
    } catch (error) {
      console.error('Error approving booking:', error);
      setToast({ message: error instanceof Error ? error.message : 'Failed to approve booking', type: 'error' });
    } finally {
      setActionLoading(false);
      setSelectedBooking(null);
      setActionType(null);
    }
  };

  const handleReject = async (booking: Booking, rejectionReason?: string, ownerNotes?: string) => {
    const token = getAuthToken();
    if (!token) return;

    if (!rejectionReason) {
      setToast({ message: 'Please provide a rejection reason', type: 'error' });
      return;
    }

    setActionLoading(true);
    try {
      const requestBody: { rejectionReason: string; ownerNotes?: string } = { rejectionReason };
      if (ownerNotes) requestBody.ownerNotes = ownerNotes;

      console.log('Rejecting booking:', booking.id, requestBody);

      const response = await fetch(`http://localhost:8080/api/bookings/${booking.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 403) {
        setToast({ message: 'Access forbidden. You need owner privileges.', type: 'error' });
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject booking');
      }

      setToast({ message: `Booking ${booking.bookingReference} rejected`, type: 'success' });
      await fetchBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      setToast({ message: error instanceof Error ? error.message : 'Failed to reject booking', type: 'error' });
    } finally {
      setActionLoading(false);
      setSelectedBooking(null);
      setActionType(null);
    }
  };

  const openActionModal = (booking: Booking, action: 'approve' | 'reject') => {
    setSelectedBooking(booking);
    setActionType(action);
  };

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.bookingStatus?.toUpperCase() === filterStatus.toUpperCase();
  });

  const pendingBookings = bookings.filter(b => b.bookingStatus?.toUpperCase() === 'PENDING');

  if (!isAuthorized) {
    return (
      <>
        <HomeHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
            <p className="text-gray-500 text-sm mt-2">Only vehicle owners can manage bookings.</p>
            <button
              onClick={() => router.push('/home')}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Go to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <HomeHeader />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
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
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
                <p className="text-gray-600 mt-1">Manage and respond to booking requests</p>
              </div>
              <button
                onClick={fetchBookings}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Approval</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Confirmed Bookings</p>
                  <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  All Bookings
                </button>
                <button
                  onClick={() => setFilterStatus('PENDING')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'PENDING'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus('CONFIRMED')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'CONFIRMED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => setFilterStatus('REJECTED')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'REJECTED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Rejected
                </button>
                <button
                  onClick={() => setFilterStatus('COMPLETED')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'COMPLETED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          {/* Pending Bookings Section (only show when filter is 'all' and there are pending bookings) */}
          {filterStatus === 'all' && pendingBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                Pending Requests ({pendingBookings.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onApprove={(b) => openActionModal(b, 'approve')}
                    onReject={(b) => openActionModal(b, 'reject')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All/Filtered Bookings Section */}
          <div>
            {filterStatus !== 'all' && (
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {filterStatus === 'PENDING' ? 'Pending Requests' :
                  filterStatus === 'CONFIRMED' ? 'Confirmed Bookings' :
                    filterStatus === 'REJECTED' ? 'Rejected Bookings' : 'Completed Bookings'}
              </h2>
            )}

            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No bookings found</p>
                <p className="text-sm text-gray-400 mt-1">When you receive booking requests, they will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(filterStatus === 'all' ? filteredBookings.filter(b => b.bookingStatus?.toUpperCase() !== 'PENDING') : filteredBookings).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onApprove={(b) => openActionModal(b, 'approve')}
                    onReject={(b) => openActionModal(b, 'reject')}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {selectedBooking && actionType && (
        <ActionModal
          isOpen={true}
          onClose={() => {
            setSelectedBooking(null);
            setActionType(null);
          }}
          onConfirm={(reason, notes) => {
            if (actionType === 'approve') {
              handleApprove(selectedBooking, reason, notes);
            } else {
              handleReject(selectedBooking, reason, notes);
            }
          }}
          action={actionType}
          booking={selectedBooking}
          loading={actionLoading}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Footer />
    </>
  );
}