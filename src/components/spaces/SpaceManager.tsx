import React from 'react';
import { Plus, Trash2, Globe, Edit2 } from 'lucide-react';
import './SpaceManager.css';

interface Space {
  id: string;
  name: string;
}

interface SpaceManagerProps {
  spaces: Space[];
  activeSpaceId: string;
  onSelectSpace: (id: string) => void;
  onCreateSpace: () => void;
  onDeleteSpace: (id: string) => void;
  onRenameSpace: (id: string, name: string) => void;
}

export const SpaceManager: React.FC<SpaceManagerProps> = ({
  spaces,
  activeSpaceId,
  onSelectSpace,
  onCreateSpace,
  onDeleteSpace,
  onRenameSpace,
}) => {
  const handleRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt('Enter new space name:', currentName);
    if (newName && newName.trim()) {
      onRenameSpace(id, newName.trim());
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this space and all its nodes?')) {
      onDeleteSpace(id);
    }
  };

  return (
    <div className="space-manager-sidebar">
      <div className="space-manager-logo" title="Cosmos Workspace">
        <Globe size={20} className="planet-icon" />
      </div>

      <div className="spaces-list">
        {spaces.map((space) => {
          const isActive = space.id === activeSpaceId;
          const initial = space.name ? space.name.charAt(0).toUpperCase() : 'S';

          return (
            <div
              key={space.id}
              className={`space-item-wrapper ${isActive ? 'active' : ''}`}
              onClick={() => onSelectSpace(space.id)}
              title={space.name}
            >
              <div className="space-circle">
                <span>{initial}</span>
              </div>
              <div className="space-actions-popup">
                <button
                  className="space-popup-btn"
                  onClick={(e) => handleRename(space.id, space.name, e)}
                  title="Rename space"
                >
                  <Edit2 size={11} />
                </button>
                {spaces.length > 1 && (
                  <button
                    className="space-popup-btn danger"
                    onClick={(e) => handleDelete(space.id, e)}
                    title="Delete space"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button className="add-space-btn" onClick={onCreateSpace} title="Create New Space">
        <Plus size={18} />
      </button>
    </div>
  );
};

export default SpaceManager;
