'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/login?callbackUrl=/admin');
    },
  });

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Additional check for admin role
  if (session?.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-800">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="secondary">User Dashboard</Button>
            </Link>
            <Link href="/api/auth/signout">
              <Button variant="secondary">Sign Out</Button>
            </Link>
          </div>
        </div>
        
        <div className="mb-6 p-4 bg-purple-50 rounded-md">
          <p className="text-purple-800">
            Welcome, <span className="font-bold">{session?.user?.name}</span> (Admin)
          </p>
          <p className="text-purple-600 text-sm mt-1">
            Email: {session?.user?.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-purple-200 rounded-md p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-purple-800 mb-4">User Management</h2>
            <p className="text-gray-600 mb-4">Manage user accounts, roles, and permissions.</p>
            <Button>Manage Users</Button>
          </div>
          
          <div className="bg-white border border-purple-200 rounded-md p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-purple-800 mb-4">Content Management</h2>
            <p className="text-gray-600 mb-4">Create, edit, and publish content.</p>
            <Button>Manage Content</Button>
          </div>
          
          <div className="bg-white border border-purple-200 rounded-md p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-purple-800 mb-4">System Settings</h2>
            <p className="text-gray-600 mb-4">Configure system settings and preferences.</p>
            <Button>Configure Settings</Button>
          </div>
          
          <div className="bg-white border border-purple-200 rounded-md p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-purple-800 mb-4">Analytics</h2>
            <p className="text-gray-600 mb-4">View system analytics and reports.</p>
            <Button>View Analytics</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
 