/**
 * PrecisionMeasurer - Pixel-perfect element measurement utility
 * 
 * Captures complete element state including absolute positions, transforms,
 * and visual properties for slide-to-PDF positioning parity.
 */

export interface ElementMeasurement {
  // Absolute position relative to slide (not viewport!)
  absoluteBounds: {
    x: number;      // px from slide top-left
    y: number;      // px from slide top-left  
    width: number;  // px
    height: number; // px
  };
  
  // Complete CSS transform decomposition
  transformMatrix: {
    raw: string;                // Original CSS transform
    matrix: number[];           // [a, b, c, d, e, f]
    decomposed: {
      translateX: number;       // px
      translateY: number;       // px
      scaleX: number;          // ratio
      scaleY: number;          // ratio
      rotation: number;        // degrees
    };
  };
  
  // Visual state
  zIndex: number;
  opacity: number;
  visibility: 'visible' | 'hidden';
}

export class PrecisionMeasurer {
  /**
   * Measure an element with pixel-perfect accuracy
   * 
   * @param element - The element to measure
   * @param slideContainer - The slide container for relative positioning
   * @returns Promise<ElementMeasurement> - Complete measurement data
   */
  static async measureElement(
    element: HTMLElement,
    slideContainer: HTMLElement
  ): Promise<ElementMeasurement> {
    // CRITICAL: Force layout completion before measuring
    element.offsetHeight;
    slideContainer.offsetHeight;
    
    // Wait for next frame to ensure CSS transforms applied
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const elementRect = element.getBoundingClientRect();
    const slideRect = slideContainer.getBoundingClientRect();
    
    // Calculate position relative to SLIDE, not viewport
    const absoluteBounds = {
      x: Math.round((elementRect.left - slideRect.left) * 100) / 100,
      y: Math.round((elementRect.top - slideRect.top) * 100) / 100,
      width: Math.round(elementRect.width * 100) / 100,
      height: Math.round(elementRect.height * 100) / 100
    };
    
    // Parse CSS transform
    const computedStyle = window.getComputedStyle(element);
    const transformMatrix = this.parseTransform(computedStyle.transform);
    
    return {
      absoluteBounds,
      transformMatrix,
      zIndex: parseInt(computedStyle.zIndex) || 0,
      opacity: parseFloat(computedStyle.opacity),
      visibility: computedStyle.visibility as 'visible' | 'hidden'
    };
  }
  
  /**
   * Parse CSS transform string into matrix and decomposed components
   * 
   * @param transformString - CSS transform value (e.g., "translate(10px, 5px) scale(1.1)")
   * @returns Transform matrix with raw, matrix array, and decomposed components
   */
  private static parseTransform(transformString: string): {
    raw: string;
    matrix: number[];
    decomposed: {
      translateX: number;
      translateY: number;
      scaleX: number;
      scaleY: number;
      rotation: number;
    };
  } {
    if (transformString === 'none') {
      return {
        raw: 'none',
        matrix: [1, 0, 0, 1, 0, 0],
        decomposed: {
          translateX: 0, 
          translateY: 0, 
          scaleX: 1, 
          scaleY: 1, 
          rotation: 0
        }
      };
    }
    
    // Parse matrix() or matrix3d()
    const matrixMatch = transformString.match(/matrix(?:3d)?\(([^)]+)\)/);
    if (!matrixMatch) return this.parseTransform('none');
    
    const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
    const matrix = values.length === 6 ? values : [values[0], values[1], values[4], values[5], values[12], values[13]];
    
    // Decompose matrix into components
    const [a, b, c, d, e, f] = matrix;
    const translateX = Math.round(e * 100) / 100;
    const translateY = Math.round(f * 100) / 100;
    const scaleX = Math.round(Math.sqrt(a * a + b * b) * 10000) / 10000;
    const scaleY = Math.round(Math.sqrt(c * c + d * d) * 10000) / 10000;
    const rotation = Math.round(Math.atan2(b, a) * (180 / Math.PI) * 100) / 100;
    
    return {
      raw: transformString,
      matrix,
      decomposed: { translateX, translateY, scaleX, scaleY, rotation }
    };
  }
  
  /**
   * Generate a hash for the measurement data to detect changes
   * 
   * @param elements - Object containing element measurements
   * @returns Promise<string> - Hash string
   */
  static async generateHash(elements: { [key: string]: ElementMeasurement }): Promise<string> {
    const data = JSON.stringify(elements, (key, value) => {
      // Round numbers to 2 decimal places for consistent hashing
      if (typeof value === 'number') {
        return Math.round(value * 100) / 100;
      }
      return value;
    });
    
    // Simple hash function for change detection
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }
  
  /**
   * Validate measurement accuracy
   * 
   * @param measurement - Element measurement to validate
   * @returns boolean - True if measurement is valid
   */
  static validateMeasurement(measurement: ElementMeasurement): boolean {
    const { absoluteBounds, transformMatrix } = measurement;
    
    // Check bounds are reasonable
    if (absoluteBounds.x < -1000 || absoluteBounds.x > 2000) return false;
    if (absoluteBounds.y < -1000 || absoluteBounds.y > 2000) return false;
    if (absoluteBounds.width <= 0 || absoluteBounds.width > 2000) return false;
    if (absoluteBounds.height <= 0 || absoluteBounds.height > 2000) return false;
    
    // Check transform matrix is valid
    if (!Array.isArray(transformMatrix.matrix) || transformMatrix.matrix.length !== 6) return false;
    if (transformMatrix.matrix.some(isNaN)) return false;
    
    // Check decomposed values are reasonable
    const { decomposed } = transformMatrix;
    if (Math.abs(decomposed.scaleX) > 10 || Math.abs(decomposed.scaleY) > 10) return false;
    if (Math.abs(decomposed.rotation) > 360) return false;
    
    return true;
  }
}
