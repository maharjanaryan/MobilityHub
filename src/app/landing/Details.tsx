import React from "react";

const Details: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Eco Impact Section - with proper container alignment */}
      <div className="bg-green-100 dark:bg-green-950/30 mb-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h1 className="font-bold text-center text-5xl mb-12 text-gray-900 dark:text-white">
            Our Eco Impact
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="py-6 rounded-2xl bg-white dark:bg-gray-900 text-center shadow-md hover:shadow-lg transition border border-gray-100 dark:border-gray-800">
              <div className="flex justify-center mb-3">
                <img src="/leaf.png" className="w-10 h-auto" alt="Leaf icon" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">12,213</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">kg CO₂ saved</p>
            </div>

            <div className="py-6 rounded-2xl bg-white dark:bg-gray-900 text-center shadow-md hover:shadow-lg transition border border-gray-100 dark:border-gray-800">
              <div className="flex justify-center mb-3">
                <img src="/battery.png" className="w-10 h-auto" alt="Battery icon" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">8,320</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Green Rides</p>
            </div>

            <div className="py-6 rounded-2xl bg-white dark:bg-gray-900 text-center shadow-md hover:shadow-lg transition border border-gray-100 dark:border-gray-800">
              <div className="flex justify-center mb-3">
                <img src="/rating.png" className="w-10 h-auto" alt="Rating icon" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">4.9</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</p>
            </div>

            <div className="py-6 rounded-2xl bg-white dark:bg-gray-900 text-center shadow-md hover:shadow-lg transition border border-gray-100 dark:border-gray-800">
              <div className="flex justify-center mb-3">
                <img src="/location.png" className="w-10 h-auto" alt="Location icon" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">150+</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Locations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destinations Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Popular Destinations
        </h3>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Discover the most loved routes and spots by our community of green riders.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:shadow-lg transition hover:-translate-y-1 duration-300 bg-white dark:bg-gray-900">
            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">Downtown District</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">1.2k Rides / Week</p>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:shadow-lg transition hover:-translate-y-1 duration-300 bg-white dark:bg-gray-900">
            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">Central Park</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">980 Rides / Week</p>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:shadow-lg transition hover:-translate-y-1 duration-300 bg-white dark:bg-gray-900">
            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">Riverfront Path</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">870 Rides / Week</p>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:shadow-lg transition hover:-translate-y-1 duration-300 bg-white dark:bg-gray-900">
            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">City Square</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">760 Rides / Week</p>
          </div>
        </div>
      </div>

      {/* Comments placeholder - aligned container */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Add comments component here later */}
      </div>
    </div>
  );
};

export default Details;