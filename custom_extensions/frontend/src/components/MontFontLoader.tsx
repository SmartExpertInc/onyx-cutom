'use client';

// Mont Font Loader Component
// Ensures Mont fonts are properly loaded and applied to Chudo themes

import React, { useEffect } from 'react';
import { preloadMontFonts, applyMontFontsToChudoThemes, debugMontFonts } from '../utils/fontLoader';

export const MontFontLoader: React.FC = () => {
  useEffect(() => {
    const initializeMontFonts = async () => {
      try {
        // Apply Mont font styles to Chudo themes
        applyMontFontsToChudoThemes();
        
        // Preload Mont fonts for better performance
        await preloadMontFonts();
        
        // Debug font loading (only in development)
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => {
            debugMontFonts();
          }, 1000); // Wait a bit for fonts to load
        }
        
        console.log('🎨 Mont fonts initialized successfully for Chudo themes');
      } catch (error) {
        console.error('❌ Failed to initialize Mont fonts:', error);
      }
    };

    initializeMontFonts();
  }, []);

  return null; // This component doesn't render anything
};

export default MontFontLoader;