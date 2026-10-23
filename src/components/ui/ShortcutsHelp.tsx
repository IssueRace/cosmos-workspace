import React from 'react';
import { X } from 'lucide-react';
import './ShortcutsHelp.css';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ['Ctrl', '/'], description: 'Show / hide this help' },
  { keys: ['Ctrl', 'F'], description: 'Search nodes' },
  { keys: ['Ctrl', 'E'], description: 'Export session' },
  { keys: ['Ctrl', 'Z'], description: 'Undo last action' },
  { keys: ['Ctrl', 'Y'], description: 'Redo last action' },
  { keys: ['Escape'], description: 'Close any open panel' },
  { keys: ['Delete'], description: 'Delete selected edge' },
  { keys: ['Backspace'], description: 'Delete selected edge' },
];

export const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button className="shortcuts-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="shortcuts-list">
          {shortcuts.map((s, i) => (
            <div className="shortcut-row" key={i}>
              <div className="shortcut-keys">
                {s.keys.map((k, j) => (
                  <React.Fragment key={j}>
                    {j > 0 && <span className="shortcut-plus">+</span>}
                    <kbd className="shortcut-key">{k}</kbd>
                  </React.Fragment>
                ))}
              </div>
              <span className="shortcut-desc">{s.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
