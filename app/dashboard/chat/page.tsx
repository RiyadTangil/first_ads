'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserFromLocalStorage } from '@/lib/localStorage';
import ChatClient from './ChatClient';
import AdminChatClient from './AdminChatClient';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = getUserFromLocalStorage();
    
    if (!userData || !userData.id || !userData.token) {
      router.push('/auth/login');
      return;
    }
    
    setUser(userData);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          {user?.role === 'admin' ? (
            <h1 className="text-2xl font-bold text-gray-800">Admin Chat Dashboard</h1>
          ) : (
            <h1 className="text-2xl font-bold text-gray-800">Support Chat</h1>
          )}
        </div>
        <p className="text-gray-600 text-sm mt-1">
          {user?.role === 'admin' 
            ? 'Manage conversations with your users'
            : 'Get help from our support team'
          }
        </p>
      </div>
      
      {user?.role === 'admin' ? (
        <AdminChatClient />
      ) : (
        <ChatClient />
      )}
    </DashboardShell>
  );
} 