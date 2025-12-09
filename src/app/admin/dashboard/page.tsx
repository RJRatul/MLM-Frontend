import AdminCronSettings from '../../../components/AdminCronSettings';
import AdminMarketOffDays from '../../../components/AdminMarketOffDays';
import AdminLayout from '../../../layouts/AdminLayout';

export default function AdminTradepairManagement() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Time Settings */}
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-white mb-6">Market Off Days</h2>
          <AdminMarketOffDays/>
        </div>
        
        {/* Market Off Days Settings */}
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-white mb-6">Cron Time Settings</h2>
          <AdminCronSettings/>
        </div>
      </div>
    </AdminLayout>
  );
}