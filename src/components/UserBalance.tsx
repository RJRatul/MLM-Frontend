// components/UserBalance.tsx - Updated version
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FaDollarSign, FaSync } from 'react-icons/fa';

export default function UserBalance() {
  const { user, refreshBalance } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localBalance, setLocalBalance] = useState(user?.balance || 0);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Update local balance when user balance changes
  useEffect(() => {
    if (user?.balance !== undefined) {
      setLocalBalance(user.balance);
    }
  }, [user?.balance, forceUpdate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const newBalance = await refreshBalance();
      setLocalBalance(newBalance);
      // Force a re-render to ensure UI updates
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center">
        <FaDollarSign className="text-yellow-400 mr-2" />
        <span className="text-white font-medium">
          {localBalance.toFixed(2)}
        </span>
      </div>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50"
        title="Refresh balance"
      >
        <FaSync className={`text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}