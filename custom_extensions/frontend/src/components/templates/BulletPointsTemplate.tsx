import React, { useState, useRef, useEffect } from 'react';
import { BulletPointsProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

// Component for unified bullet points editing
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
    color: '#ffffff',
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
    color: '#ffffff',
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
        alignItems: 'flex-end',
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

export const BulletPointsTemplate: React.FC<BulletPointsProps & { 
  subtitle?: string;
  theme?: SlideTheme;
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
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const imageRef = useRef<HTMLDivElement>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont,
    overflow: 'hidden'
  };

  // LEFT side with IMAGE (white background)
  const leftSectionStyles: React.CSSProperties = {
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

  // RIGHT side with TITLE and BULLETS (dark blue background with diagonal cut)
  const rightSectionStyles: React.CSSProperties = {
    width: '65%',
    height: '600px',
    position: 'absolute',
    right: '0',
    top: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
    padding: '35px',
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 15% 100%)', // Mirrored diagonal cut - bottom left corner
    zIndex: 2
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '3.5rem',
    width: '100%',
    fontFamily: 'serif',
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: '40px',
    wordWrap: 'break-word',
    lineHeight: '1.1'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.4rem',
    color: currentTheme.colors.subtitleColor,
    marginBottom: '32px',
    fontFamily: currentTheme.fonts.contentFont,
    wordWrap: 'break-word',
    lineHeight: '1.4'
  };

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
  };

  const handleBulletsUpdate = (newBullets: string[]) => {
    if (onUpdate) {
      onUpdate({ bullets: newBullets });
    }
  };

  const handleImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ imagePath: newImagePath });
    }
  };

  const handleSizeTransformChange = (payload: any) => {
    if (onUpdate) {
      const updateData: any = {};
      
      if (payload.imagePosition) {
        updateData.imageOffset = payload.imagePosition;
      }
      
      if (payload.imageSize) {
        updateData.widthPx = payload.imageSize.width;
        updateData.heightPx = payload.imageSize.height;
      }
      
      if (payload.objectFit) {
        updateData.objectFit = payload.objectFit;
      }
      
      onUpdate(updateData);
    }
  };

  const displayPrompt = imagePrompt || imageAlt || 'relevant illustration for the bullet points';

  const placeholderStyles: React.CSSProperties = {
    ...(widthPx && heightPx ? {} : { width: '100%', height: '100%', aspectRatio: '1/1' }),
    margin: '0 auto',
    position: 'relative',
    zIndex: 29
  };

  return (
    <div ref={slideContainerRef} className="bullet-points-template" style={slideStyles}>
      {/* LEFT section with IMAGE */}
      <div style={leftSectionStyles}>
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
          templateId="bullet-points"
          aiGeneratedPrompt={imagePrompt}
          isGenerating={getPlaceholderGenerationState ? getPlaceholderGenerationState(`${slideId}-image`).isGenerating : false}
          onGenerationStarted={getPlaceholderGenerationState ? () => {} : undefined}
        />
      </div>

      {/* RIGHT section with TITLE and BULLETS */}
      <div style={rightSectionStyles}>
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
    </div>
  );
};

export default BulletPointsTemplate;
