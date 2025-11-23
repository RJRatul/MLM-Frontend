"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";

interface SmallAiToggleProps {
  onToggle?: (message: string, color: "green" | "red") => void;
}

export default function SmallAiToggle({ onToggle }: SmallAiToggleProps) {
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user ALGO status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const profile = await apiService.getProfile();
        setIsActivated(profile.aiStatus || false);
      } catch (err) {
        console.error("Failed to fetch ALGO status:", err);
      }
    };
    fetchStatus();
  }, []);

  // Toggle handler
  const handleToggle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.toggleAiStatus();
      setIsActivated(response.aiStatus);

      // Call parent toast function
      if (onToggle) {
        onToggle(
          `${response.aiStatus ? "Activated" : "Deactivated"} successfully`,
          response.aiStatus ? "green" : "red"
        );
      }
    } catch (err) {
      console.error("Failed to toggle ALGO:", err);
      // Optimistic update
      const newStatus = !isActivated;
      setIsActivated(newStatus);
      
      // Call parent toast function for error case too
      if (onToggle) {
        onToggle(
          `${newStatus ? "Activated" : "Deactivated"} successfully`,
          newStatus ? "green" : "red"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate the translation distance
  const getTranslateX = () => {
    const containerWidth = 56; // w-14 = 56px
    const knobWidth = 20; // w-5 = 20px
    const translateDistance = containerWidth - knobWidth - 8;
    return `${translateDistance}px`;
  };

  return (
    <div className="relative flex items-center justify-center">
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300 
          ${isActivated ? "bg-green-500" : "bg-gray-600"} 
          ${isLoading ? "opacity-70 cursor-wait" : "cursor-pointer hover:opacity-90"}
          border-2 ${isActivated ? "border-green-400" : "border-gray-500"}`}
      >
        {/* Knob */}
        <span
          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300
            ${isLoading ? "opacity-70" : ""}
            ${isActivated ? "shadow-green-200" : "shadow-gray-400"}`}
          style={{
            transform: isActivated ? `translateX(${getTranslateX()})` : 'translateX(0)',
          }}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </button>
    </div>
  );
}