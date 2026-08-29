// app/admin/settings/page.tsx
'use client';

import { useState } from 'react';
import {
  Settings,
  Globe,
  Mail,
  Shield,
  Bell,
  CreditCard,
  Database,
  Users,
  Car,
  DollarSign,
  Lock,
  Key,
  Smartphone,
  MapPin,
  Clock,
  Percent,
  Award,
  Star,
  MessageCircle,
  HelpCircle,
  FileText,
  Zap,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Upload,
  Trash2,
  Plus,
  X
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Mock settings data
  const generalSettings = {
    platformName: 'MobilityHub',
    platformEmail: 'admin@mobilityhub.com',
    platformPhone: '+977 98XXXXXXXX',
    timezone: 'Asia/Kathmandu',
    dateFormat: 'YYYY-MM-DD',
    currency: 'NPR',
    language: 'Nepali'
  };

  const commissionSettings = {
    platformCommission: 15,
    ownerCommission: 85,
    serviceFee: 5,
    cancellationFee: 25,
    minimumRentalDays: 1,
    maximumRentalDays: 30,
    earlyBookingDiscount: 10,
    longTermDiscount: 15
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1500);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'commission', label: 'Commission & Fees', icon: Percent },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Globe }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage platform configuration and preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
          <div className="flex p-2 space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Platform Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      defaultValue={generalSettings.platformName}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      defaultValue={generalSettings.platformEmail}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue={generalSettings.platformPhone}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      defaultValue={generalSettings.timezone}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Asia/Kathmandu">Asia/Kathmandu (Nepal Time)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (India Time)</option>
                      <option value="Asia/Dhaka">Asia/Dhaka (Bangladesh Time)</option>
                      <option value="Asia/Colombo">Asia/Colombo (Sri Lanka Time)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date Format
                    </label>
                    <select
                      defaultValue={generalSettings.dateFormat}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option>YYYY-MM-DD</option>
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      defaultValue={generalSettings.currency}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="NPR">NPR (Nepalese Rupee)</option>
                      <option value="INR">INR (Indian Rupee)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      defaultValue={generalSettings.language}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option>Nepali</option>
                      <option>English</option>
                      <option>Hindi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commission & Fees Settings */}
          {activeTab === 'commission' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Commission Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Platform Commission (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        defaultValue={commissionSettings.platformCommission}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 dark:text-gray-500">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Owner Commission (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        defaultValue={commissionSettings.ownerCommission}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 dark:text-gray-500">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service Fee (NPR)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        defaultValue={commissionSettings.serviceFee}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 dark:text-gray-500">NPR</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cancellation Fee (NPR)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        defaultValue={commissionSettings.cancellationFee}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 dark:text-gray-500">NPR</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Booking Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum Rental Days
                    </label>
                    <input
                      type="number"
                      defaultValue={commissionSettings.minimumRentalDays}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum Rental Days
                    </label>
                    <input
                      type="number"
                      defaultValue={commissionSettings.maximumRentalDays}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Early Booking Discount (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        defaultValue={commissionSettings.earlyBookingDiscount}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 dark:text-gray-500">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Long Term Discount (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        defaultValue={commissionSettings.longTermDiscount}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 dark:text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">Email Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive email notifications for important events</p>
                    </div>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className="text-emerald-600 dark:text-emerald-400"
                    >
                      {emailNotifications ? (
                        <ToggleRight className="w-8 h-8" />
                      ) : (
                        <ToggleLeft className="w-8 h-8" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">Push Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive browser push notifications</p>
                    </div>
                    <button
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className="text-emerald-600 dark:text-emerald-400"
                    >
                      {pushNotifications ? (
                        <ToggleRight className="w-8 h-8" />
                      ) : (
                        <ToggleLeft className="w-8 h-8" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Email Events</h3>
                <div className="space-y-3">
                  {[
                    'New User Registration',
                    'New Booking Created',
                    'Booking Cancelled',
                    'KYC Submission',
                    'Payment Received',
                    'Support Ticket Created'
                  ].map((event, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{event}</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-emerald-600 dark:text-emerald-400 rounded focus:ring-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Maintenance</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">Maintenance Mode</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Put the platform in maintenance mode</p>
                  </div>
                  <button
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className="text-emerald-600 dark:text-emerald-400"
                  >
                    {maintenanceMode ? (
                      <ToggleRight className="w-8 h-8" />
                    ) : (
                      <ToggleLeft className="w-8 h-8" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Settings */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Payment Gateways</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">eSewa</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Connected and active</p>
                    </div>
                    <button className="px-3 py-1 text-emerald-600 dark:text-emerald-400 border border-emerald-600 dark:border-emerald-400 rounded-lg text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                      Configure
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">Khalti</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Connected and active</p>
                    </div>
                    <button className="px-3 py-1 text-emerald-600 dark:text-emerald-400 border border-emerald-600 dark:border-emerald-400 rounded-lg text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                      Configure
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">ConnectIPS</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Not connected</p>
                    </div>
                    <button className="px-3 py-1 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors">
                      Connect
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">SMS Service</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SMS API Key
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your SMS API key"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Used for sending SMS notifications (e.g., Spond, Nepal Telecom)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Database</p>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Connected</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cache Server</p>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Connected</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email Service</p>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Warning</p>
            </div>
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Storage</p>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Healthy</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>
    </div>
  );
}