const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Category APIs
  addCategory: (data) => ipcRenderer.invoke('add-category', data),
  getCategories: () => ipcRenderer.invoke('get-categories'),
  updateCategory: (data) => ipcRenderer.invoke('update-category', data),
  deleteCategory: (id) => ipcRenderer.invoke('delete-category', id),

  // Sub-Category APIs
  addSubCategory: (data) => ipcRenderer.invoke('add-sub-category', data),
  getSubCategories: (categoryId) => ipcRenderer.invoke('get-sub-categories', categoryId),
  updateSubCategory: (data) => ipcRenderer.invoke('update-sub-category', data),
  deleteSubCategory: (id) => ipcRenderer.invoke('delete-sub-category', id),

  // Brand APIs
  addBrand: (data) => ipcRenderer.invoke('add-brand', data),
  getBrands: () => ipcRenderer.invoke('get-brands'),
  updateBrand: (data) => ipcRenderer.invoke('update-brand', data),
  deleteBrand: (id) => ipcRenderer.invoke('delete-brand', id),

  // Unit APIs
  addUnit: (data) => ipcRenderer.invoke('add-unit', data),
  getUnits: () => ipcRenderer.invoke('get-units'),
  updateUnit: (data) => ipcRenderer.invoke('update-unit', data),
  deleteUnit: (id) => ipcRenderer.invoke('delete-unit', id),

  // Product APIs
  addProduct: (data) => ipcRenderer.invoke('add-product', data),
  getProducts: () => ipcRenderer.invoke('get-products'),
  updateProduct: (data) => ipcRenderer.invoke('update-product', data),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),

  // Supplier APIs
  addSupplier: (data) => ipcRenderer.invoke('add-supplier', data),
  getSuppliers: () => ipcRenderer.invoke('get-suppliers'),
  updateSupplier: (data) => ipcRenderer.invoke('update-supplier', data),
  deleteSupplier: (id) => ipcRenderer.invoke('delete-supplier', id),

  // Purchase APIs
  addPurchase: (data) => ipcRenderer.invoke('add-purchase', data),
  getPurchases: () => ipcRenderer.invoke('get-purchases'),
  updatePurchase: (data) => ipcRenderer.invoke('update-purchase', data),
  deletePurchase: (id) => ipcRenderer.invoke('delete-purchase', id),

  // Sale APIs
  getProductsWithStock: () => ipcRenderer.invoke('get-products-with-stock'),
  searchPurchaseProducts: (query) => ipcRenderer.invoke('search-purchase-products', query),
  completeSale: (data) => ipcRenderer.invoke('complete-sale', data),
  getSales: () => ipcRenderer.invoke('get-sales'),
  getSaleItems: (saleId) => ipcRenderer.invoke('get-sale-items', saleId),

  // Sale Return APIs
  getSaleByInvoice: (invoiceNumber) => ipcRenderer.invoke('get-sale-by-invoice', invoiceNumber),
  processSaleReturn: (data) => ipcRenderer.invoke('process-sale-return', data),
  getSaleReturns: () => ipcRenderer.invoke('get-sale-returns'),
  getSaleReturnItems: (returnId) => ipcRenderer.invoke('get-sale-return-items', returnId)
});
