// components/UserBalance.tsx - Enhanced version
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FaSync } from "react-icons/fa";

export default function UserBalance() {
  const { user, refreshBalance } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format balance with commas
  const formatBalance = (balance: number) => {
    return balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="flex items-center justify-center space-x-3">
      <div className="text-white font-bold text-4xl">
        ${formatBalance(user?.balance || 0)}
      </div>
      {/* <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="p-2 bg-gray-700 rounded-xl hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
        title="Refresh balance"
      >
        <FaSync
          className={`text-gray-300 w-4 h-4 ${
            isRefreshing ? "animate-spin" : ""
          }`}
        />
      </button> */}
    </div>
  );
}