import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-950 dark:bg-gray-900 text-gray-300 dark:text-gray-400">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-4">
              🌿 Mobility Hub
            </h2>
            <p className="text-gray-400 dark:text-gray-400 text-sm leading-relaxed mb-6">
              Ride green, explore green. Rent electric vehicles for eco-friendly
              exploration — cars, bikes, scooters &amp; cycles at your fingertips.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-green-900 dark:bg-gray-700 hover:bg-green-700 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-300"
              >
                <svg className="w-4 h-4 text-white dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-green-900 dark:bg-gray-700 hover:bg-green-700 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-300"
              >
                <svg className="w-4 h-4 text-white dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-green-900 dark:bg-gray-700 hover:bg-green-700 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-300"
              >
                <svg className="w-4 h-4 text-white dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-green-900 dark:bg-gray-700 hover:bg-green-700 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-300"
              >
                <svg className="w-4 h-4 text-white dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white dark:text-gray-100 font-semibold text-lg mb-5 relative">
              Quick Links
              <span className="block w-8 h-0.5 bg-green-500 dark:bg-green-400 mt-2 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-green-400 dark:hover:text-green-400 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-green-500 dark:text-green-400">›</span> Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 dark:hover:text-green-400 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-green-500 dark:text-green-400">›</span> About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 dark:hover:text-green-400 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-green-500 dark:text-green-400">›</span> Explore Map
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 dark:hover:text-green-400 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-green-500 dark:text-green-400">›</span> Gallery
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 dark:hover:text-green-400 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-green-500 dark:text-green-400">›</span> Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Vehicle Categories */}
          <div>
            <h3 className="text-white dark:text-gray-100 font-semibold text-lg mb-5 relative">
              Vehicles
              <span className="block w-8 h-0.5 bg-green-500 dark:bg-green-400 mt-2 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-green-400 dark:hover:text-green-400 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-green-500 dark:text-green-400">›</span> Electric Cars
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 dark:hover:text-green-400 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-green-500 dark:text-green-400">›</span> Electric Bikes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 dark:hover:text-green-400 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-green-500 dark:text-green-400">›</span> E-Scooters
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 dark:hover:text-green-400 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-green-500 dark:text-green-400">›</span> E-Cycles
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white dark:text-gray-100 font-semibold text-lg mb-5 relative">
              Stay Updated
              <span className="block w-8 h-0.5 bg-green-500 dark:bg-green-400 mt-2 rounded-full"></span>
            </h3>
            <p className="text-gray-400 dark:text-gray-400 text-sm mb-4 leading-relaxed">
              Subscribe to our newsletter for the latest updates on green mobility and exclusive offers.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 rounded-lg bg-green-900/60 dark:bg-gray-700 border border-green-800 dark:border-gray-600 text-white dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-1 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-300"
              />
              <button className="w-full bg-green-700 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors duration-300">
                Subscribe →
              </button>
            </div>

            {/* Contact Info */}
            <div className="mt-6 space-y-2 text-sm text-gray-400 dark:text-gray-400">
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@mobilityhub.com
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +977 987656716
              </p>
              <p className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Lalitpur, Nepal
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-green-900 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            © {new Date().getFullYear()} Mobility Hub. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-500">
            <a href="#" className="hover:text-green-400 dark:hover:text-green-400 transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-green-400 dark:hover:text-green-400 transition-colors duration-300">Terms of Service</a>
            <a href="#" className="hover:text-green-400 dark:hover:text-green-400 transition-colors duration-300">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;