import React, { useState, useRef } from 'react';
import { ArrowUp, X, GitBranch } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import './InputBar.css';

interface InputBarProps {
  activeNodeLabel: string | null;
  isBranchMode: boolean;
  onToggleBranchMode: () => void;
  onCancelContext: () => void;
  onSubmit: (prompt: string, isBranch: boolean) => void;
  isStreaming: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({
  activeNodeLabel,
  isBranchMode,
  onToggleBranchMode,
  onCancelContext,
  onSubmit,
  isStreaming,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isStreaming) {
      onSubmit(text, isBranchMode);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="input-bar-container">
      <GlassPanel className="input-bar-panel">
        <form onSubmit={handleSend} className="input-form">
          <textarea
            ref={textareaRef}
            className="input-textarea"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            disabled={isStreaming}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!text.trim() || isStreaming}
          >
            <ArrowUp size={16} />
          </button>
        </form>

        {activeNodeLabel && (
          <div className="context-indicator">
            <span className="context-prefix">
              Continuing from: <span className="context-node-name">{activeNodeLabel}</span>
              {isBranchMode && <span className="branch-mode-badge">Branch Mode</span>}
            </span>
            <div className="context-actions">
              <button
                type="button"
                className={`context-action-btn branch-toggle ${isBranchMode ? 'branching' : ''}`}
                onClick={onToggleBranchMode}
                title={isBranchMode ? "Switch to main path" : "Branch off here"}
              >
                <GitBranch size={12} />
              </button>
              <button
                type="button"
                className="context-action-btn clear-context"
                onClick={onCancelContext}
                title="Clear context"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
};
