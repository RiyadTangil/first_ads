import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  getUserFromLocalStorage, 
  saveUserToLocalStorage, 
  clearUserFromLocalStorage,
  isUserAuthenticated,
  getUserRole,
  StoredUserData
} from '@/lib/localStorage';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize user state from localStorage
  useEffect(() => {
    const storedUser = getUserFromLocalStorage();
    setUser(storedUser);
    setLoading(false);
  }, []);
  
  // Function to handle login
  const login = (userData: StoredUserData) => {
    saveUserToLocalStorage(userData);
    setUser(userData);
  };
  
  // Function to handle logout
  const logout = async () => {
    clearUserFromLocalStorage();
    setUser(null);
    await signOut({ redirect: false });
    router.push('/auth/login');
  };
  
  // Redirect to login if not authenticated
  const requireAuth = (callback?: () => void) => {
    if (!loading && !isUserAuthenticated()) {
      router.push('/auth/login');
    } else if (callback) {
      callback();
    }
  };
  
  // Check if user has admin role
  const isAdmin = () => {
    const role = getUserRole();
    return role === 'admin';
  };
  
  // Redirect if not admin
  const requireAdmin = (callback?: () => void) => {
    if (!loading) {
      if (!isUserAuthenticated()) {
        router.push('/auth/login');
      } else if (!isAdmin()) {
        router.push('/dashboard');
      } else if (callback) {
        callback();
      }
    }
  };
  
  return {
    user,
    loading,
    isAuthenticated: isUserAuthenticated(),
    isAdmin: isAdmin(),
    login,
    logout,
    requireAuth,
    requireAdmin
  };
} 