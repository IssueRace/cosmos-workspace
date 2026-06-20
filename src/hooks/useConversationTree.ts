import { useState, useCallback } from 'react';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';
import { calculateTreeLayout } from '../utils/treeLayout';

export function useConversationTree() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const setTreeState = useCallback((newNodes: Node[], newEdges: Edge[], activeId: string | null) => {
    setNodes(newNodes);
    setEdges(newEdges);
    setActiveNodeId(activeId);
  }, []);

  const addNode = useCallback(
    (prompt: string, parentId?: string, isBranch?: boolean, model?: string) => {
      const newNodeId = crypto.randomUUID();
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isMainPath = !isBranch;

      const newNode: Node = {
        id: newNodeId,
        type: 'dialogueNode',
        position: { x: 0, y: 0 },
        data: {
          prompt,
          response: '',
          timestamp,
          isMainPath,
          model: model || 'gpt-4o-mini',
          isStreaming: false,
          status: prompt ? 'success' : 'draft',
        },
      };

      setEdges((prevEdges) => {
        const nextEdges = [...prevEdges];
        if (parentId) {
          nextEdges.push({
            id: `${parentId}->${newNodeId}`,
            source: parentId,
            target: newNodeId,
            type: isBranch ? 'sideEdge' : 'mainEdge',
          });
        }

        setNodes((prevNodes) => {
          const nextNodes = [...prevNodes, newNode];
          return calculateTreeLayout(nextNodes, nextEdges);
        });

        return nextEdges;
      });

      setActiveNodeId(newNodeId);
      return newNodeId;
    },
    []
  );

  const updateNodePrompt = useCallback(
    (nodeId: string, prompt: string) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                prompt,
                status: 'success',
              },
            };
          }
          return node;
        })
      );
    },
    []
  );

  const updateNodeResponse = useCallback(
    (nodeId: string, response: string, isStreaming: boolean) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                response,
                isStreaming,
                status: isStreaming ? 'running' : 'success',
              },
            };
          }
          return node;
        })
      );
    },
    []
  );

  const updateNodeSummary = useCallback(
    (nodeId: string, summary: string) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                summary,
              },
            };
          }
          return node;
        })
      );
    },
    []
  );

  const deleteBranch = useCallback(
    (nodeId: string) => {
      setEdges((prevEdges) => {
        const descendants = new Set<string>();
        const queue = [nodeId];

        while (queue.length > 0) {
          const current = queue.shift()!;
          descendants.add(current);
          prevEdges.forEach((edge) => {
            if (edge.source === current && !descendants.has(edge.target)) {
              queue.push(edge.target);
            }
          });
        }

        const nextEdges = prevEdges.filter(
          (edge) => !descendants.has(edge.source) && !descendants.has(edge.target)
        );

        setNodes((prevNodes) => {
          const nextNodes = prevNodes.filter((node) => !descendants.has(node.id));
          return calculateTreeLayout(nextNodes, nextEdges);
        });

        if (activeNodeId && descendants.has(activeNodeId)) {
          setActiveNodeId(null);
        }

        return nextEdges;
      });
    },
    [activeNodeId]
  );

  const promoteBranchToMain = useCallback((nodeId: string) => {
    setEdges((prevEdges) => {
      const descendants = new Set<string>();
      const queue = [nodeId];
      while (queue.length > 0) {
        const current = queue.shift()!;
        descendants.add(current);
        prevEdges.forEach((edge) => {
          if (edge.source === current) {
            queue.push(edge.target);
          }
        });
      }

      const nextEdges = prevEdges.map((edge) => {
        if (edge.target === nodeId || (descendants.has(edge.source) && descendants.has(edge.target))) {
          return { ...edge, type: 'mainEdge' };
        }
        return edge;
      });

      setNodes((prevNodes) => {
        const nextNodes = prevNodes.map((node) => {
          if (descendants.has(node.id) || node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                isMainPath: true,
              },
            };
          }
          return node;
        });
        return calculateTreeLayout(nextNodes, nextEdges);
      });

      return nextEdges;
    });
  }, []);

  const applyLayout = useCallback(() => {
    setNodes((nds) => calculateTreeLayout(nds, edges));
  }, [edges]);

  return {
    nodes,
    setNodes,
    edges,
    activeNodeId,
    setActiveNodeId,
    onNodesChange,
    onEdgesChange,
    setTreeState,
    addNode,
    updateNodePrompt,
    updateNodeResponse,
    updateNodeSummary,
    promoteBranchToMain,
    deleteBranch,
    applyLayout,
  };
}
