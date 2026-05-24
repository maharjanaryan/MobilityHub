// app/admin/vehicles/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Car,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Fuel,
  Gauge,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Star,
  MoreVertical,
  Download,
  RefreshCw
} from 'lucide-react';

interface Vehicle {
  id: string;
  ownerName: string;
  ownerEmail: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  seats: number;
  pricePerDay: number;
  status: 'available' | 'booked' | 'maintenance' | 'inactive';
  location: string;
  images: string[];
  rating: number;
  totalTrips: number;
  createdAt: string;
}

export default function VehicleManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'booked' | 'maintenance' | 'inactive'>('all');
  const [filterFuel, setFilterFuel] = useState<'all' | 'petrol' | 'diesel' | 'electric' | 'hybrid'>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Mock data - replace with API call
  const vehicles: Vehicle[] = [
    {
      id: '1',
      ownerName: 'Sarah Chen',
      ownerEmail: 'sarah.chen@example.com',
      brand: 'Tesla',
      model: 'Model 3',
      year: 2023,
      color: 'Midnight Silver',
      licensePlate: 'EV-1234',
      fuelType: 'electric',
      transmission: 'automatic',
      seats: 5,
      pricePerDay: 89,
      status: 'available',
      location: 'Los Angeles, CA',
      images: ['/api/placeholder/400/300'],
      rating: 4.9,
      totalTrips: 128,
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      ownerName: 'Emily Watson',
      ownerEmail: 'emily.watson@example.com',
      brand: 'BMW',
      model: 'X5',
      year: 2022,
      color: 'White',
      licensePlate: 'BMW-5678',
      fuelType: 'diesel',
      transmission: 'automatic',
      seats: 7,
      pricePerDay: 120,
      status: 'booked',
      location: 'Houston, TX',
      images: ['/api/placeholder/400/300'],
      rating: 4.7,
      totalTrips: 89,
      createdAt: '2024-01-15'
    },
    {
      id: '3',
      ownerName: 'Lisa Wong',
      ownerEmail: 'lisa.wong@example.com',
      brand: 'Honda',
      model: 'CR-V',
      year: 2023,
      color: 'Blue',
      licensePlate: 'HON-9012',
      fuelType: 'hybrid',
      transmission: 'automatic',
      seats: 5,
      pricePerDay: 65,
      status: 'available',
      location: 'Philadelphia, PA',
      images: ['/api/placeholder/400/300'],
      rating: 4.8,
      totalTrips: 56,
      createdAt: '2024-01-20'
    },
    {
      id: '4',
      ownerName: 'Robert Johnson',
      ownerEmail: 'robert.j@example.com',
      brand: 'Toyota',
      model: 'Camry',
      year: 2021,
      color: 'Black',
      licensePlate: 'TOY-3456',
      fuelType: 'petrol',
      transmission: 'automatic',
      seats: 5,
      pricePerDay: 55,
      status: 'maintenance',
      location: 'Chicago, IL',
      images: ['/api/placeholder/400/300'],
      rating: 4.5,
      totalTrips: 34,
      createdAt: '2024-01-05'
    },
    {
      id: '5',
      ownerName: 'Anna Martinez',
      ownerEmail: 'anna.m@example.com',
      brand: 'Ford',
      model: 'Mustang',
      year: 2022,
      color: 'Red',
      licensePlate: 'FOR-7890',
      fuelType: 'petrol',
      transmission: 'manual',
      seats: 4,
      pricePerDay: 150,
      status: 'available',
      location: 'Miami, FL',
      images: ['/api/placeholder/400/300'],
      rating: 4.9,
      totalTrips: 67,
      createdAt: '2024-01-12'
    },
    {
      id: '6',
      ownerName: 'David Kim',
      ownerEmail: 'david.kim@example.com',
      brand: 'Hyundai',
      model: 'Ioniq 5',
      year: 2023,
      color: 'Silver',
      licensePlate: 'HYU-2345',
      fuelType: 'electric',
      transmission: 'automatic',
      seats: 5,
      pricePerDay: 95,
      status: 'inactive',
      location: 'Phoenix, AZ',
      images: ['/api/placeholder/400/300'],
      rating: 4.6,
      totalTrips: 23,
      createdAt: '2024-01-18'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Available
          </span>
        );
      case 'booked':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Booked
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Maintenance
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </span>
        );
      default:
        return null;
    }
  };

  const getFuelTypeBadge = (fuelType: string) => {
    const icons = {
      electric: '🔋',
      hybrid: '⚡',
      petrol: '⛽',
      diesel: '🛢️'
    };
    return `${icons[fuelType as keyof typeof icons]} ${fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}`;
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesStatus = filterStatus === 'all' ? true : vehicle.status === filterStatus;
    const matchesFuel = filterFuel === 'all' ? true : vehicle.fuelType === filterFuel;
    const matchesSearch = searchTerm === '' ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesFuel && matchesSearch;
  });

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    booked: vehicles.filter(v => v.status === 'booked').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length
  };

  return (
    <>
      {/* Header Stats */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Vehicle Management</h1>
            <p className="text-gray-600">Manage all vehicles listed on the platform</p>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center space-x-2 whitespace-nowrap">
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Total Vehicles</div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-2">Listed on platform</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Available Now</div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.available}</div>
          <div className="text-xs text-gray-500 mt-2">Ready for booking</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Currently Booked</div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.booked}</div>
          <div className="text-xs text-gray-500 mt-2">On rent</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Maintenance</div>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.maintenance}</div>
          <div className="text-xs text-gray-500 mt-2">Under maintenance</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by brand, model, owner or license plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={filterFuel}
                onChange={(e) => setFilterFuel(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Fuel Types</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterFuel('all');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm whitespace-nowrap"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
            {/* Vehicle Image */}
            <div className="relative h-48 bg-gray-100">
              <Image
                src={vehicle.images[0]}
                alt={`${vehicle.brand} ${vehicle.model}`}
                fill
                className="object-cover"
              />
              <div className="absolute top-3 right-3">
                <button className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-emerald-600 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-3 left-3">
                {getStatusBadge(vehicle.status)}
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.color}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">${vehicle.pricePerDay}</p>
                  <p className="text-xs text-gray-500">per day</p>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  {vehicle.seats} Seats
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Gauge className="w-4 h-4 mr-2 text-gray-400" />
                  {vehicle.transmission}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Fuel className="w-4 h-4 mr-2 text-gray-400" />
                  {getFuelTypeBadge(vehicle.fuelType)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {vehicle.location}
                </div>
              </div>

              {/* Owner Info */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Owner</p>
                  <p className="text-sm font-medium text-gray-800">{vehicle.ownerName}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">{vehicle.rating}</span>
                  <span className="text-xs text-gray-500">({vehicle.totalTrips} trips)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setSelectedVehicle(vehicle)}
                  className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors flex items-center justify-center space-x-1">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setShowDeleteModal(true);
                  }}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No vehicles found</p>
        </div>
      )}

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 md:p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Vehicle Details</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedVehicle.brand} {selectedVehicle.model}
                </p>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Images */}
                <div>
                  <div className="relative h-64 bg-gray-100 rounded-xl overflow-hidden mb-3">
                    <Image
                      src={selectedVehicle.images[0]}
                      alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedVehicle.images.map((img, idx) => (
                      <div key={idx} className="relative h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <Image src={img} alt={`Vehicle ${idx + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Vehicle Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">License Plate</p>
                        <p className="text-sm font-medium text-gray-800">{selectedVehicle.licensePlate}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Year</p>
                        <p className="text-sm font-medium text-gray-800">{selectedVehicle.year}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Color</p>
                        <p className="text-sm font-medium text-gray-800">{selectedVehicle.color}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Transmission</p>
                        <p className="text-sm font-medium text-gray-800">{selectedVehicle.transmission}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Fuel Type</p>
                        <p className="text-sm font-medium text-gray-800">{getFuelTypeBadge(selectedVehicle.fuelType)}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Seats</p>
                        <p className="text-sm font-medium text-gray-800">{selectedVehicle.seats}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Owner Information</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Owner Name</p>
                        <p className="text-sm font-medium text-gray-800">{selectedVehicle.ownerName}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-800">{selectedVehicle.ownerEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Pricing & Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Price Per Day</p>
                        <p className="text-lg font-bold text-emerald-600">${selectedVehicle.pricePerDay}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Total Trips</p>
                        <p className="text-lg font-bold text-gray-800">{selectedVehicle.totalTrips}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Rating</p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-lg font-bold text-gray-800">{selectedVehicle.rating}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Listed On</p>
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(selectedVehicle.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                      Edit Vehicle
                    </button>
                    <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      View Bookings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Delete Vehicle</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to delete {selectedVehicle.brand} {selectedVehicle.model}? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedVehicle(null);
                    alert('Vehicle deleted successfully');
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}