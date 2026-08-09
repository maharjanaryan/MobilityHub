"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

const Header: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navigateTo = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <nav className="bg-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2 min-w-0">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover hover:text-green-600 cursor-pointer shrink-0"
            onClick={() => navigateTo("/")}
          />
          <h1
            className="text-lg sm:text-xl font-bold cursor-pointer truncate"
            onClick={() => navigateTo("/")}
          >
            Mobility hub
          </h1>
        </div>

        <ul className="hidden md:flex items-center space-x-6 text-gray-500">
          <li
            className="hover:text-green-600 cursor-pointer"
            onClick={() => navigateTo("/maps")}
          >
            Maps
          </li>
          <li className="hover:text-green-600 cursor-pointer" onClick={() => navigateTo("/vehicles")}>Vehicles</li>
          <li className="hover:text-green-600 cursor-pointer">Gallery</li>
          <li
            className="hover:text-green-600 cursor-pointer"
            onClick={() => navigateTo("/about")}
          >
            About Us
          </li>
        </ul>

        <div className="hidden sm:flex space-x-2">
          <button
            className="bg-gray-200 rounded-2xl px-4 py-2 hover:bg-gray-300 transition-colors"
            onClick={() => navigateTo("/signin")}
          >
            Sign in
          </button>
          <button className="border rounded-2xl px-4 py-2 bg-green-700 text-white hover:bg-green-600 transition-colors">
            Rent Now
          </button>
        </div>

        <button
          type="button"
          className="md:hidden p-2 rounded-full hover:bg-gray-200 transition-colors"
          onClick={() => setIsOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 grid gap-1 text-gray-600">
            {[
              ["Maps", "/maps"],
              ["Vehicles", "/vehicles"],
              ["Gallery", "/gallery"],
              ["About Us", "/about"],
            ].map(([label, path]) => (
              <button
                key={label}
                type="button"
                onClick={() => navigateTo(path)}
                className="text-left px-3 py-2 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                {label}
              </button>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                className="bg-gray-100 rounded-xl px-4 py-2 hover:bg-gray-200 transition-colors"
                onClick={() => navigateTo("/signin")}
              >
                Sign in
              </button>
              <button className="rounded-xl px-4 py-2 bg-green-700 text-white hover:bg-green-600 transition-colors">
                Rent Now
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;