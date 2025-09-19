import AdminProfitLossManagement from '@/components/AdminProfitLossManagement';
import AdminLayout from '@/layouts/AdminLayout';

export default function AdminProfitLossPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Profit Rules Management</h1>
        <AdminProfitLossManagement />
      </div>
    </AdminLayout>
  );
}