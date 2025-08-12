// Debug utilities for MoveableManager system

declare global {
  interface Window {
    __MOVEABLE_DEBUG__?: boolean;
  }
}

export const enableMoveableDebug = () => {
  if (typeof window !== 'undefined') {
    window.__MOVEABLE_DEBUG__ = true;
    console.log('[Debug] MoveableManager debugging enabled');
  }
};

export const disableMoveableDebug = () => {
  if (typeof window !== 'undefined') {
    window.__MOVEABLE_DEBUG__ = false;
    console.log('[Debug] MoveableManager debugging disabled');
  }
};

export const isMoveableDebugEnabled = () => {
  return typeof window !== 'undefined' && window.__MOVEABLE_DEBUG__ === true;
};

// Debug logging utility
export const debugLog = (source: string, event: string, data: any) => {
  if (isMoveableDebugEnabled()) {
    console.log(`[${source}] ${event}`, { ts: Date.now(), ...data });
  }
};

// Runtime assertion helper
export const debugAssert = (condition: boolean, message: string) => {
  if (isMoveableDebugEnabled()) {
    console.assert(condition, message);
  }
};

// Element inspection helper
export const inspectElement = (elementId: string) => {
  if (typeof window === 'undefined') return null;
  
  const element = document.querySelector(`[data-moveable-element="${elementId}"]`);
  if (!element) {
    console.warn(`[Debug] Element not found: ${elementId}`);
    return null;
  }
  
  const styles = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  
  return {
    element,
    styles: {
      position: styles.position,
      transform: styles.transform,
      width: styles.width,
      height: styles.height,
      pointerEvents: styles.pointerEvents,
      zIndex: styles.zIndex
    },
    rect: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    }
  };
};

// Check for common issues
export const diagnoseMoveableIssues = () => {
  if (typeof window === 'undefined') return;
  
  console.group('[Debug] MoveableManager Diagnosis');
  
  // Check for moveable elements
  const moveableElements = document.querySelectorAll('[data-moveable-element]');
  console.log('Moveable elements found:', moveableElements.length);
  
  moveableElements.forEach((el, index) => {
    const elementId = el.getAttribute('data-moveable-element');
    const styles = window.getComputedStyle(el);
    
    console.log(`Element ${index + 1}:`, {
      id: elementId,
      tagName: el.tagName,
      position: styles.position,
      transform: styles.transform,
      pointerEvents: styles.pointerEvents,
      zIndex: styles.zIndex
    });
  });
  
  // Check for moveable control boxes
  const controlBoxes = document.querySelectorAll('.moveable-control-box');
  console.log('Moveable control boxes found:', controlBoxes.length);
  
  // Check for potential conflicts
  const draggableElements = document.querySelectorAll('[data-draggable="true"]');
  console.log('Draggable elements found:', draggableElements.length);
  
  console.groupEnd();
};
