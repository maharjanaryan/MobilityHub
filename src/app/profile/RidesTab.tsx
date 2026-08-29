// app/profile/RidesTab.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Car, Star, Clock, AlertCircle,
  Calendar, Loader2
} from 'lucide-react';
import axios from 'axios';

// Types based on your backend BookingResponseDto
interface BookingResponseDto {
  id: number;
  vehicleId: number;
  vehicleName?: string;
  vehicleModel?: string;
  vehicleBrand?: string;
  vehicleImage?: string;
  renterId: number;
  renterName?: string;
  ownerId: number;
  ownerName?: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  totalPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'ONGOING' | 'COMPLETED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  updatedAt?: string;
  rating?: number;
  ratingComment?: string;
  hasRated?: boolean;
}

interface BookingsResponse {
  content: BookingResponseDto[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

interface RidesTabProps {
  userId?: string | number;
  token?: string;
  apiBaseUrl?: string;
  onError?: (error: string) => void;
}

export default function RidesTab({
  userId,
  token,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  onError
}: RidesTabProps) {
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // Get token from localStorage if not provided as prop
  const getAuthToken = useCallback(() => {
    if (token) return token;
    try {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) return storedToken;
    } catch (e) {
      console.warn('Could not read token from localStorage:', e);
    }
    return null;
  }, [token]);

  const fetchBookings = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);

      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('Please sign in to view your rides');
      }

      const params: any = {
        page: pageNum,
        size: pageSize,
      };

      const response = await axios.get<BookingsResponse>(
        `${apiBaseUrl}/api/bookings/my-bookings`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          params,
        }
      );

      setBookings(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);

      let errorMessage = 'Failed to load your ride history. Please try again.';

      if (err.response?.status === 401) {
        errorMessage = 'Your session has expired. Please sign in again.';
        if (onError) onError('unauthorized');
      } else if (err.response?.status === 403) {
        errorMessage = 'You don\'t have permission to view these bookings.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, apiBaseUrl, pageSize, onError]);

  useEffect(() => {
    fetchBookings(page);
  }, [page, fetchBookings]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const calculateDuration = (pickup: string, dropoff: string) => {
    try {
      const start = new Date(pickup);
      const end = new Date(dropoff);
      const diff = end.getTime() - start.getTime();

      if (diff <= 0) return '0h';

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else {
        return `${minutes}m`;
      }
    } catch {
      return 'N/A';
    }
  };

  const getVehicleDisplayName = (booking: BookingResponseDto) => {
    if (booking.vehicleName) return booking.vehicleName;
    if (booking.vehicleBrand && booking.vehicleModel) {
      return `${booking.vehicleBrand} ${booking.vehicleModel}`;
    }
    if (booking.vehicleBrand) return booking.vehicleBrand;
    if (booking.vehicleModel) return booking.vehicleModel;
    return `Vehicle #${booking.vehicleId}`;
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    fetchBookings(page);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your rides...</p>
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Unable to Load Rides
          </h4>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-6 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-6">
            <Car size={48} className="text-green-600 dark:text-green-400" />
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            No Rides Yet
          </h4>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
            You haven't booked any vehicles yet. Explore available vehicles and start your first ride today!
          </p>
          <a
            href="/vehicles"
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium inline-block"
          >
            Browse Vehicles
          </a>
        </div>
      </div>
    );
  }

  // Main render with data
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 shadow-sm">
      {/* Header - NO status filter */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-extrabold text-gray-800 dark:text-gray-100 text-lg">
            My Rides
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalElements} {totalElements === 1 ? 'ride' : 'rides'} found
          </p>
        </div>
      </div>

      {/* Bookings list - NOT clickable, NO status badge, duration on right */}
      <div className="space-y-3">
        {bookings.map((booking, index) => (
          <div
            key={booking.id}
            className={`p-4 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 ${index < bookings.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
              }`}
          >
            <div className="flex items-center gap-4">
              {/* Vehicle icon */}
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  {booking.vehicleImage ? (
                    <img
                      src={booking.vehicleImage}
                      alt={getVehicleDisplayName(booking)}
                      className="w-12 h-12 object-cover rounded-xl"
                    />
                  ) : (
                    <Car size={24} className="text-green-600 dark:text-green-400" />
                  )}
                </div>
              </div>

              {/* Main content - vehicle name and date on left */}
              <div className="flex-1 min-w-0">
                {/* Vehicle name */}
                <p className="font-bold text-gray-800 dark:text-gray-100 text-base truncate">
                  {getVehicleDisplayName(booking)}
                </p>

                {/* Date only - NO duration here anymore */}
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  <Calendar size={14} />
                  {formatDate(booking.pickupDate)}
                </div>

                {/* Rating if available */}
                {booking.hasRated && booking.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < (booking.rating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      Rated
                    </span>
                  </div>
                )}
              </div>

              {/* Duration on the right side with clock icon */}
              <div className="flex-shrink-0 ml-4">
                <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
                  <Clock size={16} className="text-gray-400 dark:text-gray-500" />
                  <span className="text-base">
                    {calculateDuration(booking.pickupDate, booking.dropoffDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
            Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalElements)} of {totalElements} rides
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() => handlePageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 text-sm rounded-lg transition-colors ${page === pageNum
                        ? 'bg-green-600 text-white font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}