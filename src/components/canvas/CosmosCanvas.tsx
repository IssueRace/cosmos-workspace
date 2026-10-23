import React, { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  OnNodeDrag,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DialogueNode } from '../nodes/DialogueNode';
import { CompactNode } from '../nodes/CompactNode';
import { FileNode } from '../nodes/FileNode';
import { ArtifactNode } from '../nodes/ArtifactNode';
import './CosmosCanvas.css';

interface CosmosCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  isMinimapOpen: boolean;
  globalCollapseMode: 'default' | 'collapsed' | 'expanded';
  onNodeDrag: OnNodeDrag;
  onNodeDragStop?: OnNodeDrag;
}

export const CosmosCanvas: React.FC<CosmosCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  isMinimapOpen,
  globalCollapseMode,
  onNodeDrag,
  onNodeDragStop,
}) => {
  const [zoomClass, setZoomClass] = useState('full');

  const handleViewportChange = useCallback((viewport: any) => {
    const zoom = viewport.zoom;
    let nextClass = 'full';
    if (zoom < 0.35) {
      nextClass = 'macro';
    } else if (zoom <= 0.7) {
      nextClass = 'compact';
    }
    setZoomClass(nextClass);
  }, []);

  const nodeTypes = useMemo(
    () => ({
      dialogueNode: DialogueNode,
      compactNode: CompactNode,
      fileNode: FileNode,
      artifactNode: ArtifactNode,
    }),
    []
  );

  return (
    <div className={`canvas-wrapper zoom-${zoomClass} collapse-mode-${globalCollapseMode}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.15}
        maxZoom={2.0}
        nodesConnectable={true}
        nodesDraggable={true}
        elementsSelectable={true}
        deleteKeyCode={['Backspace', 'Delete']}
        onViewportChange={handleViewportChange}
        snapToGrid={true}
        snapGrid={[24, 24]}
      >
        <Background
          id="minor"
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="rgba(255, 255, 255, 0.14)"
        />
        <Background
          id="major"
          variant={BackgroundVariant.Lines}
          gap={120}
          size={1}
          color="rgba(255, 255, 255, 0.10)"
        />
        {isMinimapOpen && (
          <MiniMap
            bgColor="rgba(12, 12, 14, 0.9)"
            nodeColor={(node) => {
              if (node.type === 'fileNode' || node.type === 'artifactNode') return '#30D158';
              const data = node.data as { isMainPath?: boolean; isMergeNode?: boolean };
              if (data?.isMergeNode) return '#FF9F0A';
              return data?.isMainPath === false ? '#BF5AF2' : '#5E9CFF';
            }}
            maskColor="rgba(255, 255, 255, 0.04)"
            style={{
              background: 'var(--canvas-bg)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
            }}
          />
        )}
      </ReactFlow>
    </div>
  );
};

export default CosmosCanvas;
