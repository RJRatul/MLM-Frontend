'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PrivateLayout from '@/layouts/PrivateLayout';
import UserPairsList from '@/components/UserPairsList';

export default function Trade() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <UserPairsList/>
        </div>
      </div>
    </PrivateLayout>
  );
}