"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import HomeHeader from "../home/HomeHeader";
import Footer from "../component/Footer";
import {
  User, Mail, Phone, MapPin, Calendar, Car, Leaf, Zap,
  Clock, Star, ChevronRight, Edit3, Camera, Shield,
  CreditCard, Bell, Lock, Award, TrendingUp, Battery,
} from "lucide-react";

const userData = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+977 9841234567",
  location: "Kathmandu, Nepal",
  memberSince: "January 2025",
  avatar: "/logo.png",
  bio: "Passionate about sustainable mobility and green transportation. Early adopter of electric vehicles.",
};

const stats = [
  { label: "Total Rides", value: "147", icon: Car, color: "#16a34a" },
  { label: "CO₂ Saved", value: "1.2T", icon: Leaf, color: "#0891b2" },
  { label: "Distance", value: "3,240 km", icon: TrendingUp, color: "#7c3aed" },
  { label: "Avg Rating", value: "4.9", icon: Star, color: "#f59e0b" },
];

const rideHistory = [
  { id: 1, vehicle: "Lucid Air Touring", date: "May 14, 2026", duration: "2h 30m", distance: "85 km", cost: "Rs 1,200", status: "Completed", rating: 5 },
  { id: 2, vehicle: "Hyundai IONIQ 5", date: "May 10, 2026", duration: "1h 15m", distance: "42 km", cost: "Rs 650", status: "Completed", rating: 4 },
  { id: 3, vehicle: "BMW i4 eDrive40", date: "May 6, 2026", duration: "3h 00m", distance: "120 km", cost: "Rs 1,800", status: "Completed", rating: 5 },
  { id: 4, vehicle: "Tesla Model 3", date: "May 2, 2026", duration: "45m", distance: "28 km", cost: "Rs 400", status: "Completed", rating: 4 },
];

const achievements = [
  { title: "Green Pioneer", desc: "Complete 100+ rides", progress: 100, icon: "🌿" },
  { title: "Eco Warrior", desc: "Save 1 ton of CO₂", progress: 100, icon: "🏆" },
  { title: "Road Master", desc: "Travel 5,000 km", progress: 65, icon: "🛣️" },
  { title: "Star Rider", desc: "Maintain 4.8+ rating", progress: 100, icon: "⭐" },
];

const settingsItems = [
  { label: "Account Settings", desc: "Manage your personal information", icon: User },
  { label: "Payment Methods", desc: "Add or manage payment options", icon: CreditCard },
  { label: "Notifications", desc: "Customize notification preferences", icon: Bell },
  { label: "Privacy & Security", desc: "Password, 2FA, and data settings", icon: Lock },
  { label: "Ride Preferences", desc: "Default vehicle type and settings", icon: Car },
];

type TabKey = "overview" | "rides" | "achievements" | "settings";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "rides", label: "Ride History" },
    { key: "achievements", label: "Achievements" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HomeHeader />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .profile-page { font-family: 'DM Sans', 'Helvetica Neue', sans-serif; }
      `}</style>

      <main className="flex-1 profile-page">
        {/* Hero Banner */}
        <div style={{
          background: "linear-gradient(135deg, #052e16 0%, #14532d 40%, #166534 100%)",
          padding: "60px 0 100px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-80px", right: "-40px",
            width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", bottom: "-60px", left: "10%",
            width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
          }} />
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {/* Avatar */}
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 110, height: 110, borderRadius: "50%",
                  border: "4px solid rgba(74,222,128,0.4)",
                  padding: 3, background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                }}>
                  <img
                    src={userData.avatar}
                    alt="Profile"
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  />
                </div>
                <button style={{
                  position: "absolute", bottom: 2, right: 2,
                  width: 32, height: 32, borderRadius: "50%",
                  background: "#16a34a", border: "3px solid #052e16",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#fff",
                }}>
                  <Camera size={14} />
                </button>
              </div>
              {/* Info */}
              <div>
                <h1 style={{ color: "#fff", fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                  {userData.name}
                </h1>
                <p style={{ color: "#86efac", fontSize: "0.9rem", margin: "0 0 8px" }}>{userData.bio}</p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ color: "#a7f3d0", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={13} /> {userData.location}
                  </span>
                  <span style={{ color: "#a7f3d0", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 5 }}>
                    <Calendar size={13} /> Member since {userData.memberSince}
                  </span>
                </div>
              </div>
              {/* Edit Button */}
              <button style={{
                marginLeft: "auto",
                padding: "10px 22px", borderRadius: 12,
                background: "rgba(255,255,255,0.1)",
                border: "1.5px solid rgba(255,255,255,0.2)",
                color: "#fff", fontSize: "0.85rem", fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                backdropFilter: "blur(8px)",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
                onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
                onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              >
                <Edit3 size={15} /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ maxWidth: 1100, margin: "-50px auto 0", padding: "0 28px 60px", position: "relative", zIndex: 3 }}>

          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                style={{
                  background: "#fff", borderRadius: 16, padding: "22px 24px",
                  border: "1.5px solid #f0f0f0",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  display: "flex", alignItems: "center", gap: 16,
                  cursor: "default",
                  transition: "all 0.25s",
                }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${stat.color}12`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <stat.icon size={22} style={{ color: stat.color }} />
                </div>
                <div>
                  <p style={{ color: "#0d1117", fontSize: "1.35rem", fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{stat.value}</p>
                  <p style={{ color: "#9ca3af", fontSize: "0.78rem", fontWeight: 500, margin: 0 }}>{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{
            display: "flex", gap: 4, marginBottom: 28,
            background: "#fff", borderRadius: 14, padding: 5,
            border: "1.5px solid #f0f0f0",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1, padding: "12px 20px", borderRadius: 10,
                  background: activeTab === tab.key ? "#16a34a" : "transparent",
                  color: activeTab === tab.key ? "#fff" : "#6b7280",
                  border: "none", cursor: "pointer",
                  fontSize: "0.875rem", fontWeight: 600,
                  fontFamily: "inherit",
                  transition: "all 0.25s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "rides" && <RidesTab />}
            {activeTab === "achievements" && <AchievementsTab />}
            {activeTab === "settings" && <SettingsTab />}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Personal Info */}
      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>Personal Information</h3>
        {[
          { icon: User, label: "Full Name", value: userData.name },
          { icon: Mail, label: "Email", value: userData.email },
          { icon: Phone, label: "Phone", value: userData.phone },
          { icon: MapPin, label: "Location", value: userData.location },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < 3 ? "1px solid #f3f4f6" : "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <item.icon size={17} style={{ color: "#16a34a" }} />
            </div>
            <div>
              <p style={{ color: "#9ca3af", fontSize: "0.72rem", fontWeight: 500, margin: 0 }}>{item.label}</p>
              <p style={{ color: "#0d1117", fontSize: "0.9rem", fontWeight: 600, margin: 0 }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Eco Impact */}
      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>🌿 Your Eco Impact</h3>
        <div style={{ background: "linear-gradient(135deg, #052e16, #14532d)", borderRadius: 14, padding: 24, marginBottom: 16 }}>
          <p style={{ color: "#86efac", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: "0 0 8px" }}>LIFETIME CO₂ SAVED</p>
          <p style={{ color: "#fff", fontSize: "2.2rem", fontWeight: 800, margin: "0 0 4px" }}>1,247 kg</p>
          <p style={{ color: "#6ee7b7", fontSize: "0.8rem", margin: 0 }}>Equivalent to planting 62 trees 🌳</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Green Rides", value: "92%", sub: "of total rides" },
            { label: "Streak", value: "23 days", sub: "current streak" },
          ].map((item, i) => (
            <div key={i} style={{ background: "#f0fdf4", borderRadius: 12, padding: "16px 18px", textAlign: "center" as const }}>
              <p style={{ color: "#16a34a", fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>{item.value}</p>
              <p style={{ color: "#15803d", fontSize: "0.75rem", fontWeight: 600, margin: "2px 0 0" }}>{item.label}</p>
              <p style={{ color: "#6b7280", fontSize: "0.68rem", margin: "2px 0 0" }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
        <h3 style={cardTitleStyle}>Recent Activity</h3>
        <div style={{ display: "flex", gap: 16, overflowX: "auto" as const, paddingBottom: 8 }}>
          {rideHistory.slice(0, 3).map((ride) => (
            <div key={ride.id} style={{
              minWidth: 260, background: "#fafafa", borderRadius: 14,
              padding: "18px 20px", border: "1.5px solid #f0f0f0",
              transition: "all 0.25s", cursor: "pointer",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#16a34a", background: "#f0fdf4", padding: "3px 10px", borderRadius: 99 }}>{ride.status}</span>
                <span style={{ color: "#9ca3af", fontSize: "0.72rem" }}>{ride.date}</span>
              </div>
              <p style={{ color: "#0d1117", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 6px" }}>{ride.vehicle}</p>
              <div style={{ display: "flex", gap: 14, color: "#6b7280", fontSize: "0.78rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {ride.duration}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><TrendingUp size={12} /> {ride.distance}</span>
              </div>
              <p style={{ color: "#0d1117", fontWeight: 700, fontSize: "0.9rem", margin: "10px 0 0" }}>{ride.cost}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Rides Tab ─── */
function RidesTab() {
  return (
    <div style={cardStyle}>
      <h3 style={cardTitleStyle}>All Rides</h3>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {rideHistory.map((ride, i) => (
          <div key={ride.id} style={{
            display: "flex", alignItems: "center", gap: 18,
            padding: "18px 0",
            borderBottom: i < rideHistory.length - 1 ? "1px solid #f3f4f6" : "none",
            cursor: "pointer", transition: "background 0.2s",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Car size={22} style={{ color: "#16a34a" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#0d1117", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>{ride.vehicle}</p>
              <p style={{ color: "#9ca3af", fontSize: "0.78rem", margin: "3px 0 0" }}>
                {ride.date} • {ride.duration} • {ride.distance}
              </p>
            </div>
            <div style={{ textAlign: "right" as const }}>
              <p style={{ color: "#0d1117", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>{ride.cost}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end", marginTop: 3 }}>
                {Array.from({ length: ride.rating }).map((_, j) => (
                  <Star key={j} size={12} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
                ))}
              </div>
            </div>
            <ChevronRight size={18} style={{ color: "#d1d5db" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Achievements Tab ─── */
function AchievementsTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {achievements.map((a, i) => (
        <motion.div
          key={a.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.35 }}
          style={cardStyle}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: a.progress === 100 ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "#f9fafb",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem",
              border: a.progress === 100 ? "2px solid #86efac" : "2px solid #e5e7eb",
            }}>
              {a.icon}
            </div>
            <div>
              <p style={{ color: "#0d1117", fontWeight: 700, fontSize: "1rem", margin: 0 }}>{a.title}</p>
              <p style={{ color: "#9ca3af", fontSize: "0.78rem", margin: "2px 0 0" }}>{a.desc}</p>
            </div>
            {a.progress === 100 && (
              <span style={{
                marginLeft: "auto", background: "#f0fdf4",
                color: "#16a34a", fontSize: "0.7rem", fontWeight: 700,
                padding: "4px 12px", borderRadius: 99,
                border: "1.5px solid #bbf7d0",
              }}>
                Unlocked ✓
              </span>
            )}
          </div>
          {/* Progress Bar */}
          <div style={{ background: "#f3f4f6", borderRadius: 99, height: 8, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${a.progress}%` }}
              transition={{ duration: 1, delay: i * 0.15 }}
              style={{
                height: "100%", borderRadius: 99,
                background: a.progress === 100
                  ? "linear-gradient(90deg, #16a34a, #4ade80)"
                  : "linear-gradient(90deg, #16a34a, #86efac)",
              }}
            />
          </div>
          <p style={{ color: "#6b7280", fontSize: "0.72rem", textAlign: "right" as const, margin: "6px 0 0" }}>{a.progress}%</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Settings Tab ─── */
function SettingsTab() {
  return (
    <div style={cardStyle}>
      <h3 style={cardTitleStyle}>Settings</h3>
      {settingsItems.map((item, i) => (
        <div
          key={item.label}
          style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "18px 0",
            borderBottom: i < settingsItems.length - 1 ? "1px solid #f3f4f6" : "none",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <item.icon size={20} style={{ color: "#16a34a" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#0d1117", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>{item.label}</p>
            <p style={{ color: "#9ca3af", fontSize: "0.78rem", margin: "2px 0 0" }}>{item.desc}</p>
          </div>
          <ChevronRight size={18} style={{ color: "#d1d5db" }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Shared Styles ─── */
const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  padding: "26px 28px",
  border: "1.5px solid #f0f0f0",
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
};

const cardTitleStyle: React.CSSProperties = {
  color: "#0d1117",
  fontSize: "1.15rem",
  fontWeight: 800,
  margin: "0 0 20px",
  letterSpacing: "-0.01em",
};
