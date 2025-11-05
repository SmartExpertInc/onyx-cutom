// custom_extensions/frontend/src/components/templates/FinancialImpactGridSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';

export interface FinancialImpactGridProps extends BaseTemplateProps {
  topLeft: {
    avatarPath?: string;
  };
  topMiddle: {
    imagePath?: string;
    value: string;
    description: string;
  };
  topRight: {
    value: string;
    description: string;
  };
  bottomLeft: {
    title: string;
    subtitle: string;
    pageNumber?: string;
  };
  bottomMiddle: {
    value: string;
    description: string;
  };
  bottomRight: {
    imagePath?: string;
  };
  logoPath?: string;
}

export const FinancialImpactGridSlideTemplate: React.FC<FinancialImpactGridProps & { theme?: SlideTheme | string }> = ({
  topLeft = {
    avatarPath: ''
  },
  topMiddle = {
    imagePath: '',
    value: '$4-$6',
    description: 'Reduction in compensation costs'
  },
  topRight = {
    value: '$170 billion',
    description: 'Annual cost of US workplace accidents & injuries'
  },
  bottomLeft = {
    title: 'The financial impact',
    subtitle: 'InInterest growth',
    pageNumber: '18'
  },
  bottomMiddle = {
    value: '$4-$6',
    description: 'ROI for every $1 invested'
  },
  bottomRight = {
    imagePath: ''
  },
  logoPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editKey, setEditKey] = useState<string | null>(null);

  const slide: React.CSSProperties = { 
    width:'100%', 
    aspectRatio:'16/9', 
    background:'#FFFFFF', 
    color:'#333333', 
    fontFamily: currentTheme.fonts.titleFont, 
    position:'relative',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '0',
    overflow: 'hidden'
  };

  // Top Left - Light blue-purple with avatar
  const topLeftStyle: React.CSSProperties = {
    backgroundColor: '#E0E7FF',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  };

  // Top Middle - White with image and text
  const topMiddleStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px'
  };

  // Top Right - Blue
  const topRightStyle: React.CSSProperties = {
    backgroundColor: '#0F58F9',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px',
    justifyContent: 'start'
  };

  // Bottom Left - Blue
  const bottomLeftStyle: React.CSSProperties = {
    backgroundColor: '#0F58F9',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px',
    justifyContent: 'space-between'
  };

  // Bottom Middle - Light blue-purple
  const bottomMiddleStyle: React.CSSProperties = {
    backgroundColor: '#E0E7FF',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px',
    justifyContent: 'start'
  };

  // Bottom Right - Image
  const bottomRightStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden'
  };

  // Avatar style
  const avatarStyle: React.CSSProperties = {
    width: '70%',
    height: '70%',
    objectFit: 'contain'
  };

  // Image style for top middle - full width of block
  const topMiddleImageStyle: React.CSSProperties = {
    width: 'calc(100% + 80px)',
    height: '200px',
    marginTop: '-40px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '20px',
    marginLeft: '-40px',
    marginRight: '-40px'
  };

  // Bottom right image style
  const bottomRightImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  // Value style - white on blue
  const valueWhiteStyle: React.CSSProperties = {
    fontSize: '48px',
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1.2,
    margin: 0,
    marginBottom: '12px',
    fontFamily: "'Lora', serif"
  };

  // Description style - white on blue
  const descriptionWhiteStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 400,
    color: '#FFFFFF',
    opacity: 0.9,
    width: '55%',
    lineHeight: 1.4,
    margin: 0
  };

  // Value style - black
  const valueBlackStyle: React.CSSProperties = {
    fontSize: '48px',
    fontWeight: 700,
    color: '#09090B',
    lineHeight: 1.2,
    margin: 0,
    marginBottom: '20px',
    fontFamily: "'Lora', serif"
  };

  // Description style - black
  const descriptionBlackStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 400,
    color: '#09090B',
    lineHeight: 1.4,
    margin: 0
  };

  // Title style - white on blue
  const titleWhiteStyle: React.CSSProperties = {
    fontSize: '33px',
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1.2,
    margin: 0,
    marginBottom: '8px',
    fontFamily: "'Lora', serif"
  };

  // Subtitle style - white on blue
  const subtitleWhiteStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 400,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 1.4,
    margin: 0
  };

  // Page number with line - bottom-left (absolute positioned on entire slide)
  const pageNumberContainerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '24px',
    left: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    zIndex: 10
  };

  const pageNumberLineStyle: React.CSSProperties = {
    width: '32px',
    height: '1.5px',
    backgroundColor: 'rgba(255, 255, 255, 0.6)'
  };

  const pageNumberStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 300,
    color: '#FFFFFF',
    fontFamily: currentTheme.fonts.contentFont,
    margin: 0
  };

  // Logo container
  const logoContainer: React.CSSProperties = {
    position: 'absolute',
    top: '30px',
    left: '30px',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

  const handleLogoUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ logoPath: newLogoPath });
    }
  };

  return (
    <div style={slide}>
      {/* Logo */}
      <div style={logoContainer}>
        <YourLogo
          logoPath={logoPath}
          onLogoUploaded={handleLogoUploaded}
          isEditable={isEditable}
          color="#09090B"
          text="Your Logo"
        />
      </div>

      {/* Top Left */}
      <div style={topLeftStyle}>
        <ClickableImagePlaceholder
          imagePath={topLeft.avatarPath}
          onImageUploaded={(path) => onUpdate && onUpdate({ topLeft: { ...topLeft, avatarPath: path } })}
          description="Top left avatar" 
          isEditable={isEditable} 
          style={avatarStyle} 
        />
      </div>

      {/* Top Middle */}
      <div style={topMiddleStyle}>
        <div style={{ marginBottom: '20px', width: 'calc(100% + 80px)', marginLeft: '-40px', marginRight: '-40px', overflow: 'hidden' }}>
          <ClickableImagePlaceholder
            imagePath={topMiddle.imagePath}
            onImageUploaded={(path) => onUpdate && onUpdate({ topMiddle: { ...topMiddle, imagePath: path } })}
            description="Top middle image" 
            isEditable={isEditable} 
            style={topMiddleImageStyle} 
          />
        </div>
        <div style={valueBlackStyle} onClick={() => isEditable && setEditKey('topMiddle-value')}>
          {isEditable && editKey === 'topMiddle-value' ? (
            <ImprovedInlineEditor 
              initialValue={topMiddle.value} 
              onSave={(value) => { 
                onUpdate && onUpdate({ topMiddle: { ...topMiddle, value } }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              style={inline(valueBlackStyle)} 
            />
          ) : (
            topMiddle.value
          )}
        </div>
        <div style={descriptionBlackStyle} onClick={() => isEditable && setEditKey('topMiddle-desc')}>
          {isEditable && editKey === 'topMiddle-desc' ? (
            <ImprovedInlineEditor 
              initialValue={topMiddle.description} 
              multiline={true}
              onSave={(value) => { 
                onUpdate && onUpdate({ topMiddle: { ...topMiddle, description: value } }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              style={inline(descriptionBlackStyle)} 
            />
          ) : (
            topMiddle.description
          )}
        </div>
      </div>

      {/* Top Right */}
      <div style={topRightStyle}>
        <div style={valueWhiteStyle} onClick={() => isEditable && setEditKey('topRight-value')}>
          {isEditable && editKey === 'topRight-value' ? (
            <ImprovedInlineEditor 
              initialValue={topRight.value} 
              onSave={(value) => { 
                onUpdate && onUpdate({ topRight: { ...topRight, value } }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              style={inline(valueWhiteStyle)} 
            />
          ) : (
            topRight.value
          )}
        </div>
        <div style={descriptionWhiteStyle} onClick={() => isEditable && setEditKey('topRight-desc')}>
          {isEditable && editKey === 'topRight-desc' ? (
            <ImprovedInlineEditor 
              initialValue={topRight.description} 
              multiline={true}
              onSave={(value) => { 
                onUpdate && onUpdate({ topRight: { ...topRight, description: value } }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              style={inline(descriptionWhiteStyle)} 
            />
          ) : (
            topRight.description
          )}
        </div>
      </div>

      {/* Bottom Left */}
      <div style={bottomLeftStyle}>
        <div>
          <div style={titleWhiteStyle} onClick={() => isEditable && setEditKey('bottomLeft-title')}>
            {isEditable && editKey === 'bottomLeft-title' ? (
              <ImprovedInlineEditor 
                initialValue={bottomLeft.title} 
                onSave={(value) => { 
                  onUpdate && onUpdate({ bottomLeft: { ...bottomLeft, title: value } }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(titleWhiteStyle)} 
              />
            ) : (
              bottomLeft.title
            )}
          </div>
          <div style={subtitleWhiteStyle} onClick={() => isEditable && setEditKey('bottomLeft-subtitle')}>
            {isEditable && editKey === 'bottomLeft-subtitle' ? (
              <ImprovedInlineEditor 
                initialValue={bottomLeft.subtitle} 
                onSave={(value) => { 
                  onUpdate && onUpdate({ bottomLeft: { ...bottomLeft, subtitle: value } }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(subtitleWhiteStyle)} 
              />
            ) : (
              bottomLeft.subtitle
            )}
          </div>
        </div>
      </div>

      {/* Bottom Middle */}
      <div style={bottomMiddleStyle}>
        <div style={valueBlackStyle} onClick={() => isEditable && setEditKey('bottomMiddle-value')}>
          {isEditable && editKey === 'bottomMiddle-value' ? (
            <ImprovedInlineEditor 
              initialValue={bottomMiddle.value} 
              onSave={(value) => { 
                onUpdate && onUpdate({ bottomMiddle: { ...bottomMiddle, value } }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              style={inline(valueBlackStyle)} 
            />
          ) : (
            bottomMiddle.value
          )}
        </div>
        <div style={descriptionBlackStyle} onClick={() => isEditable && setEditKey('bottomMiddle-desc')}>
          {isEditable && editKey === 'bottomMiddle-desc' ? (
            <ImprovedInlineEditor 
              initialValue={bottomMiddle.description} 
              multiline={true}
              onSave={(value) => { 
                onUpdate && onUpdate({ bottomMiddle: { ...bottomMiddle, description: value } }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              style={inline(descriptionBlackStyle)} 
            />
          ) : (
            bottomMiddle.description
          )}
        </div>
      </div>

      {/* Bottom Right */}
      <div style={bottomRightStyle}>
        <ClickableImagePlaceholder
          imagePath={bottomRight.imagePath}
          onImageUploaded={(path) => onUpdate && onUpdate({ bottomRight: { ...bottomRight, imagePath: path } })}
          description="Bottom right image" 
          isEditable={isEditable} 
          style={bottomRightImageStyle} 
        />
      </div>

      {/* Page number with line - bottom-left (absolute positioned on entire slide) */}
      <div style={pageNumberContainerStyle}>
        <div style={pageNumberLineStyle} />
        <div style={pageNumberStyle} onClick={() => isEditable && setEditKey('bottomLeft-page')}>
          {isEditable && editKey === 'bottomLeft-page' ? (
            <ImprovedInlineEditor 
              initialValue={bottomLeft.pageNumber || ''} 
              onSave={(value) => { 
                onUpdate && onUpdate({ bottomLeft: { ...bottomLeft, pageNumber: value } }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              style={inline(pageNumberStyle)} 
            />
          ) : (
            bottomLeft.pageNumber
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialImpactGridSlideTemplate;

