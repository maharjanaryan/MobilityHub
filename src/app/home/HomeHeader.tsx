// app/home/HomeHeader.tsx
"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Settings, FileText, LogOut, Menu, X, Shield, IdCard,
  Briefcase, HelpCircle, MapPin, TrendingUp, CalendarCheck,
  BookOpen, MessageSquare, Home, Map, Car, Info, Bell,
  CreditCard, Wallet, Star, Gift, Award
} from "lucide-react";
import NotificationBell from "../component/NotificationBell";
import ThemeToggle from "../component/ThemeToggle";

const API_BASE_URL = "http://localhost:8080";

const normalizeAvatarUrl = (url?: string | null) => {
  if (!url) return "/logo.png";
  if (url.startsWith("http") || url.startsWith("data:image") || url.startsWith("/logo.png")) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

interface KYCStatusResponse {
  success: boolean;
  message: string;
  kycStatus: string;
  kycLevel: string;
  kycType: string;
  renterKycStatus: string;
  ownerKycStatus: string;
  canBook: boolean;
  canList: boolean;
  userId: number;
  userFullName: string;
  userEmail: string;
  dailyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number;
  kycVerifiedAt: string | null;
  kycSubmittedAt: string | null;
  rejectionReason: string | null;
}

interface HomeHeaderProps {
  userType?: "user" | "owner" | null;
}

const mapKYCStatus = (status: string): "pending" | "verified" | "rejected" | "not_submitted" => {
  switch (status?.toUpperCase()) {
    case 'VERIFIED':
      return 'verified';
    case 'SUBMITTED':
      return 'pending';
    case 'REJECTED':
      return 'rejected';
    default:
      return 'not_submitted';
  }
};

const HomeHeader: React.FC<HomeHeaderProps> = ({
  userType = "user",
}) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [kycStatus, setKycStatus] = useState<{
    user: "pending" | "verified" | "rejected" | "not_submitted";
    owner: "pending" | "verified" | "rejected" | "not_submitted";
  }>({
    user: "not_submitted",
    owner: "not_submitted"
  });
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    avatar: "/logo.png",
    role: "user"
  });
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get access token
  const getAccessToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }, []);

  // Fetch unread chat count
  const fetchUnreadChatCount = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/unread/count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Token expired, redirect to signin
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        router.push('/signin');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUnreadChatCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread chat count:', error);
    }
  }, [getAccessToken, router]);

  // Fetch KYC status from API
  const fetchKYCStatus = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/kyc/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        router.push('/signin');
        return;
      }

      if (response.ok) {
        const data: KYCStatusResponse = await response.json();

        // Map API response to KYC status format
        const renterStatus = mapKYCStatus(data.renterKycStatus);
        const ownerStatus = mapKYCStatus(data.ownerKycStatus);

        setKycStatus({
          user: renterStatus,
          owner: ownerStatus
        });
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  }, [getAccessToken, router]);

  // Fetch user data from localStorage and API
  const fetchUserData = useCallback(async () => {
    const token = getAccessToken();
    const storedUser = localStorage.getItem('user');
    let localUser = null;

    if (storedUser) {
      try {
        localUser = JSON.parse(storedUser);
        setUserData({
          name: localUser.fullName || localUser.username || "User",
          email: localUser.email || "",
          avatar: normalizeAvatarUrl(localUser.avatarUrl),
          role: localUser.role?.toLowerCase() || userType || "user"
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const profile = await response.json();
          const updatedUser = {
            ...(localUser || {}),
            ...profile,
          };

          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUserData({
            name: profile.fullName || profile.username || "User",
            email: profile.email || "",
            avatar: normalizeAvatarUrl(profile.avatarUrl),
            role: profile.role?.toLowerCase() || userType || "user"
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }

    setLoading(false);
  }, [getAccessToken, userType]);

  // Initial data fetch
  useEffect(() => {
    queueMicrotask(() => {
      void fetchUserData();
      void fetchKYCStatus();
      void fetchUnreadChatCount();
    });

    const handleProfileUpdated = () => {
      void fetchUserData();
    };

    window.addEventListener('profile-updated', handleProfileUpdated);

    // Poll every 30 seconds for KYC status updates
    const kycInterval = setInterval(fetchKYCStatus, 30000);

    // Poll every 15 seconds for chat updates
    const chatInterval = setInterval(fetchUnreadChatCount, 15000);

    return () => {
      clearInterval(kycInterval);
      clearInterval(chatInterval);
      window.removeEventListener('profile-updated', handleProfileUpdated);
    };
  }, [fetchKYCStatus, fetchUserData, fetchUnreadChatCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateTo = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch(`${API_BASE_URL}/api/auth/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error('Logout failed on server');
      }

      // Clear all local storage data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('savedEmail');

      // Clear session storage if used
      sessionStorage.clear();

      // Navigate to signin page
      router.push('/signin');

    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      router.push('/signin');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getKYCStatusBadge = (type: "user" | "owner") => {
    const status = type === "user" ? kycStatus.user : kycStatus.owner;
    const statusConfig = {
      verified: { color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300", label: "Verified", icon: "✅" },
      pending: { color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300", label: "Pending", icon: "⏳" },
      rejected: { color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300", label: "Rejected", icon: "❌" },
      not_submitted: { color: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300", label: "Not Submitted", icon: "📋" }
    };
    return statusConfig[status];
  };

  const menuItems = [
    { label: "Profile", icon: User, onClick: () => navigateTo("/profile"), divider: false },
    { label: "Settings", icon: Settings, onClick: () => navigateTo("/settings"), divider: false },
    { label: "My Bookings", icon: BookOpen, onClick: () => navigateTo("/my-bookings"), divider: false },
    { label: "Booking Request", icon: CalendarCheck, onClick: () => navigateTo("/booking"), divider: false },
    {
      label: "Messages",
      icon: MessageSquare,
      onClick: () => navigateTo("/chat"),
      divider: false,
      badge: unreadChatCount > 0 ? {
        color: "bg-red-500 dark:bg-red-600 text-white",
        label: `${unreadChatCount}`,
        icon: ""
      } : undefined
    },
    {
      label: "User KYC",
      icon: IdCard,
      onClick: () => navigateTo("/kyc/user"),
      divider: false,
      badge: getKYCStatusBadge("user"),
      type: "user-kyc"
    },
    {
      label: "Owner KYC",
      icon: Briefcase,
      onClick: () => navigateTo("/kyc/owner"),
      divider: false,
      badge: getKYCStatusBadge("owner"),
      type: "owner-kyc"
    },
    { label: "My Reports", icon: FileText, onClick: () => navigateTo("/reports"), divider: false },
    { label: "Track My Ride", icon: MapPin, onClick: () => navigateTo("/tracking"), divider: false },
    { label: "Help & Support", icon: HelpCircle, onClick: () => navigateTo("/help"), divider: true },
    { label: "Earnings", icon: TrendingUp, onClick: () => navigateTo("/earnings"), divider: false },
    { label: "Logout", icon: LogOut, onClick: handleLogout, divider: false, danger: true },
  ];

  if (loading) {
    return (
      <nav className="bg-gray-100 dark:bg-gray-900 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full object-cover" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Mobility Hub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-100 dark:bg-gray-900 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">

        {/* LEFT: Logo */}
        <div className="flex items-center space-x-2 cursor-pointer min-w-0" onClick={() => navigateTo("/home")}>
          <img
            src="/logo.png"
            alt="Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
          />
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 truncate">Mobility Hub</h1>
        </div>

        {/* CENTER: Menu - Icons Removed */}
        <ul className="hidden lg:flex space-x-8 text-gray-600 dark:text-gray-300 font-medium">
          <li className="hover:text-green-600 dark:hover:text-green-400 cursor-pointer transition-colors" onClick={() => navigateTo("/home")}>
            Home
          </li>
          <li className="hover:text-green-600 dark:hover:text-green-400 cursor-pointer transition-colors" onClick={() => navigateTo("/maps")}>
            Maps
          </li>
          <li className="hover:text-green-600 dark:hover:text-green-400 cursor-pointer transition-colors" onClick={() => navigateTo("/vehicles")}>
            Vehicles
          </li>
          <li className="hover:text-green-600 dark:hover:text-green-400 cursor-pointer transition-colors" onClick={() => navigateTo("/my-bookings")}>
            My Bookings
          </li>
          <li className="hover:text-green-600 dark:hover:text-green-400 cursor-pointer transition-colors" onClick={() => navigateTo("/about1")}>
            About Us
          </li>
        </ul>

        {/* RIGHT: Chat, Notification, and Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4">

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Chat Button */}
          <button
            onClick={() => navigateTo("/chat")}
            className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Messages"
          >
            <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadChatCount > 9 ? '9+' : unreadChatCount}
              </span>
            )}
          </button>

          {/* Notification Bell Component */}
          <NotificationBell />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="cursor-pointer flex items-center gap-2"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img
                src={userData.avatar}
                alt="Profile"
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 transition-colors object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/logo.png";
                }}
              />
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                {userData.name.split(' ')[0]}
              </span>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[90vh] overflow-y-auto">
                {/* User Info Section */}
                <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-gray-50 dark:from-green-900/30 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <img
                      src={userData.avatar}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border-2 border-green-500 dark:border-green-400 object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/logo.png";
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{userData.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{userData.email}</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 capitalize flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {userData.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* KYC Quick Status */}
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">KYC Status</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <IdCard size={12} /> User KYC
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getKYCStatusBadge("user").color} inline-flex items-center gap-1`}>
                        <span>{getKYCStatusBadge("user").icon}</span>
                        {getKYCStatusBadge("user").label}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <Briefcase size={12} /> Owner KYC
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getKYCStatusBadge("owner").color} inline-flex items-center gap-1`}>
                        <span>{getKYCStatusBadge("owner").icon}</span>
                        {getKYCStatusBadge("owner").label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {menuItems.map((item, index) => (
                    <React.Fragment key={item.label}>
                      <button
                        onClick={() => {
                          item.onClick();
                          setIsDropdownOpen(false);
                        }}
                        disabled={item.label === "Logout" && isLoggingOut}
                        className={`w-full px-4 py-2.5 flex items-center justify-between transition-colors ${item.danger
                            ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon size={18} />
                          <span className="text-sm font-medium">
                            {item.label === "Logout" && isLoggingOut ? "Logging out..." : item.label}
                          </span>
                        </div>
                        {item.badge && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${item.badge.color} inline-flex items-center gap-1`}>
                            {item.badge.icon && <span>{item.badge.icon}</span>}
                            {item.badge.label}
                          </span>
                        )}
                      </button>
                      {item.divider && index < menuItems.length - 1 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="lg:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X size={22} className="text-gray-700 dark:text-gray-300" /> : <Menu size={22} className="text-gray-700 dark:text-gray-300" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 grid gap-1 text-gray-600 dark:text-gray-300">
            {/* Main Navigation - Icons Removed */}
            {[
              { label: "Home", path: "/home" },
              { label: "Maps", path: "/maps" },
              { label: "Vehicles", path: "/vehicles" },
              { label: "My Bookings", path: "/my-bookings" },
              { label: "About Us", path: "/about" },
            ].map(({ label, path }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigateTo(path)}
                className="text-left px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors"
              >
                {label}
              </button>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            {/* Quick Actions */}
            <button
              onClick={() => navigateTo("/chat")}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors flex items-center justify-between"
            >
              <span>Messages</span>
              {unreadChatCount > 0 && (
                <span className="bg-red-500 dark:bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadChatCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigateTo("/booking")}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors"
            >
              Booking Request
            </button>

            {/* KYC Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 px-3 py-1">KYC Verification</p>
              <button
                onClick={() => navigateTo("/kyc/user")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors flex items-center justify-between"
              >
                <span>User KYC</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getKYCStatusBadge("user").color} inline-flex items-center gap-1`}>
                  <span>{getKYCStatusBadge("user").icon}</span>
                  {getKYCStatusBadge("user").label}
                </span>
              </button>
              <button
                onClick={() => navigateTo("/kyc/owner")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors flex items-center justify-between"
              >
                <span>Owner KYC</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getKYCStatusBadge("owner").color} inline-flex items-center gap-1`}>
                  <span>{getKYCStatusBadge("owner").icon}</span>
                  {getKYCStatusBadge("owner").label}
                </span>
              </button>
            </div>

            {/* More Options */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
              <button
                onClick={() => navigateTo("/tracking")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors"
              >
                Track My Ride
              </button>
              <button
                onClick={() => navigateTo("/reports")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors"
              >
                My Reports
              </button>
              <button
                onClick={() => navigateTo("/earnings")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors"
              >
                Earnings
              </button>
              <button
                onClick={() => navigateTo("/help")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors"
              >
                Help & Support
              </button>
            </div>

            {/* Profile & Settings */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
              <button
                onClick={() => navigateTo("/profile")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => navigateTo("/settings")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors"
              >
                Settings
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors text-red-500 dark:text-red-400 disabled:opacity-50"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default HomeHeader;