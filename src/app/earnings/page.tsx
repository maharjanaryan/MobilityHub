"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../component/Footer";
import HomeHeader from "../home/HomeHeader";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  Car,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface EarningsEntry {
  id: number;
  vehicle: string;
  date: string; // ISO string
  amount: number; // in Rs
  tripId?: string;
  distance?: number; // in km
}

// Enhanced static data with more entries for better visualization
const staticEarnings: EarningsEntry[] = [
  { id: 1, vehicle: "Toyota Prius", date: "2024-01-15", amount: 1500, tripId: "TRP-001", distance: 45 },
  { id: 2, vehicle: "Honda Civic", date: "2024-01-18", amount: 1800, tripId: "TRP-002", distance: 52 },
  { id: 3, vehicle: "Tesla Model 3", date: "2024-01-20", amount: 2500, tripId: "TRP-003", distance: 68 },
  { id: 4, vehicle: "Toyota Prius", date: "2024-01-22", amount: 1200, tripId: "TRP-004", distance: 38 },
  { id: 5, vehicle: "Honda Civic", date: "2024-01-25", amount: 2100, tripId: "TRP-005", distance: 59 },
  { id: 6, vehicle: "Tesla Model 3", date: "2024-01-28", amount: 3200, tripId: "TRP-006", distance: 85 },
  { id: 7, vehicle: "Toyota Prius", date: "2024-02-01", amount: 1700, tripId: "TRP-007", distance: 48 },
  { id: 8, vehicle: "Honda Civic", date: "2024-02-03", amount: 1950, tripId: "TRP-008", distance: 55 },
];

// Simple bar chart component
const SimpleBarChart = ({ data }: { data: { label: string; amount: number; color: string }[] }) => {
  const maxAmount = Math.max(...data.map(d => d.amount));

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Monthly Trend</h3>
        <span className="text-xs text-gray-500">Amount (₹)</span>
      </div>
      <div className="flex items-end gap-3 h-64">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full bg-gradient-to-t rounded-lg transition-all duration-500 hover:opacity-80"
              style={{
                height: `${(item.amount / maxAmount) * 200}px`,
                backgroundColor: item.color,
                minHeight: '4px'
              }}
            />
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-700">{item.label}</p>
              <p className="text-xs text-gray-500 mt-1">₹{item.amount.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple line chart component
const SimpleLineChart = ({ data }: { data: { date: string; amount: number }[] }) => {
  const maxAmount = Math.max(...data.map(d => d.amount));
  const points = data.map((item, idx) => ({
    x: (idx / (data.length - 1)) * 100,
    y: 100 - (item.amount / maxAmount) * 80,
  }));

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Daily Performance</h3>
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((line) => (
            <line
              key={line}
              x1="0"
              y1={line}
              x2="100"
              y2={line}
              stroke="#e5e7eb"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}

          {/* Line */}
          <polyline
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((point, idx) => (
            <circle
              key={idx}
              cx={point.x}
              cy={point.y}
              r="2"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {data.map((item, idx) => (
            <span key={idx} className="text-center" style={{ width: `${100 / data.length}%` }}>
              {new Date(item.date).getDate()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Statistics card component
const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{Math.abs(trend)}% from last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

export default function EarningsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  // Calculate statistics
  const total = staticEarnings.reduce((sum, e) => sum + e.amount, 0);
  const averagePerTrip = Math.round(total / staticEarnings.length);
  const totalTrips = staticEarnings.length;
  const totalDistance = staticEarnings.reduce((sum, e) => sum + (e.distance || 0), 0);

  // Group by month for bar chart
  const monthlyData = staticEarnings.reduce((acc: any, entry) => {
    const month = new Date(entry.date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) acc[month] = 0;
    acc[month] += entry.amount;
    return acc;
  }, {});

  const barChartData = Object.entries(monthlyData).map(([label, amount], idx) => ({
    label,
    amount: amount as number,
    color: `hsl(${idx * 40}, 70%, 50%)`
  }));

  // Sort by date for line chart
  const lineChartData = [...staticEarnings]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => ({
      date: entry.date,
      amount: entry.amount
    }));

  // Calculate vehicle earnings
  const vehicleEarnings = staticEarnings.reduce((acc: any, entry) => {
    if (!acc[entry.vehicle]) acc[entry.vehicle] = 0;
    acc[entry.vehicle] += entry.amount;
    return acc;
  }, {});

  // Get top performing vehicle
  const topVehicle = Object.entries(vehicleEarnings).sort((a: any, b: any) => b[1] - a[1])[0];

  // Handle export
  const handleExport = () => {
    const csv = [
      ['Date', 'Vehicle', 'Trip ID', 'Distance (km)', 'Amount (₹)'],
      ...staticEarnings.map(e => [
        e.date,
        e.vehicle,
        e.tripId || '',
        e.distance || '',
        e.amount
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <HomeHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                Earnings Dashboard
              </h1>
              <p className="text-gray-500 mt-2">Track your earnings and performance metrics</p>
            </div>

            <div className="flex gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              <button
                onClick={handleExport}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Earnings"
            value={`₹${total.toLocaleString()}`}
            icon={DollarSign}
            trend={12.5}
            color="bg-gradient-to-r from-green-500 to-emerald-600"
          />
          <StatCard
            title="Total Trips"
            value={totalTrips}
            icon={Car}
            trend={8.3}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <StatCard
            title="Average per Trip"
            value={`₹${averagePerTrip.toLocaleString()}`}
            icon={BarChart3}
            trend={-2.1}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
          />
          <StatCard
            title="Total Distance"
            value={`${totalDistance} km`}
            icon={Calendar}
            trend={15.7}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Monthly Earnings</h2>
              <span className="text-xs text-gray-400">Bar Chart</span>
            </div>
            <SimpleBarChart data={barChartData} />
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Daily Trend</h2>
              <span className="text-xs text-gray-400">Line Chart</span>
            </div>
            <SimpleLineChart data={lineChartData} />
          </div>
        </div>

        {/* Vehicle Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Vehicle Performance</h2>
              <Car className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {Object.entries(vehicleEarnings).map(([vehicle, amount]: [string, any], idx) => {
                const percentage = (amount / total) * 100;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{vehicle}</span>
                      <span className="text-gray-600">₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          background: `linear-gradient(90deg, hsl(${idx * 40}, 70%, 50%), hsl(${idx * 40 + 20}, 70%, 45%))`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total earnings</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
              <span className="text-xs text-gray-400">Last 5 trips</span>
            </div>
            <div className="space-y-3">
              {staticEarnings.slice(-5).reverse().map((earning, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{earning.vehicle}</p>
                    <p className="text-xs text-gray-500">{new Date(earning.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm font-semibold text-green-600">+₹{earning.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Trip History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staticEarnings.map((earning) => (
                  <tr key={earning.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(earning.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {earning.vehicle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {earning.tripId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {earning.distance ? `${earning.distance} km` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 text-right">
                      ₹{earning.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}