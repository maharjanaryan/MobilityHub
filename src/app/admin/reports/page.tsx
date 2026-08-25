// app/admin/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Users,
  Car,
  DollarSign,
  CheckCircle,
  XCircle,
  Printer,
  Mail,
  RefreshCw,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  Wallet,
  Percent,
  AlertCircle,
  Loader2,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ReportStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  platformCommission: number;
  ownerPayout: number;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalVehicles: number;
  activeVehicles: number;
  averageRating: number;
  pendingKyc: number;
  verifiedKyc: number;
  rejectedKyc: number;
}

interface MonthlyData {
  month: string;
  bookings: number;
  revenue: number;
  commission: number;
  ownerPayout: number;
}

interface RevenueSource {
  source: string;
  amount: number;
  percentage: number;
}

interface TopVehicle {
  id: number;
  name: string;
  bookings: number;
  revenue: number;
  rating: number;
}

interface UserGrowth {
  month: string;
  newUsers: number;
  totalUsers: number;
}

interface BookingStatus {
  status: string;
  count: number;
  percentage: number;
}

interface VehicleType {
  type: string;
  count: number;
  percentage: number;
}

interface ReportData {
  title: string;
  stats: ReportStats;
  monthlyData: MonthlyData[];
  revenueBySource: RevenueSource[];
  topVehicles: TopVehicle[];
  bookingsByStatus: BookingStatus[];
  userGrowth: UserGrowth[];
  vehiclesByType: VehicleType[];
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('bookings');
  const [dateRange, setDateRange] = useState('monthly');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [exporting, setExporting] = useState(false);

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || localStorage.getItem('token');
    }
    return null;
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
      setError('Please login to view reports');
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

      const stats = await statsRes.json();

      const bookingsRes = await fetch(
        `http://localhost:8080/api/bookings/admin/bookings?page=0&size=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!bookingsRes.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const bookingsData = await bookingsRes.json();
      const bookings = bookingsData.content || [];

      const vehiclesRes = await fetch('http://localhost:8080/api/vehicles/all?page=0&size=100', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let vehicles = [];
      if (vehiclesRes.ok) {
        const vehicleData = await vehiclesRes.json();
        vehicles = vehicleData.content || [];
      }

      const processedData = processReportData(bookings, vehicles, stats);
      setReportData(processedData);

    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (bookings: any[], vehicles: any[], stats: any): ReportData => {
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.bookingStatus === 'COMPLETED').length;
    const cancelledBookings = bookings.filter(b =>
      b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'REJECTED'
    ).length;

    const totalRevenue = bookings
      .filter(b => b.paymentStatus === 'COMPLETED')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const platformCommission = bookings
      .filter(b => b.paymentStatus === 'COMPLETED')
      .reduce((sum, b) => sum + (b.serviceFee || 0), 0);

    const ownerPayout = bookings
      .filter(b => b.paymentStatus === 'COMPLETED')
      .reduce((sum, b) => sum + (b.rentalAmount || 0) + (b.insuranceFee || 0), 0);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: MonthlyData[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex];
      const monthBookings = bookings.filter(b => {
        const date = new Date(b.createdAt);
        return date.getMonth() === monthIndex &&
          date.getFullYear() === now.getFullYear();
      });

      const monthRevenue = monthBookings
        .filter(b => b.paymentStatus === 'COMPLETED')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      const monthCommission = monthBookings
        .filter(b => b.paymentStatus === 'COMPLETED')
        .reduce((sum, b) => sum + (b.serviceFee || 0), 0);

      const monthOwnerPayout = monthBookings
        .filter(b => b.paymentStatus === 'COMPLETED')
        .reduce((sum, b) => sum + (b.rentalAmount || 0) + (b.insuranceFee || 0), 0);

      monthlyData.push({
        month: monthName,
        bookings: monthBookings.length,
        revenue: monthRevenue,
        commission: monthCommission,
        ownerPayout: monthOwnerPayout
      });
    }

    const totalCommission = bookings
      .filter(b => b.paymentStatus === 'COMPLETED')
      .reduce((sum, b) => sum + (b.serviceFee || 0), 0);

    const totalInsurance = bookings
      .filter(b => b.paymentStatus === 'COMPLETED')
      .reduce((sum, b) => sum + (b.insuranceFee || 0), 0);

    const totalRental = bookings
      .filter(b => b.paymentStatus === 'COMPLETED')
      .reduce((sum, b) => sum + (b.rentalAmount || 0), 0);

    const totalRevenueAll = totalCommission + totalInsurance + totalRental;

    const revenueBySource: RevenueSource[] = [
      {
        source: 'Service Fee (Commission)',
        amount: totalCommission,
        percentage: totalRevenueAll > 0 ? (totalCommission / totalRevenueAll) * 100 : 0
      },
      {
        source: 'Insurance Fee',
        amount: totalInsurance,
        percentage: totalRevenueAll > 0 ? (totalInsurance / totalRevenueAll) * 100 : 0
      },
      {
        source: 'Rental Amount',
        amount: totalRental,
        percentage: totalRevenueAll > 0 ? (totalRental / totalRevenueAll) * 100 : 0
      }
    ];

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

    const topVehicles: TopVehicle[] = Array.from(vehicleStats.entries())
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

    const statusMap = new Map<string, number>();
    bookings.forEach(b => {
      const status = b.bookingStatus || 'UNKNOWN';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const bookingsByStatus: BookingStatus[] = Array.from(statusMap.entries())
      .map(([status, count]) => ({
        status,
        count,
        percentage: totalBookings > 0 ? (count / totalBookings) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    const vehicleTypeMap = new Map<string, number>();
    vehicles.forEach(v => {
      const type = v.category || v.fuelType || v.type || 'Other';
      vehicleTypeMap.set(type, (vehicleTypeMap.get(type) || 0) + 1);
    });

    const vehiclesByType: VehicleType[] = Array.from(vehicleTypeMap.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: vehicles.length > 0 ? (count / vehicles.length) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    const userGrowth: UserGrowth[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex];
      const monthBookings = bookings.filter(b => {
        const date = new Date(b.createdAt);
        return date.getMonth() === monthIndex &&
          date.getFullYear() === now.getFullYear();
      });
      userGrowth.push({
        month: monthName,
        newUsers: monthBookings.length > 0 ? Math.floor(monthBookings.length * 0.3) : 0,
        totalUsers: stats?.totalUsers || 0
      });
    }

    return {
      title: getReportTitle(reportType),
      stats: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        platformCommission: totalCommission,
        ownerPayout,
        totalUsers: stats?.totalUsers || 0,
        newUsers: stats?.newUsers || 0,
        activeUsers: stats?.activeUsers || 0,
        totalVehicles: vehicles.length,
        activeVehicles: vehicles.filter(v => v.isAvailable).length,
        averageRating: vehicles.reduce((sum, v) => sum + (v.averageRating || 0), 0) / (vehicles.length || 1),
        pendingKyc: stats?.pendingKyc || 0,
        verifiedKyc: stats?.verifiedKyc || 0,
        rejectedKyc: stats?.rejectedKyc || 0
      },
      monthlyData,
      revenueBySource,
      topVehicles,
      bookingsByStatus,
      userGrowth,
      vehiclesByType
    };
  };

  const getReportTitle = (type: string): string => {
    const titles: Record<string, string> = {
      bookings: 'Booking Report',
      revenue: 'Revenue Report',
      users: 'User Report',
      vehicles: 'Vehicle Report',
      kyc: 'KYC Report',
      commission: 'Commission Report'
    };
    return titles[type] || 'Report';
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const handleGenerateReport = () => {
    fetchReportData();
  };

  const handleExport = async (format: string) => {
    if (!reportData) return;
    setExporting(true);

    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:8080/api/earnings/export?startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportData.title.toLowerCase().replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export report');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    alert('Email report feature coming soon');
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  const getChartHeight = (value: number, max: number) => {
    return max > 0 ? (value / max) * 100 : 0;
  };

  const getMaxValue = (data: any[], key: string) => {
    return Math.max(...data.map(item => item[key]), 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-300 font-semibold mb-2">Error Loading Report</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{error}</p>
          <button
            onClick={fetchReportData}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">No data available</p>
          <button
            onClick={fetchReportData}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Generate Report
          </button>
        </div>
      </div>
    );
  }

  const currentReport = reportData;

  return (
    <>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Reports</h1>
            <p className="text-gray-600 dark:text-gray-300">Generate and export comprehensive platform reports</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'bookings', label: 'Booking Report', icon: Calendar },
              { id: 'revenue', label: 'Revenue Report', icon: DollarSign },
              { id: 'commission', label: 'Commission Report', icon: Percent },
              { id: 'users', label: 'User Report', icon: Users },
              { id: 'vehicles', label: 'Vehicle Report', icon: Car },
              { id: 'kyc', label: 'KYC Report', icon: FileText }
            ].map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${reportType === type.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Report Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{currentReport.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-2 text-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exporting ? 'Exporting...' : 'CSV'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                onClick={handleEmail}
                className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
            </div>
          </div>
        </div>

        {/* Report Statistics */}
        <div className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {reportType === 'bookings' && (
              <>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentReport.stats.totalBookings.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-300">{currentReport.stats.completedBookings.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {currentReport.stats.totalBookings > 0 ? ((currentReport.stats.completedBookings / currentReport.stats.totalBookings) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-300">{currentReport.stats.cancelledBookings.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {currentReport.stats.totalBookings > 0 ? ((currentReport.stats.cancelledBookings / currentReport.stats.totalBookings) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{formatCurrency(currentReport.stats.totalRevenue)}</p>
                </div>
              </>
            )}

            {reportType === 'revenue' && (
              <>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(currentReport.stats.totalRevenue)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Platform Commission</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{formatCurrency(currentReport.stats.platformCommission)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {currentReport.stats.totalRevenue > 0 ? ((currentReport.stats.platformCommission / currentReport.stats.totalRevenue) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Owner Payout</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{formatCurrency(currentReport.stats.ownerPayout)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {currentReport.stats.totalRevenue > 0 ? ((currentReport.stats.ownerPayout / currentReport.stats.totalRevenue) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg. Revenue per Booking</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                    {currentReport.stats.totalBookings > 0 ? formatCurrency(currentReport.stats.totalRevenue / currentReport.stats.totalBookings) : 'Rs. 0'}
                  </p>
                </div>
              </>
            )}

            {reportType === 'commission' && (
              <>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Commission</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{formatCurrency(currentReport.stats.platformCommission)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Commission Rate</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">8%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Per booking</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg. Commission per Booking</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {currentReport.stats.totalBookings > 0 ? formatCurrency(currentReport.stats.platformCommission / currentReport.stats.totalBookings) : 'Rs. 0'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Bookings with Commission</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentReport.stats.totalBookings.toLocaleString()}</p>
                </div>
              </>
            )}

            {reportType === 'users' && (
              <>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentReport.stats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">New Users</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{currentReport.stats.newUsers.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{currentReport.stats.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {currentReport.stats.totalUsers > 0 ? ((currentReport.stats.activeUsers / currentReport.stats.totalUsers) * 100).toFixed(1) : 0}% active
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Verified KYC</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-300">{currentReport.stats.verifiedKyc.toLocaleString()}</p>
                </div>
              </>
            )}

            {reportType === 'vehicles' && (
              <>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Vehicles</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentReport.stats.totalVehicles.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active Vehicles</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-300">{currentReport.stats.activeVehicles.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg. Rating</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentReport.stats.averageRating.toFixed(1)}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Utilization Rate</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                    {currentReport.stats.totalVehicles > 0 ? ((currentReport.stats.activeVehicles / currentReport.stats.totalVehicles) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </>
            )}

            {reportType === 'kyc' && (
              <>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {(currentReport.stats.pendingKyc + currentReport.stats.verifiedKyc + currentReport.stats.rejectedKyc).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Verified</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-300">{currentReport.stats.verifiedKyc.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">{currentReport.stats.pendingKyc.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rejected</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-300">{currentReport.stats.rejectedKyc.toLocaleString()}</p>
                </div>
              </>
            )}
          </div>

          {/* Vehicle Types - Only for Vehicles report */}
          {reportType === 'vehicles' && currentReport.vehiclesByType && currentReport.vehiclesByType.length > 0 && (
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">Vehicle Distribution by Type</h3>
              <div className="space-y-4">
                {currentReport.vehiclesByType.map((type: VehicleType, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{type.type}</span>
                      <span className="text-gray-800 dark:text-gray-100 font-semibold">{type.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${Math.min(type.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{type.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue Breakdown by Source */}
          {(reportType === 'revenue' || reportType === 'commission') && currentReport.revenueBySource && (
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">Revenue Breakdown by Source</h3>
              <div className="space-y-4">
                {currentReport.revenueBySource.map((source: RevenueSource, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{source.source}</span>
                      <span className="text-gray-800 dark:text-gray-100 font-semibold">{formatCurrency(source.amount)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${source.source.includes('Commission') ? 'bg-emerald-500' :
                            source.source.includes('Insurance') ? 'bg-blue-500' :
                              'bg-purple-500'
                          }`}
                        style={{ width: `${Math.min(source.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{source.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Data Chart - FIXED */}
          {currentReport.monthlyData && currentReport.monthlyData.length > 0 && (
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {reportType === 'commission' ? 'Monthly Commission Trends' : 'Monthly Trends'}
              </h3>
              <div className="h-64 flex items-end space-x-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                {currentReport.monthlyData.map((item: MonthlyData, i: number) => {
                  const value = reportType === 'commission' ? item.commission :
                    reportType === 'revenue' ? item.revenue :
                      item.bookings;
                  const maxValue = getMaxValue(
                    currentReport.monthlyData,
                    reportType === 'commission' ? 'commission' :
                      reportType === 'revenue' ? 'revenue' :
                        'bookings'
                  );
                  const height = Math.max(getChartHeight(value, maxValue), 5);

                  const barColors: Record<string, string> = {
                    bookings: 'bg-purple-500 dark:bg-purple-400 hover:bg-purple-600 dark:hover:bg-purple-300',
                    revenue: 'bg-blue-500 dark:bg-blue-400 hover:bg-blue-600 dark:hover:bg-blue-300',
                    commission: 'bg-emerald-500 dark:bg-emerald-400 hover:bg-emerald-600 dark:hover:bg-emerald-300'
                  };

                  const barColor = reportType === 'commission' ? barColors.commission :
                    reportType === 'revenue' ? barColors.revenue :
                      barColors.bookings;

                  const displayValue = reportType === 'commission' ? formatCurrency(value) :
                    reportType === 'revenue' ? formatCurrency(value) :
                      value.toLocaleString();

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                        {displayValue}
                      </div>
                      <div
                        className={`w-full max-w-[40px] rounded-t transition-all duration-500 ${barColor}`}
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                        {item.month}
                      </div>
                      {reportType === 'revenue' && (
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">
                          ({item.bookings})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Monthly Data Table */}
          {currentReport.monthlyData && currentReport.monthlyData.length > 0 && (
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {reportType === 'commission' ? 'Monthly Commission Details' : 'Monthly Breakdown'}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Month</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                        {reportType === 'commission' ? 'Commission' : reportType === 'revenue' ? 'Revenue' : 'Bookings'}
                      </th>
                      {reportType === 'revenue' && (
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Commission</th>
                      )}
                      {reportType === 'revenue' && (
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Owner Payout</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {currentReport.monthlyData.map((item: MonthlyData, i: number) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{item.month}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 text-right">
                          {reportType === 'commission' ? formatCurrency(item.commission) :
                            reportType === 'revenue' ? formatCurrency(item.revenue) :
                              item.bookings.toLocaleString()}
                        </td>
                        {reportType === 'revenue' && (
                          <>
                            <td className="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-300 text-right">
                              {formatCurrency(item.commission)}
                            </td>
                            <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-300 text-right">
                              {formatCurrency(item.ownerPayout)}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Vehicles */}
          {currentReport.topVehicles && currentReport.topVehicles.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">Top Performing Vehicles</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Vehicle</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Bookings</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Revenue</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {currentReport.topVehicles.map((vehicle: TopVehicle, i: number) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">{vehicle.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-right">{vehicle.bookings.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 text-right">{formatCurrency(vehicle.revenue)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-right">{vehicle.rating.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}