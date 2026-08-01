// src/service/vehicleService.ts
import axios from 'axios';
import { Vehicle, VehicleApiResponse } from '../types/vehicle';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  page?: number;
  size?: number;
  type?: string;
}

// Helper to safely get price value from various formats
const getPriceValue = (price: any): number => {
  if (typeof price === 'number') return price;
  if (price && typeof price === 'object' && 'number' in price) {
    return typeof price.number === 'number' ? price.number : 0;
  }
  return 0;
};

// Helper to map vehicle type based on multiple factors - IMPROVED
const mapToVehicleType = (
  fuelType: string,
  seats?: number,
  transmission?: string,
  brand?: string,
  model?: string
): 'car' | 'bike' | 'scooter' | 'cycle' => {
  const fuelTypeLower = fuelType?.toLowerCase() || '';
  const brandLower = brand?.toLowerCase() || '';
  const modelLower = model?.toLowerCase() || '';

  // Check if it's a cycle based on brand/model
  if (brandLower.includes('cycle') || modelLower.includes('cycle') ||
    brandLower.includes('bicycle') || modelLower.includes('bicycle')) {
    return 'cycle';
  }

  // Check if it's a scooter based on model names
  const scooterModels = ['activa', 'chetak', 'ather', 'ola', 'iqube', 'scooter', 'scooty', 'vespa', 'access', 'burgman'];
  if (scooterModels.some(m => modelLower.includes(m) || brandLower.includes(m))) {
    return 'scooter';
  }

  // Check if it's a bike based on brand
  const bikeBrands = ['yamaha', 'suzuki', 'kawasaki', 'ducati', 'ktm', 'bajaj', 'tvs', 'hero', 'royal enfield', 'aprilia', 'harley-davidson', 'triumph', 'revolt', 'tork'];
  if (bikeBrands.some(b => brandLower.includes(b))) {
    // Check if it's a scooter brand
    const scooterBrands = ['vespa', 'ather', 'ola'];
    if (scooterBrands.some(b => brandLower.includes(b))) {
      return 'scooter';
    }
    return 'bike';
  }

  // Check by seats
  if (seats) {
    if (seats <= 2) {
      // If seats are 2 or less, it's a bike or scooter
      if (transmission?.toLowerCase() === 'automatic' ||
        fuelTypeLower.includes('electric') && seats <= 2) {
        return 'scooter';
      }
      return 'bike';
    }
    if (seats >= 4) {
      return 'car';
    }
  }

  // Check by fuel type for two-wheelers
  if (fuelTypeLower === 'cycle' || fuelTypeLower === 'bicycle') {
    return 'cycle';
  }
  if (fuelTypeLower === 'motorcycle' || fuelTypeLower === 'bike') {
    return 'bike';
  }
  if (fuelTypeLower === 'scooter' || fuelTypeLower === 'scooty') {
    return 'scooter';
  }

  // Default mapping for car fuel types
  const carFuelTypes = ['petrol', 'diesel', 'hybrid', 'cng', 'lpg'];
  if (carFuelTypes.includes(fuelTypeLower)) {
    // If seats are 2 or less with car fuel type, it might be a bike
    if (seats && seats <= 2) {
      return 'bike';
    }
    return 'car';
  }

  // For electric vehicles, determine by seats
  if (fuelTypeLower === 'electric') {
    if (seats && seats <= 2) {
      // Check if it's a scooter brand
      const scooterBrands = ['ather', 'ola', 'simple', 'bajaj'];
      if (scooterBrands.some(b => brandLower.includes(b))) {
        return 'scooter';
      }
      return 'bike';
    }
    return 'car';
  }

  // Default to car
  return 'car';
};

// Helper function to map API response to frontend Vehicle type
const mapApiToVehicle = (apiVehicle: VehicleApiResponse): Vehicle => {
  // Determine vehicle type using enhanced mapping
  const vehicleType = mapToVehicleType(
    apiVehicle.fuelType,
    apiVehicle.seats,
    apiVehicle.transmission,
    apiVehicle.brand,
    apiVehicle.model
  );

  // Determine if it's a two-wheeler for battery/range defaults
  const isTwoWheeler = vehicleType === 'bike' || vehicleType === 'scooter' || vehicleType === 'cycle';

  return {
    id: apiVehicle.id,
    name: `${apiVehicle.brand} ${apiVehicle.model}`,
    type: vehicleType,
    lat: apiVehicle.latitude || 27.7172,
    lng: apiVehicle.longitude || 85.324,
    battery: Math.floor(Math.random() * 100),
    range: isTwoWheeler ? Math.floor(Math.random() * 150) + 50 : Math.floor(Math.random() * 200) + 50,
    pricePerHour: getPriceValue(apiVehicle.pricePerDay),
    image: apiVehicle.photos && apiVehicle.photos.length > 0
      ? apiVehicle.photos[0]
      : '/images/default-vehicle.jpg',
    brand: apiVehicle.brand,
    model: apiVehicle.model,
    isAvailable: apiVehicle.isAvailable,
    description: apiVehicle.description,
    seats: apiVehicle.seats,
    transmission: apiVehicle.transmission,
    fuelType: apiVehicle.fuelType,
    year: apiVehicle.year,
    color: apiVehicle.color,
    licensePlate: apiVehicle.licensePlate
  };
};

export const vehicleService = {
  // Get all vehicles using the search endpoint
  getAllVehicles: async (): Promise<Vehicle[]> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const headers: any = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post<{ content: VehicleApiResponse[] }>(
        `${API_BASE_URL}/vehicles/search`,
        {
          brand: '',
          model: '',
          city: '',
          fuelType: '',
          transmission: '',
          minSeats: null,
          maxSeats: null,
          minPrice: null,
          maxPrice: null,
          page: 0,
          size: 100,
          sortBy: 'recent'
        },
        { headers }
      );
      return response.data.content.map(mapApiToVehicle);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },

  // Get featured vehicles
  getFeaturedVehicles: async (page: number = 0, size: number = 50): Promise<Vehicle[]> => {
    try {
      const response = await axios.get<{ content: VehicleApiResponse[] }>(
        `${API_BASE_URL}/vehicles/featured?page=${page}&size=${size}`
      );
      return response.data.content.map(mapApiToVehicle);
    } catch (error) {
      console.error('Error fetching featured vehicles:', error);
      throw error;
    }
  },

  // Get recent vehicles
  getRecentVehicles: async (page: number = 0, size: number = 50): Promise<Vehicle[]> => {
    try {
      const response = await axios.get<{ content: VehicleApiResponse[] }>(
        `${API_BASE_URL}/vehicles/recent?page=${page}&size=${size}`
      );
      return response.data.content.map(mapApiToVehicle);
    } catch (error) {
      console.error('Error fetching recent vehicles:', error);
      throw error;
    }
  },

  // Get vehicle by ID
  getVehicleById: async (vehicleId: number): Promise<Vehicle> => {
    try {
      const response = await axios.get<VehicleApiResponse>(
        `${API_BASE_URL}/vehicles/${vehicleId}`
      );
      return mapApiToVehicle(response.data);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  },

  // Get vehicle location by ID
  getVehicleLocation: async (vehicleId: number): Promise<Vehicle> => {
    try {
      const response = await axios.get<VehicleApiResponse>(
        `${API_BASE_URL}/vehicles/${vehicleId}/location`
      );
      return mapApiToVehicle(response.data);
    } catch (error) {
      console.error('Error fetching vehicle location:', error);
      throw error;
    }
  },

  // Search vehicles with custom filters
  searchVehicles: async (searchParams: any): Promise<Vehicle[]> => {
    try {
      const response = await axios.post<{ content: VehicleApiResponse[] }>(
        `${API_BASE_URL}/vehicles/search`,
        searchParams
      );
      return response.data.content.map(mapApiToVehicle);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  },

  // Get nearby vehicles based on user location
  getNearbyVehicles: async (params: NearbySearchParams): Promise<Vehicle[]> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const headers: any = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post<{ content: VehicleApiResponse[] }>(
        `${API_BASE_URL}/vehicles/search`,
        {
          brand: '',
          model: '',
          city: '',
          fuelType: params.type || '',
          transmission: '',
          minSeats: null,
          maxSeats: null,
          minPrice: null,
          maxPrice: null,
          page: params.page || 0,
          size: params.size || 50,
          sortBy: 'recent'
        },
        { headers }
      );
      return response.data.content.map(mapApiToVehicle);
    } catch (error) {
      console.error('Error fetching nearby vehicles:', error);
      throw error;
    }
  }
};