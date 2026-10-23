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
          const parentNode = parentId ? prevNodes.find((n) => n.id === parentId) : null;
          let posX = 100;
          let posY = 100;

          if (parentNode) {
            const parentX = parentNode.position.x;
            const parentY = parentNode.position.y;
            const parentW = parentNode.measured?.width || 320;
            const parentH = parentNode.measured?.height || 220;

            if (isBranch) {
              posX = parentX + parentW + 80;
              posY = parentY;
            } else {
              posX = parentX;
              posY = parentY + parentH + 80;
            }
          }

          const positionedNode = {
            ...newNode,
            position: { x: posX, y: posY }
          };

          return [...prevNodes, positionedNode];
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

  const updateNodeTitle = useCallback(
    (nodeId: string, title: string) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                title,
              },
            };
          }
          return node;
        })
      );
    },
    []
  );

  const addArtifactNode = useCallback(
    (title: string, language: string, content: string, parentDialogueId?: string) => {
      const artifactId = crypto.randomUUID();

      setNodes((prevNodes) => {
        const parentNode = parentDialogueId ? prevNodes.find((n) => n.id === parentDialogueId) : null;
        let posX = 200;
        let posY = 200;

        if (parentNode) {
          const parentW = parentNode.measured?.width || 420;
          posX = parentNode.position.x + parentW + 60;
          posY = parentNode.position.y;
        }

        const newArtifactNode: Node = {
          id: artifactId,
          type: 'artifactNode',
          position: { x: posX, y: posY },
          data: {
            title,
            language,
            content,
            parentDialogueId,
          },
        };

        return [...prevNodes, newArtifactNode];
      });

      if (parentDialogueId) {
        setEdges((prevEdges) => [
          ...prevEdges,
          {
            id: `${parentDialogueId}->${artifactId}`,
            source: parentDialogueId,
            target: artifactId,
            type: 'sideEdge',
          },
        ]);
      }

      return artifactId;
    },
    []
  );

  const updateArtifactNode = useCallback(
    (nodeId: string, updates: { content?: string; title?: string }) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updates,
              },
            };
          }
          return node;
        })
      );
    },
    []
  );

  const addMergeNode = useCallback(
    (parentIds: string[], prompt: string = '', model?: string) => {
      const mergeId = crypto.randomUUID();
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setNodes((prevNodes) => {
        const parents = prevNodes.filter((n) => parentIds.includes(n.id));
        let avgX = 200;
        let maxY = 200;

        if (parents.length > 0) {
          avgX = parents.reduce((sum, p) => sum + p.position.x, 0) / parents.length;
          maxY = Math.max(...parents.map((p) => p.position.y + (p.measured?.height || 220)));
        }

        const newMergeNode: Node = {
          id: mergeId,
          type: 'dialogueNode',
          position: { x: avgX, y: maxY + 100 },
          data: {
            prompt,
            response: '',
            timestamp,
            title: 'Synthesis Branch',
            isMainPath: false,
            isMergeNode: true,
            model: model || 'gpt-4o-mini',
            isStreaming: false,
            status: prompt ? 'success' : 'draft',
          },
        };

        return [...prevNodes, newMergeNode];
      });

      setEdges((prevEdges) => {
        const newEdges = [...prevEdges];
        parentIds.forEach((parentId) => {
          newEdges.push({
            id: `${parentId}->${mergeId}`,
            source: parentId,
            target: mergeId,
            type: 'sideEdge',
          });
        });
        return newEdges;
      });

      setActiveNodeId(mergeId);
      return mergeId;
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
          return nextNodes;
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
    addArtifactNode,
    updateArtifactNode,
    addMergeNode,
    updateNodePrompt,
    updateNodeResponse,
    updateNodeSummary,
    updateNodeTitle,
    promoteBranchToMain,
    deleteBranch,
    applyLayout,
  };
}
