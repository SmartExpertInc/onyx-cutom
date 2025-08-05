// Font Loading Utility for Mont Fonts
// Helps ensure Mont fonts are properly loaded and applied

export const MONT_FONTS = {
  regular: 'Mont Regular',
  bold: 'Mont Bold',
  thin: 'Mont Thin',
} as const;

export const MONT_FONT_URLS = {
  regular: '/fonts/fonnts.com-Mont_Regular.ttf',
  bold: '/fonts/fonnts.com-Mont_Bold.ttf',
  thin: '/fonts/fonnts.com-Mont_Thin.ttf',
} as const;

/**
 * Check if a font is loaded and available
 */
export const isFontLoaded = (fontFamily: string): boolean => {
  if (typeof document === 'undefined') return false;
  
  try {
    // Create a test element to check if font is loaded
    const testElement = document.createElement('div');
    testElement.style.fontFamily = fontFamily;
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.style.fontSize = '16px';
    testElement.innerText = 'Test';
    
    document.body.appendChild(testElement);
    const computedStyle = window.getComputedStyle(testElement);
    const actualFontFamily = computedStyle.fontFamily;
    document.body.removeChild(testElement);
    
    // Check if the computed font family includes our target font
    return actualFontFamily.toLowerCase().includes(fontFamily.toLowerCase());
  } catch (error) {
    console.warn('Font loading check failed:', error);
    return false;
  }
};

/**
 * Preload Mont fonts programmatically
 */
export const preloadMontFonts = async (): Promise<void> => {
  if (typeof document === 'undefined') return;

  const fontPromises = Object.entries(MONT_FONT_URLS).map(([variant, url]) => {
    return new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/ttf';
      link.crossOrigin = 'anonymous';
      link.href = url;
      
      link.onload = () => {
        console.log(`✅ Mont ${variant} font preloaded successfully`);
        resolve();
      };
      
      link.onerror = () => {
        console.error(`❌ Failed to preload Mont ${variant} font from ${url}`);
        reject(new Error(`Failed to preload Mont ${variant} font`));
      };
      
      document.head.appendChild(link);
    });
  });

  try {
    await Promise.all(fontPromises);
    console.log('🎉 All Mont fonts preloaded successfully');
  } catch (error) {
    console.error('⚠️ Some Mont fonts failed to preload:', error);
  }
};

/**
 * Get the appropriate Mont font family for a theme element
 */
export const getMontFontFamily = (
  element: 'title' | 'content' | 'subtitle',
  fallback = 'sans-serif'
): string => {
  switch (element) {
    case 'title':
      return `'${MONT_FONTS.bold}', 'Mont', ${fallback}`;
    case 'content':
    case 'subtitle':
      return `'${MONT_FONTS.regular}', 'Mont', ${fallback}`;
    default:
      return `'${MONT_FONTS.regular}', 'Mont', ${fallback}`;
  }
};

/**
 * Apply Mont fonts to Chudo theme elements
 */
export const applyMontFontsToChudoThemes = (): void => {
  if (typeof document === 'undefined') return;

  // Add theme-specific CSS classes if they don't exist
  const existingStyle = document.getElementById('mont-font-styles');
  if (existingStyle) return;

  const style = document.createElement('style');
  style.id = 'mont-font-styles';
  style.textContent = `
    /* Dynamic Mont font application for Chudo themes */
    [data-theme="chudo-theme"] *,
    [data-theme="chudo-2"] *,
    .theme-chudo-theme *,
    .theme-chudo-2 * {
      font-family: '${MONT_FONTS.regular}', 'Mont', system-ui, sans-serif !important;
    }
    
    [data-theme="chudo-theme"] h1,
    [data-theme="chudo-theme"] h2, 
    [data-theme="chudo-theme"] h3,
    [data-theme="chudo-theme"] .slide-title,
    [data-theme="chudo-2"] h1,
    [data-theme="chudo-2"] h2,
    [data-theme="chudo-2"] h3,
    [data-theme="chudo-2"] .slide-title,
    .theme-chudo-theme h1,
    .theme-chudo-theme h2,
    .theme-chudo-theme h3,
    .theme-chudo-theme .slide-title,
    .theme-chudo-2 h1,
    .theme-chudo-2 h2,
    .theme-chudo-2 h3,
    .theme-chudo-2 .slide-title {
      font-family: '${MONT_FONTS.bold}', 'Mont', system-ui, sans-serif !important;
      font-weight: 700 !important;
    }
  `;
  
  document.head.appendChild(style);
  console.log('🎨 Font styles applied to Chudo themes');
};

/**
 * Debug font loading status
 */
export const debugMontFonts = (): void => {
  console.log('🔍 Mont Font Loading Debug:');
  
  Object.entries(MONT_FONTS).forEach(([variant, fontName]) => {
    const isLoaded = isFontLoaded(fontName);
    console.log(`  ${variant}: ${isLoaded ? '✅' : '❌'} ${fontName}`);
  });
  
  // Check if font files are accessible
  Object.entries(MONT_FONT_URLS).forEach(([variant, url]) => {
    fetch(url, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          console.log(`  📁 ${variant} file: ✅ ${url}`);
        } else {
          console.log(`  📁 ${variant} file: ❌ ${url} (${response.status})`);
        }
      })
      .catch(error => {
        console.log(`  📁 ${variant} file: ❌ ${url} (${error.message})`);
      });
  });
};