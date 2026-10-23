import React from 'react';
import { Plus, Minus, Maximize2, Map, ChevronDown, ChevronUp, Wand2, GitMerge } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import './CanvasControls.css';

interface CanvasControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onToggleMinimap: () => void;
  isMinimapOpen: boolean;
  globalCollapseMode: 'default' | 'collapsed' | 'expanded';
  onSetCollapseMode: (mode: 'default' | 'collapsed' | 'expanded') => void;
  onAutoLayout: () => void;
  onSynthesizeBranches?: () => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  onToggleMinimap,
  isMinimapOpen,
  globalCollapseMode,
  onSetCollapseMode,
  onAutoLayout,
  onSynthesizeBranches,
}) => {
  return (
    <GlassPanel className="canvas-controls">
      <button className="control-btn" onClick={onZoomIn} title="Zoom In">
        <Plus size={16} />
      </button>
      <button className="control-btn" onClick={onZoomOut} title="Zoom Out">
        <Minus size={16} />
      </button>
      <button className="control-btn" onClick={onFitView} title="Fit to View">
        <Maximize2 size={16} />
      </button>
      <button
        className={`control-btn ${isMinimapOpen ? 'active' : ''}`}
        onClick={onToggleMinimap}
        title="Toggle Minimap"
      >
        <Map size={16} />
      </button>
      <button className="control-btn" onClick={onAutoLayout} title="Auto Layout (Tidy Up)">
        <Wand2 size={16} />
      </button>
      {onSynthesizeBranches && (
        <button
          className="control-btn"
          onClick={onSynthesizeBranches}
          title="Synthesize / Merge Branches"
        >
          <GitMerge size={16} color="#FF9F0A" />
        </button>
      )}
      <div className="control-divider" style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px auto' }} />
      <button
        className={`control-btn ${globalCollapseMode === 'collapsed' ? 'active' : ''}`}
        onClick={() => onSetCollapseMode(globalCollapseMode === 'collapsed' ? 'default' : 'collapsed')}
        title="Collapse All Nodes"
      >
        <ChevronUp size={16} />
      </button>
      <button
        className={`control-btn ${globalCollapseMode === 'expanded' ? 'active' : ''}`}
        onClick={() => onSetCollapseMode(globalCollapseMode === 'expanded' ? 'default' : 'expanded')}
        title="Expand All Nodes"
      >
        <ChevronDown size={16} />
      </button>
    </GlassPanel>
  );
};

