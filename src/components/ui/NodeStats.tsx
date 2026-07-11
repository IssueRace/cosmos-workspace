import React, { useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import './NodeStats.css';

interface NodeStatsProps {
  nodes: Node[];
  edges: Edge[];
}

export const NodeStats: React.FC<NodeStatsProps> = ({ nodes, edges }) => {
  const stats = useMemo(() => {
    const dialogueNodes = nodes.filter(n => n.type === 'dialogueNode');
    const fileNodes = nodes.filter(n => n.type === 'fileNode');

    // Calculate tree depth by walking from roots
    const childMap = new Map<string, string[]>();
    for (const e of edges) {
      const children = childMap.get(e.source) || [];
      children.push(e.target);
      childMap.set(e.source, children);
    }

    const targetIds = new Set(edges.map(e => e.target));
    const rootIds = dialogueNodes
      .filter(n => !targetIds.has(n.id))
      .map(n => n.id);

    let maxDepth = 0;
    const stack: Array<{ id: string; depth: number }> = rootIds.map(id => ({ id, depth: 1 }));
    while (stack.length > 0) {
      const { id, depth } = stack.pop()!;
      if (depth > maxDepth) maxDepth = depth;
      const children = childMap.get(id) || [];
      for (const childId of children) {
        stack.push({ id: childId, depth: depth + 1 });
      }
    }

    return {
      dialogueCount: dialogueNodes.length,
      fileCount: fileNodes.length,
      depth: maxDepth,
    };
  }, [nodes, edges]);

  if (stats.dialogueCount === 0) return null;

  return (
    <div className="node-stats">
      <span>{stats.dialogueCount} node{stats.dialogueCount !== 1 ? 's' : ''}</span>
      {stats.fileCount > 0 && (
        <>
          <span className="node-stats-dot">·</span>
          <span>{stats.fileCount} file{stats.fileCount !== 1 ? 's' : ''}</span>
        </>
      )}
      <span className="node-stats-dot">·</span>
      <span>depth {stats.depth}</span>
    </div>
  );
};
