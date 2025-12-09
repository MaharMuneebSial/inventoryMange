'use client';

import { useState, useEffect, useRef } from 'react';

export default function SaleReturnList() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleItems, setSaleItems] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Keyboard navigation state
  const [selectedRow, setSelectedRow] = useState(-1);
  const closeModalButtonRef = useRef(null);

  useEffect(() => {
    loadSales();
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

  const loadSales = async () => {
    setLoading(true);
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const result = await window.electronAPI.getSales();
        if (result.success) {
          setSales(result.data);
        } else {
          showToast('error', 'Failed to load sales');
        }
      } catch (error) {
        showToast('error', 'Error loading sales');
      }
    }
    setLoading(false);
  };

  const loadSaleItems = async (saleId) => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const result = await window.electronAPI.getSaleItems(saleId);
        if (result.success) {
          setSaleItems(result.data);
        }
      } catch (error) {
        showToast('error', 'Error loading sale items');
      }
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, message, type });
  };

  const handleViewDetails = async (sale) => {
    setSelectedSale(sale);
    await loadSaleItems(sale.sale_id);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedSale(null);
    setSaleItems([]);
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
  const currentItems = sales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sales.length / itemsPerPage);

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
  const totalGrossSales = sales.reduce((sum, sale) => sum + parseFloat(sale.grand_total), 0);
  const totalReturns = sales.reduce((sum, sale) => sum + parseFloat(sale.total_returned || 0), 0);
  const totalNetSales = sales.reduce((sum, sale) => sum + parseFloat(sale.net_total || sale.grand_total), 0);
  const averageSale = sales.length > 0 ? totalNetSales / sales.length : 0;
  const salesWithReturns = sales.filter(s => s.has_returns).length;

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

      {/* Sale Details Modal */}
      {showDetailsModal && selectedSale && (
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
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold">Sale Details - {selectedSale.sale_id}</h3>
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
              {/* Sale Information */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Date</p>
                  <p className="text-xs font-semibold text-gray-900">{formatDate(selectedSale.sale_date)}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Time</p>
                  <p className="text-xs font-semibold text-gray-900">{formatTime(selectedSale.sale_time)}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Payment Method</p>
                  <p className="text-xs font-semibold text-gray-900 capitalize">{selectedSale.payment_method}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Sold By</p>
                  <p className="text-xs font-semibold text-gray-900">{selectedSale.sold_by || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Amount Received</p>
                  <p className="text-xs font-semibold text-gray-900">Rs. {parseFloat(selectedSale.amount_received).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Change Due</p>
                  <p className="text-xs font-semibold text-gray-900">Rs. {parseFloat(selectedSale.change_due).toFixed(2)}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 mb-2">Items Sold</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">Qty</th>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">Unit</th>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">Rate</th>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {saleItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-xs text-gray-900">{item.product_name}</td>
                          <td className="px-2 py-1.5 text-xs text-gray-900">{item.quantity}</td>
                          <td className="px-2 py-1.5 text-xs text-gray-900 uppercase">{item.unit}</td>
                          <td className="px-2 py-1.5 text-xs text-gray-900">Rs. {parseFloat(item.rate_per_unit).toFixed(2)}</td>
                          <td className="px-2 py-1.5 text-xs font-semibold text-gray-900">Rs. {parseFloat(item.line_total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-3 rounded-lg border border-teal-200">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">Subtotal:</span>
                    <span className="text-xs font-semibold text-gray-900">Rs. {parseFloat(selectedSale.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">Discount:</span>
                    <span className="text-xs font-semibold text-red-600">- Rs. {parseFloat(selectedSale.discount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">Tax:</span>
                    <span className="text-xs font-semibold text-gray-900">Rs. {parseFloat(selectedSale.tax).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-blue-300 pt-1.5 mt-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-900">Grand Total:</span>
                      <span className="text-sm font-bold text-blue-600">Rs. {parseFloat(selectedSale.grand_total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedSale.notes && (
                <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-800 font-semibold mb-1">Notes:</p>
                  <p className="text-xs text-yellow-900">{selectedSale.notes}</p>
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
          <div className="p-1.5 bg-teal-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          Total Sales
        </h2>
        <button
          onClick={loadSales}
          onFocus={() => setSelectedRow(-1)}
          className="px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition flex items-center gap-1.5 text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Sales Table - Compact */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-teal-600 to-cyan-600 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Sale ID</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Time</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Grand Total</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Returns</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Net Total</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Payment</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Sold By</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-3 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-gray-600">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-3 py-8 text-center text-xs text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>No sales found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((sale, index) => (
                    <tr
                      key={sale.id}
                      className={`hover:bg-blue-50 transition-colors ${
                        sale.has_returns ? 'bg-orange-50' : ''
                      } ${
                        selectedRow === index ? 'ring-2 ring-blue-500 bg-blue-100' : ''
                      }`}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-blue-600">{sale.sale_id}</span>
                          {sale.has_returns && (
                            <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3"
                              />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(sale.sale_date)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatTime(sale.sale_time)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-xs font-bold text-gray-600">Rs. {parseFloat(sale.grand_total).toFixed(2)}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {sale.has_returns ? (
                          <span className="text-xs font-bold text-red-600">- Rs. {parseFloat(sale.total_returned).toFixed(2)}</span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-xs font-bold text-green-600">Rs. {parseFloat(sale.net_total).toFixed(2)}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          sale.payment_method === 'cash' ? 'bg-green-100 text-green-800' :
                          sale.payment_method === 'card' ? 'bg-blue-100 text-blue-800' :
                          sale.payment_method === 'online' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {sale.payment_method.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {sale.sold_by || 'N/A'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                        <button
                          onClick={() => {
                            setSelectedRow(-1);
                            handleViewDetails(sale);
                          }}
                          onFocus={() => setSelectedRow(-1)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-all"
                          title="View"
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
          {sales.length > 0 && totalPages > 1 && (
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
                        ? 'bg-teal-600 text-white border-teal-600'
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
      {sales.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-sm text-white">
            <p className="text-xs font-medium opacity-90">Total Sales</p>
            <p className="text-2xl font-bold mt-1">{sales.length}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-3 rounded-lg shadow-sm text-white">
            <p className="text-xs font-medium opacity-90">Gross Sales</p>
            <p className="text-lg font-bold mt-1">Rs. {totalGrossSales.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-lg shadow-sm text-white">
            <p className="text-xs font-medium opacity-90">Returns ({salesWithReturns})</p>
            <p className="text-lg font-bold mt-1">- Rs. {totalReturns.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg shadow-sm text-white">
            <p className="text-xs font-medium opacity-90">Net Revenue</p>
            <p className="text-lg font-bold mt-1">Rs. {totalNetSales.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg shadow-sm text-white">
            <p className="text-xs font-medium opacity-90">Avg Net Sale</p>
            <p className="text-lg font-bold mt-1">Rs. {averageSale.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}