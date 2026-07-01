import { Node, Edge } from '@xyflow/react';
import { AppSettings } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

export function useCanvasStorage() {
  const saveCanvasState = (nodes: Node[], edges: Edge[], activeNodeId: string | null, settings?: AppSettings) => {
    const state = { nodes, edges, activeNodeId, settings };
    localStorage.setItem(STORAGE_KEYS.CANVAS_STATE, JSON.stringify(state));
  };

  const loadCanvasState = (): { nodes: Node[]; edges: Edge[]; activeNodeId: string | null; settings?: AppSettings } | null => {
    const raw = localStorage.getItem(STORAGE_KEYS.CANVAS_STATE);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const exportSession = (nodes: Node[], edges: Edge[], activeNodeId: string | null, settings?: AppSettings) => {
    const state = { nodes, edges, activeNodeId, settings };
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cosmos-session-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSession = async (
    file: File
  ): Promise<{ nodes: Node[]; edges: Edge[]; activeNodeId: string | null; settings?: AppSettings }> => {
    const text = await file.text();
    const state = JSON.parse(text);
    if (state && state.nodes && state.edges) {
      return state;
    }
    throw new Error('Invalid session file');
  };

  return {
    saveCanvasState,
    loadCanvasState,
    exportSession,
    importSession,
  };
}
