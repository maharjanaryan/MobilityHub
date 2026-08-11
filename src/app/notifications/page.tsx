"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Inbox,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HomeHeader from '../home/HomeHeader';
import Footer from '../component/Footer';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
  relatedId: number;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const fetchNotifications = async () => {
    const token = getToken();
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8080/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        router.push('/signin');
        return;
      }
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching notifications:', e);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8080/api/notifications/unread/count', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (e) {
      console.error('Error fetching unread count:', e);
      setUnreadCount(0);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchNotifications();
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, []);

  const markAsRead = async (id: number) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (e) {
      console.error('Error marking as read:', e);
    }
  };

  const markAllAsRead = async () => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch('http://localhost:8080/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (e) {
      console.error('Error marking all as read:', e);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'KYC_APPROVED':
        return { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' };
      case 'KYC_REJECTED':
        return { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' };
      case 'KYC_SUBMITTED':
        return { icon: Clock, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/30' };
      case 'KYC_PENDING_ADMIN':
        return { icon: AlertCircle, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' };
      default:
        return { icon: Bell, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.type === 'KYC_APPROVED' || notification.type === 'KYC_REJECTED') {
      router.push('/kyc/status');
    } else if (notification.type === 'KYC_PENDING_ADMIN') {
      router.push('/admin/kyc/pending');
    } else {
      router.push('/notifications');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.status === 'UNREAD';
    if (filter === 'read') return n.status === 'READ';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <HomeHeader />

      <main className="flex-1 py-8 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <Bell className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 dark:bg-red-600 text-white text-sm px-3 py-1 rounded-full font-semibold animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {notifications.length > 0
                    ? `You have ${unreadCount > 0 ? unreadCount : 'no'} unread notifications`
                    : 'No notifications yet'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg transition-all shadow-sm hover:shadow-md text-sm font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mt-6 border-b border-gray-200 dark:border-gray-800 pb-2">
              {[
                { value: 'all', label: 'All', count: notifications.length },
                { value: 'unread', label: 'Unread', count: unreadCount },
                { value: 'read', label: 'Read', count: notifications.length - unreadCount }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab.value
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === tab.value
                        ? 'bg-emerald-500/30 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Notifications List */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-xl shadow-sm"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 dark:border-emerald-400" />
                <p className="text-gray-500 dark:text-gray-400 mt-4">Loading notifications...</p>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-red-200 dark:border-red-800"
              >
                <XCircle className="w-12 h-12 text-red-500 dark:text-red-400 mb-3" />
                <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-4 px-6 py-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            ) : filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800"
              >
                <Inbox className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No notifications</h3>
                <p className="text-gray-400 dark:text-gray-500 mt-2">
                  {filter === 'all'
                    ? 'You\'re all caught up!'
                    : filter === 'unread'
                      ? 'No unread notifications'
                      : 'No read notifications'}
                </p>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="mt-4 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium"
                  >
                    View all notifications →
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {filteredNotifications.map((notification, index) => {
                  const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
                  const isUnread = notification.status === 'UNREAD';

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleClick(notification)}
                      className={`group relative cursor-pointer rounded-xl border transition-all bg-white dark:bg-gray-900 shadow-sm hover:shadow-md ${isUnread
                          ? 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                    >
                      <div className="flex items-start gap-4 p-5">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={`text-sm font-medium ${isUnread
                                  ? 'text-gray-900 dark:text-gray-100'
                                  : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                {notification.title}
                              </p>
                              <p className={`text-sm mt-1 line-clamp-2 ${isUnread
                                  ? 'text-gray-700 dark:text-gray-300'
                                  : 'text-gray-500 dark:text-gray-500'
                                }`}>
                                {notification.message}
                              </p>
                            </div>
                            {isUnread && (
                              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-1.5" />
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{getTimeAgo(notification.createdAt)}</span>
                            </div>
                            {isUnread && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium">
                                New
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Chevron */}
                        <ChevronRight className={`w-5 h-5 flex-shrink-0 ${isUnread
                            ? 'text-emerald-500 dark:text-emerald-400'
                            : 'text-gray-300 dark:text-gray-600'
                          } opacity-0 group-hover:opacity-100 transition-opacity`} />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/home')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}