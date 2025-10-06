/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import PrivateLayout from '../../layouts/PrivateLayout';
import { apiService, User } from '@/services/api';
import {
  FaUser,
  FaEnvelope,
  FaMoneyBill,
  FaCodeBranch,
  FaLevelUpAlt,
  FaAward,
  FaToggleOn,
} from 'react-icons/fa';
import Link from 'next/link';

export default function AccountPage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiService.getProfile();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <PrivateLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">Account</h1>
          </div>
        </div>

        {loading && <p className="text-gray-300">Loading profile...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {profile && (
          <div className="bg-gray-900 rounded-lg shadow p-6 space-y-4 border border-gray-700">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={<FaUser />} label="Name" value={`${profile.firstName} ${profile.lastName}`} />
              <InfoRow icon={<FaEnvelope />} label="Email" value={profile.email} />
              <InfoRow icon={<FaMoneyBill />} label="Balance" value={`$${profile.balance?.toFixed(2)}`} />
              <InfoRow
                icon={<FaToggleOn />}
                label="AI Trading Status"
                value={profile.aiStatus ? 'Activated' : 'Deactivated'}
              />
              <InfoRow icon={<FaCodeBranch />} label="Referral Code" value={profile.referralCode || '—'} />
              <InfoRow icon={<FaAward />} label="Referral Count" value={String(profile.referralCount ?? 0)} />
              <InfoRow
                icon={<FaMoneyBill />}
                label="Referral Earnings"
                value={`$${profile.referralEarnings ?? 0}`}
              />
              <InfoRow icon={<FaLevelUpAlt />} label="Level" value={String(profile.level ?? 0)} />
              <InfoRow icon={<FaAward />} label="Tier" value={String(profile.tier ?? 0)} />
              <InfoRow
                icon={<FaAward />}
                label="Commission Rate"
                value={profile.commissionRate ? `${profile.commissionRate}%` : '—'}
              />
            </div>

            {/* AI Trading notice */}
            <div className="mt-6 bg-gray-800 p-4 rounded-md border border-blue-500/40">
              <p className="text-gray-300 mb-2">
                To change your AI Trading status, please visit the AI Trade page.
              </p>
              <Link
                href="/aiTrade"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Go to AI Trade
              </Link>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center bg-gray-800 rounded-md p-3 border border-gray-700">
      <div className="text-blue-400 mr-3 text-xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-white font-medium break-all">{value}</p>
      </div>
    </div>
  );
}
