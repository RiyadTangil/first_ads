'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { forgotPasswordSchema } from '@/lib/validations';

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to send password reset email');
        return;
      }

      setSuccess('Password reset link has been sent to your email address. Please check your inbox and spam folders.');
      reset(); // Clear the form after successful submission
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
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Forgot Password</h1>
        <p className="text-gray-600">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
          <p className="font-medium">Success</p>
          <p className="text-sm">{success}</p>
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
          disabled={isLoading || !!success}
        />

        <Button 
          type="submit" 
          isLoading={isLoading} 
          fullWidth
          disabled={!!success}
          className="mt-6 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 rounded-lg font-semibold"
        >
          {success ? 'Email Sent' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign in
          </Link>
        </p>
      </div>

      {success && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Didn&apos;t receive the email?{' '}
            <button 
              onClick={() => {
                setSuccess(null);
                setError(null);
              }}
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Try again
            </button>
          </p>
        </div>
      )}
    </div>
  );
} 