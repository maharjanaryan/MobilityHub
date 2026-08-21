"use client";

import { useEffect, useRef, useState } from "react";

interface ActiveBookingLite {
  id: number;
  bookingStatus: string;
}

const API_BASE = "http://localhost:8080/api";
const CHECK_ACTIVE_TRIP_MS = 60000;
const SEND_INTERVAL_MS = 12000;

export default function ActiveTripLocationSender() {
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const sendIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);

  useEffect(() => {
    const checkForActiveTrip = async () => {
      const token = getToken();
      if (!token) {
        setActiveBookingId(null);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/bookings/my-bookings?status=ACTIVE&page=0&size=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const content: ActiveBookingLite[] = data.content || data || [];
        const active = Array.isArray(content)
          ? content.find((b) => b.bookingStatus?.toUpperCase() === "ACTIVE")
          : null;
        console.log("[ActiveTripLocationSender] checked for active trip:", active ? `found booking ${active.id}` : "none found", content);
        setActiveBookingId(active ? active.id : null);
      } catch (e) {
        console.warn("[ActiveTripLocationSender] failed to check for active trip", e);
      }
    };

    checkForActiveTrip();
    checkIntervalRef.current = setInterval(checkForActiveTrip, CHECK_ACTIVE_TRIP_MS);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!activeBookingId) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      console.warn("[ActiveTripLocationSender] geolocation not supported");
      return;
    }

    console.log("[ActiveTripLocationSender] starting GPS watch for booking", activeBookingId);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        lastPositionRef.current = pos;
      },
      (err) => {
        console.warn("[ActiveTripLocationSender] geolocation error:", err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    const sendPosition = async () => {
      const pos = lastPositionRef.current;
      if (!pos) {
        console.log("[ActiveTripLocationSender] no GPS fix yet, skipping send");
        return;
      }
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/tracking/${activeBookingId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speed: pos.coords.speed ? pos.coords.speed * 3.6 : null,
            heading: pos.coords.heading,
            accuracy: pos.coords.accuracy,
          }),
        });
        console.log("[ActiveTripLocationSender] send result:", res.status);
      } catch (e) {
        console.warn("[ActiveTripLocationSender] failed to send location", e);
      }
    };

    sendIntervalRef.current = setInterval(sendPosition, SEND_INTERVAL_MS);
    const initialTimeout = setTimeout(sendPosition, 2000);

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (sendIntervalRef.current) clearInterval(sendIntervalRef.current);
      clearTimeout(initialTimeout);
    };
  }, [activeBookingId]);

  return null;
}