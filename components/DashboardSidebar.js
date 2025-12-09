'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardSidebar({ activeTab, setActiveTab }) {
  const [filesDropdownOpen, setFilesDropdownOpen] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState(-1);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('inventoryUser');
    router.push('/');
  };

  // Debug: Log when activeTab prop changes
  useEffect(() => {
    console.log('DashboardSidebar received activeTab prop:', activeTab);
  }, [activeTab]);

  // Menu items list for keyboard navigation
  const menuItems = [
    { id: 'toggle-dropdown', action: () => setFilesDropdownOpen(!filesDropdownOpen) },
    ...(filesDropdownOpen ? [
      { id: 'category', action: () => setActiveTab('category') },
      { id: 'sub-category', action: () => setActiveTab('sub-category') },
      { id: 'brand', action: () => setActiveTab('brand') },
      { id: 'supplier', action: () => setActiveTab('supplier') },
      { id: 'unit', action: () => setActiveTab('unit') },
    ] : []),
    { id: 'product-entry', action: () => router.push('/product-entry') },
    { id: 'sale', action: () => router.push('/sale') },
    { id: 'sales-list', action: () => router.push('/sales-list') },
    { id: 'sale-return', action: () => router.push('/sale-return') },
    { id: 'purchase', action: () => router.push('/purchase') },
    { id: 'purchase-list', action: () => router.push('/purchase-list') },
    { id: 'logout', action: handleLogout },
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle sidebar navigation when no modals are open
      if (document.querySelector('.fixed.inset-0.backdrop-blur-md')) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedMenuItem(prev => (prev < menuItems.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedMenuItem(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedMenuItem >= 0 && selectedMenuItem < menuItems.length) {
            menuItems[selectedMenuItem].action();
          }
          break;
        case 'Home':
          e.preventDefault();
          setSelectedMenuItem(0);
          break;
        case 'End':
          e.preventDefault();
          setSelectedMenuItem(menuItems.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMenuItem, menuItems]);

  return (
    <div className="w-56 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl flex flex-col">
      {/* Sidebar Navigation - Compact */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {/* Files Dropdown */}
        <div className="space-y-0.5">
          <button
            onClick={() => {
              setFilesDropdownOpen(!filesDropdownOpen);
              setSelectedMenuItem(-1);
            }}
            onFocus={() => setSelectedMenuItem(-1)}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              selectedMenuItem === 0
                ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span>Initial System Setup</span>
            </div>
            <svg
              className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${filesDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {filesDropdownOpen && (
            <div className="ml-2 pl-3 border-l-2 border-slate-700 space-y-0.5">
              <button
                onClick={() => {
                  setActiveTab('category');
                  setSelectedMenuItem(-1);
                }}
                onFocus={() => setSelectedMenuItem(-1)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                  selectedMenuItem === 1
                    ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
                    : activeTab === 'category'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  Category
                </div>
              </button>
              <button
                onClick={() => {
                  console.log('Sub-Category clicked, setting activeTab to: sub-category');
                  setActiveTab('sub-category');
                  setSelectedMenuItem(-1);
                }}
                onFocus={() => setSelectedMenuItem(-1)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                  selectedMenuItem === 2
                    ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
                    : activeTab === 'sub-category'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Sub-Category
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('brand');
                  setSelectedMenuItem(-1);
                }}
                onFocus={() => setSelectedMenuItem(-1)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                  selectedMenuItem === 3
                    ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
                    : activeTab === 'brand'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                  Brand
                </div>
              </button>
              <button
                onClick={() => {
                  console.log('Supplier clicked, setting activeTab to: supplier');
                  setActiveTab('supplier');
                  setSelectedMenuItem(-1);
                }}
                onFocus={() => setSelectedMenuItem(-1)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                  selectedMenuItem === 4
                    ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
                    : activeTab === 'supplier'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  Supplier
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('unit');
                  setSelectedMenuItem(-1);
                }}
                onFocus={() => setSelectedMenuItem(-1)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                  selectedMenuItem === 5
                    ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
                    : activeTab === 'unit'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Unit
                </div>
              </button>
            </div>
          )}
        </div>

        {/* New Product */}
        <button
          onClick={() => {
            router.push('/product-entry');
            setSelectedMenuItem(-1);
          }}
          onFocus={() => setSelectedMenuItem(-1)}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            selectedMenuItem === (filesDropdownOpen ? 6 : 1)
              ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <span>New Product</span>
          </div>
        </button>

        {/* Sale */}
        <button
          onClick={() => {
            router.push('/sale');
            setSelectedMenuItem(-1);
          }}
          onFocus={() => setSelectedMenuItem(-1)}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            selectedMenuItem === (filesDropdownOpen ? 7 : 2)
              ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
            <span>Sale</span>
          </div>
        </button>

        {/* Total Sales */}
        <button
          onClick={() => {
            router.push('/sales-list');
            setSelectedMenuItem(-1);
          }}
          onFocus={() => setSelectedMenuItem(-1)}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            selectedMenuItem === (filesDropdownOpen ? 8 : 3)
              ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3-3a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zm-4 3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Total Sales</span>
          </div>
        </button>

        {/* Sale Return */}
        <button
          onClick={() => {
            router.push('/sale-return');
            setSelectedMenuItem(-1);
          }}
          onFocus={() => setSelectedMenuItem(-1)}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            selectedMenuItem === (filesDropdownOpen ? 9 : 4)
              ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
            </svg>
            <span>Sale Return</span>
          </div>
        </button>

        {/* Purchase */}
        <button
          onClick={() => {
            router.push('/purchase');
            setSelectedMenuItem(-1);
          }}
          onFocus={() => setSelectedMenuItem(-1)}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            selectedMenuItem === (filesDropdownOpen ? 11 : 6)
              ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span>Purchase</span>
          </div>
        </button>

        {/* Total Purchases */}
        <button
          onClick={() => {
            router.push('/purchase-list');
            setSelectedMenuItem(-1);
          }}
          onFocus={() => setSelectedMenuItem(-1)}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            selectedMenuItem === (filesDropdownOpen ? 12 : 7)
              ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Total Purchases</span>
          </div>
        </button>
      </nav>

      {/* Logout Button - Compact */}
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={() => {
            handleLogout();
            setSelectedMenuItem(-1);
          }}
          onFocus={() => setSelectedMenuItem(-1)}
          className={`w-full px-3 py-2 rounded-lg transition-all duration-200 text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 ${
            selectedMenuItem === (filesDropdownOpen ? 13 : 8)
              ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
              : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
