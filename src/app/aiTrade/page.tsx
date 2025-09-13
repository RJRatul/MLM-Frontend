'use client';

import { useState, useRef } from 'react';
import PrivateLayout from '@/layouts/PrivateLayout';
import 'react-circular-progressbar/dist/styles.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FaRobot } from 'react-icons/fa';

export default function AiTrade() {
  const [isActivated, setIsActivated] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / 5000) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= 5000) {
        setIsActivated(prev => !prev); // toggle active/inactive
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setProgress(0); // reset progress after toggle
      }
    }, 50);
  };

  const handleMouseUp = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setProgress(0); // reset progress if released early
  };

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-white mb-8">AI Trade Activation</h1>

        <div
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative w-32 h-32 cursor-pointer"
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

          {/* Centered AI icon or Activated text */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isActivated ? (
              <span className="text-white text-sm font-bold">Activated</span>
            ) : (
              <FaRobot className="w-12 h-12 text-white" />
            )}
          </div>
        </div>

        <p className="text-gray-400 mt-4 text-sm text-center max-w-xs">
          Hold the AI button for 5 seconds to {isActivated ? 'deactivate' : 'activate'} trading
        </p>
      </div>
    </PrivateLayout>
  );
}
