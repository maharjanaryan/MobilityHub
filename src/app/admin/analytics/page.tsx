// app/admin/analytics/page.tsx
'use client';

import { useState } from 'react';
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
  ArrowDownRight
} from 'lucide-react';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('weekly');
  const [chartType, setChartType] = useState('revenue');

  // Mock data - replace with API calls
  const stats = {
    totalRevenue: 128450,
    revenueChange: 18.5,
    totalUsers: 8432,
    usersChange: 12.3,
    totalBookings: 18945,
    bookingsChange: 22.8,
    activeVehicles: 2845,
    vehiclesChange: 8.2,
    averageRating: 4.85,
    ratingChange: 0.3,
    completionRate: 94.2,
    completionChange: 2.1
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [28500, 31200, 29800, 34500, 38900, 42500, 46800, 51200, 54800, 58900, 62500, 68400]
  };

  const bookingsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [1245, 1389, 1567, 1789]
  };

  const topVehicles = [
    { id: 1, name: 'Tesla Model 3', bookings: 245, revenue: 21805, rating: 4.9 },
    { id: 2, name: 'BMW X5', bookings: 189, revenue: 22680, rating: 4.8 },
    { id: 3, name: 'Honda CR-V', bookings: 167, revenue: 10855, rating: 4.7 },
    { id: 4, name: 'Toyota Camry', bookings: 145, revenue: 7975, rating: 4.6 },
    { id: 5, name: 'Ford Mustang', bookings: 98, revenue: 14700, rating: 4.9 }
  ];

  const topUsers = [
    { id: 1, name: 'John Doe', bookings: 12, spent: 1240, rating: 4.9 },
    { id: 2, name: 'Sarah Chen', bookings: 8, spent: 960, rating: 4.8 },
    { id: 3, name: 'Mike Ross', bookings: 7, spent: 875, rating: 4.7 },
    { id: 4, name: 'Emily Watson', bookings: 6, spent: 720, rating: 4.9 },
    { id: 5, name: 'David Kim', bookings: 5, spent: 625, rating: 4.6 }
  ];

  const locationData = [
    { city: 'Los Angeles', bookings: 3420, revenue: 410400 },
    { city: 'Houston', bookings: 2890, revenue: 346800 },
    { city: 'Chicago', bookings: 2560, revenue: 307200 },
    { city: 'Philadelphia', bookings: 2340, revenue: 280800 },
    { city: 'Phoenix', bookings: 1890, revenue: 226800 }
  ];

  const getChartHeight = (value: number, max: number) => {
    return (value / max) * 100;
  };

  const maxRevenue = Math.max(...revenueData.values);
  const maxBooking = Math.max(...bookingsData.values);

  return (
    <>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive platform performance metrics and insights</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Total Revenue</div>
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">${stats.totalRevenue.toLocaleString()}</div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-600 ml-1">{stats.revenueChange}%</span>
            <span className="text-xs text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Total Users</div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.totalUsers.toLocaleString()}</div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-600 ml-1">{stats.usersChange}%</span>
            <span className="text-xs text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Total Bookings</div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.totalBookings.toLocaleString()}</div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-600 ml-1">{stats.bookingsChange}%</span>
            <span className="text-xs text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Active Vehicles</div>
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.activeVehicles.toLocaleString()}</div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-600 ml-1">{stats.vehiclesChange}%</span>
            <span className="text-xs text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Avg. Rating</div>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.averageRating}</div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-600 ml-1">{stats.ratingChange}</span>
            <span className="text-xs text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Completion Rate</div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.completionRate}%</div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-600 ml-1">{stats.completionChange}%</span>
            <span className="text-xs text-gray-500 ml-2">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Revenue Overview</h2>
              <p className="text-sm text-gray-500 mt-1">Monthly revenue trends</p>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="h-64 flex items-end space-x-2">
            {revenueData.values.map((value, i) => {
              const height = getChartHeight(value, maxRevenue);
              return (
                <div key={i} className="flex-1 group">
                  <div className="relative h-full flex flex-col justify-end">
                    <div
                      className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-lg transition-all duration-300 group-hover:from-emerald-600 group-hover:to-emerald-500"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-500">
            {revenueData.labels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>

        {/* Bookings Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Booking Trends</h2>
              <p className="text-sm text-gray-500 mt-1">Weekly booking volume</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType('bookings')}
                className={`p-2 rounded-lg transition-colors ${chartType === 'bookings' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('revenue')}
                className={`p-2 rounded-lg transition-colors ${chartType === 'revenue' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LineChart className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="h-64 flex items-end space-x-4">
            {bookingsData.values.map((value, i) => {
              const height = getChartHeight(value, maxBooking);
              return (
                <div key={i} className="flex-1 group">
                  <div className="relative h-full flex flex-col justify-end">
                    <div
                      className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-lg transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-500"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-500">
            {bookingsData.labels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Vehicles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Top Performing Vehicles</h2>
            <Car className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topVehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{vehicle.name}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">{vehicle.bookings} bookings</span>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">{vehicle.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600">${vehicle.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Top Customers</h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-700 font-semibold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{user.bookings} bookings</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 ml-1">{user.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">${user.spent}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Top Locations</h2>
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {locationData.map((location, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{location.city}</span>
                  <span className="text-sm font-semibold text-emerald-600">${location.revenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(location.bookings / locationData[0].bookings) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{location.bookings} bookings</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Insights */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Platform Insights</h2>
            <Zap className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Avg. Booking Value</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xl font-bold text-gray-800">$124</p>
                <p className="text-xs text-green-600 mt-1">↑ 5.2%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Avg. Booking Days</span>
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xl font-bold text-gray-800">4.2 days</p>
                <p className="text-xs text-green-600 mt-1">↑ 0.8%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Customer Satisfaction</span>
                  <Award className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-xl font-bold text-gray-800">94.5%</p>
                <p className="text-xs text-green-600 mt-1">↑ 2.1%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Repeat Customers</span>
                  <UserCheck className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-xl font-bold text-gray-800">68.3%</p>
                <p className="text-xs text-green-600 mt-1">↑ 4.5%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Indicators */}
      <div className="mt-8 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Platform Growth Summary</h3>
            <p className="text-emerald-100 text-sm mt-1">Year-over-year performance</p>
          </div>
          <Zap className="w-8 h-8 text-white/80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-emerald-100 text-sm">User Growth</p>
            <p className="text-2xl font-bold mt-1">+42.5%</p>
            <p className="text-xs text-emerald-100 mt-1">vs previous year</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm">Revenue Growth</p>
            <p className="text-2xl font-bold mt-1">+38.2%</p>
            <p className="text-xs text-emerald-100 mt-1">vs previous year</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm">Booking Growth</p>
            <p className="text-2xl font-bold mt-1">+51.8%</p>
            <p className="text-xs text-emerald-100 mt-1">vs previous year</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm">Vehicle Expansion</p>
            <p className="text-2xl font-bold mt-1">+28.3%</p>
            <p className="text-xs text-emerald-100 mt-1">vs previous year</p>
          </div>
        </div>
      </div>
    </>
  );
}