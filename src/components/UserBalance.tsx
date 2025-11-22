// components/UserBalance.tsx - Improved version
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {  FaSync } from "react-icons/fa";

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

  return (
    <div className="flex items-center space-x-3">
      {/* <div className="relative">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-5 w-5 h-5 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
          title="Refresh balance"
        >
          <FaSync
            className={`text-gray-300 w-4 h-4 ${
              isRefreshing ? "animate-spin" : ""
            }`}
            style={{
              position: "relative",
              top: "0px",
              bottom: "0",
              transform: "translate(-8px, -7px)",
            }}
          />
        </button>
      </div> */}
      <div className="">
        <span className="text-white font-medium">
          ${user?.balance?.toFixed(2) || "0.00"}
        </span>
      </div>
    </div>
  );
}
