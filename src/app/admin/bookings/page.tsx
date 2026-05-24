// app/admin/bookings/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  User,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock as ClockIcon,
  Download,
  RefreshCw,
  MoreVertical,
  Star,
  Phone,
  Mail,
  CreditCard,
  Calendar as CalendarIcon,
  Users
} from 'lucide-react';

interface Booking {
  id: string;
  bookingId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    image: string;
    licensePlate: string;
  };
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  totalDays: number;
  pricePerDay: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: 'card' | 'cash' | 'wallet';
  createdAt: string;
  specialRequests?: string;
}

export default function BookingManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'pending' | 'paid' | 'refunded'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  // Mock data - replace with API call
  const bookings: Booking[] = [
    {
      id: '1',
      bookingId: 'BK-2024-001',
      user: {
        id: 'user_001',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
        avatar: 'JD'
      },
      vehicle: {
        id: 'veh_001',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2023,
        image: '/api/placeholder/400/300',
        licensePlate: 'EV-1234'
      },
      pickupLocation: 'Los Angeles Airport',
      dropoffLocation: 'Downtown LA',
      pickupDate: '2024-02-15T10:00:00',
      dropoffDate: '2024-02-20T10:00:00',
      totalDays: 5,
      pricePerDay: 89,
      totalAmount: 445,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      createdAt: '2024-02-10T08:30:00',
      specialRequests: 'Need baby seat'
    },
    {
      id: '2',
      bookingId: 'BK-2024-002',
      user: {
        id: 'user_002',
        name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        phone: '+1 345 678 9012',
        avatar: 'SC'
      },
      vehicle: {
        id: 'veh_002',
        brand: 'BMW',
        model: 'X5',
        year: 2022,
        image: '/api/placeholder/400/300',
        licensePlate: 'BMW-5678'
      },
      pickupLocation: 'Houston Downtown',
      dropoffLocation: 'Houston Airport',
      pickupDate: '2024-02-18T14:00:00',
      dropoffDate: '2024-02-22T14:00:00',
      totalDays: 4,
      pricePerDay: 120,
      totalAmount: 480,
      status: 'ongoing',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      createdAt: '2024-02-12T15:20:00'
    },
    {
      id: '3',
      bookingId: 'BK-2024-003',
      user: {
        id: 'user_003',
        name: 'Mike Ross',
        email: 'mike.ross@example.com',
        phone: '+1 456 789 0123',
        avatar: 'MR'
      },
      vehicle: {
        id: 'veh_003',
        brand: 'Honda',
        model: 'CR-V',
        year: 2023,
        image: '/api/placeholder/400/300',
        licensePlate: 'HON-9012'
      },
      pickupLocation: 'Philadelphia Center',
      dropoffLocation: 'Philadelphia Airport',
      pickupDate: '2024-02-20T09:00:00',
      dropoffDate: '2024-02-25T09:00:00',
      totalDays: 5,
      pricePerDay: 65,
      totalAmount: 325,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'wallet',
      createdAt: '2024-02-18T11:45:00'
    },
    {
      id: '4',
      bookingId: 'BK-2024-004',
      user: {
        id: 'user_004',
        name: 'Emily Watson',
        email: 'emily.watson@example.com',
        phone: '+1 567 890 1234',
        avatar: 'EW'
      },
      vehicle: {
        id: 'veh_004',
        brand: 'Toyota',
        model: 'Camry',
        year: 2021,
        image: '/api/placeholder/400/300',
        licensePlate: 'TOY-3456'
      },
      pickupLocation: 'Chicago Loop',
      dropoffLocation: "O'Hare Airport",
      pickupDate: '2024-02-10T11:00:00',
      dropoffDate: '2024-02-15T11:00:00',
      totalDays: 5,
      pricePerDay: 55,
      totalAmount: 275,
      status: 'completed',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      createdAt: '2024-02-05T09:15:00'
    },
    {
      id: '5',
      bookingId: 'BK-2024-005',
      user: {
        id: 'user_005',
        name: 'David Kim',
        email: 'david.kim@example.com',
        phone: '+1 678 901 2345',
        avatar: 'DK'
      },
      vehicle: {
        id: 'veh_005',
        brand: 'Ford',
        model: 'Mustang',
        year: 2022,
        image: '/api/placeholder/400/300',
        licensePlate: 'FOR-7890'
      },
      pickupLocation: 'Miami Beach',
      dropoffLocation: 'Miami Airport',
      pickupDate: '2024-02-05T13:00:00',
      dropoffDate: '2024-02-08T13:00:00',
      totalDays: 3,
      pricePerDay: 150,
      totalAmount: 450,
      status: 'cancelled',
      paymentStatus: 'refunded',
      paymentMethod: 'card',
      createdAt: '2024-02-01T16:30:00'
    },
    {
      id: '6',
      bookingId: 'BK-2024-006',
      user: {
        id: 'user_006',
        name: 'Lisa Wong',
        email: 'lisa.wong@example.com',
        phone: '+1 789 012 3456',
        avatar: 'LW'
      },
      vehicle: {
        id: 'veh_006',
        brand: 'Hyundai',
        model: 'Ioniq 5',
        year: 2023,
        image: '/api/placeholder/400/300',
        licensePlate: 'HYU-2345'
      },
      pickupLocation: 'Seattle Center',
      dropoffLocation: 'Seattle Airport',
      pickupDate: '2024-02-22T10:00:00',
      dropoffDate: '2024-02-28T10:00:00',
      totalDays: 6,
      pricePerDay: 95,
      totalAmount: 570,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'card',
      createdAt: '2024-02-19T14:20:00'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        );
      case 'ongoing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Ongoing
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>;
      case 'refunded':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Refunded</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' ? true : booking.status === filterStatus;
    const matchesPayment = filterPayment === 'all' ? true : booking.paymentStatus === filterPayment;
    const matchesSearch = searchTerm === '' ||
      booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPayment && matchesSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    ongoing: bookings.filter(b => b.status === 'ongoing').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0)
  };

  return (
    <>
      {/* Header Stats */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Management</h1>
            <p className="text-gray-600">Manage all vehicle bookings and reservations</p>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Total Bookings</div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-2">All bookings</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Pending</div>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.pending}</div>
          <div className="text-xs text-gray-500 mt-2">Awaiting confirmation</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Ongoing</div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.ongoing}</div>
          <div className="text-xs text-gray-500 mt-2">Currently active</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Completed</div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.completed}</div>
          <div className="text-xs text-gray-500 mt-2">Successfully completed</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Total Revenue</div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">${stats.totalRevenue}</div>
          <div className="text-xs text-gray-500 mt-2">From all bookings</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by booking ID, user name, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterPayment('all');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm whitespace-nowrap"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Date</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Dropoff Date</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="text-right px-4 md:px-6 py-3 md:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-all">
                  <td className="px-4 md:px-6 py-4">
                    <span className="text-sm font-medium text-gray-800">{booking.bookingId}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{booking.user.name}</p>
                      <p className="text-xs text-gray-500">{booking.user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-700">{booking.vehicle.brand} {booking.vehicle.model}</p>
                      <p className="text-xs text-gray-500">{booking.vehicle.licensePlate}</p>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {new Date(booking.pickupDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {new Date(booking.dropoffDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="text-sm font-semibold text-gray-800">${booking.totalAmount}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    {getPaymentStatusBadge(booking.paymentStatus)}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowCancelModal(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors ml-2"
                        title="Cancel Booking"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No bookings found</p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 md:p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Booking Details</h2>
                <p className="text-sm text-gray-500 mt-1">ID: {selectedBooking.bookingId}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Booking Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Booking Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <CalendarIcon className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Pickup Date & Time</p>
                          <p className="text-sm font-medium text-gray-800">
                            {new Date(selectedBooking.pickupDate).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{selectedBooking.pickupLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <CalendarIcon className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Dropoff Date & Time</p>
                          <p className="text-sm font-medium text-gray-800">
                            {new Date(selectedBooking.dropoffDate).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{selectedBooking.dropoffLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm font-medium text-gray-800">
                            {selectedBooking.totalDays} days
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Total Amount</span>
                        <span className="text-xl font-bold text-emerald-600">${selectedBooking.totalAmount}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Payment Status</span>
                        <span>{getPaymentStatusBadge(selectedBooking.paymentStatus)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Payment Method</span>
                        <span className="text-sm font-medium text-gray-800 capitalize">
                          {selectedBooking.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - User & Vehicle Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">User Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                          <span className="text-emerald-700 font-semibold">{selectedBooking.user.avatar}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{selectedBooking.user.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{selectedBooking.user.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{selectedBooking.user.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Vehicle Information</h3>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden relative">
                          <Image
                            src={selectedBooking.vehicle.image}
                            alt={`${selectedBooking.vehicle.brand} ${selectedBooking.vehicle.model}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">
                            {selectedBooking.vehicle.brand} {selectedBooking.vehicle.model}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Year: {selectedBooking.vehicle.year}</p>
                          <p className="text-xs text-gray-500">License: {selectedBooking.vehicle.licensePlate}</p>
                          <p className="text-xs text-emerald-600 mt-1">${selectedBooking.pricePerDay}/day</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedBooking.specialRequests && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Special Requests</h3>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{selectedBooking.specialRequests}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    {selectedBooking.status === 'pending' && (
                      <>
                        <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                          Confirm Booking
                        </button>
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}
                    {selectedBooking.status === 'ongoing' && (
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Mark as Completed
                      </button>
                    )}
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      Download Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Cancel Booking</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to cancel booking {selectedBooking.bookingId}? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  No, Keep It
                </button>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedBooking(null);
                    alert('Booking cancelled successfully');
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}