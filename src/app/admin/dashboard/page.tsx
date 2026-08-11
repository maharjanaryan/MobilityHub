// app/admin/dashboard/page.tsx
'use client';

import { useState } from 'react';
import {
    Users,
    Activity,
    Shield,
    DollarSign,
    Car,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Award,
    Download,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    Layers,
    LifeBuoy,
    UserCheck,
    TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [selectedPeriod, setSelectedPeriod] = useState('weekly');

    const stats = [
        {
            title: 'Total Users',
            value: '8,432',
            change: 15.2,
            icon: Users,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/30',
            trend: 'up'
        },
        {
            title: 'Active Owners',
            value: '1,847',
            change: 12.5,
            icon: UserCheck,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
            trend: 'up'
        },
        {
            title: 'Total Revenue',
            value: '$42,847',
            change: 8.3,
            icon: DollarSign,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-50 dark:bg-purple-900/30',
            trend: 'up'
        },
        {
            title: 'KYC Pending',
            value: '94',
            change: -12.8,
            icon: Shield,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-50 dark:bg-amber-900/30',
            trend: 'down'
        },
        {
            title: 'Active Vehicles',
            value: '2,845',
            change: 22.5,
            icon: Car,
            color: 'text-teal-600 dark:text-teal-400',
            bgColor: 'bg-teal-50 dark:bg-teal-900/30',
            trend: 'up'
        },
        {
            title: 'Total Bookings',
            value: '18,945',
            change: 28.3,
            icon: Calendar,
            color: 'text-indigo-600 dark:text-indigo-400',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
            trend: 'up'
        }
    ];

    const recentActivities = [
        { id: 1, user: 'John Doe', action: 'Completed KYC verification', time: '5 minutes ago', icon: CheckCircle2, status: 'success' },
        { id: 2, user: 'Sarah Chen', action: 'Listed new vehicle - Tesla Model 3', time: '1 hour ago', icon: Car, status: 'info' },
        { id: 3, user: 'Mike Ross', action: 'KYC rejected - Invalid ID', time: '2 hours ago', icon: AlertCircle, status: 'warning' },
        { id: 4, user: 'Emily Watson', action: 'Booked vehicle - BMW X5', time: '3 hours ago', icon: Calendar, status: 'success' },
        { id: 5, user: 'David Kim', action: 'Registered as vehicle owner', time: '5 hours ago', icon: UserCheck, status: 'success' },
        { id: 6, user: 'Lisa Wong', action: 'Updated vehicle documents', time: '6 hours ago', icon: Layers, status: 'info' },
    ];

    return (
        <>
            {/* Welcome banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-emerald-100 dark:text-gray-300 text-sm">Welcome back,</p>
                            <h1 className="text-xl md:text-2xl font-bold">Admin! 👋</h1>
                        </div>
                    </div>
                    <p className="text-emerald-100 dark:text-gray-300 mb-6 text-sm md:text-base">Here's your vehicle sharing platform performance overview for today.</p>
                    <div className="flex space-x-3">
                        <button className="px-3 md:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/30 transition-all">
                            Download Report
                        </button>
                        <button className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                            View Analytics
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 mb-6 md:mb-8">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`${stat.bgColor} p-2 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${stat.trend === 'up' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300'
                                        }`}>
                                        {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        <span>{Math.abs(stat.change)}%</span>
                                    </div>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">{stat.value}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-xs">{stat.title}</p>
                            </div>
                            <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                        </div>
                    );
                })}
            </div>

            {/* Charts and activity section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 md:mb-8">
                {/* Performance Chart */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Performance Overview</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">User engagement & booking metrics</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {['Daily', 'Weekly', 'Monthly'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period.toLowerCase())}
                                    className={`px-3 py-1 text-sm rounded-lg transition-all ${selectedPeriod === period.toLowerCase()
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 font-medium'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {period}
                                </button>
                            ))}
                            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="h-64 flex items-end space-x-2">
                        {[65, 45, 78, 52, 89, 72, 94, 68, 83, 71, 92, 87].map((height, i) => (
                            <div key={i} className="flex-1 group">
                                <div className="relative h-full flex flex-col justify-end">
                                    <div
                                        className="bg-gradient-to-t from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-emerald-500 rounded-lg transition-all duration-300 group-hover:from-emerald-600 group-hover:to-emerald-500"
                                        style={{ height: `${height}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {height}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Recent Activity</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest platform actions and updates</p>
                            </div>
                            <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {recentActivities.map((activity) => {
                            const Icon = activity.icon;
                            return (
                                <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.status === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300' :
                                            activity.status === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300' :
                                                'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300'
                                            } group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{activity.user}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.action}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { icon: Shield, label: 'Verify KYC', color: 'amber', action: 'Review pending verifications', link: '/admin/kyc' },
                        { icon: LifeBuoy, label: 'Support', color: 'red', action: 'Contact support team', link: '/admin/support' },
                    ].map((action, index) => {
                        const Icon = action.icon;
                        const colorMap: Record<string, string> = {
                            amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
                            red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                        };
                        return (
                            <Link
                                key={index}
                                href={action.link}
                                className="group p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-emerald-50 dark:hover:from-emerald-900/20 hover:to-teal-50 dark:hover:to-teal-900/20 rounded-xl transition-all duration-300 text-left"
                            >
                                <div className={`w-10 h-10 ${colorMap[action.color]} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{action.label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.action}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}