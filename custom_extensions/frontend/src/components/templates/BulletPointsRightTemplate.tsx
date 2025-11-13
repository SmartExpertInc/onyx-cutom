import React, { useState, useRef, useEffect } from 'react';
import { BulletPointsProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

export interface BulletPointsRightProps extends BulletPointsProps {
  subtitle?: string;
  theme?: SlideTheme;
}

// New component for unified bullet points editing (adapted for bullet-points-right)
interface UnifiedBulletEditorProps {
  bullets: string[];
  bulletStyle: string;
  onUpdate: (bullets: string[]) => void;
  theme: SlideTheme;
  isEditable: boolean;
}

function UnifiedBulletEditor({ 
  bullets, 
  bulletStyle, 
  onUpdate, 
  theme, 
  isEditable 
}: UnifiedBulletEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentBullets, setCurrentBullets] = useState<string[]>(bullets || []);

  useEffect(() => {
    setCurrentBullets(bullets || []);
  }, [bullets]);

  const getBulletIcon = (style: string, index: number) => {
    // Always use triangular arrows for bullet-points-right template
    return '▶';
  };

  const handleBulletSave = (index: number, value: string) => {
    const newBullets = [...currentBullets];
    // Clean HTML - remove wrapping <p> tags if present
    const cleanValue = value.replace(/^<p>([\s\S]*)<\/p>$/i, '$1').trim();
    if (cleanValue) {
      newBullets[index] = cleanValue;
    } else {
      // Remove empty bullet
      newBullets.splice(index, 1);
    }
    setCurrentBullets(newBullets);
    onUpdate(newBullets);
    setEditingIndex(null);
  };

  const handleBulletCancel = (index: number) => {
    setEditingIndex(null);
  };

  const handleBulletClick = (index: number, e: React.MouseEvent) => {
    if (!isEditable) return;
    const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
    if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setEditingIndex(index);
  };

  const handleAddBullet = () => {
    if (!isEditable) return;
    const newBullets = [...currentBullets, ''];
    setCurrentBullets(newBullets);
    setEditingIndex(newBullets.length - 1);
  };

  const bulletIconStyles: React.CSSProperties = {
    color: '#ffffff', // White triangular arrows
    fontWeight: 'bold',
    minWidth: '14px',
    minHeight: '14px',
    width: '14px',
    height: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontFamily: 'sans-serif',
    flexShrink: 0
  };

  const bulletTextStyles: React.CSSProperties = {
    fontFamily: 'sans-serif',
    fontSize: '0.9rem',
    marginTop: '-5px',
    opacity: '1',
    color: '#ffffff', // White text on dark background
    lineHeight: '1.6'
  };


  return (
    <div 
      style={{ 
        padding: '4px', 
        borderRadius: '4px', 
        border: '1px solid transparent',
        width: '100%', 
        minWidth: 0, 
        boxSizing: 'border-box' 
      }}
    >
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}>
        {currentBullets.map((bullet: string, index: number) => (
          <li key={index} style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '12px', 
            marginBottom: '35px',
            width: '100%'
          }}>
            <span style={bulletIconStyles}>
              {getBulletIcon(bulletStyle, index)}
            </span>
            {editingIndex === index ? (
              <div style={{ flex: 1, minWidth: 0 }}>
                <WysiwygEditor
                  initialValue={bullet || ''}
                  onSave={(value) => handleBulletSave(index, value)}
                  onCancel={() => handleBulletCancel(index)}
                  placeholder="Enter bullet point..."
                  className="bullet-wysiwyg-editor"
                  style={{
                    ...bulletTextStyles,
                    padding: '4px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block',
                    flex: 1,
                    minWidth: 0
                  }}
                />
              </div>
            ) : (
              <span 
                style={{ ...bulletTextStyles, flex: 1, minWidth: 0 }}
                onClick={(e) => handleBulletClick(index, e)}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                dangerouslySetInnerHTML={{ __html: bullet || 'Click to add bullet point' }}
              />
            )}
          </li>
        ))}
        {(currentBullets.length === 0 || (isEditable && editingIndex === null)) && (
          <li 
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px', 
              marginBottom: '35px',
              width: '100%'
            }}
            onClick={isEditable && currentBullets.length === 0 ? handleAddBullet : undefined}
          >
            <span style={bulletIconStyles}>•</span>
            <span style={{ ...bulletTextStyles, color: '#9ca3af', fontStyle: 'italic', flex: 1, minWidth: 0 }}>
              {isEditable ? 'Click to add bullet points...' : 'No bullet points'}
            </span>
          </li>
        )}
        {isEditable && editingIndex === null && currentBullets.length > 0 && (
          <li 
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px', 
              marginBottom: '35px',
              width: '100%',
              cursor: 'pointer',
              opacity: 0.6
            }}
            onClick={handleAddBullet}
          >
            <span style={bulletIconStyles}>+</span>
            <span style={{ ...bulletTextStyles, color: '#9ca3af', fontStyle: 'italic', flex: 1, minWidth: 0 }}>
              Click to add another bullet point...
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

export const BulletPointsRightTemplate: React.FC<BulletPointsRightProps & { 
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
  getPlaceholderGenerationState?: (elementId: string) => { isGenerating: boolean; hasImage: boolean; error?: string };
}> = ({
  slideId,
  title,
  subtitle = '',
  bullets,
  maxColumns = 1,
  bulletStyle = 'dot',
  onUpdate,
  imagePrompt,
  imageAlt,
  theme,
  isEditable = false,
  imagePath,
  widthPx,
  heightPx,
  imageScale,
  imageOffset,
  objectFit,
  getPlaceholderGenerationState
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  
  // Add image ref for proper sizing
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Inline editing state for title and subtitle only
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    background: '#ffffff', // White background as in photo
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont,
    overflow: 'hidden'
  };

  // Left side with title and bullets (dark blue background with diagonal cut)
  const leftSectionStyles: React.CSSProperties = {
    width: '65%',
    height: '600px',
    position: 'absolute',
    left: '0',
    top: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
    padding: '35px',
    clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
    zIndex: 2
  };

  // Right side with image only (white background with diagonal cut)
  const rightSectionStyles: React.CSSProperties = {
    width: '100%',
    height: '600px',
    position: 'absolute',
    left: '0',
    top: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    zIndex: 1
  };


  const titleStyles: React.CSSProperties = {
    fontSize: '3.5rem',
    fontFamily: 'serif',
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: '40px',
    wordWrap: 'break-word',
    lineHeight: '1.1'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.2rem',
    color: currentTheme.colors.subtitleColor,
    marginBottom: '32px',
    fontFamily: currentTheme.fonts.contentFont,
    wordWrap: 'break-word',
    lineHeight: '1.4'
  };

  // Handle title editing
  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  // Handle subtitle editing
  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
  };

  // Handle bullet points update
  const handleBulletsUpdate = (newBullets: string[]) => {
    if (onUpdate) {
      onUpdate({ bullets: newBullets });
    }
  };

  // Handle image upload
  const handleImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ imagePath: newImagePath });
    }
  };

  // Handle size and transform changes for the placeholder
  const handleSizeTransformChange = (payload: any) => {
    if (onUpdate) {
      // Convert the payload to the expected format for the backend
      const updateData: any = {};
      
      if (payload.imagePosition) {
        updateData.imageOffset = payload.imagePosition;
      }
      
      if (payload.imageSize) {
        updateData.widthPx = payload.imageSize.width;
        updateData.heightPx = payload.imageSize.height;
      }
      
      // ✅ NEW: Handle objectFit property from ClickableImagePlaceholder
      if (payload.objectFit) {
        updateData.objectFit = payload.objectFit;
        console.log('BulletPointsRightTemplate: objectFit update', { 
          slideId, 
          objectFit: payload.objectFit 
        });
      }
      
      onUpdate(updateData);
    }
  };

  // AI prompt logic
  const displayPrompt = imagePrompt || imageAlt || 'relevant illustration for the bullet points';

  const placeholderStyles: React.CSSProperties = {
    // Only apply default dimensions if no saved size exists
    ...(widthPx && heightPx ? {} : { width: '100%', height: '100%', aspectRatio: '1/1' }),
    margin: '0 auto',
    position: 'relative',
    zIndex: 29
  };

  return (
    <div ref={slideContainerRef} className="bullet-points-right-template" style={slideStyles}>
      {/* Left section with title and bullets (dark blue background) */}
      <div style={leftSectionStyles}>
        {/* Title */}
        <div data-draggable="true">
          {isEditable && editingTitle ? (
            <WysiwygEditor
              initialValue={title || 'Problem'}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              placeholder="Enter slide title..."
              className="inline-editor-title"
              style={{
                ...titleStyles,
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block',
                lineHeight: '1.1'
              }}
            />
          ) : (
            <h1 
              style={titleStyles}
              onClick={(e) => {
                const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (isEditable) {
                  setEditingTitle(true);
                }
              }}
              className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              dangerouslySetInnerHTML={{ __html: title || 'Problem' }}
            />
          )}
        </div>

        {/* Bullets */}
        <div data-draggable="true" style={{ width: '100%', minWidth: '300px', maxWidth: '600px' }}>
          <UnifiedBulletEditor
            bullets={bullets || []}
            bulletStyle="arrow"
            onUpdate={handleBulletsUpdate}
            theme={currentTheme}
            isEditable={isEditable}
          />
        </div>
      </div>

      {/* Right section with image only */}
      <div style={rightSectionStyles}>
        <ClickableImagePlaceholder
          imagePath={imagePath}
          onImageUploaded={handleImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Click to upload image"
          prompt={displayPrompt}
          isEditable={isEditable}
          style={placeholderStyles}
          onSizeTransformChange={handleSizeTransformChange}
          elementId={`${slideId}-image`}
          elementRef={imageRef}
          cropMode={objectFit || 'contain'}
          slideContainerRef={slideContainerRef}
          savedImagePosition={imageOffset}
          savedImageSize={widthPx && heightPx ? { width: widthPx, height: heightPx } : undefined}
          templateId="bullet-points-right"
          aiGeneratedPrompt={imagePrompt}
          isGenerating={getPlaceholderGenerationState ? getPlaceholderGenerationState(`${slideId}-image`).isGenerating : false}
          onGenerationStarted={getPlaceholderGenerationState ? () => {} : undefined}
        />
      </div>
    </div>
  );
};

export default BulletPointsRightTemplate; 