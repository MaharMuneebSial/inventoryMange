'use client';

import { useState, useEffect, useRef } from 'react';

export default function PurchaseReturn() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Purchased items list
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Return details
  const [returnQuantity, setReturnQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // User info
  const [returnedBy, setReturnedBy] = useState('');

  // Purchase returns list
  const [purchaseReturns, setPurchaseReturns] = useState([]);

  // Refs
  const searchInputRef = useRef(null);
  const quantityInputRef = useRef(null);

  useEffect(() => {
    loadUserInfo();
    loadPurchasedItems();
    loadPurchaseReturns();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, type: '', message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const loadUserInfo = () => {
    const userData = localStorage.getItem('inventoryUser');
    if (userData) {
      const user = JSON.parse(userData);
      setReturnedBy(user.username || user.email || 'Unknown');
    }
  };

  const loadPurchasedItems = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.getPurchases();
      if (result.success) {
        // Map the purchases data and calculate returned quantities
        const items = result.data.map(purchase => ({
          ...purchase,
          item_id: purchase.id,
          purchase_id: purchase.id,
          product_name: purchase.product_name,
          sku: purchase.item_barcode,
          supplier_name: purchase.supplier_name,
          category_name: purchase.category_name,
          quantity: purchase.quantity || 0,
          unit: purchase.unit || 'pcs',
          rate_per_unit: purchase.purchase_price || 0,
          total_returned: 0, // Will calculate from returns
          remaining_quantity: purchase.quantity || 0 // Will subtract returns
        }));
        setPurchasedItems(items);
      }
    }
  };

  const loadPurchaseReturns = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.getPurchaseReturns();
      if (result.success) {
        setPurchaseReturns(result.data);
      }
    }
  };

  const filteredItems = purchasedItems.filter(item => {
    const search = searchQuery.toLowerCase();
    return (
      item.product_name?.toLowerCase().includes(search) ||
      item.sku?.toLowerCase().includes(search) ||
      item.supplier_name?.toLowerCase().includes(search)
    );
  });

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setSearchQuery('');
    setReturnQuantity(''); // Don't auto-fill - user must enter intentionally
    setTimeout(() => {
      if (quantityInputRef.current) {
        quantityInputRef.current.focus();
      }
    }, 100);
  };

  const calculateTotalCredit = () => {
    if (!selectedItem || !returnQuantity) return 0;
    const qty = parseFloat(returnQuantity) || 0;
    return qty * selectedItem.rate_per_unit;
  };

  const clearReturn = () => {
    setSelectedItem(null);
    setSearchQuery('');
    setReturnQuantity('');
    setReason('');
    setNotes('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const initiateReturn = () => {
    if (!selectedItem) {
      showToast('error', 'Please select a purchased item');
      return;
    }

    const qty = parseFloat(returnQuantity);
    if (!returnQuantity || qty <= 0) {
      showToast('error', 'Please enter a valid return quantity');
      quantityInputRef.current?.focus();
      return;
    }

    if (qty > selectedItem.remaining_quantity) {
      showToast('error', `Maximum quantity available: ${selectedItem.remaining_quantity}`);
      quantityInputRef.current?.focus();
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const processReturn = async () => {
    setShowConfirmDialog(false);
    setLoading(true);

    const qty = parseFloat(returnQuantity);

    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const totalCreditAmount = calculateTotalCredit();

        const returnData = {
          original_purchase_id: selectedItem.purchase_id,
          return_date: new Date().toISOString().split('T')[0],
          return_time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          total_credit_amount: totalCreditAmount,
          returned_by: returnedBy,
          supplier_id: selectedItem.supplier_id,
          reason,
          notes,
          items: [
            {
              product_id: selectedItem.product_id,
              product_name: selectedItem.product_name,
              quantity: qty,
              unit: selectedItem.unit,
              rate_per_unit: selectedItem.rate_per_unit,
              line_total: totalCreditAmount
            }
          ]
        };

        const result = await window.electronAPI.processPurchaseReturn(returnData);

        if (result.success) {
          showToast('success', `Return processed! Return ID: ${result.return_id}, Credit: Rs. ${totalCreditAmount.toFixed(2)}`);
          clearReturn();
          loadPurchasedItems();
          loadPurchaseReturns();
        } else {
          showToast('error', result.error || 'Failed to process return');
        }
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalCreditAmount = calculateTotalCredit();

  return (
    <div className="h-full flex flex-col">
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-teal-100 rounded-full">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirm Purchase Return</h3>
                <p className="text-sm text-gray-600">Please verify the return details</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-semibold text-gray-900">{selectedItem?.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Supplier:</span>
                <span className="font-semibold text-gray-900">{selectedItem?.supplier_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Return Quantity:</span>
                <span className="font-bold text-teal-600">{returnQuantity} {selectedItem?.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rate per Unit:</span>
                <span className="font-semibold text-gray-900">Rs. {selectedItem?.rate_per_unit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="text-gray-900 font-semibold">Total Credit:</span>
                <span className="font-bold text-green-600 text-lg">Rs. {calculateTotalCredit().toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={processReturn}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Confirm Return'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div
            className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : toast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {toast.type === 'success' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <p className="text-xs font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          Purchase Return
        </h2>
        <div className="text-xs text-gray-600">
          {purchasedItems.length} Purchased Items Available for Return
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        {/* Left Column: Product Selection */}
        <div className="flex flex-col gap-2 min-h-0">
          {/* Search Box */}
          <div className="bg-white p-2 rounded-lg border border-gray-200">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Search by product name, SKU, or supplier..."
              autoFocus
            />
          </div>

          {/* Selected Item Display */}
          {selectedItem && (
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-3 rounded-lg border-2 border-teal-300">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-900 mb-1">{selectedItem.product_name}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    {selectedItem.sku && (
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-teal-200">
                        {selectedItem.sku}
                      </span>
                    )}
                    <span className="text-teal-600 font-semibold">{selectedItem.supplier_name}</span>
                  </div>
                </div>
                <button
                  onClick={clearReturn}
                  className="text-red-600 hover:bg-red-50 p-1 rounded transition"
                  title="Clear selection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2 rounded border border-teal-200">
                  <div className="text-gray-600">Purchased</div>
                  <div className="font-bold text-gray-900">{selectedItem.quantity} {selectedItem.unit}</div>
                </div>
                <div className="bg-white p-2 rounded border border-teal-200">
                  <div className="text-gray-600">Returned</div>
                  <div className="font-bold text-red-600">{selectedItem.total_returned} {selectedItem.unit}</div>
                </div>
                <div className="bg-white p-2 rounded border border-teal-200">
                  <div className="text-gray-600">Available</div>
                  <div className="font-bold text-teal-600">{selectedItem.remaining_quantity} {selectedItem.unit}</div>
                </div>
              </div>
              <div className="mt-2 text-xs bg-white p-2 rounded border border-teal-200">
                <span className="text-gray-600">Rate:</span> <span className="font-bold text-gray-900">Rs. {selectedItem.rate_per_unit.toFixed(2)} / {selectedItem.unit}</span>
              </div>
            </div>
          )}

          {/* Product List Dropdown */}
          <div className="flex-1 bg-white rounded-lg border-2 border-gray-300 overflow-hidden flex flex-col min-h-0">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-2 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white">Select Purchased Item</h3>
              <span className="text-xs text-white bg-white/20 px-2 py-0.5 rounded">
                {filteredItems.length} items
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-xs">
                  {searchQuery ? `No items found for "${searchQuery}"` : 'No purchased items available for return'}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.item_id}
                    onClick={() => handleItemSelect(item)}
                    className={`p-2 border-b border-gray-100 cursor-pointer transition-colors hover:bg-teal-50 ${
                      selectedItem?.item_id === item.item_id ? 'bg-teal-100 border-l-4 border-l-teal-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-semibold text-xs text-gray-900">{item.product_name}</div>
                      {item.sku && (
                        <span className="text-xs font-mono text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                          {item.sku}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span>{item.supplier_name}</span>
                        <span className="text-teal-600 font-semibold">
                          {item.remaining_quantity} {item.unit} available
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span>Purchase #{item.purchase_id}</span>
                        <span>•</span>
                        <span>{item.purchase_date}</span>
                        <span>•</span>
                        <span>Rs. {item.rate_per_unit.toFixed(2)}/{item.unit}</span>
                      </div>
                      {(item.mfg_date || item.exp_date) && (
                        <div className="flex items-center gap-3 mt-1">
                          {item.mfg_date && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                              MFG: {item.mfg_date}
                            </span>
                          )}
                          {item.exp_date && (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              new Date(item.exp_date) < new Date()
                                ? 'bg-red-100 text-red-700 font-semibold'
                                : new Date(item.exp_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-50 text-green-700'
                            }`}>
                              EXP: {item.exp_date}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Return Details */}
        <div className="flex flex-col gap-2 min-h-0">
          {selectedItem ? (
            <>
              {/* Return Form */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-xs font-bold text-gray-800 mb-3">Return Details</h3>

                <div className="space-y-3">
                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Return Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={quantityInputRef}
                      type="number"
                      value={returnQuantity}
                      onChange={(e) => setReturnQuantity(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="0"
                      step="0.001"
                      max={selectedItem.remaining_quantity}
                    />
                    <div className="mt-1 text-xs text-gray-600">
                      Maximum: {selectedItem.remaining_quantity} {selectedItem.unit}
                    </div>
                  </div>

                  {/* Total Credit */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Total Credit Amount</label>
                    <div className="px-3 py-2 bg-teal-50 rounded-md border-2 border-teal-300">
                      <div className="text-xl font-bold text-teal-600">Rs. {totalCreditAmount.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Return Reason</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                      <option value="">Select reason...</option>
                      <option value="expired">Expired Product</option>
                      <option value="defective">Defective/Damaged</option>
                      <option value="wrong_item">Wrong Item</option>
                      <option value="quality_issue">Quality Issue</option>
                      <option value="overstock">Overstock</option>
                      <option value="supplier_unavailable">Supplier Not Available</option>
                      <option value="bill_lost">Bill/Receipt Lost</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                      placeholder="Additional notes about the return..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={clearReturn}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-xs font-semibold"
                  >
                    Clear
                  </button>
                  <button
                    onClick={initiateReturn}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing...' : 'Process Return'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm font-medium">Select a purchased item from the list</p>
                <p className="text-xs mt-1">Search by name, SKU, or supplier</p>
              </div>
            </div>
          )}

          {/* Recent Returns */}
          {purchaseReturns.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-48">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-1.5">
                <h3 className="text-xs font-semibold text-white">Recent Returns ({purchaseReturns.length})</h3>
              </div>
              <div className="overflow-y-auto max-h-32 p-2">
                <div className="space-y-1">
                  {purchaseReturns.slice(0, 5).map((returnRecord) => (
                    <div
                      key={returnRecord.return_id}
                      className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-600">#{returnRecord.return_id}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">{returnRecord.supplier_name}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">{returnRecord.return_date}</span>
                      </div>
                      <span className="font-bold text-teal-600">Rs. {returnRecord.total_credit_amount?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
