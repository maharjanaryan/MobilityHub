"use client";
import { useRouter } from "next/navigation";
import Header from "./component/Header";
import HeroBg from "./component/HeroBg";
import ElectricCategories from "./landing/ElectricCategories.js";
import Details from "./landing/Details";
import Footer from "./component/Footer";


export default function Home() {
  const router = useRouter();

  const handleClick =()=>{
    router.push("/about");
  }

  return (
    <>
    <Header />
    <HeroBg />
    <ElectricCategories />
    <Details />
    <Footer />



    
    </>
  );
}
