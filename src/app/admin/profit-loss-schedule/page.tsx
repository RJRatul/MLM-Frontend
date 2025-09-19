// app/admin/dashboard/page.tsx
import AdminCronSettings from '../../../components/AdminCronSettings';
import AdminLayout from '../../../layouts/AdminLayout';

export default function AdminTradepairManagement() {
  return (
    <AdminLayout>
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-white mb-6">Trade Pairs Management</h2>
        <AdminCronSettings/>
      </div>
    </AdminLayout>
  );
}