import React, { useRef } from 'react';
import { X, Settings as SettingsIcon, Download, Upload, Trash2 } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { AppSettings } from '../../types';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClearCanvas: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onExport,
  onImport,
  onClearCanvas,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) {
    return null;
  }

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, apiKey: e.target.value });
  };

  const handleApiBaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, apiBaseUrl: e.target.value });
  };

  const handleModelSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      onSettingsChange({ ...settings, model: 'custom-model' });
    } else {
      onSettingsChange({ ...settings, model: val });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  const isCustom = settings.model !== 'gpt-4o' && settings.model !== 'gpt-4o-mini';

  return (
    <div className="settings-overlay" onClick={onClose}>
      <GlassPanel className="settings-panel" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="settings-header">
          <div className="settings-title">
            <SettingsIcon size={18} className="settings-icon" />
            <span>Settings</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="settings-body">
          <div className="settings-group">
            <label className="settings-label">API Key</label>
            <input
              type="password"
              className="settings-input"
              value={settings.apiKey}
              onChange={handleApiKeyChange}
              placeholder="Enter OpenAI-compatible API key"
            />
          </div>

          <div className="settings-group">
            <label className="settings-label">API Base URL</label>
            <input
              type="text"
              className="settings-input"
              value={settings.apiBaseUrl || ''}
              onChange={handleApiBaseUrlChange}
              placeholder="https://api.openai.com/v1"
            />
          </div>

          <div className="settings-group">
            <label className="settings-label">Model Selection</label>
            <select
              className="settings-select"
              value={isCustom ? 'custom' : settings.model}
              onChange={handleModelSelectChange}
            >
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="custom">Custom Model...</option>
            </select>
            {isCustom && (
              <input
                type="text"
                className="settings-input custom-model-input"
                value={settings.model === 'custom-model' ? '' : settings.model}
                onChange={(e) => onSettingsChange({ ...settings, model: e.target.value || 'custom-model' })}
                placeholder="Enter custom model name"
              />
            )}
          </div>

          <div className="settings-group">
            <label className="settings-label">Theme</label>
            <div className="theme-value">Dark (MVP Default)</div>
          </div>

          <hr className="settings-divider" />

          <div className="settings-actions">
            <button className="action-btn" onClick={onExport}>
              <Download size={16} />
              <span>Export Session</span>
            </button>

            <button className="action-btn" onClick={handleImportClick}>
              <Upload size={16} />
              <span>Import Session</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".json"
            />

            <button className="action-btn danger" onClick={onClearCanvas}>
              <Trash2 size={16} />
              <span>Clear Canvas</span>
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};
