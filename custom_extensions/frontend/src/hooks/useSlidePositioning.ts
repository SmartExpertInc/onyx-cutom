import { useCallback } from 'react';
import { PrecisionMeasurer, ElementMeasurement } from '../utils/PrecisionMeasurer';

/**
 * Slide positioning data interface
 * Contains complete state of all moveable elements on a slide
 */
export interface SlidePositioningData {
  slideId: string;
  slideDimensions: {
    width: number;              // Always 1174
    height: number;             // Dynamic
    devicePixelRatio: number;   // window.devicePixelRatio
  };
  elements: {
    [elementId: string]: ElementMeasurement;
  };
  captureTimestamp: number;
  captureHash: string;
}

/**
 * Hook for capturing complete slide positioning state
 * 
 * @param slideRef - Reference to the slide container element
 * @returns Object with captureCompleteState function
 */
export function useSlidePositioning(slideRef: React.RefObject<HTMLElement | null>) {
  /**
   * Capture complete state of all moveable elements on the slide
   * 
   * @returns Promise<SlidePositioningData> - Complete positioning data
   */
  const captureCompleteState = useCallback(async (): Promise<SlidePositioningData> => {
    if (!slideRef.current) {
      throw new Error('Slide container ref required');
    }
    
    const slideElement = slideRef.current;
    const slideRect = slideElement.getBoundingClientRect();
    
    // Find all moveable elements
    const moveableElements = slideElement.querySelectorAll('[data-moveable-element]');
    const elements: { [key: string]: ElementMeasurement } = {};
    
    console.log(`🔍 Found ${moveableElements.length} moveable elements to measure`);
    
    // Measure each element precisely
    for (const element of Array.from(moveableElements)) {
      const elementId = element.getAttribute('data-moveable-element');
      if (!elementId) {
        console.warn('Element missing data-moveable-element attribute:', element);
        continue;
      }
      
      try {
        elements[elementId] = await PrecisionMeasurer.measureElement(
          element as HTMLElement,
          slideElement
        );
        
        // Validate measurement
        if (!PrecisionMeasurer.validateMeasurement(elements[elementId])) {
          console.warn(`⚠️ Invalid measurement for ${elementId}:`, elements[elementId]);
        }
        
        console.log(`📏 Measured ${elementId}:`, {
          bounds: elements[elementId].absoluteBounds,
          transform: elements[elementId].transformMatrix.decomposed
        });
      } catch (error) {
        console.error(`❌ Failed to measure ${elementId}:`, error);
        // Continue measuring other elements even if one fails
      }
    }
    
    // Generate hash for change detection
    const captureHash = await PrecisionMeasurer.generateHash(elements);
    
    const captureData: SlidePositioningData = {
      slideId: slideElement.getAttribute('data-slide-id') || 'unknown',
      slideDimensions: {
        width: 1174, // Fixed slide width
        height: Math.round(slideRect.height * 100) / 100,
        devicePixelRatio: window.devicePixelRatio || 1
      },
      elements,
      captureTimestamp: Date.now(),
      captureHash
    };
    
    console.log(`✅ Captured complete state:`, {
      slideId: captureData.slideId,
      elementCount: Object.keys(elements).length,
      slideHeight: captureData.slideDimensions.height,
      captureHash: captureData.captureHash.substring(0, 8) + '...'
    });
    
    return captureData;
  }, [slideRef]);
  
  /**
   * Capture state for a specific element only
   * 
   * @param elementId - ID of the element to measure
   * @returns Promise<ElementMeasurement | null> - Element measurement or null if not found
   */
  const captureElementState = useCallback(async (elementId: string): Promise<ElementMeasurement | null> => {
    if (!slideRef.current) {
      throw new Error('Slide container ref required');
    }
    
    const slideElement = slideRef.current;
    const element = slideElement.querySelector(`[data-moveable-element="${elementId}"]`) as HTMLElement;
    
    if (!element) {
      console.warn(`Element with ID ${elementId} not found`);
      return null;
    }
    
    try {
      const measurement = await PrecisionMeasurer.measureElement(element, slideElement);
      
      if (!PrecisionMeasurer.validateMeasurement(measurement)) {
        console.warn(`⚠️ Invalid measurement for ${elementId}:`, measurement);
      }
      
      console.log(`📏 Measured single element ${elementId}:`, {
        bounds: measurement.absoluteBounds,
        transform: measurement.transformMatrix.decomposed
      });
      
      return measurement;
    } catch (error) {
      console.error(`❌ Failed to measure ${elementId}:`, error);
      return null;
    }
  }, [slideRef]);
  
  /**
   * Check if positioning data has changed
   * 
   * @param previousData - Previous positioning data
   * @param currentData - Current positioning data
   * @returns boolean - True if data has changed
   */
  const hasPositioningChanged = useCallback((
    previousData: SlidePositioningData | null,
    currentData: SlidePositioningData
  ): boolean => {
    if (!previousData) return true;
    
    // Compare hashes for quick change detection
    if (previousData.captureHash !== currentData.captureHash) {
      return true;
    }
    
    // Compare element counts
    const prevElementIds = Object.keys(previousData.elements);
    const currElementIds = Object.keys(currentData.elements);
    
    if (prevElementIds.length !== currElementIds.length) {
      return true;
    }
    
    // Compare individual element measurements
    for (const elementId of currElementIds) {
      const prevElement = previousData.elements[elementId];
      const currElement = currentData.elements[elementId];
      
      if (!prevElement) return true;
      
      // Compare bounds with tolerance
      const boundsChanged = 
        Math.abs(prevElement.absoluteBounds.x - currElement.absoluteBounds.x) > 0.5 ||
        Math.abs(prevElement.absoluteBounds.y - currElement.absoluteBounds.y) > 0.5 ||
        Math.abs(prevElement.absoluteBounds.width - currElement.absoluteBounds.width) > 0.5 ||
        Math.abs(prevElement.absoluteBounds.height - currElement.absoluteBounds.height) > 0.5;
      
      if (boundsChanged) return true;
      
      // Compare transforms with tolerance
      const prevTransform = prevElement.transformMatrix.decomposed;
      const currTransform = currElement.transformMatrix.decomposed;
      
      const transformChanged = 
        Math.abs(prevTransform.translateX - currTransform.translateX) > 0.5 ||
        Math.abs(prevTransform.translateY - currTransform.translateY) > 0.5 ||
        Math.abs(prevTransform.scaleX - currTransform.scaleX) > 0.01 ||
        Math.abs(prevTransform.scaleY - currTransform.scaleY) > 0.01 ||
        Math.abs(prevTransform.rotation - currTransform.rotation) > 0.5;
      
      if (transformChanged) return true;
    }
    
    return false;
  }, []);
  
  return { 
    captureCompleteState, 
    captureElementState, 
    hasPositioningChanged 
  };
}
