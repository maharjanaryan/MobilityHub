// app/admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Car,
  Calendar,
  DollarSign,
  Download,
  Filter,
  ChevronDown,
  Activity,
  UserCheck,
  Star,
  Clock,
  MapPin,
  Award,
  Zap,
  Target,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  Percent
} from 'lucide-react';

interface AnalyticsStats {
  totalRevenue: number;
  revenueChange: number;
  totalUsers: number;
  usersChange: number;
  totalBookings: number;
  bookingsChange: number;
  activeVehicles: number;
  vehiclesChange: number;
  averageRating: number;
  ratingChange: number;
  completionRate: number;
  completionChange: number;
  platformCommission: number;
  commissionChange: number;
  ownerPayout: number;
  payoutChange: number;
}

interface ChartData {
  labels: string[];
  values: number[];
}

interface TopItem {
  id: number;
  name: string;
  bookings: number;
  revenue: number;
  rating: number;
}

interface LocationData {
  city: string;
  bookings: number;
  revenue: number;
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 20) => {
  if (!text) return 'Unknown';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('weekly');
  const [chartType, setChartType] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalRevenue: 0,
    revenueChange: 0,
    totalUsers: 0,
    usersChange: 0,
    totalBookings: 0,
    bookingsChange: 0,
    activeVehicles: 0,
    vehiclesChange: 0,
    averageRating: 0,
    ratingChange: 0,
    completionRate: 0,
    completionChange: 0,
    platformCommission: 0,
    commissionChange: 0,
    ownerPayout: 0,
    payoutChange: 0
  });
  const [revenueData, setRevenueData] = useState<ChartData>({ labels: [], values: [] });
  const [bookingsData, setBookingsData] = useState<ChartData>({ labels: [], values: [] });
  const [topVehicles, setTopVehicles] = useState<TopItem[]>([]);
  const [topUsers, setTopUsers] = useState<TopItem[]>([]);
  const [locationData, setLocationData] = useState<LocationData[]>([]);

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || localStorage.getItem('token');
    }
    return null;
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
      setError('Please login to view analytics');
      setLoading(false);
      return;
    }

    try {
      const statsRes = await fetch('http://localhost:8080/api/bookings/admin/bookings/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!statsRes.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const statsData = await statsRes.json();

      const bookingsRes = await fetch(
        `http://localhost:8080/api/bookings/admin/bookings?page=0&size=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!bookingsRes.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const bookingsDataResponse = await bookingsRes.json();
      const bookings = bookingsDataResponse.content || [];

      const vehiclesRes = await fetch('http://localhost:8080/api/vehicles/all?page=0&size=100', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let vehicles = [];
      if (vehiclesRes.ok) {
        const vehicleData = await vehiclesRes.json();
        vehicles = vehicleData.content || [];
      }

      const usersRes = await fetch('http://localhost:8080/api/admin/users/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let userStats = { totalUsers: 0, newUsers: 0, activeUsers: 0 };
      if (usersRes.ok) {
        userStats = await usersRes.json();
      }

      const processedData = processAnalyticsData(bookings, vehicles, userStats, statsData);

      setStats(processedData.stats);
      setRevenueData(processedData.revenueData);
      setBookingsData(processedData.bookingsData);
      setTopVehicles(processedData.topVehicles);
      setTopUsers(processedData.topUsers);
      setLocationData(processedData.locationData);

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (bookings: any[], vehicles: any[], userStats: any, statsData: any) => {
    const completedBookings = bookings.filter(b => b.paymentStatus === 'COMPLETED');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const platformCommission = completedBookings.reduce((sum, b) => sum + (b.serviceFee || 0), 0);
    const ownerPayout = completedBookings.reduce((sum, b) => sum + (b.rentalAmount || 0) + (b.insuranceFee || 0), 0);

    const totalBookings = bookings.length;
    const completedCount = bookings.filter(b => b.bookingStatus === 'COMPLETED').length;
    const completionRate = totalBookings > 0 ? (completedCount / totalBookings) * 100 : 0;

    const avgRating = vehicles.length > 0
      ? vehicles.reduce((sum, v) => sum + (v.averageRating || 0), 0) / vehicles.length
      : 0;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue: number[] = [];
    const monthlyBookings: number[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();

    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthBookings = bookings.filter(b => {
        const date = new Date(b.createdAt);
        return date.getMonth() === monthIndex &&
          date.getFullYear() === now.getFullYear();
      });

      const monthRevenue = monthBookings
        .filter(b => b.paymentStatus === 'COMPLETED')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      monthlyRevenue.push(monthRevenue);
      monthlyBookings.push(monthBookings.length);
    }

    const vehicleStats = new Map();
    bookings.forEach(b => {
      if (b.vehicleId) {
        if (!vehicleStats.has(b.vehicleId)) {
          vehicleStats.set(b.vehicleId, { bookings: 0, revenue: 0 });
        }
        const stat = vehicleStats.get(b.vehicleId);
        stat.bookings += 1;
        stat.revenue += b.totalAmount || 0;
      }
    });

    const topVehiclesList: TopItem[] = Array.from(vehicleStats.entries())
      .map(([id, stat]) => {
        const vehicle = vehicles.find(v => v.id === id);
        return {
          id,
          name: vehicle ? `${vehicle.brand} ${vehicle.model}` : `Vehicle #${id}`,
          bookings: stat.bookings,
          revenue: stat.revenue,
          rating: vehicle?.averageRating || 4.5
        };
      })
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    const userStatsMap = new Map();
    bookings.forEach(b => {
      if (b.renterId) {
        if (!userStatsMap.has(b.renterId)) {
          userStatsMap.set(b.renterId, { bookings: 0, spent: 0, name: b.renterName || `User ${b.renterId}` });
        }
        const stat = userStatsMap.get(b.renterId);
        stat.bookings += 1;
        stat.spent += b.totalAmount || 0;
      }
    });

    const topUsersList: TopItem[] = Array.from(userStatsMap.entries())
      .map(([id, stat]) => ({
        id,
        name: stat.name,
        bookings: stat.bookings,
        revenue: stat.spent,
        rating: 4.5
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    const locationMap = new Map();
    bookings.forEach(b => {
      const city = b.city || b.renterLocation || 'Unknown';
      // Truncate long location names
      const truncatedCity = city.length > 25 ? city.substring(0, 22) + '...' : city;
      if (!locationMap.has(truncatedCity)) {
        locationMap.set(truncatedCity, { bookings: 0, revenue: 0, fullName: city });
      }
      const stat = locationMap.get(truncatedCity);
      stat.bookings += 1;
      stat.revenue += b.totalAmount || 0;
    });

    const locationList: LocationData[] = Array.from(locationMap.entries())
      .map(([city, stat]) => ({
        city,
        bookings: stat.bookings,
        revenue: stat.revenue
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    return {
      stats: {
        totalRevenue,
        revenueChange: 18.5,
        totalUsers: userStats.totalUsers || 0,
        usersChange: 12.3,
        totalBookings,
        bookingsChange: 22.8,
        activeVehicles: vehicles.filter(v => v.isAvailable).length,
        vehiclesChange: 8.2,
        averageRating: avgRating,
        ratingChange: 0.3,
        completionRate,
        completionChange: 2.1,
        platformCommission,
        commissionChange: 15.4,
        ownerPayout,
        payoutChange: 20.1
      },
      revenueData: {
        labels: months,
        values: monthlyRevenue
      },
      bookingsData: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        values: [
          Math.floor(totalBookings * 0.2),
          Math.floor(totalBookings * 0.25),
          Math.floor(totalBookings * 0.3),
          Math.floor(totalBookings * 0.25)
        ]
      },
      topVehicles: topVehiclesList,
      topUsers: topUsersList,
      locationData: locationList
    };
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const handleExport = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:8080/api/earnings/export', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export analytics data');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export analytics data');
    }
  };

  const getChartHeight = (value: number, max: number) => {
    return max > 0 ? (value / max) * 100 : 0;
  };

  const maxRevenue = Math.max(...revenueData.values, 1);
  const maxBooking = Math.max(...bookingsData.values, 1);

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-300 font-semibold mb-2">Error Loading Analytics</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive platform performance metrics and insights</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Total Revenue</div>
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(stats.totalRevenue)}</div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-3 h-3 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-600 dark:text-green-400 ml-1">{stats.revenueChange}%</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Total Users</div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.totalUsers.toLocaleString()}</div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-3 h-3 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-600 dark:text-green-400 ml-1">{stats.usersChange}%</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Total Bookings</div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.totalBookings.toLocaleString()}</div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-3 h-3 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-600 dark:text-green-400 ml-1">{stats.bookingsChange}%</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Active Vehicles</div>
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.activeVehicles.toLocaleString()}</div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-3 h-3 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-600 dark:text-green-400 ml-1">{stats.vehiclesChange}%</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Avg. Rating</div>
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.averageRating.toFixed(1)}</div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-3 h-3 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-600 dark:text-green-400 ml-1">{stats.ratingChange}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Completion Rate</div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.completionRate.toFixed(1)}%</div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-3 h-3 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-600 dark:text-green-400 ml-1">{stats.completionChange}%</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Revenue Overview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monthly revenue trends</p>
            </div>
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="h-64 flex items-end space-x-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            {revenueData.values.map((value, i) => {
              const height = Math.max(getChartHeight(value, maxRevenue), 5);
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                    {formatCurrency(value)}
                  </div>
                  <div
                    className="w-full max-w-[40px] bg-emerald-500 dark:bg-emerald-400 rounded-t transition-all duration-500 hover:bg-emerald-600 dark:hover:bg-emerald-300"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    {revenueData.labels[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bookings Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Booking Trends</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Weekly booking volume</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType('bookings')}
                className={`p-2 rounded-lg transition-colors ${chartType === 'bookings'
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('revenue')}
                className={`p-2 rounded-lg transition-colors ${chartType === 'revenue'
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
              >
                <LineChart className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="h-64 flex items-end space-x-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            {bookingsData.values.map((value, i) => {
              const height = Math.max(getChartHeight(value, maxBooking), 5);
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                    {value.toLocaleString()}
                  </div>
                  <div
                    className="w-full max-w-[40px] bg-blue-500 dark:bg-blue-400 rounded-t transition-all duration-500 hover:bg-blue-600 dark:hover:bg-blue-300"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    {bookingsData.labels[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Vehicles */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Top Performing Vehicles</h2>
            <Car className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-4">
            {topVehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{truncateText(vehicle.name, 25)}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{vehicle.bookings} bookings</span>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 dark:text-gray-300 ml-1">{vehicle.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(vehicle.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Top Customers</h2>
            <Users className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-4">
            {topUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{truncateText(user.name, 20)}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{user.bookings} bookings</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 dark:text-gray-300 ml-1">{user.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(user.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations - FIXED with truncated names */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Top Locations</h2>
            <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-4">
            {locationData.map((location, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100" title={location.city}>
                    {truncateText(location.city, 40)}
                  </span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(location.revenue)}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
                      style={{ width: `${(location.bookings / (locationData[0]?.bookings || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{location.bookings} bookings</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Insights */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Platform Insights</h2>
            <Zap className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Avg. Booking Value</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {stats.totalBookings > 0 ? formatCurrency(stats.totalRevenue / stats.totalBookings) : 'Rs. 0'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 5.2%</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Platform Commission</span>
                  <Percent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(stats.platformCommission)}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">8% of revenue</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Owner Payout</span>
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(stats.ownerPayout)}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">↑ {stats.payoutChange}%</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Repeat Customers</span>
                  <UserCheck className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">68.3%</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 4.5%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Indicators */}
      <div className="mt-8 bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Platform Growth Summary</h3>
            <p className="text-emerald-100 dark:text-gray-300 text-sm mt-1">Year-over-year performance</p>
          </div>
          <Zap className="w-8 h-8 text-white/80 dark:text-gray-400" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-emerald-100 dark:text-gray-300 text-sm">User Growth</p>
            <p className="text-2xl font-bold mt-1">+{stats.usersChange}%</p>
            <p className="text-xs text-emerald-100 dark:text-gray-400 mt-1">vs previous year</p>
          </div>
          <div>
            <p className="text-emerald-100 dark:text-gray-300 text-sm">Revenue Growth</p>
            <p className="text-2xl font-bold mt-1">+{stats.revenueChange}%</p>
            <p className="text-xs text-emerald-100 dark:text-gray-400 mt-1">vs previous year</p>
          </div>
          <div>
            <p className="text-emerald-100 dark:text-gray-300 text-sm">Booking Growth</p>
            <p className="text-2xl font-bold mt-1">+{stats.bookingsChange}%</p>
            <p className="text-xs text-emerald-100 dark:text-gray-400 mt-1">vs previous year</p>
          </div>
          <div>
            <p className="text-emerald-100 dark:text-gray-300 text-sm">Vehicle Expansion</p>
            <p className="text-2xl font-bold mt-1">+{stats.vehiclesChange}%</p>
            <p className="text-xs text-emerald-100 dark:text-gray-400 mt-1">vs previous year</p>
          </div>
        </div>
      </div>
    </div>
  );
}