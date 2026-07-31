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

// Helper to map fuel type to vehicle type
const mapFuelTypeToVehicleType = (fuelType: string): 'car' | 'bike' | 'scooter' | 'cycle' => {
  const mapping: Record<string, 'car' | 'bike' | 'scooter' | 'cycle'> = {
    'petrol': 'car',
    'diesel': 'car',
    'electric': 'car',
    'hybrid': 'car',
    'cng': 'car',
    'lpg': 'car'
  };
  return mapping[fuelType?.toLowerCase()] || 'car';
};

// Helper function to map API response to frontend Vehicle type
const mapApiToVehicle = (apiVehicle: VehicleApiResponse): Vehicle => {
  return {
    id: apiVehicle.id,
    name: `${apiVehicle.brand} ${apiVehicle.model}`,
    type: mapFuelTypeToVehicleType(apiVehicle.fuelType),
    lat: apiVehicle.latitude || 27.7172,
    lng: apiVehicle.longitude || 85.324,
    battery: Math.floor(Math.random() * 100),
    range: Math.floor(Math.random() * 200) + 50,
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