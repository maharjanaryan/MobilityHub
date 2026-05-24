// app/admin/kyc/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  Clock,
  User,
  Mail,
  X,
  Search,
  Filter
} from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    setKycRequests(prev =>
      prev.map(req =>
        req.id === request.id
          ? { ...req, status: 'approved', reviewedAt: new Date().toISOString() }
          : req
      )
    );
    setSelectedRequest(null);
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

  const filteredRequests = kycRequests.filter(req => {
    const matchesStatus = filterStatus === 'all' ? true : req.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = kycRequests.filter(req => req.status === 'pending').length;
  const approvedCount = kycRequests.filter(req => req.status === 'approved').length;
  const rejectedCount = kycRequests.filter(req => req.status === 'rejected').length;

  if (loading) {
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
    <>
      {/* Header Stats */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">KYC Verification</h1>
        <p className="text-gray-600">Review and verify user identification documents</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Pending Verification</div>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{pendingCount}</div>
          <div className="text-xs text-gray-500 mt-2">Awaiting review</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Approved</div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{approvedCount}</div>
          <div className="text-xs text-gray-500 mt-2">Successfully verified</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Rejected</div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{rejectedCount}</div>
          <div className="text-xs text-gray-500 mt-2">Needs resubmission</div>
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
              {[
                { value: 'pending', label: 'Pending', count: pendingCount },
                { value: 'approved', label: 'Approved', count: approvedCount },
                { value: 'rejected', label: 'Rejected', count: rejectedCount },
                { value: 'all', label: 'All', count: kycRequests.length }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterStatus(filter.value as any)}
                  className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filterStatus === filter.value
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {filter.label}
                  <span className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {filter.count}
                  </span>
                </button>
              ))}
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
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Document Type</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Document Number</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-all">
                  <td className="px-4 md:px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{request.userName}</p>
                      <p className="text-xs text-gray-500">{request.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="text-sm text-gray-700">{getDocumentTypeLabel(request.documentType)}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="text-sm text-gray-700">{request.documentNumber}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    {getStatusBadge(request.status)}
                    {request.rejectionReason && request.status === 'rejected' && (
                      <p className="text-xs text-red-600 mt-1">{request.rejectionReason}</p>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
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

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 md:p-6 flex items-center justify-between">
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

            <div className="p-4 md:p-6">
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
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-100">
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
    </>
  );
}