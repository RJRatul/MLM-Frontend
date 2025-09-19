import AdminUsersManagement from '@/components/AdminUsersManagement';
import AdminLayout from '@/layouts/AdminLayout';

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Users Management</h1>
        <AdminUsersManagement />
      </div>
    </AdminLayout>
  );
}