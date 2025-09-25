'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserFromLocalStorage, isUserAuthenticated } from '@/lib/localStorage';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBarIcon, UserGroupIcon, LinkIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

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
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Here's what's happening with your account today.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <LinkIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Links</p>
                <p className="text-2xl font-semibold text-gray-900">56</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Clicks</p>
                <p className="text-2xl font-semibold text-gray-900">12.5K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">$4,589</p>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Role-specific sections */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle>Admin Features</CardTitle>
              <CardDescription>Quick access to administrative tools</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  User Management
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Content Management
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  System Settings
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="block h-2 w-2 rounded-full bg-blue-600 mt-2"></span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">New user registration</p>
                    <p className="text-sm text-gray-500">2 minutes ago</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="block h-2 w-2 rounded-full bg-green-600 mt-2"></span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Link approval request</p>
                    <p className="text-sm text-gray-500">5 minutes ago</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="block h-2 w-2 rounded-full bg-yellow-600 mt-2"></span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">System update completed</p>
                    <p className="text-sm text-gray-500">1 hour ago</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 