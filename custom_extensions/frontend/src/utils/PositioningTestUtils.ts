/**
 * PositioningTestUtils - Test utilities for validating pixel-perfect positioning
 * 
 * Provides utilities to test and validate the positioning data capture system
 * to ensure it works correctly across different scenarios.
 */

import { ElementMeasurement, PrecisionMeasurer } from './PrecisionMeasurer';
import { SlidePositioningData } from '../hooks/useSlidePositioning';

export interface PositioningTestResult {
  testName: string;
  passed: boolean;
  details: {
    expected: any;
    actual: any;
    tolerance: number;
    difference?: number;
    error?: string;
    issues?: string[];
  };
  timestamp: number;
}

export class PositioningTestUtils {
  /**
   * Test measurement accuracy with known values
   * 
   * @param element - Element to test
   * @param slideContainer - Slide container
   * @param expectedBounds - Expected bounds
   * @param tolerance - Tolerance in pixels (default: 0.5)
   * @returns Promise<PositioningTestResult>
   */
  static async testMeasurementAccuracy(
    element: HTMLElement,
    slideContainer: HTMLElement,
    expectedBounds: { x: number; y: number; width: number; height: number },
    tolerance: number = 0.5
  ): Promise<PositioningTestResult> {
    try {
      const measurement = await PrecisionMeasurer.measureElement(element, slideContainer);
      const actualBounds = measurement.absoluteBounds;
      
      const differences = {
        x: Math.abs(actualBounds.x - expectedBounds.x),
        y: Math.abs(actualBounds.y - expectedBounds.y),
        width: Math.abs(actualBounds.width - expectedBounds.width),
        height: Math.abs(actualBounds.height - expectedBounds.height)
      };
      
      const maxDifference = Math.max(differences.x, differences.y, differences.width, differences.height);
      const passed = maxDifference <= tolerance;
      
      return {
        testName: 'Measurement Accuracy Test',
        passed,
        details: {
          expected: expectedBounds,
          actual: actualBounds,
          tolerance,
          difference: maxDifference
        },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        testName: 'Measurement Accuracy Test',
        passed: false,
        details: {
          expected: expectedBounds,
          actual: null,
          tolerance,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Test transform parsing accuracy
   * 
   * @param transformString - CSS transform string to test
   * @param expectedDecomposed - Expected decomposed values
   * @param tolerance - Tolerance for numeric comparisons
   * @returns PositioningTestResult
   */
  static testTransformParsing(
    transformString: string,
    expectedDecomposed: {
      translateX: number;
      translateY: number;
      scaleX: number;
      scaleY: number;
      rotation: number;
    },
    tolerance: number = 0.01
  ): PositioningTestResult {
    try {
      // Use the private parseTransform method through a test interface
      const result = (PrecisionMeasurer as any).parseTransform(transformString);
      const actual = result.decomposed;
      
      const differences = {
        translateX: Math.abs(actual.translateX - expectedDecomposed.translateX),
        translateY: Math.abs(actual.translateY - expectedDecomposed.translateY),
        scaleX: Math.abs(actual.scaleX - expectedDecomposed.scaleX),
        scaleY: Math.abs(actual.scaleY - expectedDecomposed.scaleY),
        rotation: Math.abs(actual.rotation - expectedDecomposed.rotation)
      };
      
      const maxDifference = Math.max(
        differences.translateX,
        differences.translateY,
        differences.scaleX,
        differences.scaleY,
        differences.rotation
      );
      
      const passed = maxDifference <= tolerance;
      
      return {
        testName: 'Transform Parsing Test',
        passed,
        details: {
          expected: expectedDecomposed,
          actual,
          tolerance,
          difference: maxDifference
        },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        testName: 'Transform Parsing Test',
        passed: false,
        details: {
          expected: expectedDecomposed,
          actual: null,
          tolerance,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Test positioning data consistency
   * 
   * @param positioningData - Positioning data to validate
   * @returns PositioningTestResult
   */
  static testPositioningDataConsistency(positioningData: SlidePositioningData): PositioningTestResult {
    try {
      const issues: string[] = [];
      
      // Check slide dimensions
      if (positioningData.slideDimensions.width !== 1174) {
        issues.push(`Invalid slide width: ${positioningData.slideDimensions.width}, expected 1174`);
      }
      
      if (positioningData.slideDimensions.height <= 0) {
        issues.push(`Invalid slide height: ${positioningData.slideDimensions.height}`);
      }
      
      // Check elements
      const elementIds = Object.keys(positioningData.elements);
      if (elementIds.length === 0) {
        issues.push('No elements found in positioning data');
      }
      
      // Validate each element
      for (const elementId of elementIds) {
        const element = positioningData.elements[elementId];
        
        if (!PrecisionMeasurer.validateMeasurement(element)) {
          issues.push(`Invalid measurement for element ${elementId}`);
        }
        
        // Check for reasonable bounds
        if (element.absoluteBounds.x < -1000 || element.absoluteBounds.x > 2000) {
          issues.push(`Unreasonable X position for ${elementId}: ${element.absoluteBounds.x}`);
        }
        
        if (element.absoluteBounds.y < -1000 || element.absoluteBounds.y > 2000) {
          issues.push(`Unreasonable Y position for ${elementId}: ${element.absoluteBounds.y}`);
        }
      }
      
      const passed = issues.length === 0;
      
      return {
        testName: 'Positioning Data Consistency Test',
        passed,
        details: {
          expected: 'Valid positioning data',
          actual: issues.length === 0 ? 'Valid' : issues.join('; '),
          tolerance: 0,
          issues: issues.length > 0 ? issues : undefined
        },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        testName: 'Positioning Data Consistency Test',
        passed: false,
        details: {
          expected: 'Valid positioning data',
          actual: null,
          tolerance: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Run comprehensive positioning tests
   * 
   * @param testElement - Element to test
   * @param slideContainer - Slide container
   * @returns Promise<PositioningTestResult[]>
   */
  static async runComprehensiveTests(
    testElement: HTMLElement,
    slideContainer: HTMLElement
  ): Promise<PositioningTestResult[]> {
    const results: PositioningTestResult[] = [];
    
    // Test 1: Basic measurement accuracy
    const rect = testElement.getBoundingClientRect();
    const slideRect = slideContainer.getBoundingClientRect();
    const expectedBounds = {
      x: rect.left - slideRect.left,
      y: rect.top - slideRect.top,
      width: rect.width,
      height: rect.height
    };
    
    results.push(await this.testMeasurementAccuracy(testElement, slideContainer, expectedBounds));
    
    // Test 2: Transform parsing
    const transformTests = [
      {
        transform: 'translate(10px, 20px)',
        expected: { translateX: 10, translateY: 20, scaleX: 1, scaleY: 1, rotation: 0 }
      },
      {
        transform: 'translate(10px, 20px) scale(1.5)',
        expected: { translateX: 10, translateY: 20, scaleX: 1.5, scaleY: 1.5, rotation: 0 }
      },
      {
        transform: 'matrix(1, 0, 0, 1, 10, 20)',
        expected: { translateX: 10, translateY: 20, scaleX: 1, scaleY: 1, rotation: 0 }
      }
    ];
    
    for (const test of transformTests) {
      results.push(this.testTransformParsing(test.transform, test.expected));
    }
    
         // Test 3: Complete positioning data capture
     try {
       const { useSlidePositioning } = await import('../hooks/useSlidePositioning');
       const slideRef = { current: slideContainer };
       // Create a mock hook call to get the captureCompleteState function
       const mockHook = useSlidePositioning(slideRef);
       const positioningData = await mockHook.captureCompleteState();
       results.push(this.testPositioningDataConsistency(positioningData));
     } catch (error) {
      results.push({
        testName: 'Complete Positioning Data Test',
        passed: false,
        details: {
          expected: 'Valid positioning data',
          actual: null,
          tolerance: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: Date.now()
      });
    }
    
    return results;
  }
  
  /**
   * Generate test report
   * 
   * @param results - Test results
   * @returns string - Formatted test report
   */
  static generateTestReport(results: PositioningTestResult[]): string {
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const successRate = (passed / total) * 100;
    
    let report = `📊 POSITIONING SYSTEM TEST REPORT\n`;
    report += `=====================================\n`;
    report += `Total Tests: ${total}\n`;
    report += `Passed: ${passed}\n`;
    report += `Failed: ${total - passed}\n`;
    report += `Success Rate: ${successRate.toFixed(1)}%\n\n`;
    
    for (const result of results) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      report += `${status} ${result.testName}\n`;
      
      if (!result.passed) {
        report += `   Details: ${JSON.stringify(result.details, null, 2)}\n`;
      }
      
      report += `   Timestamp: ${new Date(result.timestamp).toISOString()}\n\n`;
    }
    
    return report;
  }
}
