"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Settings, FileText, LogOut, Bell } from "lucide-react";

const HomeHeader: React.FC = () => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Sample user data (replace with actual user data from auth)
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/logo.png"
  };

  // Sample notifications data
  const notifications = [
    { id: 1, message: "Your ride is confirmed!", time: "5 min ago", read: false },
    { id: 2, message: "New eco-friendly route available", time: "1 hour ago", read: false },
    { id: 3, message: "Special discount for this weekend", time: "3 hours ago", read: true },
    { id: 4, message: "Rate your recent ride", time: "1 day ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    router.push("/login");
  };

  const menuItems = [
    { label: "Profile", icon: User, onClick: () => router.push("/profile"), divider: false },
    { label: "Settings", icon: Settings, onClick: () => router.push("/settings"), divider: false },
    { label: "My Reports", icon: FileText, onClick: () => router.push("/reports"), divider: true },
    { label: "Logout", icon: LogOut, onClick: handleLogout, divider: false, danger: true },
  ];

  return (
    <nav className="bg-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">

        {/* LEFT: Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push("/home")}>
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover"
          />
          <h1 className="text-xl font-bold">Mobility hub</h1>
        </div>

        {/* CENTER: Menu */}
        <ul className="flex space-x-6 text-gray-500">
          <li
            className="hover:text-green-600 cursor-pointer transition-colors"
            onClick={() => router.push("/home")}
          >
            Home
          </li>
          <li
            className="hover:text-green-600 cursor-pointer transition-colors"
            onClick={() => router.push("/maps")}
          >
            Maps
          </li>
          <li className="hover:text-green-600 cursor-pointer transition-colors">Vehicles</li>
          <li className="hover:text-green-600 cursor-pointer transition-colors">Gallery</li>
          <li
            className="hover:text-green-600 cursor-pointer transition-colors"
            onClick={() => router.push("/about")}
          >
            About Us
          </li>
        </ul>

        {/* RIGHT: Notification and Profile */}
        <div className="flex items-center space-x-4">

          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <button
                    onClick={() => console.log("Mark all as read")}
                    className="text-xs text-green-600 hover:text-green-700"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? "bg-green-50" : ""
                          }`}
                        onClick={() => {
                          console.log("Notification clicked:", notification.id);
                          setShowNotifications(false);
                        }}
                      >
                        <p className={`text-sm ${!notification.read ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-200 text-center">
                  <button
                    onClick={() => router.push("/notifications")}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown (without chevron) */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img
                src={user.avatar}
                alt="Profile"
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 hover:border-green-500 transition-colors"
              />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info Section */}
                <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-gray-50 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border-2 border-green-500 object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {menuItems.map((item, index) => (
                    <React.Fragment key={item.label}>
                      <button
                        onClick={() => {
                          item.onClick();
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 flex items-center space-x-3 transition-colors ${item.danger
                            ? "text-red-600 hover:bg-red-50"
                            : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        <item.icon size={18} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                      {item.divider && index < menuItems.length - 1 && (
                        <div className="border-t border-gray-200 my-1" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default HomeHeader;