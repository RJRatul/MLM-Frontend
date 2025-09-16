'use client';

import { useState, useRef, useEffect } from 'react';
import PrivateLayout from '@/layouts/PrivateLayout';
import 'react-circular-progressbar/dist/styles.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FaRobot, FaPowerOff } from 'react-icons/fa';
import { apiService } from '@/services/api';

export default function AiTrade() {
  const [isActivated, setIsActivated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isActiveTime, setIsActiveTime] = useState(false);
  const [timeStatus, setTimeStatus] = useState('');
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

  // Check time status and manage auto-deactivation
  const checkTimeStatus = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Check if it's activation time (5:00 - 5:03 AM)
    const isActivationTime = hours === 5 && minutes >= 0 && minutes < 3;
    
    // Check if it's deactivation time (5:10 AM)
    const isDeactivationTime = hours === 5 && minutes >= 10;
    
    // Check if it's before activation time or after deactivation until next day
    const isOutsideTradingWindow = (hours < 5) || (hours === 5 && minutes >= 3 && minutes < 10) || (hours > 5);
    
    setIsActiveTime(isActivationTime);
    
    if (isActivationTime) {
      setTimeStatus('Activation window open');
    } else if (isDeactivationTime && isActivated) {
      // Auto-deactivate at 5:10 AM
      handleAutoDeactivate();
      setTimeStatus('Trading deactivated until tomorrow 5:00 AM');
    } else if (isOutsideTradingWindow) {
      setTimeStatus('Come back tomorrow at 5:00 AM');
    } else {
      setTimeStatus('Trading active');
    }

    // Schedule next check
    if (hours === 5 && minutes === 3) {
      const secondsUntilNextMinute = 60 - now.getSeconds();
      setTimeout(checkTimeStatus, secondsUntilNextMinute * 1000);
    }
  };

  const handleAutoDeactivate = async () => {
    if (isActivated) {
      try {
        // Call API to deactivate if currently activated
        const response = await apiService.toggleAiStatus();
        if (!response.aiStatus) {
          setIsActivated(false);
        }
      } catch (error) {
        console.error('Failed to auto-deactivate AI status:', error);
      }
    }
  };

  // Set up time checking interval
  useEffect(() => {
    checkTimeStatus(); // Initial check
    
    // Check every minute
    timeCheckRef.current = setInterval(checkTimeStatus, 60000);
    
    return () => {
      if (timeCheckRef.current) {
        clearInterval(timeCheckRef.current);
      }
    };
  }, [isActivated]); // Add isActivated as dependency

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
            Active only between 5:00 AM and 5:03 AM
          </p>
          <p className="text-gray-400 mt-2">
            Auto-deactivation at 5:10 AM
          </p>
          <p className="text-gray-400 mt-2">
            Current time: {formatTime(new Date())}
          </p>
          <p className={`mt-2 font-medium ${
            isActiveTime ? 'text-green-400' : 'text-red-400'
          }`}>
            {timeStatus}
          </p>
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
            ) : (
              <FaPowerOff className={`w-8 h-8 ${isActivated ? 'text-green-400' : 'text-white'}`} />
            )}
          </div>
        </div>

        <p className="text-gray-400 mt-4 text-sm text-center max-w-xs">
          {isLoading 
            ? 'Processing...' 
            : isActiveTime
            ? `Hold the power button for 5 seconds to ${isActivated ? 'deactivate' : 'activate'} trading`
            : 'Come back tomorrow at 5:00 AM to activate AI trading'
          }
        </p>
      </div>
    </PrivateLayout>
  );
}