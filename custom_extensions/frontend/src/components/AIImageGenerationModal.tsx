"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { generateAIImage, AIImageGenerationRequest } from '../lib/designTemplateApi';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && (window as any).__MOVEABLE_DEBUG__;
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[${source}] ${event}`, { ts: Date.now(), ...data });
  }
};

interface AIImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated: (imagePath: string) => void;
  onGenerationStarted: () => void; // NEW: Callback when generation starts
  placeholderDimensions?: { width: number; height: number };
  title?: string;
  preFilledPrompt?: string; // NEW: Pre-filled prompt from AI
  placeholderId?: string; // NEW: For debugging - placeholder identifier
  currentTheme?: {
    colors?: {
      backgroundColor?: string;
      titleColor?: string;
      subtitleColor?: string;
      contentColor?: string;
      accentColor?: string;
    };
  }; // NEW: Current theme colors for styling
}

const AIImageGenerationModal: React.FC<AIImageGenerationModalProps> = ({
  isOpen,
  onClose,
  onImageGenerated,
  onGenerationStarted,
  placeholderDimensions = { width: 1024, height: 1024 },
  title = "Generate AI Image",
  preFilledPrompt,
  placeholderId,
  currentTheme
}) => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [style, setStyle] = useState<'vivid' | 'natural'>('vivid');

  // Helper function to enhance prompt with theme colors
  const enhancePromptWithTheme = (basePrompt: string): string => {
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
  };

  log('AIImageGenerationModal', 'render', { 
    isOpen, 
    generating, 
    hasError: !!error,
    portalContainerExists: !!portalContainer,
    placeholderDimensions,
    placeholderId,
    hasPreFilledPrompt: !!preFilledPrompt,
    preFilledPromptLength: preFilledPrompt?.length || 0,
    hasTheme: !!currentTheme,
    themeColors: currentTheme?.colors
  });

  // Create portal container on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalContainer(document.body);
      log('AIImageGenerationModal', 'portalContainerSet', { container: 'document.body' });
    }
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    log('AIImageGenerationModal', 'useEffect_modalState', { 
      isOpen, 
      placeholderId,
      hasPreFilledPrompt: !!preFilledPrompt,
      preFilledPromptPreview: preFilledPrompt?.substring(0, 50) + '...',
      currentPrompt: prompt
    });

    if (!isOpen) {
      setPrompt('');
      setError(null);
      setGenerating(false);
      log('AIImageGenerationModal', 'modalClosed', { placeholderId });
    } else if (preFilledPrompt) {
      // Pre-fill prompt when modal opens
      setPrompt(preFilledPrompt);
      log('AIImageGenerationModal', 'preFillPrompt', { 
        placeholderId,
        preFilledPrompt: preFilledPrompt.substring(0, 50) + '...',
        fullPromptLength: preFilledPrompt.length
      });
    } else {
      log('AIImageGenerationModal', 'modalOpened_noPreFill', { 
        placeholderId,
        reason: 'No preFilledPrompt provided'
      });
    }
  }, [isOpen, preFilledPrompt, placeholderId]);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for image generation');
      return;
    }

    log('AIImageGenerationModal', 'generateImage_start', { 
      placeholderId,
      prompt: prompt.substring(0, 50),
      dimensions: placeholderDimensions,
      quality,
      style
    });

    // ✅ NEW: Close modal immediately and notify parent
    log('AIImageGenerationModal', 'generationStarted_notifyParent', { 
      placeholderId,
      timestamp: Date.now()
    });
    onGenerationStarted();
    onClose();

    // ✅ NEW: Continue generation in background
    try {
      // ✅ FIX: Ensure we send valid DALL-E 3 dimensions
      let width = 1024;
      let height = 1024;
      
      // Convert placeholder dimensions to valid DALL-E 3 sizes
      if (placeholderDimensions.width > placeholderDimensions.height) {
        // Landscape orientation
        width = 1792;
        height = 1024;
      } else if (placeholderDimensions.height > placeholderDimensions.width) {
        // Portrait orientation
        width = 1024;
        height = 1792;
      } else {
        // Square orientation (default)
        width = 1024;
        height = 1024;
      }

      const request: AIImageGenerationRequest = {
        prompt: enhancePromptWithTheme(prompt.trim()),
        width,
        height,
        quality,
        style,
        model: 'dall-e-3'
      };

      log('AIImageGenerationModal', 'generateImage_apiCall', { 
        placeholderId,
        originalPrompt: prompt.trim(),
        enhancedPrompt: enhancePromptWithTheme(prompt.trim()),
        request,
        originalDimensions: placeholderDimensions,
        adjustedDimensions: { width, height },
        endpoint: '/api/custom/presentation/generate_image',
        themeColors: currentTheme?.colors
      });

      const result = await generateAIImage(request);
      
      log('AIImageGenerationModal', 'generateImage_success', { 
        placeholderId,
        result,
        filePath: result.file_path,
        timestamp: Date.now()
      });

      onImageGenerated(result.file_path);
      
    } catch (err: any) {
      const errorMessage = err.message || 'AI image generation failed';
      log('AIImageGenerationModal', 'generateImage_error', { 
        placeholderId,
        error: errorMessage,
        errorObject: err,
        timestamp: Date.now()
      });
      // ✅ NEW: Handle error by calling onImageGenerated with null to indicate failure
      onImageGenerated(null as any);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!generating) {
        generateImage();
      }
    }
  };

  if (!isOpen || !portalContainer) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-sm bg-black/20" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '32rem',
          width: '100%',
          margin: '0 1rem',
          zIndex: 100000
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={generating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Describe the image you want to generate
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., A modern business presentation slide with charts and graphs, professional style, clean design"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              disabled={generating}
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific and descriptive for better results
            </p>
          </div>

          {/* Generation Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as 'standard' | 'hd')}
                disabled={generating}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="standard">Standard</option>
                <option value="hd">HD</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as 'vivid' | 'natural')}
                disabled={generating}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="vivid">Vivid</option>
                <option value="natural">Natural</option>
              </select>
            </div>
          </div>

          {/* Dimensions Info */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ImageIcon className="w-4 h-4" />
              <span>
                Image will be generated at {placeholderDimensions.width > placeholderDimensions.height ? '1792×1024' : placeholderDimensions.height > placeholderDimensions.width ? '1024×1792' : '1024×1024'} pixels
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              (Optimized for DALL-E 3 based on your placeholder's aspect ratio)
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={generating}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={generateImage}
              disabled={generating || !prompt.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, portalContainer);
};

export default AIImageGenerationModal;
