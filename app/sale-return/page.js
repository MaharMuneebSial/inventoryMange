'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SaleReturnComponent from '../../components/SaleReturn';
import Sidebar from '../../components/Sidebar';

export default function SaleReturnPage() {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('inventoryUser');
    if (!userData) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar activePage="sale-return" />

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full">
          <SaleReturnComponent />
        </div>
      </div>
    </div>
  );
}