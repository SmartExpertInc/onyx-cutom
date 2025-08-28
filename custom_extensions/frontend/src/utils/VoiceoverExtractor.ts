// custom_extensions/frontend/src/utils/VoiceoverExtractor.ts

import { SlideDataForVideo } from '@/types/elaiTypes';

export class VoiceoverExtractor {
  /**
   * Extract voiceover text from all slides on the current page
   */
  static extractVoiceoverFromSlides(): SlideDataForVideo[] {
    const slides: SlideDataForVideo[] = [];
    
    try {
      // Find all slide elements on the page
      let slideElements = document.querySelectorAll('[data-slide-index], .slide-container, .slide-deck-slide');
      
      if (slideElements.length === 0) {
        // Try alternative selectors for different slide layouts
        const alternativeSelectors = [
          '.slide',
          '[class*="slide"]',
          '.presentation-slide',
          '.deck-slide'
        ];
        
        for (const selector of alternativeSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            slideElements = elements;
            break;
          }
        }
      }
      
      slideElements.forEach((slideElement, index) => {
        const slideData = this.extractSlideData(slideElement, index);
        if (slideData) {
          slides.push(slideData);
        }
      });
      
      // If no slides found with standard selectors, try to find any content that might be slides
      if (slides.length === 0) {
        const contentElements = document.querySelectorAll('.content, .lesson-content, .presentation-content');
        contentElements.forEach((element, index) => {
          const slideData = this.extractSlideData(element, index);
          if (slideData) {
            slides.push(slideData);
          }
        });
      }
      
    } catch (error) {
      console.error('Error extracting voiceover from slides:', error);
    }
    
    return slides;
  }
  
  /**
   * Extract data from a single slide element
   */
  private static extractSlideData(slideElement: Element, index: number): SlideDataForVideo | null {
    try {
      // Extract slide image URL
      const imageElement = slideElement.querySelector('img');
      const imageUrl = imageElement?.src || imageElement?.getAttribute('data-src') || '';
      
      // Extract voiceover text
      const voiceoverText = this.getVoiceoverText(slideElement);
      
      // If no voiceover text found, try to extract from slide content
      if (!voiceoverText) {
        const contentText = this.extractContentText(slideElement);
        if (contentText) {
          return {
            id: index + 1,
            imageUrl: imageUrl,
            voiceoverText: contentText,
            slideIndex: index
          };
        }
      } else {
        return {
          id: index + 1,
          imageUrl: imageUrl,
          voiceoverText: voiceoverText,
          slideIndex: index
        };
      }
      
    } catch (error) {
      console.error(`Error extracting data from slide ${index}:`, error);
    }
    
    return null;
  }
  
  /**
   * Get voiceover text from slide element
   */
  private static getVoiceoverText(slideElement: Element): string {
    try {
      // Look for voiceover trigger elements
      const voiceoverTriggers = [
        '[data-voiceover-trigger]',
        '.voiceover-trigger',
        '.voiceover-icon',
        '[class*="voiceover"]',
        '.speech-icon',
        '.audio-icon'
      ];
      
      for (const selector of voiceoverTriggers) {
        const trigger = slideElement.querySelector(selector);
        if (trigger) {
          // Try to get voiceover text from data attributes
          const voiceoverText = trigger.getAttribute('data-voiceover-text') || 
                               trigger.getAttribute('data-speech-text') ||
                               trigger.getAttribute('title');
          
          if (voiceoverText) {
            return voiceoverText.trim();
          }
          
          // Try clicking the trigger to reveal voiceover content
          const text = this.clickAndExtractVoiceover(trigger);
          if (text) {
            return text;
          }
        }
      }
      
      // Look for voiceover content containers
      const voiceoverContainers = [
        '[data-voiceover-content]',
        '.voiceover-content',
        '.speech-content',
        '.audio-content'
      ];
      
      for (const selector of voiceoverContainers) {
        const container = slideElement.querySelector(selector);
        if (container) {
          const text = container.textContent?.trim();
          if (text) {
            return text;
          }
        }
      }
      
    } catch (error) {
      console.error('Error getting voiceover text:', error);
    }
    
    return '';
  }
  
  /**
   * Click voiceover trigger and extract text from revealed content
   */
  private static clickAndExtractVoiceover(trigger: Element): string {
    try {
      // Store original display state
      const originalDisplay = (trigger as HTMLElement).style.display;
      
      // Click the trigger
      (trigger as HTMLElement).click();
      
      // Wait a bit for content to appear
      setTimeout(() => {
        // Look for revealed voiceover content
        const voiceoverContent = document.querySelector('[data-voiceover-content], .voiceover-content, .speech-content');
        if (voiceoverContent) {
          const text = voiceoverContent.textContent?.trim();
          if (text) {
            return text;
          }
        }
        
        // Restore original display state
        (trigger as HTMLElement).style.display = originalDisplay;
      }, 100);
      
    } catch (error) {
      console.error('Error clicking voiceover trigger:', error);
    }
    
    return '';
  }
  
  /**
   * Extract content text from slide element as fallback
   */
  private static extractContentText(slideElement: Element): string {
    try {
      // Look for text content in various containers
      const textSelectors = [
        '.slide-content',
        '.content',
        '.text-content',
        '.slide-text',
        'p',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        '.title',
        '.subtitle'
      ];
      
      const textParts: string[] = [];
      
      textSelectors.forEach(selector => {
        const elements = slideElement.querySelectorAll(selector);
        elements.forEach(element => {
          const text = element.textContent?.trim();
          if (text && text.length > 0) {
            textParts.push(text);
          }
        });
      });
      
      if (textParts.length > 0) {
        // Combine text parts and limit to reasonable length for voiceover
        const combinedText = textParts.join('. ');
        return combinedText.length > 500 ? combinedText.substring(0, 500) + '...' : combinedText;
      }
      
    } catch (error) {
      console.error('Error extracting content text:', error);
    }
    
    return '';
  }
  
  /**
   * Validate extracted slide data
   */
  static validateSlideData(slides: SlideDataForVideo[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (slides.length === 0) {
      errors.push('No slides found on the page');
      return { valid: false, errors };
    }
    
    slides.forEach((slide, index) => {
      if (!slide.voiceoverText || slide.voiceoverText.trim().length === 0) {
        errors.push(`Slide ${index + 1} has no voiceover text`);
      }
      
      if (slide.voiceoverText && slide.voiceoverText.length > 1000) {
        errors.push(`Slide ${index + 1} voiceover text is too long (${slide.voiceoverText.length} characters)`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Get slide count from the page
   */
  static getSlideCount(): number {
    const slideElements = document.querySelectorAll('[data-slide-index], .slide-container, .slide-deck-slide, .slide');
    return slideElements.length;
  }
  
  /**
   * Check if the current page has slides with voiceover content
   */
  static hasVoiceoverContent(): boolean {
    const slides = this.extractVoiceoverFromSlides();
    return slides.some(slide => slide.voiceoverText && slide.voiceoverText.trim().length > 0);
  }
}
