"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, Users, Gauge, Leaf, ChevronLeft,
  ChevronRight, Shield, Images, Calendar, Loader2, Car,
  Fuel, MapPin, Palette, Hash, Luggage, Banknote, Clock,
  CheckCircle2, FileText, Timer, DoorOpen, X, User, IdCard,
  FileCheck, AlertTriangle, ScrollText, Home, Navigation, Percent
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeHeader from "../../../home/HomeHeader";
import Footer from "../../../component/Footer";
import PaymentModal from "../../../component/payment/PaymentModal";
import RenterLocationPicker from "../../../component/RenterLocationPicker";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Vehicle {
  id: number;
  name: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  vin?: string;
  category: string;
  img: string;
  price: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  securityDeposit?: number;
  rating: number;
  range: string;
  charge: number;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  tags: string[];
  features: string[];
  badge?: string;
  seats?: number;
  doors?: number;
  luggageCapacity?: number;
  speed: string;
  driveType?: string;
  transmission?: string;
  fuelType?: string;
  availableFrom?: string;
  availableTo?: string;
  minRentalDays?: number;
  maxRentalDays?: number;
  extraImages?: string[];
  description?: string;
  terms?: string;
  host?: { name: string; avatar?: string; trips: number };
  co2Saved?: string;
}

interface BookingResponse {
  id: number;
  bookingReference: string;
  vehicleId: number;
  vehicleName: string;
  bookingStatus: string;
  totalAmount: number;
  createdAt: string;
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Commission Configuration
// ─────────────────────────────────────────────────────────────────────────────
const COMMISSION_RATE = 0.08; // 8% service fee
const COMMISSION_LABEL = "Service Fee";

// ─────────────────────────────────────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────────────────────────────────────
const getAuthToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("accessToken") || localStorage.getItem("token")
    : null;

const clearAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────────────────────────
const titleCase = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "Not provided";
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
};

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "Rs. 0";
  return `Rs. ${Number(value).toLocaleString()}`;
};

const getTomorrowInNepal = (): Date => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Small UI components
// ─────────────────────────────────────────────────────────────────────────────
function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">{label}</p>
          <p className="mt-1 break-words text-sm font-semibold text-gray-800 dark:text-gray-100">{value || "Not provided"}</p>
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendar component
// ─────────────────────────────────────────────────────────────────────────────
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { return (new Date(year, month, 1).getDay() + 6) % 7; }

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

interface CalendarProps {
  selected: [Date | null, Date | null];
  onChange: (sel: [Date | null, Date | null]) => void;
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  bookedDates?: Date[];
}

function MiniCalendar({ selected, onChange, year, month, onPrev, onNext, bookedDates = [] }: CalendarProps) {
  const days = getDaysInMonth(year, month);
  const offset = getFirstDayOfMonth(year, month);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = getTomorrowInNepal();
  tomorrow.setHours(0, 0, 0, 0);

  const dayDate = (d: number) => new Date(year, month, d);

  const isBooked = (d: number) => bookedDates.some(bd => isSameDay(new Date(bd), dayDate(d)));
  const isDisabled = (d: number) => dayDate(d) < tomorrow || isBooked(d);

  const isSelected = (d: number) => {
    const dt = dayDate(d);
    return (selected[0] && isSameDay(dt, selected[0])) ||
      (selected[1] && isSameDay(dt, selected[1]));
  };

  const inRange = (d: number) => {
    const dt = dayDate(d);
    return !!(selected[0] && selected[1] && dt > selected[0] && dt < selected[1]);
  };

  const handleDay = (d: number) => {
    if (isDisabled(d)) return;
    const clicked = dayDate(d);
    const [start, end] = selected;

    if (!start || (start && end)) {
      onChange([clicked, null]);
    } else {
      if (clicked < start) {
        onChange([clicked, start]);
      } else if (isSameDay(clicked, start)) {
        onChange([null, null]);
      } else {
        onChange([start, clicked]);
      }
    }
  };

  const isToday = (d: number) => isSameDay(dayDate(d), today);

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-[13px] text-gray-800 dark:text-gray-100">{MONTHS[month]} {year}</span>
        <div className="flex gap-1">
          <button onClick={onPrev} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ChevronLeft className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          </button>
          <button onClick={onNext} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ChevronRight className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const sel = isSelected(d);
          const range = inRange(d);
          const booked = isBooked(d);
          const disabled = isDisabled(d);

          return (
            <button
              key={d}
              disabled={disabled}
              onClick={() => handleDay(d)}
              className={[
                "relative text-[11px] font-medium w-full aspect-square rounded flex items-center justify-center transition-all",
                disabled ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed line-through" : "cursor-pointer",
                sel ? "bg-emerald-600 text-white shadow-sm z-10" : "",
                range ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-none" : "",
                !sel && !range && !disabled ? "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300" : "",
                isToday(d) && !sel && !disabled ? "ring-1 ring-emerald-400 font-bold" : "",
              ].join(" ")}
            >
              {d}
              {booked && !sel && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Terms & Conditions Modal
// ─────────────────────────────────────────────────────────────────────────────
interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  loading?: boolean;
}

function TermsModal({ isOpen, onClose, onAccept, loading = false }: TermsModalProps) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
              <ScrollText className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Vehicle Rental Agreement</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Please read and accept the terms below</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-300 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              By proceeding with this booking, you agree to all the terms and conditions outlined below.
            </p>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                Booking Confirmation
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>A booking is confirmed only after successful payment.</li>
                <li>Users must provide valid and accurate information during booking.</li>
                <li>The rented vehicle can only be used during the selected rental duration.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                Security Deposit
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>A refundable security deposit may be required before the rental starts.</li>
                <li>The deposit may be deducted for vehicle damage, missing accessories, late return charges, or traffic fines.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                Vehicle Return Policy
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>The vehicle must be returned on or before the agreed return time.</li>
                <li>Late returns may result in additional charges.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                Delivery Location
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300 list-disc pl-6">
                <li>You must provide your delivery location where the vehicle will be delivered.</li>
                <li>The vehicle will be delivered to the location you specify during booking.</li>
                <li>Please ensure the delivery location is accurate and accessible.</li>
              </ul>
            </section>

            <section className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                Acceptance of Terms
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                By proceeding with the booking, the user confirms that they have read, understood,
                and agreed to these Terms & Conditions.
              </p>
            </section>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-gray-300 dark:border-gray-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="acceptTerms" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              I have read and agree to all the Terms & Conditions
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button
              onClick={onAccept}
              disabled={!accepted || loading}
              className={[
                "flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2",
                (!accepted || loading) ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"
              ].join(" ")}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Accept & Continue</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<BookingResponse | null>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [driverInfo, setDriverInfo] = useState({ name: "", licenseNumber: "" });

  const [renterLocation, setRenterLocation] = useState<Location>({
    lat: 27.7172,
    lng: 85.324,
    address: ""
  });

  const [activeImg, setActiveImg] = useState(0);
  const [insurance, setInsurance] = useState<"premium" | "standard">("standard");
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  // Resolve params
  useEffect(() => {
    params.then(p => setVehicleId(p.id));
  }, [params]);

  // Fetch booked dates
  const fetchBookedDates = useCallback(async () => {
    if (!vehicleId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/bookings/vehicle/${vehicleId}/booked-dates`);
      if (res.ok) {
        const dates: string[] = await res.json();
        setBookedDates(dates.map(d => new Date(d)));
      }
    } catch (e) {
      console.error("Error fetching booked dates:", e);
    }
  }, [vehicleId]);

  // Fetch vehicle data
  const fetchVehicleData = useCallback(async () => {
    if (!vehicleId) return;
    try {
      setLoading(true);
      setError(null);

      let res = await fetch(`http://localhost:8080/api/vehicles/${vehicleId}`);

      if (res.status === 401) {
        const token = getAuthToken();
        if (token) {
          res = await fetch(`http://localhost:8080/api/vehicles/${vehicleId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        if (!res || !res.ok) throw new Error("Authentication failed. Please login to view vehicle details.");
      } else if (!res.ok) {
        throw new Error(`Failed to fetch vehicle (Status: ${res.status})`);
      }

      transformAndSetVehicle(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vehicle details");
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  const transformAndSetVehicle = (data: any) => {
    setVehicle({
      id: data.id,
      name: `${data.brand} ${data.model}`,
      brand: data.brand,
      model: data.model,
      year: data.year,
      color: data.color,
      licensePlate: data.licensePlate,
      vin: data.vin,
      category: data.fuelType || "Electric",
      img: data.photos?.length ? data.photos[0] : "https://via.placeholder.com/600x400?text=Vehicle",
      price: data.pricePerDay || 0,
      pricePerWeek: data.pricePerWeek,
      pricePerMonth: data.pricePerMonth,
      securityDeposit: data.securityDeposit,
      rating: data.averageRating || 4.5,
      range: data.range || (data.fuelType === "Electric" ? "400 km" : "600 km"),
      charge: data.charge || 80,
      location: [data.city, data.state].filter(Boolean).join(", ") || "Unknown Location",
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      latitude: data.latitude,
      longitude: data.longitude,
      tags: [data.transmission, data.seats ? `${data.seats} Seats` : undefined,
      data.fuelType, data.year, data.color].filter(Boolean).map(String),
      features: Array.isArray(data.features) ? data.features : [],
      seats: data.seats || 4,
      doors: data.doors,
      luggageCapacity: data.luggageCapacity,
      speed: data.speed || "200 km/h",
      driveType: data.driveType || titleCase(data.transmission),
      transmission: data.transmission,
      fuelType: data.fuelType,
      availableFrom: data.availableFrom,
      availableTo: data.availableTo,
      minRentalDays: data.minRentalDays ?? 1,
      maxRentalDays: data.maxRentalDays ?? 30,
      extraImages: data.photos?.length > 1 ? data.photos.slice(1) : [],
      description: data.description || `Experience the ${data.brand} ${data.model}.`,
      terms: data.terms,
      host: { name: data.ownerName || "Premium Host", trips: data.hostTrips || 124 },
      co2Saved: data.co2Saved,
    });
  };

  useEffect(() => {
    if (vehicleId) { fetchVehicleData(); fetchBookedDates(); }
  }, [vehicleId, fetchVehicleData, fetchBookedDates]);

  const prevMonth = () => calMonth === 0 ? (setCalMonth(11), setCalYear(y => y - 1)) : setCalMonth(m => m - 1);
  const nextMonth = () => calMonth === 11 ? (setCalMonth(0), setCalYear(y => y + 1)) : setCalMonth(m => m + 1);

  const insuranceCost = insurance === "premium" ? 45 : 22;

  const rentalDays = (() => {
    if (!dateRange[0] || !dateRange[1]) return 0;
    const ms = dateRange[1].getTime() - dateRange[0].getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
  })();

  const calculateCommission = (subtotal: number): number => {
    return Math.round(subtotal * COMMISSION_RATE);
  };

  const getPriceBreakdown = () => {
    if (!vehicle || rentalDays === 0) {
      return { rentalSubtotal: 0, insuranceTotal: 0, commission: 0, deposit: 0, total: 0 };
    }

    const rentalSubtotal = vehicle.price * rentalDays;
    const insuranceTotal = insuranceCost * rentalDays;
    const commission = calculateCommission(rentalSubtotal + insuranceTotal);
    const deposit = vehicle.securityDeposit || 0;
    const total = rentalSubtotal + insuranceTotal + commission + deposit;

    return { rentalSubtotal, insuranceTotal, commission, deposit, total };
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    console.log('📍 Vehicle page received location:', { lat, lng, address });
    setRenterLocation({ lat, lng, address });
  };

  const handleProceedToBook = () => {
    if (!getAuthToken()) { router.push("/signin"); return; }
    if (!dateRange[0] || !dateRange[1]) { alert("Please select pickup and dropoff dates"); return; }
    if (rentalDays < 1) { alert("Dropoff date must be after pickup date"); return; }

    if (!renterLocation.address) {
      alert("Please select your delivery location first");
      return;
    }

    const tomorrow = getTomorrowInNepal();
    tomorrow.setHours(0, 0, 0, 0);
    const pickup = new Date(dateRange[0]);
    pickup.setHours(0, 0, 0, 0);

    if (pickup < tomorrow) {
      alert("Pickup date must be at least tomorrow");
      return;
    }

    setShowTermsModal(true);
  };

  const handleAcceptTerms = () => {
    setShowTermsModal(false);
    setShowDriverModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!driverInfo.name.trim() || !driverInfo.licenseNumber.trim()) {
      alert("Please enter driver name and license number");
      return;
    }
    if (!vehicle || !dateRange[0] || !dateRange[1]) return;
    if (!renterLocation.address) {
      alert("Please select your delivery location");
      return;
    }

    setBookingLoading(true);
    const token = getAuthToken();

    try {
      const pickupDate = new Date(dateRange[0]);
      const dropoffDate = new Date(dateRange[1]);
      const pickupDateStr = formatDateForAPI(pickupDate);
      const dropoffDateStr = formatDateForAPI(dropoffDate);

      console.log('📅 Dates for API:', { pickupDateStr, dropoffDateStr });

      const availRes = await fetch(
        `http://localhost:8080/api/bookings/check-availability` +
        `?vehicleId=${vehicle.id}` +
        `&pickupDate=${pickupDateStr}` +
        `&dropoffDate=${dropoffDateStr}`
      );

      if (!availRes.ok) {
        const errorText = await availRes.text();
        console.error("Availability check failed:", availRes.status, errorText);
        throw new Error("Failed to check availability");
      }

      const { available } = await availRes.json();
      if (!available) {
        alert("Selected dates are not available. Please choose different dates.");
        setBookingLoading(false);
        setShowDriverModal(false);
        return;
      }

      const bookingRequest = {
        vehicleId: vehicle.id,
        pickupDate: pickupDateStr,
        dropoffDate: dropoffDateStr,
        insuranceType: insurance,
        driverName: driverInfo.name,
        driverLicenseNumber: driverInfo.licenseNumber,
        paymentMethod: "PENDING",
        renterLocation: renterLocation.address,
        renterLatitude: renterLocation.lat,
        renterLongitude: renterLocation.lng,
      };

      console.log("📤 Sending booking request:", bookingRequest);

      const res = await fetch("http://localhost:8080/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingRequest),
      });

      const responseText = await res.text();
      console.log("📥 Response status:", res.status);
      console.log("📥 Response body:", responseText);

      if (res.status === 401) {
        clearAuthToken();
        alert("Session expired. Please login again.");
        router.push("/signin");
        return;
      }

      if (!res.ok) {
        let errorMessage = "Failed to create booking";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = JSON.parse(responseText);
      console.log("✅ Booking created:", result);

      setShowDriverModal(false);
      setDriverInfo({ name: "", licenseNumber: "" });

      setPendingBookingId(result.id);
      setPendingAmount(result.totalAmount);
      setShowPaymentModal(true);
      setBookingLoading(false);

    } catch (e) {
      console.error("Booking error:", e);
      alert(e instanceof Error ? e.message : "Failed to create booking. Please try again.");
      setBookingLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    await fetchBookedDates();
    setShowPaymentModal(false);
    setPendingBookingId(null);
    setPendingAmount(0);

    alert("Payment successful! Your booking is confirmed.");
    router.push("/my-bookings");
  };

  const breakdown = getPriceBreakdown();

  // Loading State
  if (loading) return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-gray-950">
      <HomeHeader />
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading vehicle details...</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  // Error State
  if (error) return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-gray-950">
      <HomeHeader />
      <div className="flex items-center justify-center h-[60vh] px-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-600 dark:text-red-300 font-semibold mb-2">Error Loading Vehicle</p>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              {error.includes("login") || error.includes("Authentication") ? (
                <button onClick={() => router.push("/signin")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">Go to Login</button>
              ) : (
                <button onClick={fetchVehicleData} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">Try Again</button>
              )}
              <Link href="/vehicles" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">Browse Vehicles</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (!vehicle) return null;

  const images = [vehicle.img, ...(vehicle.extraImages ?? [])].slice(0, 5);
  const isElectric = vehicle.fuelType?.toLowerCase() === "electric";

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-gray-950">
      <HomeHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-2">
        <Link href="/vehicles" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to marketplace
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT COLUMN - Vehicle Details */}
          <div className="flex-1 min-w-0">
            {/* Gallery */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden h-[320px] sm:h-[380px]">
              <div className="relative col-span-1 row-span-2 overflow-hidden cursor-pointer bg-gray-200 dark:bg-gray-700" onClick={() => setActiveImg(0)}>
                <img src={images[activeImg] || images[0]} alt={vehicle.name} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                <div className="absolute bottom-2 left-2 bg-black/40 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">{vehicle.name}</div>
              </div>
              <div className="grid grid-rows-2 gap-2">
                {[1, 2].map(idx => (
                  <div key={idx} className="relative overflow-hidden cursor-pointer bg-gray-200 dark:bg-gray-700" onClick={() => setActiveImg(idx)}>
                    <img src={images[idx] || images[0]} alt={`View ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                    {idx === 2 && images.length > 3 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1.5 text-white font-semibold text-sm">
                        <Images className="w-4 h-4" />+{images.length - 3} Photos
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mt-6 flex flex-wrap items-start gap-3 justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{vehicle.name}</h1>
                <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-300 font-semibold">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />{vehicle.rating}
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span>{vehicle.host?.trips || 124} trips completed</span>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">{vehicle.location}</span>
                </div>
              </div>
              {vehicle.host && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="text-gray-400 dark:text-gray-400">HOSTED BY</span>
                  <div className="w-9 h-9 rounded-full bg-emerald-200 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    {vehicle.host.name.charAt(0)}
                  </div>
                  <span className="font-semibold dark:text-gray-200">{vehicle.host.name}</span>
                </div>
              )}
            </div>

            {/* Specs */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { icon: <Gauge className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />, label: "TRANSMISSION", value: titleCase(vehicle.transmission || vehicle.driveType) },
                { icon: <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />, label: "CAPACITY", value: `${vehicle.seats || 5} Seats` },
                { icon: <Fuel className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />, label: "FUEL TYPE", value: titleCase(vehicle.fuelType || vehicle.category) },
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700 shadow-sm">
                  {s.icon}
                  <p className="text-[9px] font-bold text-gray-400 dark:text-gray-400 mt-2 tracking-widest">{s.label}</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Eco banner */}
            {isElectric && (
              <div className="mt-5 bg-emerald-900 dark:bg-emerald-950 text-white rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20"><Leaf className="w-20 h-20 text-emerald-400" /></div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 dark:bg-emerald-800 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="font-bold text-base">Make an impact.</p>
                    <p className="text-emerald-200 dark:text-emerald-300 text-sm mt-1 leading-relaxed max-w-sm">
                      By choosing this electric vehicle for your {rentalDays}-day trip, you'll reduce your carbon footprint significantly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-7">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Vehicle Description</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{vehicle.description}</p>
            </div>

            <DetailSection title="Vehicle Information">
              <DetailItem icon={<Car className="h-4 w-4" />} label="Brand & Model" value={`${vehicle.brand || "Vehicle"} ${vehicle.model || ""}`.trim()} />
              <DetailItem icon={<Calendar className="h-4 w-4" />} label="Year" value={vehicle.year || "Not provided"} />
              <DetailItem icon={<Palette className="h-4 w-4" />} label="Color" value={titleCase(vehicle.color)} />
              <DetailItem icon={<Hash className="h-4 w-4" />} label="License Plate" value={vehicle.licensePlate || "Not provided"} />
              <DetailItem icon={<DoorOpen className="h-4 w-4" />} label="Doors" value={vehicle.doors ? `${vehicle.doors} doors` : "Not provided"} />
              <DetailItem icon={<Luggage className="h-4 w-4" />} label="Luggage Capacity" value={vehicle.luggageCapacity !== undefined ? `${vehicle.luggageCapacity} bags` : "Not provided"} />
              <DetailItem icon={<Users className="h-4 w-4" />} label="Seats" value={vehicle.seats ? `${vehicle.seats} seats` : "Not provided"} />
            </DetailSection>

            <DetailSection title="Pricing & Rental Rules">
              <DetailItem icon={<Banknote className="h-4 w-4" />} label="Daily Price" value={formatCurrency(vehicle.price)} />
              <DetailItem icon={<Banknote className="h-4 w-4" />} label="Weekly Price" value={formatCurrency(vehicle.pricePerWeek)} />
              <DetailItem icon={<Banknote className="h-4 w-4" />} label="Monthly Price" value={formatCurrency(vehicle.pricePerMonth)} />
              <DetailItem icon={<Shield className="h-4 w-4" />} label="Security Deposit" value={formatCurrency(vehicle.securityDeposit)} />
              <DetailItem icon={<Timer className="h-4 w-4" />} label="Minimum Rental" value={vehicle.minRentalDays ? `${vehicle.minRentalDays} day${vehicle.minRentalDays > 1 ? "s" : ""}` : "Not set"} />
              <DetailItem icon={<Clock className="h-4 w-4" />} label="Maximum Rental" value={vehicle.maxRentalDays ? `${vehicle.maxRentalDays} day${vehicle.maxRentalDays > 1 ? "s" : ""}` : "Not set"} />
            </DetailSection>

            <DetailSection title="Pickup Location">
              <DetailItem icon={<MapPin className="h-4 w-4" />} label="Address" value={vehicle.address || "Not provided"} />
              <DetailItem icon={<MapPin className="h-4 w-4" />} label="City" value={vehicle.city || "Not provided"} />
              <DetailItem icon={<MapPin className="h-4 w-4" />} label="State" value={vehicle.state || "Not provided"} />
              <DetailItem icon={<Hash className="h-4 w-4" />} label="ZIP Code" value={vehicle.zipCode || "Not provided"} />
            </DetailSection>

            {vehicle.features.length > 0 && (
              <section className="mt-7">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Features & Amenities</h2>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {vehicle.features.map(f => (
                    <div key={f} className="flex items-center gap-2 rounded-lg border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />{titleCase(f)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {vehicle.terms && (
              <section className="mt-7 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Owner Terms</h2>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">{vehicle.terms}</p>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN - Booking Card */}
          <div className="lg:w-[320px] xl:w-[340px] flex-shrink-0">
            <div className="sticky top-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 space-y-5">

              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-gray-900 dark:text-gray-100">{formatCurrency(vehicle.price)}</span>
                <span className="text-sm text-gray-400 dark:text-gray-500 pb-0.5">/ day</span>
              </div>

              {/* RENTER LOCATION SELECTOR */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" /> Your Delivery Location
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={renterLocation.address || ''}
                    readOnly
                    placeholder="Select your delivery location on map"
                    className={`flex-1 px-3 py-2 text-sm border rounded-lg cursor-pointer truncate ${renterLocation.address
                      ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    onClick={() => setShowLocationPicker(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition flex items-center gap-1.5 text-sm whitespace-nowrap"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="hidden sm:inline">Select</span>
                  </button>
                </div>
                {renterLocation.address ? (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Location confirmed
                  </p>
                ) : (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                    ⚠️ Please select your delivery location
                  </p>
                )}
              </div>

              {/* Calendar */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Dates & Availability
                </p>
                <MiniCalendar
                  selected={dateRange}
                  onChange={setDateRange}
                  year={calYear}
                  month={calMonth}
                  onPrev={prevMonth}
                  onNext={nextMonth}
                  bookedDates={bookedDates}
                />
                {dateRange[0] && dateRange[1] && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
                    {rentalDays} rental day{rentalDays !== 1 ? "s" : ""} selected
                    <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">
                      ({formatDateForAPI(dateRange[0])} → {formatDateForAPI(dateRange[1])})
                    </span>
                  </p>
                )}
              </div>

              {/* Insurance */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Insurance Protection
                </p>
                <div className="space-y-2">
                  {(["standard", "premium"] as const).map(plan => (
                    <button
                      key={plan}
                      onClick={() => setInsurance(plan)}
                      className={[
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all",
                        insurance === plan
                          ? "border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm"
                          : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600",
                      ].join(" ")}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${insurance === plan ? "border-emerald-500 dark:border-emerald-400 bg-emerald-500 dark:bg-emerald-400" : "border-gray-300 dark:border-gray-500"}`}>
                        {insurance === plan && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 capitalize">{plan}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                          {plan === "premium" ? "Zero deductible, full coverage" : "Standard coverage, Rs. 500 deductible"}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        +{formatCurrency(plan === "premium" ? 45 : 22)}/d
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price breakdown with COMMISSION */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
                <div className="flex justify-between">
                  <span>Rental ({rentalDays} day{rentalDays !== 1 ? "s" : ""})</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(breakdown.rentalSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insurance</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(breakdown.insuranceTotal)}</span>
                </div>
                <div className="flex justify-between text-blue-600 dark:text-blue-400">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    {COMMISSION_LABEL} ({(COMMISSION_RATE * 100).toFixed(0)}%)
                  </span>
                  <span className="font-semibold">{formatCurrency(breakdown.commission)}</span>
                </div>
                {!!vehicle.securityDeposit && vehicle.securityDeposit > 0 && (
                  <div className="flex justify-between">
                    <span>Security deposit</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(breakdown.deposit)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-gray-100 text-sm">
                  <span>Total</span>
                  <span>{formatCurrency(breakdown.total)}</span>
                </div>

                <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-700/50">
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Percent className="w-2.5 h-2.5" />
                    {COMMISSION_LABEL} helps us provide a secure platform and 24/7 support
                  </p>
                </div>
              </div>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={handleProceedToBook}
                disabled={!dateRange[0] || !dateRange[1] || rentalDays < 1 || !renterLocation.address}
                className={[
                  "w-full py-3.5 bg-emerald-600 dark:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 transition flex items-center justify-center gap-2",
                  (!dateRange[0] || !dateRange[1] || rentalDays < 1 || !renterLocation.address) ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700 dark:hover:bg-emerald-600",
                ].join(" ")}
              >
                Request to Book <ChevronRight className="w-4 h-4" />
              </motion.button>

              <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
                You will be redirected to payment after confirming booking details.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* RENTER LOCATION PICKER MODAL */}
      <RenterLocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLat={renterLocation.lat}
        initialLng={renterLocation.lng}
        initialAddress={renterLocation.address}
        vehicleAddress={vehicle.address || vehicle.location}
      />

      {/* Terms & Conditions Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
        loading={bookingLoading}
      />

      {/* Driver Info Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Driver Information</h2>
              <button onClick={() => setShowDriverModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Driver Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    value={driverInfo.name}
                    onChange={e => setDriverInfo({ ...driverInfo, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                    placeholder="Enter driver's full name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Driver License Number *</label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    value={driverInfo.licenseNumber}
                    onChange={e => setDriverInfo({ ...driverInfo, licenseNumber: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                    placeholder="Enter driver license number"
                  />
                </div>
              </div>

              {renterLocation.address && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Your Delivery Location</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {renterLocation.address}
                  </p>
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={bookingLoading}
                className="w-full py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bookingLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  : <><CheckCircle2 className="w-4 h-4" /> Confirm Booking</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {pendingBookingId && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPendingBookingId(null);
            setPendingAmount(0);
          }}
          bookingId={pendingBookingId}
          amount={pendingAmount}
          serviceFee={breakdown.commission}
          insuranceFee={breakdown.insuranceTotal}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      <Footer />
    </div>
  );
}