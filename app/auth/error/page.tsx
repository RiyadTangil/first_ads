'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

// Explicitly disable static generation and make this a dynamic page
export const dynamic = 'force-dynamic';

export default function AuthErrorPage({
  searchParams
}: {
  searchParams: { error?: string }
}) {
  const [errorMessage, setErrorMessage] = useState<string>('An unknown error occurred');
  
  useEffect(() => {
    const error = searchParams.error;
    
    // Parse the error message based on the error code
    if (error) {
      switch (error) {
        case 'CredentialsSignin':
          setErrorMessage('Invalid email or password');
          break;
        case 'AccessDenied':
          setErrorMessage('You do not have permission to access this resource');
          break;
        case 'OAuthSignin':
        case 'OAuthCallback':
        case 'OAuthCreateAccount':
        case 'EmailCreateAccount':
        case 'Callback':
          setErrorMessage('There was an error with the authentication service');
          break;
        case 'SessionRequired':
          setErrorMessage('You must be signed in to access this page');
          break;
        default:
          setErrorMessage(error);
      }
    }
  }, [searchParams.error]);

  return (
    <div className="bg-gradient-to-br from-white to-red-50 p-8 rounded-2xl shadow-xl max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Authentication Error</h1>
        <p className="mt-2 text-gray-600">
          {errorMessage}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Link href="/auth/login">
          <Button fullWidth className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white">
            Back to Sign In
          </Button>
        </Link>
        
        <Link href="/">
          <Button variant="secondary" fullWidth>
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  );
} 