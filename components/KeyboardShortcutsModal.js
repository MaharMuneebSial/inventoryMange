'use client';

import { useState, useEffect } from 'react';

/**
 * Keyboard Shortcuts Help Modal
 * Shows when user presses F1 or when triggered manually
 */
export default function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShowHelp = () => {
      setIsOpen(true);
    };

    window.addEventListener('show-keyboard-help', handleShowHelp);
    return () => window.removeEventListener('show-keyboard-help', handleShowHelp);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-2xl font-bold">Keyboard Shortcuts Guide</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Global Navigation */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Global Navigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ShortcutItem keys={['Ctrl', 'D']} description="Open Dashboard" />
              <ShortcutItem keys={['Ctrl', 'P']} description="Open Purchase page" />
              <ShortcutItem keys={['Ctrl', 'Shift', 'S']} description="Open Sale page" />
              <ShortcutItem keys={['Ctrl', 'Shift', 'N']} description="New Product Entry" />
              <ShortcutItem keys={['Ctrl', 'Shift', 'L']} description="Open Sales List" />
              <ShortcutItem keys={['Ctrl', 'Shift', 'P']} description="Open Purchase List" />
              <ShortcutItem keys={['Ctrl', 'Shift', 'R']} description="Sale Return" />
              <ShortcutItem keys={['F1']} description="Show this help" />
            </div>
          </section>

          {/* Form Navigation */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Form Navigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ShortcutItem keys={['Tab']} description="Move to next field" />
              <ShortcutItem keys={['Shift', 'Tab']} description="Move to previous field" />
              <ShortcutItem keys={['Shift', '→']} description="Move to next field" />
              <ShortcutItem keys={['Shift', '←']} description="Move to previous field" />
              <ShortcutItem keys={['Enter']} description="Move to next field or submit" />
              <ShortcutItem keys={['Escape']} description="Cancel/Clear form" />
            </div>
          </section>

          {/* Form Actions */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Form Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ShortcutItem keys={['Ctrl', 'Enter']} description="Submit/Save form" />
              <ShortcutItem keys={['Ctrl', 'N']} description="New/Clear form" />
              <ShortcutItem keys={['Escape']} description="Cancel action" />
            </div>
          </section>

          {/* Table/List Navigation */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Table/List Navigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ShortcutItem keys={['Shift', '↑']} description="Navigate up in table" />
              <ShortcutItem keys={['Shift', '↓']} description="Navigate down in table" />
              <ShortcutItem keys={['Ctrl', 'E']} description="Edit selected item" />
              <ShortcutItem keys={['Delete']} description="Delete selected item" />
              <ShortcutItem keys={['Ctrl', 'F']} description="Focus search field" />
              <ShortcutItem keys={['Page Up']} description="Previous page" />
              <ShortcutItem keys={['Page Down']} description="Next page" />
              <ShortcutItem keys={['Home']} description="First page" />
              <ShortcutItem keys={['End']} description="Last page" />
            </div>
          </section>

          {/* Dropdown Navigation */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Dropdown Navigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ShortcutItem keys={['↓']} description="Open dropdown or next item" />
              <ShortcutItem keys={['↑']} description="Previous item in dropdown" />
              <ShortcutItem keys={['Enter']} description="Select highlighted item" />
              <ShortcutItem keys={['Escape']} description="Close dropdown" />
              <ShortcutItem keys={['Type...']} description="Filter dropdown items" />
            </div>
          </section>

          {/* Page-Specific Shortcuts */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Page-Specific Shortcuts</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Purchase/Sale Pages</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ShortcutItem keys={['F2']} description="Open packaging calculator" />
                  <ShortcutItem keys={['F3']} description="Focus on search product" />
                  <ShortcutItem keys={['F4']} description="Add to list" />
                  <ShortcutItem keys={['F5']} description="Refresh/Clear form" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Dashboard</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ShortcutItem keys={['Ctrl', '1']} description="Category tab" />
                  <ShortcutItem keys={['Ctrl', '2']} description="Sub-Category tab" />
                  <ShortcutItem keys={['Ctrl', '3']} description="Brand tab" />
                  <ShortcutItem keys={['Ctrl', '4']} description="Supplier tab" />
                  <ShortcutItem keys={['Ctrl', '5']} description="Unit tab" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t rounded-b-lg">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Press F1 anytime to show this guide</p>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Shortcut Item Component
 */
function ShortcutItem({ keys, description }) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
      <div className="flex gap-1 flex-wrap">
        {keys.map((key, index) => (
          <span key={index}>
            <kbd className="px-2 py-1 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded shadow-sm">
              {key}
            </kbd>
            {index < keys.length - 1 && <span className="mx-1 text-gray-400">+</span>}
          </span>
        ))}
      </div>
      <span className="text-sm text-gray-700 ml-4">{description}</span>
    </div>
  );
}
