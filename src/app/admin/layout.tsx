// app/admin/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Settings,
  LogOut,
  Home,
  Search,
  ChevronDown,
  FileText,
  Shield,
  Calendar,
  RefreshCw,
  Car,
  TrendingUp,
  Menu,
  X,
  GalleryVertical // Added this icon
} from 'lucide-react';
import NotificationBell from '../component/NotificationBell';
import ThemeToggle from '../component/ThemeToggle';


interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingKycCount, setPendingKycCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/signin');
      return;
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'ADMIN') {
        router.push('/home');
        return;
      }
      setUser(parsedUser);
    }

    // Fetch pending KYC count
    fetchPendingKycCount();

    setLoading(false);
  }, [router]);

  const fetchPendingKycCount = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      // Fetch pending renter KYC
      const renterResponse = await fetch('http://localhost:8080/api/admin/kyc/pending/renters', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const pendingRenters = await renterResponse.json();

      // Fetch pending owner KYC
      const ownerResponse = await fetch('http://localhost:8080/api/admin/kyc/pending/owners', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const pendingOwners = await ownerResponse.json();

      const totalPending = (pendingRenters?.length || 0) + (pendingOwners?.length || 0);
      setPendingKycCount(totalPending);
    } catch (error) {
      console.error('Error fetching pending KYC count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      await fetch('http://localhost:8080/api/auth/signout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Remove all items from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('theme');
      localStorage.removeItem('user');

      // Redirect to signin page
      router.push('/signin');
    }
  };

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/admin/dashboard' && pathname === '/admin/dashboard') {
      return true;
    }
    if (path !== '/admin/dashboard' && pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed for desktop, sliding for mobile */}
      <aside
        className={`fixed top-0 left-0 z-40 w-72 h-full bg-white dark:bg-gray-900 shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="rounded-xl object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-xl text-gray-800 dark:text-gray-100">MobilityHub</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Portal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/admin/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/admin/dashboard')
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <Home className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              href="/admin/users"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/admin/users')
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <Users className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>User Management</span>
            </Link>

            <Link
              href="/admin/kyc"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/admin/kyc')
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <Shield className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>KYC Verification</span>
              {pendingKycCount > 0 && (
                <span className="ml-auto bg-amber-100 text-amber-600 text-xs px-2 py-1 rounded-full animate-pulse">
                  Pending: {pendingKycCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin/vehicles"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/admin/vehicles')
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <Car className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>Vehicle Management</span>
            </Link>

            <Link
              href="/admin/bookings"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/admin/bookings')
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <Calendar className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>Booking Management</span>
            </Link>

            <Link
              href="/admin/analytics"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/admin/analytics')
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <TrendingUp className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>Analytics</span>
            </Link>

            <Link
              href="/admin/reports"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/admin/reports')
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <FileText className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>Reports</span>
            </Link>

            {/* Gallery Link - Added */}
            <Link
              href="/admin/gallery"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/admin/gallery')
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <GalleryVertical className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>Gallery</span>
            </Link>

            <Link
              href="/admin/settings"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/admin/settings')
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <Settings className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
              <span>Settings</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 w-full group"
            >
              <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <div className="flex-1 max-w-lg hidden md:block">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md hidden md:block">
                  ⌘K
                </kbd>
              </div>
            </div>

            <div className="flex items-center space-x-4 ml-auto md:ml-0">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notification Bell Component */}
              <NotificationBell />

              <button className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" onClick={fetchPendingKycCount}>
                <RefreshCw className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                <div className="relative group cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                    <span className="text-white font-semibold">
                      {user?.fullName?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{user?.fullName || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">System Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}