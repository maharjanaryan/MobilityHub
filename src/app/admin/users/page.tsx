// app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Eye,
  Search,
  Activity,
  Users as UsersIcon,
  Loader2,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Car,
  User,
  UserX,
  UserCheck,
  Bell
} from 'lucide-react';

interface UserData {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  active: boolean;
  emailVerified: boolean;
  provider: string | null;
  oauthUser: boolean;
  createdAt: string;
  lastLogin: string | null;
  renterKycStatus: string;
  ownerKycStatus: string;
}

interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  ownerUsers: number;
  regularUsers: number;
  oAuthUsers: number;
  verifiedUsers: number;
}

// Toast Notification Component
const ToastNotification = ({
  message,
  type,
  onClose
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-md px-4"
      >
        <div className={`
          relative rounded-2xl shadow-2xl p-5 border 
          ${isSuccess
            ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
          }
        `}>
          <div className="flex items-start gap-4">
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
              ${isSuccess
                ? 'bg-emerald-100 dark:bg-emerald-900/50'
                : 'bg-red-100 dark:bg-red-900/50'
              }
            `}>
              {isSuccess ? (
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`
                text-sm font-semibold
                ${isSuccess
                  ? 'text-emerald-800 dark:text-emerald-200'
                  : 'text-red-800 dark:text-red-200'
                }
              `}>
                {isSuccess ? 'Success!' : 'Error!'}
              </p>
              <p className={`
                text-sm mt-0.5
                ${isSuccess
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-red-700 dark:text-red-300'
                }
              `}>
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`
                flex-shrink-0 p-1 rounded-lg transition-colors
                ${isSuccess
                  ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-800/50'
                  : 'text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-800/50'
                }
              `}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-2xl overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3, ease: 'linear' }}
              className={`
                h-full rounded-b-2xl
                ${isSuccess ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-red-500 dark:bg-red-400'}
              `}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function UserManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  // Deactivate/Activate Modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUser, setStatusUser] = useState<UserData | null>(null);
  const [statusAction, setStatusAction] = useState<'deactivate' | 'activate'>('deactivate');

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'ADMIN') {
        router.push('/home');
        return;
      }
    }

    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchStatistics(),
      fetchUsers()
    ]);
  };

  const fetchStatistics = async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8080/api/admin/users/statistics', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchUsers = async () => {
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    try {
      let url = `http://localhost:8080/api/admin/users?page=${currentPage}&size=${pageSize}&sortBy=createdAt&sortDir=desc`;

      if (filterRole !== 'all') {
        url += `&role=${filterRole}`;
      }
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.content || []);
        setTotalElements(data.totalElements || 0);
        setTotalPages(data.totalPages || 0);
      } else if (response.status === 401) {
        router.push('/signin');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchStatistics();
    await fetchUsers();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchUsers();
  };

  const handleSearch = () => {
    setCurrentPage(0);
    fetchUsers();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setCurrentPage(0);
    fetchUsers();
  };

  const handleViewUser = async (user: UserData) => {
    const token = getAccessToken();
    try {
      const response = await fetch(`http://localhost:8080/api/admin/users/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data);
        setShowUserModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Open Deactivate/Activate Modal
  const openStatusModal = (user: UserData) => {
    setStatusUser(user);
    setStatusAction(user.active ? 'deactivate' : 'activate');
    setShowStatusModal(true);
  };

  // Handle Deactivate/Activate
  const handleStatusChange = async () => {
    if (!statusUser) return;

    setActionLoading(true);
    const token = getAccessToken();

    try {
      let response;

      if (statusAction === 'deactivate') {
        response = await fetch(`http://localhost:8080/api/admin/users/${statusUser.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } else {
        response = await fetch(`http://localhost:8080/api/admin/users/${statusUser.id}/activate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      if (response.ok) {
        const data = await response.json();
        const actionText = statusAction === 'deactivate' ? 'deactivated' : 'activated';

        // Show toast notification instead of alert
        setToast({
          isOpen: true,
          message: data.message || `User ${actionText} successfully`,
          type: 'success'
        });

        setShowStatusModal(false);
        setStatusUser(null);
        fetchUsers();
        fetchStatistics();
      } else {
        const error = await response.json();
        setToast({
          isOpen: true,
          message: error.message || `Failed to ${statusAction} user`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error(`Error ${statusAction}ing user:`, error);
      setToast({
        isOpen: true,
        message: `Failed to ${statusAction} user. Please try again.`,
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">Admin</span>;
      case 'OWNER':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">Owner</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">User</span>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Active</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">Deactivated</span>;
  };

  const getRenterKYCStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Verified</span>;
      case 'SUBMITTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Pending</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">Not Submitted</span>;
    }
  };

  const getOwnerKYCStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Verified</span>;
      case 'SUBMITTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Pending</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">Not Submitted</span>;
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-4 md:p-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.isOpen && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, isOpen: false })}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage platform users, roles, and account status</p>
        </div>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 dark:bg-emerald-600 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Total Users</div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{statistics?.totalUsers || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Registered accounts</div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Active Users</div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{statistics?.activeUsers || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Currently active</div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Email Verified</div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{statistics?.verifiedUsers || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Email verified users</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(0);
                fetchUsers();
              }}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Roles</option>
              <option value="USER">Users</option>
              <option value="OWNER">Owners</option>
              <option value="ADMIN">Admins</option>
            </select>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Renter KYC</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner KYC</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="text-right px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <UsersIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${!user.active ? 'opacity-60' : ''}`}>
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{user.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.phoneNumber || 'No phone'}</p>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-4 md:px-6 py-4">{getStatusBadge(user.active)}</td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                        {getRenterKYCStatusBadge(user.renterKycStatus)}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Car className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                        {getOwnerKYCStatusBadge(user.ownerKycStatus)}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openStatusModal(user)}
                          className={`p-1.5 transition-colors ${user.active
                              ? 'text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400'
                              : 'text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400'
                            }`}
                          title={user.active ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {users.length} of {totalElements} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1 border dark:border-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-gray-700 dark:text-gray-300">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage + 1 >= totalPages}
                className="px-3 py-1 border dark:border-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 md:p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">User Details</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{selectedUser.fullName}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Username</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">@{selectedUser.username}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{selectedUser.email}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{selectedUser.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                      <p className="font-medium">{getRoleBadge(selectedUser.role)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                      <p className="font-medium">{getStatusBadge(selectedUser.active)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email Verified</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{selectedUser.emailVerified ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Login Type</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{selectedUser.oauthUser ? 'Google' : 'Email/Password'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Joined Date</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</p>
                    </div>
                  </div>
                </div>

                {/* KYC Status Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">KYC Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Renter KYC</p>
                      </div>
                      <div className="mt-2">
                        {getRenterKYCStatusBadge(selectedUser.renterKycStatus)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {selectedUser.renterKycStatus === 'VERIFIED'
                          ? 'User can book vehicles'
                          : selectedUser.renterKycStatus === 'SUBMITTED'
                            ? 'Documents under review'
                            : 'User cannot book vehicles'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Owner KYC</p>
                      </div>
                      <div className="mt-2">
                        {getOwnerKYCStatusBadge(selectedUser.ownerKycStatus)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {selectedUser.ownerKycStatus === 'VERIFIED'
                          ? 'User can list vehicles'
                          : selectedUser.ownerKycStatus === 'SUBMITTED'
                            ? 'Documents under review'
                            : 'User cannot list vehicles'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 border border-gray-300 dark:border-gray-700 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate/Activate Modal */}
      {showStatusModal && statusUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {statusAction === 'deactivate' ? 'Deactivate Account' : 'Activate Account'}
                </h2>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <div className={`p-4 rounded-lg border ${statusAction === 'deactivate'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  }`}>
                  <p className={`text-sm flex items-start gap-2 ${statusAction === 'deactivate'
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-green-700 dark:text-green-400'
                    }`}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      {statusAction === 'deactivate'
                        ? `You are about to deactivate ${statusUser.fullName}'s account (@${statusUser.username}).`
                        : `You are about to activate ${statusUser.fullName}'s account (@${statusUser.username}).`
                      }
                    </span>
                  </p>
                </div>
              </div>

              {/* Status Messages */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {statusAction === 'deactivate' ? (
                  <div>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                      ⚠️ Account will be deactivated
                    </p>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        User will be logged out immediately
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        User cannot log in or access the platform
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        All active sessions will be terminated
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        User's vehicles will be hidden from search
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        Existing bookings will be reviewed
                      </li>
                    </ul>
                    <p className="mt-3 text-xs font-medium text-green-600 dark:text-green-400">
                      ✅ This action can be reversed by activating the account
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                      ✅ Account will be activated
                    </p>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        User will regain access to the platform
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        User can log in and use all features
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        All permissions will be restored
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        Vehicles will be visible again
                      </li>
                    </ul>
                    <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">
                      ⚠️ This action can be reversed by deactivating the account
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={actionLoading}
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 ${statusAction === 'deactivate'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                    }`}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : statusAction === 'deactivate' ? (
                    <UserX className="w-4 h-4" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                  {actionLoading ? 'Processing...' : statusAction === 'deactivate' ? 'Deactivate Account' : 'Activate Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}