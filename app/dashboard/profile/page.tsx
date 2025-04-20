'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { getUserFromLocalStorage, updateUserInLocalStorage } from '@/lib/localStorage';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('personal');
  
  // User profile form
  const [profile, setProfile] = useState({
    id: '',
    name: '',
    username: '',
    email: ''
  });
  
  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Form errors
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  
  // Load user data
  useEffect(() => {
    const userData = getUserFromLocalStorage();
    if (!userData || !userData.id || !userData.token) {
      router.push('/auth/login');
    } else {
      setUser(userData);
      setProfile({
        id: userData.id || '',
        name: userData.name || '',
        username: userData.username || '',
        email: userData.email || ''
      });
    }
  }, [router]);
  
  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Record<string, string> = {};
    if (!profile.name.trim()) errors.name = 'Name is required';
    if (!profile.email.trim()) errors.email = 'Email is required';
    
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }
    
    try {
      setIsLoading(true);
      setProfileErrors({});

      // Get token from localStorage
      const userData = getUserFromLocalStorage();
      if (!userData || !userData.token || !userData.id) {
        throw new Error('Authentication information missing. Please log in again.');
      }
      
      console.log('Updating profile for user ID:', userData.id);
      
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          id: userData.id,  // Explicitly include user ID
          name: profile.name,
          email: profile.email
          // Username is not included - it should be read-only
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Profile update failed:', data);
        throw new Error(data.message || 'Failed to update profile');
      }

      console.log('Profile update successful:', data);
      
      // Update user in localStorage
      if (userData) {
        const updatedUser = {
          ...userData,
          name: profile.name,
          email: profile.email
        };
        updateUserInLocalStorage(updatedUser);
        setUser(updatedUser);
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Record<string, string> = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) errors.newPassword = 'New password is required';
    if (passwordData.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    try {
      setPasswordLoading(true);
      setPasswordErrors({});
      
      // Get token from localStorage
      const userData = getUserFromLocalStorage();
      if (!userData || !userData.token || !userData.id) {
        throw new Error('Authentication information missing. Please log in again.');
      }
      
      console.log('Changing password for user ID:', userData.id);
      
      const response = await fetch('/api/user/update-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          id: userData.id,  // Explicitly include user ID
          email: userData.email, // Include email for backup identification
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Password update failed:', data);
        throw new Error(data.error || 'Failed to update password');
      }

      console.log('Password update successful');
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  // If no user data yet, show loading
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Profile Header */}
      <div className="relative w-full h-48 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg mb-12 overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex items-end">
          <div className="flex items-center space-x-5">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-white text-3xl font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-blue-100">@{user?.username}</p>
              <p className="text-blue-100 text-sm">{user?.role}</p>
            </div>
          </div>
          
          <div className="ml-auto">
            {/* Could add more actions here, like export profile data */}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('personal')}
          className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'personal'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Personal Information
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Security & Password
        </button>
      </div>

      {/* Profile Information */}
      {activeTab === 'personal' && (
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 transition-all duration-300 transform animate-fadeIn">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs uppercase text-blue-500 font-semibold mb-1">User ID</p>
              <p className="text-sm font-mono break-all">{user?.id}</p>
              <p className="text-xs text-gray-500 mt-1">This is your unique identifier and cannot be changed.</p>
            </div> */}
            
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs uppercase text-blue-500 font-semibold mb-1">Username</p>
              <p className="text-sm font-medium">@{user?.username}</p>
              <p className="text-xs text-gray-500 mt-1">Your unique username cannot be changed.</p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs uppercase text-blue-500 font-semibold mb-1">Account Type</p>
              <p className="text-sm font-medium">{user?.role === 'admin' ? 'Administrator' : 'Standard User'}</p>
            </div>
          </div>
          
          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  icon="user"
                  placeholder="Your full name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  error={profileErrors.name}
                />
              </div>
            </div>
            
            <div>
              <Input
                label="Email Address"
                type="email"
                name="email"
                icon="envelope"
                placeholder="Your email address"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                error={profileErrors.email}
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto py-2.5 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Profile...
                  </span>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Change Password */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 transition-all duration-300 transform animate-fadeIn">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Security & Password
          </h2>
          
          <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Password Security Tips</h3>
                <div className="mt-1 text-xs text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Use at least 8 characters</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>Add numbers and special characters</li>
                    <li>Don't reuse passwords from other sites</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                icon="lock"
                placeholder="Your current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                error={passwordErrors.currentPassword}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="New Password"
                  type="password"
                  name="newPassword"
                  icon="key"
                  placeholder="Your new password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  error={passwordErrors.newPassword}
                />
              </div>
              
              <div>
                <Input
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  icon="key"
                  placeholder="Confirm your new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  error={passwordErrors.confirmPassword}
                />
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto py-2.5 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Password...
                  </span>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 