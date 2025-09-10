// app/admin/dashboard/page.tsx
import AdminLayout from '../../../layouts/AdminLayout';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-white mb-6">Admin Dashboard Overview</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500">
            <h3 className="text-gray-300 text-sm font-medium">Total Users</h3>
            <p className="text-2xl font-bold text-white mt-2">1,243</p>
            <p className="text-green-400 text-xs mt-1">+12 this week</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg border-l-4 border-green-500">
            <h3 className="text-gray-300 text-sm font-medium">Active Trades</h3>
            <p className="text-2xl font-bold text-white mt-2">347</p>
            <p className="text-green-400 text-xs mt-1">+24 today</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg border-l-4 border-purple-500">
            <h3 className="text-gray-300 text-sm font-medium">Total Deposits</h3>
            <p className="text-2xl font-bold text-white mt-2">$89,432</p>
            <p className="text-green-400 text-xs mt-1">+$2,489 today</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg border-l-4 border-yellow-500">
            <h3 className="text-gray-300 text-sm font-medium">Pending Withdrawals</h3>
            <p className="text-2xl font-bold text-white mt-2">12</p>
            <p className="text-red-400 text-xs mt-1">Requires attention</p>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-600 rounded">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold mr-3">
                  JD
                </div>
                <div>
                  <p className="text-sm text-white">John Doe deposited $500</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              <span className="text-green-400 text-sm font-medium">Completed</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-600 rounded">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold mr-3">
                  JS
                </div>
                <div>
                  <p className="text-sm text-white">Jane Smith requested withdrawal</p>
                  <p className="text-xs text-gray-400">5 hours ago</p>
                </div>
              </div>
              <span className="text-yellow-400 text-sm font-medium">Pending</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-600 rounded">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold mr-3">
                  RS
                </div>
                <div>
                  <p className="text-sm text-white">Robert Smith registered</p>
                  <p className="text-xs text-gray-400">Yesterday</p>
                </div>
              </div>
              <span className="text-blue-400 text-sm font-medium">New</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}