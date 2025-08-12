// components/positioning/ItemRenderer.tsx
// Renders different types of positionable items

'use client';

import React from 'react';
import { PositionableItem } from '@/types/positioning';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

interface ItemRendererProps {
  item: PositionableItem;
  theme?: SlideTheme;
  isEditing?: boolean;
  onContentChange?: (itemId: string, newContent: any) => void;
}

export const ItemRenderer: React.FC<ItemRendererProps> = ({
  item,
  theme,
  isEditing = false,
  onContentChange
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);

  const handleContentEdit = (newContent: any) => {
    if (onContentChange) {
      onContentChange(item.id, newContent);
    }
  };

  switch (item.type) {
    case 'text':
      return <TextItemRenderer item={item} theme={currentTheme} isEditing={isEditing} onContentChange={handleContentEdit} />;
    
    case 'image':
      return <ImageItemRenderer item={item} theme={currentTheme} isEditing={isEditing} onContentChange={handleContentEdit} />;
    
    case 'bullet-list':
      return <BulletListItemRenderer item={item} theme={currentTheme} isEditing={isEditing} onContentChange={handleContentEdit} />;
    
    case 'shape':
      return <ShapeItemRenderer item={item} theme={currentTheme} />;
    
    case 'container':
      return <ContainerItemRenderer item={item} theme={currentTheme} isEditing={isEditing} onContentChange={handleContentEdit} />;
    
    default:
      return <DefaultItemRenderer item={item} theme={currentTheme} />;
  }
};

// === TEXT ITEM RENDERER ===

interface TextItemRendererProps {
  item: PositionableItem;
  theme: SlideTheme;
  isEditing: boolean;
  onContentChange: (newContent: any) => void;
}

const TextItemRenderer: React.FC<TextItemRendererProps> = ({
  item,
  theme,
  isEditing,
  onContentChange
}) => {
  const { text, style } = item.content;
  const isHeading = style === 'heading';

  const textStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: isHeading ? '8px 12px' : '12px',
    fontSize: isHeading ? theme.fonts.titleSize : theme.fonts.contentSize,
    fontFamily: isHeading ? theme.fonts.titleFont : theme.fonts.contentFont,
    color: isHeading ? theme.colors.titleColor : theme.colors.contentColor,
    lineHeight: isHeading ? '1.2' : '1.6',
    wordWrap: 'break-word',
    overflow: 'hidden',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    resize: 'none'
  };

  if (isEditing) {
    return (
      <textarea
        value={text}
        onChange={(e) => onContentChange({ ...item.content, text: e.target.value })}
        style={textStyle}
        className="w-full h-full resize-none"
        placeholder={isHeading ? "Enter heading..." : "Enter text..."}
      />
    );
  }

  if (isHeading) {
    return (
      <h1 style={textStyle} className="flex items-center">
        {text || 'Heading'}
      </h1>
    );
  }

  return (
    <div style={textStyle} className="whitespace-pre-wrap">
      {text || 'Text content'}
    </div>
  );
};

// === IMAGE ITEM RENDERER ===

interface ImageItemRendererProps {
  item: PositionableItem;
  theme: SlideTheme;
  isEditing: boolean;
  onContentChange: (newContent: any) => void;
}

const ImageItemRenderer: React.FC<ImageItemRendererProps> = ({
  item,
  theme,
  isEditing,
  onContentChange
}) => {
  const { imagePath, prompt, alt } = item.content;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    border: '2px dashed #dee2e6',
    borderRadius: '8px',
    position: 'relative'
  };

  if (imagePath) {
    return (
      <div style={containerStyle}>
        <img
          src={imagePath}
          alt={alt || 'Image'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '6px'
          }}
        />
        {isEditing && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            Click to change
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div className="text-center p-4">
        <div className="text-gray-500 mb-2">📷</div>
        <div className="text-sm text-gray-600">
          {prompt || 'Image placeholder'}
        </div>
        {isEditing && (
          <button
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            onClick={() => {
              // This would trigger image upload/generation
              console.log('Upload image for item:', item.id);
            }}
          >
            Add Image
          </button>
        )}
      </div>
    </div>
  );
};

// === BULLET LIST ITEM RENDERER ===

interface BulletListItemRendererProps {
  item: PositionableItem;
  theme: SlideTheme;
  isEditing: boolean;
  onContentChange: (newContent: any) => void;
}

const BulletListItemRenderer: React.FC<BulletListItemRendererProps> = ({
  item,
  theme,
  isEditing,
  onContentChange
}) => {
  const { bullets, listType, bulletStyle } = item.content;

  const listStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    padding: '12px',
    margin: 0,
    fontSize: theme.fonts.contentSize,
    fontFamily: theme.fonts.contentFont,
    color: theme.colors.contentColor,
    lineHeight: '1.6'
  };

  const getBulletSymbol = (index: number) => {
    switch (bulletStyle) {
      case 'arrow': return '→';
      case 'check': return '✓';
      case 'star': return '★';
      case 'number': return `${index + 1}.`;
      default: return '•';
    }
  };

  const getBulletColor = () => {
    switch (listType) {
      case 'challenge': return '#dc3545';
      case 'solution': return '#28a745';
      default: return theme.colors.contentColor;
    }
  };

  if (isEditing) {
    return (
      <div style={listStyle}>
        {bullets.map((bullet: string, index: number) => (
          <div key={index} className="flex items-start mb-2">
            <span 
              style={{ color: getBulletColor() }}
              className="mr-2 mt-1 font-bold"
            >
              {getBulletSymbol(index)}
            </span>
            <input
              type="text"
              value={bullet}
              onChange={(e) => {
                const newBullets = [...bullets];
                newBullets[index] = e.target.value;
                onContentChange({ ...item.content, bullets: newBullets });
              }}
              className="flex-1 bg-transparent border-none outline-none"
              placeholder="Enter bullet point..."
            />
          </div>
        ))}
        <button
          onClick={() => {
            const newBullets = [...bullets, 'New bullet point'];
            onContentChange({ ...item.content, bullets: newBullets });
          }}
          className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
        >
          + Add Bullet
        </button>
      </div>
    );
  }

  return (
    <div style={listStyle}>
      {bullets.map((bullet: string, index: number) => (
        <div key={index} className="flex items-start mb-2">
          <span 
            style={{ color: getBulletColor() }}
            className="mr-2 mt-1 font-bold"
          >
            {getBulletSymbol(index)}
          </span>
          <span className="flex-1">{bullet}</span>
        </div>
      ))}
    </div>
  );
};

// === SHAPE ITEM RENDERER ===

interface ShapeItemRendererProps {
  item: PositionableItem;
  theme: SlideTheme;
}

const ShapeItemRenderer: React.FC<ShapeItemRendererProps> = ({
  item,
  theme
}) => {
  const { shapeType, fillColor, strokeColor, strokeWidth } = item.content;

  const shapeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: fillColor || theme.colors.accentColor,
    border: `${strokeWidth || 2}px solid ${strokeColor || theme.colors.titleColor}`,
    borderRadius: shapeType === 'circle' ? '50%' : 
                  shapeType === 'rounded-rect' ? '12px' : '0'
  };

  switch (shapeType) {
    case 'line':
      return (
        <div
          style={{
            width: '100%',
            height: strokeWidth || 2,
            backgroundColor: strokeColor || theme.colors.titleColor,
            margin: `${(item.position.height - (strokeWidth || 2)) / 2}px 0`
          }}
        />
      );
    
    case 'triangle':
      return (
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${item.position.width / 2}px solid transparent`,
            borderRight: `${item.position.width / 2}px solid transparent`,
            borderBottom: `${item.position.height}px solid ${fillColor || theme.colors.accentColor}`,
            margin: '0 auto'
          }}
        />
      );
    
    case 'pyramid':
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <polygon
            points="50,10 20,90 80,90"
            fill={fillColor || theme.colors.accentColor}
            stroke={strokeColor || theme.colors.titleColor}
            strokeWidth={strokeWidth || 2}
          />
        </svg>
      );
    
    case 'accent':
      return (
        <div
          style={{
            ...shapeStyle,
            background: `linear-gradient(45deg, ${fillColor || theme.colors.accentColor}, ${strokeColor || theme.colors.titleColor})`
          }}
        />
      );
    
    default:
      return <div style={shapeStyle} />;
  }
};

// === CONTAINER ITEM RENDERER ===

interface ContainerItemRendererProps {
  item: PositionableItem;
  theme: SlideTheme;
  isEditing: boolean;
  onContentChange: (newContent: any) => void;
}

const ContainerItemRenderer: React.FC<ContainerItemRendererProps> = ({
  item,
  theme,
  isEditing,
  onContentChange
}) => {
  const { type } = item.content;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  };

  switch (type) {
    case 'big-number':
      return (
        <div style={containerStyle}>
          <div 
            style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              color: theme.colors.accentColor,
              marginBottom: '8px'
            }}
          >
            {item.content.value}
          </div>
          <div 
            style={{ 
              fontSize: theme.fonts.contentSize, 
              fontWeight: 'bold',
              color: theme.colors.titleColor,
              marginBottom: '4px'
            }}
          >
            {item.content.label}
          </div>
          <div 
            style={{ 
              fontSize: '0.9rem', 
              color: theme.colors.contentColor
            }}
          >
            {item.content.description}
          </div>
        </div>
      );

    case 'pyramid-item':
      return (
        <div style={containerStyle}>
          <div 
            style={{ 
              fontSize: theme.fonts.titleSize, 
              fontWeight: 'bold',
              color: theme.colors.titleColor,
              marginBottom: '8px'
            }}
          >
            {item.content.heading}
          </div>
          <div 
            style={{ 
              fontSize: theme.fonts.contentSize, 
              color: theme.colors.contentColor
            }}
          >
            {item.content.description}
          </div>
        </div>
      );

    case 'timeline-item':
      return (
        <div style={containerStyle}>
          <div className="w-4 h-4 bg-blue-500 rounded-full mb-2"></div>
          <div 
            style={{ 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              color: theme.colors.titleColor,
              marginBottom: '4px'
            }}
          >
            {item.content.heading}
          </div>
          <div 
            style={{ 
              fontSize: '0.9rem', 
              color: theme.colors.contentColor
            }}
          >
            {item.content.description}
          </div>
        </div>
      );

    default:
      return (
        <div style={containerStyle}>
          <div>Container: {type}</div>
          <div className="text-xs text-gray-500 mt-2">
            {JSON.stringify(item.content, null, 2)}
          </div>
        </div>
      );
  }
};

// === DEFAULT ITEM RENDERER ===

interface DefaultItemRendererProps {
  item: PositionableItem;
  theme: SlideTheme;
}

const DefaultItemRenderer: React.FC<DefaultItemRendererProps> = ({
  item,
  theme
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        border: '2px dashed #dee2e6',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: theme.fonts.contentSize,
        color: theme.colors.contentColor
      }}
    >
      <div className="text-center">
        <div>Unknown Item Type</div>
        <div className="text-sm text-gray-500 mt-1">{item.type}</div>
      </div>
    </div>
  );
};

export default ItemRenderer;
