import React, { useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { User, Sparkles, GitBranch, Copy, Trash2, Maximize2, Send } from 'lucide-react';
import { CosmosNodeData } from '../../types';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import './DialogueNode.css';

export const DialogueNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as CosmosNodeData;
  const [draftText, setDraftText] = useState('');
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(nodeData.response || '');
  };

  const handleBranch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeData.onBranch) {
      nodeData.onBranch();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeData.onDelete && confirm('Delete this branch and all its children?')) {
      nodeData.onDelete();
    }
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeData.onFullscreen) {
      nodeData.onFullscreen();
    }
  };

  const handleDraftSubmit = () => {
    if (draftText.trim() && nodeData.onSubmitDraft) {
      nodeData.onSubmitDraft(draftText);
    }
  };

  const handleDraftKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDraftSubmit();
    }
  };

  const lineCount = nodeData.response ? nodeData.response.split('\n').length : 0;
  const firstLine = nodeData.prompt ? nodeData.prompt.split('\n')[0] : 'Empty prompt';

  const shouldTruncatePrompt = nodeData.prompt && nodeData.prompt.length > 150;
  const displayPrompt = shouldTruncatePrompt && !isPromptExpanded
    ? nodeData.prompt.slice(0, 150) + '...'
    : nodeData.prompt;

  return (
    <div
      className={`dialogue-node-card ${
        nodeData.isMainPath ? 'main-path' : 'side-path'
      } ${selected ? 'selected' : ''} ${nodeData.status || ''}`}
    >
      {selected && nodeData.status !== 'draft' && (
        <NodeResizer
          minWidth={320}
          minHeight={220}
          color={nodeData.isMainPath ? '#5E9CFF' : '#BF5AF2'}
        />
      )}

      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="node-handle input-handle"
      />
      <span className="handle-label input-label">Parent</span>

      <Handle
        type="source"
        position={Position.Bottom}
        id="output-main"
        className="node-handle main-handle"
      />
      <span className="handle-label main-label">Continue</span>

      <Handle
        type="source"
        position={Position.Right}
        id="output-branch"
        className="node-handle branch-handle"
      />
      <span className="handle-label branch-label">Branch</span>

      <div className="layout-wrapper full-layout">
        {nodeData.status === 'draft' ? (
          <div className="node-draft-container">
            <div className="section-header">
              <div className="header-identity">
                <User size={14} className="identity-icon" />
                <span>New {nodeData.isMainPath ? 'Main' : 'Branch'} Prompt</span>
              </div>
            </div>
            <textarea
              className="node-draft-textarea nowheel nodrag"
              placeholder="Type prompt here and press Enter..."
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              onKeyDown={handleDraftKeyDown}
              autoFocus
            />
            <div className="node-draft-actions">
              <button
                className="node-action-btn main-send-btn"
                onClick={handleDraftSubmit}
                disabled={!draftText.trim()}
              >
                <Send size={12} />
                <span>Submit</span>
              </button>
              <button className="node-action-btn danger" onClick={handleDelete}>
                <Trash2 size={12} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="node-section user-section">
              <div className="section-header">
                <div className="header-identity">
                  <User size={14} className="identity-icon" />
                  <span>User</span>
                </div>
                <span className="node-timestamp">{nodeData.timestamp}</span>
              </div>
              <div className="node-prompt-body">
                {displayPrompt}
                {shouldTruncatePrompt && (
                  <button
                    className="prompt-expand-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPromptExpanded(!isPromptExpanded);
                    }}
                  >
                    {isPromptExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>

            <hr className="node-separator" />

            <div className="node-section ai-section">
              <div className="section-header">
                <div className="header-identity">
                  <Sparkles size={14} className="identity-icon ai" />
                  <span>Cosmos · {nodeData.model}</span>
                </div>
              </div>
              <div className="node-response-body markdown-body nowheel">
                {nodeData.isStreaming && !nodeData.response ? (
                  <span className="streaming-placeholder">Thinking...</span>
                ) : nodeData.response ? (
                  <MarkdownRenderer content={nodeData.response} />
                ) : (
                  <span className="streaming-placeholder">Thinking...</span>
                )}
              </div>
            </div>

            <div className="node-action-bar">
              <button
                className="node-action-btn"
                onClick={handleFullscreen}
                title="Fullscreen Chat Mode"
              >
                <Maximize2 size={14} />
                <span>Fullscreen</span>
              </button>
              <button
                className="node-action-btn"
                onClick={handleBranch}
                title="Branch Off"
              >
                <GitBranch size={14} />
                <span>Branch</span>
              </button>
              {!nodeData.isMainPath && nodeData.onPromote && (
                <button
                  className="node-action-btn promote-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    nodeData.onPromote?.();
                  }}
                  title="Make this branch Main path"
                >
                  <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span>Promote</span>
                </button>
              )}
              <button
                className="node-action-btn"
                onClick={handleCopy}
                title="Copy Response"
              >
                <Copy size={14} />
              </button>
              <button
                className="node-action-btn danger"
                onClick={handleDelete}
                title="Delete Branch"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="layout-wrapper compact-layout">
        <div className="compact-container">
          <div className="compact-prompt">
            <User size={12} className="identity-icon" />
            <span className="compact-text">{firstLine}</span>
          </div>
          <div className="compact-response">
            <Sparkles size={12} className="identity-icon ai" />
            <span className="compact-text">{lineCount} lines</span>
          </div>
        </div>
      </div>

      <div className="layout-wrapper macro-layout">
        <span className="macro-floating-label">{firstLine.slice(0, 15)}...</span>
      </div>
    </div>
  );
};

export default DialogueNode;
