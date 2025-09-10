// app/admin/dashboard/page.tsx
import AdminPairManagement from '@/components/AdminPairManagement';
import AdminLayout from '../../../layouts/AdminLayout';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-white mb-6">Admin Dashboard Overview</h2>
        <AdminPairManagement/>
      </div>
    </AdminLayout>
  );
}