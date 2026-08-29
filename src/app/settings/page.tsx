// app/settings/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import HomeHeader from "../home/HomeHeader";
import Footer from "../component/Footer";
import { useTheme } from "../component/ThemeProvider";
import {
  User, Mail, Phone, Shield, CreditCard, Bell, Lock,
  X, Loader2, CheckCircle, AlertCircle, Eye, EyeOff,
  Fingerprint, Globe, Moon, Sun,
  Monitor, AlertTriangle,
  Key, Save, ChevronRight,
  Sparkles, Palette, Edit3
} from "lucide-react";

// Types
interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  rideUpdates: boolean;
  paymentAlerts: boolean;
  promotionAlerts: boolean;
  rideReminders: boolean;
  vehicleUpdates: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts';
  showEmail: boolean;
  showPhone: boolean;
  showRideHistory: boolean;
  allowMessages: boolean;
  dataSharing: boolean;
  showActivity: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  compactView: boolean;
  animations: boolean;
  reduceMotion: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  deviceManagement: boolean;
  sessionTimeout: number;
  rememberMe: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'googlePay' | 'applePay';
  last4?: string;
  expiry?: string;
  isDefault: boolean;
}

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string;
  role: string;
}

const API_BASE_URL = "http://localhost:8080";

// ========== MODAL COMPONENTS ==========
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl pointer-events-auto overflow-hidden border border-gray-100 dark:border-gray-800">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-gray-800 dark:to-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center group"
                  >
                    <X className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" />
                  </button>
                </div>
              </div>
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

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
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50/50 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-800"
              required
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50/50 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-800"
              required
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50/50 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-800"
              required
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white font-semibold py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </Modal>
  );
};

const EditProfileModal = ({ isOpen, onClose, onSave, profile, loading }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { fullName: string; phoneNumber: string }) => Promise<void>;
  profile: UserProfile | null;
  loading: boolean;
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhoneNumber(profile.phoneNumber || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    await onSave({ fullName, phoneNumber });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50/50 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-800"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50/50 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-800"
            placeholder="+977 98XXXXXXXX"
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white font-semibold py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </Modal>
  );
};

const SuccessModal = ({ isOpen, onClose, title, message, onConfirm }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm?: () => void;
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl pointer-events-auto overflow-hidden border border-gray-100 dark:border-gray-800">
              <div className="p-6 text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={handleConfirm}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white font-semibold py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 transition-all shadow-lg shadow-green-500/25"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const AddPaymentModal = ({ isOpen, onClose, onAdd, loading }: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => Promise<void>;
  loading: boolean;
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({ cardNumber, expiry, cvv, name });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Payment Method">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
          <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-800" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
            <input type="text" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-800" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">CVV</label>
            <input type="password" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" maxLength={4} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-800" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cardholder Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-800" required />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white font-semibold py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          {loading ? 'Adding...' : 'Add Card'}
        </button>
      </form>
    </Modal>
  );
};

// ========== UI COMPONENTS ==========
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl ${type === 'success' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' : 'bg-gradient-to-r from-red-600 to-rose-600 text-white'}`}
    >
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
    </motion.div>
  );
};

const ToggleSwitch = ({ enabled, onChange, label, description }: { enabled: boolean; onChange: () => void; label: string; description?: string }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
    <div className="flex-1">
      <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
    </div>
    <button onClick={onChange} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${enabled ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-md' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

// ========== SETTINGS SECTIONS ==========
const sections = [
  { id: 'account', label: 'Account Settings', icon: User, color: 'blue' },
  { id: 'security', label: 'Security', icon: Lock, color: 'purple' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'orange' },
  { id: 'privacy', label: 'Privacy', icon: Shield, color: 'teal' },
  { id: 'payments', label: 'Payments', icon: CreditCard, color: 'green' },
  { id: 'appearance', label: 'Appearance', icon: Palette, color: 'pink' },
  { id: 'preferences', label: 'Preferences', icon: Globe, color: 'indigo' },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, color: 'red' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState({ title: '', message: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Settings states
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true, pushNotifications: true, smsNotifications: false,
    marketingEmails: false, rideUpdates: true, paymentAlerts: true,
    promotionAlerts: false, rideReminders: true, vehicleUpdates: true
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public', showEmail: false, showPhone: false,
    showRideHistory: true, allowMessages: true, dataSharing: false, showActivity: true
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'system', fontSize: 'medium', compactView: false, animations: true, reduceMotion: false
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false, loginAlerts: true, deviceManagement: true, sessionTimeout: 30, rememberMe: true
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', last4: '4242', expiry: '12/25', isDefault: true },
    { id: '2', type: 'card', last4: '8888', expiry: '08/26', isDefault: false }
  ]);

  const getAccessToken = useCallback(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('accessToken');
    return null;
  }, []);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [getAccessToken]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setPasswordModalOpen(false);
        // Show success modal first
        setSuccessModalData({
          title: 'Password Changed Successfully!',
          message: 'Your password has been updated. You will be redirected to sign in.'
        });
        setSuccessModalOpen(true);
      } else {
        const errorData = await response.json();
        setToast({ message: errorData.message || 'Failed to change password', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Network error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalConfirm = () => {
    setSuccessModalOpen(false);
    // Clear tokens and redirect to sign in
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/signin');
  };

  const handleUpdateProfile = async (data: { fullName: string; phoneNumber: string }) => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setToast({ message: 'Profile updated successfully!', type: 'success' });
        setEditProfileModalOpen(false);
        fetchProfile();
      } else {
        const errorData = await response.json();
        setToast({ message: errorData.message || 'Failed to update profile', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Network error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (data: any) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPaymentMethods([...paymentMethods, { id: Date.now().toString(), type: 'card', last4: data.cardNumber.slice(-4), expiry: data.expiry, isDefault: false }]);
    setToast({ message: 'Payment method added successfully!', type: 'success' });
    setPaymentModalOpen(false);
    setLoading(false);
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(m => m.id !== id));
    setToast({ message: 'Payment method removed', type: 'success' });
  };

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(m => ({ ...m, isDefault: m.id === id })));
    setToast({ message: 'Default payment method updated', type: 'success' });
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/signin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <HomeHeader />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title={successModalData.title}
        message={successModalData.message}
        onConfirm={handleSuccessModalConfirm}
      />

      <ChangePasswordModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} onChangePassword={handleChangePassword} loading={loading} />
      <EditProfileModal isOpen={editProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} onSave={handleUpdateProfile} profile={profile} loading={loading} />
      <AddPaymentModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} onAdd={handleAddPaymentMethod} loading={loading} />

      <main className="flex-1 max-w-screen-xl mx-auto px-4 py-8 sm:px-6 lg:px-12 w-full">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 rounded-full"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1 ml-4">Manage your account preferences and settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">Settings Menu</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Customize your experience</p>
              </div>
              <div className="p-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 mb-1 ${activeSection === section.id ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 text-green-700 dark:text-green-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg transition-all ${activeSection === section.id ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <section.icon className={`w-4 h-4 ${activeSection === section.id ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`} />
                      </div>
                      <span className="text-sm font-medium">{section.label}</span>
                    </div>
                    {activeSection === section.id && <ChevronRight className="w-4 h-4 text-green-600 dark:text-green-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeSection === 'account' && (
                <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Account Settings</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal account information</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Name Section */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">Full Name</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.fullName || 'Not provided'}</p>
                        </div>
                      </div>
                      <button onClick={() => setEditProfileModalOpen(true)} className="text-green-600 dark:text-green-400 text-sm font-semibold hover:underline">Edit</button>
                    </div>

                    {/* Change Password */}
                    <button
                      onClick={() => setPasswordModalOpen(true)}
                      className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                          <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">Change Password</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Update your password regularly</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition" />
                    </button>

                    {/* Email Address - Read Only */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                          <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">Email Address</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email || 'user@example.com'}</p>
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">Verified</span>
                    </div>

                    {/* Phone Number */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                          <Phone className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">Phone Number</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.phoneNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Security Settings</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Protect your account with advanced security</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center"><Fingerprint className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div>
                        <div><p className="font-semibold text-gray-900 dark:text-gray-100">Two-Factor Authentication</p><p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p></div>
                      </div>
                      <button onClick={() => setSecuritySettings({ ...securitySettings, twoFactorAuth: !securitySettings.twoFactorAuth })} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all ${securitySettings.twoFactorAuth ? 'bg-green-600 dark:bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all ${securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <ToggleSwitch enabled={securitySettings.loginAlerts} onChange={() => setSecuritySettings({ ...securitySettings, loginAlerts: !securitySettings.loginAlerts })} label="Login Alerts" description="Get notified when someone logs into your account" />
                  </div>
                </motion.div>
              )}

              {activeSection === 'notifications' && (
                <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notification Preferences</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose how you want to be notified</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <ToggleSwitch key={key} enabled={value} onChange={() => setNotificationSettings({ ...notificationSettings, [key]: !value })} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} />
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === 'privacy' && (
                <motion.div key="privacy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Privacy Controls</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your privacy preferences</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Profile Visibility</label>
                      <select value={privacySettings.profileVisibility} onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value as any })} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                        <option value="public">🌍 Public - Everyone can see your profile</option>
                        <option value="contacts">👥 Contacts Only - Only your contacts</option>
                        <option value="private">🔒 Private - Only you</option>
                      </select>
                    </div>
                    {Object.entries(privacySettings).map(([key, value]) => {
                      if (key === 'profileVisibility') return null;
                      return <ToggleSwitch key={key} enabled={value as boolean} onChange={() => setPrivacySettings({ ...privacySettings, [key]: !value })} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} />;
                    })}
                  </div>
                </motion.div>
              )}

              {activeSection === 'payments' && (
                <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div><h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Payment Methods</h2><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your payment options</p></div>
                      <button onClick={() => setPaymentModalOpen(true)} className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-all flex items-center gap-2 shadow-md">Add New</button>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl flex items-center justify-center"><CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" /></div>
                          <div><p className="font-semibold text-gray-900 dark:text-gray-100">•••• •••• •••• {method.last4}</p><p className="text-sm text-gray-500 dark:text-gray-400">Expires {method.expiry}</p></div>
                          {method.isDefault && <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">Default</span>}
                        </div>
                        {!method.isDefault && <div className="flex gap-2"><button onClick={() => handleSetDefaultPayment(method.id)} className="text-green-600 dark:text-green-400 text-sm font-semibold">Set Default</button><button onClick={() => handleDeletePaymentMethod(method.id)} className="text-red-600 dark:text-red-400 text-sm font-semibold">Remove</button></div>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === 'appearance' && (
                <motion.div key="appearance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Appearance</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize how the app looks</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[{ value: 'light', label: 'Light', icon: Sun }, { value: 'dark', label: 'Dark', icon: Moon }, { value: 'system', label: 'System', icon: Monitor }].map((opt) => (
                          <button key={opt.value} onClick={() => setTheme(opt.value as 'light' | 'dark' | 'system')} className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${theme === opt.value ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                            <opt.icon className={`w-6 h-6 ${theme === opt.value ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className={`text-sm font-medium ${theme === opt.value ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-300'}`}>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <ToggleSwitch enabled={appearanceSettings.compactView} onChange={() => setAppearanceSettings({ ...appearanceSettings, compactView: !appearanceSettings.compactView })} label="Compact View" description="Show more content by reducing spacing" />
                  </div>
                </motion.div>
              )}

              {activeSection === 'preferences' && (
                <motion.div key="preferences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Preferences</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize your app experience</p>
                  </div>
                  <div className="p-6 text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Coming Soon!</h3>
                    <p className="text-gray-500 dark:text-gray-400">Additional preferences will be available in future updates</p>
                  </div>
                </motion.div>
              )}

              {activeSection === 'danger' && (
                <motion.div key="danger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-red-100 dark:border-red-900/30 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 px-6 py-5 border-b border-red-100 dark:border-red-900/30">
                    <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Danger Zone</h2>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">Irreversible actions - proceed with caution</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                      <div><p className="font-semibold text-red-900 dark:text-red-300">Delete Account</p><p className="text-sm text-red-700 dark:text-red-400">Permanently delete your account and all data</p></div>
                      <button onClick={() => { if (confirm('⚠️ Are you absolutely sure? This action cannot be undone!')) handleLogout(); }} className="px-5 py-2 bg-red-600 dark:bg-red-500 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-600 transition-all flex items-center gap-2 shadow-md">Delete Account</button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                      <div><p className="font-semibold text-orange-900 dark:text-orange-300">Export Data</p><p className="text-sm text-orange-700 dark:text-orange-400">Download all your personal data</p></div>
                      <button className="px-5 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-xl hover:bg-orange-700 dark:hover:bg-orange-600 transition-all flex items-center gap-2 shadow-md">Export</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Fixed Save Button */}
        <button onClick={() => setToast({ message: 'All settings saved successfully!', type: 'success' })} className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl fixed bottom-6 right-6 z-50">
          <Save className="w-4 h-4" /> Save All Changes
        </button>
      </main>
      <Footer />
    </div>
  );
}