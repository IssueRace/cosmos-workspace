import React from 'react';
import './GlassPanel.css';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = '', onClick }) => {
  return (
    <div className={`glass-panel ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};
