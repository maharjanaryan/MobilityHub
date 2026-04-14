"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const categories = [
  {
    title: "Electric Cars",
    available: "24 available",
    range: "300–500 km",
    image: "/electriccar.jpg",
    highlight: true,
  },
  {
    title: "Electric Bikes",
    available: "48 available",
    range: "80–150 km",
    image: "/bikes.jpg",
  },
  {
    title: "Electric Scooters",
    available: "65 available",
    range: "40–80 km",
    image: "/scooters.jpg",
  },
  {
    title: "Electric Cycles",
    available: "82 available",
    range: "30–60 km",
    image: "/cycle.jpg",
  },
];

export default function ElectricCategories() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1, // 👈 makes them appear one by one
              ease: "easeOut",
            }}
            className={`rounded-2xl border border-gray-400 p-6 shadow-sm hover:shadow-lg transition-all duration-300 bg-white hover:scale-110 transition-transform ${item.highlight ? "bg-green-50" : ""
              }`}
          >
            <div className="relative h-48 w-full mb-6">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-contain"
              />
            </div>

            <h3 className="text-xl font-semibold mb-2">
              {item.title}
            </h3>

            <div className="flex justify-between text-gray-500 text-sm mb-4">
              <span>{item.available}</span>
              <span>{item.range}</span>
            </div>

            <button className="text-green-600 font-medium flex items-center gap-2 group">
              Browse
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}