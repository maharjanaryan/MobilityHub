// app/profile/page.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import HomeHeader from "../home/HomeHeader";
import Footer from "../component/Footer";
import {
  User, Mail, Phone, MapPin, Calendar, Car,
  Clock, Star, ChevronRight, Edit3, Camera, Shield,
  CreditCard, Bell, Lock, Award, TrendingUp, X,
  Loader2, CheckCircle, AlertCircle, Save, Trash2
} from "lucide-react";

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

const rideHistory = [
  { id: 1, vehicle: "Lucid Air Touring", date: "May 14, 2026", duration: "2h 30m", distance: "85 km", cost: "Rs 1,200", status: "Completed", rating: 5 },
  { id: 2, vehicle: "Hyundai IONIQ 5", date: "May 10, 2026", duration: "1h 15m", distance: "42 km", cost: "Rs 650", status: "Completed", rating: 4 },
  { id: 3, vehicle: "BMW i4 eDrive40", date: "May 6, 2026", duration: "3h 00m", distance: "120 km", cost: "Rs 1,800", status: "Completed", rating: 5 },
];

const achievements = [
  { title: "Green Pioneer", desc: "Complete 100+ rides", progress: 100, icon: "🌿" },
  { title: "Eco Warrior", desc: "Save 1 ton of CO₂", progress: 100, icon: "🏆" },
  { title: "Road Master", desc: "Travel 5,000 km", progress: 65, icon: "🛣️" },
  { title: "Star Rider", desc: "Maintain 4.8+ rating", progress: 100, icon: "⭐" },
];

type TabKey = "overview" | "rides" | "achievements" | "settings";

const API_BASE_URL = "http://localhost:8080";

const normalizeAvatarUrl = (url?: string | null) => {
  if (!url) return "/logo.png";
  if (url.startsWith("http") || url.startsWith("data:image") || url.startsWith("/logo.png")) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

const readApiResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const extractAvatarUrl = (data: unknown) => {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (typeof data !== "object") return null;

  const response = data as Record<string, unknown>;
  const nested = response.data && typeof response.data === "object"
    ? response.data as Record<string, unknown>
    : null;

  if (typeof response.data === "string") return response.data;
  if (typeof response.avatarUrl === "string") return response.avatarUrl;
  if (typeof response.profilePictureUrl === "string") return response.profilePictureUrl;
  if (typeof response.url === "string") return response.url;
  if (typeof nested?.avatarUrl === "string") return nested.avatarUrl;
  if (typeof nested?.url === "string") return nested.url;

  return null;
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
            className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
const AvatarUploadModal = ({ isOpen, onClose, onUpload, onDelete, loading, currentAvatar }: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading: boolean;
  currentAvatar: string;
}) => {
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
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleRemove();
    onClose();
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Profile Picture">
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={preview || currentAvatar || "/logo.png"}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.png";
              }}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Choose Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="w-full border rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">Max file size: 5MB. Supported formats: JPG, PNG, GIF, WEBP</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {loading ? 'Uploading...' : 'Upload Photo'}
          </button>
          <button
            onClick={handleClose}
            className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        {onDelete && currentAvatar && currentAvatar !== '/logo.png' && !currentAvatar.startsWith('data:image') && (
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="w-full border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 mt-2"
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
const EditProfileModal = ({ isOpen, onClose, userData, onSave, loading }: {
  isOpen: boolean;
  onClose: () => void;
  userData: UserProfileData;
  onSave: (data: EditProfileFormData) => Promise<void>;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState<EditProfileFormData>({
    fullName: userData.fullName || '',
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    phoneNumber: userData.phoneNumber || '',
    email: userData.email || ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      setError('Phone number must be 10 digits');
      return;
    }

    await onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            required
            minLength={2}
            maxLength={100}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="10-digit phone number"
            pattern="\d{10}"
            maxLength={10}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </Modal>
  );
};

// Change Password Modal
const ChangePasswordModal = ({ isOpen, onClose, onChangePassword, loading }: {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: (data: ChangePasswordFormData) => Promise<void>;
  loading: boolean;
}) => {
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </Modal>
  );
};

// Toast Notification Component
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

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [userData, setUserData] = useState<UserProfileData>(defaultUserData);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  const getAccessToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }, []);

  const fetchUserProfile = useCallback(async (showLoader = true) => {
    const token = getAccessToken();
    if (!token) return;

    if (showLoader) {
      setLoading(true);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
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
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [getAccessToken, router]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/signin');
      return;
    }
    queueMicrotask(() => {
      void fetchUserProfile();
    });
  }, [getAccessToken, router, fetchUserProfile]);

  const handleUpdateProfile = async (formData: EditProfileFormData) => {
    const token = getAccessToken();
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await readApiResponse(response);

      if (response.ok && (data?.success !== false)) {
        const newAvatarUrl = normalizeAvatarUrl(extractAvatarUrl(data));
        if (newAvatarUrl) {
          setUserData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
          const storedUser = localStorage.getItem('user');
          const parsedUser = storedUser ? JSON.parse(storedUser) : {};
          localStorage.setItem('user', JSON.stringify({ ...parsedUser, avatarUrl: newAvatarUrl }));
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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
    { key: "achievements", label: "Achievements" },
    { key: "settings", label: "Settings" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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

      <main className="flex-1 profile-page">
        <div style={{
          background: "linear-gradient(135deg, #052e16 0%, #14532d 40%, #166534 100%)",
          padding: "60px 0 100px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 110, height: 110, borderRadius: "50%",
                  border: "4px solid rgba(74,222,128,0.4)",
                  padding: 3, background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                }}>
                  <img
                    src={getAvatarSrc()}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                      transition: "opacity 0.25s ease, transform 0.25s ease",
                    }}
                    onError={() => setAvatarError(true)}
                    onLoad={() => setAvatarError(false)}
                  />
                </div>
                <button
                  onClick={() => setAvatarModalOpen(true)}
                  style={{
                    position: "absolute", bottom: 2, right: 2,
                    width: 32, height: 32, borderRadius: "50%",
                    background: "#16a34a", border: "3px solid #052e16",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#fff", transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <Camera size={14} />
                </button>
              </div>

              <div>
                <h1 style={{ color: "#fff", fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                  {userData.fullName || userData.username}
                </h1>
                <p style={{ color: "#86efac", fontSize: "0.9rem", margin: "0 0 8px" }}>
                  {userData.canBook ? "✅ Can Book Vehicles" : "❌ Cannot Book Vehicles"} |
                  {userData.canList ? "✅ Can List Vehicles" : "❌ Cannot List Vehicles"}
                </p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ color: "#a7f3d0", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 5 }}>
                    <User size={13} /> {userData.role}
                  </span>
                  <span style={{ color: "#a7f3d0", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 5 }}>
                    <Calendar size={13} /> Member since {new Date(userData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setEditModalOpen(true)}
                style={{
                  marginLeft: "auto",
                  padding: "10px 22px", borderRadius: 12,
                  background: "rgba(255,255,255,0.1)",
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  color: "#fff", fontSize: "0.85rem", fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                  backdropFilter: "blur(8px)", transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Edit3 size={15} /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "-50px auto 0", padding: "0 28px 60px", position: "relative", zIndex: 3 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1.5px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <Shield size={22} style={{ color: "#16a34a" }} />
                <h3 style={{ color: "#0d1117", fontWeight: 700, fontSize: "1rem", margin: 0 }}>Renter KYC</h3>
              </div>
              <p style={{ fontSize: "1.1rem", fontWeight: 600, margin: "8px 0" }}>{getKYCStatusText(userData.renterKycStatus)}</p>
              <p style={{ color: "#6b7280", fontSize: "0.75rem", margin: 0 }}>
                {userData.renterKycStatus === 'VERIFIED' ? 'You can book vehicles' : 'Complete KYC to book vehicles'}
              </p>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1.5px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <Car size={22} style={{ color: "#16a34a" }} />
                <h3 style={{ color: "#0d1117", fontWeight: 700, fontSize: "1rem", margin: 0 }}>Owner KYC</h3>
              </div>
              <p style={{ fontSize: "1.1rem", fontWeight: 600, margin: "8px 0" }}>{getKYCStatusText(userData.ownerKycStatus)}</p>
              <p style={{ color: "#6b7280", fontSize: "0.75rem", margin: 0 }}>
                {userData.ownerKycStatus === 'VERIFIED' ? 'You can list vehicles' : 'Complete KYC to list vehicles'}
              </p>
            </div>
          </div>

          <div style={{
            display: "flex", gap: 4, marginBottom: 28,
            background: "#fff", borderRadius: 14, padding: 5,
            border: "1.5px solid #f0f0f0",
          }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1, padding: "12px 20px", borderRadius: 10,
                  background: activeTab === tab.key ? "#16a34a" : "transparent",
                  color: activeTab === tab.key ? "#fff" : "#6b7280",
                  border: "none", cursor: "pointer",
                  fontSize: "0.875rem", fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {activeTab === "overview" && <OverviewTab userData={userData} />}
            {activeTab === "rides" && <RidesTab />}
            {activeTab === "achievements" && <AchievementsTab />}
            {activeTab === "settings" && <SettingsTab onOpenPasswordModal={() => setPasswordModalOpen(true)} />}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Overview Tab
function OverviewTab({ userData }: { userData: UserProfileData }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>Personal Information</h3>
        {[
          { icon: User, label: "Full Name", value: userData.fullName || userData.username },
          { icon: Mail, label: "Email", value: userData.email },
          { icon: Phone, label: "Phone", value: userData.phoneNumber || "Not provided" },
          { icon: MapPin, label: "Location", value: "Kathmandu, Nepal" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < 3 ? "1px solid #f3f4f6" : "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <item.icon size={17} style={{ color: "#16a34a" }} />
            </div>
            <div>
              <p style={{ color: "#9ca3af", fontSize: "0.72rem", fontWeight: 500, margin: 0 }}>{item.label}</p>
              <p style={{ color: "#0d1117", fontSize: "0.9rem", fontWeight: 600, margin: 0 }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>🌿 Your Eco Impact</h3>
        <div style={{ background: "linear-gradient(135deg, #052e16, #14532d)", borderRadius: 14, padding: 24, marginBottom: 16 }}>
          <p style={{ color: "#86efac", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: "0 0 8px" }}>LIFETIME CO₂ SAVED</p>
          <p style={{ color: "#fff", fontSize: "2.2rem", fontWeight: 800, margin: "0 0 4px" }}>1,247 kg</p>
          <p style={{ color: "#6ee7b7", fontSize: "0.8rem", margin: 0 }}>Equivalent to planting 62 trees 🌳</p>
        </div>
      </div>

      <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
        <h3 style={cardTitleStyle}>Recent Activity</h3>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
          {rideHistory.slice(0, 3).map((ride) => (
            <div key={ride.id} style={{ minWidth: 260, background: "#fafafa", borderRadius: 14, padding: "18px 20px", border: "1.5px solid #f0f0f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#16a34a", background: "#f0fdf4", padding: "3px 10px", borderRadius: 99 }}>{ride.status}</span>
                <span style={{ color: "#9ca3af", fontSize: "0.72rem" }}>{ride.date}</span>
              </div>
              <p style={{ color: "#0d1117", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 6px" }}>{ride.vehicle}</p>
              <div style={{ display: "flex", gap: 14, color: "#6b7280", fontSize: "0.78rem" }}>
                <span><Clock size={12} /> {ride.duration}</span>
                <span><TrendingUp size={12} /> {ride.distance}</span>
              </div>
              <p style={{ color: "#0d1117", fontWeight: 700, fontSize: "0.9rem", margin: "10px 0 0" }}>{ride.cost}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Rides Tab
function RidesTab() {
  return (
    <div style={cardStyle}>
      <h3 style={cardTitleStyle}>All Rides</h3>
      {rideHistory.map((ride, i) => (
        <div key={ride.id} style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 0", borderBottom: i < rideHistory.length - 1 ? "1px solid #f3f4f6" : "none" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Car size={22} style={{ color: "#16a34a" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#0d1117", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>{ride.vehicle}</p>
            <p style={{ color: "#9ca3af", fontSize: "0.78rem", margin: "3px 0 0" }}>{ride.date} • {ride.duration} • {ride.distance}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "#0d1117", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>{ride.cost}</p>
            <div style={{ display: "flex", gap: 3, justifyContent: "flex-end", marginTop: 3 }}>
              {Array.from({ length: ride.rating }).map((_, j) => (<Star key={j} size={12} style={{ color: "#f59e0b", fill: "#f59e0b" }} />))}
            </div>
          </div>
          <ChevronRight size={18} style={{ color: "#d1d5db" }} />
        </div>
      ))}
    </div>
  );
}

// Achievements Tab
function AchievementsTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {achievements.map((a, i) => (
        <motion.div key={a.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: a.progress === 100 ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", border: a.progress === 100 ? "2px solid #86efac" : "2px solid #e5e7eb" }}>{a.icon}</div>
            <div><p style={{ color: "#0d1117", fontWeight: 700, fontSize: "1rem", margin: 0 }}>{a.title}</p><p style={{ color: "#9ca3af", fontSize: "0.78rem", margin: "2px 0 0" }}>{a.desc}</p></div>
            {a.progress === 100 && <span style={{ marginLeft: "auto", background: "#f0fdf4", color: "#16a34a", fontSize: "0.7rem", fontWeight: 700, padding: "4px 12px", borderRadius: 99 }}>Unlocked ✓</span>}
          </div>
          <div style={{ background: "#f3f4f6", borderRadius: 99, height: 8, overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${a.progress}%` }} transition={{ duration: 1, delay: i * 0.15 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #16a34a, #86efac)" }} />
          </div>
          <p style={{ color: "#6b7280", fontSize: "0.72rem", textAlign: "right", margin: "6px 0 0" }}>{a.progress}%</p>
        </motion.div>
      ))}
    </div>
  );
}

// Settings Tab
function SettingsTab({ onOpenPasswordModal }: { onOpenPasswordModal: () => void }) {
  const router = useRouter();

  const settingsItems = [
    { label: "Change Password", desc: "Update your password", icon: Lock, onClick: onOpenPasswordModal },
    { label: "Payment Methods", desc: "Add or manage payment options", icon: CreditCard, path: "/profile/payments" },
    { label: "Notifications", desc: "Customize notification preferences", icon: Bell, path: "/profile/notifications" },
    { label: "Privacy Settings", desc: "Manage your privacy preferences", icon: Shield, path: "/profile/privacy" },
  ];

  return (
    <div style={cardStyle}>
      <h3 style={cardTitleStyle}>Settings</h3>
      {settingsItems.map((item, i) => (
        <div
          key={item.label}
          onClick={() => item.onClick ? item.onClick() : item.path && router.push(item.path)}
          style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 0", borderBottom: i < settingsItems.length - 1 ? "1px solid #f3f4f6" : "none", cursor: "pointer" }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}><item.icon size={20} style={{ color: "#16a34a" }} /></div>
          <div style={{ flex: 1 }}><p style={{ color: "#0d1117", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>{item.label}</p><p style={{ color: "#9ca3af", fontSize: "0.78rem", margin: "2px 0 0" }}>{item.desc}</p></div>
          <ChevronRight size={18} style={{ color: "#d1d5db" }} />
        </div>
      ))}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  padding: "26px 28px",
  border: "1.5px solid #f0f0f0",
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
};

const cardTitleStyle: React.CSSProperties = {
  color: "#0d1117",
  fontSize: "1.15rem",
  fontWeight: 800,
  margin: "0 0 20px",
  letterSpacing: "-0.01em",
};
