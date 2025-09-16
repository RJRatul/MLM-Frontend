'use client';

import { useState, useRef, useEffect } from 'react';
import PrivateLayout from '@/layouts/PrivateLayout';
import 'react-circular-progressbar/dist/styles.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FaRobot } from 'react-icons/fa';
import { apiService } from '@/services/api';

export default function AiTrade() {
  const [isActivated, setIsActivated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isActiveTime, setIsActiveTime] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeCheckRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await apiService.getProfile();
        setIsActivated(profile.aiStatus || false);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Check if current time is between 4:00 AM and 4:03 AM
  const checkActiveTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Check if it's between 4:00 and 4:03
    const isActive = hours === 4 && minutes >= 0 && minutes < 3;
    setIsActiveTime(isActive);
    
    // If it's after 4:03 but before 4:04, schedule a check for the next minute
    if (hours === 4 && minutes === 3) {
      const secondsUntilNextMinute = 60 - now.getSeconds();
      setTimeout(checkActiveTime, secondsUntilNextMinute * 1000);
    }
  };

  // Set up time checking interval
  useEffect(() => {
    checkActiveTime(); // Initial check
    
    // Check every minute
    timeCheckRef.current = setInterval(checkActiveTime, 60000);
    
    return () => {
      if (timeCheckRef.current) {
        clearInterval(timeCheckRef.current);
      }
    };
  }, []);

  // Clear interval on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startProgress = () => {
    if (isLoading || !isActiveTime) return;
    
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / 5000) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= 5000) {
        handleToggleActivation();
        clearProgress();
      }
    }, 50);
  };

  const clearProgress = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setProgress(0);
  };

  const handleToggleActivation = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.toggleAiStatus();
      setIsActivated(response.aiStatus);
    } catch (error) {
      console.error('Failed to toggle AI status:', error);
      setIsActivated(prev => !prev);
    } finally {
      setIsLoading(false);
    }
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-white mb-8">AI Trade Activation</h1>

        <div className="mb-4 text-center">
          <p className="text-gray-400">
            Active only between 4:00 AM and 4:03 AM
          </p>
          <p className="text-gray-400 mt-2">
            Current time: {formatTime(new Date())}
          </p>
          {!isActiveTime && (
            <p className="text-red-400 mt-2 font-medium">
              AI trading is currently unavailable
            </p>
          )}
        </div>

        <div
          // Mouse events for desktop
          onMouseDown={startProgress}
          onMouseUp={clearProgress}
          onMouseLeave={clearProgress}
          // Touch events for mobile
          onTouchStart={startProgress}
          onTouchEnd={clearProgress}
          onTouchCancel={clearProgress}
          className={`relative w-32 h-32 ${isActiveTime ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
          style={{ pointerEvents: isLoading || !isActiveTime ? 'none' : 'auto' }}
        >
          <CircularProgressbar
            value={progress}
            strokeWidth={8}
            text=""
            styles={buildStyles({
              pathColor: isActiveTime ? '#10B981' : '#6B7280',
              trailColor: isActiveTime ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.3)',
              strokeLinecap: 'round',
              rotation: 0,
            })}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isActivated ? (
              <span className="text-white text-sm font-bold">Activated</span>
            ) : (
              <FaRobot className="w-12 h-12 text-white" />
            )}
          </div>
        </div>

        <p className="text-gray-400 mt-4 text-sm text-center max-w-xs">
          {isLoading 
            ? 'Processing...' 
            : isActiveTime
            ? `Hold the AI button for 5 seconds to ${isActivated ? 'deactivate' : 'activate'} trading`
            : 'Come back between 4:00 AM and 4:03 AM to activate AI trading'
          }
        </p>
      </div>
    </PrivateLayout>
  );
}