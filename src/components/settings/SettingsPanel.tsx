import React, { useRef, useState } from 'react';
import { X, Settings as SettingsIcon, Download, Upload, Trash2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
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
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, apiKey: e.target.value });
  };

  const handleClearApiKey = () => {
    onSettingsChange({ ...settings, apiKey: '' });
  };

  const applyPreset = (baseUrl: string, model: string) => {
    onSettingsChange({ ...settings, apiBaseUrl: baseUrl, model });
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

  const isCustom =
    settings.model !== 'gpt-4o' &&
    settings.model !== 'gpt-4o-mini' &&
    settings.model !== 'llama-3.3-70b-versatile';

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
          <div className="security-trust-card">
            <div className="security-trust-header">
              <ShieldCheck size={16} className="security-shield-icon" />
              <span>100% Client-Side Key Storage (BYOK)</span>
            </div>
            <p className="security-trust-text">
              Your API key is saved exclusively in your browser's local storage and sent directly from your device to the provider. Cosmos has no backend server. Leave empty to use built-in <strong>Interactive Demo Mode</strong>.
            </p>
          </div>

          <div className="settings-group">
            <div className="settings-label-row">
              <label className="settings-label">API Key</label>
              {settings.apiKey ? (
                <button className="clear-key-link" onClick={handleClearApiKey} title="Remove key from browser">
                  Forget Key
                </button>
              ) : (
                <span className="demo-mode-pill">Demo Mode Active</span>
              )}
            </div>
            <div className="api-key-input-wrapper">
              <input
                type={showKey ? 'text' : 'password'}
                className="settings-input api-key-input"
                value={settings.apiKey}
                onChange={handleApiKeyChange}
                placeholder="sk-... or gsk_... (leave empty for Demo Mode)"
              />
              <button
                type="button"
                className="toggle-key-visibility"
                onClick={() => setShowKey((v) => !v)}
                title={showKey ? 'Hide API Key' : 'Show API Key'}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">Quick Provider Presets</label>
            <div className="provider-presets-row">
              <button
                type="button"
                className="preset-chip"
                onClick={() => applyPreset('https://api.openai.com/v1', 'gpt-4o-mini')}
              >
                OpenAI
              </button>
              <button
                type="button"
                className="preset-chip"
                onClick={() => applyPreset('https://api.groq.com/openai/v1', 'llama-3.3-70b-versatile')}
              >
                Groq (Free)
              </button>
              <button
                type="button"
                className="preset-chip"
                onClick={() => applyPreset('http://localhost:11434/v1', 'llama3.2')}
              >
                Ollama (Local)
              </button>
            </div>
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
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Groq)</option>
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
