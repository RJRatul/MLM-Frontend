"use client";

import { useState, useEffect, useRef } from "react";
import { FaRobot } from "react-icons/fa";
import { apiService } from "@/services/api";

export default function SmallAiToggle() {
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isActiveTime, setIsActiveTime] = useState(false);
  const timeCheckRef = useRef<NodeJS.Timeout | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    color: "green" | "red";
    show: boolean;
  }>({ message: "", color: "green", show: false });
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if current time is between 3:45 AM and 11:00 AM
  const checkTimeStatus = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isTime =
      (hours > 3 || (hours === 3 && minutes >= 35)) &&
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
    if (!isActiveTime) {
      // Show disabled time toast when clicked outside active hours
      showDisabledToast();
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.toggleAiStatus();
      setIsActivated(response.aiStatus);

      // Show activation toast
      showAiToast(response.aiStatus);
    } catch (err) {
      console.error("Failed to toggle AI:", err);
      setIsActivated((prev) => !prev);
      showAiToast(!isActivated);
    } finally {
      setIsLoading(false);
    }
  };

  const showAiToast = (status: boolean) => {
    setToast({
      message: `AI Trade is ${status ? "ON" : "OFF"}`,
      color: status ? "green" : "red",
      show: true,
    });

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const showDisabledToast = () => {
    setToast({
      message: "You can turn on AI Trade from 3:45 AM to 11:00 AM",
      color: "red",
      show: true,
    });

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000); // Slightly longer duration for informational message
  };

  // Calculate the translation distance based on container width and knob size
  const getTranslateX = () => {
    if (!toggleRef.current) return "0px";
    
    const containerWidth = toggleRef.current.offsetWidth;
    const knobWidth = 24; // w-6 = 24px
    
    // Calculate the distance: container width - knob width - left padding
    const translateDistance = containerWidth - knobWidth - 8; // 8px for left-1 (4px) and right spacing
    return `${translateDistance}px`;
  };

  return (
    <div className="relative flex items-center justify-center">
      <button
        ref={toggleRef}
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative flex items-center justify-center w-40 lg:w-14 h-8 rounded-full transition-all duration-300 
          ${isActivated ? "bg-green-500" : "bg-gray-600"} 
          ${!isActiveTime ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${isLoading ? "opacity-70 cursor-wait" : ""}`}
      >
        {/* Knob */}
        <span
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300
            ${isLoading ? "opacity-70" : ""}`}
          style={{
            transform: isActivated ? `translateX(${getTranslateX()})` : 'translateX(0)',
          }}
        />
      </button>

      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded shadow-md text-white z-50 ${
            toast.color === "green" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <FaRobot className="w-4 h-4" />
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}