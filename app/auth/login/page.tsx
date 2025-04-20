'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { loginSchema } from '@/lib/validations';
import { saveUserToLocalStorage, getUserFromLocalStorage } from '@/lib/localStorage';

type LoginFormValues = z.infer<typeof loginSchema>;

// Disable static generation
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const userData = getUserFromLocalStorage();
    if (userData?.id && userData?.token) {
      router.push('/dashboard');
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use our direct login API instead of NextAuth
      const response = await fetch('/api/auth/direct-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to login');
        return;
      }

      // Save user data to localStorage
      if (result.success && result.user) {
        saveUserToLocalStorage(result.user);
        router.push('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-xl max-w-md w-full mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-medium">Authentication Failed</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          {...register('email')}
          error={errors.email?.message}
          autoComplete="email"
          icon="envelope"
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••••"
          {...register('password')}
          error={errors.password?.message}
          autoComplete="current-password"
          icon="lock"
        />

        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Forgot your password?
          </Link>
        </div>

        <Button 
          type="submit" 
          isLoading={isLoading} 
          fullWidth
          className="mt-6 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 rounded-lg font-semibold"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Create account
          </Link>
        </p>
      </div>
      
      {/* <div className="mt-8 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-gradient-to-br from-white to-blue-50 text-sm text-gray-500">
            Or continue with
          </span>
        </div>
      </div> */}
      
      {/* <div className="mt-6 grid grid-cols-1 gap-3">
        <button 
          type="button"
          className="flex justify-center items-center py-2.5 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
          onClick={() => setError('Social login is currently disabled')}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div> */}
    </div>
  );
} 