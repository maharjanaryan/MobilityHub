// app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Eye,
  Edit,
  Trash2,
  Search,
  Activity,
  Shield,
  UserCheck,
  Users as UsersIcon,
  Loader2,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Clock,
  Car,
  User
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
  renterKycStatus: string;  // RENTER KYC status
  ownerKycStatus: string;    // OWNER KYC status
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
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phoneNumber: '',
    role: '',
    active: true,
    emailVerified: true
  });

  // Pagination
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
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setEditFormData({
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      active: user.active,
      emailVerified: user.emailVerified
    });
    setEditMode(true);
    setShowUserModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    const token = getAccessToken();

    try {
      const response = await fetch(`http://localhost:8080/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: editFormData.fullName,
          phoneNumber: editFormData.phoneNumber,
          role: editFormData.role,
          isActive: editFormData.active,
          emailVerified: editFormData.emailVerified
        }),
      });

      if (response.ok) {
        alert('User updated successfully');
        setShowUserModal(false);
        fetchUsers();
        fetchStatistics();
      } else {
        const error = await response.json();
        alert(`Failed to update: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user: UserData) => {
    const action = user.active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${user.fullName}?`)) return;

    setActionLoading(true);
    const token = getAccessToken();

    try {
      let response;
      if (user.active) {
        response = await fetch(`http://localhost:8080/api/admin/users/${user.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } else {
        response = await fetch(`http://localhost:8080/api/admin/users/${user.id}/activate`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }

      if (response.ok) {
        alert(`User ${action}d successfully`);
        fetchUsers();
        fetchStatistics();
      } else {
        const error = await response.json();
        alert(`Failed to ${action} user: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Failed to ${action} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Admin</span>;
      case 'OWNER':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Owner</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">User</span>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>;
  };

  // Get Renter KYC status badge
  const getRenterKYCStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Verified</span>;
      case 'SUBMITTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not Submitted</span>;
    }
  };

  // Get Owner KYC status badge
  const getOwnerKYCStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Verified</span>;
      case 'SUBMITTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not Submitted</span>;
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">User Management</h1>
          <p className="text-gray-600">Manage platform users, roles, and account status</p>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Total Users</div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{statistics?.totalUsers || 0}</div>
          <div className="text-xs text-gray-500 mt-2">Registered accounts</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Active Users</div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{statistics?.activeUsers || 0}</div>
          <div className="text-xs text-gray-500 mt-2">Currently active</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Email Verified</div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{statistics?.verifiedUsers || 0}</div>
          <div className="text-xs text-gray-500 mt-2">Email verified users</div>
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
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(0);
                fetchUsers();
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Roles</option>
              <option value="USER">Users</option>
              <option value="OWNER">Owners</option>
              <option value="ADMIN">Admins</option>
            </select>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Renter KYC</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Owner KYC</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-right px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-all">
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-700">{user.email}</p>
                        <p className="text-xs text-gray-500">{user.phoneNumber || 'No phone'}</p>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-4 md:px-6 py-4">{getStatusBadge(user.active)}</td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        {getRenterKYCStatusBadge(user.renterKycStatus)}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Car className="w-3 h-3 text-gray-400" />
                        {getOwnerKYCStatusBadge(user.ownerKycStatus)}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title={user.active ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.active ? <Trash2 className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
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
          <div className="flex justify-between items-center p-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Showing {users.length} of {totalElements} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage + 1 >= totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details/Edit Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 md:p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                {editMode ? 'Edit User' : 'User Details'}
              </h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editFormData.fullName}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editFormData.phoneNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="USER">User</option>
                      <option value="OWNER">Owner</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editFormData.active}
                        onChange={(e) => setEditFormData({ ...editFormData, active: e.target.checked })}
                      />
                      <span className="text-sm">Active Account</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editFormData.emailVerified}
                        onChange={(e) => setEditFormData({ ...editFormData, emailVerified: e.target.checked })}
                      />
                      <span className="text-sm">Email Verified</span>
                    </label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveEdit}
                      disabled={actionLoading}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setShowUserModal(false)}
                      className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="font-medium">{selectedUser.fullName}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Username</p>
                        <p className="font-medium">@{selectedUser.username}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium">{selectedUser.phoneNumber || 'Not provided'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Role</p>
                        <p className="font-medium">{getRoleBadge(selectedUser.role)}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-medium">{getStatusBadge(selectedUser.active)}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Email Verified</p>
                        <p className="font-medium">{selectedUser.emailVerified ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Login Type</p>
                        <p className="font-medium">{selectedUser.oauthUser ? 'Google' : 'Email/Password'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Joined Date</p>
                        <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Last Login</p>
                        <p className="font-medium">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</p>
                      </div>
                    </div>
                  </div>

                  {/* KYC Status Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">KYC Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <p className="text-sm font-medium text-gray-700">Renter KYC</p>
                        </div>
                        <div className="mt-2">
                          {getRenterKYCStatusBadge(selectedUser.renterKycStatus)}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {selectedUser.renterKycStatus === 'VERIFIED'
                            ? 'User can book vehicles'
                            : selectedUser.renterKycStatus === 'SUBMITTED'
                              ? 'Documents under review'
                              : 'User cannot book vehicles'}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="w-4 h-4 text-purple-500" />
                          <p className="text-sm font-medium text-gray-700">Owner KYC</p>
                        </div>
                        <div className="mt-2">
                          {getOwnerKYCStatusBadge(selectedUser.ownerKycStatus)}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
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
                      onClick={() => handleEditUser(selectedUser)}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                    >
                      Edit User
                    </button>
                    <button
                      onClick={() => setShowUserModal(false)}
                      className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}