'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Category from '../../components/Category';
import SubCategory from '../../components/SubCategory';
import Brand from '../../components/Brand';
import Supplier from '../../components/Supplier';
import Units from '../../components/Units';
import Sidebar from '../../components/Sidebar';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('category');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('inventoryUser');
    if (!userData) {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    console.log('Dashboard activeTab changed to:', activeTab);
  }, [activeTab]);

  // Render the appropriate component based on activeTab
  const renderContent = () => {
    console.log('Rendering content for activeTab:', activeTab);
    switch (activeTab) {
      case 'category':
        return <Category />;
      case 'sub-category':
        return <SubCategory />;
      case 'brand':
        return <Brand />;
      case 'supplier':
        return <Supplier />;
      case 'unit':
        return <Units />;
      default:
        return <Category />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar activePage="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto flex flex-col">
        <div className="p-4 flex-1 flex flex-col">
          <div className="bg-white rounded-xl shadow-xl p-4 border border-gray-100 flex-1 flex flex-col overflow-hidden">
            <div key={activeTab}>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
