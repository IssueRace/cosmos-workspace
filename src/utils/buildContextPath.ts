import { Node, Edge } from '@xyflow/react';
import { Message } from '../types';

export function buildContextPath(nodes: Node[], edges: Edge[], activeNodeId: string): Message[] {
  const path: Message[] = [];
  const activeNode = nodes.find((n) => n.id === activeNodeId);
  if (!activeNode) return path;

  // Find all incoming conversation parents
  const incomingParentEdges = edges.filter(
    (e) =>
      e.target === activeNodeId &&
      nodes.find((n) => n.id === e.source)?.type === 'dialogueNode'
  );

  // If node is a merge/synthesis node with multiple parents
  if (incomingParentEdges.length > 1) {
    const branchSummaries: string[] = [];

    incomingParentEdges.forEach((parentEdge, branchIdx) => {
      const branchNodes: Node[] = [];
      let curr: string | null = parentEdge.source;

      while (curr) {
        const n = nodes.find((node) => node.id === curr);
        if (!n) break;
        branchNodes.unshift(n);
        const nextIn = edges.find(
          (e) =>
            e.target === curr &&
            nodes.find((node) => node.id === e.source)?.type === 'dialogueNode'
        );
        curr = nextIn ? nextIn.source : null;
      }

      const branchText = branchNodes
        .map((bn) => {
          const d = bn.data as { prompt?: string; response?: string; title?: string };
          return `Prompt: "${d.title || d.prompt || ''}" -> Solution: "${(d.response || '').slice(0, 120)}..."`;
        })
        .join('\n');

      branchSummaries.push(`--- Branch ${branchIdx + 1} Path ---\n${branchText}`);
    });

    path.push({
      role: 'system',
      content: `You are synthesizing multiple conversation branches into a unified solution. Here is the context from the interconnected branches:\n\n${branchSummaries.join('\n\n')}\n\nSynthesize the findings from all branches and address the user prompt.`,
    });
  }

  // Standard path collection from primary ancestor chain
  const orderedNodes: Node[] = [];
  let currentId: string | null = activeNodeId;

  while (currentId) {
    const node = nodes.find((n) => n.id === currentId);
    if (!node) break;
    orderedNodes.unshift(node);
    const incomingConversationEdge = edges.find(
      (e) =>
        e.target === currentId &&
        nodes.find((n) => n.id === e.source)?.type === 'dialogueNode'
    );
    currentId = incomingConversationEdge ? incomingConversationEdge.source : null;
  }

  const K = 4;
  const totalNodes = orderedNodes.length;
  const summarizedNodes = totalNodes > K ? orderedNodes.slice(0, totalNodes - K) : [];
  const fullNodes = totalNodes > K ? orderedNodes.slice(totalNodes - K) : orderedNodes;

  if (summarizedNodes.length > 0) {
    const summaries = summarizedNodes.map((node) => {
      const data = node.data as { prompt: string; response: string; summary?: string; title?: string };
      return data.summary || `[${data.title || 'Step'}]: "${data.prompt.slice(0, 40)}..." -> resolved.`;
    });

    path.push({
      role: 'system',
      content: `Summary of previous conversation stages:\n${summaries.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}`,
    });
  }

  fullNodes.forEach((node) => {
    const data = node.data as { prompt: string; response: string };
    if (!data) return;

    const attachedContext: string[] = [];
    const incomingResourceEdges = edges.filter((e) => e.target === node.id);

    incomingResourceEdges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (!sourceNode) return;

      if (sourceNode.type === 'fileNode') {
        const fileData = sourceNode.data as { name: string; content: string };
        if (fileData) {
          attachedContext.push(`[Attached File: ${fileData.name}]\n${fileData.content}`);
        }
      } else if (sourceNode.type === 'artifactNode') {
        const artifactData = sourceNode.data as { title: string; language: string; content: string };
        if (artifactData) {
          attachedContext.push(
            `[Attached Canvas Artifact: ${artifactData.title} (${artifactData.language || 'code'})]\n${artifactData.content}`
          );
        }
      }
    });

    let promptContent = data.prompt || '';
    if (attachedContext.length > 0) {
      promptContent = `${attachedContext.join('\n\n')}\n\n${promptContent}`;
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
