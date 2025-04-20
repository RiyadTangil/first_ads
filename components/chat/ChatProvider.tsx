'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import FloatingChat from './FloatingChat';
import { getUserFromLocalStorage } from '@/lib/localStorage';

export default function ChatProvider() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Only show on dashboard pages for non-admin users
  const shouldShowChat = pathname?.startsWith('/dashboard') && !isAdmin;
  
  // Check user role
  useEffect(() => {
    const userData = getUserFromLocalStorage();
    if (userData && userData.role === 'admin') {
      setIsAdmin(true);
    }
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return shouldShowChat ? <FloatingChat /> : null;
} 