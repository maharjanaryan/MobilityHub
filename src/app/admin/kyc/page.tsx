'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  User,
  X,
  Search,
  FileText,
  CreditCard,
  Car,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface KYCRequest {
  id: number;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  kycStatus: string;
  kycType: 'RENTER' | 'OWNER';
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  // Renter specific
  dateOfBirth?: string;
  gender?: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  citizenshipNumber?: string;
  citizenshipFrontImage?: string;
  citizenshipBackImage?: string;
  drivingLicenseNumber?: string;
  drivingLicenseIssueDate?: string;
  drivingLicenseExpiryDate?: string;
  drivingLicenseImage?: string;
  // Owner specific
  vehicleBluebookNumber?: string;
  vehicleBluebookImage?: string;
  ownershipProofVerified?: boolean;
  bankAccountNumber?: string;
  bankName?: string;
  bankAccountHolderName?: string;
  panNumber?: string;
  verifiedBy?: number;
}

interface KYCStatistics {
  pendingRenterKyc: number;
  verifiedRenterKyc: number;
  rejectedRenterKyc: number;
  pendingOwnerKyc: number;
  verifiedOwnerKyc: number;
  rejectedOwnerKyc: number;
  totalPending: number;
  totalVerified: number;
  totalRejected: number;
}

export default function KYCVerificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'>('all');
  const [filterType, setFilterType] = useState<'all' | 'RENTER' | 'OWNER'>('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState<KYCStatistics | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const getAccessToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }, []);

  const fetchStatistics = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8080/api/admin/kyc/statistics', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, [getAccessToken]);

  const fetchAllKYCRequests = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/kyc/all', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setKycRequests(data);
      } else {
        console.error('Failed to fetch KYC requests');
      }
    } catch (error) {
      console.error('Error fetching KYC requests:', error);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  const loadData = useCallback(async () => {
    await Promise.all([
      fetchStatistics(),
      fetchAllKYCRequests()
    ]);
  }, [fetchAllKYCRequests, fetchStatistics]);

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
        console.error('Error parsing user data:', e);
      }
    }

    queueMicrotask(() => {
      void loadData();
    });
  }, [getAccessToken, loadData, router]);

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  async function fetchKycDetails(request: KYCRequest) {
    const token = getAccessToken();
    if (!token) return null;

    setDetailsLoading(true);
    try {
      const endpoint = request.kycType === 'RENTER'
        ? `/api/admin/kyc/renter/${request.id}`
        : `/api/admin/kyc/owner/${request.id}`;

      const response = await fetch(`http://localhost:8080${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const details = await response.json();

        const mergedDetails = {
          ...request,
          ...details,
          kycType: request.kycType,
          id: request.id,
        };

        return mergedDetails;
      } else {
        console.error(`Failed to fetch ${request.kycType} KYC details for ID ${request.id}`);
        return request;
      }
    } catch (error) {
      console.error(`Error fetching ${request.kycType} KYC details:`, error);
      return request;
    } finally {
      setDetailsLoading(false);
    }
  }

  const handleReview = async (request: KYCRequest) => {
    const details = await fetchKycDetails(request);
    setSelectedRequest(details || request);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    const token = getAccessToken();

    try {
      const endpoint = selectedRequest.kycType === 'RENTER'
        ? `/api/admin/kyc/verify/renter/${selectedRequest.id}`
        : `/api/admin/kyc/verify/owner/${selectedRequest.id}`;

      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          approved: true,
          adminNotes: 'Documents verified successfully'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`${selectedRequest.kycType} KYC for ${selectedRequest.fullName} has been approved.`);
        setSelectedRequest(null);
        await loadData();
      } else {
        alert(`Failed to approve: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error approving KYC:', error);
      alert('Failed to approve KYC. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) return;

    setActionLoading(true);
    const token = getAccessToken();

    try {
      const endpoint = selectedRequest.kycType === 'RENTER'
        ? `/api/admin/kyc/verify/renter/${selectedRequest.id}`
        : `/api/admin/kyc/verify/owner/${selectedRequest.id}`;

      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          approved: false,
          rejectionReason: rejectionReason,
          adminNotes: 'Please resubmit with correct documents'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`${selectedRequest.kycType} KYC for ${selectedRequest.fullName} has been rejected.`);
        setShowRejectModal(false);
        setSelectedRequest(null);
        setRejectionReason('');
        await loadData();
      } else {
        alert(`Failed to reject: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      alert('Failed to reject KYC. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Unknown
          </span>
        );
    }
  };

  const filteredRequests = kycRequests.filter(req => {
    const matchesStatus = filterStatus === 'all' ? true : req.kycStatus === filterStatus;
    const matchesType = filterType === 'all' ? true : req.kycType === filterType;
    const matchesSearch = searchTerm === '' ||
      req.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <p className="text-gray-600 font-medium mt-4">Loading KYC requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">KYC Verification</h1>
          <p className="text-gray-600">Review and verify user identification documents</p>
        </div>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Total Pending</div>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{statistics?.totalPending || 0}</div>
          <div className="text-xs text-gray-500 mt-2">Awaiting review</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Total Verified</div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{statistics?.totalVerified || 0}</div>
          <div className="text-xs text-gray-500 mt-2">Successfully verified</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Total Rejected</div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{statistics?.totalRejected || 0}</div>
          <div className="text-xs text-gray-500 mt-2">Needs resubmission</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Total Applications</div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{kycRequests.length}</div>
          <div className="text-xs text-gray-500 mt-2">Total submissions</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Types</option>
                <option value="RENTER">Renter KYC</option>
                <option value="OWNER">Owner KYC</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="SUBMITTED">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Requests List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.map((request) => (
                <tr key={`${request.kycType}-${request.id}`} className="hover:bg-gray-50 transition-all">
                  <td className="px-4 md:px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{request.fullName}</p>
                      <p className="text-xs text-gray-500">{request.email}</p>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${request.kycType === 'RENTER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {request.kycType === 'RENTER' ? <User className="w-3 h-3 mr-1" /> : <Car className="w-3 h-3 mr-1" />}
                      {request.kycType}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="text-sm text-gray-700">{request.phoneNumber || 'N/A'}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    {getStatusBadge(request.kycStatus)}
                    {request.rejectionReason && request.kycStatus === 'REJECTED' && (
                      <p className="text-xs text-red-600 mt-1 max-w-xs truncate">{request.rejectionReason}</p>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <button
                      onClick={() => handleReview(request)}
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

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 md:p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {selectedRequest.kycType === 'RENTER' ? (
                    <User className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Car className="w-5 h-5 text-purple-600" />
                  )}
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedRequest.kycType} KYC Review
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">{selectedRequest.fullName}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : (
              <div className="p-4 md:p-6">
                {/* Personal Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="text-sm font-medium text-gray-800">{selectedRequest.fullName}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-800">{selectedRequest.email}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="text-sm font-medium text-gray-800">{selectedRequest.phoneNumber}</p>
                    </div>
                    {selectedRequest.dateOfBirth && (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500">Date of Birth</p>
                        <p className="text-sm font-medium text-gray-800">{selectedRequest.dateOfBirth}</p>
                      </div>
                    )}
                    {selectedRequest.gender && (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500">Gender</p>
                        <p className="text-sm font-medium text-gray-800">{selectedRequest.gender}</p>
                      </div>
                    )}
                    {selectedRequest.permanentAddress && (
                      <div className="p-3 bg-gray-50 rounded-xl col-span-2">
                        <p className="text-xs text-gray-500">Permanent Address</p>
                        <p className="text-sm font-medium text-gray-800">{selectedRequest.permanentAddress}</p>
                      </div>
                    )}
                    {selectedRequest.temporaryAddress && (
                      <div className="p-3 bg-gray-50 rounded-xl col-span-2">
                        <p className="text-xs text-gray-500">Temporary Address</p>
                        <p className="text-sm font-medium text-gray-800">{selectedRequest.temporaryAddress}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Citizenship Documents */}
                {(selectedRequest.citizenshipNumber || selectedRequest.citizenshipFrontImage) && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-500" />
                      Citizenship Documents
                    </h3>
                    {selectedRequest.citizenshipNumber && (
                      <div className="grid grid-cols-1 gap-4 mb-4">
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500">Citizenship Number</p>
                          <p className="text-sm font-medium text-gray-800">{selectedRequest.citizenshipNumber}</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedRequest.citizenshipFrontImage && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Front Side</p>
                          <div
                            className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setShowImageViewer(selectedRequest.citizenshipFrontImage!)}
                          >
                            <img
                              src={selectedRequest.citizenshipFrontImage}
                              alt="Citizenship Front"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      )}
                      {selectedRequest.citizenshipBackImage && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Back Side</p>
                          <div
                            className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setShowImageViewer(selectedRequest.citizenshipBackImage!)}
                          >
                            <img
                              src={selectedRequest.citizenshipBackImage}
                              alt="Citizenship Back"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Driving License Documents */}
                {(selectedRequest.drivingLicenseNumber || selectedRequest.drivingLicenseImage) && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-500" />
                      Driving License
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {selectedRequest.drivingLicenseNumber && (
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500">License Number</p>
                          <p className="text-sm font-medium text-gray-800">{selectedRequest.drivingLicenseNumber}</p>
                        </div>
                      )}
                      {selectedRequest.drivingLicenseIssueDate && (
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500">Issue Date</p>
                          <p className="text-sm font-medium text-gray-800">{selectedRequest.drivingLicenseIssueDate}</p>
                        </div>
                      )}
                      {selectedRequest.drivingLicenseExpiryDate && (
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500">Expiry Date</p>
                          <p className="text-sm font-medium text-gray-800">{selectedRequest.drivingLicenseExpiryDate}</p>
                        </div>
                      )}
                    </div>
                    {selectedRequest.drivingLicenseImage && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">License Image</p>
                        <div
                          className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity max-w-md"
                          onClick={() => setShowImageViewer(selectedRequest.drivingLicenseImage!)}
                        >
                          <img
                            src={selectedRequest.drivingLicenseImage}
                            alt="Driving License"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Owner Specific Documents */}
                {selectedRequest.kycType === 'OWNER' && (
                  <>
                    {(selectedRequest.vehicleBluebookNumber || selectedRequest.vehicleBluebookImage) && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Car className="w-5 h-5 text-gray-500" />
                          Vehicle Documents
                        </h3>
                        {selectedRequest.vehicleBluebookNumber && (
                          <div className="grid grid-cols-1 gap-4 mb-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500">Bluebook Number</p>
                              <p className="text-sm font-medium text-gray-800">{selectedRequest.vehicleBluebookNumber}</p>
                            </div>
                          </div>
                        )}
                        {selectedRequest.vehicleBluebookImage && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Bluebook Image</p>
                            <div
                              className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity max-w-md"
                              onClick={() => setShowImageViewer(selectedRequest.vehicleBluebookImage!)}
                            >
                              <img
                                src={selectedRequest.vehicleBluebookImage}
                                alt="Bluebook"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                        )}
                        {selectedRequest.ownershipProofVerified !== undefined && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-500">Ownership Proof Verified</p>
                            <p className="text-sm font-medium text-gray-800">{selectedRequest.ownershipProofVerified ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bank Details */}
                    {(selectedRequest.bankAccountNumber || selectedRequest.bankName) && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-gray-500" />
                          Bank Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedRequest.bankName && (
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500">Bank Name</p>
                              <p className="text-sm font-medium text-gray-800">{selectedRequest.bankName}</p>
                            </div>
                          )}
                          {selectedRequest.bankAccountNumber && (
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500">Account Number</p>
                              <p className="text-sm font-medium text-gray-800">{selectedRequest.bankAccountNumber}</p>
                            </div>
                          )}
                          {selectedRequest.bankAccountHolderName && (
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500">Account Holder Name</p>
                              <p className="text-sm font-medium text-gray-800">{selectedRequest.bankAccountHolderName}</p>
                            </div>
                          )}
                          {selectedRequest.panNumber && (
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500">PAN Number</p>
                              <p className="text-sm font-medium text-gray-800">{selectedRequest.panNumber}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Action Buttons */}
                {selectedRequest.kycStatus === 'SUBMITTED' && (
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-100">
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      <span>Approve KYC</span>
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject KYC</span>
                    </button>
                  </div>
                )}

                {selectedRequest.kycStatus !== 'SUBMITTED' && selectedRequest.kycStatus !== 'PENDING' && (
                  <div className="pt-6 border-t border-gray-100">
                    <div className={`rounded-xl p-4 ${selectedRequest.kycStatus === 'VERIFIED' ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className={`text-sm ${selectedRequest.kycStatus === 'VERIFIED' ? 'text-green-800' : 'text-red-800'}`}>
                        This request has been {selectedRequest.kycStatus?.toLowerCase()} on{' '}
                        {selectedRequest.verifiedAt && new Date(selectedRequest.verifiedAt).toLocaleString()}
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
            )}
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
                  disabled={!rejectionReason.trim() || actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
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
          <div className="relative w-full max-w-4xl max-h-[90vh]">
            <img
              src={showImageViewer}
              alt="Document"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
