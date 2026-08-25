"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, BookOpen,
  Star, Download, Filter, ChevronDown, ChevronUp, Loader2,
  Home, Car, Wallet, Clock, CheckCircle, XCircle,
  BarChart3, LineChart, PieChart, FileText, Printer
} from "lucide-react";
import HomeHeader from "../home/HomeHeader";
import Footer from "../component/Footer";

// Types
interface EarningsSummary {
  totalEarnings: number;
  currentMonthEarnings: number;
  currentWeekEarnings: number;
  pendingPayout: number;
  totalWithdrawn: number;
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
}

interface Transaction {
  id: number;
  bookingId: number;
  bookingReference: string;
  vehicleName: string;
  renterName: string;
  amount: number;
  type: string;
  status: string;
  transactionDate: string;
  description: string;
}

interface MonthlyEarning {
  month: string;
  year: number;
  earnings: number;
  bookingCount: number;
}

interface VehicleEarning {
  vehicleId: number;
  vehicleName: string;
  brand: string;
  model: string;
  totalEarnings: number;
  totalBookings: number;
  averagePerBooking: number;
}

interface ChartData {
  labels: string[];
  earnings: number[];
  counts: number[];
}

export default function OwnerEarningsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([]);
  const [vehicleEarnings, setVehicleEarnings] = useState<VehicleEarning[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("6months");

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken") || localStorage.getItem("token");
    }
    return null;
  };

  const fetchEarningsData = async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
      router.push("/signin");
      return;
    }

    try {
      // Fetch summary
      const summaryRes = await fetch("http://localhost:8080/api/earnings/summary", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (summaryRes.ok) {
        setSummary(await summaryRes.json());
      }

      // Fetch transactions
      const transactionRes = await fetch(
        `http://localhost:8080/api/earnings/transactions?page=0&size=50` +
        (filterType ? `&type=${filterType}` : "") +
        (filterStatus ? `&status=${filterStatus}` : "") +
        (dateRange.start ? `&startDate=${dateRange.start}` : "") +
        (dateRange.end ? `&endDate=${dateRange.end}` : ""),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (transactionRes.ok) {
        const data = await transactionRes.json();
        setTransactions(data.content || []);
      }

      // Fetch monthly earnings
      const monthlyRes = await fetch(
        `http://localhost:8080/api/earnings/monthly?year=${new Date().getFullYear()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (monthlyRes.ok) {
        setMonthlyEarnings(await monthlyRes.json());
      }

      // Fetch vehicle earnings
      const vehicleRes = await fetch("http://localhost:8080/api/earnings/vehicles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (vehicleRes.ok) {
        setVehicleEarnings(await vehicleRes.json());
      }

      // Fetch chart data
      const chartRes = await fetch(
        `http://localhost:8080/api/earnings/chart-data?period=${selectedPeriod}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (chartRes.ok) {
        setChartData(await chartRes.json());
      }

    } catch (err) {
      console.error("Error fetching earnings data:", err);
      setError("Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, [filterType, filterStatus, dateRange, selectedPeriod]);

  const handleExport = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const url = `http://localhost:8080/api/earnings/export` +
        (dateRange.start ? `?startDate=${dateRange.start}` : "") +
        (dateRange.start && dateRange.end ? `&endDate=${dateRange.end}` : "");

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `earnings_export_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (err) {
      console.error("Error exporting earnings:", err);
      alert("Failed to export earnings");
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      COMPLETED: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
      PENDING: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
      REFUNDED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    };
    const icons: Record<string, React.ReactNode> = {
      COMPLETED: <CheckCircle className="w-3 h-3" />,
      PENDING: <Clock className="w-3 h-3" />,
      REFUNDED: <XCircle className="w-3 h-3" />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || ""}`}>
        {icons[status]} {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <HomeHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <HomeHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Earnings Report</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track your rental income and performance</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={fetchEarningsData}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2"
            >
              <Loader2 className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(summary.totalEarnings)}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(summary.currentMonthEarnings)}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Payout</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatCurrency(summary.pendingPayout)}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summary.totalBookings}</p>
                  <p className="text-xs text-gray-400">{summary.completedBookings} completed</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Stats */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{summary.averageRating.toFixed(1)} ⭐</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Withdrawn</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(summary.totalWithdrawn)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(summary.currentWeekEarnings)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Filters</span>
              {(filterType || filterStatus || dateRange.start || dateRange.end) && (
                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Types</option>
                  <option value="RENTAL">Rental</option>
                  <option value="COMMISSION">Commission</option>
                  <option value="INSURANCE">Insurance</option>
                  <option value="WITHDRAWAL">Withdrawal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Chart Section */}
        {chartData && chartData.labels.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Earnings Overview</h3>
              </div>
              <div className="flex gap-2">
                {["3months", "6months", "12months"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 text-xs rounded-lg transition ${selectedPeriod === period
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                  >
                    {period === "3months" ? "3M" : period === "6months" ? "6M" : "12M"}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 flex items-end gap-2">
              {chartData.labels.map((label, index) => {
                const maxEarnings = Math.max(...chartData.earnings, 1);
                const height = (chartData.earnings[index] / maxEarnings) * 100;
                const barColor = chartData.earnings[index] > 0 ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600";

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {chartData.earnings[index] > 0 ? `Rs.${Math.round(chartData.earnings[index])}` : ""}
                    </div>
                    <div
                      className={`w-full max-w-[40px] rounded-t transition-all duration-500 ${barColor}`}
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate w-full text-center">
                      {label}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500">
                      ({chartData.counts[index]})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Monthly Earnings Table */}
        {monthlyEarnings.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Monthly Earnings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Month</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Earnings</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Bookings</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Avg. per Booking</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyEarnings.map((month, index) => (
                    <tr key={index} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{month.month} {month.year}</td>
                      <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatCurrency(month.earnings)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">{month.bookingCount}</td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        {month.bookingCount > 0 ? formatCurrency(month.earnings / month.bookingCount) : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vehicle Earnings */}
        {vehicleEarnings.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Vehicle Performance</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicleEarnings.map((vehicle) => (
                <div key={vehicle.vehicleId} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{vehicle.vehicleName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.totalBookings} bookings</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                    {formatCurrency(vehicle.totalEarnings)}
                  </p>
                  <p className="text-xs text-gray-400">Avg: {formatCurrency(vehicle.averagePerBooking)} per booking</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Transaction History</h3>
            <span className="text-sm text-gray-400 ml-auto">{transactions.length} transactions</span>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Vehicle/Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Renter</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                        {transaction.vehicleName || transaction.description || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {transaction.renterName || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${transaction.type === "RENTAL" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" :
                          transaction.type === "WITHDRAWAL" ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300" :
                            "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${transaction.type === "WITHDRAWAL" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                        }`}>
                        {transaction.type === "WITHDRAWAL" ? "-" : ""}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(transaction.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}