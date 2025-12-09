'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Sidebar({ activePage = '' }) {
  // Auto-open Files dropdown if user is on dashboard or any Initial System Setup page
  const isDashboardPage = activePage === 'dashboard' || activePage === '';
  const [filesDropdownOpen, setFilesDropdownOpen] = useState(isDashboardPage);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(-1);
  const router = useRouter();
  const sidebarRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('inventoryUser');
    router.push('/');
  };

  // Define all menu items in order
  const menuItems = [
    { type: 'dropdown', label: 'Initial System Setup' },
    ...(filesDropdownOpen ? [
      { type: 'link', label: 'Category', path: '/dashboard' },
      { type: 'link', label: 'Sub-Category', path: '/dashboard' },
      { type: 'link', label: 'Brand', path: '/dashboard' },
      { type: 'link', label: 'Supplier', path: '/dashboard' },
      { type: 'link', label: 'Unit', path: '/dashboard' },
    ] : []),
    { type: 'link', label: 'New Product', path: '/product-entry' },
    { type: 'link', label: 'Sale', path: '/sale' },
    { type: 'link', label: 'Total Sales', path: '/sales-list' },
    { type: 'link', label: 'Sale Return', path: '/sale-return' },
    { type: 'link', label: 'Return History', path: '/sale-return-list' },
    { type: 'link', label: 'Purchase', path: '/purchase' },
    { type: 'link', label: 'Total Purchases', path: '/purchase-list' },
    { type: 'link', label: 'Logout', path: null },
  ];

  // Keyboard navigation for sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if focus is in sidebar
      const isInSidebar = sidebarRef.current?.contains(document.activeElement);

      if (!isInSidebar && selectedMenuIndex === -1) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMenuIndex(prev => {
          const newIndex = prev < menuItems.length - 1 ? prev + 1 : prev;
          // Scroll to selected item and focus it
          setTimeout(() => {
            const buttons = sidebarRef.current?.querySelectorAll('button');
            if (buttons && buttons[newIndex]) {
              buttons[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              buttons[newIndex].focus();
            }
          }, 0);
          return newIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMenuIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : 0;
          // Scroll to selected item and focus it
          setTimeout(() => {
            const buttons = sidebarRef.current?.querySelectorAll('button');
            if (buttons && buttons[newIndex]) {
              buttons[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              buttons[newIndex].focus();
            }
          }, 0);
          return newIndex;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();

        // If a button in sidebar is focused, click it
        if (isInSidebar && document.activeElement.tagName === 'BUTTON') {
          document.activeElement.click();
        } else if (selectedMenuIndex >= 0) {
          // Fallback to using selectedMenuIndex
          const selectedItem = menuItems[selectedMenuIndex];

          if (selectedItem.type === 'dropdown') {
            setFilesDropdownOpen(!filesDropdownOpen);
          } else if (selectedItem.type === 'link') {
            if (selectedItem.label === 'Logout') {
              handleLogout();
            } else if (selectedItem.path) {
              router.push(selectedItem.path);
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedMenuIndex, menuItems.length, filesDropdownOpen, router]);

  return (
    <div ref={sidebarRef} className="w-56 h-screen bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl flex flex-col">
      {/* Sidebar Navigation - Compact */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto min-h-0">
        {/* Files Dropdown */}
        <div className="space-y-0.5">
          <button
            onClick={() => setFilesDropdownOpen(!filesDropdownOpen)}
            onFocus={() => setSelectedMenuIndex(0)}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700/50 rounded-lg transition-all duration-200 ${
              selectedMenuIndex === 0 ? 'ring-2 ring-yellow-400 bg-slate-700/50' : ''
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
                onClick={() => router.push('/dashboard')}
                onFocus={() => setSelectedMenuIndex(1)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all duration-200 text-slate-400 hover:bg-slate-700/50 hover:text-white ${
                  selectedMenuIndex === 1 ? 'ring-2 ring-yellow-400 bg-slate-700/50' : ''
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
                onClick={() => router.push('/dashboard')}
                onFocus={() => setSelectedMenuIndex(2)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all duration-200 text-slate-400 hover:bg-slate-700/50 hover:text-white ${
                  selectedMenuIndex === 2 ? 'ring-2 ring-yellow-400 bg-slate-700/50' : ''
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
                onClick={() => router.push('/dashboard')}
                onFocus={() => setSelectedMenuIndex(3)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all duration-200 text-slate-400 hover:bg-slate-700/50 hover:text-white ${
                  selectedMenuIndex === 3 ? 'ring-2 ring-yellow-400 bg-slate-700/50' : ''
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
                onClick={() => router.push('/dashboard')}
                onFocus={() => setSelectedMenuIndex(4)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all duration-200 text-slate-400 hover:bg-slate-700/50 hover:text-white ${
                  selectedMenuIndex === 4 ? 'ring-2 ring-yellow-400 bg-slate-700/50' : ''
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
                onClick={() => router.push('/dashboard')}
                onFocus={() => setSelectedMenuIndex(5)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-all duration-200 text-slate-400 hover:bg-slate-700/50 hover:text-white ${
                  selectedMenuIndex === 5 ? 'ring-2 ring-yellow-400 bg-slate-700/50' : ''
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
          onClick={() => router.push('/product-entry')}
          onFocus={() => setSelectedMenuIndex(filesDropdownOpen ? 6 : 1)}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activePage === 'product-entry'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          } ${selectedMenuIndex === (filesDropdownOpen ? 6 : 1) ? 'ring-2 ring-yellow-400' : ''}`}
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
          onClick={() => router.push('/sale')}
          onFocus={() => setSelectedMenuIndex(filesDropdownOpen ? 7 : 2)}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activePage === 'sale'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          } ${selectedMenuIndex === (filesDropdownOpen ? 7 : 2) ? 'ring-2 ring-yellow-400' : ''}`}
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
          onClick={() => router.push('/sales-list')}
          onFocus={() => setSelectedMenuIndex(filesDropdownOpen ? 8 : 3)}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activePage === 'sales-list'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          } ${selectedMenuIndex === (filesDropdownOpen ? 8 : 3) ? 'ring-2 ring-yellow-400' : ''}`}
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
          onClick={() => router.push('/sale-return')}
          onFocus={() => setSelectedMenuIndex(filesDropdownOpen ? 9 : 4)}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activePage === 'sale-return'
              ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          } ${selectedMenuIndex === (filesDropdownOpen ? 9 : 4) ? 'ring-2 ring-yellow-400' : ''}`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
            </svg>
            <span>Sale Return</span>
          </div>
        </button>

        {/* Sale Return List */}
        <button
          onClick={() => router.push('/sale-return-list')}
          onFocus={() => setSelectedMenuIndex(filesDropdownOpen ? 10 : 5)}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activePage === 'sale-return-list'
              ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          } ${selectedMenuIndex === (filesDropdownOpen ? 10 : 5) ? 'ring-2 ring-yellow-400' : ''}`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span>Return History</span>
          </div>
        </button>

        {/* Purchase */}
        <button
          onClick={() => router.push('/purchase')}
          onFocus={() => setSelectedMenuIndex(filesDropdownOpen ? 11 : 6)}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activePage === 'purchase'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          } ${selectedMenuIndex === (filesDropdownOpen ? 11 : 6) ? 'ring-2 ring-yellow-400' : ''}`}
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
          onClick={() => router.push('/purchase-list')}
          onFocus={() => setSelectedMenuIndex(filesDropdownOpen ? 12 : 7)}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activePage === 'purchase-list'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          } ${selectedMenuIndex === (filesDropdownOpen ? 12 : 7) ? 'ring-2 ring-yellow-400' : ''}`}
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
      <div className="p-3 border-t border-slate-700 flex-shrink-0">
        <button
          onClick={handleLogout}
          onFocus={() => setSelectedMenuIndex(filesDropdownOpen ? 13 : 8)}
          className={`w-full px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 ${
            selectedMenuIndex === (filesDropdownOpen ? 13 : 8) ? 'ring-2 ring-yellow-400' : ''
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
