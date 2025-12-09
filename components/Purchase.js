'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormKeyboard } from '../lib/useGlobalKeyboard';

export default function Purchase() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [productId, setProductId] = useState('');
  const [itemBarcode, setItemBarcode] = useState('');
  const [boxBarcode, setBoxBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expDate, setExpDate] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [minWholesaleQty, setMinWholesaleQty] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [gst, setGst] = useState('');
  const [totalAmount, setTotalAmount] = useState('0.00');
  const [paidAmount, setPaidAmount] = useState('');
  const [dueAmount, setDueAmount] = useState('0.00');
  const [extraAmount, setExtraAmount] = useState('0.00');

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingPurchase, setViewingPurchase] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Searchable dropdown states
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [filteredCategoriesForSearch, setFilteredCategoriesForSearch] = useState([]);

  const [subCategorySearch, setSubCategorySearch] = useState('');
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);
  const [filteredSubCategoriesForSearch, setFilteredSubCategoriesForSearch] = useState([]);

  const [brandSearch, setBrandSearch] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [filteredBrandsForSearch, setFilteredBrandsForSearch] = useState([]);

  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [filteredSuppliersForSearch, setFilteredSuppliersForSearch] = useState([]);

  const [unitSearch, setUnitSearch] = useState('');
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [units, setUnits] = useState([]);
  const [filteredUnitsForSearch, setFilteredUnitsForSearch] = useState([]);

  // Packaging modal state
  const [showPackagingModal, setShowPackagingModal] = useState(false);
  const [packagingType, setPackagingType] = useState(''); // 'carton', 'box', 'pack', 'bag'

  // Packaging inputs for modal
  const [cartons, setCartons] = useState('');
  const [boxesPerCarton, setBoxesPerCarton] = useState('');
  const [piecesPerBox, setPiecesPerBox] = useState('');
  const [boxes, setBoxes] = useState('');
  const [piecesPerPack, setPiecesPerPack] = useState('');
  const [packs, setPacks] = useState('');

  // Old packaging state (still used in current UI)
  const [useCartonPackaging, setUseCartonPackaging] = useState(false);
  const [useBoxPackaging, setUseBoxPackaging] = useState(false);
  const [usePiecesPackaging, setUsePiecesPackaging] = useState(false);
  const [numCartons, setNumCartons] = useState('');
  const [numBoxes, setNumBoxes] = useState('');
  const [numPieces, setNumPieces] = useState('');

  // Refs for dropdown click-outside detection
  const categoryDropdownRef = useRef(null);
  const subCategoryDropdownRef = useRef(null);
  const brandDropdownRef = useRef(null);
  const supplierDropdownRef = useRef(null);
  const unitDropdownRef = useRef(null);

  // Ref for auto-focus on first field
  const productNameInputRef = useRef(null);

  // Refs for all form fields (for Shift+Arrow navigation)
  const itemBarcodeRef = useRef(null);
  const boxBarcodeRef = useRef(null);
  const categoryRef = useRef(null);
  const subCategoryRef = useRef(null);
  const brandRef = useRef(null);
  const mfgDateRef = useRef(null);
  const expDateRef = useRef(null);
  const supplierRef = useRef(null);
  const purchaseDateRef = useRef(null);
  const unitRef = useRef(null);
  const quantityRef = useRef(null);
  const purchasePriceRef = useRef(null);
  const salePriceRef = useRef(null);
  const wholesalePriceRef = useRef(null);
  const minWholesaleQtyRef = useRef(null);
  const gstRef = useRef(null);

  // Array of all field refs in order
  const fieldRefs = [
    productNameInputRef,
    itemBarcodeRef,
    boxBarcodeRef,
    categoryRef,
    subCategoryRef,
    brandRef,
    mfgDateRef,
    expDateRef,
    supplierRef,
    purchaseDateRef,
    unitRef,
    quantityRef,
    purchasePriceRef,
    salePriceRef,
    wholesalePriceRef,
    minWholesaleQtyRef,
    gstRef
  ];

  // Dropdown selection index for keyboard navigation
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);
  const [selectedSubCategoryIndex, setSelectedSubCategoryIndex] = useState(-1);
  const [selectedBrandIndex, setSelectedBrandIndex] = useState(-1);
  const [selectedSupplierIndex, setSelectedSupplierIndex] = useState(-1);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(-1);

  useEffect(() => {
    loadData();
    setTodayDate();
    checkForEditingPurchase();

    // Auto-focus on Product Name field when page loads
    setTimeout(() => {
      if (productNameInputRef.current) {
        productNameInputRef.current.focus();
      }
    }, 100);
  }, []);

  // Helper function to scroll to selected item in dropdown
  const scrollToSelectedItem = (index) => {
    const dropdowns = document.querySelectorAll('[class*="overflow-y-auto"]');
    dropdowns.forEach(dropdown => {
      const items = dropdown.children;
      if (items[index]) {
        items[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
      }
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;

      // Check if any dropdown is open
      const isDropdownOpen = showProductDropdown || showCategoryDropdown || showSubCategoryDropdown ||
                             showBrandDropdown || showSupplierDropdown || showUnitDropdown;

      // Handle ArrowDown in dropdowns
      if (e.key === 'ArrowDown' && isDropdownOpen) {
        e.preventDefault();

        if (showProductDropdown) {
          const filteredProducts = products.filter(p =>
            p.product_name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
            p.item_barcode?.toLowerCase().includes(productSearchTerm.toLowerCase())
          );
          setSelectedProductIndex(prev => {
            const newIndex = Math.min(prev + 1, filteredProducts.length - 1);
            setTimeout(() => scrollToSelectedItem(newIndex), 0);
            return newIndex;
          });
        } else if (showCategoryDropdown) {
          setSelectedCategoryIndex(prev => {
            const newIndex = Math.min(prev + 1, filteredCategoriesForSearch.length - 1);
            setTimeout(() => scrollToSelectedItem(newIndex), 0);
            return newIndex;
          });
        } else if (showSubCategoryDropdown) {
          setSelectedSubCategoryIndex(prev => {
            const newIndex = Math.min(prev + 1, filteredSubCategoriesForSearch.length - 1);
            setTimeout(() => scrollToSelectedItem(newIndex), 0);
            return newIndex;
          });
        } else if (showBrandDropdown) {
          setSelectedBrandIndex(prev => {
            const newIndex = Math.min(prev + 1, filteredBrandsForSearch.length - 1);
            setTimeout(() => scrollToSelectedItem(newIndex), 0);
            return newIndex;
          });
        } else if (showSupplierDropdown) {
          setSelectedSupplierIndex(prev => {
            const newIndex = Math.min(prev + 1, filteredSuppliersForSearch.length - 1);
            setTimeout(() => scrollToSelectedItem(newIndex), 0);
            return newIndex;
          });
        } else if (showUnitDropdown) {
          setSelectedUnitIndex(prev => {
            const newIndex = Math.min(prev + 1, filteredUnitsForSearch.length - 1);
            setTimeout(() => scrollToSelectedItem(newIndex), 0);
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
            setTimeout(() => scrollToSelectedItem(newIndex), 0);
            return newIndex;
          });
        } else if (showCategoryDropdown) {
          setSelectedCategoryIndex(prev => {
            const newIndex = Math.max(prev - 1, 0);
            setTimeout(() => scrollToSelectedItem(newIndex), 0);
            return newIndex;
          });
        } else if (showSubCategoryDropdown) {
          setSelectedSubCategoryIndex(prev => {
            const newIndex = Math.max(prev - 1, 0);
            setTimeout(() => scrollToSelectedItem(newIndex), 0);
            return newIndex;
          });
        } else if (showBrandDropdown) {
          setSelectedBrandIndex(prev => {
            const newIndex = Math.max(prev - 1, 0);
            setTimeout(() => scrollToSelectedItem(newIndex), 0);
            return newIndex;
          });
        } else if (showSupplierDropdown) {
          setSelectedSupplierIndex(prev => {
            const newIndex = Math.max(prev - 1, 0);
            setTimeout(() => scrollToSelectedItem(newIndex), 0);
            return newIndex;
          });
        } else if (showUnitDropdown) {
          setSelectedUnitIndex(prev => {
            const newIndex = Math.max(prev - 1, 0);
            setTimeout(() => scrollToSelectedItem(newIndex), 0);
            return newIndex;
          });
        }
        return;
      }

      // Handle Enter key
      if (e.key === 'Enter') {
        // If dropdown is open and item is selected
        if (isDropdownOpen) {
          e.preventDefault();

          if (showProductDropdown && selectedProductIndex >= 0) {
            const filteredProducts = products.filter(p =>
              p.product_name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
              p.item_barcode?.toLowerCase().includes(productSearchTerm.toLowerCase())
            );
            const selectedProduct = filteredProducts[selectedProductIndex];
            if (selectedProduct) {
              handleProductChange(selectedProduct.id);
              setSelectedProductIndex(-1);
            }
          } else if (showCategoryDropdown && selectedCategoryIndex >= 0) {
            const selectedCategory = filteredCategoriesForSearch[selectedCategoryIndex];
            if (selectedCategory) {
              setCategoryId(selectedCategory.id);
              setCategorySearch(selectedCategory.category_name);
              setShowCategoryDropdown(false);
              setSelectedCategoryIndex(-1);
            }
          } else if (showSubCategoryDropdown && selectedSubCategoryIndex >= 0) {
            const selectedSubCategory = filteredSubCategoriesForSearch[selectedSubCategoryIndex];
            if (selectedSubCategory) {
              setSubCategoryId(selectedSubCategory.id);
              setSubCategorySearch(selectedSubCategory.sub_category_name);
              setShowSubCategoryDropdown(false);
              setSelectedSubCategoryIndex(-1);
            }
          } else if (showBrandDropdown && selectedBrandIndex >= 0) {
            const selectedBrand = filteredBrandsForSearch[selectedBrandIndex];
            if (selectedBrand) {
              setBrandId(selectedBrand.id);
              setBrandSearch(selectedBrand.brand_name);
              setShowBrandDropdown(false);
              setSelectedBrandIndex(-1);
            }
          } else if (showSupplierDropdown && selectedSupplierIndex >= 0) {
            const selectedSupplier = filteredSuppliersForSearch[selectedSupplierIndex];
            if (selectedSupplier) {
              setSupplierId(selectedSupplier.id);
              setSupplierSearch(selectedSupplier.supplier_name);
              setShowSupplierDropdown(false);
              setSelectedSupplierIndex(-1);
            }
          } else if (showUnitDropdown && selectedUnitIndex >= 0) {
            const selectedUnit = filteredUnitsForSearch[selectedUnitIndex];
            if (selectedUnit) {
              handleUnitSelectFromDropdown(selectedUnit);
              setSelectedUnitIndex(-1);
            }
          }

          // Move to next field after selection
          const formElements = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea, button[type="submit"]')).filter(el => !el.disabled && !el.readOnly);
          const currentIndex = formElements.indexOf(activeElement);
          const nextIndex = currentIndex + 1;
          if (nextIndex < formElements.length) {
            setTimeout(() => formElements[nextIndex].focus(), 100);
          }
          return;
        }

        // Don't prevent default if we're on a button
        if (activeElement.tagName === 'BUTTON') {
          return;
        }

        const formElements = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea, button[type="submit"]')).filter(el => !el.disabled && !el.readOnly);
        const currentIndex = formElements.indexOf(activeElement);

        if (currentIndex === -1) return;

        e.preventDefault();

        // Close all dropdowns when moving to next field
        setShowProductDropdown(false);
        setShowCategoryDropdown(false);
        setShowSubCategoryDropdown(false);
        setShowBrandDropdown(false);
        setShowSupplierDropdown(false);
        setShowUnitDropdown(false);

        // Move to next field
        const nextIndex = currentIndex + 1;
        if (nextIndex < formElements.length) {
          formElements[nextIndex].focus();
        }
      }

      // Note: Left/Right arrow keys are now handled by Shift+Arrow navigation (lines 691-723)
      // Normal arrow keys without Shift work for text cursor movement

      // Handle Up/Down arrow keys for field navigation (only when dropdown is closed)
      if (['ArrowUp', 'ArrowDown'].includes(e.key) && !isDropdownOpen) {
        const formElements = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea, button[type="submit"]')).filter(el => !el.disabled && !el.readOnly);
        const currentIndex = formElements.indexOf(activeElement);

        if (currentIndex === -1) return;

        e.preventDefault();

        // Close all dropdowns when navigating
        setShowProductDropdown(false);
        setShowCategoryDropdown(false);
        setShowSubCategoryDropdown(false);
        setShowBrandDropdown(false);
        setShowSupplierDropdown(false);
        setShowUnitDropdown(false);

        let nextIndex = currentIndex;

        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex + 1;
        } else if (e.key === 'ArrowUp') {
          nextIndex = currentIndex - 1;
        }

        if (nextIndex >= 0 && nextIndex < formElements.length) {
          formElements[nextIndex].focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showProductDropdown, showCategoryDropdown, showSubCategoryDropdown, showBrandDropdown,
      showSupplierDropdown, showUnitDropdown, selectedProductIndex, selectedCategoryIndex,
      selectedSubCategoryIndex, selectedBrandIndex, selectedSupplierIndex, selectedUnitIndex,
      productSearchTerm, products, filteredCategoriesForSearch, filteredSubCategoriesForSearch,
      filteredBrandsForSearch, filteredSuppliersForSearch, filteredUnitsForSearch]);

  const checkForEditingPurchase = () => {
    const editingPurchaseData = localStorage.getItem('editingPurchase');
    if (editingPurchaseData) {
      const purchase = JSON.parse(editingPurchaseData);
      populateFormWithPurchaseData(purchase);
      localStorage.removeItem('editingPurchase'); // Clear after loading
    }
  };

  const populateFormWithPurchaseData = (purchase) => {
    setEditingId(purchase.id);
    setProductId(purchase.product_id);
    setProductSearchTerm(purchase.product_name || '');
    setItemBarcode(purchase.item_barcode || '');
    setBoxBarcode(purchase.box_barcode || '');

    // Set Category
    setCategoryId(purchase.category_id || '');
    setCategorySearch(purchase.category_name || '');

    // Set Sub-Category
    setSubCategoryId(purchase.sub_category_id || '');
    setSubCategorySearch(purchase.sub_category_name || '');

    // Set Brand
    setBrandId(purchase.brand_id || '');
    setBrandSearch(purchase.brand_name || '');

    // Set Supplier
    setSupplierId(purchase.supplier_id || '');
    setSupplierSearch(purchase.supplier_name || '');

    setMfgDate(purchase.mfg_date || '');
    setExpDate(purchase.exp_date || '');
    setPurchaseDate(purchase.purchase_date || '');
    setQuantity(purchase.quantity || '');

    // Set Unit
    setUnit(purchase.unit || '');
    setUnitSearch(purchase.unit || '');

    setPurchasePrice(purchase.purchase_price || '');
    setSalePrice(purchase.sale_price || '');
    setMinWholesaleQty(purchase.min_wholesale_qty || '');
    setWholesalePrice(purchase.wholesale_price || '');
    setGst(purchase.gst || '');
    setPaidAmount(purchase.paid_amount || '');
    setDueAmount(purchase.due_amount || '0.00');

    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setTodayDate = () => {
    const today = new Date().toISOString().split('T')[0];
    setPurchaseDate(today);
  };

  const loadData = async () => {
    try {
      console.log('=== FRONTEND: Load Data START ===');

      if (!window.electronAPI) {
        console.error('Electron API not available!');
        setMessage('Electron API not available. Please run in Electron app.');
        setIsError(true);
        return;
      }

      const [productsRes, categoriesRes, subCategoriesRes, brandsRes, suppliersRes, purchasesRes, unitsRes] = await Promise.all([
        window.electronAPI.getProducts(),
        window.electronAPI.getCategories(),
        window.electronAPI.getSubCategories(),
        window.electronAPI.getBrands(),
        window.electronAPI.getSuppliers(),
        window.electronAPI.getPurchases(),
        window.electronAPI.getUnits()
      ]);

      console.log('Purchases response:', purchasesRes);
      console.log('Number of purchases:', purchasesRes.success ? purchasesRes.data.length : 0);

      if (productsRes.success) setProducts(productsRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (subCategoriesRes.success) setSubCategories(subCategoriesRes.data);
      if (brandsRes.success) setBrands(brandsRes.data);
      if (suppliersRes.success) setSuppliers(suppliersRes.data);
      if (purchasesRes.success) {
        setPurchases(purchasesRes.data);
        console.log('Purchases set in state:', purchasesRes.data);
      }
      if (unitsRes.success) {
        // Transform units from backend to match dropdown format
        const formattedUnits = unitsRes.data.map(unit => ({
          value: unit.unit_name,
          label: unit.unit_name
        }));
        setUnits(formattedUnits);
      }

      console.log('=== FRONTEND: Load Data END ===');
    } catch (error) {
      console.error('=== FRONTEND: Load Data ERROR ===');
      console.error('Error loading data:', error);
      setMessage('Error loading data: ' + (error.message || 'Unknown error'));
      setIsError(true);
    }
  };

  // Calculate total pieces from packaging modal
  const calculateTotalPieces = () => {
    let total = 0;

    if (packagingType === 'carton') {
      // Carton: cartons × boxes per carton × pieces per box
      const c = parseFloat(cartons) || 0;
      const bpc = parseFloat(boxesPerCarton) || 0;
      const ppb = parseFloat(piecesPerBox) || 0;
      total = c * bpc * ppb;
    } else if (packagingType === 'box') {
      // Box: boxes × pieces per box
      const b = parseFloat(boxes) || 0;
      const ppb = parseFloat(piecesPerBox) || 0;
      total = b * ppb;
    } else if (packagingType === 'pack' || packagingType === 'bag') {
      // Pack/Bag: packs × pieces per pack
      const p = parseFloat(packs) || 0;
      const ppp = parseFloat(piecesPerPack) || 0;
      total = p * ppp;
    }

    return total;
  };

  // Handle packaging modal save
  const handlePackagingModalSave = () => {
    const total = calculateTotalPieces();
    if (total > 0 && !isNaN(total) && total !== null) {
      setQuantity(total.toString());
      setShowPackagingModal(false);
    }
  };

  // Auto-calculate quantity based on packaging
  useEffect(() => {
    if (unit === 'Pieces' || unit === 'Pcs') {
      let calculatedQty = 0;

      if (useCartonPackaging && numCartons && boxesPerCarton && piecesPerBox) {
        calculatedQty = parseFloat(numCartons) * parseFloat(boxesPerCarton) * parseFloat(piecesPerBox);
      } else if (useBoxPackaging && numBoxes && piecesPerBox) {
        calculatedQty = parseFloat(numBoxes) * parseFloat(piecesPerBox);
      } else if (usePiecesPackaging && numPieces) {
        calculatedQty = parseFloat(numPieces);
      }

      if (calculatedQty > 0 && !isNaN(calculatedQty) && calculatedQty !== null) {
        setQuantity(calculatedQty.toString());
      }
    }
  }, [unit, useCartonPackaging, useBoxPackaging, usePiecesPackaging, numCartons, boxesPerCarton, piecesPerBox, numBoxes, numPieces]);

  useEffect(() => {
    calculateTotal();
  }, [quantity, purchasePrice, gst]);

  // Auto-calculate due amount when paid amount or total amount changes
  useEffect(() => {
    calculateDueAmount();
  }, [totalAmount, paidAmount]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.product-search-container')) {
        setShowProductDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (subCategoryDropdownRef.current && !subCategoryDropdownRef.current.contains(event.target)) {
        setShowSubCategoryDropdown(false);
      }
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target)) {
        setShowBrandDropdown(false);
      }
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target)) {
        setShowSupplierDropdown(false);
      }
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target)) {
        setShowUnitDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Filter sub-categories for search
  useEffect(() => {
    if (subCategorySearch) {
      const filtered = subCategories.filter(sub =>
        sub.sub_category_name.toLowerCase().includes(subCategorySearch.toLowerCase())
      );
      setFilteredSubCategoriesForSearch(filtered);
    } else {
      setFilteredSubCategoriesForSearch(subCategories);
    }
  }, [subCategorySearch, subCategories]);

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

  // Filter suppliers for search
  useEffect(() => {
    if (supplierSearch) {
      const filtered = suppliers.filter(supplier =>
        supplier.supplier_name.toLowerCase().includes(supplierSearch.toLowerCase())
      );
      setFilteredSuppliersForSearch(filtered);
    } else {
      setFilteredSuppliersForSearch(suppliers);
    }
  }, [supplierSearch, suppliers]);

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

  // Shift + Arrow Left/Right keyboard navigation for form fields
  useEffect(() => {
    const handleFieldNavigation = (e) => {
      // Only handle Shift + Arrow keys
      if (!e.shiftKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) {
        return;
      }

      // Find currently focused element's index
      const currentIndex = fieldRefs.findIndex(ref => ref.current === document.activeElement);

      if (currentIndex === -1) return; // Not focused on any of our fields

      e.preventDefault(); // Prevent default shift+arrow behavior

      let nextIndex;
      if (e.key === 'ArrowRight') {
        // Move to next field
        nextIndex = currentIndex + 1;
        if (nextIndex >= fieldRefs.length) nextIndex = 0; // Loop to first
      } else {
        // Move to previous field
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) nextIndex = fieldRefs.length - 1; // Loop to last
      }

      // Focus the next field
      fieldRefs[nextIndex]?.current?.focus();
    };

    document.addEventListener('keydown', handleFieldNavigation);
    return () => document.removeEventListener('keydown', handleFieldNavigation);
  }, []);

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const purchasePr = parseFloat(purchasePrice) || 0;
    const gstVal = parseFloat(gst) || 0;

    // Total amount is based on purchase price (how much we spent)
    const subtotal = qty * purchasePr;
    const gstAmount = (subtotal * gstVal) / 100;
    const total = subtotal + gstAmount;

    setTotalAmount(total.toFixed(2));
  };

  const calculateDueAmount = () => {
    const total = parseFloat(totalAmount) || 0;
    const paid = parseFloat(paidAmount) || 0;
    const due = total - paid;

    if (due >= 0) {
      // Normal case: still have due amount
      setDueAmount(due.toFixed(2));
      setExtraAmount('0.00');
    } else {
      // Paid more than total: calculate extra amount
      setDueAmount('0.00');
      setExtraAmount(Math.abs(due).toFixed(2));
    }
  };

  const handleProductChange = (prodId) => {
    setProductId(prodId);
    const selectedProduct = products.find(p => p.id === parseInt(prodId));
    if (selectedProduct) {
      setProductSearchTerm(selectedProduct.product_name);
      setItemBarcode(selectedProduct.barcode_item || '');
      setBoxBarcode(selectedProduct.barcode_box || '');

      // Set Category ID and search text
      setCategoryId(selectedProduct.category_id || '');
      const selectedCategory = categories.find(c => c.id === selectedProduct.category_id);
      if (selectedCategory) {
        setCategorySearch(selectedCategory.category_name);
      }

      // Set Sub-Category ID and search text
      setSubCategoryId(selectedProduct.sub_category_id || '');
      const selectedSubCategory = subCategories.find(sc => sc.id === selectedProduct.sub_category_id);
      if (selectedSubCategory) {
        setSubCategorySearch(selectedSubCategory.sub_category_name);
      }

      // Set Brand ID and search text
      setBrandId(selectedProduct.brand_id || '');
      const selectedBrand = brands.find(b => b.id === selectedProduct.brand_id);
      if (selectedBrand) {
        setBrandSearch(selectedBrand.brand_name);
      }

      setShowProductDropdown(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.product_name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.barcode_item?.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  // Category search handlers
  const handleCategorySearchInputChange = (e) => {
    setCategorySearch(e.target.value);
    setShowCategoryDropdown(true);
    if (!e.target.value) {
      setCategoryId('');
    }
  };

  const handleCategorySelectFromDropdown = (category) => {
    setCategoryId(category.id);
    setCategorySearch(category.category_name);
    setShowCategoryDropdown(false);
  };

  // Sub-Category search handlers
  const handleSubCategorySearchInputChange = (e) => {
    setSubCategorySearch(e.target.value);
    setShowSubCategoryDropdown(true);
    if (!e.target.value) {
      setSubCategoryId('');
    }
  };

  const handleSubCategorySelectFromDropdown = (subCategory) => {
    setSubCategoryId(subCategory.id);
    setSubCategorySearch(subCategory.sub_category_name);
    setShowSubCategoryDropdown(false);
  };

  // Brand search handlers
  const handleBrandSearchInputChange = (e) => {
    setBrandSearch(e.target.value);
    setShowBrandDropdown(true);
    if (!e.target.value) {
      setBrandId('');
    }
  };

  const handleBrandSelectFromDropdown = (brand) => {
    setBrandId(brand.id);
    setBrandSearch(brand.brand_name);
    setShowBrandDropdown(false);
  };

  // Supplier search handlers
  const handleSupplierSearchInputChange = (e) => {
    setSupplierSearch(e.target.value);
    setShowSupplierDropdown(true);
    if (!e.target.value) {
      setSupplierId('');
    }
  };

  const handleSupplierSelectFromDropdown = (supplier) => {
    setSupplierId(supplier.id);
    setSupplierSearch(supplier.supplier_name);
    setShowSupplierDropdown(false);
  };

  // Unit search handlers
  const handleUnitSearchInputChange = (e) => {
    setUnitSearch(e.target.value);
    setShowUnitDropdown(true);
    if (!e.target.value) {
      setUnit('');
    }
  };

  const handleUnitSelectFromDropdown = (unitOption) => {
    setUnit(unitOption.value);
    setUnitSearch(unitOption.label);
    setShowUnitDropdown(false);

    // Auto-enable packaging based on selected unit
    const unitValue = unitOption.value.toLowerCase();

    // Check if this unit requires the packaging modal
    if (unitValue === 'carton' || unitValue === 'ctn') {
      setPackagingType('carton');
      setShowPackagingModal(true);
      setUseCartonPackaging(true);
      setUseBoxPackaging(false);
      setUsePiecesPackaging(false);
    } else if (unitValue === 'box') {
      setPackagingType('box');
      setShowPackagingModal(true);
      setUseCartonPackaging(false);
      setUseBoxPackaging(true);
      setUsePiecesPackaging(false);
    } else if (unitValue === 'pack') {
      setPackagingType('pack');
      setShowPackagingModal(true);
      setUseCartonPackaging(false);
      setUseBoxPackaging(false);
      setUsePiecesPackaging(false);
    } else if (unitValue === 'bag') {
      setPackagingType('bag');
      setShowPackagingModal(true);
      setUseCartonPackaging(false);
      setUseBoxPackaging(false);
      setUsePiecesPackaging(false);
    } else {
      // Reset packaging for other units
      setUseCartonPackaging(false);
      setUseBoxPackaging(false);
      setUsePiecesPackaging(false);
    }

    // Clear packaging quantities
    setCartons('');
    setBoxesPerCarton('');
    setPiecesPerBox('');
    setBoxes('');
    setPiecesPerPack('');
    setPacks('');
    setNumCartons('');
    setNumBoxes('');
    setNumPieces('');
  };

  const resetForm = () => {
    setEditingId(null);
    setProductId('');
    setProductSearchTerm('');
    setItemBarcode('');
    setBoxBarcode('');
    setCategoryId('');
    setSubCategoryId('');
    setBrandId('');
    setSupplierId('');
    setMfgDate('');
    setExpDate('');
    setTodayDate();
    setQuantity('');
    setUnit('');
    setPurchasePrice('');
    setSalePrice('');
    setMinWholesaleQty('');
    setWholesalePrice('');
    setGst('');
    setTotalAmount('0.00');
    setPaidAmount('');
    setDueAmount('0.00');
    setExtraAmount('0.00');
    setShowProductDropdown(false);
    // Reset packaging states
    setUseCartonPackaging(false);
    setUseBoxPackaging(false);
    setUsePiecesPackaging(false);
    setNumCartons('');
    setBoxesPerCarton('');
    setPiecesPerBox('');
    setNumBoxes('');
    setNumPieces('');
    // Clear search fields
    setCategorySearch('');
    setSubCategorySearch('');
    setBrandSearch('');
    setSupplierSearch('');
    setUnitSearch('');
  };

  // Enable form keyboard shortcuts (Ctrl+Enter to submit, Ctrl+N to clear, Escape to cancel)
  useFormKeyboard({
    onSubmit: () => {
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    },
    onNew: resetForm,
    onCancel: resetForm
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId) {
      setMessage('Please select a product');
      setIsError(true);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const purchaseData = {
      productId: parseInt(productId),
      itemBarcode: itemBarcode || null,
      boxBarcode: boxBarcode || null,
      categoryId: categoryId ? parseInt(categoryId) : null,
      subCategoryId: subCategoryId ? parseInt(subCategoryId) : null,
      brandId: brandId ? parseInt(brandId) : null,
      supplierId: supplierId ? parseInt(supplierId) : null,
      mfgDate: mfgDate || null,
      expDate: expDate || null,
      purchaseDate: purchaseDate || null,
      quantity: quantity ? parseFloat(quantity) : null,
      unit: unit || null,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      minWholesaleQty: minWholesaleQty ? parseFloat(minWholesaleQty) : 0,
      wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : 0,
      gst: gst ? parseFloat(gst) : 0,
      totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
      paidAmount: paidAmount ? parseFloat(paidAmount) : 0,
      dueAmount: dueAmount ? parseFloat(dueAmount) : 0,
      extraAmount: extraAmount ? parseFloat(extraAmount) : 0,
      packagingType: packagingType || null,
      numCartons: cartons ? parseFloat(cartons) : 0,
      boxesPerCarton: boxesPerCarton ? parseFloat(boxesPerCarton) : 0,
      piecesPerBox: piecesPerBox ? parseFloat(piecesPerBox) : 0,
      numBoxes: boxes ? parseFloat(boxes) : 0,
      numPacks: packs ? parseFloat(packs) : 0,
      piecesPerPack: piecesPerPack ? parseFloat(piecesPerPack) : 0
    };

    try {
      console.log('=== FRONTEND: Submit Purchase START ===');
      console.log('Purchase Data:', purchaseData);

      if (!window.electronAPI) {
        console.error('Electron API not available!');
        setMessage('Electron API not available. Please run in Electron app.');
        setIsError(true);
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      console.log('Electron API is available');

      let result;
      if (editingId) {
        console.log('Updating purchase with ID:', editingId);
        result = await window.electronAPI.updatePurchase({ ...purchaseData, id: editingId });
      } else {
        console.log('Adding new purchase...');
        result = await window.electronAPI.addPurchase(purchaseData);
      }

      console.log('Backend result:', result);
      console.log('Backend result type:', typeof result);
      console.log('Backend result.success:', result?.success);
      console.log('Backend result.error:', result?.error);

      if (result && result.success) {
        console.log('Purchase saved successfully!');
        setMessage(editingId ? 'Purchase updated successfully!' : 'Purchase added successfully!');
        setIsError(false);
        resetForm();
        console.log('Reloading data...');
        await loadData();
        console.log('Data reloaded');
      } else {
        console.error('Backend returned error:', result.error);
        console.error('Full result object:', JSON.stringify(result));
        const errorMsg = result.error || result.message || JSON.stringify(result) || 'Unknown error occurred';
        setMessage('Error: ' + errorMsg);
        setIsError(true);
      }
    } catch (error) {
      console.error('=== FRONTEND: Submit Purchase ERROR ===');
      console.error('Submit error:', error);
      setMessage('Error: ' + (error.message || error.toString() || 'Unknown error occurred'));
      setIsError(true);
    }

    console.log('=== FRONTEND: Submit Purchase END ===');

    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (purchase) => {
    setEditingId(purchase.id);
    setProductId(purchase.product_id);
    setProductSearchTerm(purchase.product_name || '');
    setItemBarcode(purchase.item_barcode || '');
    setBoxBarcode(purchase.box_barcode || '');
    setCategoryId(purchase.category_id || '');
    setSubCategoryId(purchase.sub_category_id || '');
    setBrandId(purchase.brand_id || '');
    setSupplierId(purchase.supplier_id || '');
    setMfgDate(purchase.mfg_date || '');
    setExpDate(purchase.exp_date || '');
    setPurchaseDate(purchase.purchase_date || '');
    setQuantity(purchase.quantity || '');
    setUnit(purchase.unit || '');
    setPurchasePrice(purchase.purchase_price || '');
    setSalePrice(purchase.sale_price || '');
    setMinWholesaleQty(purchase.min_wholesale_qty || '');
    setWholesalePrice(purchase.wholesale_price || '');
    setGst(purchase.gst || '');
    setTotalAmount(purchase.total_amount || '');
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      if (!window.electronAPI) {
        setMessage('Electron API not available. Please run in Electron app.');
        setIsError(true);
        setTimeout(() => setMessage(''), 3000);
        setShowDeleteConfirm(false);
        setDeleteId(null);
        return;
      }

      const result = await window.electronAPI.deletePurchase(deleteId);
      if (result.success) {
        setMessage('Purchase deleted successfully!');
        setIsError(false);
        loadData();
      } else {
        setMessage('Error deleting purchase: ' + (result.error || 'Unknown error'));
        setIsError(true);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Error deleting purchase: ' + (error.message || 'Unknown error'));
      setIsError(true);
    }
    setTimeout(() => setMessage(''), 3000);
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <style jsx>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
          appearance: textfield;
        }
      `}</style>
      {/* Toast Notification */}
      {message && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`rounded-md shadow-lg px-3 py-1.5 flex items-center gap-2 ${
            isError
              ? 'bg-red-100 border border-red-300 text-red-800'
              : 'bg-green-100 border border-green-300 text-green-800'
          }`}>
            {isError ? (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-xs font-medium">{message}</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-sm w-full mx-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-red-100 rounded-full">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Delete Purchase</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">Are you sure you want to delete this purchase? This action cannot be undone.</p>
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

      <div className="flex-1 overflow-y-auto p-2">

        <form onSubmit={handleSubmit} noValidate>
          {/* Single Card with All Fields */}
          <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg p-2 border border-teal-100 mb-2">
            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <div className="p-1.5 bg-teal-600 rounded-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              {editingId ? 'Edit Purchase' : 'Add Purchase'}
            </h3>

            {/* Product Information Section */}
            <div className="mb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="relative product-search-container">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={productNameInputRef}
                  type="text"
                  value={productSearchTerm || ''}
                  onChange={(e) => {
                    setProductSearchTerm(e.target.value);
                    setShowProductDropdown(true);
                    if (!e.target.value) {
                      setProductId('');
                      setItemBarcode('');
                      setBoxBarcode('');
                      setCategoryId('');
                      setSubCategoryId('');
                      setBrandId('');
                    }
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Search product..."
                  className="w-full pl-8 pr-8 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowProductDropdown(!showProductDropdown);
                    if (!showProductDropdown && !productSearchTerm) {
                      setProductSearchTerm('');
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-blue-600 rounded transition-all"
                >
                  <svg className={`w-3.5 h-3.5 transition-transform ${showProductDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {showProductDropdown && (filteredProducts.length > 0 || !productSearchTerm) && (
                <div className="absolute z-50 w-full mt-0.5 bg-white border border-blue-200 rounded-md shadow-lg max-h-60 overflow-hidden">
                  <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 text-xs font-semibold">
                    <div className="flex justify-between items-center">
                      <span>Select Product</span>
                      <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                        {(productSearchTerm ? filteredProducts : products).length}
                      </span>
                    </div>
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {(productSearchTerm ? filteredProducts : products).map((product, index) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductChange(product.id)}
                        className={`px-2 py-1.5 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                          index === selectedProductIndex ? 'bg-blue-100' : index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">
                              {product.product_name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span>{product.barcode_item}</span>
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">
                                {product.category_name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {showProductDropdown && productSearchTerm && filteredProducts.length === 0 && (
                <div className="absolute z-50 w-full mt-0.5 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                  <div className="text-center">
                    <svg className="w-8 h-8 mx-auto text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-gray-600">No products found</p>
                  </div>
                </div>
              )}
            </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Item Barcode
                </label>
                <input
                  ref={itemBarcodeRef}
                  type="text"
                  value={itemBarcode || ''}
                  onChange={(e) => setItemBarcode(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Box Barcode
                </label>
                <input
                  ref={boxBarcodeRef}
                  type="text"
                  value={boxBarcode || ''}
                  onChange={(e) => setBoxBarcode(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="relative" ref={categoryDropdownRef}>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <input
                  ref={categoryRef}
                  type="text"
                  value={categorySearch || ''}
                  onChange={handleCategorySearchInputChange}
                  onFocus={() => setShowCategoryDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                  className="w-full px-2.5 py-1.5 pr-8 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Search Category..."
                />
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="absolute right-2 bottom-2 text-gray-400 hover:text-gray-600"
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
                <input type="hidden" value={categoryId || ''} />

                {showCategoryDropdown && filteredCategoriesForSearch.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredCategoriesForSearch.map((category, index) => (
                      <div
                        key={category.id}
                        onClick={() => handleCategorySelectFromDropdown(category)}
                        className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer transition-colors ${
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

              <div className="relative" ref={subCategoryDropdownRef}>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Sub-Category
                </label>
                <input
                  ref={subCategoryRef}
                  type="text"
                  value={subCategorySearch || ''}
                  onChange={handleSubCategorySearchInputChange}
                  onFocus={() => setShowSubCategoryDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSubCategoryDropdown(false), 200)}
                  className="w-full px-2.5 py-1.5 pr-8 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Search Sub-Category..."
                />
                <button
                  type="button"
                  onClick={() => setShowSubCategoryDropdown(!showSubCategoryDropdown)}
                  className="absolute right-2 bottom-2 text-gray-400 hover:text-gray-600"
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
                <input type="hidden" value={subCategoryId || ''} />

                {showSubCategoryDropdown && filteredSubCategoriesForSearch.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredSubCategoriesForSearch.map((subCategory, index) => (
                      <div
                        key={subCategory.id}
                        onClick={() => handleSubCategorySelectFromDropdown(subCategory)}
                        className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer transition-colors ${
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  ref={brandRef}
                  type="text"
                  value={brandSearch || ''}
                  onChange={handleBrandSearchInputChange}
                  onFocus={() => setShowBrandDropdown(true)}
                  onBlur={() => setTimeout(() => setShowBrandDropdown(false), 200)}
                  className="w-full px-2.5 py-1.5 pr-8 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Search Brand..."
                />
                <button
                  type="button"
                  onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                  className="absolute right-2 bottom-2 text-gray-400 hover:text-gray-600"
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
                <input type="hidden" value={brandId || ''} />

                {showBrandDropdown && filteredBrandsForSearch.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredBrandsForSearch.map((brand, index) => (
                      <div
                        key={brand.id}
                        onClick={() => handleBrandSelectFromDropdown(brand)}
                        className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer transition-colors ${
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  MFG Date
                </label>
                <input
                  ref={mfgDateRef}
                  type="date"
                  value={mfgDate || ''}
                  onChange={(e) => setMfgDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  EXP Date
                </label>
                <input
                  ref={expDateRef}
                  type="date"
                  value={expDate || ''}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="relative" ref={supplierDropdownRef}>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Supplier
                </label>
                <input
                  ref={supplierRef}
                  type="text"
                  value={supplierSearch || ''}
                  onChange={handleSupplierSearchInputChange}
                  onFocus={() => setShowSupplierDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSupplierDropdown(false), 200)}
                  className="w-full px-2.5 py-1.5 pr-8 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Search Supplier..."
                />
                <button
                  type="button"
                  onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
                  className="absolute right-2 bottom-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className={`w-4 h-4 transition-transform duration-200 ${showSupplierDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <input type="hidden" value={supplierId || ''} />

                {showSupplierDropdown && filteredSuppliersForSearch.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredSuppliersForSearch.map((supplier, index) => (
                      <div
                        key={supplier.id}
                        onClick={() => handleSupplierSelectFromDropdown(supplier)}
                        className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer transition-colors ${
                          index === selectedSupplierIndex ? 'bg-blue-100' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">{supplier.supplier_name}</div>
                        {supplier.type_of_item && (
                          <div className="text-xs text-gray-500 mt-0.5">Item Type: {supplier.type_of_item}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showSupplierDropdown && filteredSuppliersForSearch.length === 0 && supplierSearch && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="px-3 py-2 text-xs text-gray-500">
                      No suppliers found
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>

            {/* Dates Section */}
            <div className="mb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Purchase Date
                </label>
                <input
                  ref={purchaseDateRef}
                  type="date"
                  value={purchaseDate || ''}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Unit Dropdown */}
              <div className="relative" ref={unitDropdownRef}>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Unit
                </label>
                <input
                  ref={unitRef}
                  type="text"
                  value={unitSearch || ''}
                  onChange={handleUnitSearchInputChange}
                  onFocus={() => setShowUnitDropdown(true)}
                  onBlur={() => setTimeout(() => setShowUnitDropdown(false), 200)}
                  className="w-full px-2.5 py-1.5 pr-8 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="Search Unit..."
                />
                <button
                  type="button"
                  onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                  className="absolute right-2 bottom-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className={`w-4 h-4 transition-transform duration-200 ${showUnitDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <input type="hidden" value={unit || ''} />

                {showUnitDropdown && filteredUnitsForSearch.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredUnitsForSearch.map((unitOption, index) => (
                      <div
                        key={unitOption.value}
                        onClick={() => handleUnitSelectFromDropdown(unitOption)}
                        className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer transition-colors ${
                          index === selectedUnitIndex ? 'bg-blue-100' : ''
                        }`}
                      >
                        {unitOption.label}
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

              {/* Quantity Field - Only show if NOT using packaging OR if non-Pieces unit */}
              {!(unit === 'Pieces' || unit === 'Pcs') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    ref={quantityRef}
                    type="number"
                    step="0.01"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
                  />
                </div>
              )}
            </div>
            </div>

            {/* Quantity & Units Section */}
            <div className="mb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">

              {/* Conditional Packaging Section for Pieces */}
              {(unit === 'Pieces' || unit === 'Pcs') && (
                <div className="col-span-3 bg-white rounded-lg p-3 border border-purple-200">
                <h4 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Packaging Configuration
                </h4>

                {/* Packaging Checkboxes */}
                <div className="flex gap-3 mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCartonPackaging}
                      onChange={(e) => {
                        setUseCartonPackaging(e.target.checked);
                        if (e.target.checked) {
                          setUseBoxPackaging(false);
                          setUsePiecesPackaging(false);
                          setNumBoxes('');
                          setNumPieces('');
                        }
                      }}
                      className="w-3.5 h-3.5 text-purple-600 rounded"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      Carton
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useBoxPackaging}
                      onChange={(e) => {
                        setUseBoxPackaging(e.target.checked);
                        if (e.target.checked) {
                          setUseCartonPackaging(false);
                          setUsePiecesPackaging(false);
                          setNumCartons('');
                          setBoxesPerCarton('');
                          setNumPieces('');
                        }
                      }}
                      className="w-3.5 h-3.5 text-purple-600 rounded"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      Box
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePiecesPackaging}
                      onChange={(e) => {
                        setUsePiecesPackaging(e.target.checked);
                        if (e.target.checked) {
                          setUseCartonPackaging(false);
                          setUseBoxPackaging(false);
                          setNumCartons('');
                          setBoxesPerCarton('');
                          setPiecesPerBox('');
                          setNumBoxes('');
                        }
                      }}
                      className="w-3.5 h-3.5 text-purple-600 rounded"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      Pieces
                    </span>
                  </label>
                </div>

                {/* Carton Level Inputs */}
                {useCartonPackaging && (
                  <div className="grid grid-cols-3 gap-2 mb-2 p-2 bg-purple-50 rounded border border-purple-200">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                        Cartons
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={numCartons || ''}
                        onChange={(e) => setNumCartons(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                        Boxes/Carton
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={boxesPerCarton || ''}
                        onChange={(e) => setBoxesPerCarton(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="12"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                        Pcs/Box
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={piecesPerBox || ''}
                        onChange={(e) => setPiecesPerBox(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="24"
                      />
                    </div>
                  </div>
                )}

                {/* Box Level Inputs */}
                {useBoxPackaging && (
                  <div className="grid grid-cols-2 gap-2 mb-2 p-2 bg-purple-50 rounded border border-purple-200">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                        Boxes
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={numBoxes || ''}
                        onChange={(e) => setNumBoxes(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                        Pcs/Box
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={piecesPerBox || ''}
                        onChange={(e) => setPiecesPerBox(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="24"
                      />
                    </div>
                  </div>
                )}

                {/* Pieces Level Input */}
                {usePiecesPackaging && (
                  <div className="p-2 bg-purple-50 rounded border border-purple-200">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                        Pieces
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={numPieces || ''}
                        onChange={(e) => setNumPieces(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="100"
                      />
                    </div>
                  </div>
                )}
                </div>
              )}

              {/* Quantity Field for Pieces - Auto-calculated, shown after packaging */}
              {(unit === 'Pieces' || unit === 'Pcs') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Quantity
                    <span className="ml-1 text-xs text-purple-600">(Auto)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
                    readOnly={(useCartonPackaging || useBoxPackaging || usePiecesPackaging)}
                  />
                </div>
              )}
            </div>
            </div>

            {/* Pricing Section */}
            <div className="mb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Purchase Price
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Rs.</span>
                  <input
                    ref={purchasePriceRef}
                    type="number"
                    step="0.01"
                    value={purchasePrice || ''}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Sale Price (Retail)
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Rs.</span>
                  <input
                    ref={salePriceRef}
                    type="number"
                    step="0.01"
                    value={salePrice || ''}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Wholesale Price
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Rs.</span>
                  <input
                    ref={wholesalePriceRef}
                    type="number"
                    step="0.01"
                    value={wholesalePrice || ''}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Min Wholesale Qty
                </label>
                <input
                  ref={minWholesaleQtyRef}
                  type="number"
                  step="0.01"
                  value={minWholesaleQty || ''}
                  onChange={(e) => setMinWholesaleQty(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Min qty"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  GST (%)
                </label>
                <div className="relative">
                  <input
                    ref={gstRef}
                    type="number"
                    step="0.01"
                    value={gst || ''}
                    onChange={(e) => setGst(e.target.value)}
                    className="w-full px-2.5 py-1.5 pr-6 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Total Amount
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-700 text-xs font-bold">Rs.</span>
                  <input
                    type="text"
                    value={totalAmount || ''}
                    readOnly
                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-amber-400 rounded-md bg-amber-100 font-bold text-amber-800"
                  />
                </div>
              </div>
            </div>

            {/* Payment Details Row with Button */}
            <div className="grid grid-cols-12 gap-2 mt-3 items-end">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Paid Amount
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 text-xs">Rs.</span>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Due Amount
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-red-700 text-xs font-bold">Rs.</span>
                  <input
                    type="text"
                    value={dueAmount}
                    readOnly
                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-red-400 rounded-md bg-red-50 font-bold text-red-800"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Extra Amount
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-green-700 text-xs font-bold">Rs.</span>
                  <input
                    type="text"
                    value={extraAmount}
                    readOnly
                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-green-400 rounded-md bg-green-50 font-bold text-green-800"
                  />
                </div>
              </div>

              <div className="col-span-6 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-md hover:from-teal-700 hover:to-cyan-700 transition-all font-semibold text-xs shadow-md flex items-center justify-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {editingId ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    )}
                  </svg>
                  {editingId ? 'Update Purchase' : 'Add Purchase'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-all font-semibold text-xs shadow-md flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                )}
              </div>
            </div>
            </div>
          </div>
        </form>

      </div>

        {/* Packaging Calculator Modal */}
        {showPackagingModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold">
                      {packagingType === 'carton' && 'Carton Packaging Calculator'}
                      {packagingType === 'box' && 'Box Packaging Calculator'}
                      {(packagingType === 'pack' || packagingType === 'bag') && `${packagingType.charAt(0).toUpperCase() + packagingType.slice(1)} Packaging Calculator`}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowPackagingModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
                {/* Carton Packaging */}
                {packagingType === 'carton' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-sm text-gray-700 mb-2">
                        Calculate total pieces from cartons, boxes per carton, and pieces per box.
                      </p>
                      <p className="text-xs text-gray-500 italic">
                        Formula: Total = Cartons × Boxes per Carton × Pieces per Box
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Number of Cartons
                        </label>
                        <input
                          type="number"
                          value={cartons || ''}
                          onChange={(e) => setCartons(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter number of cartons"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Boxes per Carton
                        </label>
                        <input
                          type="number"
                          value={boxesPerCarton}
                          onChange={(e) => setBoxesPerCarton(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="How many boxes in each carton?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Pieces per Box
                        </label>
                        <input
                          type="number"
                          value={piecesPerBox}
                          onChange={(e) => setPiecesPerBox(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="How many pieces in each box?"
                        />
                      </div>

                      {cartons && boxesPerCarton && piecesPerBox && (
                        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                          <p className="text-sm text-green-700 font-semibold mb-2">Calculation:</p>
                          <p className="text-lg text-green-900">
                            {cartons} cartons × {boxesPerCarton} boxes × {piecesPerBox} pieces = <span className="font-bold text-2xl">{calculateTotalPieces()}</span> total pieces
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Box Packaging */}
                {packagingType === 'box' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700 mb-2">
                        Calculate total pieces from boxes and pieces per box.
                      </p>
                      <p className="text-xs text-gray-500 italic">
                        Formula: Total = Boxes × Pieces per Box
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Number of Boxes
                        </label>
                        <input
                          type="number"
                          value={boxes || ''}
                          onChange={(e) => setBoxes(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter number of boxes"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Pieces per Box
                        </label>
                        <input
                          type="number"
                          value={piecesPerBox}
                          onChange={(e) => setPiecesPerBox(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="How many pieces in each box?"
                        />
                      </div>

                      {boxes && piecesPerBox && (
                        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                          <p className="text-sm text-green-700 font-semibold mb-2">Calculation:</p>
                          <p className="text-lg text-green-900">
                            {boxes} boxes × {piecesPerBox} pieces = <span className="font-bold text-2xl">{calculateTotalPieces()}</span> total pieces
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pack/Bag Packaging */}
                {(packagingType === 'pack' || packagingType === 'bag') && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                      <p className="text-sm text-gray-700 mb-2">
                        Calculate total pieces from {packagingType}s and pieces per {packagingType}.
                      </p>
                      <p className="text-xs text-gray-500 italic">
                        Formula: Total = {packagingType.charAt(0).toUpperCase() + packagingType.slice(1)}s × Pieces per {packagingType.charAt(0).toUpperCase() + packagingType.slice(1)}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Number of {packagingType.charAt(0).toUpperCase() + packagingType.slice(1)}s
                        </label>
                        <input
                          type="number"
                          value={packs || ''}
                          onChange={(e) => setPacks(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder={`Enter number of ${packagingType}s`}
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Pieces per {packagingType.charAt(0).toUpperCase() + packagingType.slice(1)}
                        </label>
                        <input
                          type="number"
                          value={piecesPerPack || ''}
                          onChange={(e) => setPiecesPerPack(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder={`How many pieces in each ${packagingType}?`}
                        />
                      </div>

                      {packs && piecesPerPack && (
                        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                          <p className="text-sm text-green-700 font-semibold mb-2">Calculation:</p>
                          <p className="text-lg text-green-900">
                            {packs} {packagingType}s × {piecesPerPack} pieces = <span className="font-bold text-2xl">{calculateTotalPieces()}</span> total pieces
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-t-2 border-gray-200 shadow-lg">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPackagingModal(false)}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePackagingModalSave}
                    disabled={calculateTotalPieces() === 0}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Apply ({calculateTotalPieces()} pieces)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Purchase Modal */}
        {viewingPurchase && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold">Purchase Details</h3>
                  </div>
                  <button
                    onClick={() => setViewingPurchase(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Product Name</p>
                  <p className="text-base font-medium text-gray-800">{viewingPurchase.product_name}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Supplier</p>
                  <p className="text-base font-medium text-gray-800">{viewingPurchase.supplier_name}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Item Barcode</p>
                  <p className="text-base font-medium text-gray-800">{viewingPurchase.item_barcode}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Box Barcode</p>
                  <p className="text-base font-medium text-gray-800">{viewingPurchase.box_barcode || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Category</p>
                  <p className="text-base font-medium text-gray-800">{viewingPurchase.category_name}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Sub-Category</p>
                  <p className="text-base font-medium text-gray-800">{viewingPurchase.sub_category_name}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Brand</p>
                  <p className="text-base font-medium text-gray-800">{viewingPurchase.brand_name}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Purchase Date</p>
                  <p className="text-base font-medium text-gray-800">{viewingPurchase.purchase_date}</p>
                </div>

                {viewingPurchase.mfg_date && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">MFG Date</p>
                    <p className="text-base font-medium text-gray-800">{viewingPurchase.mfg_date}</p>
                  </div>
                )}

                {viewingPurchase.exp_date && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">EXP Date</p>
                    <p className="text-base font-medium text-gray-800">{viewingPurchase.exp_date}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Quantity Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Quantity</p>
                    <p className="text-lg font-bold text-blue-800">{viewingPurchase.quantity} {viewingPurchase.unit}</p>
                  </div>

                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">Pricing Details</h4>
                  {viewingPurchase.quantity >= viewingPurchase.min_wholesale_qty && viewingPurchase.min_wholesale_qty > 0 && viewingPurchase.wholesale_price > 0 ? (
                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">Wholesale Applied</span>
                  ) : (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-semibold">Retail Applied</span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 uppercase font-semibold mb-1">Purchase Price</p>
                    <p className="text-lg font-bold text-green-800">{viewingPurchase.purchase_price}</p>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <p className="text-xs text-indigo-600 uppercase font-semibold mb-1">Sale Price</p>
                    <p className="text-lg font-bold text-indigo-800">{viewingPurchase.sale_price}</p>
                  </div>

                  {viewingPurchase.wholesale_price > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-600 uppercase font-semibold mb-1">Wholesale Price</p>
                      <p className="text-lg font-bold text-purple-800">{viewingPurchase.wholesale_price}</p>
                    </div>
                  )}

                  {viewingPurchase.min_wholesale_qty > 0 && (
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-600 uppercase font-semibold mb-1">Min Wholesale Qty</p>
                      <p className="text-lg font-bold text-amber-800">{viewingPurchase.min_wholesale_qty}</p>
                    </div>
                  )}

                  {viewingPurchase.gst > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">GST (%)</p>
                      <p className="text-base font-medium text-gray-800">{viewingPurchase.gst}%</p>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-800">{viewingPurchase.total_amount}</p>
                  </div>
                </div>
              </div>
            </div>
              </div>

              <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-t-2 border-gray-200 shadow-lg">
                <button
                  onClick={() => setViewingPurchase(null)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
