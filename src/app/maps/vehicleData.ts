// Mock vehicle data scattered around Kathmandu & Lalitpur

export interface Vehicle {
  id: number;
  type: "car" | "bike" | "scooter" | "cycle";
  name: string;
  lat: number;
  lng: number;
  battery: number;
  range: number;
  pricePerHour: number;
  image: string;
}

const vehicles: Vehicle[] = [
  // === KATHMANDU ===
  { id: 1, type: "car", name: "Tesla Model 3", lat: 27.7172, lng: 85.324, battery: 87, range: 420, pricePerHour: 1200, image: "/electriccar.jpg" },
  { id: 2, type: "bike", name: "Zero SR/F", lat: 27.7105, lng: 85.3295, battery: 72, range: 130, pricePerHour: 400, image: "/bikes.jpg" },
  { id: 3, type: "scooter", name: "Ather 450X", lat: 27.7215, lng: 85.318, battery: 95, range: 75, pricePerHour: 200, image: "/scooters.jpg" },
  { id: 4, type: "cycle", name: "VanMoof S5", lat: 27.7085, lng: 85.3365, battery: 60, range: 45, pricePerHour: 100, image: "/cycle.jpg" },
  { id: 5, type: "car", name: "BYD Atto 3", lat: 27.7255, lng: 85.312, battery: 64, range: 345, pricePerHour: 1000, image: "/electriccar.jpg" },
  { id: 6, type: "scooter", name: "Ola S1 Pro", lat: 27.7138, lng: 85.3405, battery: 88, range: 65, pricePerHour: 180, image: "/scooters.jpg" },
  { id: 7, type: "bike", name: "Ultraviolette F77", lat: 27.7195, lng: 85.3055, battery: 45, range: 95, pricePerHour: 450, image: "/bikes.jpg" },
  { id: 8, type: "cycle", name: "Cowboy Classic", lat: 27.7248, lng: 85.3332, battery: 82, range: 55, pricePerHour: 120, image: "/cycle.jpg" },
  { id: 9, type: "car", name: "MG ZS EV", lat: 27.7062, lng: 85.3148, battery: 91, range: 380, pricePerHour: 950, image: "/electriccar.jpg" },
  { id: 10, type: "scooter", name: "TVS iQube", lat: 27.7298, lng: 85.3275, battery: 55, range: 50, pricePerHour: 150, image: "/scooters.jpg" },

  // === LALITPUR / PATAN ===
  { id: 11, type: "car", name: "Hyundai Ioniq 5", lat: 27.6725, lng: 85.3206, battery: 78, range: 450, pricePerHour: 1400, image: "/electriccar.jpg" },
  { id: 12, type: "bike", name: "Revolt RV400", lat: 27.6688, lng: 85.3155, battery: 68, range: 110, pricePerHour: 350, image: "/bikes.jpg" },
  { id: 13, type: "scooter", name: "Bajaj Chetak", lat: 27.6762, lng: 85.3282, battery: 92, range: 70, pricePerHour: 170, image: "/scooters.jpg" },
  { id: 14, type: "cycle", name: "Rad Power RadCity", lat: 27.6815, lng: 85.3118, battery: 74, range: 40, pricePerHour: 90, image: "/cycle.jpg" },
  { id: 15, type: "bike", name: "Tork Kratos", lat: 27.6648, lng: 85.3245, battery: 38, range: 85, pricePerHour: 300, image: "/bikes.jpg" },
  { id: 16, type: "car", name: "Tata Nexon EV", lat: 27.6702, lng: 85.3335, battery: 82, range: 312, pricePerHour: 900, image: "/electriccar.jpg" },
  { id: 17, type: "scooter", name: "NIU NQi GTS", lat: 27.6775, lng: 85.3095, battery: 65, range: 60, pricePerHour: 160, image: "/scooters.jpg" },
  { id: 18, type: "cycle", name: "Trek Allant+ 7", lat: 27.6635, lng: 85.3175, battery: 88, range: 50, pricePerHour: 110, image: "/cycle.jpg" },
  { id: 19, type: "car", name: "Kia EV6", lat: 27.6855, lng: 85.3365, battery: 71, range: 528, pricePerHour: 1600, image: "/electriccar.jpg" },
  { id: 20, type: "bike", name: "Ather Rizta", lat: 27.6738, lng: 85.3042, battery: 91, range: 125, pricePerHour: 380, image: "/bikes.jpg" },
  { id: 21, type: "scooter", name: "Simple One", lat: 27.6592, lng: 85.3222, battery: 77, range: 55, pricePerHour: 190, image: "/scooters.jpg" },
  { id: 22, type: "cycle", name: "Specialized Turbo", lat: 27.6668, lng: 85.3388, battery: 56, range: 38, pricePerHour: 130, image: "/cycle.jpg" },
  { id: 23, type: "car", name: "BYD Seal", lat: 27.6612, lng: 85.3128, battery: 95, range: 570, pricePerHour: 1800, image: "/electriccar.jpg" },
  { id: 24, type: "scooter", name: "Yadea G5", lat: 27.6795, lng: 85.3418, battery: 44, range: 42, pricePerHour: 140, image: "/scooters.jpg" },
];

export default vehicles;
