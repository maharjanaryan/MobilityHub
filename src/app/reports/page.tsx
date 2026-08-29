// app/reports/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Users,
  Car,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  ChevronDown,
  Loader2,
  User,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HomeHeader from '../home/HomeHeader';
import Footer from '../component/Footer';

interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  rejectedBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  growthPercentage: number;
}

interface MonthlyData {
  month: string;
  bookings: number;
  revenue: number;
}

interface VehicleStats {
  id: number;
  name: string;
  totalRentals: number;
  revenue: number;
  rating: number;
}

interface OwnerDashboardData {
  totalVehicles: number;
  availableVehicles: number;
  currentlyBookedVehicles: number;
  pendingBookings: number;
  confirmedBookings: number;
  activeBookings: number;
  awaitingReturnBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  rejectedBookings: number;
  totalRevenue: number;
  upcomingRevenue: number;
}

interface Booking {
  id: number;
  vehicleName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  pickupDate: string;
  dropoffDate: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('USER');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ownerData, setOwnerData] = useState<OwnerDashboardData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [vehicleStats, setVehicleStats] = useState<VehicleStats[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || localStorage.getItem('token');
    }
    return null;
  };

  const getUserRole = () => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          return user?.role || user?.roles?.[0] || 'USER';
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    return 'USER';
  };

  const fetchUserBookings = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8080/api/bookings/my-bookings?page=0&size=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.content || data || [];
        return Array.isArray(content) ? content : [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  };

  const fetchOwnerBookings = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8080/api/bookings/owner-bookings?page=0&size=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.content || data || [];
        return Array.isArray(content) ? content : [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching owner bookings:', error);
      return [];
    }
  };

  const fetchOwnerVehicles = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8080/api/vehicles/owner/my-vehicles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }
  };

  const calculateMonthlyData = (bookings: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: MonthlyData[] = months.map(month => ({
      month,
      bookings: 0,
      revenue: 0
    }));

    const currentYear = new Date().getFullYear();

    bookings.forEach((booking: any) => {
      const createdAt = new Date(booking.createdAt);
      if (createdAt.getFullYear() === currentYear) {
        const monthIndex = createdAt.getMonth();
        monthlyData[monthIndex].bookings += 1;
        monthlyData[monthIndex].revenue += booking.totalAmount || 0;
      }
    });

    return monthlyData;
  };

  const calculateVehicleStats = (bookings: any[]) => {
    const vehicleMap = new Map<number, { name: string, totalRentals: number, revenue: number, rating: number }>();

    bookings.forEach((booking: any) => {
      const vehicleId = booking.vehicleId;
      const vehicleName = booking.vehicleName || 'Unknown Vehicle';

      if (!vehicleMap.has(vehicleId)) {
        vehicleMap.set(vehicleId, {
          name: vehicleName,
          totalRentals: 0,
          revenue: 0,
          rating: 4.5
        });
      }

      const stats = vehicleMap.get(vehicleId)!;
      stats.totalRentals += 1;
      stats.revenue += booking.totalAmount || 0;
    });

    const result: VehicleStats[] = Array.from(vehicleMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      totalRentals: data.totalRentals,
      revenue: data.revenue,
      rating: data.rating
    }));

    return result.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  };

  const fetchReports = async () => {
    const token = getToken();
    if (!token) {
      router.push('/signin');
      return;
    }

    const role = getUserRole();
    setUserRole(role);
    setLoading(true);
    setError(null);

    try {
      let bookings: any[] = [];
      let isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN';

      if (isAdmin) {
        const statsRes = await fetch('http://localhost:8080/api/bookings/admin/bookings/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (statsRes.status === 401) {
          localStorage.clear();
          router.push('/signin');
          return;
        }

        if (statsRes.status === 403) {
          throw new Error('You do not have admin permissions');
        }

        if (!statsRes.ok) throw new Error('Failed to fetch admin stats');

        const statsData = await statsRes.json();

        setStats({
          totalBookings: statsData.total || 0,
          activeBookings: statsData.ongoing || 0,
          completedBookings: statsData.completed || 0,
          pendingBookings: statsData.pending || 0,
          cancelledBookings: statsData.cancelled || 0,
          rejectedBookings: statsData.rejected || 0,
          totalRevenue: statsData.totalRevenue || 0,
          monthlyRevenue: statsData.totalRevenue ? statsData.totalRevenue / 12 : 0,
          growthPercentage: 12.5,
        });

        bookings = await fetchUserBookings(token);

      } else {
        const ownerRes = await fetch('http://localhost:8080/api/bookings/owner/dashboard/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (ownerRes.status === 401) {
          localStorage.clear();
          router.push('/signin');
          return;
        }

        if (!ownerRes.ok) throw new Error('Failed to fetch owner data');

        const ownerDataRaw = await ownerRes.json();
        setOwnerData(ownerDataRaw);

        setStats({
          totalBookings: (ownerDataRaw.completedBookings || 0) + (ownerDataRaw.activeBookings || 0) + (ownerDataRaw.pendingBookings || 0),
          activeBookings: ownerDataRaw.activeBookings || 0,
          completedBookings: ownerDataRaw.completedBookings || 0,
          pendingBookings: ownerDataRaw.pendingBookings || 0,
          cancelledBookings: ownerDataRaw.cancelledBookings || 0,
          rejectedBookings: ownerDataRaw.rejectedBookings || 0,
          totalRevenue: ownerDataRaw.totalRevenue || 0,
          monthlyRevenue: ownerDataRaw.totalRevenue ? ownerDataRaw.totalRevenue / 12 : 0,
          growthPercentage: 8.3,
        });

        bookings = await fetchOwnerBookings(token);

        const vehicles = await fetchOwnerVehicles(token);
        const vehicleStatsData = calculateVehicleStats(bookings);

        for (let i = 0; i < vehicleStatsData.length; i++) {
          try {
            const ratingRes = await fetch(`http://localhost:8080/api/bookings/vehicle/${vehicleStatsData[i].id}/rating-summary`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (ratingRes.ok) {
              const ratingData = await ratingRes.json();
              vehicleStatsData[i].rating = ratingData.averageRating || 4.5;
            }
          } catch (e) {
            // Keep default rating
          }
        }

        setVehicleStats(vehicleStatsData);
      }

      const monthlyDataResult = calculateMonthlyData(bookings);
      setMonthlyData(monthlyDataResult);

      if (isAdmin) {
        const adminVehicleStats = calculateVehicleStats(bookings);
        setVehicleStats(adminVehicleStats);
      }

      setAllBookings(bookings);

    } catch (error: any) {
      console.error('Error fetching reports:', error);
      setError(error.message || 'Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchReports();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Fixed Bar Chart with better visualization
  const BarChart = ({ data, title, valuePrefix = '' }: { data: MonthlyData[], title: string, valuePrefix?: string }) => {
    const maxValue = Math.max(...data.map(d => d.bookings), 1);
    const hasData = data.some(d => d.bookings > 0);

    if (!hasData) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">{title}</h3>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
            No data available
          </div>
        </div>
      );
    }

    // Calculate the maximum value for scaling
    const maxBookings = Math.max(...data.map(d => d.bookings), 1);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span>Total: {data.reduce((sum, d) => sum + d.bookings, 0)}</span>
            <span>Max: {maxBookings}</span>
          </div>
        </div>
        <div className="h-64 relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>{maxBookings}</span>
            <span>{Math.round(maxBookings * 0.75)}</span>
            <span>{Math.round(maxBookings * 0.5)}</span>
            <span>{Math.round(maxBookings * 0.25)}</span>
            <span>0</span>
          </div>
          {/* Chart area */}
          <div className="ml-8 h-full flex items-end gap-1">
            {data.map((item, index) => {
              const heightPercent = maxBookings > 0 ? (item.bookings / maxBookings) * 100 : 0;
              const barHeight = Math.max(heightPercent, 2);
              const hasValue = item.bookings > 0;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  {/* Value label */}
                  <span className={`text-xs font-medium ${hasValue ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                    {item.bookings}
                  </span>
                  {/* Bar */}
                  <div className="w-full relative group" style={{ height: `${Math.max(barHeight, 4)}%`, minHeight: '4px' }}>
                    <div
                      className={`w-full rounded-t transition-all duration-500 cursor-pointer relative ${hasValue
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 dark:from-emerald-500 dark:to-emerald-300 hover:from-emerald-700 hover:to-emerald-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      style={{
                        height: '100%',
                        minHeight: '4px',
                        opacity: hasValue ? 1 : 0.4
                      }}
                    >
                      {/* Tooltip */}
                      {hasValue && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10 pointer-events-none">
                          {item.bookings} booking{item.bookings !== 1 ? 's' : ''} in {item.month}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Month label */}
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Fixed Revenue Chart with better visualization
  const RevenueChart = ({ data, title }: { data: MonthlyData[], title: string }) => {
    const maxValue = Math.max(...data.map(d => d.revenue), 1);
    const hasData = data.some(d => d.revenue > 0);

    if (!hasData) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">{title}</h3>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
            No revenue data available
          </div>
        </div>
      );
    }

    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span>Total: ₹{totalRevenue.toLocaleString()}</span>
            <span>Max: ₹{maxRevenue.toLocaleString()}</span>
          </div>
        </div>
        <div className="h-64 relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>₹{Math.round(maxRevenue / 1000)}k</span>
            <span>₹{Math.round(maxRevenue * 0.75 / 1000)}k</span>
            <span>₹{Math.round(maxRevenue * 0.5 / 1000)}k</span>
            <span>₹{Math.round(maxRevenue * 0.25 / 1000)}k</span>
            <span>₹0</span>
          </div>
          {/* Chart area */}
          <div className="ml-8 h-full flex items-end gap-1">
            {data.map((item, index) => {
              const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              const barHeight = Math.max(heightPercent, 2);
              const hasValue = item.revenue > 0;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  {/* Value label */}
                  <span className={`text-xs font-medium ${hasValue ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                    {hasValue ? `₹${Math.round(item.revenue / 1000)}k` : '₹0'}
                  </span>
                  {/* Bar */}
                  <div className="w-full relative group" style={{ height: `${Math.max(barHeight, 4)}%`, minHeight: '4px' }}>
                    <div
                      className={`w-full rounded-t transition-all duration-500 cursor-pointer relative ${hasValue
                          ? 'bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300 hover:from-blue-700 hover:to-blue-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      style={{
                        height: '100%',
                        minHeight: '4px',
                        opacity: hasValue ? 1 : 0.4
                      }}
                    >
                      {/* Tooltip */}
                      {hasValue && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10 pointer-events-none">
                          ₹{item.revenue.toLocaleString()} in {item.month}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Month label */}
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Stat Card Component
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    bgColor,
    subtitle
  }: {
    title: string,
    value: number | string,
    icon: any,
    color: string,
    bgColor: string,
    subtitle?: string
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {userRole === 'ADMIN' || userRole === 'ROLE_ADMIN'
                ? 'Please ensure you have admin permissions to view reports.'
                : 'Please ensure you have completed KYC to view owner reports.'}
            </p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-6 py-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isAdmin = userRole === 'ADMIN' || userRole === 'ROLE_ADMIN';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <HomeHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-emerald-300" />
                Reports & Analytics
              </h1>
              <p className="text-white/70 text-sm mt-1 flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <Users className="w-4 h-4" />
                    Admin Dashboard - Platform Overview
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    Owner Dashboard - Your Vehicle Performance
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition flex items-center gap-2 border border-white/20"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition flex items-center gap-2 border border-white/20">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Time Period Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${selectedPeriod === period
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                {period}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Last {selectedPeriod}</span>
          </div>
        </div>

        {/* Owner Specific Stats */}
        {!isAdmin && ownerData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Vehicles"
              value={ownerData.totalVehicles || 0}
              icon={Car}
              color="text-purple-600 dark:text-purple-400"
              bgColor="bg-purple-50 dark:bg-purple-900/30"
            />
            <StatCard
              title="Available Vehicles"
              value={ownerData.availableVehicles || 0}
              icon={CheckCircle}
              color="text-green-600 dark:text-green-400"
              bgColor="bg-green-50 dark:bg-green-900/30"
            />
            <StatCard
              title="Currently Booked"
              value={ownerData.currentlyBookedVehicles || 0}
              icon={Car}
              color="text-blue-600 dark:text-blue-400"
              bgColor="bg-blue-50 dark:bg-blue-900/30"
            />
            <StatCard
              title="Upcoming Revenue"
              value={`₹${(ownerData.upcomingRevenue || 0).toLocaleString()}`}
              icon={TrendingUp}
              color="text-yellow-600 dark:text-yellow-400"
              bgColor="bg-yellow-50 dark:bg-yellow-900/30"
            />
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Bookings"
            value={stats?.totalBookings || 0}
            icon={CalendarCheck}
            color="text-emerald-600 dark:text-emerald-400"
            bgColor="bg-emerald-50 dark:bg-emerald-900/30"
            subtitle={`${stats?.growthPercentage || 0}% growth`}
          />
          <StatCard
            title={isAdmin ? "Active Bookings" : "Active Rentals"}
            value={stats?.activeBookings || 0}
            icon={Car}
            color="text-blue-600 dark:text-blue-400"
            bgColor="bg-blue-50 dark:bg-blue-900/30"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="text-yellow-600 dark:text-yellow-400"
            bgColor="bg-yellow-50 dark:bg-yellow-900/30"
          />
          <StatCard
            title="Completed"
            value={stats?.completedBookings || 0}
            icon={CheckCircle}
            color="text-green-600 dark:text-green-400"
            bgColor="bg-green-50 dark:bg-green-900/30"
          />
        </div>

        {/* Charts Row - Improved Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BarChart data={monthlyData} title="Monthly Bookings" />
          <RevenueChart data={monthlyData} title="Monthly Revenue" />
        </div>

        {/* Booking Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
              {isAdmin ? 'Booking Status' : 'Rental Status'}
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Pending', value: stats?.pendingBookings || 0, color: 'bg-yellow-500', icon: Clock },
                { label: 'Active', value: stats?.activeBookings || 0, color: 'bg-blue-500', icon: Car },
                { label: 'Completed', value: stats?.completedBookings || 0, color: 'bg-green-500', icon: CheckCircle },
                { label: 'Cancelled', value: stats?.cancelledBookings || 0, color: 'bg-red-500', icon: XCircle },
                { label: 'Rejected', value: stats?.rejectedBookings || 0, color: 'bg-gray-500', icon: AlertCircle },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Vehicles */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
              {isAdmin ? 'Top Performing Vehicles' : 'Your Top Performing Vehicles'}
            </h3>
            {vehicleStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-2 font-medium">Vehicle</th>
                      <th className="pb-2 font-medium">Rentals</th>
                      <th className="pb-2 font-medium">Revenue</th>
                      <th className="pb-2 font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {vehicleStats.map((vehicle) => (
                      <tr key={vehicle.id} className="text-sm">
                        <td className="py-3 text-gray-800 dark:text-gray-200 font-medium">{vehicle.name}</td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">{vehicle.totalRentals}</td>
                        <td className="py-3 text-emerald-600 dark:text-emerald-400 font-medium">₹{vehicle.revenue.toLocaleString()}</td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            {vehicle.rating.toFixed(1)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                No vehicle data available yet
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.totalBookings || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isAdmin ? 'Total Bookings' : 'Total Rentals'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats?.activeBookings || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isAdmin ? 'Active Now' : 'Active Rentals'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats?.totalBookings ? Math.round((stats.completedBookings || 0) / (stats.totalBookings || 1) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completion Rate</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              ₹{Math.round((stats?.monthlyRevenue || 0)).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Monthly Revenue</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}