import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  UserIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface ProfileFormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface StoreSettingsData {
  storeName: string;
  storeDescription: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  timezone: string;
}

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    watch: watchProfile
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  const {
    register: registerStore,
    handleSubmit: handleSubmitStore,
    formState: { errors: storeErrors }
  } = useForm<StoreSettingsData>({
    defaultValues: {
      storeName: 'ShopEase',
      storeDescription: 'Your one-stop e-commerce solution',
      storeEmail: 'support@shopease.com',
      storePhone: '+91 98765 43210',
      storeAddress: '123 Business Street, Mumbai, Maharashtra 400001',
      currency: 'INR',
      timezone: 'Asia/Kolkata'
    }
  });

  const newPassword = watchProfile('newPassword');

  const handleProfileUpdate = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      // In a real app, you'd call an API to update profile
      console.log('Update profile:', data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreSettingsUpdate = async (data: StoreSettingsData) => {
    try {
      setIsLoading(true);
      // In a real app, you'd call an API to update store settings
      console.log('Update store settings:', data);
      toast.success('Store settings updated successfully');
    } catch (error) {
      toast.error('Failed to update store settings');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'store', name: 'Store Settings', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and store preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow-md rounded-lg">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
                <form onSubmit={handleSubmitProfile(handleProfileUpdate)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      {...registerProfile('name', { required: 'Name is required' })}
                      error={profileErrors.name?.message}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      {...registerProfile('email', { required: 'Email is required' })}
                      error={profileErrors.email?.message}
                    />
                  </div>

                  <hr className="my-6" />

                  <h3 className="text-md font-semibold text-gray-900 mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      label="Current Password"
                      type="password"
                      {...registerProfile('currentPassword')}
                      error={profileErrors.currentPassword?.message}
                    />
                    <Input
                      label="New Password"
                      type="password"
                      {...registerProfile('newPassword', {
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      error={profileErrors.newPassword?.message}
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      {...registerProfile('confirmPassword', {
                        validate: (value) => value === newPassword || 'Passwords do not match'
                      })}
                      error={profileErrors.confirmPassword?.message}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isLoading}>
                      Update Profile
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Store Settings Tab */}
            {activeTab === 'store' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Store Settings</h2>
                <form onSubmit={handleSubmitStore(handleStoreSettingsUpdate)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Store Name"
                      {...registerStore('storeName', { required: 'Store name is required' })}
                      error={storeErrors.storeName?.message}
                    />
                    <Input
                      label="Store Email"
                      type="email"
                      {...registerStore('storeEmail', { required: 'Store email is required' })}
                      error={storeErrors.storeEmail?.message}
                    />
                  </div>

                  <Input
                    label="Store Description"
                    {...registerStore('storeDescription')}
                    error={storeErrors.storeDescription?.message}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Store Phone"
                      {...registerStore('storePhone')}
                      error={storeErrors.storePhone?.message}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        {...registerStore('currency')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Store Address"
                    {...registerStore('storeAddress')}
                    error={storeErrors.storeAddress?.message}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      {...registerStore('timezone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isLoading}>
                      Update Store Settings
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive email alerts for new orders</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Low Stock Alerts</p>
                        <p className="text-sm text-gray-500">Get notified when products are running low</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Marketing Updates</p>
                        <p className="text-sm text-gray-500">Receive updates about new features</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button>Save Preferences</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Account Security</p>
                        <p className="text-sm text-green-700">Your account is secure with strong password protection</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Login Sessions</p>
                        <p className="text-sm text-gray-500">Manage your active login sessions</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Sessions
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">API Keys</p>
                        <p className="text-sm text-gray-500">Manage API keys for integrations</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage Keys
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;