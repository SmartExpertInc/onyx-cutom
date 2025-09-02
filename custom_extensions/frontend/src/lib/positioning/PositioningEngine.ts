// lib/positioning/PositioningEngine.ts
// Core positioning engine for dynamic slide item management

import {
  Position,
  PositionableItem,
  Point,
  Rectangle,
  DragState,
  ResizeState,
  RotationState,
  InteractionState,
  PositioningConstraints,
  PositioningAction,
  PositioningHistory,
  PositioningMode,
  ResizeHandle
} from '@/types/positioning';

export class PositioningEngine {
  private items: Map<string, PositionableItem> = new Map();
  private interactionState: InteractionState;
  private constraints: PositioningConstraints;
  private history: PositioningHistory;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(
    initialItems: PositionableItem[] = [],
    constraints: PositioningConstraints
  ) {
    this.constraints = constraints;
    this.interactionState = {
      selectedItemIds: [],
      hoveredItemId: null,
      dragState: null,
      resizeState: null,
      rotationState: null,
      mode: 'template'
    };
    this.history = {
      actions: [],
      currentIndex: -1,
      maxSize: 50
    };

    // Initialize items
    initialItems.forEach(item => this.items.set(item.id, item));
  }

  // === CORE POSITIONING METHODS ===

  /**
   * Update item position with constraints and validation
   */
  updateItemPosition(itemId: string, newPosition: Position): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    const previousPosition = { ...item.position };
    const constrainedPosition = this.applyConstraints(newPosition);
    
    // Update item
    const updatedItem = {
      ...item,
      position: constrainedPosition
    };
    
    this.items.set(itemId, updatedItem);
    
    // Record action for undo/redo
    this.recordAction({
      type: 'move',
      itemId,
      previousState: { position: previousPosition },
      newState: { position: constrainedPosition },
      timestamp: Date.now()
    });

    this.emit('itemPositionChanged', { itemId, position: constrainedPosition });
    return true;
  }

  /**
   * Reset items to their default positions
   */
  resetToDefaults(itemId?: string): void {
    if (itemId) {
      const item = this.items.get(itemId);
      if (item) {
        this.updateItemPosition(itemId, item.defaultPosition);
      }
    } else {
      // Reset all items
      this.items.forEach((item, id) => {
        this.updateItemPosition(id, item.defaultPosition);
      });
    }
  }

  // === DRAG AND DROP ===

  /**
   * Start dragging operation
   */
  startDrag(itemId: string, startPos: Point): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    this.interactionState.dragState = {
      isDragging: true,
      draggedItemId: itemId,
      startPosition: startPos,
      currentPosition: startPos,
      offset: {
        x: startPos.x - item.position.x,
        y: startPos.y - item.position.y
      }
    };

    this.selectItem(itemId);
    this.emit('dragStart', { itemId, startPos });
    return true;
  }

  /**
   * Update drag position
   */
  updateDrag(currentPos: Point): boolean {
    const dragState = this.interactionState.dragState;
    if (!dragState || !dragState.isDragging) return false;

    dragState.currentPosition = currentPos;

    const newPosition = {
      ...this.items.get(dragState.draggedItemId!)!.position,
      x: currentPos.x - dragState.offset.x,
      y: currentPos.y - dragState.offset.y
    };

    this.updateItemPosition(dragState.draggedItemId!, newPosition);
    return true;
  }

  /**
   * End dragging operation
   */
  endDrag(): void {
    const dragState = this.interactionState.dragState;
    if (!dragState || !dragState.isDragging) return;

    this.emit('dragEnd', { 
      itemId: dragState.draggedItemId, 
      finalPosition: dragState.currentPosition 
    });

    this.interactionState.dragState = null;
  }

  // === RESIZE OPERATIONS ===

  /**
   * Start resize operation
   */
  startResize(itemId: string, handle: ResizeHandle, startPos: Point): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    this.interactionState.resizeState = {
      isResizing: true,
      resizedItemId: itemId,
      handle,
      startBounds: { ...item.position },
      currentBounds: { ...item.position }
    };

    this.emit('resizeStart', { itemId, handle, startPos });
    return true;
  }

  /**
   * Update resize operation
   */
  updateResize(currentPos: Point): boolean {
    const resizeState = this.interactionState.resizeState;
    if (!resizeState || !resizeState.isResizing) return false;

    const item = this.items.get(resizeState.resizedItemId!)!;
    const newBounds = this.calculateResizeBounds(
      resizeState.startBounds,
      resizeState.handle,
      currentPos,
      item.constraints
    );

    resizeState.currentBounds = newBounds;
    this.updateItemPosition(resizeState.resizedItemId!, newBounds);
    return true;
  }

  /**
   * End resize operation
   */
  endResize(): void {
    const resizeState = this.interactionState.resizeState;
    if (!resizeState || !resizeState.isResizing) return;

    this.emit('resizeEnd', { 
      itemId: resizeState.resizedItemId, 
      finalBounds: resizeState.currentBounds 
    });

    this.interactionState.resizeState = null;
  }

  // === ROTATION ===

  /**
   * Start rotation operation
   */
  startRotation(itemId: string, centerPoint: Point): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    this.interactionState.rotationState = {
      isRotating: true,
      rotatedItemId: itemId,
      startAngle: item.position.rotation || 0,
      currentAngle: item.position.rotation || 0,
      centerPoint
    };

    this.emit('rotationStart', { itemId, centerPoint });
    return true;
  }

  /**
   * Update rotation
   */
  updateRotation(currentPos: Point): boolean {
    const rotationState = this.interactionState.rotationState;
    if (!rotationState || !rotationState.isRotating) return false;

    const angle = this.calculateRotationAngle(
      rotationState.centerPoint,
      currentPos
    );

    const newPosition = {
      ...this.items.get(rotationState.rotatedItemId!)!.position,
      rotation: angle
    };

    rotationState.currentAngle = angle;
    this.updateItemPosition(rotationState.rotatedItemId!, newPosition);
    return true;
  }

  /**
   * End rotation operation
   */
  endRotation(): void {
    const rotationState = this.interactionState.rotationState;
    if (!rotationState || !rotationState.isRotating) return;

    this.emit('rotationEnd', { 
      itemId: rotationState.rotatedItemId, 
      finalAngle: rotationState.currentAngle 
    });

    this.interactionState.rotationState = null;
  }

  // === SELECTION MANAGEMENT ===

  /**
   * Select an item
   */
  selectItem(itemId: string, multiSelect: boolean = false): void {
    if (!multiSelect) {
      this.interactionState.selectedItemIds = [itemId];
    } else {
      if (!this.interactionState.selectedItemIds.includes(itemId)) {
        this.interactionState.selectedItemIds.push(itemId);
      }
    }
    this.emit('selectionChanged', { selectedIds: this.interactionState.selectedItemIds });
  }

  /**
   * Deselect items
   */
  deselectItem(itemId?: string): void {
    if (itemId) {
      this.interactionState.selectedItemIds = this.interactionState.selectedItemIds
        .filter(id => id !== itemId);
    } else {
      this.interactionState.selectedItemIds = [];
    }
    this.emit('selectionChanged', { selectedIds: this.interactionState.selectedItemIds });
  }

  // === CONSTRAINT APPLICATION ===

  /**
   * Apply positioning constraints to a position
   */
  private applyConstraints(position: Position): Position {
    const { canvas, gridSize, snapToGrid, minItemSize, maxItemSize } = this.constraints;

    let constrainedPosition = { ...position };

    // Apply size constraints
    constrainedPosition.width = Math.max(minItemSize.width, constrainedPosition.width);
    constrainedPosition.height = Math.max(minItemSize.height, constrainedPosition.height);

    if (maxItemSize) {
      constrainedPosition.width = Math.min(maxItemSize.width, constrainedPosition.width);
      constrainedPosition.height = Math.min(maxItemSize.height, constrainedPosition.height);
    }

    // Apply canvas boundaries
    constrainedPosition.x = Math.max(0, Math.min(
      canvas.width - constrainedPosition.width,
      constrainedPosition.x
    ));
    constrainedPosition.y = Math.max(0, Math.min(
      canvas.height - constrainedPosition.height,
      constrainedPosition.y
    ));

    // Apply grid snapping
    if (snapToGrid && gridSize > 0) {
      constrainedPosition.x = Math.round(constrainedPosition.x / gridSize) * gridSize;
      constrainedPosition.y = Math.round(constrainedPosition.y / gridSize) * gridSize;
    }

    return constrainedPosition;
  }

  // === UTILITY METHODS ===

  /**
   * Calculate new bounds during resize
   */
  private calculateResizeBounds(
    startBounds: Rectangle,
    handle: ResizeHandle,
    currentPos: Point,
    constraints?: PositionableItem['constraints']
  ): Position {
    let newBounds = { ...startBounds };

    switch (handle) {
      case 'se': // bottom-right
        newBounds.width = Math.max(constraints?.minWidth || 50, currentPos.x - startBounds.x);
        newBounds.height = Math.max(constraints?.minHeight || 50, currentPos.y - startBounds.y);
        break;
      case 'sw': // bottom-left
        newBounds.width = Math.max(constraints?.minWidth || 50, startBounds.x + startBounds.width - currentPos.x);
        newBounds.height = Math.max(constraints?.minHeight || 50, currentPos.y - startBounds.y);
        newBounds.x = startBounds.x + startBounds.width - newBounds.width;
        break;
      case 'ne': // top-right
        newBounds.width = Math.max(constraints?.minWidth || 50, currentPos.x - startBounds.x);
        newBounds.height = Math.max(constraints?.minHeight || 50, startBounds.y + startBounds.height - currentPos.y);
        newBounds.y = startBounds.y + startBounds.height - newBounds.height;
        break;
      case 'nw': // top-left
        newBounds.width = Math.max(constraints?.minWidth || 50, startBounds.x + startBounds.width - currentPos.x);
        newBounds.height = Math.max(constraints?.minHeight || 50, startBounds.y + startBounds.height - currentPos.y);
        newBounds.x = startBounds.x + startBounds.width - newBounds.width;
        newBounds.y = startBounds.y + startBounds.height - newBounds.height;
        break;
      // Edge handles
      case 'n':
        newBounds.height = Math.max(constraints?.minHeight || 50, startBounds.y + startBounds.height - currentPos.y);
        newBounds.y = startBounds.y + startBounds.height - newBounds.height;
        break;
      case 's':
        newBounds.height = Math.max(constraints?.minHeight || 50, currentPos.y - startBounds.y);
        break;
      case 'e':
        newBounds.width = Math.max(constraints?.minWidth || 50, currentPos.x - startBounds.x);
        break;
      case 'w':
        newBounds.width = Math.max(constraints?.minWidth || 50, startBounds.x + startBounds.width - currentPos.x);
        newBounds.x = startBounds.x + startBounds.width - newBounds.width;
        break;
    }

    // Apply aspect ratio constraint if needed
    if (constraints?.maintainAspectRatio) {
      const aspectRatio = startBounds.width / startBounds.height;
      newBounds.height = newBounds.width / aspectRatio;
    }

    return newBounds;
  }

  /**
   * Calculate rotation angle from center point
   */
  private calculateRotationAngle(center: Point, currentPos: Point): number {
    const deltaX = currentPos.x - center.x;
    const deltaY = currentPos.y - center.y;
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  }

  // === TRANSFORM UTILITIES ===

  /**
   * Convert position to CSS transform string
   */
  positionToTransform(position: Position): string {
    const { x, y, rotation = 0 } = position;
    return `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
  }

  /**
   * Get transform origin for rotation
   */
  getTransformOrigin(position: Position): string {
    return `${position.width / 2}px ${position.height / 2}px`;
  }

  // === HISTORY AND UNDO/REDO ===

  /**
   * Record action for undo/redo
   */
  private recordAction(action: PositioningAction): void {
    // Remove any actions after current index (when undoing then making new changes)
    this.history.actions = this.history.actions.slice(0, this.history.currentIndex + 1);
    
    // Add new action
    this.history.actions.push(action);
    this.history.currentIndex++;

    // Limit history size
    if (this.history.actions.length > this.history.maxSize) {
      this.history.actions.shift();
      this.history.currentIndex--;
    }
  }

  /**
   * Undo last action
   */
  undo(): boolean {
    if (this.history.currentIndex < 0) return false;

    const action = this.history.actions[this.history.currentIndex];
    const item = this.items.get(action.itemId);
    
    if (item && action.previousState) {
      // Apply previous state
      const restoredItem = { ...item, ...action.previousState };
      this.items.set(action.itemId, restoredItem);
      this.emit('itemRestored', { itemId: action.itemId, item: restoredItem });
    }

    this.history.currentIndex--;
    return true;
  }

  /**
   * Redo next action
   */
  redo(): boolean {
    if (this.history.currentIndex >= this.history.actions.length - 1) return false;

    this.history.currentIndex++;
    const action = this.history.actions[this.history.currentIndex];
    const item = this.items.get(action.itemId);
    
    if (item && action.newState) {
      // Apply new state
      const updatedItem = { ...item, ...action.newState };
      this.items.set(action.itemId, updatedItem);
      this.emit('itemRestored', { itemId: action.itemId, item: updatedItem });
    }

    return true;
  }

  // === EVENT SYSTEM ===

  /**
   * Add event listener
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  // === GETTERS ===

  getItems(): PositionableItem[] {
    return Array.from(this.items.values());
  }

  getItem(itemId: string): PositionableItem | undefined {
    return this.items.get(itemId);
  }

  getSelectedItems(): PositionableItem[] {
    return this.interactionState.selectedItemIds
      .map(id => this.items.get(id))
      .filter(item => item !== undefined) as PositionableItem[];
  }

  getInteractionState(): InteractionState {
    return { ...this.interactionState };
  }

  canUndo(): boolean {
    return this.history.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.history.currentIndex < this.history.actions.length - 1;
  }
}
