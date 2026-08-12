// app/admin/vehicles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Car,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Fuel,
  Gauge,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Star,
  MoreVertical,
  RefreshCw,
  Loader2,
  Filter,
  X,
  FileText,
  ZoomIn
} from 'lucide-react';

interface Vehicle {
  id: number;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  fuelType: string;
  transmission: string;
  seats: number;
  doors: number;
  luggageCapacity: number;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  securityDeposit: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isAvailable: boolean;
  isVerified: boolean;
  rejectionReason?: string;
  description: string;
  photos: string[];
  bluebookDocuments?: string[];
  totalRentals: number;
  averageRating: number;
  createdAt: string;
}

interface VehicleStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  available: number;
}

// Toast Notification Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500 dark:bg-green-600 text-white' : 'bg-red-500 dark:bg-red-600 text-white'
      }`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      {message}
    </div>
  );
};

export default function VehicleManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pendingVehicles, setPendingVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyAction, setVerifyAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected' | 'available'>('all');
  const [stats, setStats] = useState<VehicleStats>({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    available: 0
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

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
      fetchAllVehicles(),
      fetchPendingVehicles()
    ]);
  };

  const fetchAllVehicles = async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8080/api/vehicles/all?page=0&size=100', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const allVehicles = data.content || [];
        setVehicles(allVehicles);

        const pending = allVehicles.filter((v: Vehicle) => !v.isVerified && !v.rejectionReason).length;
        const rejected = allVehicles.filter((v: Vehicle) => !v.isVerified && v.rejectionReason).length;
        const verified = allVehicles.filter((v: Vehicle) => v.isVerified).length;
        const available = allVehicles.filter((v: Vehicle) => v.isAvailable && v.isVerified).length;

        setStats({
          total: allVehicles.length,
          pending: pending,
          verified: verified,
          rejected: rejected,
          available: available
        });
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchPendingVehicles = async () => {
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/vehicles/admin/pending', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingVehicles(data.filter((v: Vehicle) => !v.isVerified && !v.rejectionReason));
      }
    } catch (error) {
      console.error('Error fetching pending vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyVehicle = async (approved: boolean) => {
    if (!selectedVehicle) return;

    setActionLoading(true);
    const token = getAccessToken();

    try {
      let url = `http://localhost:8080/api/vehicles/admin/verify/${selectedVehicle.id}?approved=${approved}`;
      if (!approved && rejectionReason) {
        url += `&rejectionReason=${encodeURIComponent(rejectionReason)}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const message = approved
          ? `${selectedVehicle.brand} ${selectedVehicle.model} has been approved successfully!`
          : `${selectedVehicle.brand} ${selectedVehicle.model} has been rejected.`;
        setToast({ message, type: 'success' });
        setShowVerifyModal(false);
        setSelectedVehicle(null);
        setRejectionReason('');
        await loadData();
      } else {
        const error = await response.json();
        setToast({ message: error.message || 'Failed to verify vehicle', type: 'error' });
      }
    } catch (error) {
      console.error('Error verifying vehicle:', error);
      setToast({ message: 'Failed to verify vehicle. Please try again.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;

    setActionLoading(true);
    const token = getAccessToken();

    try {
      const response = await fetch(`http://localhost:8080/api/vehicles/${selectedVehicle.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setToast({ message: `${selectedVehicle.brand} ${selectedVehicle.model} deleted successfully!`, type: 'success' });
        setShowDeleteModal(false);
        setSelectedVehicle(null);
        await loadData();
      } else {
        const error = await response.json();
        setToast({ message: error.message || 'Failed to delete vehicle', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      setToast({ message: 'Failed to delete vehicle. Please try again.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (vehicle: Vehicle) => {
    if (!vehicle.isVerified && vehicle.rejectionReason) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </span>
      );
    }
    if (!vehicle.isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending Verification
        </span>
      );
    }
    if (vehicle.isAvailable) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Available
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
        <XCircle className="w-3 h-3 mr-1" />
        Unavailable
      </span>
    );
  };

  const getFuelTypeIcon = (fuelType: string) => {
    const icons: Record<string, string> = {
      electric: '🔋',
      hybrid: '⚡',
      petrol: '⛽',
      diesel: '🛢️'
    };
    return icons[fuelType?.toLowerCase()] || '⛽';
  };

  const handleImageClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filterStatus === 'pending') return !vehicle.isVerified && !vehicle.rejectionReason;
    if (filterStatus === 'verified') return vehicle.isVerified;
    if (filterStatus === 'rejected') return !vehicle.isVerified && vehicle.rejectionReason;
    if (filterStatus === 'available') return vehicle.isAvailable && vehicle.isVerified;
    return true;
  }).filter(vehicle => {
    if (!searchTerm) return true;
    return vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-4 md:p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Stats */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Vehicle Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Review and manage all vehicles on the platform</p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Total Vehicles</div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.total}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Listed on platform</div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Pending Review</div>
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.pending}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Awaiting verification</div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Verified</div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.verified}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Approved vehicles</div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Rejected</div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.rejected}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Rejected vehicles</div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Available Now</div>
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.available}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Ready for booking</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by brand, model, owner or license plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Verification</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="available">Available</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Vehicles Section */}
      {pendingVehicles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            Pending Verification ({pendingVehicles.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {pendingVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-yellow-200 dark:border-yellow-900/30 hover:shadow-lg transition-all overflow-hidden">
                <div
                  className="relative h-48 bg-gray-100 dark:bg-gray-800 cursor-pointer"
                  onClick={() => handleImageClick(vehicle)}
                >
                  {vehicle.photos && vehicle.photos[0] ? (
                    <img
                      src={vehicle.photos[0]}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <Car className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </span>
                  </div>
                  {vehicle.bluebookDocuments && vehicle.bluebookDocuments.length > 0 && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        <FileText className="w-3 h-3 mr-1" />
                        Bluebook attached
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{vehicle.brand} {vehicle.model}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.year} • {vehicle.color}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{vehicle.pricePerDay}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">per day</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Users className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                      {vehicle.seats} Seats
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Gauge className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                      {vehicle.transmission}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <span className="mr-2">{getFuelTypeIcon(vehicle.fuelType)}</span>
                      {vehicle.fuelType}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                      {vehicle.city}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setVerifyAction('approve');
                        setShowVerifyModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setVerifyAction('reject');
                        setShowVerifyModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setShowDeleteModal(true);
                      }}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Vehicles Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">All Vehicles ({filteredVehicles.length})</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all overflow-hidden">
              <div
                className="relative h-48 bg-gray-100 dark:bg-gray-800 cursor-pointer"
                onClick={() => handleImageClick(vehicle)}
              >
                {vehicle.photos && vehicle.photos[0] ? (
                  <img
                    src={vehicle.photos[0]}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <Car className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(vehicle)}
                </div>
                {vehicle.rejectionReason && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-50/95 dark:bg-red-900/90 backdrop-blur-sm p-2 border-t border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-700 dark:text-red-300 truncate">
                      <strong>Rejected:</strong> {vehicle.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.year} • {vehicle.color}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{vehicle.pricePerDay}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">per day</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Users className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                    {vehicle.seats} Seats
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Gauge className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                    {vehicle.transmission}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2">{getFuelTypeIcon(vehicle.fuelType)}</span>
                    {vehicle.fuelType}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                    {vehicle.city}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{vehicle.ownerName}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{vehicle.averageRating || 0}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({vehicle.totalRentals || 0} trips)</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>

                  {!vehicle.isVerified && !vehicle.rejectionReason && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setVerifyAction('approve');
                          setShowVerifyModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setVerifyAction('reject');
                          setShowVerifyModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {!vehicle.isVerified && vehicle.rejectionReason && (
                    <button
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setVerifyAction('approve');
                        setShowVerifyModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-yellow-600 dark:bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Re-verify</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setShowDeleteModal(true);
                    }}
                    className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredVehicles.length === 0 && vehicles.length === 0 && (
        <div className="text-center py-12">
          <Car className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No vehicles found</p>
        </div>
      )}

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 p-4 md:p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Vehicle Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedVehicle.brand} {selectedVehicle.model}</p>
              </div>
              <button onClick={() => setSelectedVehicle(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 md:p-6">
              {selectedVehicle.rejectionReason && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Rejection Reason:</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{selectedVehicle.rejectionReason}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="relative h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-3">
                    {selectedVehicle.photos && selectedVehicle.photos[0] ? (
                      <img src={selectedVehicle.photos[0]} alt="Vehicle" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedVehicle.photos?.slice(0, 3).map((photo, idx) => (
                      <div key={idx} className="relative h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <img src={photo} alt={`Vehicle ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  {/* Bluebook / Registration Document */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Bluebook Document
                    </h3>
                    {selectedVehicle.bluebookDocuments && selectedVehicle.bluebookDocuments.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedVehicle.bluebookDocuments.map((doc, idx) => (
                          <div
                            key={idx}
                            className="relative h-36 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer group border border-gray-200 dark:border-gray-700"
                            onClick={() => setZoomedImage(doc)}
                          >
                            <img src={doc} alt={`Bluebook ${idx === 0 ? 'Front' : 'Back'}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
                              {idx === 0 ? 'Front' : 'Back'}
                            </span>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">No bluebook document was submitted for this vehicle.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Vehicle Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">License Plate</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedVehicle.licensePlate}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Year</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedVehicle.year}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Color</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedVehicle.color}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Transmission</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedVehicle.transmission}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fuel Type</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedVehicle.fuelType}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Seats</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedVehicle.seats}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Owner Information</h3>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Owner Name</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedVehicle.ownerName}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedVehicle.ownerEmail}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Pricing</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Price Per Day</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{selectedVehicle.pricePerDay}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Security Deposit</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">₹{selectedVehicle.securityDeposit || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    {!selectedVehicle.isVerified && !selectedVehicle.rejectionReason && (
                      <>
                        <button
                          onClick={() => {
                            setVerifyAction('approve');
                            setShowVerifyModal(true);
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                        >
                          Approve Vehicle
                        </button>
                        <button
                          onClick={() => {
                            setVerifyAction('reject');
                            setShowVerifyModal(true);
                          }}
                          className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                        >
                          Reject Vehicle
                        </button>
                      </>
                    )}

                    {!selectedVehicle.isVerified && selectedVehicle.rejectionReason && (
                      <button
                        onClick={() => {
                          setVerifyAction('approve');
                          setShowVerifyModal(true);
                        }}
                        className="flex-1 px-4 py-2 bg-yellow-600 dark:bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors"
                      >
                        Re-verify Vehicle
                      </button>
                    )}

                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex-1 px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Delete Vehicle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bluebook Zoom Modal */}
      {zoomedImage && (
        <div
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
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${verifyAction === 'approve' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                {verifyAction === 'approve' ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center mb-2">
                {verifyAction === 'approve' ? 'Approve Vehicle' : 'Reject Vehicle'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-4">
                {verifyAction === 'approve'
                  ? `Are you sure you want to approve ${selectedVehicle.brand} ${selectedVehicle.model}? This vehicle will be visible to all users.`
                  : `Are you sure you want to reject ${selectedVehicle.brand} ${selectedVehicle.model}? The owner will be notified.`}
              </p>
              {verifyAction === 'reject' && (
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                />
              )}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerifyVehicle(verifyAction === 'approve')}
                  disabled={actionLoading || (verifyAction === 'reject' && !rejectionReason.trim())}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${verifyAction === 'approve' ? 'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600' : 'bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600'
                    }`}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {verifyAction === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center mb-2">Delete Vehicle</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6">
                Are you sure you want to delete {selectedVehicle.brand} {selectedVehicle.model}? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVehicle}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}