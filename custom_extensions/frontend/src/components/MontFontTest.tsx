'use client';

// Mont Font Test Component
// Use this component to verify Mont fonts are loading correctly

import React, { useEffect, useState } from 'react';
import { isFontLoaded, debugMontFonts, MONT_FONTS } from '../utils/fontLoader';

interface MontFontTestProps {
  showDebugInfo?: boolean;
}

export const MontFontTest: React.FC<MontFontTestProps> = ({ 
  showDebugInfo = false 
}) => {
  const [fontStatus, setFontStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkFonts = () => {
      const status = {
        regular: isFontLoaded(MONT_FONTS.regular),
        bold: isFontLoaded(MONT_FONTS.bold),
        thin: isFontLoaded(MONT_FONTS.thin),
      };
      setFontStatus(status);
    };

    // Check immediately and after a delay
    checkFonts();
    const timer = setTimeout(checkFonts, 2000);

    if (showDebugInfo) {
      debugMontFonts();
    }

    return () => clearTimeout(timer);
  }, [showDebugInfo]);

  if (!showDebugInfo) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
        🎨 Mont Font Status
      </div>
      
      {Object.entries(fontStatus).map(([variant, isLoaded]) => (
        <div key={variant} style={{ marginBottom: '4px' }}>
          {isLoaded ? '✅' : '❌'} Mont {variant}: {MONT_FONTS[variant as keyof typeof MONT_FONTS]}
        </div>
      ))}
      
      <div style={{ marginTop: '12px', fontSize: '11px', opacity: 0.8 }}>
        Test samples:
      </div>
      
      <div style={{ 
        fontFamily: MONT_FONTS.regular, 
        marginTop: '4px',
        fontSize: '14px'
      }}>
        Mont Regular: The quick brown fox
      </div>
      
      <div style={{ 
        fontFamily: MONT_FONTS.bold, 
        marginTop: '4px',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        Mont Bold: The quick brown fox
      </div>
      
      <div style={{ 
        fontFamily: MONT_FONTS.thin, 
        marginTop: '4px',
        fontSize: '14px',
        fontWeight: '100'
      }}>
        Mont Thin: The quick brown fox
      </div>
    </div>
  );
};

export default MontFontTest;