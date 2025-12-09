'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';

export default function ProductEntry() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const router = useRouter();

  const [productName, setProductName] = useState('');
  const [barcodeItem, setBarcodeItem] = useState('');
  const [barcodeBox, setBarcodeBox] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Search states for dropdowns
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [filteredCategoriesForSearch, setFilteredCategoriesForSearch] = useState([]);

  const [subCategorySearch, setSubCategorySearch] = useState('');
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);
  const [filteredSubCategoriesForSearch, setFilteredSubCategoriesForSearch] = useState([]);

  const [brandSearch, setBrandSearch] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [filteredBrandsForSearch, setFilteredBrandsForSearch] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewingProduct, setViewingProduct] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Toast and delete confirmation
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Refs for dropdown click-outside detection
  const categoryDropdownRef = useRef(null);
  const subCategoryDropdownRef = useRef(null);
  const brandDropdownRef = useRef(null);

  // Keyboard navigation states for dropdowns
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);
  const [selectedSubCategoryIndex, setSelectedSubCategoryIndex] = useState(-1);
  const [selectedBrandIndex, setSelectedBrandIndex] = useState(-1);

  // Keyboard navigation states for product table
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedAction, setSelectedAction] = useState(-1); // -1 means no action selected, 0=view, 1=edit, 2=delete

  // Ref for modal close button
  const closeButtonRef = useRef(null);

  // Ref for first input field (Product Name)
  const firstInputRef = useRef(null);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    const userData = localStorage.getItem('inventoryUser');
    if (!userData) {
      router.push('/');
    }
    loadCategories();
    loadSubCategories();
    loadBrands();
    loadProducts();
  }, [router]);

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

  useEffect(() => {
    if (categoryId) {
      const filtered = subCategories.filter(
        (sub) => sub.category_id === parseInt(categoryId)
      );
      setFilteredSubCategories(filtered);
      setSubCategoryId('');
      setSubCategorySearch(''); // Clear sub-category search when category changes
    } else {
      setFilteredSubCategories([]);
      setSubCategoryId('');
      setSubCategorySearch(''); // Clear sub-category search when no category selected
    }
  }, [categoryId, subCategories]);

  // Filter categories for search
  useEffect(() => {
    if (categorySearch) {
      const filtered = categories.filter(cat =>
        cat.category_name.toLowerCase().includes(categorySearch.toLowerCase())
      );
      setFilteredCategoriesForSearch(filtered);
    } else {
      setFilteredCategoriesForSearch(categories);
    }
  }, [categorySearch, categories]);

  // Filter sub-categories for search (based on selected category)
  useEffect(() => {
    if (subCategorySearch) {
      const filtered = filteredSubCategories.filter(sub =>
        sub.sub_category_name.toLowerCase().includes(subCategorySearch.toLowerCase())
      );
      setFilteredSubCategoriesForSearch(filtered);
    } else {
      setFilteredSubCategoriesForSearch(filteredSubCategories);
    }
  }, [subCategorySearch, filteredSubCategories]);

  // Filter brands for search
  useEffect(() => {
    if (brandSearch) {
      const filtered = brands.filter(brand =>
        brand.brand_name.toLowerCase().includes(brandSearch.toLowerCase())
      );
      setFilteredBrandsForSearch(filtered);
    } else {
      setFilteredBrandsForSearch(brands);
    }
  }, [brandSearch, brands]);

  // Helper function to scroll to selected item in dropdown
  const scrollToSelectedItem = (index, dropdownClass) => {
    setTimeout(() => {
      const dropdown = document.querySelector(dropdownClass);
      if (dropdown) {
        const items = dropdown.children;
        if (items[index]) {
          items[index].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start'
          });
        }
      }
    }, 0);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (subCategoryDropdownRef.current && !subCategoryDropdownRef.current.contains(event.target)) {
        setShowSubCategoryDropdown(false);
      }
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target)) {
        setShowBrandDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isDropdownOpen = showCategoryDropdown || showSubCategoryDropdown || showBrandDropdown;

      // Handle Escape key to close modals and dropdowns
      if (e.key === 'Escape') {
        e.preventDefault();
        if (viewingProduct) {
          setViewingProduct(null);
        } else if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        } else if (isDropdownOpen) {
          // Close all dropdowns
          setShowCategoryDropdown(false);
          setShowSubCategoryDropdown(false);
          setShowBrandDropdown(false);
          setSelectedCategoryIndex(-1);
          setSelectedSubCategoryIndex(-1);
          setSelectedBrandIndex(-1);
        } else if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'BUTTON') {
          // If in table area, move focus back to first input field
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
          // Remove focus from any input/button and activate table navigation
          activeElement.blur();
          setSelectedRow(0);
          setSelectedAction(-1);
        }
        return;
      }

      // Handle Tab key for sequential navigation (works even with dropdowns)
      if (e.key === 'Tab') {
        // Close dropdowns when tabbing
        if (isDropdownOpen) {
          setShowCategoryDropdown(false);
          setShowSubCategoryDropdown(false);
          setShowBrandDropdown(false);
          setSelectedCategoryIndex(-1);
          setSelectedSubCategoryIndex(-1);
          setSelectedBrandIndex(-1);
        }
        // Let default tab behavior work
        return;
      }

      // Handle ArrowDown - in dropdowns or table navigation
      if (e.key === 'ArrowDown') {
        if (isDropdownOpen) {
          e.preventDefault();
          if (showCategoryDropdown && filteredCategoriesForSearch.length > 0) {
            setSelectedCategoryIndex(prev => {
              const newIndex = prev < 0 ? 0 : Math.min(prev + 1, filteredCategoriesForSearch.length - 1);
              scrollToSelectedItem(newIndex, '.absolute.z-50.w-full.mt-1.bg-white.border.border-gray-300.rounded-md.shadow-lg.max-h-48.overflow-y-auto');
              return newIndex;
            });
          } else if (showSubCategoryDropdown && filteredSubCategoriesForSearch.length > 0) {
            setSelectedSubCategoryIndex(prev => {
              const newIndex = prev < 0 ? 0 : Math.min(prev + 1, filteredSubCategoriesForSearch.length - 1);
              scrollToSelectedItem(newIndex, '.absolute.z-50.w-full.mt-1.bg-white.border.border-gray-300.rounded-md.shadow-lg.max-h-48.overflow-y-auto');
              return newIndex;
            });
          } else if (showBrandDropdown && filteredBrandsForSearch.length > 0) {
            setSelectedBrandIndex(prev => {
              const newIndex = prev < 0 ? 0 : Math.min(prev + 1, filteredBrandsForSearch.length - 1);
              scrollToSelectedItem(newIndex, '.absolute.z-50.w-full.mt-1.bg-white.border.border-gray-300.rounded-md.shadow-lg.max-h-48.overflow-y-auto');
              return newIndex;
            });
          }
        } else if (!loading && !viewingProduct && !showDeleteConfirm && activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'BUTTON') {
          // Navigate table rows
          e.preventDefault();
          setSelectedRow(prev => Math.min(prev + 1, currentItems.length - 1));
          setSelectedAction(-1);
        }
        return;
      }

      // Handle ArrowUp - in dropdowns or table navigation
      if (e.key === 'ArrowUp') {
        if (isDropdownOpen) {
          e.preventDefault();
          if (showCategoryDropdown) {
            setSelectedCategoryIndex(prev => {
              const newIndex = Math.max(prev - 1, 0);
              scrollToSelectedItem(newIndex, '.absolute.z-50.w-full.mt-1.bg-white.border.border-gray-300.rounded-md.shadow-lg.max-h-48.overflow-y-auto');
              return newIndex;
            });
          } else if (showSubCategoryDropdown) {
            setSelectedSubCategoryIndex(prev => {
              const newIndex = Math.max(prev - 1, 0);
              scrollToSelectedItem(newIndex, '.absolute.z-50.w-full.mt-1.bg-white.border.border-gray-300.rounded-md.shadow-lg.max-h-48.overflow-y-auto');
              return newIndex;
            });
          } else if (showBrandDropdown) {
            setSelectedBrandIndex(prev => {
              const newIndex = Math.max(prev - 1, 0);
              scrollToSelectedItem(newIndex, '.absolute.z-50.w-full.mt-1.bg-white.border.border-gray-300.rounded-md.shadow-lg.max-h-48.overflow-y-auto');
              return newIndex;
            });
          }
        } else if (!loading && !viewingProduct && !showDeleteConfirm && activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'BUTTON') {
          // Navigate table rows
          e.preventDefault();
          setSelectedRow(prev => Math.max(prev - 1, 0));
          setSelectedAction(-1);
        }
        return;
      }

      // Handle Enter key
      if (e.key === 'Enter') {
        // If a dropdown is open and an item is selected
        if (showCategoryDropdown && selectedCategoryIndex >= 0 && filteredCategoriesForSearch[selectedCategoryIndex]) {
          e.preventDefault();
          handleCategorySelect(filteredCategoriesForSearch[selectedCategoryIndex]);
          setSelectedCategoryIndex(-1);
          // Move focus to next field (Sub-Category)
          setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
              const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]):not([type="file"])'));
              const subCategoryInput = inputs.find(input => input.placeholder?.includes('Sub-Category'));
              if (subCategoryInput) subCategoryInput.focus();
            }
          }, 100);
          return;
        } else if (showSubCategoryDropdown && selectedSubCategoryIndex >= 0 && filteredSubCategoriesForSearch[selectedSubCategoryIndex]) {
          e.preventDefault();
          handleSubCategorySelect(filteredSubCategoriesForSearch[selectedSubCategoryIndex]);
          setSelectedSubCategoryIndex(-1);
          // Move focus to next field (Brand)
          setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
              const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]):not([type="file"])'));
              const brandInput = inputs.find(input => input.placeholder?.includes('Brand'));
              if (brandInput) brandInput.focus();
            }
          }, 100);
          return;
        } else if (showBrandDropdown && selectedBrandIndex >= 0 && filteredBrandsForSearch[selectedBrandIndex]) {
          e.preventDefault();
          handleBrandSelect(filteredBrandsForSearch[selectedBrandIndex]);
          setSelectedBrandIndex(-1);
          // Move focus to file input or submit button
          setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
              const fileInput = form.querySelector('input[type="file"]');
              const submitButton = form.querySelector('button[type="submit"]');
              if (fileInput) {
                fileInput.focus();
              } else if (submitButton) {
                submitButton.focus();
              }
            }
          }, 100);
          return;
        }

        // Check if current element is a button (Add/Update/Cancel)
        if (activeElement && activeElement.tagName === 'BUTTON' &&
            (activeElement.textContent.includes('Add') ||
             activeElement.textContent.includes('Update') ||
             activeElement.textContent.includes('Cancel'))) {
          // Let default behavior happen
          return;
        }

        // If in table and action is selected, execute it
        if (!loading && !viewingProduct && !showDeleteConfirm && selectedAction >= 0 && currentItems.length > 0) {
          e.preventDefault();
          const product = currentItems[selectedRow];
          if (selectedAction === 0) {
            setViewingProduct(product);
          } else if (selectedAction === 1) {
            handleEdit(product);
          } else if (selectedAction === 2) {
            confirmDelete(product.id);
          }
          return;
        }

        // Otherwise, move to next input
        const form = document.querySelector('form');
        if (form && !isDropdownOpen && activeElement.tagName === 'INPUT') {
          const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]), input[type="file"], button[type="submit"]'));
          const currentIndex = inputs.indexOf(activeElement);
          if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
            e.preventDefault();
            inputs[currentIndex + 1].focus();
          }
        }
        return;
      }

      // Handle Left/Right arrow keys
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // If in table navigation mode (not in input/button), navigate actions
        if (!loading && !viewingProduct && !showDeleteConfirm && !isDropdownOpen &&
            activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'BUTTON') {
          e.preventDefault();
          if (e.key === 'ArrowRight') {
            setSelectedAction(prev => Math.min(prev + 1, 2)); // 0=view, 1=edit, 2=delete
          } else if (e.key === 'ArrowLeft') {
            setSelectedAction(prev => Math.max(prev - 1, -1)); // -1=none
          }
          return;
        }

        // Handle form navigation (works even with dropdowns open)
        e.preventDefault();

        // Close all dropdowns
        setShowCategoryDropdown(false);
        setShowSubCategoryDropdown(false);
        setShowBrandDropdown(false);
        setSelectedCategoryIndex(-1);
        setSelectedSubCategoryIndex(-1);
        setSelectedBrandIndex(-1);

        const form = document.querySelector('form');
        if (form) {
          const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]), input[type="file"], button[type="submit"]'));
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

      // Handle F3 key to move to pagination buttons
      if (e.key === 'F3') {
        e.preventDefault();
        const paginationButtons = document.querySelectorAll('.pagination-btn');
        if (paginationButtons.length > 0) {
          paginationButtons[0].focus();
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCategoryDropdown, showSubCategoryDropdown, showBrandDropdown, selectedCategoryIndex, selectedSubCategoryIndex, selectedBrandIndex, filteredCategoriesForSearch, filteredSubCategoriesForSearch, filteredBrandsForSearch, viewingProduct, showDeleteConfirm, currentItems, selectedRow, selectedAction, loading]);

  // Auto-focus on close button when modal opens
  useEffect(() => {
    if (viewingProduct && closeButtonRef.current) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }
  }, [viewingProduct]);

  // Auto-focus on first input field when page loads
  useEffect(() => {
    if (firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, []);

  const loadCategories = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.getCategories();
      if (result.success) {
        setCategories(result.data);
      }
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

  const loadBrands = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.getBrands();
      if (result.success) {
        setBrands(result.data);
      }
    }
  };

  const loadProducts = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.getProducts();
      if (result.success) {
        setProducts(result.data);
      }
    }
  };

  // Category search handlers
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

  // Sub-Category search handlers
  const handleSubCategorySelect = (subCategory) => {
    setSubCategoryId(subCategory.id.toString());
    setSubCategorySearch(subCategory.sub_category_name);
    setShowSubCategoryDropdown(false);
  };

  const handleSubCategoryInputChange = (e) => {
    setSubCategorySearch(e.target.value);
    setShowSubCategoryDropdown(true);
    if (!e.target.value) {
      setSubCategoryId('');
    }
  };

  // Brand search handlers
  const handleBrandSelect = (brand) => {
    setBrandId(brand.id.toString());
    setBrandSearch(brand.brand_name);
    setShowBrandDropdown(false);
  };

  const handleBrandInputChange = (e) => {
    setBrandSearch(e.target.value);
    setShowBrandDropdown(true);
    if (!e.target.value) {
      setBrandId('');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const productData = {
          productName,
          barcodeItem: barcodeItem || null,
          barcodeBox: barcodeBox || null,
          categoryId: categoryId ? parseInt(categoryId) : null,
          subCategoryId: subCategoryId ? parseInt(subCategoryId) : null,
          brandId: brandId ? parseInt(brandId) : null,
          imagePath: imagePreview || null
        };

        let result;
        if (editingId) {
          productData.id = editingId;
          result = await window.electronAPI.updateProduct(productData);
        } else {
          result = await window.electronAPI.addProduct(productData);
        }

        if (result.success) {
          showToast('success', editingId ? 'Updated!' : 'Added!');
          resetForm();
          loadProducts();
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

  const resetForm = () => {
    setProductName('');
    setBarcodeItem('');
    setBarcodeBox('');
    setCategoryId('');
    setSubCategoryId('');
    setBrandId('');
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
    // Clear search fields
    setCategorySearch('');
    setSubCategorySearch('');
    setBrandSearch('');
  };

  const handleEdit = (product) => {
    setProductName(product.product_name || '');
    setBarcodeItem(product.barcode_item);
    setBarcodeBox(product.barcode_box || '');
    setCategoryId(product.category_id.toString());
    setSubCategoryId(product.sub_category_id.toString());
    setBrandId(product.brand_id.toString());
    setImagePreview(product.image_path || '');
    setEditingId(product.id);
    // Populate search fields with names
    setCategorySearch(product.category_name);
    setSubCategorySearch(product.sub_category_name);
    setBrandSearch(product.brand_name);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.deleteProduct(deleteId);
      if (result.success) {
        showToast('success', 'Deleted!');
        loadProducts();
      } else {
        showToast('error', result.error || 'Failed to delete');
      }
    }
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar activePage="product-entry" />

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-hidden">
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
                  <h3 className="text-sm font-semibold text-gray-900">Delete Product</h3>
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
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-3 border border-teal-100">
            <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <div className="p-1.5 bg-teal-600 rounded-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <input
                  ref={firstInputRef}
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                  className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Product Name *"
                />
                <input
                  type="text"
                  value={barcodeItem}
                  onChange={(e) => setBarcodeItem(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Barcode Item"
                />
                <input
                  type="text"
                  value={barcodeBox}
                  onChange={(e) => setBarcodeBox(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Barcode Box"
                />
                <div className="relative" ref={categoryDropdownRef}>
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={handleCategoryInputChange}
                    onFocus={() => {
                      setShowCategoryDropdown(true);
                      setSelectedCategoryIndex(-1);
                    }}
                    onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                    className="w-full px-2.5 py-1.5 pr-8 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
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
                  <input type="hidden" value={categoryId} />

                  {showCategoryDropdown && filteredCategoriesForSearch.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredCategoriesForSearch.map((category, index) => (
                        <div
                          key={category.id}
                          onClick={() => handleCategorySelect(category)}
                          className={`px-3 py-2 text-xs hover:bg-teal-50 cursor-pointer transition-colors ${
                            index === selectedCategoryIndex ? 'bg-blue-100' : ''
                          }`}
                        >
                          {category.category_name}
                        </div>
                      ))}
                    </div>
                  )}

                  {showCategoryDropdown && filteredCategoriesForSearch.length === 0 && categorySearch && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      <div className="px-3 py-2 text-xs text-gray-500">
                        No categories found
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="relative" ref={subCategoryDropdownRef}>
                  <input
                    type="text"
                    value={subCategorySearch}
                    onChange={handleSubCategoryInputChange}
                    onFocus={() => {
                      setShowSubCategoryDropdown(true);
                      setSelectedSubCategoryIndex(-1);
                    }}
                    onBlur={() => setTimeout(() => setShowSubCategoryDropdown(false), 200)}
                    disabled={!categoryId}
                    className="w-full px-2.5 py-1.5 pr-8 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Search Sub-Category..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowSubCategoryDropdown(!showSubCategoryDropdown)}
                    disabled={!categoryId}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${showSubCategoryDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <input type="hidden" value={subCategoryId} />

                  {showSubCategoryDropdown && filteredSubCategoriesForSearch.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredSubCategoriesForSearch.map((subCategory, index) => (
                        <div
                          key={subCategory.id}
                          onClick={() => handleSubCategorySelect(subCategory)}
                          className={`px-3 py-2 text-xs hover:bg-teal-50 cursor-pointer transition-colors ${
                            index === selectedSubCategoryIndex ? 'bg-blue-100' : ''
                          }`}
                        >
                          {subCategory.sub_category_name}
                        </div>
                      ))}
                    </div>
                  )}

                  {showSubCategoryDropdown && filteredSubCategoriesForSearch.length === 0 && subCategorySearch && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      <div className="px-3 py-2 text-xs text-gray-500">
                        No sub-categories found
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={brandDropdownRef}>
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={handleBrandInputChange}
                    onFocus={() => {
                      setShowBrandDropdown(true);
                      setSelectedBrandIndex(-1);
                    }}
                    onBlur={() => setTimeout(() => setShowBrandDropdown(false), 200)}
                    className="w-full px-2.5 py-1.5 pr-8 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    placeholder="Search Brand..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${showBrandDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <input type="hidden" value={brandId} />

                  {showBrandDropdown && filteredBrandsForSearch.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredBrandsForSearch.map((brand, index) => (
                        <div
                          key={brand.id}
                          onClick={() => handleBrandSelect(brand)}
                          className={`px-3 py-2 text-xs hover:bg-teal-50 cursor-pointer transition-colors ${
                            index === selectedBrandIndex ? 'bg-blue-100' : ''
                          }`}
                        >
                          {brand.brand_name}
                        </div>
                      ))}
                    </div>
                  )}

                  {showBrandDropdown && filteredBrandsForSearch.length === 0 && brandSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      <div className="px-3 py-2 text-xs text-gray-500">
                        No brands found
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none w-full"
                  />
                </div>
              </div>

              {imagePreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-md border border-gray-300"
                  />
                  <span className="text-xs text-gray-600">Image uploaded</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 text-xs bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Add'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
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
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Products List
              </h3>
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-medium">
                Total: {products.length}
              </span>
            </div>

            <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-teal-600 to-cyan-600 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Barcode Item
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Barcode Box
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Sub-Category
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-3 py-8 text-center text-xs text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <span>No products found</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((product, index) => (
                        <tr key={product.id} className={`hover:bg-teal-50 transition-colors ${
                          index === selectedRow ? 'bg-yellow-50 ring-2 ring-yellow-400' : ''
                        }`}>
                          <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-gray-900">
                            {product.id}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {product.product_name}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full font-medium">
                              {product.barcode_item}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {product.barcode_box || '-'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {product.category_name}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {product.sub_category_name}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {product.brand_name}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                            <div className="flex gap-1">
                              <button
                                onClick={() => setViewingProduct(product)}
                                className={`p-1 text-blue-600 hover:bg-blue-100 rounded transition-all ${
                                  index === selectedRow && selectedAction === 0 ? 'ring-2 ring-blue-400 bg-blue-100' : ''
                                }`}
                                title="View"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEdit(product)}
                                className={`p-1 text-teal-600 hover:bg-teal-100 rounded transition-all ${
                                  index === selectedRow && selectedAction === 1 ? 'ring-2 ring-teal-400 bg-teal-100' : ''
                                }`}
                                title="Edit"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => confirmDelete(product.id)}
                                className={`p-1 text-red-600 hover:bg-red-100 rounded transition-all ${
                                  index === selectedRow && selectedAction === 2 ? 'ring-2 ring-red-400 bg-red-100' : ''
                                }`}
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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

              {/* Pagination - Compact */}
              {products.length > 0 && totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`pagination-btn px-3 py-1.5 text-sm border rounded font-medium transition focus:ring-2 focus:ring-teal-500 focus:outline-none ${
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
                      className="pagination-btn px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* View Product Modal */}
          {viewingProduct && (
            <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
                <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-4 rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Product Details</h3>
                    <button
                      onClick={() => setViewingProduct(null)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Product Image */}
                  {viewingProduct.image_path && (
                    <div className="flex justify-center">
                      <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg">
                        <img
                          src={viewingProduct.image_path}
                          alt={viewingProduct.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Product Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-3 rounded-lg border border-teal-200">
                      <p className="text-xs text-teal-600 uppercase font-semibold mb-1">Product Name</p>
                      <p className="text-sm font-bold text-gray-900">{viewingProduct.product_name}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Item Barcode</p>
                      <p className="text-sm font-medium text-gray-800">{viewingProduct.barcode_item}</p>
                    </div>

                    {viewingProduct.barcode_box && (
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Box Barcode</p>
                        <p className="text-sm font-medium text-gray-800">{viewingProduct.barcode_box}</p>
                      </div>
                    )}

                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-600 uppercase font-semibold mb-1">Category</p>
                      <p className="text-sm font-medium text-purple-900">{viewingProduct.category_name}</p>
                    </div>

                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                      <p className="text-xs text-indigo-600 uppercase font-semibold mb-1">Sub-Category</p>
                      <p className="text-sm font-medium text-indigo-900">{viewingProduct.sub_category_name}</p>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-600 uppercase font-semibold mb-1">Brand</p>
                      <p className="text-sm font-medium text-amber-900">{viewingProduct.brand_name}</p>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 p-3 rounded-b-xl border-t border-gray-200">
                  <button
                    ref={closeButtonRef}
                    onClick={() => setViewingProduct(null)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-semibold text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
