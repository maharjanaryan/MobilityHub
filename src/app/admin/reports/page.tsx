// app/admin/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Car,
  DollarSign,
  CheckCircle,
  XCircle,
  Printer,
  Mail,
  RefreshCw,
  Star,
  Clock,
  AlertCircle,
  Loader2,
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart3,
  TrendingUp,
  Users,
  Percent
} from 'lucide-react';

// Admin Earnings Types from backend
interface AdminEarningsSummary {
  totalEarnings: number;
  currentMonthEarnings: number;
  currentWeekEarnings: number;
  pendingPayout: number;
  totalWithdrawn: number;
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
  availableBalance: number;
}

interface MonthlyCommission {
  month: string;
  year: number;
  earnings: number;
  bookingCount: number;
}

interface ReportStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  platformCommission: number;
  ownerPayout: number;
  totalVehicles: number;
  activeVehicles: number;
  averageRating: number;
}

interface ReportData {
  title: string;
  stats: ReportStats;
  monthlyData: MonthlyCommission[];
  revenueBySource: { source: string; amount: number; percentage: number }[];
  topVehicles: { id: number; name: string; bookings: number; revenue: number; rating: number }[];
  bookingsByStatus: { status: string; count: number; percentage: number }[];
  vehiclesByType: { type: string; count: number; percentage: number }[];
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('revenue');
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
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

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
      let adminEarningsSummary: AdminEarningsSummary | null = null;
      let monthlyCommissions: MonthlyCommission[] = [];
      let bookings: any[] = [];
      let vehicles: any[] = [];
      let stats: any = {};

      const summaryRes = await fetch('http://localhost:8080/api/earnings/admin/commission', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (summaryRes.ok) {
        adminEarningsSummary = await summaryRes.json();
        console.log('Admin Earnings Summary:', adminEarningsSummary);
      }

      const monthlyRes = await fetch(
        `http://localhost:8080/api/earnings/admin/monthly?year=${new Date().getFullYear()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (monthlyRes.ok) {
        monthlyCommissions = await monthlyRes.json();
      }

      const bookingsRes = await fetch(
        `http://localhost:8080/api/bookings/admin/bookings?page=0&size=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        bookings = bookingsData.content || [];
      }

      const vehiclesRes = await fetch('http://localhost:8080/api/vehicles/all?page=0&size=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (vehiclesRes.ok) {
        const vehicleData = await vehiclesRes.json();
        vehicles = vehicleData.content || [];
      }

      const statsRes = await fetch('http://localhost:8080/api/bookings/admin/bookings/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        stats = await statsRes.json();
      }

      const processedData = processReportData(
        bookings,
        vehicles,
        stats,
        adminEarningsSummary,
        monthlyCommissions
      );
      setReportData(processedData);

    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (
    bookings: any[],
    vehicles: any[],
    stats: any,
    adminSummary: AdminEarningsSummary | null,
    monthlyData: MonthlyCommission[]
  ): ReportData => {
    const totalBookings = adminSummary?.totalBookings || bookings.length;
    const completedBookings = bookings.filter(b => b.bookingStatus === 'COMPLETED').length;
    const cancelledBookings = bookings.filter(b =>
      b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'REJECTED'
    ).length;

    const totalCommission = adminSummary?.totalEarnings || 0;
    const totalRevenue = bookings
      .filter(b => b.paymentStatus === 'COMPLETED')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const revenueBySource = [
      {
        source: 'Platform Commission',
        amount: totalCommission,
        percentage: totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0
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

    const topVehicles = Array.from(vehicleStats.entries())
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

    const bookingsByStatus = Array.from(statusMap.entries())
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

    const vehiclesByType = Array.from(vehicleTypeMap.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: vehicles.length > 0 ? (count / vehicles.length) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    return {
      title: getReportTitle(reportType),
      stats: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        platformCommission: totalCommission,
        ownerPayout: 0,
        totalVehicles: vehicles.length,
        activeVehicles: vehicles.filter(v => v.isAvailable).length,
        averageRating: vehicles.reduce((sum, v) => sum + (v.averageRating || 0), 0) / (vehicles.length || 1)
      },
      monthlyData,
      revenueBySource,
      topVehicles,
      bookingsByStatus,
      vehiclesByType
    };
  };

  const getReportTitle = (type: string): string => {
    const titles: Record<string, string> = {
      revenue: 'Revenue Report',
      bookings: 'Booking Report',
      vehicles: 'Vehicle Report'
    };
    return titles[type] || 'Report';
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange, selectedPeriod]);

  const handleGenerateReport = () => {
    fetchReportData();
  };

  const handleExport = async (format: string) => {
    if (!reportData) return;
    setExporting(true);

    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:8080/api/earnings/admin/export?startDate=${startDate}&endDate=${endDate}`,
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
    return Math.max(...data.map(item => item[key] || 0), 1);
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
            <p className="text-gray-600 dark:text-gray-300">Generate and export platform reports</p>
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
              { id: 'revenue', label: 'Revenue Report', icon: DollarSign },
              { id: 'bookings', label: 'Booking Report', icon: Calendar },
              { id: 'vehicles', label: 'Vehicle Report', icon: Car }
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
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
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
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {reportType === 'revenue' && (
              <>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {formatCurrency(currentReport.stats.platformCommission || 0)}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Platform Commission</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">This Month Revenue</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {currentReport.monthlyData.length > 0
                      ? formatCurrency(currentReport.monthlyData[currentReport.monthlyData.length - 1]?.earnings || 0)
                      : 'Rs. 0'}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Current Month</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg. Revenue per Booking</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {currentReport.stats.totalBookings > 0
                      ? formatCurrency(currentReport.stats.platformCommission / currentReport.stats.totalBookings)
                      : 'Rs. 0'}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Per Booking</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {currentReport.stats.totalBookings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
                </div>
              </>
            )}

            {reportType === 'bookings' && (
              <>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentReport.stats.totalBookings.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentReport.stats.completedBookings.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    {currentReport.stats.totalBookings > 0 ? ((currentReport.stats.completedBookings / currentReport.stats.totalBookings) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentReport.stats.cancelledBookings.toLocaleString()}</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {currentReport.stats.totalBookings > 0 ? ((currentReport.stats.cancelledBookings / currentReport.stats.totalBookings) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(currentReport.stats.totalRevenue)}</p>
                </div>
              </>
            )}

            {reportType === 'vehicles' && (
              <>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Vehicles</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentReport.stats.totalVehicles.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Vehicles</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentReport.stats.activeVehicles.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    {currentReport.stats.totalVehicles > 0 ? ((currentReport.stats.activeVehicles / currentReport.stats.totalVehicles) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg. Rating</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentReport.stats.averageRating.toFixed(1)}</p>
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(currentReport.stats.totalRevenue)}</p>
                </div>
              </>
            )}
          </div>

          {/* Revenue Breakdown */}
          {reportType === 'revenue' && currentReport.revenueBySource && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Revenue Breakdown</h3>
              <div className="space-y-3">
                {currentReport.revenueBySource.map((source, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{source.source}</span>
                      <span className="text-gray-800 dark:text-gray-100 font-semibold">{formatCurrency(source.amount)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.min(source.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{source.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Revenue Bar Chart - Revenue Report */}
          {reportType === 'revenue' && currentReport.monthlyData && currentReport.monthlyData.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Monthly Revenue</h3>
                <div className="flex gap-1">
                  {["3months", "6months", "12months"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-1 text-xs rounded-md transition ${selectedPeriod === period
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                    >
                      {period === "3months" ? "3M" : period === "6months" ? "6M" : "12M"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="h-56 flex items-end space-x-4">
                  {currentReport.monthlyData.map((item, i) => {
                    const maxValue = getMaxValue(currentReport.monthlyData, 'earnings');
                    const height = Math.max(getChartHeight(item.earnings, maxValue), 5);

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatCurrency(item.earnings)}
                        </div>
                        <div
                          className="w-full max-w-[40px] rounded-t transition-all duration-500 bg-emerald-500 hover:bg-emerald-600 cursor-pointer relative"
                          style={{ height: `${height}%`, minHeight: '4px' }}
                        >
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {formatCurrency(item.earnings)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                          {item.month}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">
                          {item.bookingCount} bookings
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Y-axis labels */}
                <div className="flex justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
                  <span>0</span>
                  <span>
                    {formatCurrency(getMaxValue(currentReport.monthlyData, 'earnings'))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Revenue Table */}
          {reportType === 'revenue' && currentReport.monthlyData && currentReport.monthlyData.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Monthly Revenue Details</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Month</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Revenue</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Bookings</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Avg. per Booking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {currentReport.monthlyData.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{item.month}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400 text-right">
                          {formatCurrency(item.earnings)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-right">
                          {item.bookingCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-right">
                          {item.bookingCount > 0 ? formatCurrency(item.earnings / item.bookingCount) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Performing Vehicles */}
          {currentReport.topVehicles && currentReport.topVehicles.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Top Performing Vehicles</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">#</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Vehicle</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Bookings</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Revenue</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {currentReport.topVehicles.map((vehicle, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <td className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                          #{i + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                          {vehicle.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-right">
                          {vehicle.bookings}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400 text-right">
                          {formatCurrency(vehicle.revenue)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            {vehicle.rating.toFixed(1)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Booking Status Distribution - All Green */}
          {reportType === 'bookings' && currentReport.bookingsByStatus && currentReport.bookingsByStatus.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Booking Status Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentReport.bookingsByStatus.map((status, i) => {
                  const shade = 100 - (i * 8);
                  const bgColor = `bg-emerald-${Math.min(shade, 500)}`;

                  return (
                    <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{status.status}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{status.count}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{status.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(status.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Monthly Booking Trends - For Bookings and Vehicles */}
          {(reportType === 'bookings' || reportType === 'vehicles') && currentReport.monthlyData && currentReport.monthlyData.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Monthly Booking Trends
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="h-56 flex items-end space-x-4">
                  {currentReport.monthlyData.map((item, i) => {
                    const maxValue = getMaxValue(currentReport.monthlyData, 'bookingCount');
                    const height = Math.max(getChartHeight(item.bookingCount, maxValue), 5);

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.bookingCount}
                        </div>
                        <div
                          className="w-full max-w-[40px] rounded-t transition-all duration-500 bg-purple-500 hover:bg-purple-600 cursor-pointer relative"
                          style={{ height: `${height}%`, minHeight: '4px' }}
                        >
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {item.bookingCount}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                          {item.month}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
                  <span>0</span>
                  <span>{getMaxValue(currentReport.monthlyData, 'bookingCount')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Types - Vehicle Report */}
          {reportType === 'vehicles' && currentReport.vehiclesByType && currentReport.vehiclesByType.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Vehicle Distribution by Type</h3>
              <div className="space-y-3">
                {currentReport.vehiclesByType.map((type, i) => {
                  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1'];
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{type.type}</span>
                        <span className="text-gray-800 dark:text-gray-100 font-semibold">{type.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(type.percentage, 100)}%`,
                            backgroundColor: colors[i % colors.length]
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{type.percentage.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}