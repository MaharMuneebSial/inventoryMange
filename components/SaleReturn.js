'use client';

import { useState, useEffect, useRef } from 'react';

export default function SaleReturn() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Invoice lookup
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [saleData, setSaleData] = useState(null);
  const [saleItems, setSaleItems] = useState([]);
  const [previousReturns, setPreviousReturns] = useState([]);

  // Selected items with checkboxes (no cart needed)
  const [selectedItems, setSelectedItems] = useState({});

  // Refund details
  const [refundMethod, setRefundMethod] = useState('cash');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // User info
  const [returnedBy, setReturnedBy] = useState('');

  // Sale returns list
  const [saleReturns, setSaleReturns] = useState([]);
  const [expandedReturnId, setExpandedReturnId] = useState(null);
  const [returnItems, setReturnItems] = useState({});

  // Keyboard navigation states
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [focusMode, setFocusMode] = useState('invoice'); // 'invoice', 'table', 'refund', 'recent'

  const invoiceInputRef = useRef(null);
  const lookupButtonRef = useRef(null);

  useEffect(() => {
    loadUserInfo();
    loadSaleReturns();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, type: '', message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Calculate selectedCount before keyboard navigation useEffect
  const selectedCount = Object.keys(selectedItems).length;

  // Global keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;

      // Escape: Return to invoice input
      if (e.key === 'Escape') {
        if (invoiceInputRef.current) {
          invoiceInputRef.current.focus();
          setFocusMode('invoice');
        }
        return;
      }

      // F2: Focus on table (first checkbox)
      if (e.key === 'F2') {
        e.preventDefault();
        if (saleItems.length > 0) {
          const firstCheckbox = document.querySelector('input[type="checkbox"]:not(:disabled)');
          if (firstCheckbox) {
            firstCheckbox.focus();
            setFocusMode('table');
            setSelectedRowIndex(0);
          }
        }
        return;
      }

      // F3: Focus on refund method
      if (e.key === 'F3') {
        e.preventDefault();
        if (selectedCount > 0) {
          const refundSelect = document.querySelector('#refund-method-select');
          if (refundSelect) {
            refundSelect.focus();
            setFocusMode('refund');
          }
        }
        return;
      }

      // F4: Focus on recent returns list
      if (e.key === 'F4') {
        e.preventDefault();
        if (!saleData && saleReturns.length > 0) {
          setFocusMode('recent');
          setSelectedRowIndex(0);
        }
        return;
      }

      // Allow Enter on buttons
      if (activeElement.tagName === 'BUTTON' && e.key === 'Enter') {
        return;
      }

      // Arrow keys for invoice input and lookup button
      if (focusMode === 'invoice' && (activeElement === invoiceInputRef.current || activeElement === lookupButtonRef.current)) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (activeElement === invoiceInputRef.current && lookupButtonRef.current) {
            lookupButtonRef.current.focus();
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (activeElement === lookupButtonRef.current && invoiceInputRef.current) {
            invoiceInputRef.current.focus();
          }
        }
        return;
      }

      // Table navigation with arrow keys
      if (focusMode === 'table' && saleItems.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = Math.min(selectedRowIndex + 1, saleItems.length - 1);
          setSelectedRowIndex(nextIndex);
          const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]:not(:disabled)'));
          if (checkboxes[nextIndex]) {
            checkboxes[nextIndex].focus();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = Math.max(selectedRowIndex - 1, 0);
          setSelectedRowIndex(prevIndex);
          const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]:not(:disabled)'));
          if (checkboxes[prevIndex]) {
            checkboxes[prevIndex].focus();
          }
        } else if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
          e.preventDefault();
          const item = saleItems[selectedRowIndex];
          if (item && item.can_return) {
            toggleItemSelection(item);
          }
        }
        return;
      }

      // Recent returns navigation
      if (focusMode === 'recent' && saleReturns.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedRowIndex((prev) => Math.min(prev + 1, saleReturns.slice(0, 5).length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedRowIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const returnRecord = saleReturns[selectedRowIndex];
          if (returnRecord) {
            toggleReturnDetails(returnRecord.return_id);
          }
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, selectedRowIndex, saleItems, saleReturns, saleData, selectedCount]);

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

  const loadSaleReturns = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.getSaleReturns();
      if (result.success) {
        setSaleReturns(result.data);
      }
    }
  };

  const loadReturnItems = async (returnId) => {
    if (returnItems[returnId]) return;

    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.getSaleReturnItems(returnId);
      if (result.success) {
        setReturnItems({ ...returnItems, [returnId]: result.data });
      }
    }
  };

  const handleInvoiceLookup = async () => {
    if (!invoiceNumber.trim()) {
      showToast('error', 'Please enter an invoice number');
      return;
    }

    setLoading(true);
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.getSaleByInvoice(invoiceNumber.trim());

        if (result.success) {
          setSaleData(result.data.sale);
          setSaleItems(result.data.items);
          setPreviousReturns(result.data.previousReturns || []);
          setSelectedItems({});

          const hasReturns = result.data.previousReturns && result.data.previousReturns.length > 0;
          const allReturned = result.data.items.every((item) => !item.can_return);

          if (allReturned) {
            showToast('error', 'All items from this invoice have already been returned!');
          } else if (hasReturns) {
            showToast('success', 'Invoice found! Some items have been previously returned.');
          } else {
            showToast('success', 'Invoice found! Select items to return.');
          }
        } else {
          showToast('error', result.error || 'Invoice not found');
          setSaleData(null);
          setSaleItems([]);
          setPreviousReturns([]);
        }
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (item) => {
    if (!item.can_return) return;

    const key = `${item.product_id}_${item.unit}`;
    if (selectedItems[key]) {
      const newSelected = { ...selectedItems };
      delete newSelected[key];
      setSelectedItems(newSelected);
    } else {
      setSelectedItems({
        ...selectedItems,
        [key]: {
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.remaining_quantity,
          unit: item.unit,
          rate_per_unit: item.rate_per_unit,
          max_quantity: item.remaining_quantity
        }
      });
    }
  };

  const updateQuantity = (key, value) => {
    const item = selectedItems[key];

    // Allow empty input while typing
    if (value === '' || value === null || value === undefined) {
      setSelectedItems({
        ...selectedItems,
        [key]: { ...item, quantity: '' }
      });
      return;
    }

    const qtyValue = parseFloat(value);

    // Validate numeric input
    if (isNaN(qtyValue) || qtyValue <= 0) {
      showToast('error', 'Quantity must be greater than 0');
      return;
    }

    if (qtyValue > item.max_quantity) {
      showToast('error', `Maximum quantity available: ${item.max_quantity}`);
      return;
    }

    setSelectedItems({
      ...selectedItems,
      [key]: { ...item, quantity: qtyValue }
    });
  };

  // Handle arrow key navigation between quantity inputs
  const handleQuantityKeyDown = (e, currentKey) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Enter') {
      e.preventDefault();

      const selectedKeys = Object.keys(selectedItems);
      const currentIndex = selectedKeys.indexOf(currentKey);

      let nextIndex;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'Enter') {
        nextIndex = currentIndex + 1;

        // If this is the last item, move to refund method
        if (nextIndex >= selectedKeys.length) {
          const refundMethodSelect = document.querySelector('#refund-method-select');
          if (refundMethodSelect) {
            refundMethodSelect.focus();
            setFocusMode('refund');
          }
          return;
        }
      } else {
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) {
          // Move back to table checkboxes
          const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]:not(:disabled)'));
          if (checkboxes.length > 0) {
            checkboxes[0].focus();
            setFocusMode('table');
            setSelectedRowIndex(0);
          }
          return;
        }
      }

      const nextKey = selectedKeys[nextIndex];
      if (nextKey) {
        const nextInput = document.querySelector(`input[data-key="${nextKey}"]`);
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
    }
  };

  // Handle keyboard navigation for refund details fields
  const handleRefundFieldKeyDown = (e, currentField) => {
    if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();

      if (currentField === 'refund-method') {
        const reasonSelect = document.querySelector('#return-reason-select');
        if (reasonSelect) {
          reasonSelect.focus();
        }
      } else if (currentField === 'return-reason') {
        const notesInput = document.querySelector('#notes-input');
        if (notesInput) {
          notesInput.focus();
        }
      } else if (currentField === 'notes') {
        const clearBtn = document.querySelector('#clear-btn');
        if (clearBtn) {
          clearBtn.focus();
        }
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();

      if (currentField === 'return-reason') {
        const refundSelect = document.querySelector('#refund-method-select');
        if (refundSelect) {
          refundSelect.focus();
        }
      } else if (currentField === 'notes') {
        const reasonSelect = document.querySelector('#return-reason-select');
        if (reasonSelect) {
          reasonSelect.focus();
        }
      } else if (currentField === 'refund-method') {
        // Move back to quantity inputs
        const quantityInputs = Array.from(document.querySelectorAll('input[data-key]'));
        if (quantityInputs.length > 0) {
          const lastInput = quantityInputs[quantityInputs.length - 1];
          lastInput.focus();
          lastInput.select();
        }
      }
    }
  };

  const calculateTotalReturnAmount = () => {
    return Object.values(selectedItems).reduce(
      (sum, item) => {
        const qty = parseFloat(item.quantity) || 0;
        return sum + qty * item.rate_per_unit;
      },
      0
    );
  };

  const clearReturn = () => {
    setInvoiceNumber('');
    setSaleData(null);
    setSaleItems([]);
    setPreviousReturns([]);
    setSelectedItems({});
    setReason('');
    setNotes('');
    if (invoiceInputRef.current) {
      invoiceInputRef.current.focus();
    }
  };

  const processReturn = async () => {
    if (!saleData) {
      showToast('error', 'Please lookup an invoice first');
      return;
    }

    const selectedCount = Object.keys(selectedItems).length;
    if (selectedCount === 0) {
      showToast('error', 'Please select items to return');
      return;
    }

    // Validate all quantities are valid numbers
    const hasInvalidQuantity = Object.values(selectedItems).some(
      (item) => !item.quantity || parseFloat(item.quantity) <= 0
    );
    if (hasInvalidQuantity) {
      showToast('error', 'Please enter valid quantities for all selected items');
      return;
    }

    setLoading(true);

    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const totalReturnAmount = calculateTotalReturnAmount();

        const returnData = {
          original_sale_id: saleData.sale_id,
          return_date: new Date().toISOString().split('T')[0],
          return_time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          total_return_amount: totalReturnAmount,
          refund_amount: totalReturnAmount,
          refund_method: refundMethod,
          returned_by: returnedBy,
          reason,
          notes,
          items: Object.values(selectedItems).map((item) => {
            const qty = parseFloat(item.quantity);
            return {
              product_id: item.product_id,
              quantity: qty,
              unit: item.unit,
              rate_per_unit: item.rate_per_unit,
              line_total: qty * item.rate_per_unit
            };
          })
        };

        const result = await window.electronAPI.processSaleReturn(returnData);

        if (result.success) {
          showToast('success', `Sale return processed! Return ID: ${result.return_id}`);
          clearReturn();
          loadSaleReturns();
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

  const toggleReturnDetails = async (returnId) => {
    if (expandedReturnId === returnId) {
      setExpandedReturnId(null);
    } else {
      setExpandedReturnId(returnId);
      await loadReturnItems(returnId);
    }
  };

  const totalReturnAmount = calculateTotalReturnAmount();

  return (
    <div className="h-full flex flex-col">
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
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
              />
            </svg>
          </div>
          Sale Return
        </h2>
      </div>

      {/* Main Content - Single Column */}
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        {/* Invoice Lookup */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-2 rounded-lg border border-indigo-100">
          <div className="flex gap-2">
            <input
              ref={invoiceInputRef}
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvoiceLookup()}
              onFocus={() => setFocusMode('invoice')}
              className="flex-1 px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter invoice number (e.g., SALE-2025-000001)"
              autoFocus
            />
            <button
              ref={lookupButtonRef}
              onClick={handleInvoiceLookup}
              disabled={loading}
              onFocus={() => setFocusMode('invoice')}
              className="px-4 py-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-md hover:from-teal-700 hover:to-cyan-700 transition text-xs font-semibold disabled:opacity-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {loading ? 'Loading...' : 'Lookup'}
            </button>
          </div>
        </div>

        {/* Sale Details & Previous Returns */}
        {saleData && (
          <div className="bg-white p-2 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <div className="flex gap-4">
                <span className="text-gray-600">Invoice: <span className="font-bold text-gray-900">{saleData.invoice_number}</span></span>
                <span className="text-gray-600">Date: <span className="font-medium">{saleData.sale_date}</span></span>
                <span className="text-gray-600">Total: <span className="font-bold text-teal-600">Rs. {saleData.grand_total.toFixed(2)}</span></span>
                <span className="text-gray-600">Paid via: <span className="font-medium capitalize">{saleData.payment_method}</span></span>
              </div>
              {previousReturns.length > 0 && (
                <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {previousReturns.length} Previous Return{previousReturns.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sale Items Table */}
        {saleItems.length > 0 && (
          <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col min-h-0">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-1.5 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white">Select Items to Return</h3>
              {selectedCount > 0 && (
                <span className="text-xs font-semibold text-white bg-white/20 px-2 py-0.5 rounded">
                  {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5 text-center text-xs font-bold text-gray-700 uppercase w-8">Select</th>
                    <th className="px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase">Product Name</th>
                    <th className="px-2 py-1.5 text-center text-xs font-bold text-gray-700 uppercase w-20">Sold Qty</th>
                    <th className="px-2 py-1.5 text-center text-xs font-bold text-gray-700 uppercase w-20">Already Returned</th>
                    <th className="px-2 py-1.5 text-center text-xs font-bold text-gray-700 uppercase w-24">Return Qty</th>
                    <th className="px-2 py-1.5 text-right text-xs font-bold text-gray-700 uppercase w-20">Rate</th>
                    <th className="px-2 py-1.5 text-right text-xs font-bold text-gray-700 uppercase w-24">Refund</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {saleItems.map((item, index) => {
                    const key = `${item.product_id}_${item.unit}`;
                    const isSelected = !!selectedItems[key];
                    const selectedQty = selectedItems[key]?.quantity || 0;
                    const refundAmount = selectedQty * item.rate_per_unit;

                    return (
                      <tr
                        key={index}
                        className={`${
                          !item.can_return
                            ? 'bg-gray-100 opacity-50'
                            : isSelected
                            ? 'bg-teal-50'
                            : 'hover:bg-gray-50'
                        } ${
                          focusMode === 'table' && selectedRowIndex === index
                            ? 'ring-2 ring-teal-400'
                            : ''
                        }`}
                      >
                        <td className="px-2 py-1.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleItemSelection(item)}
                            onFocus={() => {
                              setFocusMode('table');
                              setSelectedRowIndex(index);
                            }}
                            disabled={!item.can_return}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-2 focus:ring-teal-500 disabled:opacity-50 cursor-pointer"
                          />
                        </td>
                        <td className="px-2 py-1.5 text-xs text-gray-900">
                          {item.product_name}
                          {!item.can_return && (
                            <span className="ml-1 text-xs text-red-600 font-semibold">(Fully Returned)</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-xs text-center text-gray-900">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-2 py-1.5 text-xs text-center text-red-600 font-medium">
                          {item.total_returned > 0 ? `${item.total_returned} ${item.unit}` : '-'}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          {isSelected ? (
                            <input
                              type="number"
                              value={selectedQty}
                              onChange={(e) => updateQuantity(key, e.target.value)}
                              onKeyDown={(e) => handleQuantityKeyDown(e, key)}
                              onFocus={(e) => {
                                e.target.select();
                                setFocusMode('quantity');
                              }}
                              data-key={key}
                              className="w-20 px-1.5 py-0.5 text-xs text-center border border-teal-300 rounded focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                              step="0.001"
                              max={item.remaining_quantity}
                            />
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-xs text-right text-gray-900">Rs. {item.rate_per_unit.toFixed(2)}</td>
                        <td className="px-2 py-1.5 text-xs text-right font-bold text-teal-600">
                          {isSelected ? `Rs. ${refundAmount.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Refund Details - Only show when items selected */}
        {selectedCount > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border-2 border-teal-200">
            <div className="grid grid-cols-12 gap-3">
              {/* Total Return Amount */}
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Total Refund</label>
                <div className="px-3 py-2 bg-white rounded-md border-2 border-teal-300">
                  <div className="text-lg font-bold text-teal-600">Rs. {totalReturnAmount.toFixed(2)}</div>
                </div>
              </div>

              {/* Refund Method */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Refund Method</label>
                <select
                  id="refund-method-select"
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  onKeyDown={(e) => handleRefundFieldKeyDown(e, 'refund-method')}
                  onFocus={() => setFocusMode('refund')}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                  <option value="credit">Credit</option>
                </select>
              </div>

              {/* Return Reason */}
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Return Reason (Optional)</label>
                <select
                  id="return-reason-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  onKeyDown={(e) => handleRefundFieldKeyDown(e, 'return-reason')}
                  onFocus={() => setFocusMode('refund')}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  <option value="">Select reason...</option>
                  <option value="defective">Defective/Damaged</option>
                  <option value="wrong_item">Wrong Item Received</option>
                  <option value="expired">Expired Product</option>
                  <option value="customer_request">Customer Changed Mind</option>
                  <option value="quality_issue">Quality Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Notes */}
              <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <input
                  id="notes-input"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onKeyDown={(e) => handleRefundFieldKeyDown(e, 'notes')}
                  onFocus={() => setFocusMode('refund')}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex gap-2 justify-end">
              <button
                id="clear-btn"
                onClick={clearReturn}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const processBtn = document.querySelector('#process-return-btn');
                    if (processBtn) processBtn.focus();
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const notesInput = document.querySelector('#notes-input');
                    if (notesInput) {
                      notesInput.focus();
                      setFocusMode('refund');
                    }
                  }
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-xs font-semibold focus:ring-2 focus:ring-gray-400 focus:outline-none"
              >
                Clear
              </button>
              <button
                id="process-return-btn"
                onClick={processReturn}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const clearBtn = document.querySelector('#clear-btn');
                    if (clearBtn) clearBtn.focus();
                  }
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                {loading ? 'Processing...' : 'Process Return'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Recent Returns - Compact List at Bottom */}
        {!saleData && saleReturns.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-48">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-1.5">
              <h3 className="text-xs font-semibold text-white">Recent Returns ({saleReturns.length})</h3>
            </div>
            <div className="overflow-y-auto max-h-40 p-2">
              <div className="space-y-1">
                {saleReturns.slice(0, 5).map((returnRecord, index) => (
                  <div
                    key={returnRecord.return_id}
                    className={`flex items-center justify-between p-1.5 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 cursor-pointer transition text-xs ${
                      focusMode === 'recent' && selectedRowIndex === index
                        ? 'ring-2 ring-teal-400 bg-teal-50'
                        : ''
                    }`}
                    onClick={() => toggleReturnDetails(returnRecord.return_id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{returnRecord.return_id}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-gray-600">{returnRecord.original_sale_id}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">{returnRecord.return_date}</span>
                    </div>
                    <span className="font-bold text-teal-600">Rs. {returnRecord.refund_amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}