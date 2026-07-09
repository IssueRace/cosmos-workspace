import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Node, Edge, ReactFlowProvider, useReactFlow, OnNodeDrag } from '@xyflow/react';
import { Settings, Paperclip, Search, Keyboard } from 'lucide-react';
import { CosmosCanvas } from './components/canvas/CosmosCanvas';
import { CanvasControls } from './components/controls/CanvasControls';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { FullscreenChat } from './components/fullscreen/FullscreenChat';
import { SearchPanel } from './components/search/SearchPanel';
import { SpaceManager } from './components/spaces/SpaceManager';
import { InputBar } from './components/input/InputBar';
import { GlassPanel } from './components/ui/GlassPanel';
import { ToastProvider, useToast } from './components/ui/Toast';
import { ShortcutsHelp } from './components/ui/ShortcutsHelp';
import { NodeStats } from './components/ui/NodeStats';
import { useConversationTree } from './hooks/useConversationTree';
import { useCanvasStorage } from './hooks/useCanvasStorage';
import { useAIStream } from './hooks/useAIStream';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { buildContextPath } from './utils/buildContextPath';
import { DEFAULT_SETTINGS } from './utils/constants';
import { AppSettings } from './types';
import './App.css';

function AppContent() {
  const {
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
  } = useConversationTree();

  const { exportSession, importSession } = useCanvasStorage();
  const { isStreaming, streamAIResponse } = useAIStream();
  const { zoomIn, zoomOut, fitView, screenToFlowPosition, setCenter } = useReactFlow();

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMinimapOpen, setIsMinimapOpen] = useState(true);
  const [isBranchMode, setIsBranchMode] = useState(false);
  const [fullscreenNodeId, setFullscreenNodeId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalCollapseMode, setGlobalCollapseMode] = useState<'default' | 'collapsed' | 'expanded'>('default');
  const [isInputBarHidden, setIsInputBarHidden] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const { showToast } = useToast();

  const [spaces, setSpaces] = useState<{ id: string; name: string }[]>(() => {
    const saved = localStorage.getItem('cosmos_spaces_list');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Main Space' }];
  });
  const [activeSpaceId, setActiveSpaceIdSpace] = useState<string>(() => {
    return localStorage.getItem('cosmos_active_space_id') || 'default';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveSpaceState = useCallback((spaceId: string, currentNodes: Node[], currentEdges: Edge[], activeNode: string | null) => {
    const state = {
      nodes: currentNodes,
      edges: currentEdges,
      activeNodeId: activeNode,
      updatedAt: Date.now()
    };
    localStorage.setItem(`cosmos-space-state-${spaceId}`, JSON.stringify(state));
  }, []);

  const loadSpaceState = useCallback((spaceId: string) => {
    const saved = localStorage.getItem(`cosmos-space-state-${spaceId}`);
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem('cosmos_settings');
    if (savedSettings) {
      try { setSettings(JSON.parse(savedSettings)); } catch { setSettings(DEFAULT_SETTINGS); }
    }
    const savedState = loadSpaceState(activeSpaceId);
    if (savedState) {
      setTreeState(savedState.nodes, savedState.edges, savedState.activeNodeId);
    } else {
      const rootId = crypto.randomUUID();
      const initialNode: Node = {
        id: rootId,
        type: 'dialogueNode',
        position: { x: 100, y: 100 },
        data: {
          prompt: 'Welcome to Cosmos',
          response: 'This is a spatial AI workspace. Type in the input box of active node to build a conversation tree. Click the Branch action to start side questions.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'success',
          model: 'system',
          isMainPath: true,
          isStreaming: false,
        },
      };
      setTreeState([initialNode], [], rootId);
    }
  }, [setTreeState]);


  useEffect(() => {
    if (nodes.length > 0) {
      saveSpaceState(activeSpaceId, nodes, edges, activeNodeId);
    }
  }, [nodes, edges, activeNodeId, activeSpaceId, saveSpaceState]);

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('cosmos_settings', JSON.stringify(newSettings));
  };

  const handleExport = useCallback(() => {
    exportSession(nodes, edges, activeNodeId, settings);
    showToast('Session exported successfully', 'success');
  }, [nodes, edges, activeNodeId, settings, exportSession, showToast]);

  useKeyboardShortcuts(useMemo(() => ({
    'ctrl+f': () => setIsSearchOpen((prev) => !prev),
    'ctrl+/': () => setIsShortcutsHelpOpen((prev) => !prev),
    'ctrl+e': () => handleExport(),
    'escape': () => {
      setIsSettingsOpen(false);
      setIsSearchOpen(false);
      setFullscreenNodeId(null);
      setIsShortcutsHelpOpen(false);
    },
  }), [handleExport]));

  const handleImport = async (file: File) => {
    try {
      const state = await importSession(file);
      setTreeState(state.nodes, state.edges, state.activeNodeId);
      if (state.settings) {
        setSettings(state.settings);
        localStorage.setItem('cosmos_settings', JSON.stringify(state.settings));
      }
      showToast('Session imported successfully', 'success');
    } catch {
      showToast('Failed to import session file', 'error');
    }
  };

  const handleClearCanvas = () => {
    if (confirm('Clear the entire workspace?')) {
      const rootId = crypto.randomUUID();
      const initialNode: Node = {
        id: rootId,
        type: 'dialogueNode',
        position: { x: 100, y: 100 },
        data: {
          prompt: 'Welcome to Cosmos',
          response: 'Workspace cleared. Start a new conversation.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'success',
          model: 'system',
          isMainPath: true,
          isStreaming: false,
        },
      };
      localStorage.removeItem(`cosmos-space-state-${activeSpaceId}`);
      setTreeState([initialNode], [], rootId);
      setIsSettingsOpen(false);
      setFullscreenNodeId(null);
      setIsSearchOpen(false);
      showToast('Canvas cleared', 'info');
    }
  };

  const handleSelectSpace = (spaceId: string) => {
    if (spaceId === activeSpaceId) return;
    saveSpaceState(activeSpaceId, nodes, edges, activeNodeId);
    setActiveSpaceIdSpace(spaceId);
    localStorage.setItem('cosmos_active_space_id', spaceId);
    const state = loadSpaceState(spaceId);
    if (state) {
      setTreeState(state.nodes, state.edges, state.activeNodeId);
    } else {
      const rootId = crypto.randomUUID();
      const initialNode: Node = {
        id: rootId,
        type: 'dialogueNode',
        position: { x: 100, y: 100 },
        data: {
          prompt: 'Welcome to Cosmos',
          response: 'This is a new space. Type inside this node or attach files to begin.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'success',
          model: 'system',
          isMainPath: true,
          isStreaming: false,
        },
      };
      setTreeState([initialNode], [], rootId);
    }
  };

  const handleCreateSpace = () => {
    const name = prompt('Enter space name:', `Space ${spaces.length + 1}`);
    if (!name || !name.trim()) return;
    const newSpace = { id: crypto.randomUUID(), name: name.trim() };
    const nextSpaces = [...spaces, newSpace];
    setSpaces(nextSpaces);
    localStorage.setItem('cosmos_spaces_list', JSON.stringify(nextSpaces));
    handleSelectSpace(newSpace.id);
    showToast(`Space "${name.trim()}" created`, 'success');
  };

  const handleDeleteSpace = (spaceId: string) => {
    const nextSpaces = spaces.filter(s => s.id !== spaceId);
    setSpaces(nextSpaces);
    localStorage.setItem('cosmos_spaces_list', JSON.stringify(nextSpaces));
    localStorage.removeItem(`cosmos-space-state-${spaceId}`);
    if (spaceId === activeSpaceId) {
      const firstSpace = nextSpaces[0];
      setActiveSpaceIdSpace(firstSpace.id);
      localStorage.setItem('cosmos_active_space_id', firstSpace.id);
      const state = loadSpaceState(firstSpace.id);
      if (state) {
        setTreeState(state.nodes, state.edges, state.activeNodeId);
      }
    }
  };

  const handleRenameSpace = (spaceId: string, newName: string) => {
    const nextSpaces = spaces.map(s => s.id === spaceId ? { ...s, name: newName } : s);
    setSpaces(nextSpaces);
    localStorage.setItem('cosmos_spaces_list', JSON.stringify(nextSpaces));
  };

  const generateSummaryForNode = async (nodeId: string, promptText: string, responseText: string) => {
    const fallbackSummary = `Discussed prompt: "${promptText.slice(0, 40)}..." -> Key outcome: "${responseText.slice(0, 40)}..."`;
    if (!settings.apiKey) {
      updateNodeSummary(nodeId, fallbackSummary);
      return;
    }
    try {
      const res = await fetch(`${settings.apiBaseUrl || 'https://api.openai.com/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            {
              role: 'system',
              content: 'Summarize the user request and AI reply in 1 concise sentence of under 15 words. Focus on the core technical conclusion.'
            },
            {
              role: 'user',
              content: `User: ${promptText}\nAI: ${responseText}`
            }
          ],
          max_tokens: 40,
          temperature: 0.3
        })
      });
      if (res.ok) {
        const json = await res.json();
        const summary = json.choices?.[0]?.message?.content || fallbackSummary;
        updateNodeSummary(nodeId, summary.trim());
      } else {
        updateNodeSummary(nodeId, fallbackSummary);
      }
    } catch {
      updateNodeSummary(nodeId, fallbackSummary);
    }
  };

  const streamAIResponseForNode = useCallback(async (nodeId: string, prompt: string) => {
    // Find parent of this node
    const parentEdge = edges.find(e => e.target === nodeId && nodes.find(n => n.id === e.source)?.type !== 'fileNode');
    const parentId = parentEdge ? parentEdge.source : null;

    const pathContext = [
      ...(parentId ? buildContextPath(nodes, edges, parentId) : []),
      { role: 'user' as const, content: prompt },
    ];

    try {
      updateNodeResponse(nodeId, '', true);
      let responseText = '';
      const result = await streamAIResponse(
        settings.apiBaseUrl || 'https://api.openai.com/v1',
        settings.apiKey,
        settings.model,
        pathContext,
        (token) => {
          responseText += token;
          updateNodeResponse(nodeId, responseText, true);
        }
      );
      updateNodeResponse(nodeId, result || responseText, false);
      generateSummaryForNode(nodeId, prompt, result || responseText);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred while calling the AI model.';
      updateNodeResponse(nodeId, msg, false);
      showToast('AI request failed', 'error');
    }
  }, [nodes, edges, settings, updateNodeResponse, streamAIResponse]);

  const handlePromptFromNode = useCallback(async (parentId: string, prompt: string, isBranch: boolean) => {
    if (isStreaming) return;

    const newNodeId = addNode(prompt, parentId, isBranch, settings.model);
    setActiveNodeId(newNodeId);

    setTimeout(() => {
      applyLayout();
      fitView({ nodes: [{ id: newNodeId }, { id: parentId }], duration: 800, padding: 0.2 });
    }, 100);

    await streamAIResponseForNode(newNodeId, prompt);
  }, [isStreaming, addNode, applyLayout, fitView, streamAIResponseForNode, setActiveNodeId]);

  const handlePromptFromFullscreen = useCallback(async (parentId: string, prompt: string, isBranch: boolean) => {
    if (isStreaming) return;

    const newNodeId = addNode(prompt, parentId, isBranch, settings.model);
    setFullscreenNodeId(newNodeId);

    setTimeout(() => {
      applyLayout();
      fitView({ nodes: [{ id: newNodeId }, { id: parentId }], duration: 800, padding: 0.2 });
    }, 100);

    await streamAIResponseForNode(newNodeId, prompt);
  }, [isStreaming, addNode, applyLayout, fitView, streamAIResponseForNode, setFullscreenNodeId]);

  const handleNodeDrag: OnNodeDrag = useCallback((_event, draggedNode) => {
    if (draggedNode.type === 'fileNode') return;

    setNodes((prevNodes) => {
      const dragged = prevNodes.find((n) => n.id === draggedNode.id);
      if (!dragged || !dragged.measured) return prevNodes;

      const draggedW = dragged.measured.width || 320;
      const draggedH = dragged.measured.height || 220;
      const draggedX = draggedNode.position.x;
      const draggedY = draggedNode.position.y;

      let changed = false;
      const nextNodes = prevNodes.map((node) => {
        if (node.id === draggedNode.id || node.type === 'fileNode') {
          return node;
        }

        const nodeW = node.measured?.width || 320;
        const nodeH = node.measured?.height || 220;
        const nodeX = node.position.x;
        const nodeY = node.position.y;

        const overlapX = Math.min(draggedX + draggedW, nodeX + nodeW) - Math.max(draggedX, nodeX);
        const overlapY = Math.min(draggedY + draggedH, nodeY + nodeH) - Math.max(draggedY, nodeY);

        if (overlapX > 0 && overlapY > 0) {
          changed = true;
          const dx = (nodeX + nodeW / 2) - (draggedX + draggedW / 2);
          const dy = (nodeY + nodeH / 2) - (draggedY + draggedH / 2);

          let pushX = 0;
          let pushY = 0;

          if (Math.abs(dx) > Math.abs(dy)) {
            pushX = dx > 0 ? overlapX + 24 : -overlapX - 24;
          } else {
            pushY = dy > 0 ? overlapY + 24 : -overlapY - 24;
          }

          return {
            ...node,
            position: {
              x: Math.round((nodeX + pushX) / 24) * 24,
              y: Math.round((nodeY + pushY) / 24) * 24,
            }
          };
        }
        return node;
      });

      return changed ? nextNodes : prevNodes;
    });
  }, [setNodes]);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setActiveNodeId(node.id);
    if (fullscreenNodeId !== null && node.type !== 'fileNode') {
      setFullscreenNodeId(node.id);
    }
  }, [setActiveNodeId, fullscreenNodeId]);

  const onConnect = useCallback((connection: any) => {
    if (connection.source === connection.target) return;
    const isDuplicate = edges.some(
      (e) => e.source === connection.source && e.target === connection.target
    );
    if (isDuplicate) return;

    const sourceNode = nodes.find(n => n.id === connection.source);
    const isFile = sourceNode?.type === 'fileNode';
    const isBranch = connection.sourceHandle === 'output-branch';

    const newEdge = {
      id: `${connection.source}->${connection.target}`,
      source: connection.source,
      target: connection.target,
      type: isFile ? 'fileEdge' : isBranch ? 'sideEdge' : 'mainEdge',
    };
    setTreeState(nodes, [...edges, newEdge], activeNodeId);
    if (!isFile) {
      setTimeout(() => applyLayout(), 50);
    }
  }, [nodes, edges, activeNodeId, setTreeState, applyLayout]);

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  const mappedNodes = useMemo(() => {
    return nodes.map((node) => {
      if (node.type === 'fileNode') {
        return {
          ...node,
          data: {
            ...node.data,
            onDelete: () => {
              const nextNodes = nodes.filter((n) => n.id !== node.id);
              const nextEdges = edges.filter((e) => e.source !== node.id && e.target !== node.id);
              setTreeState(nextNodes, nextEdges, activeNodeId);
            },
          },
        };
      }
      return {
        ...node,
        type: node.type || 'dialogueNode',
        data: {
          ...node.data,
          onBranch: () => {
            const draftId = addNode('', node.id, true, settings.model);
            setActiveNodeId(draftId);
            setTimeout(() => {
              applyLayout();
              fitView({ nodes: [{ id: draftId }, { id: node.id }], duration: 800, padding: 0.2 });
            }, 100);
          },
          onDelete: () => deleteBranch(node.id),
          onFullscreen: () => setFullscreenNodeId(node.id),
          onSubmitPrompt: (prompt: string, isBranch: boolean) => {
            handlePromptFromNode(node.id, prompt, isBranch);
          },
          onSubmitDraft: (prompt: string) => {
            updateNodePrompt(node.id, prompt);
            streamAIResponseForNode(node.id, prompt);
            setTimeout(() => applyLayout(), 50);
          },
          onPromote: () => {
            promoteBranchToMain(node.id);
          },
          isStreaming: node.data?.isStreaming || false,
        },
      };
    });
  }, [nodes, edges, activeNodeId, addNode, applyLayout, fitView, deleteBranch, setActiveNodeId, handlePromptFromNode, updateNodePrompt, streamAIResponseForNode, promoteBranchToMain]);

  const activeNodeLabel = useMemo(() => {
    if (!activeNodeId) return null;
    const node = nodes.find(n => n.id === activeNodeId);
    if (!node) return null;
    const data = node.data as { prompt: string };
    return data?.prompt ? data.prompt.slice(0, 30) + '...' : 'Dialogue';
  }, [nodes, activeNodeId]);

  const activePathEdgeIds = useMemo(() => {
    const activeIds = new Set<string>();
    let currentId = activeNodeId;
    while (currentId) {
      const incoming = edges.find(
        (e) => e.target === currentId && nodes.find((n) => n.id === e.source)?.type !== 'fileNode'
      );
      if (incoming) {
        activeIds.add(incoming.id);
        currentId = incoming.source;
      } else {
        currentId = null;
      }
    }
    return activeIds;
  }, [nodes, edges, activeNodeId]);

  const mappedEdges = useMemo(() => {
    return edges.map((edge) => {
      const isActive = activePathEdgeIds.has(edge.id);
      if (edge.type === 'fileEdge') {
        return { ...edge, className: `file-edge ${isActive ? 'active-path' : ''}` };
      }
      const isSide = edge.type === 'sideEdge';
      return {
        ...edge,
        className: `${isSide ? 'side-edge' : 'main-edge'} ${isActive ? 'active-path' : ''}`
      };
    });
  }, [edges, activePathEdgeIds]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only trigger when leaving the container, not child elements
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const position = screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    });

    const newNodes = [...nodes];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const textContent = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => resolve((evt.target?.result as string) || '');
        reader.onerror = () => resolve('Error reading file');
        reader.readAsText(file);
      });

      const offsetX = position.x + i * 40;
      const offsetY = position.y + i * 40;

      const newFileNode: Node = {
        id: crypto.randomUUID(),
        type: 'fileNode',
        position: { x: offsetX, y: offsetY },
        data: {
          name: file.name,
          size: file.size,
          content: textContent,
        },
      };
      newNodes.push(newFileNode);
    }
    setTreeState(newNodes, edges, activeNodeId);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newNodes = [...nodes];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const textContent = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => resolve((evt.target?.result as string) || '');
        reader.onerror = () => resolve('Error reading file');
        reader.readAsText(file);
      });

      const newFileNode: Node = {
        id: crypto.randomUUID(),
        type: 'fileNode',
        position: { x: 100 + i * 40, y: 150 + i * 40 },
        data: {
          name: file.name,
          size: file.size,
          content: textContent,
        },
      };
      newNodes.push(newFileNode);
    }
    setTreeState(newNodes, edges, activeNodeId);
    e.target.value = '';
  };

  const handleFocusNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setActiveNodeId(nodeId);
      setCenter(node.position.x + 200, node.position.y + 150, { zoom: 0.9, duration: 800 });
    }
  }, [nodes, setActiveNodeId, setCenter]);

  return (
    <div className="app-container" onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave}>
      {isDragOver && (
        <div className="drop-zone-overlay">
          <div className="drop-zone-content">
            <Paperclip size={48} />
            <span>Drop files here</span>
          </div>
        </div>
      )}
      <div className="top-left-actions">
        <GlassPanel className="icon-button-panel">
          <button className="settings-trigger-btn" onClick={() => setIsSettingsOpen(true)} title="Settings">
            <Settings size={18} />
          </button>
          <button className="file-upload-trigger-btn" onClick={() => fileInputRef.current?.click()} title="Upload File">
            <Paperclip size={18} />
          </button>
          <button className="file-upload-trigger-btn" onClick={() => setIsSearchOpen(true)} title="Search Nodes (Ctrl+F)">
            <Search size={18} />
          </button>
          <button
            className={`file-upload-trigger-btn ${isInputBarHidden ? 'inactive' : ''}`}
            onClick={() => setIsInputBarHidden(!isInputBarHidden)}
            title={isInputBarHidden ? "Show bottom input bar" : "Hide bottom input bar"}
          >
            <Keyboard size={18} style={{ opacity: isInputBarHidden ? 0.4 : 1 }} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            multiple
          />
        </GlassPanel>
      </div>

      <div className="main-layout">
        <SpaceManager
          spaces={spaces}
          activeSpaceId={activeSpaceId}
          onSelectSpace={handleSelectSpace}
          onCreateSpace={handleCreateSpace}
          onDeleteSpace={handleDeleteSpace}
          onRenameSpace={handleRenameSpace}
        />

        <div className="canvas-container">
          <CosmosCanvas
            nodes={mappedNodes}
            edges={mappedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            isMinimapOpen={isMinimapOpen}
            globalCollapseMode={globalCollapseMode}
            onNodeDrag={handleNodeDrag}
          />
          <NodeStats nodes={nodes} edges={edges} />
        </div>

        <FullscreenChat
          isOpen={fullscreenNodeId !== null}
          onClose={() => setFullscreenNodeId(null)}
          activeNodeId={fullscreenNodeId}
          nodes={nodes}
          edges={edges}
          isStreaming={isStreaming}
          onSubmit={handlePromptFromFullscreen}
          onNavigateToNode={(nodeId) => setFullscreenNodeId(nodeId)}
        />
      </div>

      <div className="controls-container">
        <CanvasControls
          onZoomIn={() => zoomIn()}
          onZoomOut={() => zoomOut()}
          onFitView={() => fitView()}
          onToggleMinimap={() => setIsMinimapOpen(!isMinimapOpen)}
          isMinimapOpen={isMinimapOpen}
          globalCollapseMode={globalCollapseMode}
          onSetCollapseMode={setGlobalCollapseMode}
        />
      </div>
      {!isInputBarHidden && (
        <InputBar
          activeNodeLabel={activeNodeLabel}
          isBranchMode={isBranchMode}
          onToggleBranchMode={() => setIsBranchMode(!isBranchMode)}
          onCancelContext={() => {
            setActiveNodeId(null);
            setIsBranchMode(false);
          }}
          onSubmit={(prompt, isBranch) => {
            if (activeNodeId) {
              handlePromptFromNode(activeNodeId, prompt, isBranch);
            } else {
              const rootNode = nodes.find((n) => n.type !== 'fileNode');
              if (rootNode) {
                handlePromptFromNode(rootNode.id, prompt, isBranch);
              }
            }
          }}
          isStreaming={isStreaming}
        />
      )}

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onExport={handleExport}
        onImport={handleImport}
        onClearCanvas={handleClearCanvas}
      />

      <SearchPanel
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        nodes={nodes}
        onFocusNode={handleFocusNode}
      />

      <ShortcutsHelp
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ReactFlowProvider>
  );
}
