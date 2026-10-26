import React, { useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { User, Sparkles, GitBranch, Copy, Trash2, Maximize2, Send, GitMerge, FileCode, Plus } from 'lucide-react';
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

  const handleContinue = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeData.onContinue) {
      nodeData.onContinue();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeData.onDelete && confirm('Delete this node and its branch children?')) {
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

  const handleExtractAllArtifacts = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nodeData.response || !nodeData.onSpawnArtifact) return;
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let match;
    let count = 0;
    while ((match = codeBlockRegex.exec(nodeData.response)) !== null) {
      const lang = match[1] || 'code';
      const codeContent = match[2].trim();
      const extMap: Record<string, string> = {
        javascript: 'js',
        typescript: 'ts',
        python: 'py',
        html: 'html',
        css: 'css',
        json: 'json',
        sql: 'sql',
        markdown: 'md',
      };
      const ext = extMap[lang.toLowerCase()] || lang || 'txt';
      const title = `${nodeData.title ? nodeData.title.toLowerCase().replace(/\s+/g, '_') : 'snippet'}_${count + 1}.${ext}`;
      nodeData.onSpawnArtifact(title, lang, codeContent);
      count++;
    }
  };

  const hasCodeBlocks = Boolean(nodeData.response && nodeData.response.includes('```'));
  const lineCount = nodeData.response ? nodeData.response.split('\n').length : 0;
  const firstLine = nodeData.title || (nodeData.prompt ? nodeData.prompt.split('\n')[0] : 'New Prompt');

  const shouldTruncatePrompt = nodeData.prompt && nodeData.prompt.length > 150;
  const displayPrompt = shouldTruncatePrompt && !isPromptExpanded
    ? nodeData.prompt.slice(0, 150) + '...'
    : nodeData.prompt;

  return (
    <div
      className={`dialogue-node-card ${
        nodeData.isMergeNode
          ? 'merge-node'
          : nodeData.isMainPath
          ? 'main-path'
          : 'side-path'
      } ${selected ? 'selected' : ''} ${nodeData.status || ''}`}
    >
      {selected && nodeData.status !== 'draft' && (
        <NodeResizer
          minWidth={320}
          minHeight={220}
          color={nodeData.isMergeNode ? '#FF9F0A' : nodeData.isMainPath ? '#5E9CFF' : '#BF5AF2'}
          onResizeEnd={nodeData.onResizeStop}
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
                  {nodeData.isMergeNode ? (
                    <>
                      <GitMerge size={14} className="identity-icon merge-icon" />
                      <span className="merge-badge-label">Synthesis</span>
                    </>
                  ) : (
                    <>
                      <User size={14} className="identity-icon" />
                      <span>{nodeData.title || 'User'}</span>
                    </>
                  )}
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
                  <MarkdownRenderer
                    content={nodeData.response}
                    onExtractArtifact={nodeData.onSpawnArtifact}
                  />
                ) : (
                  <span className="streaming-placeholder">Thinking...</span>
                )}
              </div>
            </div>

            <div className="node-action-bar">
              {nodeData.onContinue && (
                <button
                  className="node-action-btn"
                  onClick={handleContinue}
                  title="Continue Main Thread"
                >
                  <Plus size={14} />
                  <span>Continue</span>
                </button>
              )}
              <button
                className="node-action-btn"
                onClick={handleBranch}
                title="Branch Off Side Question"
              >
                <GitBranch size={14} />
                <span>Branch</span>
              </button>
              <button
                className="node-action-btn"
                onClick={handleFullscreen}
                title="Open Split Chat View"
              >
                <Maximize2 size={14} />
                <span>Chat</span>
              </button>
              {hasCodeBlocks && nodeData.onSpawnArtifact && (
                <button
                  className="node-action-btn artifact-spawn-btn"
                  onClick={handleExtractAllArtifacts}
                  title="Extract Code to Artifact Nodes"
                >
                  <FileCode size={14} color="#30D158" />
                  <span>Artifacts</span>
                </button>
              )}
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
            {nodeData.isMergeNode ? (
              <GitMerge size={13} className="identity-icon merge-icon" />
            ) : (
              <User size={13} className="identity-icon" />
            )}
            <span className="compact-text">{firstLine}</span>
          </div>
          <div className="compact-response">
            <Sparkles size={13} className="identity-icon ai" />
            <span className="compact-text">{lineCount} lines</span>
          </div>
        </div>
      </div>

      <div className="layout-wrapper macro-layout">
        <div
          className={`macro-dot ${
            nodeData.isMergeNode ? 'merge' : nodeData.isMainPath ? 'main' : 'side'
          }`}
        >
          <span className="macro-floating-label">{firstLine.slice(0, 24)}</span>
        </div>
      </div>
    </div>
  );
};

export default DialogueNode;
