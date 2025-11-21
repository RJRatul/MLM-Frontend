"use client";

import { useState, useEffect } from "react";
import PrivateLayout from "@/layouts/PrivateLayout";
import { FaRobot } from "react-icons/fa";
import { apiService } from "@/services/api";

export default function AiTrade() {
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nextResetTime, setNextResetTime] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await apiService.getProfile();
        setIsActivated(profile.aiStatus || false);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  // Calculate next reset time (6:01 AM)
  useEffect(() => {
    const calculateNextReset = () => {
      const now = new Date();
      const resetTime = new Date();
      
      // Set to today's 6:01 AM
      resetTime.setHours(6, 1, 0, 0);
      
      // If it's already past 6:01 AM today, set to tomorrow's 6:01 AM
      if (now > resetTime) {
        resetTime.setDate(resetTime.getDate() + 1);
      }
      
      return resetTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    };

    setNextResetTime(calculateNextReset());
  }, []);

  const handleToggleActivation = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.toggleAiStatus();
      setIsActivated(response.aiStatus);
    } catch (err) {
      console.error("Failed to toggle ALGO status:", err);
      // Revert on error
      setIsActivated((prev) => !prev);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  // Function to get current status message
  const getStatusMessage = () => {
    if (isLoading) return "Processing...";
    return `Tap the toggle to ${isActivated ? "deactivate" : "activate"} ALGO trading`;
  };

  return (
    <PrivateLayout>
      <div className="min-h-[80vh] bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-white mb-8">
          ALGO Trade Activation
        </h1>

        {/* Important Message */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6 max-w-md text-center">
          <p className="text-blue-300 font-semibold text-lg mb-2">
            💰 Keep ALGO Toggle ON to Get Profit!
          </p>
          <p className="text-blue-200 text-sm">
            Your balance will be updated daily with profits when ALGO trading is active. 
            The ALGO will automatically turn off at 6:01 AM everyday and your balance will be updated with that day&apos;s earnings.
          </p>
        </div>

        {/* Current time info */}
        <div className="mb-6 text-center">
          <p className="text-gray-400">
            Current time: {formatTime(new Date())}
          </p>
          <p className="text-yellow-400 mt-2 font-medium">
            Next auto-reset: Today at {nextResetTime}
          </p>
          <p className="text-green-400 mt-1 text-sm">
            Available 24/7 - Turn on/off anytime
          </p>
        </div>

        {/* Large Toggle Switch */}
        <button
          disabled={isLoading}
          onClick={handleToggleActivation}
          className={`relative flex items-center w-64 h-24 rounded-full transition-colors duration-300 
            ${isActivated ? "bg-green-500" : "bg-gray-600"} 
            ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-90"}`}
        >
          {/* Sliding knob */}
          <span
            className={`absolute top-2 left-2 w-20 h-20 rounded-full bg-white shadow-md transform transition-transform duration-300
              ${isActivated ? "translate-x-40" : "translate-x-0"}`}
          ></span>

          {/* Icon & label */}
          <div className="flex items-center justify-between w-full px-6 text-white z-10">
            {isActivated ? (
              <>
                <FaRobot className="w-10 h-10" />
              </>
            ) : (
              <>
                <FaRobot className="w-10 h-10" />
              </>
            )}
          </div>
        </button>

        <p className="text-gray-400 mt-4 text-sm text-center max-w-xs">
          {getStatusMessage()}
        </p>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-400 text-sm max-w-md">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">How It Works:</h3>
            <ul className="text-left space-y-2">
              <li>• Keep ALGO ON to earn daily profits</li>
              <li>• ALGO analyzes markets 24/7 when active</li>
              <li>• Auto-reset at 6:01 AM daily</li>
              <li>• Balance updates with profits after reset</li>
              <li>• Turn back ON anytime after reset</li>
            </ul>
          </div>
        </div>

        {/* Current Status */}
        <div className={`mt-6 p-3 rounded-lg text-center max-w-md ${
          isActivated ? 'bg-green-900/30 border border-green-700' : 'bg-gray-800 border border-gray-700'
        }`}>
          <p className={isActivated ? "text-green-400 font-semibold" : "text-gray-400"}>
            {isActivated 
              ? "✅ ALGO is ACTIVE - Earning profits until 6:01 AM" 
              : "❌ ALGO is INACTIVE - Not earning profits"}
          </p>
        </div>
      </div>
    </PrivateLayout>
  );
}