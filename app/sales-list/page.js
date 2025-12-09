'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SalesListComponent from '../../components/SalesList';
import Sidebar from '../../components/Sidebar';

export default function SalesListPage() {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('inventoryUser');
    if (!userData) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex overflow-hidden">
      <Sidebar activePage="sales-list" />

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <SalesListComponent />
      </div>
    </div>
  );
}