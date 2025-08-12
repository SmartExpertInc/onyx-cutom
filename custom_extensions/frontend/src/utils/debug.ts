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

// Test MoveableManager functionality
export const testMoveableManager = () => {
  if (typeof window === 'undefined') return;
  
  console.group('[Debug] MoveableManager Test');
  
  // Enable debug mode
  enableMoveableDebug();
  
  // Check for elements
  const elements = document.querySelectorAll('[data-moveable-element]');
  console.log('Found moveable elements:', elements.length);
  
  if (elements.length > 0) {
    // Try to click the first element
    const firstElement = elements[0] as HTMLElement;
    console.log('Clicking first element:', firstElement.getAttribute('data-moveable-element'));
    
    // Simulate click
    firstElement.click();
    
    // Check for moveable controls after a short delay
    setTimeout(() => {
      const controls = document.querySelectorAll('.moveable-control-box');
      console.log('Moveable controls after click:', controls.length);
      
      if (controls.length === 0) {
        console.warn('No moveable controls found - possible issue with MoveableManager');
      } else {
        console.log('Moveable controls found - system working correctly');
      }
    }, 100);
  } else {
    console.warn('No moveable elements found - check template integration');
  }
  
  console.groupEnd();
};

// Test image upload flow
export const testImageUpload = () => {
  if (typeof window === 'undefined') return;
  
  console.group('[Debug] Image Upload Test');
  
  // Enable debug mode
  enableMoveableDebug();
  
  // Look for image placeholders
  const placeholders = document.querySelectorAll('[data-moveable-element*="-image"]');
  console.log('Image placeholders found:', placeholders.length);
  
  if (placeholders.length > 0) {
    const firstPlaceholder = placeholders[0] as HTMLElement;
    console.log('Clicking first image placeholder:', firstPlaceholder.getAttribute('data-moveable-element'));
    
    // Simulate click
    firstPlaceholder.click();
    
    // Check for upload modal after a short delay
    setTimeout(() => {
      const modals = document.querySelectorAll('[class*="fixed inset-0"]');
      console.log('Upload modals found:', modals.length);
      
      if (modals.length === 0) {
        console.warn('No upload modal found - possible issue with ClickableImagePlaceholder');
      } else {
        console.log('Upload modal found - system working correctly');
      }
    }, 100);
  } else {
    console.warn('No image placeholders found - check template integration');
  }
  
  console.groupEnd();
};

// Comprehensive system test
export const runSystemTest = () => {
  if (typeof window === 'undefined') return;
  
  console.group('[Debug] Comprehensive System Test');
  
  // Enable debug mode
  enableMoveableDebug();
  
  // Run all tests
  diagnoseMoveableIssues();
  testMoveableManager();
  testImageUpload();
  
  console.log('[Debug] System test completed');
  console.groupEnd();
};

// Test BigImageLeftTemplate specifically
export const testBigImageLeftTemplate = () => {
  if (typeof window === 'undefined') return;
  
  console.group('[Debug] BigImageLeftTemplate Test');
  
  // Enable debug mode
  enableMoveableDebug();
  
  // Look for BigImageLeftTemplate elements
  const bigImageLeftElements = document.querySelectorAll('[data-moveable-element*="big-image-left"]');
  console.log('BigImageLeft elements found:', bigImageLeftElements.length);
  
  // Look for image placeholders specifically
  const imagePlaceholders = document.querySelectorAll('[data-moveable-element*="-image"]');
  console.log('Image placeholders found:', imagePlaceholders.length);
  
  imagePlaceholders.forEach((el, index) => {
    const elementId = el.getAttribute('data-moveable-element');
    const styles = window.getComputedStyle(el);
    
    console.log(`Image placeholder ${index + 1}:`, {
      id: elementId,
      tagName: el.tagName,
      position: styles.position,
      transform: styles.transform,
      pointerEvents: styles.pointerEvents,
      zIndex: styles.zIndex,
      width: styles.width,
      height: styles.height
    });
  });
  
  // Test clicking on first image placeholder
  if (imagePlaceholders.length > 0) {
    const firstPlaceholder = imagePlaceholders[0] as HTMLElement;
    console.log('Testing click on first image placeholder:', firstPlaceholder.getAttribute('data-moveable-element'));
    
    // Simulate click
    firstPlaceholder.click();
    
    // Check for moveable controls after a short delay
    setTimeout(() => {
      const controls = document.querySelectorAll('.moveable-control-box');
      console.log('Moveable controls after click:', controls.length);
      
      if (controls.length === 0) {
        console.warn('No moveable controls found - possible issue with MoveableManager');
        
        // Check if element is selected
        const selectedElements = document.querySelectorAll('[data-moveable-element].selected');
        console.log('Selected elements:', selectedElements.length);
      } else {
        console.log('Moveable controls found - system working correctly');
      }
    }, 200);
  }
  
  // Check for any JavaScript errors
  const originalError = console.error;
  console.error = function(...args) {
    console.log('[Error]', ...args);
    originalError.apply(console, args);
  };
  
  console.groupEnd();
};

// Test image upload flow specifically
export const testImageUploadFlow = () => {
  if (typeof window === 'undefined') return;
  
  console.group('[Debug] Image Upload Flow Test');
  
  // Enable debug mode
  enableMoveableDebug();
  
  // Look for image placeholders
  const imagePlaceholders = document.querySelectorAll('[data-moveable-element*="-image"]');
  console.log('Image placeholders found:', imagePlaceholders.length);
  
  if (imagePlaceholders.length > 0) {
    const firstPlaceholder = imagePlaceholders[0] as HTMLElement;
    console.log('Testing image upload on:', firstPlaceholder.getAttribute('data-moveable-element'));
    
    // Check if placeholder has click handler
    const hasClickHandler = firstPlaceholder.onclick !== null;
    console.log('Has click handler:', hasClickHandler);
    
    // Check if placeholder is editable
    const isEditable = firstPlaceholder.closest('[data-moveable-element]')?.getAttribute('data-editable') === 'true';
    console.log('Is editable:', isEditable);
    
    // Simulate click to open upload modal
    firstPlaceholder.click();
    
    // Check for upload modal after a short delay
    setTimeout(() => {
      const modals = document.querySelectorAll('[class*="fixed inset-0"]');
      console.log('Upload modals found:', modals.length);
      
      if (modals.length === 0) {
        console.warn('No upload modal found - possible issue with ClickableImagePlaceholder');
        
        // Check for any clickable elements
        const clickableElements = firstPlaceholder.querySelectorAll('[onclick], [data-clickable]');
        console.log('Clickable elements found:', clickableElements.length);
      } else {
        console.log('Upload modal found - system working correctly');
      }
    }, 200);
  }
  
  console.groupEnd();
};
