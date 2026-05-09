import React from "react";

const Details: React.FC = () => {
  return (
    <div>
      {/* Eco Impact Section - with proper container alignment */}
      <div className="bg-green-100 mb-10">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h1 className="font-bold text-center text-5xl mb-12">Our Eco Impact</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="py-6 rounded-2xl bg-white text-center shadow-md hover:shadow-lg transition">
              <div className="flex justify-center mb-3">
                <img src="/leaf.png" className="w-10 h-auto" alt="Leaf icon" />
              </div>
              <h2 className="text-2xl font-bold text-green-700">12,213</h2>
              <p className="text-sm text-gray-500">kg CO₂ saved</p>
            </div>

            <div className="py-6 rounded-2xl bg-white text-center shadow-md hover:shadow-lg transition">
              <div className="flex justify-center mb-3">
                <img src="/battery.png" className="w-10 h-auto" alt="Battery icon" />
              </div>
              <h2 className="text-2xl font-bold text-green-700">8,320</h2>
              <p className="text-sm text-gray-500">Green Rides</p>
            </div>

            <div className="py-6 rounded-2xl bg-white text-center shadow-md hover:shadow-lg transition">
              <div className="flex justify-center mb-3">
                <img src="/rating.png" className="w-10 h-auto" alt="Rating icon" />
              </div>
              <h2 className="text-2xl font-bold text-green-700">4.9</h2>
              <p className="text-sm text-gray-500">Avg Rating</p>
            </div>

            <div className="py-6 rounded-2xl bg-white text-center shadow-md hover:shadow-lg transition">
              <div className="flex justify-center mb-3">
                <img src="/location.png" className="w-10 h-auto" alt="Location icon" />
              </div>
              <h2 className="text-2xl font-bold text-green-700">150+</h2>
              <p className="text-sm text-gray-500">Locations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destinations Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-4xl font-bold text-center mb-4">
          Popular Destinations
        </h3>
        <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
          Discover the most loved routes and spots by our community of green riders.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border rounded-2xl p-6 text-center hover:shadow-lg transition hover:-translate-y-1 duration-300">
            <h2 className="font-bold text-lg text-gray-800">Downtown District</h2>
            <p className="text-gray-500 text-sm mt-1">1.2k Rides / Week</p>
          </div>

          <div className="border rounded-2xl p-6 text-center hover:shadow-lg transition hover:-translate-y-1 duration-300">
            <h2 className="font-bold text-lg text-gray-800">Central Park</h2>
            <p className="text-gray-500 text-sm mt-1">980 Rides / Week</p>
          </div>

          <div className="border rounded-2xl p-6 text-center hover:shadow-lg transition hover:-translate-y-1 duration-300">
            <h2 className="font-bold text-lg text-gray-800">Riverfront Path</h2>
            <p className="text-gray-500 text-sm mt-1">870 Rides / Week</p>
          </div>

          <div className="border rounded-2xl p-6 text-center hover:shadow-lg transition hover:-translate-y-1 duration-300">
            <h2 className="font-bold text-lg text-gray-800">City Square</h2>
            <p className="text-gray-500 text-sm mt-1">760 Rides / Week</p>
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