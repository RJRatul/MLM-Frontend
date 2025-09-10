// components/AdminAuthGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated by looking for the token in localStorage
    const adminToken = localStorage.getItem('adminAuthToken'); // This is correct
    const adminAuthTime = localStorage.getItem('adminAuthTime');
    
    // For development/debugging - check what's actually in localStorage
    console.log('Admin token found:', adminToken);
    console.log('All localStorage:', localStorage);
    
    // Check if token exists and isn't expired (e.g., 12 hours)
    if (adminToken && adminAuthTime) {
      const authTime = parseInt(adminAuthTime);
      const currentTime = new Date().getTime();
      const twelveHours = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
      
      if (currentTime - authTime < twelveHours) {
        setIsAuthenticated(true);
        return;
      } else {
        // Token expired
        localStorage.removeItem('adminAuthToken');
        localStorage.removeItem('adminAuthTime');
      }
    }
    
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render children if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  return null;
}