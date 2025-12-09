'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Purchase from '../../components/Purchase';
import Sidebar from '../../components/Sidebar';

export default function PurchasePage() {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('inventoryUser');
    if (!userData) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar activePage="purchase" />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <Purchase />
      </div>
    </div>
  );
}
