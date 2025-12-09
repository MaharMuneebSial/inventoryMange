'use client';

import { useGlobalKeyboard } from '../lib/useGlobalKeyboard';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

/**
 * Global Keyboard Provider Component
 * Wraps children and enables global keyboard shortcuts
 */
export default function GlobalKeyboardProvider({ children }) {
  useGlobalKeyboard();
  return (
    <>
      {children}
      <KeyboardShortcutsModal />
    </>
  );
}
