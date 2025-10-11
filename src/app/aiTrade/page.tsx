"use client";

import { useState, useRef, useEffect } from "react";
import PrivateLayout from "@/layouts/PrivateLayout";
import { FaRobot } from "react-icons/fa";
import { apiService } from "@/services/api";

export default function AiTrade() {
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isActiveTime, setIsActiveTime] = useState(false);
  const [timeStatus, setTimeStatus] = useState("");
  const timeCheckRef = useRef<NodeJS.Timeout | null>(null);

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

  const checkTimeStatus = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Active between 3:30 AM to 11:00 AM
    const isTime = (hours > 3 || (hours === 3 && minutes >= 35)) && 
                   (hours < 11 || (hours === 11 && minutes === 0));
    setIsActiveTime(isTime);
    setTimeStatus(
      isTime ? "Trading window open" : "Come back tomorrow at 3:35 AM"
    );
  };

  useEffect(() => {
    checkTimeStatus();
    // Check every 30 seconds
    timeCheckRef.current = setInterval(checkTimeStatus, 30_000);
    return () => {
      if (timeCheckRef.current) clearInterval(timeCheckRef.current);
    };
  }, []);

  const handleToggleActivation = async () => {
    if (!isActiveTime || isLoading) return;
    setIsLoading(true);
    try {
      const response = await apiService.toggleAiStatus();
      setIsActivated(response.aiStatus);
    } catch (err) {
      console.error("Failed to toggle AI status:", err);
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
    
    if (isActiveTime) {
      return `Tap the toggle to ${isActivated ? "deactivate" : "activate"} AI trading`;
    }
    
    return "Trading window is closed";
  };

  return (
    <PrivateLayout>
      <div className="min-h-[80vh] bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-white mb-8">
          AI Trade Activation
        </h1>

        {/* Time info */}
        <div className="mb-6 text-center">
          <p className="text-gray-400">
            Active only between 3:35 AM and 11:00 AM
          </p>
          <p className="text-gray-400">
            Auto-deactivation at 11:00 AM (server-side)
          </p>
          <p className="text-gray-400 mt-2">
            Current time: {formatTime(new Date())}
          </p>
          <p
            className={`mt-2 font-medium ${
              isActiveTime ? "text-green-400" : "text-red-400"
            }`}
          >
            {timeStatus}
          </p>
        </div>

        {/* Large Toggle Switch */}
        <button
          disabled={!isActiveTime || isLoading}
          onClick={handleToggleActivation}
          className={`relative flex items-center w-64 h-24 rounded-full transition-colors duration-300 
            ${isActivated ? "bg-green-500" : "bg-gray-600"} 
            ${
              !isActiveTime ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
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
                <span className="font-semibold text-lg">AI Active</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-lg">AI Off</span>
                <FaRobot className="w-10 h-10" />
              </>
            )}
          </div>
        </button>

        <p className="text-gray-400 mt-4 text-sm text-center max-w-xs">
          {getStatusMessage()}
        </p>
      </div>
    </PrivateLayout>
  );
}