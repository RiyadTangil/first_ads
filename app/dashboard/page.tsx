'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { getUserFromLocalStorage, isUserAuthenticated } from '@/lib/localStorage';
import LogoutButton from '@/components/LogoutButton';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated based on localStorage
    if (!isUserAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    // Get user data from localStorage
    const userData = getUserFromLocalStorage();
    setUser(userData);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const userRole = user?.role || 'user';
  const isAdmin = userRole === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <LogoutButton />
        </div>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <p className="text-blue-800">
            Welcome, <span className="font-bold">{user?.name}</span>
          </p>
          <p className="text-blue-600 text-sm mt-1">
            Email: {user?.email} | Username: {user?.username} | Role: {userRole}
          </p>
        </div>

        {isAdmin ? (
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-6">
            <h2 className="text-lg font-semibold text-purple-800 mb-2">Admin Features</h2>
            <ul className="list-disc list-inside space-y-2 text-purple-700">
              <li>User Management</li>
              <li>Content Management</li>
              <li>System Settings</li>
              <li>Analytics Dashboard</li>
            </ul>
          </div>
        ) : null}

        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h2 className="text-lg font-semibold text-green-800 mb-2">User Features</h2>
          <ul className="list-disc list-inside space-y-2 text-green-700">
            <li>Profile Settings</li>
            <li>Notifications</li>
            <li>Messages</li>
            <li>Activity Log</li>
          </ul>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Authentication Method: LocalStorage</p>
          <p>Data is stored locally in your browser.</p>
        </div>
      </div>
    </div>
  );
} 