"use client";

import { useState, useEffect, useRef } from "react";
import { FaRobot } from "react-icons/fa";
import { apiService } from "@/services/api";

export default function SmallAiToggle() {
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isActiveTime, setIsActiveTime] = useState(false);
  const timeCheckRef = useRef<NodeJS.Timeout | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Check if current time is between 3:30 AM and 11:00 AM
  const checkTimeStatus = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isTime =
      (hours > 3 || (hours === 3 && minutes >= 30)) &&
      (hours < 11 || (hours === 11 && minutes === 0));
    setIsActiveTime(isTime);
  };

  // Fetch user AI status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const profile = await apiService.getProfile();
        setIsActivated(profile.aiStatus || false);
      } catch (err) {
        console.error("Failed to fetch AI status:", err);
      }
    };
    fetchStatus();
    checkTimeStatus();
    timeCheckRef.current = setInterval(checkTimeStatus, 30_000);
    return () => {
      if (timeCheckRef.current) clearInterval(timeCheckRef.current);
    };
  }, []);

  // Toggle handler
  const handleToggle = async () => {
    if (!isActiveTime || isLoading) return;
    setIsLoading(true);
    try {
      const response = await apiService.toggleAiStatus();
      setIsActivated(response.aiStatus);
    } catch (err) {
      console.error("Failed to toggle AI:", err);
      setIsActivated((prev) => !prev);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => {
        if (!isActiveTime || isLoading) setShowTooltip(true);
      }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={handleToggle}
        disabled={!isActiveTime || isLoading}
        className={`relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300 
          ${isActivated ? "bg-green-500" : "bg-gray-600"} 
          ${!isActiveTime ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {/* Knob */}
        <span
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300
            ${isActivated ? "translate-x-6" : "translate-x-0"}`}
        />

        {/* Robot icon */}
        <FaRobot
          className={`absolute w-4 h-4 text-white transition-opacity duration-300 ${
            isActivated ? "opacity-100 right-1" : "opacity-100 left-1"
          }`}
        />
      </button>

      {/* Tooltip (bottom-left) */}
      {/* Tooltip (bottom-left) */}
{showTooltip && (
  <div className="absolute -bottom-8 left-[-224px] bg-gray-600 text-white text-xs rounded-md px-3 py-1 shadow-md whitespace-nowrap z-20">
    {isLoading
      ? "Processing..."
      : "AI trading available from 3:30 AM to 11:00 AM"}
    
    {/* Arrow */}
    {/* <div className="absolute top-0 left-2 w-2 h-2 bg-gray-600 rotate-45 translate-y-[-50%]" /> */}
  </div>
)}

    </div>
  );
}
