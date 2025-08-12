'use client';

import * as React from "react";
import Moveable from "react-moveable";

interface SimplePlaceholderProps {
  elementId: string;
  isEditable?: boolean;
  children: React.ReactNode;
  onPositionChange?: (elementId: string, position: { x: number; y: number }) => void;
  onSizeChange?: (elementId: string, size: { width: number; height: number }) => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  keepRatio?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Simple placeholder component using react-moveable following official examples exactly.
 * Replaces complex custom drag/resize logic with clean react-moveable implementation.
 */
export const SimplePlaceholder: React.FC<SimplePlaceholderProps> = ({
  elementId,
  isEditable = false,
  children,
  onPositionChange,
  onSizeChange,
  initialPosition = { x: 0, y: 0 },
  initialSize = { width: 200, height: 150 },
  minWidth = 50,
  minHeight = 50,
  keepRatio = false,
  style = {},
  className = ""
}) => {
  const targetRef = React.useRef<HTMLDivElement>(null);
  const [isShiftPressed, setIsShiftPressed] = React.useState(false);

  // Track shift key for aspect ratio locking
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize position and size
  React.useEffect(() => {
    if (targetRef.current) {
      const element = targetRef.current;
      element.style.position = 'absolute';
      element.style.left = `${initialPosition.x}px`;
      element.style.top = `${initialPosition.y}px`;
      element.style.width = `${initialSize.width}px`;
      element.style.height = `${initialSize.height}px`;
    }
  }, [initialPosition.x, initialPosition.y, initialSize.width, initialSize.height]);

  return (
    <div className="simple-placeholder-container" style={{ position: 'relative' }}>
      <div 
        ref={targetRef}
        className={`simple-placeholder-target ${className}`}
        style={{
          position: 'absolute',
          left: `${initialPosition.x}px`,
          top: `${initialPosition.y}px`,
          width: `${initialSize.width}px`,
          height: `${initialSize.height}px`,
          minWidth: `${minWidth}px`,
          minHeight: `${minHeight}px`,
          ...style
        }}
      >
        {children}
      </div>
      
      {isEditable && (
        <>
          {/* Dragging Moveable - following official example exactly */}
          <Moveable
            target={targetRef}
            draggable={true}
            throttleDrag={1}
            edgeDraggable={false}
            startDragRotate={0}
            throttleDragRotate={0}
            onDrag={e => {
              e.target.style.transform = e.transform;
            }}
            onDragEnd={e => {
              // Extract position from transform
              const transform = e.target.style.transform;
              const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
              if (match && onPositionChange) {
                const x = parseFloat(match[1]);
                const y = parseFloat(match[2]);
                onPositionChange(elementId, { x: x + initialPosition.x, y: y + initialPosition.y });
              }
            }}
          />
          
          {/* Resizing Moveable - following official example exactly */}
          <Moveable
            target={targetRef}
            resizable={true}
            keepRatio={keepRatio || isShiftPressed}
            throttleResize={1}
            renderDirections={["nw","n","ne","w","e","sw","s","se"]}
            onResize={e => {
              e.target.style.width = `${Math.max(minWidth, e.width)}px`;
              e.target.style.height = `${Math.max(minHeight, e.height)}px`;
              e.target.style.transform = e.drag.transform;
            }}
            onResizeEnd={e => {
              if (onSizeChange) {
                const width = Math.max(minWidth, e.width);
                const height = Math.max(minHeight, e.height);
                onSizeChange(elementId, { width, height });
              }
              
              // Update position if drag occurred during resize
              if (e.drag && onPositionChange) {
                const transform = e.target.style.transform;
                const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                if (match) {
                  const x = parseFloat(match[1]);
                  const y = parseFloat(match[2]);
                  onPositionChange(elementId, { x: x + initialPosition.x, y: y + initialPosition.y });
                }
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default SimplePlaceholder;
