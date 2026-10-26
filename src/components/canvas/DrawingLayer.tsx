import React, { useState, useRef } from 'react';
import { useViewport } from '@xyflow/react';
import {
  MousePointer,
  PenTool,
  Eraser,
  Square,
  Circle as CircleIcon,
  Type,
  Undo2,
  Trash2,
  X,
} from 'lucide-react';
import { CanvasAnnotation } from '../../types';
import './DrawingLayer.css';

export type DrawTool = 'select' | 'pen' | 'eraser' | 'rect' | 'circle' | 'text';

interface DrawingLayerProps {
  isOpen: boolean;
  onClose: () => void;
  annotations: CanvasAnnotation[];
  onChange: React.Dispatch<React.SetStateAction<CanvasAnnotation[]>>;
}

const PRESET_COLORS = [
  '#5e9cff',
  '#bf5af2',
  '#30d158',
  '#ffd60a',
  '#ff9f0a',
  '#ff453a',
  '#64d2ff',
  '#ffffff',
];

export const DrawingLayer: React.FC<DrawingLayerProps> = ({
  isOpen,
  onClose,
  annotations,
  onChange,
}) => {
  const { x: vpX, y: vpY, zoom } = useViewport();
  const [activeTool, setActiveTool] = useState<DrawTool>('pen');
  const [color, setColor] = useState<string>('#5e9cff');
  const [brushSize, setBrushSize] = useState<number>(4);
  const [currentShape, setCurrentShape] = useState<CanvasAnnotation | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const isInteractive = isOpen && activeTool !== 'select';

  const toWorldCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    return {
      x: (localX - vpX) / zoom,
      y: (localY - vpY) / zoom,
    };
  };

  const eraseAtPoint = (wx: number, wy: number) => {
    const threshold = Math.max(20 / zoom, brushSize * 2);
    onChange((prev) =>
      prev.filter((item) => {
        if (item.type === 'path' && item.points) {
          return !item.points.some(
            (pt) => Math.hypot(pt.x - wx, pt.y - wy) <= threshold
          );
        }
        if (
          (item.type === 'rect' || item.type === 'circle') &&
          item.x !== undefined &&
          item.y !== undefined &&
          item.width !== undefined &&
          item.height !== undefined
        ) {
          const minX = Math.min(item.x, item.x + item.width) - threshold;
          const maxX = Math.max(item.x, item.x + item.width) + threshold;
          const minY = Math.min(item.y, item.y + item.height) - threshold;
          const maxY = Math.max(item.y, item.y + item.height) + threshold;
          return !(wx >= minX && wx <= maxX && wy >= minY && wy <= maxY);
        }
        if (item.type === 'text' && item.x !== undefined && item.y !== undefined) {
          return !(
            wx >= item.x - threshold &&
            wx <= item.x + 220 &&
            wy >= item.y - threshold &&
            wy <= item.y + 60
          );
        }
        return true;
      })
    );
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isInteractive || e.button !== 0) return;
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;

    const pt = toWorldCoords(e.clientX, e.clientY);

    if (activeTool === 'eraser') {
      e.currentTarget.setPointerCapture(e.pointerId);
      eraseAtPoint(pt.x, pt.y);
      setCurrentShape({
        id: 'eraser-active',
        type: 'path',
        color: '#ff453a',
        size: brushSize,
        points: [pt],
      });
      return;
    }

    if (activeTool === 'text') {
      const id = `ann-${Date.now()}`;
      const newText: CanvasAnnotation = {
        id,
        type: 'text',
        color,
        size: Math.max(14, brushSize * 3 + 6),
        x: pt.x,
        y: pt.y,
        text: 'Label',
      };
      onChange((prev) => [...prev, newText]);
      setEditingTextId(id);
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    const id = `ann-${Date.now()}`;

    if (activeTool === 'pen') {
      setCurrentShape({
        id,
        type: 'path',
        color,
        size: brushSize,
        points: [pt],
      });
    } else if (activeTool === 'rect' || activeTool === 'circle') {
      setCurrentShape({
        id,
        type: activeTool,
        color,
        size: brushSize,
        x: pt.x,
        y: pt.y,
        width: 0,
        height: 0,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!currentShape) return;
    const pt = toWorldCoords(e.clientX, e.clientY);

    if (activeTool === 'eraser') {
      eraseAtPoint(pt.x, pt.y);
      return;
    }

    if (currentShape.type === 'path' && currentShape.points) {
      setCurrentShape({
        ...currentShape,
        points: [...currentShape.points, pt],
      });
    } else if (
      (currentShape.type === 'rect' || currentShape.type === 'circle') &&
      currentShape.x !== undefined &&
      currentShape.y !== undefined
    ) {
      setCurrentShape({
        ...currentShape,
        width: pt.x - currentShape.x,
        height: pt.y - currentShape.y,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!currentShape) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (activeTool !== 'eraser') {
      if (currentShape.type === 'path' && (currentShape.points?.length || 0) > 1) {
        onChange((prev) => [...prev, currentShape]);
      } else if (
        (currentShape.type === 'rect' || currentShape.type === 'circle') &&
        Math.abs(currentShape.width || 0) > 4 &&
        Math.abs(currentShape.height || 0) > 4
      ) {
        onChange((prev) => [...prev, currentShape]);
      }
    }

    setCurrentShape(null);
  };

  const handleTextUpdate = (id: string, text: string) => {
    onChange((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  const handleUndo = () => {
    onChange((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    onChange([]);
    setEditingTextId(null);
  };

  const renderShape = (item: CanvasAnnotation) => {
    if (item.type === 'path' && item.points && item.points.length > 0) {
      const d = item.points
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');
      return (
        <path
          key={item.id}
          d={d}
          stroke={item.color}
          strokeWidth={item.size}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    }

    if (
      item.type === 'rect' &&
      item.x !== undefined &&
      item.y !== undefined &&
      item.width !== undefined &&
      item.height !== undefined
    ) {
      const rx = item.width < 0 ? item.x + item.width : item.x;
      const ry = item.height < 0 ? item.y + item.height : item.y;
      const rw = Math.abs(item.width);
      const rh = Math.abs(item.height);
      return (
        <rect
          key={item.id}
          x={rx}
          y={ry}
          width={rw}
          height={rh}
          rx={14}
          ry={14}
          stroke={item.color}
          strokeWidth={item.size}
          fill={`${item.color}18`}
        />
      );
    }

    if (
      item.type === 'circle' &&
      item.x !== undefined &&
      item.y !== undefined &&
      item.width !== undefined &&
      item.height !== undefined
    ) {
      const cx = item.x + item.width / 2;
      const cy = item.y + item.height / 2;
      const rx = Math.abs(item.width) / 2;
      const ry = Math.abs(item.height) / 2;
      return (
        <ellipse
          key={item.id}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          stroke={item.color}
          strokeWidth={item.size}
          fill={`${item.color}18`}
        />
      );
    }

    return null;
  };

  return (
    <>
      <svg
        ref={svgRef}
        className={`canvas-drawing-svg ${isInteractive ? 'interactive' : ''} tool-${activeTool}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <g transform={`translate(${vpX}, ${vpY}) scale(${zoom})`}>
          {annotations.map(renderShape)}
          {currentShape && activeTool !== 'eraser' && renderShape(currentShape)}
        </g>
      </svg>

      <div
        className="canvas-text-annotations-layer"
        style={{
          transform: `translate(${vpX}px, ${vpY}px) scale(${zoom})`,
          transformOrigin: '0 0',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        {annotations
          .filter((a) => a.type === 'text' && a.x !== undefined && a.y !== undefined)
          .map((item) => {
            const isEditing = editingTextId === item.id;
            return (
              <div
                key={item.id}
                className={`canvas-text-annotation ${isEditing ? 'editing' : ''}`}
                style={{
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                  color: item.color,
                  fontSize: `${item.size}px`,
                }}
                onClick={(e) => {
                  if (!isOpen) return;
                  e.stopPropagation();
                  if (activeTool === 'eraser') {
                    onChange((prev) => prev.filter((a) => a.id !== item.id));
                  } else {
                    setEditingTextId(item.id);
                  }
                }}
              >
                {isEditing ? (
                  <textarea
                    autoFocus
                    className="canvas-text-input"
                    style={{ color: item.color, fontSize: `${item.size}px` }}
                    value={item.text || ''}
                    onChange={(e) => handleTextUpdate(item.id, e.target.value)}
                    onBlur={() => {
                      if (!item.text?.trim()) {
                        onChange((prev) => prev.filter((a) => a.id !== item.id));
                      }
                      setEditingTextId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
                        e.preventDefault();
                        setEditingTextId(null);
                      }
                    }}
                  />
                ) : (
                  <span className="canvas-text-label">{item.text}</span>
                )}
              </div>
            );
          })}
      </div>

      {isOpen && (
        <div className="paint-toolbar-dock">
          <div className="paint-tools-group">
            <button
              className={`paint-tool-btn ${activeTool === 'select' ? 'active' : ''}`}
              onClick={() => setActiveTool('select')}
              title="Canvas Pan / Select Nodes"
            >
              <MousePointer size={15} />
            </button>
            <button
              className={`paint-tool-btn ${activeTool === 'pen' ? 'active' : ''}`}
              onClick={() => setActiveTool('pen')}
              title="Marker / Freehand Brush"
            >
              <PenTool size={15} />
            </button>
            <button
              className={`paint-tool-btn ${activeTool === 'eraser' ? 'active' : ''}`}
              onClick={() => setActiveTool('eraser')}
              title="Eraser (Click or drag over annotations)"
            >
              <Eraser size={15} />
            </button>
            <button
              className={`paint-tool-btn ${activeTool === 'rect' ? 'active' : ''}`}
              onClick={() => setActiveTool('rect')}
              title="Rounded Rectangle"
            >
              <Square size={15} />
            </button>
            <button
              className={`paint-tool-btn ${activeTool === 'circle' ? 'active' : ''}`}
              onClick={() => setActiveTool('circle')}
              title="Circle / Ellipse"
            >
              <CircleIcon size={15} />
            </button>
            <button
              className={`paint-tool-btn ${activeTool === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTool('text')}
              title="Text Label (Click anywhere on canvas)"
            >
              <Type size={15} />
            </button>
          </div>

          <div className="paint-divider" />

          <div className="paint-size-group" title={`Brush / Stroke Size: ${brushSize}px`}>
            <span className="paint-size-label">{brushSize}px</span>
            <input
              type="range"
              min={2}
              max={20}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="paint-size-slider"
            />
          </div>

          <div className="paint-divider" />

          <div className="paint-colors-group">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                className={`paint-color-swatch ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                title={`Color ${c}`}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="paint-custom-color"
              title="Custom Color"
            />
          </div>

          <div className="paint-divider" />

          <div className="paint-actions-group">
            <button
              className="paint-tool-btn"
              onClick={handleUndo}
              disabled={annotations.length === 0}
              title="Undo Last Annotation"
            >
              <Undo2 size={15} />
            </button>
            <button
              className="paint-tool-btn danger"
              onClick={handleClearAll}
              disabled={annotations.length === 0}
              title="Clear All Annotations"
            >
              <Trash2 size={15} />
            </button>
            <button
              className="paint-tool-btn close"
              onClick={onClose}
              title="Exit Paint Mode"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
