

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
  model?: string;
  isStreaming?: boolean;
  isMainPath: boolean;
  status?: 'success' | 'idle' | 'error' | 'running' | 'draft';
  onBranch?: () => void;
  onDelete?: () => void;
  onFullscreen?: () => void;
  onSubmitPrompt?: (prompt: string, isBranch: boolean) => void;
  onSubmitDraft?: (prompt: string) => void;
  onPromote?: () => void;
  summary?: string;
}
