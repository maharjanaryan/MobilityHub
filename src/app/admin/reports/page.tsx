// app/admin/reports/page.tsx
'use client';

import { useState } from 'react';
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
  Star
} from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('bookings');
  const [dateRange, setDateRange] = useState('monthly');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');

  // Mock data - replace with API calls
  const reports: any = {
    bookings: {
      title: 'Booking Report',
      totalBookings: 18945,
      completedBookings: 17892,
      cancelledBookings: 1053,
      averageBookingValue: 124,
      totalRevenue: 2348940,
      bookingsByStatus: [
        { status: 'Completed', count: 17892, percentage: 94.4 },
        { status: 'Cancelled', count: 1053, percentage: 5.6 }
      ],
      monthlyData: [
        { month: 'Jan', bookings: 1245, revenue: 154380 },
        { month: 'Feb', bookings: 1389, revenue: 172236 },
        { month: 'Mar', bookings: 1567, revenue: 194308 },
        { month: 'Apr', bookings: 1789, revenue: 221836 },
        { month: 'May', bookings: 1890, revenue: 234360 },
        { month: 'Jun', bookings: 2123, revenue: 263252 }
      ]
    },
    revenue: {
      title: 'Revenue Report',
      totalRevenue: 2348940,
      platformCommission: 352341,
      ownerPayout: 1996599,
      taxAmount: 117447,
      averageDailyRevenue: 12896,
      revenueBySource: [
        { source: 'Booking Commission', amount: 352341, percentage: 15 },
        { source: 'Service Fee', amount: 23489, percentage: 1 },
        { source: 'Late Fees', amount: 11745, percentage: 0.5 }
      ],
      monthlyRevenue: [
        { month: 'Jan', amount: 154380, growth: 5.2 },
        { month: 'Feb', amount: 172236, growth: 11.6 },
        { month: 'Mar', amount: 194308, growth: 12.8 },
        { month: 'Apr', amount: 221836, growth: 14.2 },
        { month: 'May', amount: 234360, growth: 5.6 },
        { month: 'Jun', amount: 263252, growth: 12.3 }
      ]
    },
    users: {
      title: 'User Report',
      totalUsers: 8432,
      newUsers: 1256,
      activeUsers: 6845,
      verifiedUsers: 7890,
      usersByRole: [
        { role: 'Regular Users', count: 6543, percentage: 77.6 },
        { role: 'Vehicle Owners', count: 1889, percentage: 22.4 }
      ],
      userGrowth: [
        { month: 'Jan', newUsers: 189, totalUsers: 5432 },
        { month: 'Feb', newUsers: 234, totalUsers: 5666 },
        { month: 'Mar', newUsers: 267, totalUsers: 5933 },
        { month: 'Apr', newUsers: 298, totalUsers: 6231 },
        { month: 'May', newUsers: 312, totalUsers: 6543 },
        { month: 'Jun', newUsers: 345, totalUsers: 6888 }
      ]
    },
    vehicles: {
      title: 'Vehicle Report',
      totalVehicles: 2845,
      activeVehicles: 2678,
      inactiveVehicles: 167,
      averageRating: 4.85,
      vehiclesByType: [
        { type: 'SUV', count: 1123, percentage: 39.5 },
        { type: 'Sedan', count: 987, percentage: 34.7 },
        { type: 'Luxury', count: 456, percentage: 16.0 },
        { type: 'Electric', count: 279, percentage: 9.8 }
      ],
      topVehicles: [
        { name: 'Tesla Model 3', bookings: 245, revenue: 21805, rating: 4.9 },
        { name: 'BMW X5', bookings: 189, revenue: 22680, rating: 4.8 },
        { name: 'Honda CR-V', bookings: 167, revenue: 10855, rating: 4.7 }
      ]
    },
    kyc: {
      title: 'KYC Report',
      totalSubmissions: 2345,
      verified: 1890,
      pending: 345,
      rejected: 110,
      averageProcessingTime: 2.5,
      monthlySubmissions: [
        { month: 'Jan', submitted: 345, verified: 278, rejected: 23 },
        { month: 'Feb', submitted: 389, verified: 312, rejected: 28 },
        { month: 'Mar', submitted: 412, verified: 334, rejected: 31 },
        { month: 'Apr', submitted: 456, verified: 378, rejected: 35 },
        { month: 'May', submitted: 478, verified: 392, rejected: 38 },
        { month: 'Jun', submitted: 265, verified: 196, rejected: 25 }
      ]
    }
  };

  const currentReport = reports[reportType];

  const getChartHeight = (value: number, max: number) => {
    return (value / max) * 100;
  };

  const getMaxValue = (data: any[], key: string) => {
    return Math.max(...data.map(item => item[key]));
  };

  const handleGenerateReport = () => {
    alert(`Report generated for ${dateRange} period from ${startDate} to ${endDate}`);
  };

  const handleExport = (format: string) => {
    alert(`Exporting ${currentReport.title} as ${format.toUpperCase()}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    alert(`Sending ${currentReport.title} via email`);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Reports</h1>
            <p className="text-gray-600">Generate and export comprehensive platform reports</p>
          </div>
          <div className="flex gap-3">
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'bookings', label: 'Booking Report', icon: Calendar },
              { id: 'revenue', label: 'Revenue Report', icon: DollarSign },
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
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-gray-600 hover:bg-gray-50'
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Report Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{currentReport.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('pdf')}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                onClick={handleEmail}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2 text-sm"
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
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-800">{currentReport.totalBookings.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{currentReport.completedBookings.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{currentReport.bookingsByStatus[0].percentage}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{currentReport.cancelledBookings.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{currentReport.bookingsByStatus[1].percentage}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Avg. Booking Value</p>
                  <p className="text-2xl font-bold text-emerald-600">${currentReport.averageBookingValue}</p>
                </div>
              </>
            )}

            {reportType === 'revenue' && (
              <>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">${currentReport.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Platform Commission</p>
                  <p className="text-2xl font-bold text-emerald-600">${currentReport.platformCommission.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{currentReport.revenueBySource[0].percentage}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Owner Payout</p>
                  <p className="text-2xl font-bold text-blue-600">${currentReport.ownerPayout.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Avg. Daily Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">${currentReport.averageDailyRevenue.toLocaleString()}</p>
                </div>
              </>
            )}

            {reportType === 'users' && (
              <>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-gray-800">{currentReport.totalUsers.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">New Users</p>
                  <p className="text-2xl font-bold text-emerald-600">{currentReport.newUsers.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-blue-600">{currentReport.activeUsers.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Verified KYC</p>
                  <p className="text-2xl font-bold text-green-600">{currentReport.verifiedUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{((currentReport.verifiedUsers / currentReport.totalUsers) * 100).toFixed(1)}%</p>
                </div>
              </>
            )}

            {reportType === 'vehicles' && (
              <>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Total Vehicles</p>
                  <p className="text-2xl font-bold text-gray-800">{currentReport.totalVehicles.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Active Vehicles</p>
                  <p className="text-2xl font-bold text-green-600">{currentReport.activeVehicles.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Avg. Rating</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <p className="text-2xl font-bold text-gray-800">{currentReport.averageRating}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Utilization Rate</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {((currentReport.activeVehicles / currentReport.totalVehicles) * 100).toFixed(1)}%
                  </p>
                </div>
              </>
            )}

            {reportType === 'kyc' && (
              <>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-800">{currentReport.totalSubmissions.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Verified</p>
                  <p className="text-2xl font-bold text-green-600">{currentReport.verified.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{((currentReport.verified / currentReport.totalSubmissions) * 100).toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{currentReport.pending.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Avg. Processing Time</p>
                  <p className="text-2xl font-bold text-blue-600">{currentReport.averageProcessingTime} days</p>
                </div>
              </>
            )}
          </div>

          {/* Charts and Tables */}
          {reportType === 'bookings' && currentReport.monthlyData && (
            <>
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Monthly Booking Trends</h3>
                <div className="h-64 flex items-end space-x-4">
                  {currentReport.monthlyData.map((item: any, i: number) => {
                    const maxBookings = getMaxValue(currentReport.monthlyData, 'bookings');
                    const height = getChartHeight(item.bookings, maxBookings);
                    return (
                      <div key={i} className="flex-1 group">
                        <div className="relative h-full flex flex-col justify-end">
                          <div
                            className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-lg transition-all duration-300 group-hover:from-emerald-600 group-hover:to-emerald-500"
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {item.bookings.toLocaleString()} bookings
                            </div>
                          </div>
                          <p className="text-center text-xs text-gray-500 mt-2">{item.month}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-4">Monthly Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Month</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Bookings</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentReport.monthlyData.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800">{item.month}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.bookings.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">${item.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {reportType === 'revenue' && currentReport.monthlyRevenue && (
            <>
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Monthly Revenue Trends</h3>
                <div className="h-64 flex items-end space-x-4">
                  {currentReport.monthlyRevenue.map((item: any, i: number) => {
                    const maxRevenue = getMaxValue(currentReport.monthlyRevenue, 'amount');
                    const height = getChartHeight(item.amount, maxRevenue);
                    return (
                      <div key={i} className="flex-1 group">
                        <div className="relative h-full flex flex-col justify-end">
                          <div
                            className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-lg transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-500"
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              ${item.amount.toLocaleString()}
                            </div>
                          </div>
                          <p className="text-center text-xs text-gray-500 mt-2">{item.month}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Revenue Breakdown by Source</h3>
                <div className="space-y-4">
                  {currentReport.revenueBySource.map((source: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{source.source}</span>
                        <span className="text-gray-800 font-semibold">${source.amount.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-4">Monthly Revenue Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Month</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Revenue</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Growth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentReport.monthlyRevenue.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800">{item.month}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">${item.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-green-600 text-right">+{item.growth}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {reportType === 'users' && currentReport.userGrowth && (
            <>
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-800 mb-4">User Growth Trends</h3>
                <div className="h-64 flex items-end space-x-4">
                  {currentReport.userGrowth.map((item: any, i: number) => {
                    const maxUsers = getMaxValue(currentReport.userGrowth, 'totalUsers');
                    const height = getChartHeight(item.totalUsers, maxUsers);
                    return (
                      <div key={i} className="flex-1 group">
                        <div className="relative h-full flex flex-col justify-end">
                          <div
                            className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-lg transition-all duration-300 group-hover:from-purple-600 group-hover:to-purple-500"
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {item.totalUsers.toLocaleString()} users
                            </div>
                          </div>
                          <p className="text-center text-xs text-gray-500 mt-2">{item.month}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Users by Role</h3>
                <div className="space-y-4">
                  {currentReport.usersByRole.map((role: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{role.role}</span>
                        <span className="text-gray-800 font-semibold">{role.count.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${role.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-4">Monthly User Registration</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Month</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">New Users</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Total Users</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentReport.userGrowth.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800">{item.month}</td>
                          <td className="px-4 py-3 text-sm text-green-600 text-right">+{item.newUsers.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">{item.totalUsers.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {reportType === 'vehicles' && currentReport.vehiclesByType && (
            <>
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Vehicle Distribution by Type</h3>
                <div className="space-y-4">
                  {currentReport.vehiclesByType.map((type: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{type.type}</span>
                        <span className="text-gray-800 font-semibold">{type.count.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${type.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-4">Top Performing Vehicles</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Vehicle</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Bookings</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Revenue</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentReport.topVehicles.map((vehicle: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{vehicle.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{vehicle.bookings.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">${vehicle.revenue.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{vehicle.rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {reportType === 'kyc' && currentReport.monthlySubmissions && (
            <>
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-800 mb-4">KYC Submission Trends</h3>
                <div className="h-64 flex items-end space-x-4">
                  {currentReport.monthlySubmissions.map((item: any, i: number) => {
                    const maxSubmissions = getMaxValue(currentReport.monthlySubmissions, 'submitted');
                    const height = getChartHeight(item.submitted, maxSubmissions);
                    return (
                      <div key={i} className="flex-1 group">
                        <div className="relative h-full flex flex-col justify-end">
                          <div
                            className="bg-gradient-to-t from-amber-500 to-amber-400 rounded-lg transition-all duration-300 group-hover:from-amber-600 group-hover:to-amber-500"
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {item.submitted.toLocaleString()} submissions
                            </div>
                          </div>
                          <p className="text-center text-xs text-gray-500 mt-2">{item.month}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-4">Monthly KYC Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Month</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Submitted</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Verified</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Rejected</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentReport.monthlySubmissions.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800">{item.month}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.submitted.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-green-600 text-right">{item.verified.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-red-600 text-right">{item.rejected.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">
                            {((item.verified / item.submitted) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}