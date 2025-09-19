// components/UserBalance.tsx - Improved version
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FaDollarSign, FaSync } from 'react-icons/fa';

export default function UserBalance() {
  const { user, refreshBalance } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="bg-gray-900 rounded-lg px-4 py-2 flex items-center">
        <FaDollarSign className="text-yellow-400 mr-2" />
        <span className="text-white font-medium">
          {user?.balance?.toFixed(2) || '0.00'}
        </span>
      </div>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
        title="Refresh balance"
      >
        <FaSync className={`text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}