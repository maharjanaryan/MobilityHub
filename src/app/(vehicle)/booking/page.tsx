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
  FileSignature,
  Info,
  FileText
} from "lucide-react";
import HomeHeader from "../../home/HomeHeader";
import Footer from "../../component/Footer";
import ContractSignatureModal from "../../component/ContractSignatureModal";

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
  contractSigned?: boolean;
}

interface KYCStatusResponse {
  success: boolean;
  userId: number;
  userFullName: string;
  userEmail: string;
  renterKycStatus: string;
  ownerKycStatus: string;
  canBook: boolean;
  canList: boolean;
  hasOwnerPrivileges: boolean;
}

// Contract interface
interface Contract {
  id: number;
  contractReference: string;
  bookingId: number;
  vehicleName: string;
  ownerName: string;
  renterName: string;
  ownerSigned: boolean;
  ownerSignedAt: string | null;
  renterSigned: boolean;
  renterSignedAt: string | null;
  contractStatus: string;
  contractText: string;
  ownerSignatureData: string | null;
  renterSignatureData: string | null;
  createdAt: string;
  updatedAt: string;
}

// Helper functions
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
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

const formatDateTime = (dateString: string) => {
  if (!dateString) return "Not set";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusBadge = (status: string) => {
  const upperStatus = status?.toUpperCase() || '';
  switch (upperStatus) {
    case 'PENDING':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</span>;
    case 'CONFIRMED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</span>;
    case 'REJECTED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"><XCircle className="w-3 h-3 mr-1" />Rejected</span>;
    case 'CANCELLED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"><XCircle className="w-3 h-3 mr-1" />Cancelled</span>;
    case 'COMPLETED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"><CheckCircle className="w-3 h-3 mr-1" />Completed</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">{status || 'Unknown'}</span>;
  }
};

// Toast Notification Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500 dark:bg-green-600',
    error: 'bg-red-500 dark:bg-red-600',
    info: 'bg-blue-500 dark:bg-blue-600'
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

// Result Modal Component
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border ${borderColor} overflow-hidden`} onClick={e => e.stopPropagation()}>
        <div className={`p-6 text-center ${bgColor}`}>
          <div className={`w-20 h-20 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-4`}>
            {Icon ? <Icon className={`w-10 h-10 ${iconColor}`} /> : <DefaultIcon className={`w-10 h-10 ${iconColor}`} />}
          </div>
          <h3 className={`text-2xl font-bold ${titleColor} mb-2`}>{title}</h3>
          <p className={`text-sm ${messageColor}`}>{message}</p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
          <button onClick={onClose} className={`w-full px-6 py-3 ${buttonBg} text-white rounded-xl font-medium transition shadow-lg`}>
            Got it
          </button>
        </div>
      </div>
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {action === 'approve' ? 'Approve Booking' : 'Reject Booking'}
          </h2>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Booking:</strong> {booking.bookingReference}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Vehicle:</strong> {booking.vehicleName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Dates:</strong> {formatDate(booking.pickupDate)} - {formatDate(booking.dropoffDate)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Total Amount:</strong> {formatCurrency(booking.totalAmount)}
          </p>
        </div>

        {action === 'reject' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Please provide a reason for rejection..."
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Owner Notes (Optional)
          </label>
          <textarea
            value={ownerNotes}
            onChange={(e) => setOwnerNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Add any notes for the renter..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(rejectionReason, ownerNotes)}
            disabled={loading || (action === 'reject' && !rejectionReason.trim())}
            className={[
              "flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2",
              action === 'approve' ? "bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600" : "bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600"
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
  onReject,
  onSignContract
}: {
  booking: Booking;
  onApprove: (booking: Booking) => void;
  onReject: (booking: Booking) => void;
  onSignContract: (booking: Booking) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPending = booking.bookingStatus?.toUpperCase() === 'PENDING';
  const isConfirmed = booking.bookingStatus?.toUpperCase() === 'CONFIRMED';
  const isContractSigned = booking.contractSigned || false;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
              {booking.vehicleImage ? (
                <img src={booking.vehicleImage} alt={booking.vehicleName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">{booking.vehicleName}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Booking #{booking.bookingReference}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConfirmed && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${isContractSigned ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'}`}>
                <FileSignature className="w-3 h-3 mr-1" />
                {isContractSigned ? 'Signed' : 'Pending'}
              </span>
            )}
            {getStatusBadge(booking.bookingStatus)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
            {formatDate(booking.pickupDate)} - {formatDate(booking.dropoffDate)}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
            {booking.totalDays} days
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
            {booking.renterName}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <DollarSign className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
            {formatCurrency(booking.totalAmount)}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Renter Email</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">{booking.renterEmail || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Renter Phone</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">{booking.renterPhone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Insurance Type</p>
                <p className="font-medium text-gray-700 dark:text-gray-300 capitalize">{booking.insuranceType || 'None'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Insurance Cost</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(booking.insuranceCost)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Security Deposit</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(booking.securityDeposit)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Daily Rate</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(booking.dailyRate)}</p>
              </div>
              {isConfirmed && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Contract Status</p>
                  <p className={`font-medium flex items-center gap-2 ${isContractSigned ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    <FileSignature className="w-4 h-4" />
                    {isContractSigned ? '✅ Fully Signed' : '⏳ Awaiting Signatures'}
                  </p>
                </div>
              )}
            </div>
            {booking.rejectionReason && (
              <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Rejection Reason:</p>
                <p className="text-sm text-red-700 dark:text-red-300">{booking.rejectionReason}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 min-w-[80px] px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="w-4 h-4" />
            {expanded ? 'Show Less' : 'View Details'}
          </button>

          {isPending && (
            <>
              <button
                onClick={() => onApprove(booking)}
                className="flex-1 min-w-[80px] px-3 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
              >
                <ThumbsUp className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => onReject(booking)}
                className="flex-1 min-w-[80px] px-3 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </button>
            </>
          )}

          {isConfirmed && !isContractSigned && (
            <button
              onClick={() => onSignContract(booking)}
              className="flex-1 min-w-[80px] px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
            >
              <FileSignature className="w-4 h-4" />
              Sign Contract
            </button>
          )}

          {isConfirmed && isContractSigned && (
            <button
              disabled
              className="flex-1 min-w-[80px] px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium cursor-default flex items-center justify-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Contract Signed
            </button>
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
  const [kycStatus, setKycStatus] = useState<KYCStatusResponse | null>(null);
  const [checkingKyc, setCheckingKyc] = useState(true);

  // ─── CONTRACT STATES ───
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractData, setContractData] = useState<Contract | null>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractUserRole, setContractUserRole] = useState<'owner' | 'renter'>('owner');
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

  // Check owner KYC status
  const checkOwnerKycStatus = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/signin');
      return false;
    }

    try {
      const response = await fetch('http://localhost:8080/api/kyc/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        router.push('/signin');
        return false;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch KYC status');
      }

      const data: KYCStatusResponse = await response.json();
      setKycStatus(data);

      const hasAccess = data.ownerKycStatus === 'VERIFIED' || data.hasOwnerPrivileges === true;

      if (!hasAccess) {
        setIsAuthorized(false);
        setToast({
          message: 'Access denied. Please complete Owner KYC verification to manage bookings.',
          type: 'error'
        });
        setTimeout(() => router.push('/kyc/owner'), 2000);
        return false;
      }

      setIsAuthorized(true);
      return true;

    } catch (error) {
      console.error('Error checking KYC status:', error);
      setToast({
        message: 'Failed to verify KYC status. Please try again.',
        type: 'error'
      });
      return false;
    } finally {
      setCheckingKyc(false);
    }
  }, [router]);

  const fetchBookings = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/signin');
      return;
    }

    setLoading(true);
    try {
      let url = `http://localhost:8080/api/bookings/owner-bookings?page=0&size=50`;
      if (filterStatus !== 'all') {
        url = `http://localhost:8080/api/bookings/owner-bookings?status=${filterStatus.toUpperCase()}&page=0&size=50`;
      }

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
        setToast({ message: 'Access forbidden. Please complete Owner KYC verification.', type: 'error' });
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      const bookingsList = data.content || data || [];
      setBookings(bookingsList);

      const pending = bookingsList.filter((b: Booking) => b.bookingStatus?.toUpperCase() === 'PENDING').length;
      const confirmed = bookingsList.filter((b: Booking) => b.bookingStatus?.toUpperCase() === 'CONFIRMED').length;
      setStats({ pending, confirmed, total: bookingsList.length });

    } catch (error) {
      console.error('Error fetching bookings:', error);
      setToast({ message: 'Failed to load bookings', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, router]);

  useEffect(() => {
    checkOwnerKycStatus();
  }, [checkOwnerKycStatus]);

  useEffect(() => {
    if (isAuthorized && !checkingKyc) {
      fetchBookings();
    }
  }, [fetchBookings, isAuthorized, checkingKyc, filterStatus]);

  // ─── CONTRACT FUNCTIONS ───

  const fetchContract = async (bookingId: number, role: 'owner' | 'renter') => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const res = await fetch(`http://localhost:8080/api/contracts/booking/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setContractData(data);
        setContractUserRole(role);
        setShowContractModal(true);
      } else {
        setResultModalData({
          title: 'Contract Not Found',
          message: 'No contract found for this booking. Please try again.',
          type: 'error',
          icon: AlertCircle
        });
        setShowResultModal(true);
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      setResultModalData({
        title: 'Error',
        message: 'Failed to load contract. Please try again.',
        type: 'error',
        icon: AlertCircle
      });
      setShowResultModal(true);
    }
  };

  const handleSignContract = async () => {
    if (!contractData) return;

    setContractLoading(true);
    try {
      const token = getAuthToken();
      if (!token) { router.push('/signin'); return; }

      const endpoint = contractUserRole === 'owner'
        ? `${contractData.id}/sign/owner`
        : `${contractData.id}/sign/renter`;

      const res = await fetch(`http://localhost:8080/api/contracts/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signatureData: contractData.ownerSignatureData || contractData.renterSignatureData,
          userAgent: navigator.userAgent
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setContractData(updated);

        const isFullySigned = updated.contractStatus === 'FULLY_SIGNED';

        setResultModalData({
          title: isFullySigned ? '✅ Contract Fully Signed!' : '✅ Contract Signed!',
          message: isFullySigned
            ? 'Both parties have signed the contract. The renter can now start the trip! 🚗'
            : `You have signed the contract. Waiting for ${contractUserRole === 'owner' ? 'renter' : 'owner'} to sign.`,
          type: 'success',
          icon: isFullySigned ? CheckCircle : FileSignature
        });
        setShowResultModal(true);

        if (isFullySigned) {
          setTimeout(() => {
            setShowContractModal(false);
          }, 2000);
        }

        // Refresh bookings to get updated contract status
        await fetchBookings();
      } else {
        const error = await res.json();
        setResultModalData({
          title: 'Failed to Sign Contract',
          message: error.message || 'Failed to sign contract. Please try again.',
          type: 'error',
          icon: AlertCircle
        });
        setShowResultModal(true);
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      setResultModalData({
        title: 'Network Error',
        message: 'Please check your connection and try again.',
        type: 'error',
        icon: AlertCircle
      });
      setShowResultModal(true);
    } finally {
      setContractLoading(false);
    }
  };

  const openContractModal = (booking: Booking) => {
    fetchContract(booking.id, 'owner');
  };

  // ─── APPROVE / REJECT ───

  const handleApprove = async (booking: Booking, rejectionReason?: string, ownerNotes?: string) => {
    const token = getAuthToken();
    if (!token) return;

    setActionLoading(true);
    try {
      const requestBody: { ownerNotes?: string } = {};
      if (ownerNotes) requestBody.ownerNotes = ownerNotes;

      const response = await fetch(`http://localhost:8080/api/bookings/${booking.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 403) {
        setToast({ message: 'Access forbidden. Please complete Owner KYC verification.', type: 'error' });
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve booking');
      }

      setToast({ message: `Booking ${booking.bookingReference} approved successfully! Contract created.`, type: 'success' });
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

      const response = await fetch(`http://localhost:8080/api/bookings/${booking.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 403) {
        setToast({ message: 'Access forbidden. Please complete Owner KYC verification.', type: 'error' });
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

  // Loading state
  if (checkingKyc || loading) {
    return (
      <>
        <HomeHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
        </div>
        <Footer />
      </>
    );
  }

  // Unauthorized state - Show KYC required message
  if (!isAuthorized) {
    const getKycMessage = () => {
      const ownerStatus = kycStatus?.ownerKycStatus;
      if (ownerStatus === 'SUBMITTED') {
        return {
          title: 'Owner KYC Verification Pending',
          message: 'Your owner KYC verification is currently pending. Our team is reviewing your documents. You will be notified once verified.',
          buttonText: 'Check Status',
          buttonAction: '/kyc/status'
        };
      } else if (ownerStatus === 'REJECTED') {
        return {
          title: 'Owner KYC Verification Rejected',
          message: 'Your owner KYC verification was rejected. Please check the reason and resubmit your documents.',
          buttonText: 'Resubmit Owner KYC',
          buttonAction: '/kyc/owner'
        };
      } else {
        return {
          title: 'Owner KYC Verification Required',
          message: 'You must complete and verify your Owner KYC before managing bookings. This includes submitting your citizenship, driving license, and vehicle bluebook.',
          buttonText: 'Complete Owner KYC',
          buttonAction: '/kyc/owner'
        };
      }
    };

    const kycMessage = getKycMessage();

    return (
      <>
        <HomeHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">{kycMessage.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{kycMessage.message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/home')}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Go to Home
              </button>
              <button
                onClick={() => router.push(kycMessage.buttonAction)}
                className="px-6 py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                {kycMessage.buttonText}
              </button>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">

        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Booking Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and respond to booking requests</p>
                {kycStatus?.ownerKycStatus === 'VERIFIED' && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Owner KYC Verified ✓
                  </p>
                )}
              </div>
              <button
                onClick={fetchBookings}
                className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approval</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Confirmed Bookings</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.confirmed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Contracts Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {bookings.filter(b =>
                      b.bookingStatus?.toUpperCase() === 'CONFIRMED' &&
                      !b.contractSigned
                    ).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                  <FileSignature className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'all'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  All Bookings
                </button>
                <button
                  onClick={() => setFilterStatus('PENDING')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'PENDING'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus('CONFIRMED')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'CONFIRMED'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => setFilterStatus('REJECTED')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'REJECTED'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  Rejected
                </button>
                <button
                  onClick={() => setFilterStatus('COMPLETED')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'COMPLETED'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          {/* Pending Bookings Section */}
          {filterStatus === 'all' && pendingBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                Pending Requests ({pendingBookings.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onApprove={(b) => openActionModal(b, 'approve')}
                    onReject={(b) => openActionModal(b, 'reject')}
                    onSignContract={openContractModal}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All/Filtered Bookings Section */}
          <div>
            {filterStatus !== 'all' && (
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {filterStatus === 'PENDING' ? 'Pending Requests' :
                  filterStatus === 'CONFIRMED' ? 'Confirmed Bookings' :
                    filterStatus === 'REJECTED' ? 'Rejected Bookings' : 'Completed Bookings'}
              </h2>
            )}

            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl">
                <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">When you receive booking requests, they will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(filterStatus === 'all' ? filteredBookings.filter(b => b.bookingStatus?.toUpperCase() !== 'PENDING') : filteredBookings).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onApprove={(b) => openActionModal(b, 'approve')}
                    onReject={(b) => openActionModal(b, 'reject')}
                    onSignContract={openContractModal}
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

      {/* Contract Signature Modal */}
      <ContractSignatureModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        contract={contractData}
        userRole={contractUserRole}
        onSign={handleSignContract}
        loading={contractLoading}
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