

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AppSettings {
  apiKey: string;
  model: string;
  apiBaseUrl: string;
}

export interface CosmosNodeData {
  prompt: string;
  response: string;
  timestamp: string;
  title?: string;
  model?: string;
  isStreaming?: boolean;
  isMainPath: boolean;
  isMergeNode?: boolean;
  status?: 'success' | 'idle' | 'error' | 'running' | 'draft';
  onBranch?: () => void;
  onContinue?: () => void;
  onDelete?: () => void;
  onFullscreen?: () => void;
  onSubmitPrompt?: (prompt: string, isBranch: boolean) => void;
  onSubmitDraft?: (prompt: string) => void;
  onPromote?: () => void;
  onResizeStop?: () => void;
  onSpawnArtifact?: (title: string, language: string, content: string) => void;
  summary?: string;
}

export interface CanvasAnnotation {
  id: string;
  type: 'path' | 'rect' | 'circle' | 'text';
  color: string;
  size: number;
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
}

export interface ArtifactNodeData {
  title: string;
  language: string;
  content: string;
  parentDialogueId?: string;
  onUpdateContent?: (newContent: string) => void;
  onUpdateTitle?: (newTitle: string) => void;
  onDelete?: () => void;
  onResizeStop?: () => void;
}
