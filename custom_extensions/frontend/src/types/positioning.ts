// types/positioning.ts
// Core positioning types for dynamic slide item management

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
}

export interface PositionableItem {
  id: string;
  type: 'text' | 'image' | 'shape' | 'container' | 'bullet-list' | 'heading';
  content: any;
  position: Position;
  defaultPosition: Position;
  constraints?: {
    minWidth: number;
    minHeight: number;
    maxWidth?: number;
    maxHeight?: number;
    maintainAspectRatio?: boolean;
    lockAspectRatio?: boolean;
    snapToGrid?: boolean;
  };
  metadata?: {
    templateOrigin?: string; // Which template this item came from
    isUserCreated?: boolean; // Was this item added by user vs extracted from template
    lastModified?: string;
  };
}

export interface DragState {
  isDragging: boolean;
  draggedItemId: string | null;
  startPosition: Point;
  currentPosition: Point;
  offset: Point;
}

export interface ResizeState {
  isResizing: boolean;
  resizedItemId: string | null;
  handle: ResizeHandle;
  startBounds: Rectangle;
  currentBounds: Rectangle;
}

export interface RotationState {
  isRotating: boolean;
  rotatedItemId: string | null;
  startAngle: number;
  currentAngle: number;
  centerPoint: Point;
}

export type ResizeHandle = 
  | 'nw' | 'ne' | 'sw' | 'se'  // corners
  | 'n' | 's' | 'e' | 'w'      // edges
  | 'rotate';                   // rotation handle

export interface InteractionState {
  selectedItemIds: string[];
  hoveredItemId: string | null;
  dragState: DragState | null;
  resizeState: ResizeState | null;
  rotationState: RotationState | null;
  mode: PositioningMode;
}

export type PositioningMode = 'template' | 'free' | 'hybrid';

export interface CanvasConfig {
  width: number;
  height: number;
  gridSize?: number;
  snapToGrid?: boolean;
  showGrid?: boolean;
  backgroundColor?: string;
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface PositioningConstraints {
  canvas: Rectangle;
  gridSize: number;
  snapToGrid: boolean;
  snapToGuides: boolean;
  minItemSize: { width: number; height: number };
  maxItemSize?: { width: number; height: number };
}

// Event handlers for positioning operations
export interface PositioningEventHandlers {
  onItemSelect: (itemId: string, multiSelect?: boolean) => void;
  onItemDeselect: (itemId?: string) => void;
  onItemMove: (itemId: string, newPosition: Position) => void;
  onItemResize: (itemId: string, newPosition: Position) => void;
  onItemRotate: (itemId: string, newRotation: number) => void;
  onItemDelete: (itemId: string) => void;
  onItemDuplicate: (itemId: string) => void;
  onModeChange: (newMode: PositioningMode) => void;
  onCanvasChange: (newConfig: CanvasConfig) => void;
}

// Transform utilities interface
export interface TransformUtils {
  positionToTransform: (position: Position) => string;
  transformToPosition: (transform: string) => Position;
  applyConstraints: (position: Position, constraints: PositioningConstraints) => Position;
  snapToGrid: (position: Position, gridSize: number) => Position;
  calculateBounds: (items: PositionableItem[]) => Rectangle;
  isPointInBounds: (point: Point, bounds: Rectangle) => boolean;
}

// Undo/Redo support
export interface PositioningAction {
  type: 'move' | 'resize' | 'rotate' | 'create' | 'delete' | 'duplicate';
  itemId: string;
  previousState: Partial<PositionableItem>;
  newState: Partial<PositionableItem>;
  timestamp: number;
}

export interface PositioningHistory {
  actions: PositioningAction[];
  currentIndex: number;
  maxSize: number;
}

// Template extraction utilities
export interface TemplateItemExtractor {
  extractItemsFromTemplate: (templateId: string, props: any) => PositionableItem[];
  convertTemplateToPositioning: (templateId: string, props: any) => {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  };
}
