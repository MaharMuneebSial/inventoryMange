'use client';

import { useState, useEffect, useRef } from 'react';

export default function PurchaseReturnList() {
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Keyboard navigation state
  const [selectedRow, setSelectedRow] = useState(-1);
  const closeModalButtonRef = useRef(null);

  useEffect(() => {
    loadPurchaseReturns();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Auto-focus close button when modal opens
  useEffect(() => {
    if (showDetailsModal && closeModalButtonRef.current) {
      const timer = setTimeout(() => {
        closeModalButtonRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showDetailsModal]);

  const loadPurchaseReturns = async () => {
    setLoading(true);
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const result = await window.electronAPI.getPurchaseReturns();
        if (result.success) {
          setPurchaseReturns(result.data);
        } else {
          showToast('error', 'Failed to load purchase returns');
        }
      } catch (error) {
        showToast('error', 'Error loading purchase returns');
      }
    }
    setLoading(false);
  };

  const loadReturnItems = async (returnId) => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const result = await window.electronAPI.getPurchaseReturnItems(returnId);
        if (result.success) {
          setReturnItems(result.data);
        }
      } catch (error) {
        showToast('error', 'Error loading return items');
      }
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, message, type });
  };

  const handleViewDetails = async (returnRecord) => {
    setSelectedReturn(returnRecord);
    await loadReturnItems(returnRecord.return_id);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedReturn(null);
    setReturnItems([]);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    return timeStr;
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = purchaseReturns.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(purchaseReturns.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showDetailsModal) return; // Don't navigate when modal is open
      if (loading || currentItems.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedRow(prev => (prev < currentItems.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedRow(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedRow >= 0 && selectedRow < currentItems.length) {
            handleViewDetails(currentItems[selectedRow]);
          }
          break;
        case 'PageDown':
          e.preventDefault();
          if (currentPage < totalPages) {
            paginate(currentPage + 1);
            setSelectedRow(0);
          }
          break;
        case 'PageUp':
          e.preventDefault();
          if (currentPage > 1) {
            paginate(currentPage - 1);
            setSelectedRow(0);
          }
          break;
        case 'Home':
          e.preventDefault();
          setSelectedRow(0);
          break;
        case 'End':
          e.preventDefault();
          setSelectedRow(currentItems.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRow, currentItems, showDetailsModal, loading, currentPage, totalPages]);

  // Calculate totals
  const totalReturns = purchaseReturns.length;
  const totalCreditAmount = purchaseReturns.reduce((sum, ret) => sum + parseFloat(ret.total_credit_amount || 0), 0);
  const uniqueSuppliers = [...new Set(purchaseReturns.map(r => r.supplier_id))].length;
  const averageCredit = totalReturns > 0 ? totalCreditAmount / totalReturns : 0;

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`rounded-md shadow-lg px-3 py-1.5 flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? (
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <p className="text-xs font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Return Details Modal */}
      {showDetailsModal && selectedReturn && (
        <div
          className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              closeModal();
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold">Purchase Return Details - {selectedReturn.return_id}</h3>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Return Information */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Return Date</p>
                  <p className="text-xs font-semibold text-gray-900">{formatDate(selectedReturn.return_date)}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Return Time</p>
                  <p className="text-xs font-semibold text-gray-900">{formatTime(selectedReturn.return_time)}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Original Purchase</p>
                  <p className="text-xs font-semibold text-gray-900">#{selectedReturn.original_purchase_id}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Supplier</p>
                  <p className="text-xs font-semibold text-gray-900">{selectedReturn.supplier_name || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Processed By</p>
                  <p className="text-xs font-semibold text-gray-900">{selectedReturn.processed_by || 'N/A'}</p>
                </div>
                <div className="bg-orange-50 p-2 rounded-lg border border-orange-200">
                  <p className="text-xs text-gray-600 font-medium mb-1">Total Credit</p>
                  <p className="text-sm font-bold text-orange-600">Rs. {parseFloat(selectedReturn.total_credit_amount).toFixed(2)}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 mb-2">Returned Items</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">Qty</th>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">Unit</th>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">Rate</th>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">Credit</th>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {returnItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-xs text-gray-900">{item.product_name}</td>
                          <td className="px-2 py-1.5 text-xs text-gray-900">{item.quantity}</td>
                          <td className="px-2 py-1.5 text-xs text-gray-900 uppercase">{item.unit}</td>
                          <td className="px-2 py-1.5 text-xs text-gray-900">Rs. {parseFloat(item.rate_per_unit).toFixed(2)}</td>
                          <td className="px-2 py-1.5 text-xs font-semibold text-orange-600">Rs. {parseFloat(item.credit_amount).toFixed(2)}</td>
                          <td className="px-2 py-1.5 text-xs text-gray-600">{item.reason || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {returnItems[0]?.notes && (
                <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-800 font-semibold mb-1">Notes:</p>
                  <p className="text-xs text-yellow-900">{returnItems[0].notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-4 py-3 rounded-b-lg flex justify-end">
              <button
                ref={closeModalButtonRef}
                onClick={closeModal}
                className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Compact */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <div className="p-1.5 bg-orange-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          Purchase Returns History
        </h2>
        <button
          onClick={loadPurchaseReturns}
          onFocus={() => setSelectedRow(-1)}
          className="px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition flex items-center gap-1.5 text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Returns Table - Compact */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-orange-600 to-red-600 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Return ID</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Purchase ID</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Supplier</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Time</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Credit Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Processed By</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-3 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-gray-600">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-3 py-8 text-center text-xs text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>No purchase returns found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((returnRecord, index) => (
                    <tr
                      key={returnRecord.return_id}
                      className={`hover:bg-orange-50 transition-colors ${
                        selectedRow === index ? 'ring-2 ring-orange-500 bg-orange-100' : ''
                      }`}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-xs font-semibold text-orange-600">{returnRecord.return_id}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        #{returnRecord.original_purchase_id}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {returnRecord.supplier_name || 'N/A'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(returnRecord.return_date)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatTime(returnRecord.return_time)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-xs font-bold text-orange-600">Rs. {parseFloat(returnRecord.total_credit_amount).toFixed(2)}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {returnRecord.processed_by || 'N/A'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                        <button
                          onClick={() => {
                            setSelectedRow(-1);
                            handleViewDetails(returnRecord);
                          }}
                          onFocus={() => setSelectedRow(-1)}
                          className="p-1 text-orange-600 hover:bg-orange-100 rounded transition-all"
                          title="View Details"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Compact */}
          {purchaseReturns.length > 0 && totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    paginate(currentPage - 1);
                    setSelectedRow(0);
                  }}
                  onFocus={() => setSelectedRow(-1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-700"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => {
                      paginate(index + 1);
                      setSelectedRow(0);
                    }}
                    onFocus={() => setSelectedRow(-1)}
                    className={`px-3 py-1.5 text-sm border rounded font-medium transition ${
                      currentPage === index + 1
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => {
                    paginate(currentPage + 1);
                    setSelectedRow(0);
                  }}
                  onFocus={() => setSelectedRow(-1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards - Compact */}
      {purchaseReturns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-lg shadow-sm text-white">
            <p className="text-xs font-medium opacity-90">Total Returns</p>
            <p className="text-2xl font-bold mt-1">{totalReturns}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-lg shadow-sm text-white">
            <p className="text-xs font-medium opacity-90">Total Credit</p>
            <p className="text-lg font-bold mt-1">Rs. {totalCreditAmount.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-sm text-white">
            <p className="text-xs font-medium opacity-90">Suppliers Affected</p>
            <p className="text-2xl font-bold mt-1">{uniqueSuppliers}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg shadow-sm text-white">
            <p className="text-xs font-medium opacity-90">Avg Credit</p>
            <p className="text-lg font-bold mt-1">Rs. {averageCredit.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
