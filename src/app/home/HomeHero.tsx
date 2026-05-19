"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Map } from "lucide-react";

interface Slide {
  image: string;
  title1: string;
  title2: string;
  desc: string;
}

const slides: Slide[] = [
  {
    image: "herobg.jpg",
    title1: "Ride Green.",
    title2: "Explore Green.",
    desc: "Rent electric vehicles for eco-friendly exploration. Cars, bikes, scooters & cycles — all at your fingertips with smart maps and local recommendations.",
  },
  {
    image: "aboutbg.png",
    title1: "Zero Emissions.",
    title2: "Pure Adventure.",
    desc: "Choose from our fleet of premium EVs and discover the city the sustainable way — clean, quiet, and completely effortless.",
  },
  {
    image: "homehero3.png",
    title1: "Smart Maps.",
    title2: "Smarter Rides.",
    desc: "Navigate charging stations, scenic routes, and local hotspots with our integrated smart map — built for the eco-conscious explorer.",
  },
];

const HomeHero: React.FC = () => {
  const [current, setCurrent] = useState<number>(0);
  const [typedText, setTypedText] = useState<string>("");

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    setTypedText("");
    const interval = setInterval(() => {
      setTypedText(slides[current].desc.slice(0, i + 1));
      i++;
      if (i === slides[current].desc.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [current]);

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full mb-10">
      {/* Hero container - full width background with centered content */}
      <div className="relative min-h-[520px] sm:min-h-[600px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={slides[current].image}
            className="absolute inset-0 w-full h-full object-cover"
            alt="hero background"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content wrapper - aligned with footer's max-w-7xl and px-6 */}
        <div className="absolute inset-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                className="h-full flex flex-col justify-center pt-16 pb-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight max-w-4xl">
                  {slides[current].title1} <br />
                  <span className="text-green-200">{slides[current].title2}</span>
                </h1>

                <p className="mt-6 text-white min-h-[112px] sm:min-h-[80px] max-w-2xl text-sm sm:text-base leading-7">
                  {typedText}
                  <span className="animate-pulse">|</span>
                </p>

                <div className="mt-8 gap-3 sm:gap-4 flex flex-col sm:flex-row sm:items-center">
                  <button className="border-none bg-green-700 py-3 px-5 rounded-lg hover:bg-green-600 transition hover:scale-105 text-white font-semibold">
                    Rent Now
                  </button>
                  <button className="border-none py-3 px-5 rounded-lg bg-gray-400/30 backdrop-blur-sm text-white hover:bg-gray-400/50 transition flex items-center justify-center gap-2">
                    <Map size={16} />
                    Explore Map
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Eco-friendly badge - positioned relative to container */}
        <div className="absolute top-6 left-6 z-20">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-700/60 backdrop-blur-sm text-white text-xs font-semibold">
            <Leaf size={12} />
            ECO-FRIENDLY RENTALS
          </span>
        </div>

        {/* Slide Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-500 ${i === current ? "w-8 bg-green-400" : "w-2 bg-white/60"
                }`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute bottom-6 right-6 text-white/60 text-xs z-20 font-mono">
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(slides.length).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
