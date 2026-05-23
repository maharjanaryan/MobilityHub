// app/admin/kyc/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Settings,
  LogOut,
  Home,
  Bell,
  Search,
  ChevronDown,
  FileText,
  Shield,
  Calendar,
  Download,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Award,
  Layers,
  LifeBuoy,
  RefreshCw,
  Car,
  UserCheck,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  Clock,
  Filter,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Upload,
  Check,
  X
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
}

interface KYCRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  documentType: 'aadhar' | 'pan' | 'driving_license' | 'passport';
  documentNumber: string;
  documentFront: string;
  documentBack: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export default function KYCVerificationPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/signin');
      return;
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'ADMIN') {
        router.push('/home');
        return;
      }
      setUser(parsedUser);
    }

    // Simulate fetching KYC requests
    fetchKYCRequests();
  }, [router]);

  const fetchKYCRequests = () => {
    // Mock data - replace with actual API call
    const mockRequests: KYCRequest[] = [
      {
        id: '1',
        userId: 'user_001',
        userName: 'John Doe',
        userEmail: 'john.doe@example.com',
        documentType: 'aadhar',
        documentNumber: 'XXXX-XXXX-XXXX',
        documentFront: '/api/placeholder/400/300',
        documentBack: '/api/placeholder/400/300',
        status: 'pending',
        submittedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        userId: 'user_002',
        userName: 'Sarah Chen',
        userEmail: 'sarah.chen@example.com',
        documentType: 'pan',
        documentNumber: 'XXXXX1234X',
        documentFront: '/api/placeholder/400/300',
        documentBack: '/api/placeholder/400/300',
        status: 'pending',
        submittedAt: '2024-01-15T11:45:00Z'
      },
      {
        id: '3',
        userId: 'user_003',
        userName: 'Mike Ross',
        userEmail: 'mike.ross@example.com',
        documentType: 'driving_license',
        documentNumber: 'DL-XXXX-2024',
        documentFront: '/api/placeholder/400/300',
        documentBack: '/api/placeholder/400/300',
        status: 'pending',
        submittedAt: '2024-01-14T09:15:00Z'
      },
      {
        id: '4',
        userId: 'user_004',
        userName: 'Emily Watson',
        userEmail: 'emily.watson@example.com',
        documentType: 'passport',
        documentNumber: 'PXXXXXX789',
        documentFront: '/api/placeholder/400/300',
        documentBack: '/api/placeholder/400/300',
        status: 'approved',
        submittedAt: '2024-01-10T14:20:00Z',
        reviewedAt: '2024-01-11T10:00:00Z'
      },
      {
        id: '5',
        userId: 'user_005',
        userName: 'David Kim',
        userEmail: 'david.kim@example.com',
        documentType: 'aadhar',
        documentNumber: 'XXXX-XXXX-XXXX',
        documentFront: '/api/placeholder/400/300',
        documentBack: '/api/placeholder/400/300',
        status: 'rejected',
        submittedAt: '2024-01-12T16:30:00Z',
        reviewedAt: '2024-01-13T11:00:00Z',
        rejectionReason: 'Document image is blurry. Please upload clear images.'
      }
    ];
    setKycRequests(mockRequests);
    setLoading(false);
  };

  const getDocumentTypeLabel = (type: string) => {
    const types = {
      aadhar: 'Aadhar Card',
      pan: 'PAN Card',
      driving_license: 'Driving License',
      passport: 'Passport'
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  const handleApprove = (request: KYCRequest) => {
    // Update status in state
    setKycRequests(prev =>
      prev.map(req =>
        req.id === request.id
          ? { ...req, status: 'approved', reviewedAt: new Date().toISOString() }
          : req
      )
    );
    // Close modal if open
    setSelectedRequest(null);
    // Show success message (you can add a toast notification here)
    alert(`KYC request for ${request.userName} has been approved.`);
  };

  const handleReject = () => {
    if (selectedRequest && rejectionReason) {
      setKycRequests(prev =>
        prev.map(req =>
          req.id === selectedRequest.id
            ? {
              ...req,
              status: 'rejected',
              reviewedAt: new Date().toISOString(),
              rejectionReason
            }
            : req
        )
      );
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      alert(`KYC request for ${selectedRequest.userName} has been rejected.`);
    }
  };

  const filteredRequests = kycRequests.filter(req =>
    filterStatus === 'all' ? true : req.status === filterStatus
  );

  const pendingCount = kycRequests.filter(req => req.status === 'pending').length;
  const approvedCount = kycRequests.filter(req => req.status === 'approved').length;
  const rejectedCount = kycRequests.filter(req => req.status === 'rejected').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-8 h-8 text-emerald-500 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium mt-4">Loading KYC requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Fixed Sidebar */}
      <aside className="fixed top-0 left-0 z-30 w-72 h-full bg-white shadow-2xl overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="rounded-xl object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-xl text-gray-800">MobilityHub</span>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
            >
              <Home className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
            >
              <Users className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>User Management</span>
            </Link>

            <Link
              href="/admin/owners"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
            >
              <UserCheck className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>Vehicle Owners</span>
            </Link>

            <Link
              href="/admin/kyc"
              className="flex items-center space-x-3 px-4 py-3 text-emerald-700 bg-emerald-50 rounded-xl transition-all duration-200 group"
            >
              <Shield className="w-5 h-5" />
              <span className="font-medium">KYC Verification</span>
              <div className="flex-1"></div>
              <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
            </Link>

            <Link
              href="/admin/vehicles"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
            >
              <Car className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>Vehicle Management</span>
            </Link>

            <Link
              href="/admin/bookings"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
            >
              <Calendar className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>Booking Management</span>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
            >
              <TrendingUp className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>Analytics</span>
            </Link>

            <Link
              href="/admin/reports"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
            >
              <FileText className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>Reports</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
            >
              <Settings className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>Settings</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('isAuthenticated');
                router.push('/signin');
              }}
              className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 w-full group"
            >
              <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-72">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex-1 max-w-lg">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search KYC requests..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative text-gray-600 hover:text-emerald-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              </button>

              <button className="text-gray-600 hover:text-emerald-600 transition-colors">
                <RefreshCw className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="relative group cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                    <span className="text-white font-semibold">
                      {user?.fullName?.charAt(0) || 'A'}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">{user?.fullName || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">System Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Header Stats */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">KYC Verification</h1>
            <p className="text-gray-600">Review and verify user identification documents</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-500 text-sm">Pending Verification</div>
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800">{pendingCount}</div>
              <div className="text-xs text-gray-500 mt-2">Awaiting review</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-500 text-sm">Approved</div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800">{approvedCount}</div>
              <div className="text-xs text-gray-500 mt-2">Successfully verified</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-500 text-sm">Rejected</div>
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800">{rejectedCount}</div>
              <div className="text-xs text-gray-500 mt-2">Needs resubmission</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="border-b border-gray-100">
              <div className="flex space-x-2 p-4">
                {[
                  { value: 'pending', label: 'Pending', count: pendingCount },
                  { value: 'approved', label: 'Approved', count: approvedCount },
                  { value: 'rejected', label: 'Rejected', count: rejectedCount },
                  { value: 'all', label: 'All', count: kycRequests.length }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterStatus(filter.value as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === filter.value
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {filter.label}
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KYC Requests List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Document Type</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Document Number</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{request.userName}</p>
                          <p className="text-xs text-gray-500">{request.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{getDocumentTypeLabel(request.documentType)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{request.documentNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                        {request.rejectionReason && request.status === 'rejected' && (
                          <p className="text-xs text-red-600 mt-1">{request.rejectionReason}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No KYC requests found</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Review KYC Documents</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedRequest.userName}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* User Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="text-sm font-medium text-gray-800">{selectedRequest.userName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="text-sm font-medium text-gray-800">{selectedRequest.userEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">Document Type</p>
                    <p className="text-sm font-medium text-gray-800">{getDocumentTypeLabel(selectedRequest.documentType)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">Document Number</p>
                    <p className="text-sm font-medium text-gray-800">{selectedRequest.documentNumber}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">Submitted On</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(selectedRequest.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Document Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Front Side</p>
                    <div
                      className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setShowImageViewer(selectedRequest.documentFront)}
                    >
                      <Image
                        src={selectedRequest.documentFront}
                        alt="Document Front"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Back Side</p>
                    <div
                      className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setShowImageViewer(selectedRequest.documentBack)}
                    >
                      <Image
                        src={selectedRequest.documentBack}
                        alt="Document Back"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'pending' && (
                <div className="flex space-x-4 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Approve KYC</span>
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Reject KYC</span>
                  </button>
                </div>
              )}

              {selectedRequest.status !== 'pending' && (
                <div className="pt-6 border-t border-gray-100">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600">
                      This request has been {selectedRequest.status} on{' '}
                      {selectedRequest.reviewedAt && new Date(selectedRequest.reviewedAt).toLocaleString()}
                    </p>
                    {selectedRequest.rejectionReason && (
                      <p className="text-sm text-red-600 mt-2">
                        Reason: {selectedRequest.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Reject KYC Request</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this KYC request. This will be shared with the user.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter rejection reason..."
              />
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageViewer(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full max-w-4xl aspect-video">
            <Image
              src={showImageViewer}
              alt="Document"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}