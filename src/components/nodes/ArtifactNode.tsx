import React, { useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { FileCode, Trash2, Copy, Check, Download, Edit3, Eye } from 'lucide-react';
import { ArtifactNodeData } from '../../types';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import './ArtifactNode.css';

export const ArtifactNode: React.FC<NodeProps> = ({ data, selected }) => {
  const artifact = data as unknown as ArtifactNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(artifact.content || '');
  const [title, setTitle] = useState(artifact.title || 'untitled_artifact');
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (artifact.onDelete) {
      artifact.onDelete();
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    if (artifact.onUpdateContent) {
      artifact.onUpdateContent(val);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (artifact.onUpdateTitle) {
      artifact.onUpdateTitle(val);
    }
  };

  const lineCount = content.split('\n').length;
  const byteCount = new Blob([content]).size;
  const formattedSize = byteCount < 1024 ? `${byteCount} B` : `${(byteCount / 1024).toFixed(1)} KB`;

  return (
    <div className={`artifact-node-card ${selected ? 'selected' : ''}`}>
      {selected && (
        <NodeResizer
          minWidth={360}
          minHeight={260}
          color="#30D158"
          onResizeEnd={artifact.onResizeStop}
        />
      )}

      {/* Inputs / Outputs */}
      <Handle
        type="target"
        position={Position.Left}
        id="input-artifact"
        className="artifact-node-handle left-handle"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output-artifact"
        className="artifact-node-handle right-handle"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="input-artifact-top"
        className="artifact-node-handle top-handle"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="output-artifact-bottom"
        className="artifact-node-handle bottom-handle"
      />

      <div className="artifact-header">
        <div className="artifact-identity">
          <div className="artifact-icon-box">
            <FileCode size={16} className="artifact-icon" />
          </div>
          <input
            className="artifact-title-input nowheel nodrag"
            value={title}
            onChange={handleTitleChange}
            placeholder="artifact_name"
            title="Click to rename artifact"
          />
          {artifact.language && (
            <span className="artifact-lang-badge">{artifact.language}</span>
          )}
        </div>

        <div className="artifact-controls">
          <button
            className={`artifact-ctrl-btn ${isEditing ? 'active' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? 'View rendered code' : 'Edit code'}
          >
            {isEditing ? <Eye size={13} /> : <Edit3 size={13} />}
          </button>
          <button
            className="artifact-ctrl-btn"
            onClick={handleCopy}
            title="Copy content"
          >
            {copied ? <Check size={13} color="#30D158" /> : <Copy size={13} />}
          </button>
          <button
            className="artifact-ctrl-btn"
            onClick={handleDownload}
            title="Download file"
          >
            <Download size={13} />
          </button>
          <button
            className="artifact-ctrl-btn danger"
            onClick={handleDelete}
            title="Delete artifact"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="artifact-body nowheel">
        {isEditing ? (
          <textarea
            className="artifact-editor-textarea nowheel nodrag"
            value={content}
            onChange={handleContentChange}
            placeholder="Enter artifact content..."
            spellCheck={false}
          />
        ) : (
          <div className="artifact-preview-renderer">
            <MarkdownRenderer content={`\`\`\`${artifact.language || ''}\n${content}\n\`\`\``} />
          </div>
        )}
      </div>

      <div className="artifact-footer">
        <span className="artifact-stat">{lineCount} lines</span>
        <span className="artifact-dot">·</span>
        <span className="artifact-stat">{formattedSize}</span>
        <span className="artifact-badge-live">Live Canvas Artifact</span>
      </div>
    </div>
  );
};

export default ArtifactNode;
