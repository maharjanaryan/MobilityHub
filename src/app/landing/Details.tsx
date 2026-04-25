import React from "react";

const Details: React.FC = () => {
  return (
    <div>
      <div className="bg-green-100 mb-10">
        <h1 className="font-bold flex justify-center text-5xl p-10">Our Eco Impact</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-6">
          <div className="py-6 px-25 rounded-2xl bg-white mb-15">
            <img src="/leaf.png" className="w-10 h-auto" alt="Leaf icon" />
            <h2>12,213</h2>
            <p className="text-sm text-gray-400">kg CO2 saved</p>
          </div>
          <div className="py-6 px-25 rounded-2xl bg-white mb-15">
            <img src="/battery.png" className="w-10 h-auto" alt="Battery icon" />
            <h2>8,320</h2>
            <p className="text-sm text-gray-400">Green Rides</p>
          </div>
          <div className="py-6 px-25 rounded-2xl bg-white mb-15">
            <img src="/rating.png" className="w-10 h-auto" alt="Rating icon" />
            <h2>4.9</h2>
            <p className="text-sm text-gray-400">Avg Rating</p>
          </div>
          <div className="py-6 px-25 rounded-2xl bg-white mb-15">
            <img src="/location.png" className="w-10 h-auto" alt="Location icon" />
            <h2>150+</h2>
            <p className="text-sm text-gray-400">Location</p>
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="px-10 py-16">
        <h3 className="text-4xl font-bold flex justify-center mb-4">
          Popular Destinations
        </h3>
        <p className="flex justify-center text-gray-400 text-center mb-12">
          Discover the most loved routes and spots by our <br />
          community of green riders.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="border rounded-2xl p-6 text-center hover:shadow-lg transition">
            <h2 className="font-bold text-lg">Downtown District</h2>
            <p className="text-gray-400 text-sm mt-1">1.2k Rides / Week</p>
          </div>
          <div className="border rounded-2xl p-6 text-center hover:shadow-lg transition">
            <h2 className="font-bold text-lg">Central Park</h2>
            <p className="text-gray-400 text-sm mt-1">980 Rides / Week</p>
          </div>
          <div className="border rounded-2xl p-6 text-center hover:shadow-lg transition">
            <h2 className="font-bold text-lg">Riverfront Path</h2>
            <p className="text-gray-400 text-sm mt-1">870 Rides / Week</p>
          </div>
          <div className="border rounded-2xl p-6 text-center hover:shadow-lg transition">
            <h2 className="font-bold text-lg">City Square</h2>
            <p className="text-gray-400 text-sm mt-1">760 Rides / Week</p>
          </div>
        </div>
      </div>

      {/* Comments placeholder */}
      <div></div>
    </div>
  );
};

export default Details;
