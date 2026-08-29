// app/profile/Overview.tsx
'use client';

import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';

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

export default function OverviewTab({ userData }: { userData: UserProfileData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Personal Information */}
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

      {/* Eco Impact */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="font-extrabold text-gray-800 dark:text-gray-100 text-lg mb-5">🌿 Your Eco Impact</h3>
        <div className="bg-gradient-to-br from-green-950 to-green-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 mb-4">
          <p className="text-green-300 dark:text-green-400 text-xs font-bold uppercase tracking-wider mb-2">LIFETIME CO₂ SAVED</p>
          <p className="text-white text-3xl font-extrabold">1,247 kg</p>
          <p className="text-green-300 dark:text-green-400 text-sm mt-1">Equivalent to planting 62 trees 🌳</p>
        </div>
      </div>
    </div>
  );
}