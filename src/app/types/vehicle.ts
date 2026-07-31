// src/types/vehicle.ts
export type VehicleType = "car" | "bike" | "scooter" | "cycle";

export interface Vehicle {
  id: number;
  name: string;
  type: VehicleType;
  lat: number;
  lng: number;
  battery: number;
  range: number;
  pricePerHour: number;
  image: string;
  brand?: string;
  model?: string;
  isAvailable?: boolean;
  distanceFromUser?: number;
  description?: string;
  seats?: number;
  transmission?: string;
  fuelType?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
}

export interface VehicleApiResponse {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  fuelType: string;
  transmission: string;
  seats: number;
  doors: number;
  luggageCapacity: number;
  features: string[];
  pricePerDay: {
    number: number;
  } | number;
  pricePerWeek: {
    number: number;
  } | null | number;
  pricePerMonth: {
    number: number;
  } | null | number;
  securityDeposit: {
    number: number;
  } | number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
  availableFrom: string | null;
  availableTo: string | null;
  minRentalDays: number;
  maxRentalDays: number;
  description: string;
  terms: string;
  photos: string[];
  totalRentals: number;
  averageRating: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}