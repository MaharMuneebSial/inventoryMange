'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormKeyboard } from '../lib/useGlobalKeyboard';

export default function Sale() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Product selection
  const [selectedProductId, setSelectedProductId] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [amountInRupees, setAmountInRupees] = useState(''); // For weight-based items

  // Searchable dropdown states
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [filteredProductsForSearch, setFilteredProductsForSearch] = useState([]);

  const [unitSearch, setUnitSearch] = useState('');
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [units, setUnits] = useState([]);
  const [filteredUnitsForSearch, setFilteredUnitsForSearch] = useState([]);

  // Cart calculations
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' or 'percent'
  const [tax, setTax] = useState(0);
  const [taxRate, setTaxRate] = useState(0); // percentage
  const [grandTotal, setGrandTotal] = useState(0);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [changeDue, setChangeDue] = useState(0);
  const [notes, setNotes] = useState('');

  // User info
  const [soldBy, setSoldBy] = useState('');

  // Keyboard navigation states
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(-1);
  const [selectedSearchResultIndex, setSelectedSearchResultIndex] = useState(-1);

  const barcodeInputRef = useRef(null);
  const amountReceivedRef = useRef(null);
  const unitDropdownRef = useRef(null);
  const productDropdownRef = useRef(null);

  useEffect(() => {
    loadProducts();
    loadUnits();
    loadUserInfo();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [cart, discount, discountType, taxRate]);

  useEffect(() => {
    if (amountReceived) {
      setChangeDue(parseFloat(amountReceived) - grandTotal);
    } else {
      setChangeDue(0);
    }
  }, [amountReceived, grandTotal]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, type: '', message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Filter products for search
  useEffect(() => {
    if (productSearch) {
      const filtered = products.filter(product =>
        product.product_name.toLowerCase().includes(productSearch.toLowerCase())
      );
      setFilteredProductsForSearch(filtered);
    } else {
      setFilteredProductsForSearch(products);
    }
  }, [productSearch, products]);

  // Filter units for search
  useEffect(() => {
    if (unitSearch) {
      const filtered = units.filter(unit =>
        unit.label.toLowerCase().includes(unitSearch.toLowerCase())
      );
      setFilteredUnitsForSearch(filtered);
    } else {
      setFilteredUnitsForSearch(units);
    }
  }, [unitSearch, units]);

  // Auto-focus amount received field when cart has items
  useEffect(() => {
    if (cart.length > 0 && amountReceivedRef.current) {
      amountReceivedRef.current.focus();
    }
  }, [cart.length]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target)) {
        setShowUnitDropdown(false);
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll to selected item in dropdown
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isDropdownOpen = showProductDropdown || showUnitDropdown || showSearchResults;

      // Handle ArrowDown in dropdowns
      if (e.key === 'ArrowDown' && isDropdownOpen) {
        e.preventDefault();

        if (showProductDropdown && filteredProductsForSearch.length > 0) {
          setSelectedProductIndex(prev => {
            const newIndex = Math.min(prev + 1, filteredProductsForSearch.length - 1);
            scrollToSelectedItem(newIndex, '.absolute.z-50.w-full.mt-1.bg-white.border');
            return newIndex;
          });
        } else if (showUnitDropdown && filteredUnitsForSearch.length > 0) {
          setSelectedUnitIndex(prev => {
            const newIndex = Math.min(prev + 1, filteredUnitsForSearch.length - 1);
            scrollToSelectedItem(newIndex, '.absolute.z-50.w-full.mt-1.bg-white.border');
            return newIndex;
          });
        } else if (showSearchResults && searchResults.length > 0) {
          setSelectedSearchResultIndex(prev => {
            const newIndex = Math.min(prev + 1, searchResults.length - 1);
            scrollToSelectedItem(newIndex, '.absolute.z-50.w-full.mt-1.bg-white.border');
            return newIndex;
          });
        }
        return;
      }

      // Handle ArrowUp in dropdowns
      if (e.key === 'ArrowUp' && isDropdownOpen) {
        e.preventDefault();

        if (showProductDropdown) {
          setSelectedProductIndex(prev => {
            const newIndex = Math.max(prev - 1, 0);
            scrollToSelectedItem(newIndex, '.absolute.z-50.w-full.mt-1.bg-white.border');
            return newIndex;
          });
        } else if (showUnitDropdown) {
          setSelectedUnitIndex(prev => {
            const newIndex = Math.max(prev - 1, 0);
            scrollToSelectedItem(newIndex, '.absolute.z-50.w-full.mt-1.bg-white.border');
            return newIndex;
          });
        } else if (showSearchResults) {
          setSelectedSearchResultIndex(prev => {
            const newIndex = Math.max(prev - 1, 0);
            scrollToSelectedItem(newIndex, '.absolute.z-50.w-full.mt-1.bg-white.border');
            return newIndex;
          });
        }
        return;
      }

      // Handle Enter key
      if (e.key === 'Enter') {
        if (isDropdownOpen) {
          e.preventDefault();

          if (showProductDropdown && selectedProductIndex >= 0) {
            const selectedProduct = filteredProductsForSearch[selectedProductIndex];
            if (selectedProduct) {
              handleProductSelectFromDropdown(selectedProduct);
              setSelectedProductIndex(-1);
            }
          } else if (showUnitDropdown && selectedUnitIndex >= 0) {
            const selectedUnit = filteredUnitsForSearch[selectedUnitIndex];
            if (selectedUnit) {
              handleUnitSelectFromDropdown(selectedUnit.value, selectedUnit.label);
              setSelectedUnitIndex(-1);
            }
          } else if (showSearchResults && selectedSearchResultIndex >= 0) {
            const selectedResult = searchResults[selectedSearchResultIndex];
            if (selectedResult) {
              selectSearchResult(selectedResult);
              setSelectedSearchResultIndex(-1);
            }
          }

          // Move to next field
          const formElements = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea, button[type="button"], button:not([type="submit"])')).filter(el => !el.disabled && !el.readOnly && el.offsetParent !== null);
          const currentIndex = formElements.indexOf(activeElement);
          if (currentIndex >= 0 && currentIndex < formElements.length - 1) {
            formElements[currentIndex + 1].focus();
          }
          return;
        } else {
          // Check if current element is "Add to Cart" button
          if (activeElement && activeElement.textContent && activeElement.textContent.includes('Add to Cart')) {
            e.preventDefault();
            // Click the button to add to cart
            activeElement.click();
            // The addToCart function will handle focusing back to barcode input
            return;
          }

          // Regular Enter key navigation (move to next field)
          e.preventDefault();
          const formElements = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea, button')).filter(el => !el.disabled && !el.readOnly && el.offsetParent !== null);
          const currentIndex = formElements.indexOf(activeElement);
          if (currentIndex >= 0 && currentIndex < formElements.length - 1) {
            formElements[currentIndex + 1].focus();
          }
        }
      }

      // Handle Shift + Left/Right arrow keys for field navigation
      if (e.shiftKey && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const formElements = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea, button')).filter(el => !el.disabled && !el.readOnly && el.offsetParent !== null);
        const currentIndex = formElements.indexOf(activeElement);

        // Close all dropdowns
        setShowProductDropdown(false);
        setShowUnitDropdown(false);
        setShowSearchResults(false);
        setSelectedProductIndex(-1);
        setSelectedUnitIndex(-1);
        setSelectedSearchResultIndex(-1);

        if (e.key === 'ArrowRight' && currentIndex < formElements.length - 1) {
          formElements[currentIndex + 1].focus();
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
          formElements[currentIndex - 1].focus();
        }
        return;
      }

      // Normal arrow keys (without Shift) work for text cursor movement

      // Handle Up/Down arrows (only when dropdown closed)
      if (['ArrowUp', 'ArrowDown'].includes(e.key) && !isDropdownOpen) {
        e.preventDefault();
        const formElements = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea, button')).filter(el => !el.disabled && !el.readOnly && el.offsetParent !== null);
        const currentIndex = formElements.indexOf(activeElement);

        if (e.key === 'ArrowDown' && currentIndex < formElements.length - 1) {
          formElements[currentIndex + 1].focus();
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
          formElements[currentIndex - 1].focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showProductDropdown, showUnitDropdown, showSearchResults, selectedProductIndex, selectedUnitIndex, selectedSearchResultIndex, filteredProductsForSearch, filteredUnitsForSearch, searchResults]);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const loadUserInfo = () => {
    const userData = localStorage.getItem('inventoryUser');
    if (userData) {
      const user = JSON.parse(userData);
      setSoldBy(user.username || user.email || 'Unknown');
    }
  };

  const loadProducts = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.getProductsWithStock();
      if (result.success) {
        setProducts(result.data);
      }
    }
  };

  const loadUnits = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.getUnits();
      if (result.success) {
        // Transform units from backend to match the dropdown format
        const formattedUnits = result.data.map(unit => ({
          value: unit.unit_code.toLowerCase(),
          label: unit.unit_name
        }));
        setUnits(formattedUnits);
      }
    }
  };

  // Product dropdown search handlers
  const handleProductSearchInputChange = (e) => {
    setProductSearch(e.target.value);
    setShowProductDropdown(true);
    if (!e.target.value) {
      setSelectedProductId('');
    }
  };

  const handleProductSelectFromDropdown = (product) => {
    setSelectedProductId(product.id);
    setProductSearch(product.product_name);
    setShowProductDropdown(false);
    const selectedUnit = product.base_unit || 'pcs';
    setUnit(selectedUnit);
    const unitLabel = units.find(u => u.value === selectedUnit)?.label || selectedUnit.toUpperCase();
    setUnitSearch(unitLabel);
    setQuantity('1');
  };

  // Unit dropdown search handlers
  const handleUnitSearchInputChange = (e) => {
    setUnitSearch(e.target.value);
    setShowUnitDropdown(true);
    if (!e.target.value) {
      setUnit('');
    }
  };

  const handleUnitSelectFromDropdown = (unitValue, unitLabel) => {
    setUnit(unitValue);
    setUnitSearch(unitLabel);
    setShowUnitDropdown(false);
    // Reset rupee amount when unit changes
    setAmountInRupees('');
  };

  // Calculate quantity from rupee amount (for weight-based items)
  const handleAmountInRupeesChange = (e) => {
    const amount = e.target.value;
    setAmountInRupees(amount);

    // Only calculate if unit is kg or g and product is selected and amount is valid
    const currentUnit = unit.toLowerCase();
    const isWeightUnit = currentUnit === 'kg' || currentUnit === 'g' ||
                        unitSearch.toLowerCase() === 'kg' || unitSearch.toLowerCase().includes('gram');

    if (!amount || !selectedProductId || !isWeightUnit) {
      return;
    }

    const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));
    if (!selectedProduct || !selectedProduct.sale_price) {
      return;
    }

    const amountValue = parseFloat(amount);
    const salePrice = selectedProduct.sale_price; // Price per KG

    if (amountValue > 0 && salePrice > 0) {
      // Calculate weight in KG
      let weightInKg = amountValue / salePrice;

      // Check if unit is grams (either from unit state or unitSearch display)
      const isGrams = currentUnit === 'g' || unitSearch.toLowerCase().includes('gram');

      if (isGrams) {
        const weightInGrams = weightInKg * 1000;
        setQuantity(weightInGrams.toFixed(3));
      } else {
        setQuantity(weightInKg.toFixed(3));
      }
    }
  };

  const handleSearchProduct = async (query) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.searchPurchaseProducts(query);
      if (result.success) {
        setSearchResults(result.data);
        setShowSearchResults(true);
      }
    }
  };

  const selectSearchResult = (product) => {
    setSelectedProductId(product.product_id);
    const selectedUnit = product.unit || 'pcs';
    setUnit(selectedUnit);
    const unitLabel = units.find(u => u.value === selectedUnit)?.label || selectedUnit.toUpperCase();
    setUnitSearch(unitLabel);
    setQuantity('1');
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleBarcodeInput = (e) => {
    const barcode = e.target.value;
    setBarcodeInput(barcode);

    if (barcode.length >= 3) {
      const product = products.find(p =>
        p.barcode_item === barcode || p.barcode_box === barcode
      );

      if (product) {
        if (product.barcode_box === barcode) {
          // Box barcode scanned
          addToCart(product, product.items_per_box || 1, 'box');
        } else {
          // Item barcode scanned
          setSelectedProductId(product.id);
          setUnit(product.base_unit || 'pcs');
          setQuantity('1');
        }
        setBarcodeInput('');
      }
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      const selectedUnit = product.base_unit || 'pcs';
      setUnit(selectedUnit);
      const unitLabel = units.find(u => u.value === selectedUnit)?.label || selectedUnit.toUpperCase();
      setUnitSearch(unitLabel);
      setQuantity('1');
    }
  };

  const addToCart = (product = null, qty = null, unitType = null) => {
    const selectedProduct = product || products.find(p => p.id === parseInt(selectedProductId));

    if (!selectedProduct) {
      showToast('error', 'Please select a product');
      return;
    }

    const qtyValue = qty || parseFloat(quantity);
    const unitValue = unitType || unit;

    if (!qtyValue || qtyValue <= 0) {
      showToast('error', 'Please enter valid quantity');
      return;
    }

    // Check stock availability
    let requiredStock = qtyValue;

    // Convert to base unit for stock checking
    if (unitValue === 'g' && selectedProduct.base_unit === 'kg') {
      requiredStock = qtyValue / 1000;
    } else if (unitValue === 'box' && selectedProduct.items_per_box) {
      requiredStock = qtyValue * selectedProduct.items_per_box;
    }

    if (selectedProduct.available_stock < requiredStock) {
      showToast('error', `Insufficient stock! Available: ${selectedProduct.available_stock} ${selectedProduct.base_unit}`);
      return;
    }

    // Calculate rate per unit based on base unit
    let ratePerUnit = selectedProduct.sale_price;

    if (unitValue === 'g' && selectedProduct.base_unit === 'kg') {
      ratePerUnit = selectedProduct.sale_price / 1000;
    } else if (unitValue === 'box' && selectedProduct.box_price) {
      ratePerUnit = selectedProduct.box_price;
    }

    const lineTotal = qtyValue * ratePerUnit;

    // Check if product already in cart (case-insensitive unit comparison)
    const existingItemIndex = cart.findIndex(item =>
      item.product_id === selectedProduct.id && item.unit.toLowerCase() === unitValue.toLowerCase()
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += qtyValue;
      newCart[existingItemIndex].line_total = newCart[existingItemIndex].quantity * ratePerUnit;
      setCart(newCart);
    } else {
      // Add new item
      const cartItem = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.product_name,
        barcode: selectedProduct.barcode_item,
        quantity: qtyValue,
        unit: unitValue.toLowerCase(), // Store unit in lowercase for consistency
        rate_per_unit: ratePerUnit,
        line_total: lineTotal,
        available_stock: selectedProduct.available_stock,
        base_unit: selectedProduct.base_unit
      };
      setCart([...cart, cartItem]);
    }

    // Reset selection
    setSelectedProductId('');
    setQuantity('');
    setBarcodeInput('');
    setProductSearch('');
    setUnitSearch('');
    setAmountInRupees('');

    // Focus back to barcode input
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const updateCartQuantity = (index, newQuantity) => {
    const item = cart[index];
    const qtyValue = parseFloat(newQuantity);

    if (!qtyValue || qtyValue <= 0) {
      removeFromCart(index);
      return;
    }

    // Check stock
    let requiredStock = qtyValue;
    if (item.unit === 'g' && item.base_unit === 'kg') {
      requiredStock = qtyValue / 1000;
    } else if (item.unit === 'box') {
      requiredStock = qtyValue * (item.items_per_box || 1);
    }

    if (item.available_stock < requiredStock) {
      showToast('error', `Insufficient stock! Available: ${item.available_stock} ${item.base_unit}`);
      return;
    }

    const newCart = [...cart];
    newCart[index].quantity = qtyValue;
    newCart[index].line_total = qtyValue * item.rate_per_unit;
    setCart(newCart);
  };

  const calculateTotals = () => {
    // Calculate subtotal
    const sub = cart.reduce((sum, item) => sum + item.line_total, 0);
    setSubtotal(sub);

    // Calculate discount
    let discountAmount = 0;
    if (discountType === 'percent') {
      discountAmount = (sub * discount) / 100;
    } else {
      discountAmount = parseFloat(discount) || 0;
    }

    // Calculate tax
    const afterDiscount = sub - discountAmount;
    const taxAmount = (afterDiscount * taxRate) / 100;
    setTax(taxAmount);

    // Calculate grand total
    const total = afterDiscount + taxAmount;
    setGrandTotal(total);
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setTax(0);
    setTaxRate(0);
    setAmountReceived('');
    setChangeDue(0);
    setNotes('');
    setProductSearch('');
    setUnitSearch('');
  };

  const completeSale = async () => {
    if (!amountReceived || parseFloat(amountReceived) < grandTotal) {
      showToast('error', 'Amount received must be greater than or equal to grand total');
      return;
    }

    setLoading(true);

    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const saleData = {
          sale_date: new Date().toISOString().split('T')[0],
          sale_time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          subtotal,
          discount: discountType === 'percent' ? (subtotal * discount) / 100 : discount,
          tax,
          grand_total: grandTotal,
          payment_method: paymentMethod,
          amount_received: parseFloat(amountReceived),
          change_due: changeDue,
          sold_by: soldBy,
          notes,
          items: cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit: item.unit,
            rate_per_unit: item.rate_per_unit,
            line_total: item.line_total
          }))
        };

        const result = await window.electronAPI.completeSale(saleData);

        if (result.success) {
          showToast('success', `Sale completed! Invoice: ${result.sale_id}`);
          clearCart();
          loadProducts(); // Reload to update stock
        } else {
          showToast('error', result.error || 'Failed to complete sale');
        }
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Enable form keyboard shortcuts (Ctrl+Enter to complete sale, Ctrl+N to clear cart, Escape to cancel)
  useFormKeyboard({
    onSubmit: completeSale,
    onNew: () => {
      setCart([]);
      setSelectedProductId('');
      setBarcodeInput('');
      setSearchQuery('');
      setQuantity('');
      setUnit('');
      setAmountInRupees('');
      setDiscount(0);
      setTaxRate(0);
      setAmountReceived('');
      setNotes('');
      setProductSearch('');
      setUnitSearch('');
    },
    onCancel: () => {
      setSelectedProductId('');
      setBarcodeInput('');
      setSearchQuery('');
      setQuantity('');
      setUnit('');
      setAmountInRupees('');
      setProductSearch('');
      setUnitSearch('');
    }
  });

  return (
    <div className="h-full flex flex-col space-y-2">
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


      <h2 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
        <div className="p-1.5 bg-teal-600 rounded-lg">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        Point of Sale
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 min-h-0">
        {/* Left: Product Selection */}
        <div className="lg:col-span-2 flex flex-col space-y-2 min-h-0">
          {/* Barcode Scanner and Search */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-2 rounded-lg border border-indigo-100">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Scan Barcode</label>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={handleBarcodeInput}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Scan or enter barcode..."
                  autoFocus
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">Search Product</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchProduct(e.target.value)}
                  onFocus={() => setSelectedSearchResultIndex(-1)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Search by product name..."
                />
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        onClick={() => selectSearchResult(result)}
                        className={`px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                          index === selectedSearchResultIndex ? 'bg-blue-100' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs font-semibold text-gray-900">{result.product_name}</p>
                            <p className="text-xs text-gray-600">
                              Stock: {result.available_stock} {result.unit} | Price: Rs. {result.sale_price}
                            </p>
                          </div>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                            {result.category_name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Manual Product Selection */}
          <div className="bg-white p-2 rounded-lg border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-800 mb-1.5">Manual Selection</h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-2 relative" ref={productDropdownRef}>
                <input
                  type="text"
                  value={productSearch}
                  onChange={handleProductSearchInputChange}
                  onFocus={() => {
                    setShowProductDropdown(true);
                    setSelectedProductIndex(-1);
                  }}
                  onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                  className="w-full px-2.5 py-1.5 pr-8 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Search Product..."
                />
                <button
                  type="button"
                  onClick={() => setShowProductDropdown(!showProductDropdown)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${showProductDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProductDropdown && filteredProductsForSearch.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredProductsForSearch.map((product, index) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelectFromDropdown(product)}
                        className={`px-3 py-2 text-xs hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                          index === selectedProductIndex ? 'bg-blue-100' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{product.product_name}</span>
                          <span className="text-gray-600">({product.available_stock} {product.base_unit})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showProductDropdown && filteredProductsForSearch.length === 0 && productSearch && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="px-3 py-2 text-xs text-gray-500">
                      No products found
                    </div>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Qty"
                  step="0.001"
                />
              </div>
              <div className="relative" ref={unitDropdownRef}>
                <input
                  type="text"
                  value={unitSearch}
                  onChange={handleUnitSearchInputChange}
                  onFocus={() => {
                    setShowUnitDropdown(true);
                    setSelectedUnitIndex(-1);
                  }}
                  onBlur={() => setTimeout(() => setShowUnitDropdown(false), 200)}
                  className="w-full px-2.5 py-1.5 pr-8 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Unit..."
                />
                <button
                  type="button"
                  onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${showUnitDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUnitDropdown && filteredUnitsForSearch.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredUnitsForSearch.map((unitItem, index) => (
                      <div
                        key={unitItem.value}
                        onClick={() => handleUnitSelectFromDropdown(unitItem.value, unitItem.label)}
                        className={`px-3 py-2 text-xs hover:bg-indigo-50 cursor-pointer transition-colors ${
                          index === selectedUnitIndex ? 'bg-blue-100' : ''
                        }`}
                      >
                        {unitItem.label}
                      </div>
                    ))}
                  </div>
                )}

                {showUnitDropdown && filteredUnitsForSearch.length === 0 && unitSearch && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="px-3 py-2 text-xs text-gray-500">
                      No units found
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Amount in Rupees - Only for KG/Gram items */}
            {(unit === 'kg' || unit === 'g' || unitSearch.toLowerCase() === 'kg' || unitSearch.toLowerCase().includes('gram')) && selectedProductId && (
              <div className="mt-2 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <label className="block text-xs font-semibold text-green-800 mb-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Or Enter Amount in Rupees
                </label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={amountInRupees}
                      onChange={handleAmountInRupeesChange}
                      className="w-full px-2.5 py-1.5 text-xs border border-green-300 rounded-md focus:ring-1 focus:ring-green-500 outline-none bg-white"
                      placeholder="Amount (Rs.)"
                      step="0.01"
                    />
                  </div>
                  {amountInRupees && quantity && (
                    <div className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                      = {quantity} {unit === 'kg' ? 'KG' : 'g'}
                      {unit === 'kg' && ` (${(parseFloat(quantity) * 1000).toFixed(0)}g)`}
                    </div>
                  )}
                </div>
                {selectedProductId && (() => {
                  const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));
                  return selectedProduct ? (
                    <div className="mt-1 text-xs text-green-600">
                      Rate: Rs. {selectedProduct.sale_price}/KG
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <button
              onClick={() => addToCart()}
              className="mt-1.5 w-full px-3 py-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-md hover:from-teal-700 hover:to-cyan-700 transition-all text-xs font-semibold"
            >
              Add to Cart
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col min-h-0">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-1.5">
              <h3 className="text-xs font-semibold text-white">Cart Items ({cart.length})</h3>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-teal-600 to-cyan-600 sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5 text-left text-xs font-bold text-white uppercase tracking-wider">Product</th>
                    <th className="px-2 py-1.5 text-left text-xs font-bold text-white uppercase tracking-wider">Qty</th>
                    <th className="px-2 py-1.5 text-left text-xs font-bold text-white uppercase tracking-wider">Unit</th>
                    <th className="px-2 py-1.5 text-left text-xs font-bold text-white uppercase tracking-wider">Rate</th>
                    <th className="px-2 py-1.5 text-left text-xs font-bold text-white uppercase tracking-wider">Total</th>
                    <th className="px-2 py-1.5 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-2 py-6 text-center text-xs text-gray-500">
                        Cart is empty. Scan or select products to add.
                      </td>
                    </tr>
                  ) : (
                    cart.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-2 py-1.5 text-xs text-gray-900">{item.product_name}</td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateCartQuantity(index, e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-16 px-1.5 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            step="0.001"
                          />
                        </td>
                        <td className="px-2 py-1.5 text-xs text-gray-900">{item.unit}</td>
                        <td className="px-2 py-1.5 text-xs text-gray-900">Rs. {item.rate_per_unit.toFixed(2)}</td>
                        <td className="px-2 py-1.5 text-xs font-medium text-gray-900">Rs. {item.line_total.toFixed(2)}</td>
                        <td className="px-2 py-1.5">
                          <button
                            onClick={() => removeFromCart(index)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                            title="Remove"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Checkout Summary */}
        <div className="flex flex-col space-y-2">
          <div className="bg-white p-2 rounded-lg border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-800 mb-2">Billing Summary</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
              </div>

              <div className="pt-1.5 border-t">
                <label className="block text-xs font-medium text-gray-700 mb-1">Discount</label>
                <div className="flex gap-1 mb-1">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                    step="0.01"
                  />
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="fixed">Rs</option>
                    <option value="percent">%</option>
                  </select>
                </div>
                {(discount > 0) && (
                  <div className="flex justify-between text-xs text-red-600">
                    <span>Discount {discountType === 'percent' ? (`${discount}%`) : ''}:</span>
                    <span className="font-medium">- Rs. {(discountType === 'percent' ? (subtotal * discount) / 100 : discount).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="pt-1.5 border-t">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Tax ({taxRate}%):</span>
                  <span className="font-medium">Rs. {tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Grand Total:</span>
                  <span className="text-2xl font-bold text-green-600">Rs. {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="w-full px-3 py-1.5 bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Payment Section - Always Visible */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border-2 border-blue-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Payment Details
            </h3>

            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                  <option value="credit">Credit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Amount Received</label>
                <input
                  ref={amountReceivedRef}
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Enter amount"
                  step="0.01"
                />
              </div>

              {amountReceived && (
                <div className={`p-2 rounded-lg border ${changeDue > 0 ? 'bg-blue-100 border-blue-300' : changeDue === 0 ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
                  <div className="flex justify-between">
                    <span className={`text-xs font-medium ${changeDue > 0 ? 'text-blue-900' : changeDue === 0 ? 'text-green-900' : 'text-red-900'}`}>
                      {changeDue > 0 ? 'Change Due:' : changeDue === 0 ? 'Exact Amount' : 'Short Amount:'}
                    </span>
                    <span className={`text-sm font-bold ${changeDue > 0 ? 'text-blue-700' : changeDue === 0 ? 'text-green-700' : 'text-red-700'}`}>
                      Rs. {Math.abs(changeDue).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  rows="2"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>

            <div className="mt-3">
              <button
                onClick={completeSale}
                disabled={loading || cart.length === 0}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}