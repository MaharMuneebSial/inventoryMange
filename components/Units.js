'use client';

import { useState, useEffect, useRef } from 'react';

export default function Units() {
  const [units, setUnits] = useState([]);
  const [unitName, setUnitName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Keyboard navigation states
  const [selectedRow, setSelectedRow] = useState(-1);
  const [selectedAction, setSelectedAction] = useState(-1);
  const firstInputRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const deleteButtonRef = useRef(null);

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, type: '', message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Pagination calculations - must be before keyboard navigation useEffect
  const totalPages = Math.ceil(units.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUnits = units.slice(indexOfFirstItem, indexOfLastItem);

  // Auto-focus on first input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-focus on Cancel button when delete modal opens
  useEffect(() => {
    if (showDeleteConfirm && cancelButtonRef.current) {
      const timer = setTimeout(() => {
        cancelButtonRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showDeleteConfirm]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;

      // Escape: Return to first input field
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
          return;
        }
        if (firstInputRef.current) {
          firstInputRef.current.focus();
          setSelectedRow(0);
          setSelectedAction(-1);
        }
        return;
      }

      // F2: Move focus to table
      if (e.key === 'F2') {
        e.preventDefault();
        if (currentUnits.length > 0) {
          setSelectedRow(0);
          setSelectedAction(-1);
          const firstRow = document.querySelector('tbody tr');
          if (firstRow) firstRow.focus();
        }
        return;
      }

      // F3: Jump to pagination
      if (e.key === 'F3') {
        e.preventDefault();
        if (units.length > itemsPerPage) {
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
        } else if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          // Navigate between form fields using Shift + Left/Right arrows
          e.preventDefault();
          const form = document.querySelector('form');
          if (form) {
            const inputs = Array.from(form.querySelectorAll('input[type="text"], button[type="submit"], button[type="button"]'));
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
        }
        // Normal arrow keys (without Shift) work for text cursor movement
        else if (e.key === 'ArrowDown') {
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
        if (currentUnits.length > 0) {
          setSelectedRow((prev) => {
            // If no row selected, start at 0
            if (prev === -1) return 0;
            const newRow = prev < currentUnits.length - 1 ? prev + 1 : prev;
            setSelectedAction(-1);
            return newRow;
          });
        }
        return;
      }

      // ArrowUp: Move up in table
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentUnits.length > 0) {
          setSelectedRow((prev) => {
            // If no row selected, start at 0
            if (prev === -1) return 0;
            const newRow = prev > 0 ? prev - 1 : 0;
            setSelectedAction(-1);
            return newRow;
          });
        }
        return;
      }

      // ArrowLeft: Move to previous action
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (selectedAction > 0) {
          setSelectedAction(selectedAction - 1);
        } else {
          setSelectedAction(-1);
        }
        return;
      }

      // ArrowRight: Move to next action
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (selectedAction < 1) {
          setSelectedAction(selectedAction + 1);
        }
        return;
      }

      // Enter: Execute action
      if (e.key === 'Enter') {
        e.preventDefault();

        if (currentUnits.length === 0) return;

        const selectedUnit = currentUnits[selectedRow];
        if (!selectedUnit) return;

        if (selectedAction === 0) {
          // Edit action
          handleEdit(selectedUnit);
          setTimeout(() => {
            if (firstInputRef.current) {
              firstInputRef.current.focus();
            }
          }, 100);
        } else if (selectedAction === 1) {
          // Delete action
          handleDeleteClick(selectedUnit.id);
        } else if (selectedAction === -1) {
          // No action selected, select first action (Edit)
          setSelectedAction(0);
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRow, selectedAction, currentUnits, showDeleteConfirm, units.length, itemsPerPage]);

  const loadUnits = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const result = await window.electronAPI.getUnits();
        if (result.success) {
          setUnits(result.data);
        } else {
          showToast('error', 'Failed to load units');
        }
      } catch (error) {
        showToast('error', 'Error loading units');
      }
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!unitName.trim()) {
      showToast('error', 'Please enter unit name');
      return;
    }

    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        let result;
        if (editingId) {
          result = await window.electronAPI.updateUnit({
            id: editingId,
            unit_name: unitName,
            unit_code: unitCode
          });
          if (result.success) {
            showToast('success', 'Unit updated successfully!');
          } else {
            showToast('error', result.error || 'Failed to update unit');
          }
        } else {
          result = await window.electronAPI.addUnit({
            unit_name: unitName,
            unit_code: unitCode
          });
          if (result.success) {
            showToast('success', 'Unit added successfully!');
          } else {
            showToast('error', result.error || 'Failed to add unit');
          }
        }

        if (result.success) {
          resetForm();
          loadUnits();
        }
      } catch (error) {
        showToast('error', 'Error: ' + error.message);
      }
    }
  };

  const handleEdit = (unit) => {
    setEditingId(unit.id);
    setUnitName(unit.unit_name);
    setUnitCode(unit.unit_code);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const result = await window.electronAPI.deleteUnit(deleteId);
        if (result.success) {
          showToast('success', 'Unit deleted successfully!');
          loadUnits();
        } else {
          showToast('error', result.error || 'Failed to delete unit');
        }
      } catch (error) {
        showToast('error', 'Error: ' + error.message);
      }
    }
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const resetForm = () => {
    setUnitName('');
    setUnitCode('');
    setEditingId(null);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedRow(-1);
    setSelectedAction(-1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    setSelectedRow(-1);
    setSelectedAction(-1);
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    setSelectedRow(-1);
    setSelectedAction(-1);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 min-w-[300px] max-w-md transform transition-all duration-300 ease-in-out ${
          toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border ${
            toast.type === 'success'
              ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-400'
              : 'bg-gradient-to-r from-red-500 to-red-600 border-red-400'
          }`}>
            {/* Icon */}
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            {/* Message */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{toast.message}</p>
            </div>

            {/* Close button */}
            <button
              onClick={() => setToast({ show: false, type: '', message: '' })}
              className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              // Allow Enter to work on focused button
              return;
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setShowDeleteConfirm(false);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') {
              e.preventDefault();
              // Toggle focus between Cancel and Delete buttons
              if (document.activeElement === cancelButtonRef.current) {
                deleteButtonRef.current?.focus();
              } else {
                cancelButtonRef.current?.focus();
              }
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-red-100 rounded-full">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Delete Unit</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                ref={cancelButtonRef}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition text-xs font-medium"
              >
                Cancel
              </button>
              <button
                ref={deleteButtonRef}
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-xs font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-lg border border-blue-100 mb-2">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-gray-900">
            {editingId ? 'Edit Unit' : 'Add New Unit'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Unit Name</label>
            <input
              ref={firstInputRef}
              type="text"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              onFocus={() => {
                setSelectedRow(-1);
                setSelectedAction(-1);
              }}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter unit name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Unit Code</label>
            <input
              type="text"
              value={unitCode}
              onChange={(e) => setUnitCode(e.target.value)}
              onFocus={() => {
                setSelectedRow(-1);
                setSelectedAction(-1);
              }}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter unit code"
            />
          </div>
          <div className="col-span-2 flex gap-1.5">
            <button
              type="submit"
              onFocus={() => {
                setSelectedRow(-1);
                setSelectedAction(-1);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded hover:from-blue-700 hover:to-indigo-700"
            >
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                onFocus={() => {
                  setSelectedRow(-1);
                  setSelectedAction(-1);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Units List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-900">Units List</h3>
          </div>
          <span className="text-xs font-semibold text-gray-600">Total: {units.length}</span>
        </div>

        <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 sticky top-0">
                <tr>
                  <th className="px-2 py-1.5 text-left text-xs font-bold text-white uppercase tracking-wider">ID</th>
                  <th className="px-2 py-1.5 text-left text-xs font-bold text-white uppercase tracking-wider">Unit Name</th>
                  <th className="px-2 py-1.5 text-left text-xs font-bold text-white uppercase tracking-wider">Unit Code</th>
                  <th className="px-2 py-1.5 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {units.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-2 py-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs text-gray-500 font-medium">No units found</span>
                        <span className="text-xs text-gray-400">Add your first unit above</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUnits.map((unit, index) => (
                    <tr
                      key={unit.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedRow === index && selectedAction === -1 ? 'bg-yellow-50 ring-2 ring-yellow-400' : ''
                      }`}
                    >
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <span className="text-xs font-semibold text-blue-600">{unit.id}</span>
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <span className="text-xs font-medium text-gray-900">{unit.unit_name}</span>
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                          {unit.unit_code}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedRow(-1);
                              setSelectedAction(-1);
                              handleEdit(unit);
                            }}
                            className={`p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors ${
                              selectedRow !== -1 && selectedRow === index && selectedAction === 0
                                ? 'ring-2 ring-blue-500 bg-blue-100'
                                : ''
                            }`}
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRow(-1);
                              setSelectedAction(-1);
                              handleDeleteClick(unit.id);
                            }}
                            className={`p-1 text-red-600 hover:bg-red-50 rounded transition-colors ${
                              selectedRow !== -1 && selectedRow === index && selectedAction === 1
                                ? 'ring-2 ring-red-500 bg-red-100'
                                : ''
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

          {/* Pagination Controls */}
          {units.length > itemsPerPage && (
            <div className="px-2 py-1.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, units.length)} of {units.length} entries
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={goToPreviousPage}
                  onFocus={() => {
                    setSelectedRow(-1);
                    setSelectedAction(-1);
                  }}
                  disabled={currentPage === 1}
                  className={`pagination-btn px-2 py-1 text-xs font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    onFocus={() => {
                      setSelectedRow(-1);
                      setSelectedAction(-1);
                    }}
                    className={`pagination-btn px-2 py-1 text-xs font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={goToNextPage}
                  onFocus={() => {
                    setSelectedRow(-1);
                    setSelectedAction(-1);
                  }}
                  disabled={currentPage === totalPages}
                  className={`pagination-btn px-2 py-1 text-xs font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
