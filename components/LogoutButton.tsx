'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { clearUserFromLocalStorage } from '@/lib/localStorage';
import Button from '@/components/ui/Button';

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // Clear localStorage - this is now our only auth store
      clearUserFromLocalStorage();
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleLogout} 
      isLoading={isLoading}
      variant="danger"
      className={className}
    >
      Sign Out
    </Button>
  );
} 