// utils/adminAuth.ts
export const adminLogout = () => {
  localStorage.removeItem('adminAuthToken');
  localStorage.removeItem('adminAuthTime');
  window.location.href = '/admin/login';
};

// Check if admin is authenticated
export const isAdminAuthenticated = (): boolean => {
  const adminToken = localStorage.getItem('adminAuthToken');
  const adminAuthTime = localStorage.getItem('adminAuthTime');
  
  if (adminToken && adminAuthTime) {
    const authTime = parseInt(adminAuthTime);
    const currentTime = new Date().getTime();
    const twelveHours = 12 * 60 * 60 * 1000;
    
    return (currentTime - authTime < twelveHours);
  }
  
  return false;
};