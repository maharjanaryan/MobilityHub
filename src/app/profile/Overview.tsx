// app/profile/Overview.tsx
'use client';

import React from 'react';
import { User, Mail, Phone, MapPin, Clock, TrendingUp } from 'lucide-react';

interface UserProfileData {
  id: number;
  username: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  renterKycStatus: string;
  ownerKycStatus: string;
  canBook: boolean;
  canList: boolean;
}

const rideHistory = [
  { id: 1, vehicle: "Lucid Air Touring", date: "May 14, 2026", duration: "2h 30m", distance: "85 km", cost: "Rs 1,200", status: "Completed", rating: 5 },
  { id: 2, vehicle: "Hyundai IONIQ 5", date: "May 10, 2026", duration: "1h 15m", distance: "42 km", cost: "Rs 650", status: "Completed", rating: 4 },
  { id: 3, vehicle: "BMW i4 eDrive40", date: "May 6, 2026", duration: "3h 00m", distance: "120 km", cost: "Rs 1,800", status: "Completed", rating: 5 },
];

export default function OverviewTab({ userData }: { userData: UserProfileData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="font-extrabold text-gray-800 dark:text-gray-100 text-lg mb-5">Personal Information</h3>
        {[
          { icon: User, label: "Full Name", value: userData.fullName || userData.username },
          { icon: Mail, label: "Email", value: userData.email },
          { icon: Phone, label: "Phone", value: userData.phoneNumber || "Not provided" },
          { icon: MapPin, label: "Location", value: "Kathmandu, Nepal" },
        ].map((item, i) => (
          <div key={i} className={`flex items-center gap-4 py-4 ${i < 3 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <item.icon size={17} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{item.label}</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="font-extrabold text-gray-800 dark:text-gray-100 text-lg mb-5">🌿 Your Eco Impact</h3>
        <div className="bg-gradient-to-br from-green-950 to-green-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 mb-4">
          <p className="text-green-300 dark:text-green-400 text-xs font-bold uppercase tracking-wider mb-2">LIFETIME CO₂ SAVED</p>
          <p className="text-white text-3xl font-extrabold">1,247 kg</p>
          <p className="text-green-300 dark:text-green-400 text-sm mt-1">Equivalent to planting 62 trees 🌳</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 shadow-sm md:col-span-2">
        <h3 className="font-extrabold text-gray-800 dark:text-gray-100 text-lg mb-5">Recent Activity</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {rideHistory.slice(0, 3).map((ride) => (
            <div key={ride.id} className="min-w-[260px] bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">{ride.status}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{ride.date}</span>
              </div>
              <p className="font-bold text-gray-800 dark:text-gray-100 text-base">{ride.vehicle}</p>
              <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                <span className="flex items-center gap-1"><Clock size={12} /> {ride.duration}</span>
                <span className="flex items-center gap-1"><TrendingUp size={12} /> {ride.distance}</span>
              </div>
              <p className="font-bold text-gray-800 dark:text-gray-100 text-base mt-2">{ride.cost}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}