import React, { useState, useEffect, useRef } from 'react';
import { Node } from '@xyflow/react';
import { Search, Sparkles, FileCode, X } from 'lucide-react';
import './SearchPanel.css';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  onFocusNode: (nodeId: string) => void;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <>
      {before}
      <mark className="search-highlight">{match}</mark>
      {after}
    </>
  );
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  isOpen,
  onClose,
  nodes,
  onFocusNode,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matches = query.trim()
    ? nodes.filter((node) => {
        if (node.type === 'fileNode') {
          const fileData = node.data as { name: string; content: string };
          return (
            fileData.name?.toLowerCase().includes(query.toLowerCase()) ||
            fileData.content?.toLowerCase().includes(query.toLowerCase())
          );
        } else {
          const dialogueData = node.data as { prompt: string; response: string };
          return (
            dialogueData.prompt?.toLowerCase().includes(query.toLowerCase()) ||
            dialogueData.response?.toLowerCase().includes(query.toLowerCase())
          );
        }
      })
    : [];

  const handleItemClick = (nodeId: string) => {
    onFocusNode(nodeId);
    onClose();
  };

  return (
    <div className="search-panel-overlay" onClick={onClose}>
      <div className="search-panel-card" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search nodes, files, or responses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {query.trim() && (
          <div className="search-results-list">
            {matches.length === 0 ? (
              <div className="search-no-results">No matches found for "{query}"</div>
            ) : (
              matches.map((node) => {
                const isFile = node.type === 'fileNode';
                let title = '';
                let subtitle = '';

                if (isFile) {
                  const data = node.data as { name: string; content: string };
                  title = data.name;
                  subtitle = data.content?.slice(0, 60) || '';
                } else {
                  const data = node.data as { prompt: string; response: string };
                  title = data.prompt?.slice(0, 45) || '';
                  subtitle = data.response?.slice(0, 60) || '';
                }

                return (
                  <button
                    key={node.id}
                    className="search-result-item"
                    onClick={() => handleItemClick(node.id)}
                  >
                    <div className="result-icon-wrapper">
                      {isFile ? (
                        <FileCode size={14} className="result-icon file" />
                      ) : node.data?.isMainPath === false ? (
                        <Sparkles size={14} className="result-icon side" />
                      ) : (
                        <Sparkles size={14} className="result-icon main" />
                      )}
                    </div>
                    <div className="result-content-wrapper">
                      <span className="result-title">{highlightMatch(title, query)}</span>
                      <span className="result-subtitle">{highlightMatch(subtitle, query)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {!query.trim() && (
          <div className="search-tip-box">
            <span>Type to search conversation trees and attached files.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;

