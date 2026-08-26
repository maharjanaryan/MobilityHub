// components/NotificationBell.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
  relatedId: number;
}

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get token from localStorage safely
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const fetchNotifications = async () => {
    const token = getToken();
    if (!token) {
      console.log('No token found, skipping notification fetch');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        console.log('Unauthorized, redirecting to login');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        router.push('/signin');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
      const response = await fetch('http://localhost:8080/api/notifications/unread/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const count = data.count || 0;
      setUnreadCount(count);

      // Dispatch event for HomeHeader to update
      window.dispatchEvent(new CustomEvent('notification-count-update', {
        detail: { count }
      }));
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

  // Setup SSE connection for real-time notifications
  const setupSSE = () => {
    const token = getToken();
    if (!token) return;

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      const eventSource = new EventSource(
        `http://localhost:8080/api/notifications/stream?token=${token}`
      );
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        console.log('✅ SSE connection established for notifications');
      };

      eventSource.addEventListener('connected', (event) => {
        console.log('Connected to notification stream:', event.data);
      });

      eventSource.addEventListener('notification', (event) => {
        try {
          const newNotification = JSON.parse(event.data);

          // Add to notifications list
          setNotifications(prev => [newNotification, ...prev]);

          // Update unread count
          setUnreadCount(prev => prev + 1);

          // Dispatch global events for other components
          window.dispatchEvent(new CustomEvent('new-notification', {
            detail: newNotification
          }));

          window.dispatchEvent(new CustomEvent('notification-count-update', {
            detail: { count: unreadCount + 1 }
          }));

          // Show browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/logo.png'
            });
          }
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      });

      eventSource.onerror = (error) => {
        // Silently handle SSE error - don't show console errors
        setIsConnected(false);
        // Close the failed connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        // Start polling as fallback
        startPolling();
      };

    } catch (error) {
      // Silently handle setup error
      console.log('SSE setup failed, using polling mode');
      setIsConnected(false);
      startPolling();
    }
  };

  // Start polling for notifications
  const startPolling = () => {
    // Clear any existing poll interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Poll every 30 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  };

  useEffect(() => {
    // Only fetch if token exists
    const token = getToken();
    if (token) {
      // Try SSE first
      setupSSE();
      requestNotificationPermission();

      // Also fetch immediately
      fetchNotifications();
      fetchUnreadCount();
    }

    return () => {
      // Clean up
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: number) => {
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const token = getToken();
    if (!token) return;

    try {
      await fetch('http://localhost:8080/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'KYC_VERIFIED':
        return '✅';
      case 'KYC_REJECTED':
        return '❌';
      case 'KYC_SUBMITTED':
        return '📋';
      case 'KYC_PENDING_ADMIN':
        return '🔔';
      case 'VEHICLE_SUBMITTED':
        return '🚗';
      case 'VEHICLE_APPROVED':
        return '✅';
      case 'VEHICLE_REJECTED':
        return '❌';
      default:
        return '📢';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setIsOpen(false);

    // Navigate based on notification type
    if (notification.type === 'KYC_VERIFIED' || notification.type === 'KYC_REJECTED') {
      router.push('/kyc/status');
    } else if (notification.type === 'KYC_PENDING_ADMIN') {
      router.push('/admin/kyc/pending');
    } else if (notification.type === 'VEHICLE_SUBMITTED' || notification.type === 'VEHICLE_APPROVED' || notification.type === 'VEHICLE_REJECTED') {
      router.push('/my-vehicles');
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-4 h-4 px-1 bg-red-500 dark:bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-gray-50 dark:from-green-900/30 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {unreadCount} unread
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 dark:border-green-400 mx-auto mb-2"></div>
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-red-500 dark:text-red-400">
                <p className="text-sm">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-2 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">We'll notify you when something arrives</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${notification.status === 'UNREAD'
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : ''
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.status === 'UNREAD'
                        ? 'font-semibold text-gray-800 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400'
                        }`}>
                        {notification.title}
                      </p>
                      <p className={`text-xs mt-1 line-clamp-2 ${notification.status === 'UNREAD'
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-500 dark:text-gray-500'
                        }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {notification.status === 'UNREAD' && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/notifications');
              }}
              className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}