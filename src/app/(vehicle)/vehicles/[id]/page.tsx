"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, Zap, Users, Gauge, Leaf, ChevronLeft,
  ChevronRight, Shield, Images, Calendar, Loader2
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
  category: string;
  img: string;
  price: number;
  rating: number;
  range: string;
  charge: number;
  location: string;
  tags: string[];
  badge?: string;
  seats?: number;
  speed: string;
  driveType?: string;
  extraImages?: string[];
  description?: string;
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

  // Fetch vehicle data
  useEffect(() => {
    if (vehicleId) {
      fetchVehicleData();
    }
  }, [vehicleId]);

  const fetchVehicleData = async () => {
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
        category: data.fuelType || "Electric",
        img: data.photos && data.photos.length > 0 ? data.photos[0] : "https://via.placeholder.com/600x400?text=Vehicle",
        price: data.pricePerDay,
        rating: data.averageRating || 4.5,
        range: data.range || (data.fuelType === "Electric" ? "400 km" : "600 km"),
        charge: data.charge || 80,
        location: data.city || "Unknown Location",
        tags: [data.transmission || "Automatic", `${data.seats || 4} Seats`, data.fuelType || "Petrol"],
        seats: data.seats || 4,
        speed: data.speed || "200 km/h",
        driveType: data.driveType || (data.fuelType === "Electric" ? "Dual Motor AWD" : "Front Wheel Drive"),
        extraImages: data.photos && data.photos.length > 1 ? data.photos.slice(1) : [],
        description: data.description || `Experience the ${data.brand} ${data.model} - a perfect blend of performance and comfort.`,
        host: {
          name: data.ownerName || "Premium Host",
          trips: data.hostTrips || 124
        },
        co2Saved: data.co2Saved || "42.5kg"
      };

      setVehicle(transformedVehicle);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      setError(error instanceof Error ? error.message : 'Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  };

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
                  src={images[0]}
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
                { icon: <Gauge className="w-5 h-5 text-emerald-600" />, label: "DRIVE TYPE", value: vehicle.driveType || "Dual Motor AWD" },
                { icon: <Users className="w-5 h-5 text-emerald-600" />, label: "CAPACITY", value: `${vehicle.seats || 5} Seats` },
                { icon: <Zap className="w-5 h-5 text-emerald-600" />, label: "RANGE", value: vehicle.range },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
                  {s.icon}
                  <p className="text-[9px] font-bold text-gray-400 mt-2 tracking-widest">{s.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Eco banner */}
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
                    By choosing this electric vehicle for your {days}-day trip, you'll save approximately{" "}
                    <span className="text-emerald-300 font-semibold">{vehicle.co2Saved || "42.5kg"}</span> of CO₂
                    compared to a luxury ICE sedan.
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-7">
              <h2 className="text-lg font-bold text-gray-900">Experience the Future</h2>
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
          </div>

          {/* RIGHT COLUMN (Booking Card) */}
          <div className="lg:w-[320px] xl:w-[340px] flex-shrink-0">
            <div className="sticky top-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-5">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-gray-900">₹{vehicle.price}</span>
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
                    {days} day{days > 1 ? "s" : ""} selected · {MONTHS[calMonth]} {dateRange[0]}–{dateRange[1]}, {calYear}
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
                          {plan === "premium" ? "₹0 Deductible · All Inclusive" : "₹500 Deductible · Recommended"}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 flex-shrink-0">
                        +₹{plan === "premium" ? 45 : 22}/d
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1.5">
                <div className="flex justify-between">
                  <span>₹{vehicle.price}/day × {days} day{days > 1 ? "s" : ""}</span>
                  <span className="font-semibold text-gray-800">₹{vehicle.price * days}</span>
                </div>
                <div className="flex justify-between">
                  <span>{insurance === "premium" ? "Premium" : "Standard"} insurance</span>
                  <span className="font-semibold text-gray-800">₹{insuranceCost * days}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-gray-200 font-bold text-gray-900 text-sm">
                  <span>Total</span>
                  <span>₹{(vehicle.price + insuranceCost) * days}</span>
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
                You won't be charged until a host accepts your trip request.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}