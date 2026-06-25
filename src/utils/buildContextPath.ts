import { Node, Edge } from '@xyflow/react';
import { Message } from '../types';

export function buildContextPath(nodes: Node[], edges: Edge[], activeNodeId: string): Message[] {
  const path: Message[] = [];
  const orderedNodes: Node[] = [];
  let currentId: string | null = activeNodeId;

  while (currentId) {
    const node = nodes.find(n => n.id === currentId);
    if (!node) {
      break;
    }
    orderedNodes.unshift(node);
    const incomingConversationEdge = edges.find(
      e => e.target === currentId && nodes.find(n => n.id === e.source)?.type !== 'fileNode'
    );
    currentId = incomingConversationEdge ? incomingConversationEdge.source : null;
  }

  const K = 4;
  const totalNodes = orderedNodes.length;

  const summarizedNodes = totalNodes > K ? orderedNodes.slice(0, totalNodes - K) : [];
  const fullNodes = totalNodes > K ? orderedNodes.slice(totalNodes - K) : orderedNodes;

  if (summarizedNodes.length > 0) {
    const summaries = summarizedNodes.map(node => {
      const data = node.data as { prompt: string; response: string; summary?: string };
      return data.summary || `User discussed: "${data.prompt.slice(0, 40)}..." -> AI resolved this.`;
    });

    path.push({
      role: 'system',
      content: `Summary of previous conversation stages:\n${summaries.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}`
    });
  }

  fullNodes.forEach(node => {
    const data = node.data as { prompt: string; response: string };
    if (!data) return;

    const attachedFilesContent: string[] = [];
    const incomingFileEdges = edges.filter(e => e.target === node.id);

    incomingFileEdges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (sourceNode && sourceNode.type === 'fileNode') {
        const fileData = sourceNode.data as { name: string; content: string };
        if (fileData) {
          attachedFilesContent.push(`[Attached File: ${fileData.name}]\nContent:\n${fileData.content}`);
        }
      }
    });

    let promptContent = data.prompt || '';
    if (attachedFilesContent.length > 0) {
      promptContent = `${attachedFilesContent.join('\n\n')}\n\n${promptContent}`;
    }

    if (promptContent) {
      path.push({
        role: 'user',
        content: promptContent,
      });
    }

    if (data.response) {
      path.push({
        role: 'assistant',
        content: data.response,
      });
    }
  });

  return path;
}
