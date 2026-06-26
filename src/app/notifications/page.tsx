"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
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
        return '✅';
      case 'KYC_REJECTED':
        return '❌';
      case 'KYC_SUBMITTED':
        return '📋';
      case 'KYC_PENDING_ADMIN':
        return '🔔';
      default:
        return '📢';
    }
  };

  const handleClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.type === 'KYC_APPROVED' || notification.type === 'KYC_REJECTED') {
      router.push('/kyc/status');
    } else if (notification.type === 'KYC_PENDING_ADMIN') {
      router.push('/admin/kyc/pending');
    } else {
      // default fallback
      router.push('/notifications');
    }
  };

    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-green-900 to-gray-800 text-gray-100">
        {/* Header */}
        <HomeHeader />
        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center py-12 px-4 lg:px-8">
          <section className="w-full max-w-3xl bg-gray-900 bg-opacity-70 backdrop-blur-lg rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                <Bell size={24} className="text-green-400" />
                Notifications {unreadCount > 0 && (
                  <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </h1>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-green-400 hover:text-green-300"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400 mx-auto mb-2" />
                Loading notifications...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">
                <p className="text-sm">{error}</p>
                <button onClick={fetchNotifications} className="mt-2 text-xs text-green-400 hover:text-green-300">Retry</button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No notifications</div>
            ) : (
              <ul className="space-y-2">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`cursor-pointer p-4 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors ${n.status === 'UNREAD' ? 'bg-green-900' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getNotificationIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${n.status === 'UNREAD' ? 'font-semibold text-white' : 'text-gray-300'}`}>{n.title}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/home')}
                className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </section>
        </main>
        {/* Footer */}
        <Footer />
      </div>
    );
}
