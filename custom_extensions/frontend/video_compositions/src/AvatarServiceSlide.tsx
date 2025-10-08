import React from 'react';
import { useCurrentFrame, useVideoConfig, OffthreadVideo, staticFile } from 'remotion';

interface ElementPosition {
  x: number;
  y: number;
}

interface AvatarServiceSlideProps {
  title?: string;
  subtitle?: string;
  content?: string;
  theme?: string;
  elementPositions?: Record<string, ElementPosition>;
  slideId?: string;
  avatarVideoPath?: string;  // Changed from avatarImageUrl to avatarVideoPath
  duration?: number;
}

// Theme color definitions - EXACT FRONTEND MATCH
const themes = {
  'dark-purple': {
    bgColor: '#110c35',
    titleColor: '#ffffff',
    subtitleColor: '#d9e1ff',
    contentColor: '#d9e1ff',
    accentColor: '#f35657',
    titleFont: 'Kanit, sans-serif',
    contentFont: 'Martel Sans, sans-serif',
    titleSize: '45px',
    contentSize: '18px'
  },
  'light-modern': {
    bgColor: '#ffffff',
    titleColor: '#1a1a1a',
    subtitleColor: '#6b7280',
    contentColor: '#374151',
    accentColor: '#3b82f6',
    titleFont: 'Inter, sans-serif',
    contentFont: 'Martel Sans, sans-serif',
    titleSize: '36px',
    contentSize: '16px'
  },
  'corporate-blue': {
    bgColor: '#1e3a8a',
    titleColor: '#ffffff',
    subtitleColor: '#bfdbfe',
    contentColor: '#e0e7ff',
    accentColor: '#60a5fa',
    titleFont: 'Roboto, sans-serif',
    contentFont: 'Martel Sans, sans-serif',
    titleSize: '40px',
    contentSize: '16px'
  }
};

// Helper function to convert percentage coordinates to pixels
const convertToPixels = (percentage: number, dimension: number): number => {
  return Math.round((percentage / 100) * dimension);
};

export const AvatarServiceSlide: React.FC<AvatarServiceSlideProps> = ({
  title = '',
  subtitle = '',
  content = '',
  theme = 'dark-purple',
  elementPositions = {},
  slideId = 'default-slide',
  avatarVideoPath = '',
  duration = 30
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTheme = themes[theme as keyof typeof themes] || themes['dark-purple'];

  // Calculate progress for animations
  const progress = Math.min(frame / (duration * fps), 1);

  // Convert element positions from percentage to pixels
  const getElementPosition = (elementId: string, defaultX: number = 0, defaultY: number = 0) => {
    const position = elementPositions[elementId];
    if (!position) {
      return { x: defaultX, y: defaultY };
    }
    
    return {
      x: convertToPixels(position.x, 1920),
      y: convertToPixels(position.y, 1080)
    };
  };

  // Get positions for each element
  const titlePosition = getElementPosition(`draggable-${slideId}-0`, 100, 100);
  const subtitlePosition = getElementPosition(`draggable-${slideId}-1`, 100, 200);
  const contentPosition = getElementPosition(`draggable-${slideId}-2`, 100, 300);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: currentTheme.bgColor,
        fontFamily: currentTheme.contentFont,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '1080px',
        boxSizing: 'border-box'
      }}
    >
      {/* Dark shape in top-left corner */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '600px',
          height: '750px',
          backgroundColor: '#1a1a2e',
          borderRadius: '0 0 450px 0',
          zIndex: 1
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          maxWidth: '1800px',
          gap: '90px',
          position: 'relative',
          zIndex: 2,
          minHeight: '100%',
          boxSizing: 'border-box',
          backgroundColor: 'transparent'
        }}
      >
        {/* Left content */}
        <div
          style={{
            flex: 1,
            textAlign: 'left',
            zIndex: 2,
            position: 'relative',
            paddingLeft: '90px',
            backgroundColor: 'transparent'
          }}
        >
          {/* Title with positioning support */}
          {title && (
            <h1
              style={{
                position: 'absolute',
                left: `${titlePosition.x}px`,
                top: `${titlePosition.y}px`,
                zIndex: 10,
                fontSize: '3.5rem',
                fontFamily: currentTheme.titleFont,
                color: currentTheme.titleColor,
                marginBottom: '32px',
                lineHeight: 1.1,
                wordWrap: 'break-word',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                opacity: progress,
                transform: `translateY(${(1 - progress) * 20}px)`
              }}
            >
              {title}
            </h1>
          )}

          {/* Subtitle with positioning support */}
          {subtitle && (
            <h2
              style={{
                position: 'absolute',
                left: `${subtitlePosition.x}px`,
                top: `${subtitlePosition.y}px`,
                zIndex: 10,
                fontSize: '2.25rem',
                fontFamily: currentTheme.contentFont,
                color: currentTheme.contentColor,
                marginBottom: '32px',
                lineHeight: 1.4,
                wordWrap: 'break-word',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                opacity: progress,
                transform: `translateY(${(1 - progress) * 20}px)`
              }}
            >
              {subtitle}
            </h2>
          )}

          {/* Content with positioning support */}
          {content && (
            <p
              style={{
                position: 'absolute',
                left: `${contentPosition.x}px`,
                top: `${contentPosition.y}px`,
                zIndex: 10,
                fontSize: '1.8rem',
                fontFamily: currentTheme.contentFont,
                color: currentTheme.contentColor,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                opacity: progress,
                transform: `translateY(${(1 - progress) * 20}px)`
              }}
            >
              {content}
            </p>
          )}
        </div>

        {/* Right content - Avatar */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            zIndex: 2,
            position: 'relative',
            height: '100%',
            backgroundColor: 'transparent'
          }}
        >
          {avatarVideoPath && avatarVideoPath !== 'PLACEHOLDER' && (
            <div
              style={{
                width: '935px',
                height: '843px',
                margin: '0 auto',
                position: 'absolute',
                top: '-370px',
                zIndex: 3,
                backgroundColor: 'transparent',
                overflow: 'hidden'
              }}
            >
              <OffthreadVideo
                src={avatarVideoPath}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
                volume={1}
                playbackRate={1}
              />
            </div>
          )}
          {avatarVideoPath === 'PLACEHOLDER' && (
            <div
              style={{
                width: '935px',
                height: '843px',
                margin: '0 auto',
                position: 'absolute',
                top: '-370px',
                zIndex: 3,
                backgroundColor: 'rgba(255, 165, 0, 0.1)',
                border: '2px dashed rgba(255, 165, 0, 0.5)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'rgba(255, 165, 0, 0.7)',
                fontWeight: 'bold'
              }}
            >
              DEBUG MODE
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
