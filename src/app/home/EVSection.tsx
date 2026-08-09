// components/EVSection.tsx
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap, Clock, Leaf,
  ArrowRight, Battery,
} from "lucide-react";
import { vehicleService } from "../services/vehicleService";
import { Vehicle } from "../types/vehicle";

// Route type definition
interface Route {
  name: string;
  img: string;
  duration: string;
  stations: string;
  dist: string;
  difficulty: string;
  avatars: number;
}

// Static routes data (can also be fetched from API if needed)
const routes: Route[] = [
  {
    name: "Pokhara",
    img: "/pokhara.png",
    duration: "4h 30m",
    stations: "4 Stations",
    dist: "205 km",
    difficulty: "Scenic",
    avatars: 12,
  },
  {
    name: "Sholukhumbu",
    img: "/solukhumbu.png",
    duration: "1h 15m",
    stations: "Multi-modal",
    dist: "310 km",
    difficulty: "Adventure",
    avatars: 45,
  },
];

// Chart data
const chartBars = [45, 62, 78, 91, 70, 85, 95];
const chartDays = ["M", "T", "W", "T", "F", "S", "S"];

export default function EVSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCount, setAvailableCount] = useState(0);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch EV vehicles from database using the correct method
        const response = await vehicleService.searchVehicles({
          fuelType: 'ELECTRIC',
          page: 0,
          size: 10,
          sortBy: 'recent'
        });

        // The response is already an array of Vehicle objects from the service
        const evVehicles = response || [];
        setVehicles(evVehicles);

        // Count available vehicles
        const available = evVehicles.filter(v => v.isAvailable !== false).length;
        setAvailableCount(available);

      } catch (err) {
        console.error('Error fetching EV vehicles:', err);
        setError('Failed to load electric vehicles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Filter vehicles by category
  const getFilteredVehicles = () => {
    if (activeCategory === "All") return vehicles;
    // Map categories to vehicle types
    const categoryMap: { [key: string]: string[] } = {
      "Cars": ["car"],
      "Bikes": ["bike"],
      "Scooters": ["scooter"],
      "Cycles": ["cycle"]
    };
    const types = categoryMap[activeCategory] || [];
    return vehicles.filter(v => types.includes(v.type || ''));
  };

  const filteredVehicles = getFilteredVehicles();
  const featuredCar = filteredVehicles.find((v) => v.isAvailable !== false) || filteredVehicles[0];
  const sideCars = filteredVehicles.filter((v) => v.id !== featuredCar?.id).slice(0, 2);

  // Loading state
  if (loading) {
    return (
      <section style={{
        background: "#f7f8f9",
        padding: "72px 0 80px",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}>
        <div className="evs2-wrap">
          <div className="evs2-header-row">
            <h2 className="evs2-section-title">Electric vehicles near you</h2>
            <div className="evs2-available-pill">
              <span className="evs2-dot-pulse" />
              Loading...
            </div>
          </div>
          <div className="evs2-grid" style={{ marginBottom: 20 }}>
            <div className="evs2-featured" style={{ background: "#e5e7eb", minHeight: "460px" }}>
              <div style={{ padding: "28px", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <p style={{ color: "#6b7280" }}>Loading vehicles...</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1, 2].map((i) => (
                <div key={i} className="evs2-side-card" style={{ background: "#e5e7eb", height: "120px" }}>
                  <div style={{ padding: "14px 16px", flex: 1 }}>
                    <p style={{ color: "#6b7280" }}>Loading...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section style={{
        background: "#f7f8f9",
        padding: "72px 0 80px",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}>
        <div className="evs2-wrap">
          <div style={{ textAlign: "center", padding: "40px", background: "#fff", borderRadius: "16px" }}>
            <p style={{ color: "#dc2626", fontSize: "1.1rem", marginBottom: "16px" }}>⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 24px",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // No vehicles state
  if (vehicles.length === 0) {
    return (
      <section style={{
        background: "#f7f8f9",
        padding: "72px 0 80px",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}>
        <div className="evs2-wrap">
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "16px" }}>
            <Leaf size={48} style={{ color: "#16a34a", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0d1117", marginBottom: "8px" }}>
              No Electric Vehicles Available
            </h3>
            <p style={{ color: "#6b7280" }}>
              Check back later for new EV listings in your area.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{
      background: "#f7f8f9",
      padding: "72px 0 80px",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .evs2-wrap { max-width: 1300px; margin: 0 auto; padding: 0 28px; }

        .evs2-header-row {
          display: flex; align-items: center; gap: 16px; margin-bottom: 28px;
        }
        .evs2-section-title {
          font-size: 1.875rem; font-weight: 800; color: #0d1117; letter-spacing: -0.02em; margin: 0;
        }
        .evs2-available-pill {
          display: inline-flex; align-items: center; gap: 7px;
          background: #e8fdf0; border: 1.5px solid #6ee7b7;
          border-radius: 9999px; padding: 5px 14px;
          color: #15803d; font-size: 0.8rem; font-weight: 600;
          margin-left: auto;
        }
        .evs2-dot-pulse {
          width: 8px; height: 8px; border-radius: 50%; background: #16a34a;
          animation: evs2Pulse 2s ease-in-out infinite;
        }
        @keyframes evs2Pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }

        .evs2-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }
        .evs2-pill {
          padding: 6px 16px; border-radius: 9999px; font-size: 0.8125rem; font-weight: 500;
          cursor: pointer; border: 1.5px solid #e5e7eb; color: #6b7280; background: #fff;
          transition: all 0.18s; font-family: inherit;
        }
        .evs2-pill:hover { border-color: #6ee7b7; color: #15803d; }
        .evs2-pill.active {
          background: #fff; border-color: #16a34a; color: #15803d; font-weight: 600;
          box-shadow: 0 0 0 3px rgba(22,163,74,0.08);
        }

        .evs2-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 16px;
          margin-bottom: 20px;
        }

        .evs2-featured {
          grid-row: 1 / 3;
          background: #0d1f1a;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          min-height: 460px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
        }
        .evs2-featured-img {
          position: absolute; inset: 0; z-index: 0;
        }
        .evs2-featured-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 35%, rgba(5,20,15,0.88) 75%, rgba(5,15,10,0.97) 100%);
        }
        .evs2-featured-body { position: relative; z-index: 2; padding: 28px; }
        .evs2-featured-badge {
          display: inline-block; padding: 4px 12px; border-radius: 9999px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
          color: #e2e8f0; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; backdrop-filter: blur(8px);
          position: absolute; top: 16px; left: 16px; z-index: 3;
        }
        .evs2-match-badge {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px; padding: 8px 14px; margin-bottom: 10px;
          backdrop-filter: blur(8px); width: fit-content;
        }
        .evs2-match-label { color: #a7f3d0; font-size: 0.875rem; font-weight: 700; }
        .evs2-featured-name { color: #fff; font-size: 1.375rem; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.01em; }
        .evs2-featured-desc { color: #94a3b8; font-size: 0.8125rem; line-height: 1.55; margin-bottom: 20px; }
        .evs2-reserve-btn {
          width: 100%; padding: 13px; border: none; border-radius: 12px;
          background: #16a34a; color: #fff; font-weight: 700; font-size: 0.875rem;
          letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
          font-family: inherit; transition: all 0.22s;
          box-shadow: 0 4px 20px rgba(22,163,74,0.35);
        }
        .evs2-reserve-btn:hover { background: #22c55e; box-shadow: 0 6px 28px rgba(34,197,94,0.42); transform: translateY(-1px); }

        .evs2-side-card {
          background: #fff; border-radius: 16px; overflow: hidden;
          border: 1.5px solid #f0f0f0; display: flex; align-items: stretch;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: all 0.28s; cursor: pointer;
        }
        .evs2-side-card:hover { border-color: #a7f3d0; box-shadow: 0 8px 28px rgba(22,163,74,0.1); transform: translateY(-2px); }
        .evs2-side-img-wrap { width: 120px; flex-shrink: 0; position: relative; background: #f8f9fa; }
        .evs2-side-body { padding: 14px 16px; flex: 1; min-width: 0; }
        .evs2-side-badge {
          font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #16a34a; margin-bottom: 4px; display: flex; align-items: center; gap: 5px;
        }
        .evs2-side-badge-star { color: #f59e0b; font-size: 0.7rem; }
        .evs2-side-name { color: #0d1117; font-weight: 700; font-size: 0.9375rem; margin: 0 0 4px; }
        .evs2-side-meta { color: #9ca3af; font-size: 0.75rem; margin-bottom: 10px; }
        .evs2-side-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .evs2-side-tag {
          padding: 3px 10px; border-radius: 9999px;
          background: #f3f4f6; border: 1px solid #e5e7eb;
          color: #6b7280; font-size: 0.7rem; font-weight: 500;
        }

        .evs2-routes-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .evs2-routes-title { color: #0d1117; font-size: 1.5rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
        .evs2-explore-btn {
          display: inline-flex; align-items: center; gap: 5px;
          background: none; border: none; cursor: pointer;
          color: #16a34a; font-size: 0.875rem; font-weight: 600; font-family: inherit;
        }
        .evs2-routes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .evs2-route-card {
          background: #fff; border-radius: 16px; overflow: hidden;
          border: 1.5px solid #f0f0f0; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          transition: all 0.28s; cursor: pointer; display: flex; align-items: stretch;
        }
        .evs2-route-card:hover { border-color: #a7f3d0; box-shadow: 0 8px 28px rgba(22,163,74,0.1); transform: translateY(-2px); }
        .evs2-route-img { width: 130px; flex-shrink: 0; position: relative; overflow: hidden; }
        .evs2-route-body { padding: 16px 18px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .evs2-route-name { color: #0d1117; font-weight: 700; font-size: 1.0625rem; margin: 0 0 8px; }
        .evs2-route-meta { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 12px; }
        .evs2-route-meta-item { display: flex; align-items: center; gap: 5px; color: #6b7280; font-size: 0.78rem; }
        .evs2-route-footer { display: flex; align-items: center; justify-content: space-between; }
        .evs2-avatars { display: flex; }
        .evs2-avatar { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #fff; background: linear-gradient(135deg, #6ee7b7, #16a34a); margin-left: -6px; font-size: 0.55rem; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; }
        .evs2-avatar:first-child { margin-left: 0; }
        .evs2-plan-btn {
          background: none; border: none; cursor: pointer; font-family: inherit;
          color: #16a34a; font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.04em;
          text-transform: uppercase; display: flex; align-items: center; gap: 5px;
          padding: 0; transition: gap 0.2s;
        }
        .evs2-plan-btn:hover { gap: 8px; }
        .evs2-route-info-icon {
          position: absolute; top: 12px; right: 12px; z-index: 2;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center;
        }

        @media (max-width: 768px) {
          .evs2-wrap { padding: 0 16px; }
          .evs2-header-row { align-items: flex-start; flex-direction: column; }
          .evs2-available-pill { margin-left: 0; }
          .evs2-grid { grid-template-columns: 1fr; }
          .evs2-featured { grid-row: auto; min-height: 380px; }
          .evs2-routes-grid { grid-template-columns: 1fr; }
          .evs2-route-img { width: 110px; }
        }

        @media (max-width: 520px) {
          .evs2-section-title { font-size: 1.55rem; }
          .evs2-featured { min-height: 340px; border-radius: 14px; }
          .evs2-featured-body { padding: 20px; }
          .evs2-side-card,
          .evs2-route-card { flex-direction: column; }
          .evs2-side-img-wrap,
          .evs2-route-img { width: 100%; height: 170px; }
          .evs2-route-footer { align-items: flex-start; flex-direction: column; gap: 12px; }
        }
      `}</style>

      <div className="evs2-wrap">

        <div className="evs2-header-row">
          <h2 className="evs2-section-title">Electric vehicles near you</h2>
          <div className="evs2-available-pill">
            <span className="evs2-dot-pulse" />
            {availableCount} Available Now
          </div>
        </div>

        <div className="evs2-pills">
          {["All", "Cars", "Bikes", "Scooters", "Cycles"].map((cat) => (
            <button
              key={cat}
              className={`evs2-pill${activeCategory === cat ? " active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="evs2-grid" style={{ marginBottom: 20 }}>

          {featuredCar && (
            <motion.div
              className="evs2-featured"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="evs2-featured-img">
                <Image
                  src={featuredCar.image || "/placeholder-car.jpg"}
                  alt={featuredCar.name || "Featured Vehicle"}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="evs2-featured-overlay" />
              <span className="evs2-featured-badge">
                {featuredCar.isAvailable ? "⭐ AVAILABLE" : "PREMIUM CHOICE"}
              </span>

              <div className="evs2-featured-body">
                <div className="evs2-match-badge">
                  <span className="evs2-match-label">
                    {featuredCar.isAvailable ? "✅ Available Now" : "🔴 Currently Unavailable"}
                  </span>
                </div>
                <h3 className="evs2-featured-name">
                  {featuredCar.brand} {featuredCar.model}
                </h3>
                <p className="evs2-featured-desc">
                  {featuredCar.description || `Experience the ${featuredCar.brand} ${featuredCar.model}. ${featuredCar.year || ''} model with ${featuredCar.seats || 4} seats.`}
                </p>
                <button
                  className="evs2-reserve-btn"
                  onClick={() => window.location.href = `/vehicles/${featuredCar.id}`}
                >
                  Reserve Now - ${featuredCar.pricePerHour}/day
                </button>
              </div>
            </motion.div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sideCars.map((car, i) => (
              <motion.div
                key={car.id}
                className="evs2-side-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.45 }}
                onClick={() => window.location.href = `/vehicles/${car.id}`}
              >
                <div className="evs2-side-img-wrap">
                  <Image
                    src={car.image || "/placeholder-car.jpg"}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="evs2-side-body">
                  <div className="evs2-side-badge">
                    <Zap size={10} style={{ color: "#16a34a" }} />
                    {car.isAvailable ? "Available Now" : "Unavailable"}
                    <span className="evs2-side-badge-star" style={{ marginLeft: "auto" }}>
                      {car.isAvailable ? "●" : "○"}
                    </span>
                  </div>
                  <h3 className="evs2-side-name">{car.brand} {car.model}</h3>
                  <p className="evs2-side-meta">
                    {car.year || ''} • {car.range ? `${car.range} mi range` : ''}
                  </p>
                  <div className="evs2-side-tags">
                    {car.transmission && (
                      <span className="evs2-side-tag">{car.transmission}</span>
                    )}
                    {car.fuelType && (
                      <span className="evs2-side-tag">{car.fuelType}</span>
                    )}
                    <span className="evs2-side-tag">${car.pricePerHour}/day</span>
                    {car.battery && (
                      <span className="evs2-side-tag">🔋 {car.battery}%</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.38, duration: 0.45 }}
              style={{
                background: "linear-gradient(135deg, #0a2218 0%, #0d2e1e 100%)",
                borderRadius: 16,
                padding: "24px 28px",
                position: "relative",
                overflow: "hidden",
                flex: 1,
              }}
            >
              <div style={{
                position: "absolute", top: "-40px", right: "-20px",
                width: 160, height: 160, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <p style={{
                color: "#4ade80", fontSize: "0.65rem", fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                margin: "0 0 6px", display: "flex", alignItems: "center", gap: 5,
              }}>
                <Leaf size={10} /> ECO-EFFICIENCY LEADER
              </p>
              <h3 style={{ color: "#fff", fontSize: "1.125rem", fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.01em", lineHeight: 1.25 }}>
                Your Sustainability<br />Impact for July
              </h3>
              <p style={{ color: "#6ee7b7", fontSize: "0.78rem", lineHeight: 1.55, margin: "0 0 16px" }}>
                By choosing electric for 80% of your trips, you&apos;ve saved approximately{" "}
                <strong style={{ color: "#4ade80" }}>450kg of CO₂</strong> this month.
              </p>

              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 56, marginBottom: 14, position: "relative" }}>
                <span style={{
                  position: "absolute", top: -2, right: 0,
                  background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)",
                  borderRadius: 6, padding: "2px 8px",
                  color: "#4ade80", fontSize: "0.7rem", fontWeight: 700,
                }}>
                  +12% vs last month
                </span>
                {chartBars.map((h, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{
                      width: 20, height: `${Math.round(h * 0.55)}px`,
                      borderRadius: "3px 3px 0 0",
                      background: i === 6 ? "linear-gradient(180deg, #4ade80, #16a34a)" : "rgba(74,222,128,0.3)",
                    }} />
                    <span style={{ color: "#4ade80", fontSize: "0.55rem", fontWeight: 500 }}>{chartDays[i]}</span>
                  </div>
                ))}
              </div>

              <button className="evs2-eco-btn" style={{
                fontSize: "0.78rem",
                padding: "8px 16px",
                background: "rgba(74,222,128,0.1)",
                border: "1px solid rgba(74,222,128,0.3)",
                borderRadius: "8px",
                color: "#4ade80",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                View Full Report <ArrowRight size={12} />
              </button>
            </motion.div>
          </div>
        </div>

        <div>
          <div className="evs2-routes-header">
            <h2 className="evs2-routes-title">Popular routes this week</h2>
            <button className="evs2-explore-btn">
              Explore all routes <ArrowRight size={14} />
            </button>
          </div>

          <div className="evs2-routes-grid">
            {routes.map((route, i) => (
              <motion.div
                key={i}
                className="evs2-route-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.45 }}
              >
                <div className="evs2-route-img">
                  <Image src={route.img} alt={route.name} fill style={{ objectFit: "cover" }} />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to right, rgba(0,0,0,0.15), transparent)",
                  }} />
                  <div className="evs2-route-info-icon">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5" stroke="#9ca3af" strokeWidth="1.5" />
                      <path d="M6 5.5v3M6 4h.01" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <div className="evs2-route-body">
                  <div>
                    <h3 className="evs2-route-name">{route.name}</h3>
                    <div className="evs2-route-meta">
                      <span className="evs2-route-meta-item">
                        <Clock size={11} style={{ color: "#16a34a" }} />{route.duration}
                      </span>
                      <span className="evs2-route-meta-item">
                        <Zap size={11} style={{ color: "#0891b2" }} />{route.stations}
                      </span>
                    </div>
                  </div>
                  <div className="evs2-route-footer">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="evs2-avatars">
                        {[0, 1, 2].map((j) => (
                          <div key={j} className="evs2-avatar" style={{
                            background: j === 0 ? "linear-gradient(135deg, #fbbf24,#f59e0b)"
                              : j === 1 ? "linear-gradient(135deg, #6ee7b7,#16a34a)"
                                : "linear-gradient(135deg, #93c5fd,#3b82f6)",
                          }} />
                        ))}
                      </div>
                      <span style={{ color: "#9ca3af", fontSize: "0.72rem" }}>+{route.avatars}</span>
                    </div>
                    <button className="evs2-plan-btn">
                      Plan Trip <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}