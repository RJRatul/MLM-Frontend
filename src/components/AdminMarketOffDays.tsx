/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";

interface DayCheckbox {
  id: number;
  name: string;
  checked: boolean;
}

export default function AdminMarketOffDays() {
  const [days, setDays] = useState<DayCheckbox[]>([
    { id: 0, name: "Sunday", checked: true },
    { id: 1, name: "Monday", checked: false },
    { id: 2, name: "Tuesday", checked: false },
    { id: 3, name: "Wednesday", checked: false },
    { id: 4, name: "Thursday", checked: false },
    { id: 5, name: "Friday", checked: false },
    { id: 6, name: "Saturday", checked: true },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMarketOffDays();
  }, []);

  // Auto-clear success messages
  useEffect(() => {
    if (message.includes('success')) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadMarketOffDays = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://beecoin.cloud/api'}/cron-settings/market-off-days`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminAuthToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load market off days');
      }

      const data = await response.json();
      
      // Update checkboxes based on loaded data
      setDays(prevDays => 
        prevDays.map(day => ({
          ...day,
          checked: data.marketOffDays.includes(day.id)
        }))
      );
      
    } catch (error: any) {
      console.error('Failed to load market off days:', error);
      setMessage(error.message || 'Failed to load market off days');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = (id: number) => {
    setDays(prevDays => 
      prevDays.map(day => 
        day.id === id ? { ...day, checked: !day.checked } : day
      )
    );
  };

  const saveMarketOffDays = async () => {
    const selectedDays = days.filter(day => day.checked).map(day => day.id);
    
    // At least 2 days must be selected (minimum)
    if (selectedDays.length < 2) {
      setMessage("Please select at least 2 market off days");
      return;
    }

    // Maximum 7 days (all days)
    if (selectedDays.length > 7) {
      setMessage("Maximum 7 days can be selected");
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://beecoin.cloud/api'}/cron-settings/market-off-days`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminAuthToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ marketOffDays: selectedDays }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update market off days');
      }

      setMessage('Market off days updated successfully');
      
    } catch (error: any) {
      console.error('Error saving market off days:', error);
      setMessage(error.message || 'Error saving market off days');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-white">Market Off Days</h2>
        <Button
          onClick={loadMarketOffDays}
          variant="secondary"
          size="sm"
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>
      
      {message && (
        <div className={`p-3 mb-4 rounded ${
          message.includes('success') 
            ? 'bg-green-500/10 text-green-500 border border-green-500' 
            : 'bg-red-500/10 text-red-500 border border-red-500'
        }`}>
          {message}
        </div>
      )}
      
      <div className="mb-6">
        <p className="text-gray-300 text-sm mb-4">
          Select days when the market is closed. No Algo trading profits will be added on these days.
          Minimum 2 days, maximum 7 days.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {days.map((day) => (
            <div 
              key={day.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                day.checked 
                  ? 'bg-red-500/20 border-red-500' 
                  : 'bg-gray-700 border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => toggleDay(day.id)}
            >
              <div className="text-center">
                <div className={`text-lg font-semibold mb-1 ${
                  day.checked ? 'text-red-400' : 'text-gray-300'
                }`}>
                  {day.name}
                </div>
                <div className={`text-xs ${
                  day.checked ? 'text-red-300' : 'text-gray-400'
                }`}>
                  {day.checked ? 'Market Closed' : 'Market Open'}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          <p>Selected: {days.filter(d => d.checked).length} days</p>
          <p>Selected days: {days.filter(d => d.checked).map(d => d.name).join(', ')}</p>
        </div>
      </div>
      
      <div className="flex justify-end mt-6 space-x-2">
        <Button 
          onClick={saveMarketOffDays} 
          variant="primary" 
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Market Off Days'}
        </Button>
      </div>
    </div>
  );
}