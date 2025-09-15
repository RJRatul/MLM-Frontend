'use client';

import { useState, useRef, useEffect } from 'react'; // Add useEffect import
import PrivateLayout from '@/layouts/PrivateLayout';
import 'react-circular-progressbar/dist/styles.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FaRobot } from 'react-icons/fa';
import { apiService } from '@/services/api';

export default function AiTrade() {
  const [isActivated, setIsActivated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch user profile on component mount
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

  const handleMouseDown = () => {
    if (isLoading) return; // Prevent interaction during API call
    
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / 5000) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= 5000) {
        handleToggleActivation();
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setProgress(0);
      }
    }, 50);
  };

  const handleToggleActivation = async () => {
    setIsLoading(true);
    try {
      // Call the API to toggle AI status
      const response = await apiService.toggleAiStatus();
      
      // Update local state with the response from server
      setIsActivated(response.aiStatus);
      
      // Optional: Show a success message
      console.log(response.message);
    } catch (error) {
      console.error('Failed to toggle AI status:', error);
      // Revert the toggle if API call fails
      setIsActivated(prev => !prev);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseUp = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setProgress(0);
  };

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-white mb-8">AI Trade Activation</h1>

        <div
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`relative w-32 h-32 cursor-pointer ${isLoading ? 'opacity-50' : ''}`}
          style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
        >
          <CircularProgressbar
            value={progress}
            strokeWidth={8}
            text=""
            styles={buildStyles({
              pathColor: '#10B981',
              trailColor: 'rgba(16,185,129,0.3)',
              strokeLinecap: 'round',
              rotation: 0,
            })}
          />

          {/* Centered AI icon or status text */}
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
            : `Hold the AI button for 5 seconds to ${isActivated ? 'deactivate' : 'activate'} trading`
          }
        </p>
      </div>
    </PrivateLayout>
  );
}