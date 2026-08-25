// app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
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
    TrendingUp,
    Loader2,
    Percent,
    Wallet
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
    totalUsers: number;
    activeOwners: number;
    totalRevenue: number;
    platformCommission: number;
    ownerPayout: number;
    kycPending: number;
    activeVehicles: number;
    totalBookings: number;
    completedBookings: number;
    pendingBookings: number;
    averageRating: number;
    userGrowth: number;
    revenueGrowth: number;
    bookingGrowth: number;
    vehicleGrowth: number;
}

interface RecentActivity {
    id: number;
    user: string;
    action: string;
    time: string;
    icon: any;
    status: 'success' | 'warning' | 'info';
}

export default function AdminDashboard() {
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        activeOwners: 0,
        totalRevenue: 0,
        platformCommission: 0,
        ownerPayout: 0,
        kycPending: 0,
        activeVehicles: 0,
        totalBookings: 0,
        completedBookings: 0,
        pendingBookings: 0,
        averageRating: 0,
        userGrowth: 0,
        revenueGrowth: 0,
        bookingGrowth: 0,
        vehicleGrowth: 0
    });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [chartData, setChartData] = useState<number[]>([]);
    const [chartLabels, setChartLabels] = useState<string[]>([]);

    const getAuthToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken') || localStorage.getItem('token');
        }
        return null;
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        const token = getAuthToken();

        if (!token) {
            setError('Please login to view dashboard');
            setLoading(false);
            return;
        }

        try {
            // Fetch booking statistics
            const statsRes = await fetch('http://localhost:8080/api/bookings/admin/bookings/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!statsRes.ok) {
                throw new Error('Failed to fetch statistics');
            }

            const statsData = await statsRes.json();

            // Fetch all bookings
            const bookingsRes = await fetch(
                `http://localhost:8080/api/bookings/admin/bookings?page=0&size=1000`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!bookingsRes.ok) {
                throw new Error('Failed to fetch bookings');
            }

            const bookingsData = await bookingsRes.json();
            const bookings = bookingsData.content || [];

            // Fetch vehicles
            const vehiclesRes = await fetch('http://localhost:8080/api/vehicles/all?page=0&size=100', {
                headers: { Authorization: `Bearer ${token}` }
            });

            let vehicles = [];
            if (vehiclesRes.ok) {
                const vehicleData = await vehiclesRes.json();
                vehicles = vehicleData.content || [];
            }

            // Fetch users
            const usersRes = await fetch('http://localhost:8080/api/admin/users/statistics', {
                headers: { Authorization: `Bearer ${token}` }
            });

            let userStats = { totalUsers: 0, activeUsers: 0, newUsers: 0 };
            if (usersRes.ok) {
                userStats = await usersRes.json();
            }

            // Process data
            const processedStats = processDashboardData(bookings, vehicles, userStats, statsData);
            setStats(processedStats);
            setRecentActivities(processRecentActivities(bookings));

            // Generate chart data with labels
            const { data, labels } = generateChartData(bookings);
            setChartData(data);
            setChartLabels(labels);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const processDashboardData = (bookings: any[], vehicles: any[], userStats: any, statsData: any): DashboardStats => {
        const completedBookings = bookings.filter(b => b.bookingStatus === 'COMPLETED').length;
        const pendingBookings = bookings.filter(b => b.bookingStatus === 'PENDING' || b.bookingStatus === 'CONFIRMED').length;
        const totalBookings = bookings.length;

        const completedPayments = bookings.filter(b => b.paymentStatus === 'COMPLETED');
        const totalRevenue = completedPayments.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const platformCommission = completedPayments.reduce((sum, b) => sum + (b.serviceFee || 0), 0);
        const ownerPayout = completedPayments.reduce((sum, b) => sum + (b.rentalAmount || 0) + (b.insuranceFee || 0), 0);

        const activeVehicles = vehicles.filter(v => v.isAvailable).length;
        const avgRating = vehicles.length > 0
            ? vehicles.reduce((sum, v) => sum + (v.averageRating || 0), 0) / vehicles.length
            : 0;

        return {
            totalUsers: userStats.totalUsers || 0,
            activeOwners: userStats.activeUsers || 0,
            totalRevenue,
            platformCommission,
            ownerPayout,
            kycPending: statsData?.pendingKyc || 0,
            activeVehicles,
            totalBookings,
            completedBookings,
            pendingBookings,
            averageRating: avgRating,
            userGrowth: 12.5,
            revenueGrowth: 18.5,
            bookingGrowth: 22.8,
            vehicleGrowth: 8.2
        };
    };

    const processRecentActivities = (bookings: any[]): RecentActivity[] => {
        const activities: RecentActivity[] = [];
        const recentBookings = bookings.slice(0, 6);

        recentBookings.forEach((booking) => {
            const status = booking.bookingStatus === 'COMPLETED' ? 'success' :
                booking.bookingStatus === 'REJECTED' ? 'warning' : 'info';

            let action = '';
            switch (booking.bookingStatus) {
                case 'COMPLETED':
                    action = 'Completed booking';
                    break;
                case 'PENDING':
                    action = 'Created new booking';
                    break;
                case 'CONFIRMED':
                    action = 'Confirmed booking';
                    break;
                case 'REJECTED':
                    action = 'Rejected booking';
                    break;
                default:
                    action = 'Booking action';
            }

            let icon = Activity;
            switch (booking.bookingStatus) {
                case 'COMPLETED':
                    icon = CheckCircle2;
                    break;
                case 'PENDING':
                    icon = Calendar;
                    break;
                case 'CONFIRMED':
                    icon = UserCheck;
                    break;
                default:
                    icon = Activity;
            }

            const time = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Today';

            activities.push({
                id: booking.id,
                user: booking.renterName || `User ${booking.renterId}`,
                action: `${action} - ${booking.vehicleName || 'Vehicle'}`,
                time: time,
                icon: icon,
                status: status as 'success' | 'warning' | 'info'
            });
        });

        return activities;
    };

    const generateChartData = (bookings: any[]) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data: number[] = [];
        const labels: string[] = [];

        // Get current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Generate data for last 12 months
        for (let i = 11; i >= 0; i--) {
            // Calculate the month we're looking at (going backwards from current month)
            const monthOffset = (currentMonth - i + 12) % 12;
            const yearOffset = currentMonth - i < 0 ? currentYear - 1 : currentYear;

            // Count bookings for this month
            const count = bookings.filter(b => {
                if (!b.createdAt) return false;
                const date = new Date(b.createdAt);
                return date.getMonth() === monthOffset && date.getFullYear() === yearOffset;
            }).length;

            data.push(count);
            labels.push(months[monthOffset]);
        }

        return { data, labels };
    };

    useEffect(() => {
        fetchDashboardData();
    }, [selectedPeriod]);

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
                a.download = `dashboard_export_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                alert('Failed to export data');
            }
        } catch (err) {
            console.error('Export error:', err);
            alert('Failed to export data');
        }
    };

    const formatCurrency = (amount: number) => {
        return `Rs. ${amount.toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 dark:text-red-300 font-semibold mb-2">Error Loading Dashboard</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const statsCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers.toLocaleString(),
            change: stats.userGrowth,
            icon: Users,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/30',
            trend: 'up'
        },
        {
            title: 'Active Owners',
            value: stats.activeOwners.toLocaleString(),
            change: 12.5,
            icon: UserCheck,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
            trend: 'up'
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            change: stats.revenueGrowth,
            icon: DollarSign,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-50 dark:bg-purple-900/30',
            trend: 'up'
        },
        {
            title: 'Platform Commission',
            value: formatCurrency(stats.platformCommission),
            change: 15.4,
            icon: Percent,
            color: 'text-indigo-600 dark:text-indigo-400',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
            trend: 'up'
        },
        {
            title: 'KYC Pending',
            value: stats.kycPending.toLocaleString(),
            change: -12.8,
            icon: Shield,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-50 dark:bg-amber-900/30',
            trend: 'down'
        },
        {
            title: 'Active Vehicles',
            value: stats.activeVehicles.toLocaleString(),
            change: stats.vehicleGrowth,
            icon: Car,
            color: 'text-teal-600 dark:text-teal-400',
            bgColor: 'bg-teal-50 dark:bg-teal-900/30',
            trend: 'up'
        },
        {
            title: 'Total Bookings',
            value: stats.totalBookings.toLocaleString(),
            change: stats.bookingGrowth,
            icon: Calendar,
            color: 'text-rose-600 dark:text-rose-400',
            bgColor: 'bg-rose-50 dark:bg-rose-900/30',
            trend: 'up'
        },
        {
            title: 'Owner Payout',
            value: formatCurrency(stats.ownerPayout),
            change: 20.1,
            icon: Wallet,
            color: 'text-cyan-600 dark:text-cyan-400',
            bgColor: 'bg-cyan-50 dark:bg-cyan-900/30',
            trend: 'up'
        }
    ];

    // Calculate max value for chart
    const maxChartValue = Math.max(...chartData, 1);

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
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleExport}
                            className="px-3 md:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/30 transition-all flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download Report
                        </button>
                        <Link
                            href="/admin/analytics"
                            className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                        >
                            View Analytics
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                {statsCards.map((stat, index) => {
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
                {/* Performance Chart - FIXED */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Booking Trends</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monthly booking volume</p>
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
                            <button
                                onClick={handleExport}
                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="h-64 flex items-end space-x-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        {chartData && chartData.length > 0 && chartData.some(v => v > 0) ? (
                            chartData.map((value, i) => {
                                const height = Math.max((value / maxChartValue) * 100, 5);
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                                            {value > 0 ? value : ''}
                                        </div>
                                        <div
                                            className="w-full max-w-[40px] bg-emerald-500 dark:bg-emerald-400 rounded-t transition-all duration-500 hover:bg-emerald-600 dark:hover:bg-emerald-300"
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        />
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                                            {chartLabels[i] || ''}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full text-center text-gray-400 dark:text-gray-500 py-8">
                                No booking data available for chart
                            </div>
                        )}
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

                    <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
                        {recentActivities.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No recent activities
                            </div>
                        ) : (
                            recentActivities.map((activity) => {
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
                                            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{activity.time}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        href="/admin/kyc"
                        className="group p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-emerald-50 dark:hover:from-emerald-900/20 hover:to-teal-50 dark:hover:to-teal-900/20 rounded-xl transition-all duration-300 text-left"
                    >
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <Shield className="w-5 h-5" />
                        </div>
                        <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">Verify KYC</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.kycPending} pending verifications</p>
                    </Link>

                    <Link
                        href="/admin/reports"
                        className="group p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-50 dark:hover:from-blue-900/20 hover:to-indigo-50 dark:hover:to-indigo-900/20 rounded-xl transition-all duration-300 text-left"
                    >
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">View Reports</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Platform analytics & insights</p>
                    </Link>

                    <Link
                        href="/admin/vehicles"
                        className="group p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-teal-50 dark:hover:from-teal-900/20 hover:to-emerald-50 dark:hover:to-emerald-900/20 rounded-xl transition-all duration-300 text-left"
                    >
                        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <Car className="w-5 h-5" />
                        </div>
                        <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">Manage Vehicles</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.activeVehicles} active vehicles</p>
                    </Link>

                    <Link
                        href="/admin/users"
                        className="group p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-purple-50 dark:hover:from-purple-900/20 hover:to-pink-50 dark:hover:to-pink-900/20 rounded-xl transition-all duration-300 text-left"
                    >
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <Users className="w-5 h-5" />
                        </div>
                        <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">Manage Users</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.totalUsers} registered users</p>
                    </Link>
                </div>
            </div>
        </>
    );
}