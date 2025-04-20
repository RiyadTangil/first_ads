'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Client Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="secondary">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="text-center max-w-3xl px-4">
          <h2 className="text-4xl font-bold mb-6">Welcome to Client Dashboard</h2>
          <p className="text-xl text-gray-600 mb-8">
            A secure platform with role-based authentication. Sign in to access your personalized dashboard
            or create a new account to get started.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">User Features</h3>
              <ul className="text-left text-gray-700 pl-5 list-disc">
                <li>Personalized dashboard</li>
                <li>Secure authentication</li>
                <li>User-specific content</li>
                <li>Profile management</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Admin Features</h3>
              <ul className="text-left text-gray-700 pl-5 list-disc">
                <li>User management</li>
                <li>Content administration</li>
                <li>System settings</li>
                <li>Analytics dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Client Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
