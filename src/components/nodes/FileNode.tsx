import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileCode, Trash2 } from 'lucide-react';
import './FileNode.css';

export const FileNode: React.FC<NodeProps> = ({ data, selected }) => {
  const fileData = data as unknown as {
    name: string;
    size: number;
    content: string;
    onDelete?: () => void;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileData.onDelete) {
      fileData.onDelete();
    }
  };

  const formattedSize = fileData.size
    ? fileData.size < 1024
      ? `${fileData.size} B`
      : `${(fileData.size / 1024).toFixed(1)} KB`
    : '0 B';

  const preview = fileData.content
    ? fileData.content.length > 80
      ? `${fileData.content.slice(0, 80)}...`
      : fileData.content
    : 'Empty file';

  return (
    <div className={`file-node-card ${selected ? 'selected' : ''}`}>
      <Handle
        type="source"
        position={Position.Right}
        id="output-file"
        className="file-node-handle"
      />
      <div className="file-node-header">
        <div className="file-info-group">
          <FileCode size={18} className="file-icon" />
          <div className="file-meta">
            <span className="file-name" title={fileData.name}>
              {fileData.name}
            </span>
            <span className="file-size">{formattedSize}</span>
          </div>
        </div>
        <button className="file-delete-btn" onClick={handleDelete}>
          <Trash2 size={12} />
        </button>
      </div>
      <div className="file-preview-box">
        <code>{preview}</code>
      </div>
    </div>
  );
};

export default FileNode;
