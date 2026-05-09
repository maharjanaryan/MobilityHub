"use client";

import React from "react";
import Footer from "../component/Footer";
import EVSection from "./EVSection";
import HomeHeader from "./HomeHeader";
import HomeHero from "./HomeHero";

const Page: React.FC = () => {
  return (
    <div
      className="min-h-screen flex flex-col"

    >
      <HomeHeader />
      <main className="flex-1">
        <HomeHero />
        <EVSection />
      </main>
      <Footer />
    </div>
  );
};

export default Page;
