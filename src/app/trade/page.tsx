'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

export default function Trade() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.firstName}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-2">Portfolio Value</h2>
              <p className="text-3xl font-bold text-yellow-400">$12,458.32</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-2">Today Profit</h2>
              <p className="text-3xl font-bold text-green-400">+$342.18</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-2">AI Accuracy</h2>
              <p className="text-3xl font-bold text-blue-400">94.7%</p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}