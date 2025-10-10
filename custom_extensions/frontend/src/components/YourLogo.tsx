// custom_extensions/frontend/src/components/YourLogo.tsx

import React, { useState } from 'react';
import ClickableImagePlaceholder from './ClickableImagePlaceholder';
import PresentationImageUpload from './PresentationImageUpload';

interface YourLogoProps {
  logoPath?: string;
  onLogoUploaded?: (path: string) => void;
  isEditable?: boolean;
  color?: string; // stroke/text color for the placeholder
  text?: string; // label text
  style?: React.CSSProperties;
}

// Unified “Your Logo” UI used across slides
export const YourLogo: React.FC<YourLogoProps> = ({
  logoPath,
  onLogoUploaded,
  isEditable = false,
  color = '#888888',
  text = 'Your Logo',
  style = {}
}) => {
  const [open, setOpen] = useState(false);

  if (logoPath) {
    return (
      <ClickableImagePlaceholder
        imagePath={logoPath}
        onImageUploaded={(p: string) => { onLogoUploaded && onLogoUploaded(p); }}
        size="SMALL"
        position="CENTER"
        description="Company logo"
        isEditable={isEditable}
        style={{ height: '30px', maxWidth: '120px', objectFit: 'contain', ...style }}
      />
    );
  }

  return (
    <>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: isEditable ? 'pointer' : 'default', ...style }}
        onClick={() => isEditable && setOpen(true)}
      >
        <div style={{ width: '30px', height: '30px', border: `2px solid ${color}`, borderRadius: '50%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '12px', height: '2px', backgroundColor: color, position: 'absolute' }} />
          <div style={{ width: '2px', height: '12px', backgroundColor: color, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
        </div>
        <span style={{ fontSize: '14px', fontWeight: 300, color }}>{text}</span>
      </div>

      <PresentationImageUpload
        isOpen={open}
        onClose={() => setOpen(false)}
        onImageUploaded={(p) => { onLogoUploaded && onLogoUploaded(p); setOpen(false); }}
        title="Upload Company Logo"
      />
    </>
  );
};

export default YourLogo;

