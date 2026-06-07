"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, Users, Gauge, Leaf, ChevronLeft,
  ChevronRight, Shield, Images, Calendar, Loader2, Car,
  Fuel, MapPin, Palette, Hash, Luggage, Banknote, Clock,
  CheckCircle2, FileText, Navigation, Timer, DoorOpen
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeHeader from "../../../home/HomeHeader";
import Footer from "../../../component/Footer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Helper – month calendar
// ---------------------------------------------------------------------------
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

interface CalendarProps {
  selected: [number | null, number | null];
  onChange: (sel: [number | null, number | null]) => void;
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

function MiniCalendar({ selected, onChange, year, month, onPrev, onNext }: CalendarProps) {
  const days = getDaysInMonth(year, month);
  const offset = getFirstDayOfMonth(year, month);
  const today = new Date();
  const todayDay = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1;

  const unavailable = new Set([3, 4, 12, 13, 19]);

  function handleDay(d: number) {
    if (unavailable.has(d)) return;
    const [start, end] = selected;
    if (!start || (start && end)) {
      onChange([d, null]);
    } else {
      if (d < start) onChange([d, start]);
      else onChange([start, d]);
    }
  }

  function inRange(d: number) {
    const [s, e] = selected;
    return s && e && d > s && d < e;
  }

  function isSelected(d: number) {
    return d === selected[0] || d === selected[1];
  }

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-[13px] text-gray-800">
          {MONTHS[month]} {year}
        </span>
        <div className="flex gap-1">
          <button onClick={onPrev} className="p-1 rounded hover:bg-gray-100 transition">
            <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button onClick={onNext} className="p-1 rounded hover:bg-gray-100 transition">
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const sel = isSelected(d);
          const range = inRange(d);
          const unav = unavailable.has(d);
          const isToday = d === todayDay;
          return (
            <button
              key={d}
              disabled={unav}
              onClick={() => handleDay(d)}
              className={[
                "relative text-[11px] font-medium w-full aspect-square rounded flex items-center justify-center transition-all",
                unav ? "text-gray-300 cursor-not-allowed line-through" : "cursor-pointer",
                sel ? "bg-emerald-600 text-white shadow-sm z-10" : "",
                range ? "bg-emerald-100 text-emerald-800 rounded-none" : "",
                !sel && !range && !unav ? "hover:bg-gray-100 text-gray-700" : "",
                isToday && !sel ? "ring-1 ring-emerald-400 font-bold" : "",
              ].join(" ")}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
  }
  return null;
};

const titleCase = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "Not provided";
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
};

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "Not set";
  return `Rs. ${Number(value).toLocaleString()}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
          <p className="mt-1 break-words text-sm font-semibold text-gray-800">{value || "Not provided"}</p>
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<string | null>(null);

  const [activeImg, setActiveImg] = useState(0);
  const [insurance, setInsurance] = useState<"premium" | "standard">("premium");
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [dateRange, setDateRange] = useState<[number | null, number | null]>([null, null]);

  // Resolve params
  useEffect(() => {
    params.then((p) => {
      setVehicleId(p.id);
    });
  }, [params]);

  const fetchVehicleData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();

      if (!token) {
        setError('Please login to view vehicle details');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:8080/api/vehicles/${vehicleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        setError('Session expired. Please login again.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch vehicle (Status: ${response.status})`);
      }

      const data = await response.json();

      // Transform API data to match Vehicle interface
      const transformedVehicle: Vehicle = {
        id: data.id,
        name: `${data.brand} ${data.model}`,
        brand: data.brand,
        model: data.model,
        year: data.year,
        color: data.color,
        licensePlate: data.licensePlate,
        vin: data.vin,
        category: data.fuelType || "Electric",
        img: data.photos && data.photos.length > 0 ? data.photos[0] : "https://via.placeholder.com/600x400?text=Vehicle",
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
        tags: [
          data.transmission,
          data.seats ? `${data.seats} Seats` : undefined,
          data.fuelType,
          data.year,
          data.color
        ].filter(Boolean).map(String),
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
        minRentalDays: data.minRentalDays ?? data.minimumRentalDays,
        maxRentalDays: data.maxRentalDays ?? data.maximumRentalDays,
        extraImages: data.photos && data.photos.length > 1 ? data.photos.slice(1) : [],
        description: data.description || `Experience the ${data.brand} ${data.model} - a perfect blend of performance and comfort.`,
        terms: data.terms,
        host: {
          name: data.ownerName || "Premium Host",
          trips: data.hostTrips || 124
        },
        co2Saved: data.co2Saved
      };

      setVehicle(transformedVehicle);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      setError(error instanceof Error ? error.message : 'Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  // Fetch vehicle data
  useEffect(() => {
    if (vehicleId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchVehicleData();
    }
  }, [vehicleId, fetchVehicleData]);

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  }

  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  }

  const insuranceCost = insurance === "premium" ? 45 : 22;
  const days = dateRange[0] && dateRange[1] ? dateRange[1] - dateRange[0] + 1 : 1;
  const discount = 13;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb]">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading vehicle details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error State with Login Option
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fb]">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center h-[60vh] px-4">
          <div className="text-center max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 font-semibold mb-2">Error Loading Vehicle</p>
              <p className="text-gray-600 text-sm mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                {error.includes('login') || error.includes('Session expired') ? (
                  <button
                    onClick={() => router.push('/signin')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    Go to Login
                  </button>
                ) : (
                  <button
                    onClick={fetchVehicleData}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    Try Again
                  </button>
                )}
                <Link
                  href="/vehicles"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Browse Vehicles
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  const images = [vehicle.img, ...(vehicle.extraImages ?? [])].slice(0, 5);
  const isElectric = vehicle.fuelType?.toLowerCase() === "electric";
  const hasAvailability = vehicle.availableFrom || vehicle.availableTo || vehicle.minRentalDays || vehicle.maxRentalDays;

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-['Sora',system-ui]">
      <HomeHeader />

      {/* Back nav */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-2">
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to marketplace
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT COLUMN */}
          <div className="flex-1 min-w-0">
            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden h-[320px] sm:h-[380px] relative">
              <div
                className="relative col-span-1 row-span-2 overflow-hidden cursor-pointer bg-gray-200"
                onClick={() => setActiveImg(0)}
              >
                <img
                  src={images[activeImg] || images[0]}
                  alt={vehicle.name}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  onError={e => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x400?text=Vehicle"; }}
                />
                <div className="absolute bottom-2 left-2 bg-black/40 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {vehicle.name}
                </div>
              </div>
              <div className="grid grid-rows-2 gap-2">
                {[1, 2].map(idx => (
                  <div
                    key={idx}
                    className="relative overflow-hidden cursor-pointer bg-gray-200"
                    onClick={() => setActiveImg(idx)}
                  >
                    <img
                      src={images[idx] || images[0]}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                      onError={e => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=View"; }}
                    />
                    {idx === 2 && images.length > 3 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1.5 text-white font-semibold text-sm">
                        <Images className="w-4 h-4" />
                        +{images.length - 3} Photos
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Title row */}
            <div className="mt-6 flex flex-wrap items-start gap-3 justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{vehicle.name}</h1>
                <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
                  <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    {vehicle.rating}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>{vehicle.host?.trips || 124} trips completed</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-emerald-600 font-medium">{vehicle.location}</span>
                </div>
              </div>
              {vehicle.host && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-gray-400">HOSTED BY</span>
                  <div className="w-9 h-9 rounded-full bg-emerald-200 overflow-hidden border-2 border-emerald-400 flex items-center justify-center text-emerald-700 font-bold text-sm">
                    {vehicle.host.name.charAt(0)}
                  </div>
                  <span className="font-semibold">{vehicle.host.name}</span>
                </div>
              )}
            </div>

            {/* Specs strip */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { icon: <Gauge className="w-5 h-5 text-emerald-600" />, label: "TRANSMISSION", value: titleCase(vehicle.transmission || vehicle.driveType) },
                { icon: <Users className="w-5 h-5 text-emerald-600" />, label: "CAPACITY", value: `${vehicle.seats || 5} Seats` },
                { icon: <Fuel className="w-5 h-5 text-emerald-600" />, label: "FUEL TYPE", value: titleCase(vehicle.fuelType || vehicle.category) },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
                  {s.icon}
                  <p className="text-[9px] font-bold text-gray-400 mt-2 tracking-widest">{s.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Eco banner */}
            {isElectric && (
            <div className="mt-5 bg-emerald-900 text-white rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                <Leaf className="w-20 h-20 text-emerald-400" />
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <p className="font-bold text-base">Make an impact.</p>
                  <p className="text-emerald-200 text-sm mt-1 leading-relaxed max-w-sm">
                    By choosing this electric vehicle for your {days}-day trip, you will save approximately{" "}
                    <span className="text-emerald-300 font-semibold">{vehicle.co2Saved || "42.5kg"}</span> of CO2
                    compared to a luxury ICE sedan.
                  </p>
                </div>
              </div>
            </div>
            )}

            {/* Description */}
            <div className="mt-7">
              <h2 className="text-lg font-bold text-gray-900">Vehicle Description</h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                {vehicle.description}
              </p>
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {vehicle.tags.map(tag => (
                <span key={tag} className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <DetailSection title="Vehicle Information">
              <DetailItem icon={<Car className="h-4 w-4" />} label="Brand & Model" value={`${vehicle.brand || "Vehicle"} ${vehicle.model || ""}`.trim()} />
              <DetailItem icon={<Calendar className="h-4 w-4" />} label="Year" value={vehicle.year || "Not provided"} />
              <DetailItem icon={<Palette className="h-4 w-4" />} label="Color" value={titleCase(vehicle.color)} />
              <DetailItem icon={<Hash className="h-4 w-4" />} label="License Plate" value={vehicle.licensePlate || "Not provided"} />
              <DetailItem icon={<Hash className="h-4 w-4" />} label="VIN" value={vehicle.vin || "Not provided"} />
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
              <DetailItem icon={<Navigation className="h-4 w-4" />} label="State" value={vehicle.state || "Not provided"} />
              <DetailItem icon={<Hash className="h-4 w-4" />} label="ZIP Code" value={vehicle.zipCode || "Not provided"} />
              <DetailItem icon={<Navigation className="h-4 w-4" />} label="Latitude" value={vehicle.latitude ?? "Not provided"} />
              <DetailItem icon={<Navigation className="h-4 w-4" />} label="Longitude" value={vehicle.longitude ?? "Not provided"} />
            </DetailSection>

            {hasAvailability && (
              <DetailSection title="Availability">
                <DetailItem icon={<Calendar className="h-4 w-4" />} label="Available From" value={formatDate(vehicle.availableFrom)} />
                <DetailItem icon={<Calendar className="h-4 w-4" />} label="Available To" value={formatDate(vehicle.availableTo)} />
              </DetailSection>
            )}

            {vehicle.features.length > 0 && (
              <section className="mt-7">
                <h2 className="text-lg font-bold text-gray-900">Features & Amenities</h2>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {vehicle.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {titleCase(feature)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {vehicle.terms && (
              <section className="mt-7 rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-700" />
                  <h2 className="text-lg font-bold text-gray-900">Owner Terms</h2>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">{vehicle.terms}</p>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN (Booking Card) */}
          <div className="lg:w-[320px] xl:w-[340px] flex-shrink-0">
            <div className="sticky top-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-5">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-gray-900">Rs. {vehicle.price}</span>
                <span className="text-sm text-gray-400 pb-0.5">/ day</span>
                {discount > 0 && (
                  <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    -{discount}% Weekly Disc.
                  </span>
                )}
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Dates & Availability
                </p>
                <MiniCalendar
                  selected={dateRange}
                  onChange={setDateRange}
                  year={calYear}
                  month={calMonth}
                  onPrev={prevMonth}
                  onNext={nextMonth}
                />
                {dateRange[0] && dateRange[1] && (
                  <p className="text-xs text-emerald-600 font-semibold mt-2">
                    {days} day{days > 1 ? "s" : ""} selected, {MONTHS[calMonth]} {dateRange[0]}-{dateRange[1]}, {calYear}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Insurance Protection
                </p>
                <div className="space-y-2">
                  {(["premium", "standard"] as const).map(plan => (
                    <button
                      key={plan}
                      onClick={() => setInsurance(plan)}
                      className={[
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all",
                        insurance === plan
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : "border-gray-100 hover:border-gray-200",
                      ].join(" ")}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${insurance === plan ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}>
                        {insurance === plan && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 capitalize">{plan}</p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {plan === "premium" ? "Rs. 0 deductible, all inclusive" : "Rs. 500 deductible, recommended"}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 flex-shrink-0">
                        +Rs. {plan === "premium" ? 45 : 22}/d
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1.5">
                <div className="flex justify-between">
                  <span>Rs. {vehicle.price}/day x {days} day{days > 1 ? "s" : ""}</span>
                  <span className="font-semibold text-gray-800">Rs. {vehicle.price * days}</span>
                </div>
                <div className="flex justify-between">
                  <span>{insurance === "premium" ? "Premium" : "Standard"} insurance</span>
                  <span className="font-semibold text-gray-800">Rs. {insuranceCost * days}</span>
                </div>
                {vehicle.securityDeposit !== undefined && (
                  <div className="flex justify-between">
                    <span>Security deposit</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(vehicle.securityDeposit)}</span>
                  </div>
                )}
                {vehicle.pricePerWeek ? (
                  <div className="flex justify-between text-emerald-700">
                    <span>Weekly rate</span>
                    <span className="font-semibold">{formatCurrency(vehicle.pricePerWeek)}</span>
                  </div>
                ) : null}
                {vehicle.pricePerMonth ? (
                  <div className="flex justify-between text-emerald-700">
                    <span>Monthly rate</span>
                    <span className="font-semibold">{formatCurrency(vehicle.pricePerMonth)}</span>
                  </div>
                ) : null}
                {vehicle.minRentalDays || vehicle.maxRentalDays ? (
                  <div className="flex justify-between text-gray-500">
                    <span>Rental window</span>
                    <span>{vehicle.minRentalDays || 1}-{vehicle.maxRentalDays || "any"} days</span>
                  </div>
                ) : null}
                {vehicle.availableFrom || vehicle.availableTo ? (
                  <div className="flex justify-between text-gray-500">
                    <span>Available</span>
                    <span>{formatDate(vehicle.availableFrom)} - {formatDate(vehicle.availableTo)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between pt-1.5 border-t border-gray-200 font-bold text-gray-900 text-sm">
                  <span>Total</span>
                  <span>Rs. {(vehicle.price + insuranceCost) * days + (vehicle.securityDeposit || 0)}</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-200 transition flex items-center justify-center gap-2"
              >
                Request to Book
                <ChevronRight className="w-4 h-4" />
              </motion.button>

              <p className="text-center text-[10px] text-gray-400">
                You will not be charged until a host accepts your trip request.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
