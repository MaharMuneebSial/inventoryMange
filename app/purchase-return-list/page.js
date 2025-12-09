'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PurchaseReturnList from '@/components/PurchaseReturnList';

export default function PurchaseReturnListPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('inventoryUser');
    if (!user) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar activePage="purchase-return-list" />
      <div className="flex-1 overflow-hidden p-4">
        <PurchaseReturnList />
      </div>
    </div>
  );
}
