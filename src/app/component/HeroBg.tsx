import React from "react";

const HeroBg: React.FC = () => {
  return (
    <div className="w-full">
      <div className="relative">
        <img
          src="herobg.jpg"
          alt="Hero background"
          className="w-full h-150 object-cover"
        />

        <div className="absolute inset-0 bg-black/50"></div>

        <h1 className="absolute top-1/2 -translate-y-40 text-white text-7xl font-bold ml-10">
          Ride Green. <br />
          <span className="text-green-200">Explore Green.</span>
        </h1>

        <p className="absolute top-1/2 text-white ml-11">
          Rent electric vehicles for eco-friendly exploration.
          <br /> Cars, bikes, scooters &amp; cycles — all at your{" "}
          <br />fingertips with smart maps and local recommendations.
        </p>

        <div className="absolute top-1/2 text-white translate-y-30 translate-x-10 gap-2 flex">
          <button className="border-none bg-green-700 py-3 px-5 rounded-lg">
            Rent Now
          </button>
          <button className="border-none py-3 px-5 rounded-lg bg-gray-400/30 backdrop-blur-4xl text-white">
            Explore Map
          </button>
        </div>
      </div>

      <div className="mt-20 text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900">Choose Your Ride</h1>
        <p className="mt-4 text-gray-500 max-w-xl mx-auto text-lg">
          From zippy scooters to comfortable cars — find the perfect electric
          vehicle for every journey.
        </p>
      </div>
    </div>
  );
};

export default HeroBg;
