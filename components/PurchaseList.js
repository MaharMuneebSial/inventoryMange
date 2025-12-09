'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function PurchaseList() {
  const router = useRouter();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingPurchase, setViewingPurchase] = useState(null);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Keyboard navigation state
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedAction, setSelectedAction] = useState(-1); // -1 means no action selected, 0=view, 1=edit, 2=delete

  // Refs for modal buttons
  const closeButtonRef = useRef(null);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = purchases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(purchases.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    loadPurchases();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, type: '', message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle Escape key to close modals
      if (e.key === 'Escape') {
        e.preventDefault();
        if (viewingPurchase) {
          setViewingPurchase(null);
        } else if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        }
        return;
      }

      // Don't handle other keys if modals are open
      if (viewingPurchase || showDeleteConfirm || currentItems.length === 0 || loading) return;

      // Handle Up/Down arrow keys for row navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedRow(prev => Math.min(prev + 1, currentItems.length - 1));
        setSelectedAction(-1); // Reset action selection when moving rows
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedRow(prev => Math.max(prev - 1, 0));
        setSelectedAction(-1); // Reset action selection when moving rows
      }
      // Handle Left/Right arrow keys for action button navigation
      else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedAction(prev => Math.min(prev + 1, 2)); // 0=view, 1=edit, 2=delete
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedAction(prev => Math.max(prev - 1, -1)); // -1 means back to row
      }
      // Handle Enter key to execute action
      else if (e.key === 'Enter') {
        e.preventDefault();
        const purchase = currentItems[selectedRow];
        if (!purchase) return;

        if (selectedAction === 0) {
          viewPurchaseDetails(purchase);
        } else if (selectedAction === 1) {
          handleEdit(purchase);
        } else if (selectedAction === 2) {
          confirmDelete(purchase.id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentItems, selectedRow, selectedAction, loading, viewingPurchase, showDeleteConfirm, purchases, currentPage]);

  // Auto-focus on close button when modal opens
  useEffect(() => {
    if (viewingPurchase && closeButtonRef.current) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }
  }, [viewingPurchase]);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const loadPurchases = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.getPurchases();
        if (result.success) {
          setPurchases(result.data || []);
        } else {
          showToast('error', 'Failed to load purchases');
        }
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const viewPurchaseDetails = async (purchase) => {
    setViewingPurchase(purchase);

    // Since purchases table stores all data in single row, we'll create a single item view
    // Extract purchase details
    const items = [{
      product_name: purchase.product_name,
      quantity: purchase.quantity,
      unit: purchase.unit,
      purchase_price: purchase.purchase_price,
      sale_price: purchase.sale_price,
      total_amount: purchase.total_amount,
      category_name: purchase.category_name,
      sub_category_name: purchase.sub_category_name,
      brand_name: purchase.brand_name,
      supplier_name: purchase.supplier_name
    }];

    setPurchaseItems(items);
  };

  const handleEdit = (purchase) => {
    // Store the purchase data in localStorage to be accessed by the Purchase page
    localStorage.setItem('editingPurchase', JSON.stringify(purchase));
    // Navigate to the purchase page
    router.push('/purchase');
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.deletePurchase(deleteId);
      if (result.success) {
        showToast('success', 'Purchase deleted successfully!');
        loadPurchases();
      } else {
        showToast('error', result.error || 'Failed to delete purchase');
      }
    }
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`rounded-md shadow-lg px-3 py-1.5 flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-red-100 rounded-full">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Delete Purchase</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-xs font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Details Modal */}
      {viewingPurchase && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold">Purchase Details - ID: {viewingPurchase.id}</h3>
                  <p className="text-xs opacity-90">Date: {viewingPurchase.purchase_date}</p>
                </div>
                <button
                  onClick={() => setViewingPurchase(null)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Purchase Info */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-purple-50 p-2 rounded-lg border border-teal-200">
                  <p className="text-xs text-purple-600 font-semibold mb-0.5">Supplier</p>
                  <p className="text-xs font-medium text-gray-900">{viewingPurchase.supplier_name}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold mb-0.5">Purchase Date</p>
                  <p className="text-xs font-medium text-gray-900">{viewingPurchase.purchase_date}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gradient-to-r from-teal-600 to-cyan-600">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase">Product</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase">Category</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase">Brand</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase">Quantity</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase">Unit</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase">Purchase Price</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase">Sale Price</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchaseItems.map((item, index) => (
                      <tr key={index} className="hover:bg-purple-50">
                        <td className="px-3 py-2 text-xs text-gray-900">{item.product_name}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{item.category_name}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{item.brand_name}</td>
                        <td className="px-3 py-2 text-xs font-medium text-gray-900">{item.quantity}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{item.unit}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">Rs. {parseFloat(item.purchase_price).toFixed(2)}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">Rs. {parseFloat(item.sale_price).toFixed(2)}</td>
                        <td className="px-3 py-2 text-xs font-semibold text-gray-900">Rs. {parseFloat(item.total_amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-3 rounded-lg border border-teal-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-purple-900">Total Purchase Amount:</span>
                  <span className="text-sm font-bold text-purple-600">Rs. {parseFloat(viewingPurchase.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-b-lg">
              <button
                ref={closeButtonRef}
                onClick={() => setViewingPurchase(null)}
                className="w-full px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Compact */}
      <div className="flex justify-between items-center bg-white rounded-lg p-1.5 border border-gray-200 shadow-sm">
        <h2 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <div className="p-1 bg-teal-600 rounded">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          Purchase History
        </h2>
        <div className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded">
          <span className="text-blue-600 font-bold text-[10px]">{purchases.length} Total</span>
        </div>
      </div>

      {/* Table with flex-1 for height management */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-teal-600 sticky top-0">
                <tr>
                  <th className="px-1.5 py-1 text-left text-[10px] font-bold text-white uppercase tracking-wide">Product</th>
                  <th className="px-1.5 py-1 text-left text-[10px] font-bold text-white uppercase tracking-wide">Supplier</th>
                  <th className="px-1.5 py-1 text-left text-[10px] font-bold text-white uppercase tracking-wide">QTY</th>
                  <th className="px-1.5 py-1 text-left text-[10px] font-bold text-white uppercase tracking-wide">Purchase</th>
                  <th className="px-1.5 py-1 text-left text-[10px] font-bold text-white uppercase tracking-wide">Sale</th>
                  <th className="px-1.5 py-1 text-left text-[10px] font-bold text-white uppercase tracking-wide">Total</th>
                  <th className="px-1.5 py-1 text-left text-[10px] font-bold text-white uppercase tracking-wide">Paid</th>
                  <th className="px-1.5 py-1 text-left text-[10px] font-bold text-white uppercase tracking-wide">Due</th>
                  <th className="px-1.5 py-1 text-left text-[10px] font-bold text-white uppercase tracking-wide">Date</th>
                  <th className="px-1.5 py-1 text-left text-[10px] font-bold text-white uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-3 py-4 text-center text-xs text-gray-500">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-3 py-4 text-center text-xs text-gray-500">
                      <div className="flex flex-col items-center gap-1.5">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>No purchases found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((purchase, index) => (
                    <tr key={purchase.id} className={`${
                      selectedRow === index ? 'bg-blue-200 ring-2 ring-blue-400' : index % 2 === 0 ? 'bg-white' : 'bg-blue-50'
                    } hover:bg-blue-100 transition-colors`}>
                      <td className="px-1.5 py-1 whitespace-nowrap text-[11px] text-gray-900 font-medium">
                        {purchase.product_name}
                      </td>
                      <td className="px-1.5 py-1 whitespace-nowrap text-[11px] text-gray-900">
                        {purchase.supplier_name}
                      </td>
                      <td className="px-1.5 py-1 whitespace-nowrap">
                        <div className="inline-block px-1.5 py-0.5 bg-blue-100 rounded-full">
                          <span className="text-[10px] font-medium text-blue-700">
                            {purchase.quantity} {purchase.unit}
                          </span>
                        </div>
                      </td>
                      <td className="px-1.5 py-1 whitespace-nowrap text-[11px] text-gray-900">
                        Rs. {parseFloat(purchase.purchase_price).toFixed(0)}
                      </td>
                      <td className="px-1.5 py-1 whitespace-nowrap text-[11px] text-gray-900">
                        Rs. {parseFloat(purchase.sale_price).toFixed(0)}
                      </td>
                      <td className="px-1.5 py-1 whitespace-nowrap text-[11px] font-bold text-blue-600">
                        Rs. {parseFloat(purchase.total_amount).toFixed(0)}
                      </td>
                      <td className="px-1.5 py-1 whitespace-nowrap text-[11px] font-semibold text-green-600">
                        Rs. {parseFloat(purchase.paid_amount || 0).toFixed(0)}
                      </td>
                      <td className="px-1.5 py-1 whitespace-nowrap text-[11px] font-semibold text-red-600">
                        Rs. {parseFloat(purchase.due_amount || 0).toFixed(0)}
                      </td>
                      <td className="px-1.5 py-1 whitespace-nowrap text-[11px] text-gray-900">
                        {purchase.purchase_date}
                      </td>
                      <td className="px-1.5 py-1 whitespace-nowrap text-[11px] font-medium">
                        <div className="flex gap-1">
                          <button
                            onClick={() => viewPurchaseDetails(purchase)}
                            className={`${
                              selectedRow === index && selectedAction === 0
                                ? 'text-blue-800 bg-blue-100 rounded p-0.5 ring-2 ring-blue-400'
                                : 'text-blue-600 hover:text-blue-800'
                            } transition-colors`}
                            title="View Details"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(purchase)}
                            className={`${
                              selectedRow === index && selectedAction === 1
                                ? 'text-green-800 bg-green-100 rounded p-0.5 ring-2 ring-green-400'
                                : 'text-green-600 hover:text-green-800'
                            } transition-colors`}
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => confirmDelete(purchase.id)}
                            className={`${
                              selectedRow === index && selectedAction === 2
                                ? 'text-red-800 bg-red-100 rounded p-0.5 ring-2 ring-red-400'
                                : 'text-red-600 hover:text-red-800'
                            } transition-colors`}
                            title="Delete"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {purchases.length > 0 && totalPages > 1 && (
            <div className="bg-white px-2 py-1.5 border-t border-gray-200">
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-[10px] border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-700"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`px-2 py-1 text-[10px] border rounded font-medium transition ${
                      currentPage === index + 1
                        ? 'bg-teal-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-[10px] border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
