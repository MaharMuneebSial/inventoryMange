'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Purchase from '../../components/Purchase';
import Sidebar from '../../components/Sidebar';

export default function PurchasePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const userData = localStorage.getItem('inventoryUser');
    if (!userData) {
      router.push('/');
    } else {
      setUser(JSON.parse(userData));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar activePage="purchase" />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
            <Purchase />
          </div>
        </div>
      </div>
    </div>
  );
}
