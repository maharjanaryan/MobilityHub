// app/profile/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import HomeHeader from "../home/HomeHeader";
import Footer from "../component/Footer";
import VehicleDetailModal from "../component/VehicleDetailModal";
import {
  User, Mail, Phone, MapPin, Calendar, Car,
  Clock, Star, ChevronRight, Edit3, Camera, Shield,
  Lock, Award, TrendingUp, X,
  Loader2, CheckCircle, AlertCircle, Save, Trash2,
  Plus, Eye, Fuel, Gauge, Users,
  XCircle
} from "lucide-react";
import OverviewTab from "./Overview";
import RidesTab from "./RidesTab";
import MyVehiclesTab from "./MyVehiclesTab";

// Types
interface UserProfileData {
  id: number;
  username: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  renterKycStatus: string;
  ownerKycStatus: string;
  canBook: boolean;
  canList: boolean;
}

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  fuelType: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  isAvailable: boolean;
  isVerified: boolean;
  rejectionReason?: string;
  photos: string[];
  city: string;
  createdAt: string;
  description?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
}

interface VehicleBookingStatus {
  vehicleId: number;
  vehicleName: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  isCurrentlyBooked: boolean;
  activeBookings: BookingSummary[];
  nextAvailableDate: string | null;
  totalActiveBookings: number;
}

interface BookingSummary {
  bookingId: number;
  bookingReference: string;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  pickupDate: string;
  dropoffDate: string;
  status: string;
  totalAmount: number;
  totalDays: number;
  paymentStatus: string;
  paymentMethod: string;
}

interface EditProfileFormData {
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type TabKey = "overview" | "rides" | "vehicles";

const defaultUserData: UserProfileData = {
  id: 0,
  username: "",
  email: "",
  fullName: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  avatarUrl: "/logo.png",
  role: "USER",
  isActive: true,
  emailVerified: false,
  createdAt: new Date().toISOString(),
  renterKycStatus: "NOT_SUBMITTED",
  ownerKycStatus: "NOT_SUBMITTED",
  canBook: false,
  canList: false
};

const API_BASE_URL = "http://localhost:8080";

const normalizeAvatarUrl = (url?: string | null) => {
  if (!url) return "/logo.png";
  if (url.startsWith("http") || url.startsWith("data:image") || url.startsWith("/logo.png")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

const readApiResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
};

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
    >
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      {message}
    </motion.div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
              <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Avatar Upload Modal
const AvatarUploadModal = ({ isOpen, onClose, onUpload, onDelete, loading, currentAvatar }: any) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select an image file (JPG, PNG, GIF, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    await onUpload(selectedFile);
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm('Are you sure you want to remove your profile picture?')) {
      setDeleteLoading(true);
      await onDelete();
      setDeleteLoading(false);
    }
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    handleRemove();
    onClose();
  };

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Profile Picture">
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={preview || currentAvatar || "/logo.png"}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-green-500 dark:border-green-400"
              onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
            />
            {preview && (
              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Choose Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-green-900/30 file:text-green-700 dark:file:text-green-300 hover:file:bg-green-100 dark:hover:file:bg-green-900/50 cursor-pointer"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max file size: 5MB. Supported formats: JPG, PNG, GIF, WEBP</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            className="flex-1 bg-green-600 dark:bg-green-500 text-white py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {loading ? 'Uploading...' : 'Upload Photo'}
          </button>
          <button
            onClick={handleClose}
            className="flex-1 border border-gray-300 dark:border-gray-600 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
        </div>

        {onDelete && currentAvatar && currentAvatar !== '/logo.png' && !currentAvatar.startsWith('data:image') && (
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="w-full border border-red-300 dark:border-red-700 text-red-600 dark:text-red-300 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleteLoading ? 'Removing...' : 'Remove Photo'}
          </button>
        )}
      </div>
    </Modal>
  );
};

// Edit Profile Modal
const EditProfileModal = ({ isOpen, onClose, userData, onSave, loading }: any) => {
  const [formData, setFormData] = useState<EditProfileFormData>({
    fullName: userData.fullName || '',
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    phoneNumber: userData.phoneNumber || '',
    email: userData.email || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      setError('Phone number must be 10 digits');
      return;
    }

    await onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
              className="relative w-full max-w-lg pointer-events-auto"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 dark:from-gray-800 dark:to-gray-700 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Edit3 className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center group"
                    >
                      <X className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" />
                    </button>
                  </div>
                  <p className="text-green-100 dark:text-gray-300 text-sm mt-2 ml-13">
                    Update your personal information
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-300" />
                      <p className="text-green-700 dark:text-green-300 text-sm">{success}</p>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-green-600 transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50/50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Enter your full name"
                        required
                        minLength={2}
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-green-600 transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50/50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="First name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-green-600 transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50/50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-green-600 transition-colors">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="98XXXXXXXX"
                        pattern="\d{10}"
                        maxLength={10}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50/50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">Enter 10-digit phone number</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-green-600 transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50/50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-300" />
                      <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white font-semibold py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Change Password Modal
const ChangePasswordModal = ({ isOpen, onClose, onChangePassword, loading }: any) => {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    await onChangePassword(formData);
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum 6 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            required
          />
        </div>
        {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 dark:bg-green-500 text-white py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </Modal>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [userData, setUserData] = useState<UserProfileData>(defaultUserData);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleStatuses, setVehicleStatuses] = useState<VehicleBookingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const getAccessToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }, []);

  const fetchUserProfile = useCallback(async (showLoader = true) => {
    const token = getAccessToken();
    if (!token) return;

    if (showLoader) setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push('/signin');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await readApiResponse(response);
      if (data && typeof data === "object") {
        setUserData({
          ...data,
          avatarUrl: normalizeAvatarUrl(data.avatarUrl),
        });
      }
      setAvatarError(false);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setToast({ message: 'Failed to load profile', type: 'error' });
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [getAccessToken, router]);

  const fetchUserVehicles = useCallback(async () => {
    const token = getAccessToken();
    if (!token || userData.ownerKycStatus !== 'VERIFIED') {
      setVehicles([]);
      return;
    }

    setVehiclesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles/owner/my-vehicles`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push('/signin');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch vehicles');

      const data = await response.json();
      const vehiclesArray = Array.isArray(data) ? data : data?.data || data?.vehicles || [];
      setVehicles(vehiclesArray);
    } catch (err: any) {
      console.error('Error fetching vehicles:', err);
      setVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  }, [getAccessToken, router, userData.ownerKycStatus]);

  const fetchVehicleBookingStatus = useCallback(async () => {
    const token = getAccessToken();
    if (!token || userData.ownerKycStatus !== 'VERIFIED') {
      setVehicleStatuses([]);
      return;
    }

    setStatusLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/owner/vehicles/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push('/signin');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch vehicle status');

      const data = await response.json();
      setVehicleStatuses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching vehicle status:', err);
      setVehicleStatuses([]);
    } finally {
      setStatusLoading(false);
    }
  }, [getAccessToken, router, userData.ownerKycStatus]);

  const handleUpdateProfile = async (formData: EditProfileFormData) => {
    const token = getAccessToken();
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      const data = await readApiResponse(response);

      if (response.ok && data.success) {
        setToast({ message: data.message || 'Profile updated successfully!', type: 'success' });
        setEditModalOpen(false);
        await fetchUserProfile(false);
      } else {
        setToast({ message: data.message || 'Failed to update profile', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (formData: ChangePasswordFormData) => {
    const token = getAccessToken();
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      const data = await readApiResponse(response);

      if (response.ok && data.success) {
        setToast({ message: 'Password changed successfully! Please login again.', type: 'success' });
        setPasswordModalOpen(false);
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          router.push('/signin');
        }, 2000);
      } else {
        setToast({ message: data.message || 'Failed to change password', type: 'error' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setToast({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const token = getAccessToken();
    if (!token) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('avatar', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/upload-avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await readApiResponse(response);

      if (response.ok && (data?.success !== false)) {
        const newAvatarUrl = data?.avatarUrl || data?.data?.avatarUrl || data?.data?.url || data?.url;
        if (newAvatarUrl) {
          const normalized = normalizeAvatarUrl(newAvatarUrl);
          setUserData(prev => ({ ...prev, avatarUrl: normalized }));
          const storedUser = localStorage.getItem('user');
          const parsedUser = storedUser ? JSON.parse(storedUser) : {};
          localStorage.setItem('user', JSON.stringify({ ...parsedUser, avatarUrl: normalized }));
          window.dispatchEvent(new Event('profile-updated'));
          setAvatarError(false);
        }
        setToast({ message: 'Profile picture updated successfully!', type: 'success' });
        setAvatarModalOpen(false);
        await fetchUserProfile(false);
      } else {
        setToast({ message: data?.message || 'Failed to update profile picture', type: 'error' });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setToast({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/avatar`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await readApiResponse(response);

      if (response.ok && (data?.success !== false)) {
        setUserData(prev => ({ ...prev, avatarUrl: '/logo.png' }));
        const storedUser = localStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : {};
        localStorage.setItem('user', JSON.stringify({ ...parsedUser, avatarUrl: '/logo.png' }));
        window.dispatchEvent(new Event('profile-updated'));
        setToast({ message: 'Profile picture removed successfully!', type: 'success' });
        setAvatarModalOpen(false);
        await fetchUserProfile(false);
      } else {
        setToast({ message: data?.message || 'Failed to remove profile picture', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting avatar:', error);
      setToast({ message: 'Network error. Please try again.', type: 'error' });
    }
  };

  const openVehicleDetail = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailModalOpen(true);
  };

  const closeVehicleDetail = () => {
    setDetailModalOpen(false);
    setSelectedVehicle(null);
  };

  const getAvatarSrc = () => {
    if (avatarError) return "/logo.png";
    if (!userData.avatarUrl) return "/logo.png";
    return userData.avatarUrl;
  };

  const getKYCStatusText = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'Verified ✅';
      case 'SUBMITTED': return 'Pending Review ⏳';
      case 'REJECTED': return 'Rejected ❌';
      default: return 'Not Submitted 📋';
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "rides", label: "Ride History" },
    { key: "vehicles", label: "My Vehicles" },
  ];

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/signin');
      return;
    }
    queueMicrotask(() => { void fetchUserProfile(); });
  }, [getAccessToken, router, fetchUserProfile]);

  useEffect(() => {
    if (activeTab === 'vehicles') {
      void fetchUserVehicles();
      void fetchVehicleBookingStatus();
    }
  }, [activeTab, fetchUserVehicles, fetchVehicleBookingStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <HomeHeader />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <AvatarUploadModal
        key={avatarModalOpen ? "avatar-open" : "avatar-closed"}
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onUpload={handleAvatarUpload}
        onDelete={handleAvatarDelete}
        loading={uploading}
        currentAvatar={getAvatarSrc()}
      />

      <EditProfileModal
        key={`${userData.id}-${userData.email}-${userData.fullName}`}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userData={userData}
        onSave={handleUpdateProfile}
        loading={saving}
      />

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onChangePassword={handleChangePassword}
        loading={saving}
      />

      <VehicleDetailModal
        isOpen={detailModalOpen}
        onClose={closeVehicleDetail}
        vehicle={selectedVehicle}
        onRent={(vehicle) => {
          alert(`Renting ${vehicle.brand} ${vehicle.model}`);
          closeVehicleDetail();
        }}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-green-950 via-green-900 to-green-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 pb-28 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="flex items-center gap-8 flex-wrap">
              <div className="relative">
                <div className="w-28 h-28 rounded-full border-4 border-green-400/40 dark:border-green-500/30 p-1 bg-white/10 dark:bg-white/5 backdrop-blur-sm">
                  <img
                    src={getAvatarSrc()}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                    onError={() => setAvatarError(true)}
                    onLoad={() => setAvatarError(false)}
                  />
                </div>
                <button
                  onClick={() => setAvatarModalOpen(true)}
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-green-500 dark:bg-green-400 border-3 border-green-950 dark:border-gray-900 flex items-center justify-center cursor-pointer text-white hover:scale-105 transition-transform"
                >
                  <Camera size={14} />
                </button>
              </div>

              <div>
                <h1 className="text-white text-2xl font-extrabold tracking-tight">
                  {userData.fullName || userData.username}
                </h1>
                <p className="text-green-300 dark:text-green-400 text-sm mb-2">
                  {userData.canBook ? "✅ Can Book Vehicles" : "❌ Cannot Book Vehicles"} |
                  {userData.canList ? "✅ Can List Vehicles" : "❌ Cannot List Vehicles"}
                </p>
                <div className="flex gap-4 flex-wrap">
                  <span className="text-green-200 dark:text-gray-300 text-sm flex items-center gap-1.5">
                    <User size={13} /> {userData.role}
                  </span>
                  <span className="text-green-200 dark:text-gray-300 text-sm flex items-center gap-1.5">
                    <Calendar size={13} /> Member since {new Date(userData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setEditModalOpen(true)}
                className="ml-auto px-5 py-2.5 rounded-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-white text-sm font-semibold hover:bg-white/20 dark:hover:bg-white/10 transition-all hover:-translate-y-0.5 flex items-center gap-2 backdrop-blur-sm"
              >
                <Edit3 size={15} /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-6 -mt-12 pb-16 relative z-20">
          {/* KYC Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Shield size={22} className="text-green-600 dark:text-green-400" />
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">Renter KYC</h3>
              </div>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{getKYCStatusText(userData.renterKycStatus)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {userData.renterKycStatus === 'VERIFIED' ? 'You can book vehicles' : 'Complete KYC to book vehicles'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Car size={22} className="text-green-600 dark:text-green-400" />
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">Owner KYC</h3>
              </div>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{getKYCStatusText(userData.ownerKycStatus)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {userData.ownerKycStatus === 'VERIFIED' ? 'You can list vehicles' : 'Complete KYC to list vehicles'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-1.5 border border-gray-100 dark:border-gray-800 mb-8 flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key
                  ? 'bg-green-600 dark:bg-green-500 text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {activeTab === "overview" && <OverviewTab userData={userData} />}
            {activeTab === "rides" && <RidesTab />}
            {activeTab === "vehicles" && (
              <MyVehiclesTab
                vehicles={vehicles}
                loading={vehiclesLoading}
                onViewDetails={openVehicleDetail}
                userData={userData}
                vehicleStatuses={vehicleStatuses}
                statusLoading={statusLoading}
              />
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}