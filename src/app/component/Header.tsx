"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Header: React.FC = () => {
  const router = useRouter();

  return (
    <nav className="bg-gray-100 flex align-center justify-between p-2">
      <div className="flex items-center space-x-2 m-2">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-10 h-10 rounded-full object-cover hover:text-green-600 cursor-pointer"
          onClick={() => router.push("/")}
        />
        <h1
          className="text-xl font-bold m-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          Mobility hub
        </h1>
      </div>

      <ul className="flex space-x-6 text-gray-400 mt-4">
        <li
          className="hover:text-green-600 cursor-pointer"
          onClick={() => router.push("/maps")}
        >
          Maps
        </li>
        <li className="hover:text-green-600 cursor-pointer">Vehicles</li>
        <li className="hover:text-green-600 cursor-pointer">Gallery</li>
        <li
          className="hover:text-green-600 cursor-pointer"
          onClick={() => router.push("/about")}
        >
          About Us
        </li>
      </ul>

      <div className="flex space-x-2 px-2 m-2">
        <button
          className="bg-gray-200 rounded-2xl px-4 py-2"
          onClick={() => router.push("/signin")}
        >
          Sign in
        </button>
        <button className="border rounded-2xl p-2 bg-green-700 text-white">
          Rent Now
        </button>
      </div>
    </nav>
  );
};

export default Header;
