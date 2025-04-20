import React from 'react';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';
import AdminChatClient from './AdminChatClient';

export const metadata: Metadata = {
  title: 'Support Chat | Admin Dashboard',
  description: 'Admin interface for managing support conversations',
};

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  // Check if user is logged in and is an admin
  if (!session) {
    redirect('/auth/login');
  }
  
  // Restrict access to admins only
  // if (session.user?.role !== 'admin') {
  //   redirect('/dashboard');
  // }

  return (
    <DashboardShell>
      <div className="flex flex-col h-full">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Support Conversations</h1>
        <AdminChatClient />
      </div>
    </DashboardShell>
  );
} 