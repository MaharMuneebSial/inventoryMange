'use client';

import { useState, useEffect, useRef } from 'react';

export default function Brand() {
  const [brands, setBrands] = useState([]);
  const [brandName, setBrandName] = useState('');
  const [brandCode, setBrandCode] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Keyboard navigation states
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedAction, setSelectedAction] = useState(-1); // -1 means no action selected, 0=edit, 1=delete

  // Ref for first input field
  const firstInputRef = useRef(null);

  useEffect(() => {
    loadBrands();
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

  const loadBrands = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.getBrands();
      if (result.success) {
        setBrands(result.data);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        let result;

        if (editingId) {
          result = await window.electronAPI.updateBrand({
            id: editingId,
            brandName,
            brandCode
          });
        } else {
          result = await window.electronAPI.addBrand({
            brandName,
            brandCode
          });
        }

        if (result.success) {
          showToast('success', editingId ? 'Updated!' : 'Added!');
          setBrandName('');
          setBrandCode('');
          setEditingId(null);
          loadBrands();
        } else {
          showToast('error', result.error || 'Error occurred');
        }
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (brand) => {
    setBrandName(brand.brand_name);
    setBrandCode(brand.brand_code);
    setEditingId(brand.id);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.deleteBrand(deleteId);
      if (result.success) {
        showToast('success', 'Deleted!');
        loadBrands();
      } else {
        showToast('error', result.error || 'Failed to delete');
      }
    }
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleCancel = () => {
    setBrandName('');
    setBrandCode('');
    setEditingId(null);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = brands.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(brands.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;

      // Handle Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        } else if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'BUTTON') {
          if (firstInputRef.current) {
            firstInputRef.current.focus();
            setSelectedRow(0);
            setSelectedAction(-1);
          }
        }
        return;
      }

      // Handle F2 key to move from form to table
      if (e.key === 'F2') {
        e.preventDefault();
        if (currentItems.length > 0) {
          activeElement.blur();
          setSelectedRow(0);
          setSelectedAction(-1);
        }
        return;
      }

      // Handle F3 key to jump to pagination buttons
      if (e.key === 'F3') {
        e.preventDefault();
        if (totalPages > 1) {
          const paginationButtons = document.querySelectorAll('.pagination-btn');
          if (paginationButtons.length > 0) {
            paginationButtons[0].focus();
          }
        }
        return;
      }

      // If modal is open, only handle Enter on modal buttons
      if (showDeleteConfirm) {
        return;
      }

      // If we're on a button (Add/Update/Cancel), let Enter key click it
      if (activeElement.tagName === 'BUTTON') {
        if (e.key === 'Enter') {
          // Allow default behavior - button will be clicked
          return;
        }
      }

      // If we're in an input field
      if (activeElement.tagName === 'INPUT') {
        if (e.key === 'Enter') {
          e.preventDefault();
          // Move to next input field
          const inputs = document.querySelectorAll('input[type="text"]');
          const currentIndex = Array.from(inputs).indexOf(activeElement);
          if (currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
          } else {
            // Last input, focus submit button
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.focus();
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          // Navigate between form fields using Left/Right arrows
          e.preventDefault();
          const form = document.querySelector('form');
          if (form) {
            const inputs = Array.from(form.querySelectorAll('input[type="text"], button[type="submit"]'));
            const currentIndex = inputs.indexOf(activeElement);

            if (e.key === 'ArrowRight') {
              const nextIndex = currentIndex + 1;
              if (nextIndex < inputs.length) {
                inputs[nextIndex].focus();
              }
            } else if (e.key === 'ArrowLeft') {
              const prevIndex = currentIndex - 1;
              if (prevIndex >= 0) {
                inputs[prevIndex].focus();
              }
            }
          }
        } else if (e.key === 'ArrowDown') {
          // Navigate down to next form field
          e.preventDefault();
          const inputs = document.querySelectorAll('input[type="text"]');
          const currentIndex = Array.from(inputs).indexOf(activeElement);
          if (currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
          } else {
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.focus();
          }
        } else if (e.key === 'ArrowUp') {
          // Navigate up to previous form field
          e.preventDefault();
          const inputs = document.querySelectorAll('input[type="text"]');
          const currentIndex = Array.from(inputs).indexOf(activeElement);
          if (currentIndex > 0) {
            inputs[currentIndex - 1].focus();
          }
        }
        return;
      }

      // ArrowDown: Move down in table
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentItems.length > 0) {
          setSelectedRow((prev) => {
            const newRow = prev < currentItems.length - 1 ? prev + 1 : prev;
            setSelectedAction(-1); // Reset action selection when changing rows
            return newRow;
          });
        }
        return;
      }

      // ArrowUp: Move up in table
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentItems.length > 0) {
          setSelectedRow((prev) => {
            const newRow = prev > 0 ? prev - 1 : 0;
            setSelectedAction(-1); // Reset action selection when changing rows
            return newRow;
          });
        }
        return;
      }

      // ArrowLeft: Move to previous action button
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (selectedAction > 0) {
          setSelectedAction(selectedAction - 1);
        } else if (selectedAction === 0) {
          setSelectedAction(-1); // Go back to row selection
        }
        return;
      }

      // ArrowRight: Move to next action button
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (selectedAction < 1) {
          setSelectedAction(selectedAction + 1);
        }
        return;
      }

      // Enter: Execute action or edit
      if (e.key === 'Enter') {
        e.preventDefault();

        if (currentItems.length === 0) return;

        const selectedBrand = currentItems[selectedRow];
        if (!selectedBrand) return;

        if (selectedAction === 0) {
          // Edit action
          handleEdit(selectedBrand);
          setTimeout(() => {
            if (firstInputRef.current) {
              firstInputRef.current.focus();
            }
          }, 100);
        } else if (selectedAction === 1) {
          // Delete action
          confirmDelete(selectedBrand.id);
        } else if (selectedAction === -1) {
          // No action selected, select first action (Edit)
          setSelectedAction(0);
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteConfirm, currentItems, selectedRow, selectedAction, loading, totalPages]);

  // Auto-focus on first input field when page loads
  useEffect(() => {
    if (firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, []);

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
              <h3 className="text-sm font-semibold text-gray-900">Delete Brand</h3>
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

      {/* Form Section - Compact */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
        <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {editingId ? 'Edit Brand' : 'Add New Brand'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              ref={firstInputRef}
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
              className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Brand Name"
            />
            <input
              type="text"
              value={brandCode}
              onChange={(e) => setBrandCode(e.target.value)}
              required
              className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Brand Code"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {loading ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table Section - Compact */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Brands List
          </h3>
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-medium">
            Total: {brands.length}
          </span>
        </div>

        <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-600 to-emerald-600 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Brand Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-3 py-8 text-center text-xs text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>No brands found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((brand, index) => (
                    <tr key={brand.id} className={`hover:bg-green-50 transition-colors ${
                      index === selectedRow ? 'bg-yellow-50 ring-2 ring-yellow-400' : ''
                    }`}>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-gray-900">
                        {brand.id}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {brand.brand_name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                          {brand.brand_code}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(brand)}
                            className={`p-1 text-green-600 hover:bg-green-100 rounded transition-all ${
                              index === selectedRow && selectedAction === 0 ? 'ring-2 ring-green-400 bg-green-100' : ''
                            }`}
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => confirmDelete(brand.id)}
                            className={`p-1 text-red-600 hover:bg-red-100 rounded transition-all ${
                              index === selectedRow && selectedAction === 1 ? 'ring-2 ring-red-400 bg-red-100' : ''
                            }`}
                            title="Delete"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

          {/* Pagination - Compact */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`pagination-btn px-3 py-1.5 text-sm border rounded font-medium transition focus:ring-2 focus:ring-green-500 focus:outline-none ${
                      currentPage === index + 1
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
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
