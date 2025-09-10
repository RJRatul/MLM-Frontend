// app/admin/deposit/page.tsx
import AdminLayout from '../../../layouts/AdminLayout';
import AdminDepositManagement from '@/components/AdminDepositManagement';

export default function AdminDepositPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center">
            Deposit Management
          </h1>
        </div>

        {/* Content */}
        <AdminDepositManagement />
      </div>
    </AdminLayout>
  );
}