'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { generateAIImage, AIImageGenerationRequest } from '../lib/designTemplateApi';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && (window as any).__MOVEABLE_DEBUG__;
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[${source}] ${event}`, { ts: Date.now(), ...data });
  }
};

export interface ImagePlaceholder {
  elementId: string;
  slideId: string;
  templateId: string;
  imagePrompt?: string;
  imagePath?: string;
  placeholderDimensions: { width: number; height: number };
  isGenerating?: boolean;
  error?: string;
}

export interface AutomaticImageGenerationManagerProps {
  /** The slide deck data */
  deck: any;
  /** Whether automatic generation is enabled */
  enabled?: boolean;
  /** Callback when generation starts for a specific placeholder */
  onGenerationStarted?: (elementId: string) => void;
  /** Callback when generation completes for a specific placeholder */
  onGenerationCompleted?: (elementId: string, imagePath: string) => void;
  /** Callback when generation fails for a specific placeholder */
  onGenerationFailed?: (elementId: string, error: string) => void;
  /** Callback when all generations are complete */
  onAllGenerationsComplete?: (results: { elementId: string; success: boolean; imagePath?: string; error?: string }[]) => void;
  /** Current theme for color palette integration */
  currentTheme?: {
    colors?: {
      backgroundColor?: string;
      titleColor?: string;
      subtitleColor?: string;
      contentColor?: string;
      accentColor?: string;
    };
  };
}

export const AutomaticImageGenerationManager: React.FC<AutomaticImageGenerationManagerProps> = ({
  deck,
  enabled = true,
  onGenerationStarted,
  onGenerationCompleted,
  onGenerationFailed,
  onAllGenerationsComplete,
  currentTheme
}) => {
  const [placeholders, setPlaceholders] = useState<ImagePlaceholder[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generationResults, setGenerationResults] = useState<{ elementId: string; success: boolean; imagePath?: string; error?: string }[]>([]);

  // Helper function to enhance prompt with theme colors
  const enhancePromptWithTheme = useCallback((basePrompt: string): string => {
    if (!currentTheme?.colors) return basePrompt;
    
    const colors = currentTheme.colors;
    
    // Extract theme colors for placeholder replacement
    const primaryColor = colors.accentColor || '#3b82f6';
    const secondaryColor = colors.titleColor || '#1a1a1a';
    const tertiaryColor = colors.subtitleColor || '#6b7280';
    const backgroundColor = colors.backgroundColor || '#ffffff';
    
    // Replace color placeholders in the prompt
    let enhancedPrompt = basePrompt
      .replace(/\[COLOR1\]/g, primaryColor)
      .replace(/\[COLOR2\]/g, secondaryColor)
      .replace(/\[COLOR3\]/g, tertiaryColor)
      .replace(/\[BACKGROUND\]/g, backgroundColor)
      .replace(/\[PRIMARY\]/g, primaryColor)
      .replace(/\[SECONDARY\]/g, secondaryColor)
      .replace(/\[ACCENT\]/g, primaryColor);
    
    return enhancedPrompt;
  }, [currentTheme]);

  // Extract image placeholders from the deck
  const extractImagePlaceholders = useCallback((deckData: any): ImagePlaceholder[] => {
    if (!deckData?.slides || !Array.isArray(deckData.slides)) {
      return [];
    }

    const extractedPlaceholders: ImagePlaceholder[] = [];

    deckData.slides.forEach((slide: any, slideIndex: number) => {
      if (!slide?.templateId || !slide?.props) {
        return;
      }

      const slideId = slide.slideId || `slide-${slideIndex}`;
      const templateId = slide.templateId;

      // Handle different template types that support images
      switch (templateId) {
        case 'big-image-left':
        case 'big-image-top':
          // Only extract if there's a prompt AND no image path, AND the image wasn't intentionally deleted
          if (slide.props.imagePrompt && !slide.props.imagePath && !slide.props.imageIntentionallyDeleted) {
            extractedPlaceholders.push({
              elementId: `${slideId}-image`,
              slideId,
              templateId,
              imagePrompt: slide.props.imagePrompt,
              imagePath: slide.props.imagePath,
              placeholderDimensions: { width: 400, height: 300 }, // Default dimensions
              isGenerating: false
            });
          }
          break;

        case 'bullet-points':
        case 'bullet-points-right':
          // Only extract if there's a prompt AND no image path, AND the image wasn't intentionally deleted
          if (slide.props.imagePrompt && !slide.props.imagePath && !slide.props.imageIntentionallyDeleted) {
            extractedPlaceholders.push({
              elementId: `${slideId}-image`,
              slideId,
              templateId,
              imagePrompt: slide.props.imagePrompt,
              imagePath: slide.props.imagePath,
              placeholderDimensions: { width: 300, height: 200 }, // Smaller for bullet points
              isGenerating: false
            });
          }
          break;

        case 'two-column':
          // Handle left image - only if not intentionally deleted
          if (slide.props.leftImagePrompt && !slide.props.leftImagePath && !slide.props.leftImageIntentionallyDeleted) {
            extractedPlaceholders.push({
              elementId: `${slideId}-left-image`,
              slideId,
              templateId,
              imagePrompt: slide.props.leftImagePrompt,
              imagePath: slide.props.leftImagePath,
              placeholderDimensions: { width: 250, height: 180 },
              isGenerating: false
            });
          }
          // Handle right image - only if not intentionally deleted
          if (slide.props.rightImagePrompt && !slide.props.rightImagePath && !slide.props.rightImageIntentionallyDeleted) {
            extractedPlaceholders.push({
              elementId: `${slideId}-right-image`,
              slideId,
              templateId,
              imagePrompt: slide.props.rightImagePrompt,
              imagePath: slide.props.rightImagePath,
              placeholderDimensions: { width: 250, height: 180 },
              isGenerating: false
            });
          }
          break;

        default:
          // Check for generic image properties - only if not intentionally deleted
          if (slide.props.imagePrompt && !slide.props.imagePath && !slide.props.imageIntentionallyDeleted) {
            extractedPlaceholders.push({
              elementId: `${slideId}-image`,
              slideId,
              templateId,
              imagePrompt: slide.props.imagePrompt,
              imagePath: slide.props.imagePath,
              placeholderDimensions: { width: 300, height: 200 },
              isGenerating: false
            });
          }
          break;
      }
    });

    log('AutomaticImageGenerationManager', 'extractImagePlaceholders', {
      totalSlides: deckData.slides?.length || 0,
      extractedPlaceholders: extractedPlaceholders.length,
      placeholders: extractedPlaceholders.map(p => ({
        elementId: p.elementId,
        templateId: p.templateId,
        hasPrompt: !!p.imagePrompt,
        hasImage: !!p.imagePath,
        intentionallyDeleted: false
      }))
    });

    return extractedPlaceholders;
  }, []);

  // Generate image for a single placeholder
  const generateImageForPlaceholder = useCallback(async (placeholder: ImagePlaceholder): Promise<{ success: boolean; imagePath?: string; error?: string }> => {
    if (!placeholder.imagePrompt) {
      return { success: false, error: 'No image prompt available' };
    }

    try {
      log('AutomaticImageGenerationManager', 'generateImageForPlaceholder_start', {
        elementId: placeholder.elementId,
        slideId: placeholder.slideId,
        templateId: placeholder.templateId,
        prompt: placeholder.imagePrompt.substring(0, 50) + '...',
        dimensions: placeholder.placeholderDimensions
      });

      // Convert placeholder dimensions to valid DALL-E 3 sizes with template-specific overrides
      let width = 1024;
      let height = 1024;
      
      // Template-specific dimension preferences with fallback to placeholder aspect ratio
      if (placeholder.templateId === 'big-image-left') {
        // Prefer portrait, but respect actual placeholder aspect ratio
        const placeholderAspect = placeholder.placeholderDimensions.width / placeholder.placeholderDimensions.height;
        if (placeholderAspect < 1.2) { // If placeholder is roughly square or portrait
          width = 1024;
          height = 1792;
        } else { // If placeholder is actually landscape, use landscape
          width = 1792;
          height = 1024;
        }
      } else if (placeholder.templateId === 'bullet-points' || placeholder.templateId === 'bullet-points-right') {
        // Prefer square, but adjust if placeholder is very different
        const placeholderAspect = placeholder.placeholderDimensions.width / placeholder.placeholderDimensions.height;
        if (placeholderAspect > 1.5) { // If placeholder is very wide, use landscape
          width = 1792;
          height = 1024;
        } else if (placeholderAspect < 0.7) { // If placeholder is very tall, use portrait
          width = 1024;
          height = 1792;
        } else { // Use square for roughly square placeholders
          width = 1024;
          height = 1024;
        }
      } else {
        // Use original logic for other templates
        if (placeholder.placeholderDimensions.width > placeholder.placeholderDimensions.height) {
          // Landscape orientation
          width = 1792;
          height = 1024;
        } else if (placeholder.placeholderDimensions.height > placeholder.placeholderDimensions.width) {
          // Portrait orientation
          width = 1024;
          height = 1792;
        } else {
          // Square orientation (default)
          width = 1024;
          height = 1024;
        }
      }

      const request: AIImageGenerationRequest = {
        prompt: enhancePromptWithTheme(placeholder.imagePrompt.trim()),
        width,
        height,
        quality: 'standard',
        style: 'vivid',
        model: 'dall-e-3'
      };

      const result = await generateAIImage(request);
      
      log('AutomaticImageGenerationManager', 'generateImageForPlaceholder_success', {
        elementId: placeholder.elementId,
        imagePath: result.file_path,
        originalDimensions: placeholder.placeholderDimensions,
        adjustedDimensions: { width, height }
      });

      return { success: true, imagePath: result.file_path };
      
    } catch (error: any) {
      const errorMessage = error.message || 'AI image generation failed';
      log('AutomaticImageGenerationManager', 'generateImageForPlaceholder_error', {
        elementId: placeholder.elementId,
        error: errorMessage,
        errorObject: error
      });
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Process all placeholders with automatic generation
  const processAllPlaceholders = useCallback(async () => {
    if (!enabled || placeholders.length === 0) {
      return;
    }

    setIsProcessing(true);
    const results: { elementId: string; success: boolean; imagePath?: string; error?: string }[] = [];

    log('AutomaticImageGenerationManager', 'processAllPlaceholders_start', {
      totalPlaceholders: placeholders.length,
      placeholders: placeholders.map(p => ({
        elementId: p.elementId,
        templateId: p.templateId,
        hasPrompt: !!p.imagePrompt
      }))
    });

    // Process placeholders concurrently with rate limiting
    const batchSize = 3; // Process 3 at a time to avoid API rate limits
    const batches = [];
    
    for (let i = 0; i < placeholders.length; i += batchSize) {
      batches.push(placeholders.slice(i, i + batchSize));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      log('AutomaticImageGenerationManager', 'processBatch_start', {
        batchIndex,
        batchSize: batch.length,
        batchPlaceholders: batch.map(p => p.elementId)
      });

      // Process batch concurrently
      const batchPromises = batch.map(async (placeholder) => {
        // Mark as generating
        setPlaceholders(prev => prev.map(p => 
          p.elementId === placeholder.elementId 
            ? { ...p, isGenerating: true }
            : p
        ));

        // Notify parent that generation started
        onGenerationStarted?.(placeholder.elementId);

        // Enhance prompt with theme colors
        const enhancedPrompt = enhancePromptWithTheme(placeholder.imagePrompt || '');

        // Generate image
        const result = await generateImageForPlaceholder({ ...placeholder, imagePrompt: enhancedPrompt });
        
        // Update results
        const resultEntry = {
          elementId: placeholder.elementId,
          success: result.success,
          imagePath: result.imagePath,
          error: result.error
        };
        
        results.push(resultEntry);

        // Update placeholder state
        setPlaceholders(prev => prev.map(p => 
          p.elementId === placeholder.elementId 
            ? { 
                ...p, 
                isGenerating: false,
                imagePath: result.success ? result.imagePath : undefined,
                error: result.success ? undefined : result.error
              }
            : p
        ));

        // Notify parent of completion
        if (result.success && result.imagePath) {
          onGenerationCompleted?.(placeholder.elementId, result.imagePath);
        } else if (result.error) {
          onGenerationFailed?.(placeholder.elementId, result.error);
        }

        return resultEntry;
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);

      // Add delay between batches to avoid rate limiting
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    setGenerationResults(results);
    setIsProcessing(false);

    log('AutomaticImageGenerationManager', 'processAllPlaceholders_complete', {
      totalResults: results.length,
      successfulResults: results.filter(r => r.success).length,
      failedResults: results.filter(r => !r.success).length,
      results: results.map(r => ({
        elementId: r.elementId,
        success: r.success,
        hasImagePath: !!r.imagePath,
        hasError: !!r.error
      }))
    });

    // Notify parent that all generations are complete
    onAllGenerationsComplete?.(results);
  }, [enabled, placeholders, generateImageForPlaceholder, onGenerationStarted, onGenerationCompleted, onGenerationFailed, onAllGenerationsComplete, enhancePromptWithTheme]);

  // Extract placeholders when deck changes
  useEffect(() => {
    if (deck) {
      const extractedPlaceholders = extractImagePlaceholders(deck);
      setPlaceholders(extractedPlaceholders);
      
      log('AutomaticImageGenerationManager', 'deckChanged', {
        hasDeck: !!deck,
        extractedPlaceholders: extractedPlaceholders.length,
        enabled
      });
    }
  }, [deck, extractImagePlaceholders, enabled]);

  // Start automatic generation when placeholders are available
  useEffect(() => {
    if (enabled && placeholders.length > 0 && !isProcessing) {
      log('AutomaticImageGenerationManager', 'startingAutomaticGeneration', {
        placeholdersCount: placeholders.length,
        placeholders: placeholders.map(p => ({
          elementId: p.elementId,
          templateId: p.templateId,
          hasPrompt: !!p.imagePrompt,
          hasImage: !!p.imagePath
        }))
      });
      
      processAllPlaceholders();
    }
  }, [enabled, placeholders, isProcessing, processAllPlaceholders]);

  // Get generation status for a specific placeholder
  const getPlaceholderStatus = useCallback((elementId: string) => {
    const placeholder = placeholders.find(p => p.elementId === elementId);
    if (!placeholder) {
      return { isGenerating: false, hasImage: false, hasError: false, error: undefined };
    }
    
    return {
      isGenerating: placeholder.isGenerating || false,
      hasImage: !!placeholder.imagePath,
      hasError: !!placeholder.error,
      error: placeholder.error
    };
  }, [placeholders]);

  // Get overall generation progress
  const getGenerationProgress = useCallback(() => {
    if (placeholders.length === 0) {
      return { total: 0, completed: 0, inProgress: 0, failed: 0, percentage: 0 };
    }

    const total = placeholders.length;
    const completed = placeholders.filter(p => !!p.imagePath).length;
    const inProgress = placeholders.filter(p => p.isGenerating).length;
    const failed = placeholders.filter(p => !!p.error).length;
    const percentage = Math.round((completed / total) * 100);

    return { total, completed, inProgress, failed, percentage };
  }, [placeholders]);

  // This component doesn't render anything visible
  // It's a manager component that coordinates automatic image generation
  return null;
};

export default AutomaticImageGenerationManager;
