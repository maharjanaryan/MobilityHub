// app/profile/RidesTab.tsx
'use client';

import React from 'react';
import { Car, Star, ChevronRight } from 'lucide-react';

const rideHistory = [
  { id: 1, vehicle: "Lucid Air Touring", date: "May 14, 2026", duration: "2h 30m", distance: "85 km", cost: "Rs 1,200", status: "Completed", rating: 5 },
  { id: 2, vehicle: "Hyundai IONIQ 5", date: "May 10, 2026", duration: "1h 15m", distance: "42 km", cost: "Rs 650", status: "Completed", rating: 4 },
  { id: 3, vehicle: "BMW i4 eDrive40", date: "May 6, 2026", duration: "3h 00m", distance: "120 km", cost: "Rs 1,800", status: "Completed", rating: 5 },
];

export default function RidesTab() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 shadow-sm">
      <h3 className="font-extrabold text-gray-800 dark:text-gray-100 text-lg mb-5">All Rides</h3>
      {rideHistory.map((ride, i) => (
        <div key={ride.id} className={`flex items-center gap-5 py-4 ${i < rideHistory.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
          <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <Car size={22} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800 dark:text-gray-100 text-base">{ride.vehicle}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">{ride.date} • {ride.duration} • {ride.distance}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-800 dark:text-gray-100 text-base">{ride.cost}</p>
            <div className="flex gap-0.5 justify-end mt-1">
              {Array.from({ length: ride.rating }).map((_, j) => (<Star key={j} size={12} className="text-yellow-400 fill-yellow-400" />))}
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
        </div>
      ))}
    </div>
  );
}