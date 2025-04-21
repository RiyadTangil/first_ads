import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getAuthToken } from './localStorage';

// Create an axios instance with default config
const createAPIClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: '/',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to inject auth token
  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

// Singleton instance
let apiClientInstance: AxiosInstance | null = null;

// Get API client (creates it if it doesn't exist)
export const getAPIClient = (): AxiosInstance => {
  if (!apiClientInstance) {
    apiClientInstance = createAPIClient();
  }
  return apiClientInstance;
}; 