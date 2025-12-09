import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Global Keyboard Shortcuts Hook
 * Use this hook in your layout or main component to enable global shortcuts
 */
export function useGlobalKeyboard() {
  const router = useRouter();

  useEffect(() => {
    const handleGlobalKeyPress = (e) => {
      // Ctrl + D - Dashboard
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        router.push('/dashboard');
      }

      // Ctrl + P - Purchase
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        router.push('/purchase');
      }

      // Ctrl + Shift + S - Sale (Ctrl+S is browser save)
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        router.push('/sale');
      }

      // Ctrl + Shift + N - New Product
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        router.push('/product-entry');
      }

      // Ctrl + Shift + L - Sales List
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        router.push('/sales-list');
      }

      // Ctrl + Shift + P - Purchase List
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        router.push('/purchase-list');
      }

      // Ctrl + Shift + R - Sale Return
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        router.push('/sale-return');
      }

      // F1 - Help/Keyboard Shortcuts Guide
      if (e.key === 'F1') {
        e.preventDefault();
        // Show keyboard shortcuts modal
        const event = new CustomEvent('show-keyboard-help');
        window.dispatchEvent(event);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyPress);
    return () => document.removeEventListener('keydown', handleGlobalKeyPress);
  }, [router]);
}

/**
 * Form Keyboard Navigation Hook
 * Provides common keyboard shortcuts for forms
 */
export function useFormKeyboard({ onSubmit, onCancel, onNew }) {
  useEffect(() => {
    const handleFormKeyPress = (e) => {
      // Ctrl + Enter - Submit Form
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (onSubmit) onSubmit();
      }

      // Ctrl + N - New/Clear Form
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        if (onNew) onNew();
      }

      // Escape - Cancel/Clear
      if (e.key === 'Escape') {
        if (onCancel) onCancel();
      }
    };

    document.addEventListener('keydown', handleFormKeyPress);
    return () => document.removeEventListener('keydown', handleFormKeyPress);
  }, [onSubmit, onCancel, onNew]);
}

/**
 * Table/List Keyboard Navigation Hook
 * Provides keyboard navigation for tables and lists
 */
export function useTableKeyboard({ onEdit, onDelete, onSearch, currentPage, totalPages, setPage }) {
  useEffect(() => {
    const handleTableKeyPress = (e) => {
      // Don't intercept if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl + E - Edit selected
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        if (onEdit) onEdit();
      }

      // Delete key - Delete selected
      if (e.key === 'Delete' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        if (onDelete) onDelete();
      }

      // Ctrl + F - Search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        if (onSearch) onSearch();
      }

      // Page Down - Next page
      if (e.key === 'PageDown' && setPage && currentPage < totalPages) {
        e.preventDefault();
        setPage(currentPage + 1);
      }

      // Page Up - Previous page
      if (e.key === 'PageUp' && setPage && currentPage > 1) {
        e.preventDefault();
        setPage(currentPage - 1);
      }

      // Home - First page
      if (e.key === 'Home' && setPage && currentPage !== 1) {
        e.preventDefault();
        setPage(1);
      }

      // End - Last page
      if (e.key === 'End' && setPage && currentPage !== totalPages) {
        e.preventDefault();
        setPage(totalPages);
      }
    };

    document.addEventListener('keydown', handleTableKeyPress);
    return () => document.removeEventListener('keydown', handleTableKeyPress);
  }, [onEdit, onDelete, onSearch, currentPage, totalPages, setPage]);
}
