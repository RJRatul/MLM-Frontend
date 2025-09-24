/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { cronSettingsApiService } from "../services/cronSettingsApi";

export default function AdminCronSettings() {
  const [settings, setSettings] = useState({
    time: "06:00",
    timeZone: "Asia/Dhaka"
  });
  const [backendSettings, setBackendSettings] = useState({
    balanceUpdateTime: "06:00",
    deactivationTime: "06:01",
    timeZone: "Asia/Dhaka"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-clear success messages after 5 seconds
  useEffect(() => {
    if (message.includes('success')) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await cronSettingsApiService.getCronSettings();
      setSettings(data);
      
      // Also load the full backend response for display
      const fullResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cron-settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminAuthToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (fullResponse.ok) {
        const backendData = await fullResponse.json();
        setBackendSettings(backendData);
      }
    } catch (error: any) {
      console.error('Failed to load cron settings:', error);
      setMessage(error.message || 'Failed to load cron settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate time format
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(settings.time)) {
      setMessage('Invalid time format. Use HH:mm (e.g., 06:00)');
      return;
    }
    
    try {
      setIsSaving(true);
      setMessage("");
      
      const response = await cronSettingsApiService.updateCronSettings(settings);
      setMessage(response.message || 'Settings updated successfully');
      
      // Reload settings to get updated backend data
      await loadSettings();
    } catch (error: any) {
      console.error('Error saving cron settings:', error);
      setMessage(error.message || 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const testCronJob = async () => {
    try {
      setIsTesting(true);
      setMessage("");
      
      const response = await cronSettingsApiService.testCronJob();
      setMessage(response.message || 'Cron job test executed successfully');
    } catch (error: any) {
      console.error('Error testing cron job:', error);
      setMessage(error.message || 'Error testing cron job');
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-white">Cron Schedule Settings</h2>
        <Button
          onClick={loadSettings}
          variant="secondary"
          size="sm"
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>
      
      {message && (
        <div className={`p-3 mb-4 rounded ${message.includes('success') ? 'bg-green-500/10 text-green-500 border border-green-500' : 'bg-green-500/10 text-green-500 border border-green-500'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={saveSettings}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Daily Run Time (HH:mm)
            </label>
            <input
              type="time"
              required
              value={settings.time}
              onChange={(e) => setSettings({ ...settings, time: e.target.value })}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Zone
            </label>
            <select
              value={settings.timeZone}
              onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Asia/Dhaka">Asia/Dhaka (Bangladesh)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="Australia/Sydney">Australia/Sydney</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end mt-6 space-x-2">
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
      
      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Current Schedule</h3>
        <p className="text-white mb-1">
          Balance Update: <strong>{backendSettings.balanceUpdateTime}</strong>
        </p>
        <p className="text-white">
          Auto Deactivation: <strong>{backendSettings.deactivationTime}</strong>
        </p>
        <p className="text-white mt-1">
          Time Zone: <strong>{backendSettings.timeZone}</strong>
        </p>
      </div>
    </div>
  );
}