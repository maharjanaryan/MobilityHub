"use client"

import Footer from "../component/Footer";
import HomeHeader from "./HomeHeader";
import HomeHero from "./HomeHero";


const page = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      <main className="flex-1">
        <HomeHero />



      </main>
      <Footer />
    </div>
  )
}
export default page;