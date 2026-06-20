import { Node, Edge } from '@xyflow/react';
import { LAYOUT_CONSTANTS } from './constants';

export function calculateTreeLayout(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return [];

  const nodeHeight = 300;
  const verticalGap = LAYOUT_CONSTANTS.VERTICAL_GAP;
  const horizontalOffset = LAYOUT_CONSTANTS.HORIZONTAL_OFFSET;

  const childrenMap = new Map<string, { id: string; isBranch: boolean }[]>();
  nodes.forEach(n => childrenMap.set(n.id, []));

  edges.forEach(e => {
    const list = childrenMap.get(e.source);
    if (list) {
      list.push({ id: e.target, isBranch: e.type === 'sideEdge' });
    }
  });

  const targets = new Set(edges.map(e => e.target));
  const roots = nodes.filter(n => n.type !== 'fileNode' && !targets.has(n.id));
  if (roots.length === 0 && nodes.length > 0) {
    const firstNonFile = nodes.find(n => n.type !== 'fileNode');
    if (firstNonFile) roots.push(firstNonFile);
  }

  const positions = new Map<string, { x: number; y: number }>();
  let globalMaxY = 0;

  function layoutSubtree(nodeId: string, x: number, y: number): number {
    positions.set(nodeId, { x, y });

    const children = childrenMap.get(nodeId) || [];
    const mainChild = children.find(c => !c.isBranch);
    const branchChildren = children.filter(c => c.isBranch);

    let currentBottomY = y + nodeHeight + verticalGap;

    branchChildren.forEach((branch, i) => {
      const branchX = x + horizontalOffset * (i + 1);
      const branchY = y;
      currentBottomY = Math.max(currentBottomY, layoutSubtree(branch.id, branchX, branchY));
    });

    if (mainChild) {
      const mainY = y + nodeHeight + verticalGap;
      currentBottomY = Math.max(currentBottomY, layoutSubtree(mainChild.id, x, mainY));
    }

    globalMaxY = Math.max(globalMaxY, currentBottomY);
    return currentBottomY;
  }

  let startY = 0;
  roots.forEach(root => {
    layoutSubtree(root.id, 100, startY);
    startY = globalMaxY + verticalGap;
  });

  return nodes.map(n => {
    if (n.type === 'fileNode') return n;
    const pos = positions.get(n.id);
    return pos ? { ...n, position: pos } : n;
  });
}
