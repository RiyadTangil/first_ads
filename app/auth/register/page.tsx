'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { registerSchema } from '@/lib/validations';
import { getUserFromLocalStorage, isUserAuthenticated } from '@/lib/localStorage';

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if already authenticated using localStorage
  useEffect(() => {
    if (isUserAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    setFieldErrors({});
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.field) {
          // Set field-specific error
          setFormError(result.field as any, {
            type: 'server',
            message: result.error,
          });
          setFieldErrors({
            ...fieldErrors,
            [result.field]: result.error
          });
        } else {
          setError(result.error || 'Registration failed');
        }
        return;
      }

      setSuccess('Registration successful! Redirecting to login...');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
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
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Create Account</h1>
        <p className="text-gray-600">Join our community and get started</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-medium">Registration Failed</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
          <p className="font-medium">Success!</p>
          <p className="text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          {...register('name')}
          error={errors.name?.message}
          autoComplete="name"
          icon="user"
        />

        <Input
          label="Username"
          type="text"
          placeholder="johndoe"
          {...register('username')}
          error={errors.username?.message || fieldErrors.username}
          autoComplete="username"
          icon="at"
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="john.doe@example.com"
          {...register('email')}
          error={errors.email?.message || fieldErrors.email}
          autoComplete="email"
          icon="envelope"
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••••"
          {...register('password')}
          error={errors.password?.message}
          autoComplete="new-password"
          icon="lock"
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••••"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          icon="lock"
        />

        <Button 
          type="submit" 
          isLoading={isLoading} 
          fullWidth
          className="mt-6 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 rounded-lg font-semibold"
        >
          Create Account
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
} 