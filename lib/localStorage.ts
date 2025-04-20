// Type definition for user data stored in localStorage
export interface StoredUserData {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  token?: string;
}

const USER_DATA_KEY = 'user_data';

// Save user data to localStorage
export const saveUserToLocalStorage = (userData: StoredUserData): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }
};

// Update existing user data in localStorage
export const updateUserInLocalStorage = (userData: Partial<StoredUserData>): void => {
  if (typeof window !== 'undefined') {
    const existingData = getUserFromLocalStorage();
    if (existingData) {
      const updatedData = { ...existingData, ...userData };
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
    }
  }
};

// Get user data from localStorage
export const getUserFromLocalStorage = (): StoredUserData | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (userData) {
      return JSON.parse(userData) as StoredUserData;
    }
  }
  return null;
};

// Clear user data from localStorage
export const clearUserFromLocalStorage = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_DATA_KEY);
  }
};

// Check if the user is authenticated based on localStorage
export const isUserAuthenticated = (): boolean => {
  const user = getUserFromLocalStorage();
  return !!user?.id && !!user?.token;
};

// Get user role from localStorage
export const getUserRole = (): string | null => {
  const user = getUserFromLocalStorage();
  return user?.role || null;
};

// Get authentication token from localStorage
export const getAuthToken = (): string | null => {
  const user = getUserFromLocalStorage();
  return user?.token || null;
};

// Helper for authenticated API requests
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}; 