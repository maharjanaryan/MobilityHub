"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, Loader2, AlertCircle, MapPin, Clock, Gauge,
  RefreshCw, CheckCircle, WifiOff, Radio
} from "lucide-react";
import HomeHeader from "../home/HomeHeader";
import Footer from "../component/Footer";
import type { TrackPoint } from "./TrackingMapView";
import { reverseGeocode } from "./reverseGeocode";

const TrackingMapView = dynamic(() => import("./TrackingMapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

interface LocationResponse {
  bookingId: number;
  renterId: number;
  renterName: string;
  vehicleId: number;
  vehicleName: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  recordedAt: string;
}

interface BookingSummary {
  id: number;
  vehicleName: string;
  renterId: number;
  renterName: string;
  ownerId: number;
  ownerName: string;
  status: string;
  pickupDate: string;
  dropoffDate: string;
  pickupLocation: string;
}

const API_BASE = "http://localhost:8080/api";
const LATEST_POLL_MS = 8000;
const HISTORY_REFRESH_MS = 30000;
const STALE_AFTER_MS = 30000;

export default function TrackingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [current, setCurrent] = useState<LocationResponse | null>(null);
  const [trail, setTrail] = useState<TrackPoint[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ---- Reverse geocoding state ----
  const [currentPlaceName, setCurrentPlaceName] = useState<string>("");
  const [resolvingPlace, setResolvingPlace] = useState(false);
  const lastGeocodedCoordsRef = useRef<string>("");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const historyIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBooking({
          id: data.id || data.bookingId,
          vehicleName: data.vehicleName || `${data.vehicleBrand || ""} ${data.vehicleModel || ""}`.trim(),
          renterId: data.renterId || data.userId,
          renterName: data.renterName || "N/A",
          ownerId: data.ownerId || data.vehicle?.ownerId,
          ownerName: data.ownerName || "N/A",
          status: data.bookingStatus || data.status || "PENDING",
          pickupDate: data.pickupDate || data.startDate || "",
          dropoffDate: data.dropoffDate || data.endDate || "",
          pickupLocation: data.pickupLocation || data.location || "N/A",
        });
      }
    } catch (e) {
      console.warn("Booking detail fetch failed (non-fatal):", e);
    }
  }, [bookingId]);

  const fetchHistory = useCallback(async () => {
    if (!bookingId) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/tracking/${bookingId}/history?limit=300`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: LocationResponse[] = await res.json();
        setTrail(
          data.map((p) => ({
            lat: p.latitude,
            lng: p.longitude,
            speed: p.speed,
            heading: p.heading,
            recordedAt: p.recordedAt,
          }))
        );
      }
    } catch (e) {
      console.warn("History fetch failed:", e);
    }
  }, [bookingId]);

  const fetchLatest = useCallback(async (showSpinner = false) => {
    if (!bookingId) return;
    const token = getToken();
    if (!token) return;

    if (showSpinner) setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/tracking/${bookingId}/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        setError("You don't have permission to view this trip's location.");
        return;
      }
      if (res.status === 404) {
        setError("");
        return;
      }
      if (res.ok) {
        const data: LocationResponse = await res.json();
        setCurrent(data);
        setError("");
        setTrail((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.lat === data.latitude && last.lng === data.longitude) return prev;
          return [...prev, { lat: data.latitude, lng: data.longitude, speed: data.speed, heading: data.heading, recordedAt: data.recordedAt }];
        });
      }
    } catch (e) {
      console.warn("Latest location fetch failed:", e);
    } finally {
      if (showSpinner) setRefreshing(false);
    }
  }, [bookingId]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/signin");
      return;
    }
    if (!bookingId) {
      setError("No booking specified for tracking.");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      await Promise.all([fetchBooking(), fetchHistory(), fetchLatest()]);
      setLoading(false);
    })();
  }, [bookingId, fetchBooking, fetchHistory, fetchLatest, router]);

  // ---- Reverse geocode the current position whenever it moves to a new spot ----
  useEffect(() => {
    if (!current) return;

    const key = `${current.latitude.toFixed(4)},${current.longitude.toFixed(4)}`;
    if (key === lastGeocodedCoordsRef.current) return; // same spot, skip re-lookup

    lastGeocodedCoordsRef.current = key;
    setResolvingPlace(true);

    reverseGeocode(current.latitude, current.longitude)
      .then((result) => {
        setCurrentPlaceName(result?.shortName || "");
      })
      .finally(() => setResolvingPlace(false));
  }, [current]);

  const status = booking?.status?.toUpperCase() || "";
  const isCompleted = status === "COMPLETED";
  const isCancelledOrRejected = ["CANCELLED", "REJECTED"].includes(status);
  const isNotStartedYet = status === "PENDING" || status === "CONFIRMED" || status === "APPROVED";
  const isTrackable = status === "ACTIVE";

  useEffect(() => {
    if (!bookingId || !isTrackable) return;

    pollIntervalRef.current = setInterval(() => fetchLatest(), LATEST_POLL_MS);
    historyIntervalRef.current = setInterval(() => fetchHistory(), HISTORY_REFRESH_MS);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (historyIntervalRef.current) clearInterval(historyIntervalRef.current);
    };
  }, [bookingId, isTrackable, fetchLatest, fetchHistory]);

  const isStale = current ? Date.now() - new Date(current.recordedAt).getTime() > STALE_AFTER_MS : false;
  const isLive = !!current && !isStale && isTrackable;

  const vehicleDisplayName = booking?.vehicleName || current?.vehicleName || "Vehicle";

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading trip tracking...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-shrink-0">
        <HomeHeader />
      </div>

      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Sidebar */}
        <div className="w-full sm:w-96 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-xl z-[999] absolute sm:relative">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Live Tracking</h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isLive
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
              >
                <Radio className={`w-3 h-3 ${isLive ? "animate-pulse" : ""}`} />
                {isLive ? "Live" : isTrackable ? "Waiting..." : "Ended"}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{vehicleDisplayName}</p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {isCompleted && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Trip completed</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    Live tracking has ended for this booking. Here's the final route.
                  </p>
                </div>
              </div>
            )}

            {isCancelledOrRejected && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  This booking was {booking?.status?.toLowerCase()}. Tracking isn't available.
                </p>
              </div>
            )}

            {isNotStartedYet && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This trip hasn't started yet. Tracking begins automatically once the renter starts their trip.
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {isTrackable && !current && !error && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-start gap-2">
                <WifiOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">No location data yet</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
                    Waiting for the renter's device to send its first location update. This happens automatically in the background — no action needed from them.
                  </p>
                </div>
              </div>
            )}

            {current && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5" /> Speed
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-1">
                    {typeof current.speed === "number" ? `${current.speed.toFixed(0)} km/h` : "—"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Last Update
                  </p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">
                    {new Date(current.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            )}

            {booking && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {resolvingPlace ? (
                      <span className="inline-flex items-center gap-1.5 text-gray-400">
                        <Loader2 className="w-3 h-3 animate-spin" /> Locating...
                      </span>
                    ) : currentPlaceName ? (
                      currentPlaceName
                    ) : (
                      booking.pickupLocation
                    )}
                  </span>
                </div>
                {booking.dropoffDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Return by {new Date(booking.dropoffDate).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Renter: {booking.renterName}
                </div>
              </div>
            )}

            <button
              onClick={() => fetchLatest(true)}
              disabled={refreshing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh Now
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-0">
          <TrackingMapView
            current={current ? { lat: current.latitude, lng: current.longitude, speed: current.speed, heading: current.heading, recordedAt: current.recordedAt } : null}
            trail={trail}
            vehicleName={vehicleDisplayName}
            isLive={isLive}
            placeName={currentPlaceName}
          />
        </div>
      </div>

      <div className="hidden">
        <Footer />
      </div>
    </div>
  );
}