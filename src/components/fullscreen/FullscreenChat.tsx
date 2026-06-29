import React, { useState, useRef, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { X, Send, GitBranch, ArrowLeft, User, Sparkles } from 'lucide-react';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import './FullscreenChat.css';

interface FullscreenChatProps {
  isOpen: boolean;
  onClose: () => void;
  activeNodeId: string | null;
  nodes: Node[];
  edges: Edge[];
  isStreaming: boolean;
  onSubmit: (parentId: string, prompt: string, isBranch: boolean) => void;
  onNavigateToNode: (nodeId: string) => void;
}

export const FullscreenChat: React.FC<FullscreenChatProps> = ({
  isOpen,
  onClose,
  activeNodeId,
  nodes,
  edges,
  isStreaming,
  onSubmit,
  onNavigateToNode,
}) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [nodes, activeNodeId]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!activeNodeId) return null;

  const conversationPath: { nodeId: string; prompt: string; response: string; model?: string; isMainPath: boolean }[] = [];
  let currentId: string | null = activeNodeId;

  while (currentId) {
    const node = nodes.find((n) => n.id === currentId);
    if (!node) break;
    const data = node.data as { prompt: string; response: string; model?: string; isMainPath: boolean };
    conversationPath.unshift({
      nodeId: node.id,
      prompt: data.prompt,
      response: data.response,
      model: data.model,
      isMainPath: data.isMainPath,
    });
    const incoming = edges.find((e) => e.target === currentId);
    currentId = incoming ? incoming.source : null;
  }

  const allBranches: { parentNodeId: string; nodeId: string; prompt: string; isMainPath: boolean }[] = [];
  conversationPath.forEach((step) => {
    const outgoingEdges = edges.filter((e) => e.source === step.nodeId);
    outgoingEdges.forEach((edge) => {
      const childNode = nodes.find((n) => n.id === edge.target);
      if (childNode && !conversationPath.some((p) => p.nodeId === childNode.id)) {
        const childData = childNode.data as { prompt: string; isMainPath: boolean };
        allBranches.push({
          parentNodeId: step.nodeId,
          nodeId: childNode.id,
          prompt: childData.prompt,
          isMainPath: childData.isMainPath,
        });
      }
    });
  });

  const handleSend = (isBranch: boolean) => {
    if (inputText.trim() && !isStreaming) {
      onSubmit(activeNodeId, inputText.trim(), isBranch);
      setInputText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, isBranch: boolean) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(isBranch);
    }
  };

  return (
    <div className={`fullscreen-chat-overlay ${isOpen ? 'open' : 'closed'}`}>
      <div className="fullscreen-chat-container">
        <div className="chat-main-pane">
          <div className="chat-header">
            <button className="back-to-canvas-btn" onClick={onClose}>
              <ArrowLeft size={16} />
              <span>Back to Canvas</span>
            </button>
            <span className="chat-header-title">Active Thread</span>
            <button className="close-fullscreen-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="chat-messages-scroller">
            {conversationPath.map((step) => (
              <div key={step.nodeId} className="step-group">
                <div className="message-bubble user-bubble">
                  <div className="bubble-header">
                    <User size={14} />
                    <span>User</span>
                  </div>
                  <div className="bubble-content">{step.prompt}</div>
                </div>

                <div className={`message-bubble ai-bubble ${step.nodeId === activeNodeId && isStreaming ? 'streaming' : ''}`}>
                  <div className="bubble-header">
                    <Sparkles size={14} />
                    <span>Cosmos · {step.model || 'AI'}</span>
                  </div>
                  <div className="bubble-content markdown-body">
                    {step.response ? (
                      <MarkdownRenderer content={step.response} />
                    ) : (
                      <span className="typing-loader">Thinking...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-footer">
            <div className="input-box-wrapper">
              <textarea
                ref={textareaRef}
                className="fullscreen-textarea nowheel"
                value={inputText}
                onChange={handleTextChange}
                onKeyDown={(e) => handleKeyDown(e, false)}
                placeholder="Type a message..."
                disabled={isStreaming}
                rows={1}
              />
              <div className="input-buttons-row">
                <button
                  className="send-action-btn main-send"
                  onClick={() => handleSend(false)}
                  disabled={!inputText.trim() || isStreaming}
                  title="Send to main path"
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
                <button
                  className="send-action-btn branch-send"
                  onClick={() => handleSend(true)}
                  disabled={!inputText.trim() || isStreaming}
                  title="Branch off here"
                >
                  <GitBranch size={14} />
                  <span>Branch</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="chat-sidebar-pane">
          <div className="sidebar-header">
            <span>Sub-branches</span>
          </div>
          <div className="sidebar-branches-list">
            {allBranches.length === 0 ? (
              <div className="no-branches-placeholder">
                No side branches from this path yet. Use the "Branch" button to create one.
              </div>
            ) : (
              allBranches.map((branch) => {
                const parentIndex = conversationPath.findIndex((p) => p.nodeId === branch.parentNodeId);
                return (
                  <button
                    key={branch.nodeId}
                    className="branch-list-item"
                    onClick={() => onNavigateToNode(branch.nodeId)}
                  >
                    <div className="branch-item-meta">
                      <span className="branch-badge">Branch</span>
                      <span className="branch-parent-info">from Step {parentIndex + 1}</span>
                    </div>
                    <div className="branch-item-preview">{branch.prompt}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenChat;
