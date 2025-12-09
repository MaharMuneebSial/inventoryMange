'use client';

import { useState, useEffect, useRef } from 'react';

export default function SubCategory() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [subCategoryCode, setSubCategoryCode] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Search state for category dropdown
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Keyboard navigation states
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedAction, setSelectedAction] = useState(-1); // -1 means no action selected, 0=edit, 1=delete
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);

  // Ref for first input field
  const firstInputRef = useRef(null);

  useEffect(() => {
    loadCategories();
    loadSubCategories();
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

  const loadCategories = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.getCategories();
      if (result.success) {
        setCategories(result.data);
        setFilteredCategories(result.data);
      }
    }
  };

  // Filter categories based on search
  useEffect(() => {
    if (categorySearch) {
      const filtered = categories.filter(cat =>
        cat.category_name.toLowerCase().includes(categorySearch.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [categorySearch, categories]);

  const handleCategorySelect = (category) => {
    setCategoryId(category.id.toString());
    setCategorySearch(category.category_name);
    setShowCategoryDropdown(false);
  };

  const handleCategoryInputChange = (e) => {
    setCategorySearch(e.target.value);
    setShowCategoryDropdown(true);
    if (!e.target.value) {
      setCategoryId('');
    }
  };

  const loadSubCategories = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.getSubCategories();
      if (result.success) {
        setSubCategories(result.data);
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
          result = await window.electronAPI.updateSubCategory({
            id: editingId,
            categoryId: parseInt(categoryId),
            subCategoryName,
            subCategoryCode
          });
        } else {
          result = await window.electronAPI.addSubCategory({
            categoryId: parseInt(categoryId),
            subCategoryName,
            subCategoryCode
          });
        }

        if (result.success) {
          showToast('success', editingId ? 'Updated!' : 'Added!');
          setCategoryId('');
          setSubCategoryName('');
          setSubCategoryCode('');
          setEditingId(null);
          setCategorySearch('');
          setShowCategoryDropdown(false);
          loadSubCategories();
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

  const handleEdit = (subCategory) => {
    setCategoryId(subCategory.category_id.toString());
    setSubCategoryName(subCategory.sub_category_name);
    setSubCategoryCode(subCategory.sub_category_code);
    setEditingId(subCategory.id);
    // Set the category name for the search field
    const category = categories.find(cat => cat.id === subCategory.category_id);
    if (category) {
      setCategorySearch(category.category_name);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.deleteSubCategory(deleteId);
      if (result.success) {
        showToast('success', 'Deleted!');
        loadSubCategories();
      } else {
        showToast('error', result.error || 'Failed to delete');
      }
    }
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleCancel = () => {
    setCategoryId('');
    setSubCategoryName('');
    setSubCategoryCode('');
    setEditingId(null);
    setCategorySearch('');
    setShowCategoryDropdown(false);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = subCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(subCategories.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Scroll to selected item in dropdown
  const scrollToSelectedItem = (index, selector) => {
    setTimeout(() => {
      const dropdown = document.querySelector(selector);
      if (dropdown) {
        const items = dropdown.querySelectorAll('div[role="option"], div.px-3.py-2');
        if (items[index]) {
          items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isDropdownOpen = showCategoryDropdown;

      // Handle Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        } else if (isDropdownOpen) {
          setShowCategoryDropdown(false);
          setSelectedCategoryIndex(-1);
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

      // Handle ArrowDown
      if (e.key === 'ArrowDown') {
        if (isDropdownOpen && filteredCategories.length > 0) {
          e.preventDefault();
          setSelectedCategoryIndex(prev => {
            const newIndex = prev < 0 ? 0 : Math.min(prev + 1, filteredCategories.length - 1);
            scrollToSelectedItem(newIndex, '.absolute.z-50.w-full.mt-1.bg-white.border.border-gray-300.rounded-md.shadow-lg.max-h-48.overflow-y-auto');
            return newIndex;
          });
        } else if (!loading && !showDeleteConfirm && activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'BUTTON') {
          e.preventDefault();
          setSelectedRow(prev => Math.min(prev + 1, currentItems.length - 1));
          setSelectedAction(-1);
        }
        return;
      }

      // Handle ArrowUp
      if (e.key === 'ArrowUp') {
        if (isDropdownOpen && filteredCategories.length > 0) {
          e.preventDefault();
          setSelectedCategoryIndex(prev => Math.max(prev - 1, 0));
          scrollToSelectedItem(selectedCategoryIndex - 1, '.absolute.z-50.w-full.mt-1.bg-white.border.border-gray-300.rounded-md.shadow-lg.max-h-48.overflow-y-auto');
        } else if (!loading && !showDeleteConfirm && activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'BUTTON') {
          e.preventDefault();
          setSelectedRow(prev => Math.max(prev - 1, 0));
          setSelectedAction(-1);
        }
        return;
      }

      // Handle Enter key
      if (e.key === 'Enter') {
        // If we're on a button (Add/Update), let Enter key click it
        if (activeElement.tagName === 'BUTTON' && !isDropdownOpen) {
          // Allow default behavior - button will be clicked
          return;
        }

        // If dropdown is open and item is selected
        if (isDropdownOpen && selectedCategoryIndex >= 0 && filteredCategories[selectedCategoryIndex]) {
          e.preventDefault();
          handleCategorySelect(filteredCategories[selectedCategoryIndex]);
          setSelectedCategoryIndex(-1);
          // Move to next field
          setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
              const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]), button[type="submit"]'));
              const categoryInput = inputs[0];
              const currentIndex = inputs.indexOf(categoryInput);
              if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus();
              }
            }
          }, 100);
          return;
        }

        // Execute table action
        if (!loading && !showDeleteConfirm && activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'BUTTON') {
          e.preventDefault();
          if (currentItems.length > 0 && selectedRow >= 0 && selectedRow < currentItems.length) {
            const selectedSubCategory = currentItems[selectedRow];
            if (selectedAction === 0) {
              handleEdit(selectedSubCategory);
              setTimeout(() => firstInputRef.current?.focus(), 100);
            } else if (selectedAction === 1) {
              confirmDelete(selectedSubCategory.id);
            }
          }
        } else if (activeElement.tagName === 'INPUT' && !isDropdownOpen) {
          // Move to next field
          e.preventDefault();
          const form = document.querySelector('form');
          if (form) {
            const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]), button[type="submit"]'));
            const currentIndex = inputs.indexOf(activeElement);
            if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
              inputs[currentIndex + 1].focus();
            }
          }
        }
        return;
      }

      // Handle Shift + ArrowLeft and ArrowRight for field navigation
      if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'BUTTON') {
          e.preventDefault();
          // Close dropdown when navigating
          if (isDropdownOpen) {
            setShowCategoryDropdown(false);
            setSelectedCategoryIndex(-1);
          }

          const form = document.querySelector('form');
          if (form) {
            const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]), button[type="submit"], button[type="button"]'));
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
        } else if (!loading && !showDeleteConfirm) {
          e.preventDefault();
          if (e.key === 'ArrowLeft') {
            setSelectedAction(prev => Math.max(prev - 1, -1));
          } else {
            setSelectedAction(prev => Math.min(prev + 1, 1));
          }
        }
        return;
      }
      // Normal arrow keys (without Shift) work for text cursor movement
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteConfirm, showCategoryDropdown, selectedCategoryIndex, filteredCategories, currentItems, selectedRow, selectedAction, loading, totalPages]);

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
              <h3 className="text-sm font-semibold text-gray-900">Delete Sub-Category</h3>
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
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
        <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {editingId ? 'Edit Sub-Category' : 'Add New Sub-Category'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="relative">
              <input
                ref={firstInputRef}
                type="text"
                value={categorySearch}
                onChange={handleCategoryInputChange}
                onFocus={() => setShowCategoryDropdown(true)}
                onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                required
                className="w-full px-2.5 py-1.5 pr-8 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                placeholder="Search Category..."
              />
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <input type="hidden" value={categoryId} required />

              {showCategoryDropdown && filteredCategories.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredCategories.map((category, index) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className={`px-3 py-2 text-xs hover:bg-purple-50 cursor-pointer transition-colors ${
                        index === selectedCategoryIndex ? 'bg-purple-100' : ''
                      }`}
                    >
                      {category.category_name}
                    </div>
                  ))}
                </div>
              )}

              {showCategoryDropdown && filteredCategories.length === 0 && categorySearch && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="px-3 py-2 text-xs text-gray-500">No categories found</div>
                </div>
              )}
            </div>
            <input
              type="text"
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
              required
              className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
              placeholder="Sub-Category Name"
            />
            <input
              type="text"
              value={subCategoryCode}
              onChange={(e) => setSubCategoryCode(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
              placeholder="Sub-Category Code"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
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
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Sub-Categories List
          </h3>
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-medium">
            Total: {subCategories.length}
          </span>
        </div>

        <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Sub-Category
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
                    <td colSpan="5" className="px-3 py-8 text-center text-xs text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>No sub-categories found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((subCategory, index) => (
                    <tr key={subCategory.id} className={`hover:bg-purple-50 transition-colors ${
                      index === selectedRow ? 'bg-yellow-50 ring-2 ring-yellow-400' : ''
                    }`}>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-gray-900">
                        {subCategory.id}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                          {subCategory.category_name}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {subCategory.sub_category_name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full font-medium">
                          {subCategory.sub_category_code}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(subCategory)}
                            className={`p-1 text-purple-600 hover:bg-purple-100 rounded transition-all ${
                              index === selectedRow && selectedAction === 0 ? 'ring-2 ring-purple-400 bg-purple-100' : ''
                            }`}
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => confirmDelete(subCategory.id)}
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
                  className="pagination-btn px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`pagination-btn px-3 py-1.5 text-sm border rounded font-medium transition focus:ring-2 focus:ring-purple-500 focus:outline-none ${
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
                  className="pagination-btn px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
