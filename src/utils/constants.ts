export const STORAGE_KEYS = {
  CANVAS_STATE: 'cosmos-canvas-state',
  SETTINGS: 'cosmos_settings',
};

export const DEFAULT_SETTINGS = {
  apiKey: '',
  model: 'gpt-4o-mini',
  apiBaseUrl: 'https://api.openai.com/v1',
};

export const LAYOUT_CONSTANTS = {
  NODE_WIDTH: 400,
  VERTICAL_GAP: 80,
  HORIZONTAL_GAP: 80,
  NODE_PADDING: 20,
  HORIZONTAL_OFFSET: 480,
};

export const ZOOM_LIMITS = {
  MIN: 0.15,
  MAX: 2.0,
  LOD_FULL: 0.7,
  LOD_COMPACT: 0.35,
};
