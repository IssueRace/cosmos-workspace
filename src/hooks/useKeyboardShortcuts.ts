import { useEffect } from 'react';

type ShortcutMap = Record<string, () => void>;

function normalizeKey(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push('ctrl');
  if (e.shiftKey) parts.push('shift');
  if (e.altKey) parts.push('alt');

  let key = e.key.toLowerCase();
  if (key === ' ') key = 'space';
  if (key === '/') key = '/';
  parts.push(key);
  return parts.join('+');
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isInput = tagName === 'input' || tagName === 'textarea' || target.isContentEditable;

      const combo = normalizeKey(e);
      const action = shortcuts[combo];

      if (action) {
        // Allow Escape even inside inputs
        if (combo !== 'escape' && isInput) return;
        e.preventDefault();
        e.stopPropagation();
        action();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
