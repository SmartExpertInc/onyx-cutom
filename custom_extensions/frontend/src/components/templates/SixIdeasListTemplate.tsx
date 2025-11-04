import React, { useState, useRef, useEffect } from 'react';
import { SixIdeasListTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

const SixIdeasListTemplate: React.FC<SixIdeasListTemplateProps> = ({
  title = 'SIX DIFFERENT IDEAS',
  ideas = [
    { number: '01', text: 'Mercury is the smallest planet in the Solar System' },
    { number: '02', text: 'Venus is the second planet from the Sun' },
    { number: '03', text: 'Despite being red, Mars is actually a cold place' },
    { number: '04', text: 'Jupiter is the biggest planet in the Solar System' },
    { number: '05', text: 'Saturn is composed of hydrogen and helium' },
    { number: '06', text: 'Neptune is the farthest planet from the Sun' }
  ],
  imageUrl,
  imageAlt,
  imagePrompt,
  imagePath,
  titleColor,
  textColor,
  backgroundColor,
  slideId,
  theme,
  isEditable = false,
  onUpdate
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const tColor = titleColor || currentTheme.colors.titleColor;
  const txtColor = '#FFFFFF'; // Always use white for six-ideas text as per user requirement
  const bgColor = backgroundColor || currentTheme.colors.backgroundColor;

  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingIdeas, setEditingIdeas] = useState<{ [key: number]: { number: boolean; text: boolean } }>({});

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleIdeaSave = (index: number, field: 'number' | 'text', value: string) => {
    if (onUpdate) {
      const updatedIdeas = [...ideas];
      updatedIdeas[index] = { ...updatedIdeas[index], [field]: value };
      onUpdate({ ideas: updatedIdeas });
    }
    setEditingIdeas(prev => ({ 
      ...prev, 
      [index]: { ...prev[index], [field]: false } 
    }));
  };

  const handleIdeaCancel = (index: number, field: 'number' | 'text') => {
    setEditingIdeas(prev => ({ 
      ...prev, 
      [index]: { ...prev[index], [field]: false } 
    }));
  };

  const handleIdeaEdit = (index: number, field: 'number' | 'text') => {
    if (!isEditable) return;
    setEditingIdeas(prev => ({ 
      ...prev, 
      [index]: { ...prev[index], [field]: true } 
    }));
  };

  const handleImageUpload = (newImageUrl: string) => {
    if (onUpdate) {
      onUpdate({ imageUrl: newImageUrl });
    }
  };

  return (
    <div
      style={{
        background: bgColor,
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: currentTheme.fonts.contentFont,
        position: 'relative',
        padding: '40px',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Section - Text Content */}
      <div style={{ 
        flex: '0 0 auto',
        padding: '30px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {isEditable && editingTitle ? (
            <WysiwygEditor
              initialValue={title}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              placeholder="Enter title..."
              className="inline-editor-title"
              style={{
                fontWeight: 700,
                fontSize: currentTheme.fonts.titleSize,
                color: tColor,
                textAlign: 'center',
                width: '100%',
                fontFamily: currentTheme.fonts.titleFont,
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block',
                lineHeight: '1.2'
              }}
            />
          ) : (
            <div
              style={{
                fontWeight: 700,
                fontSize: currentTheme.fonts.titleSize,
                color: tColor,
                textAlign: 'center',
                cursor: isEditable ? 'pointer' : 'default',
                fontFamily: currentTheme.fonts.titleFont
              }}
              onClick={() => isEditable && setEditingTitle(true)}
              className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              dangerouslySetInnerHTML={{ __html: title || (isEditable ? 'Click to add title' : '') }}
            />
          )}
        </div>

        {/* Ideas Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '30px'
        }}>
          {(ideas || []).filter(idea => idea !== null && idea !== undefined).map((idea, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}>
              {/* Number and Line */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
                width: '100%'
              }}>
                {isEditable && editingIdeas[index]?.number ? (
                  <WysiwygEditor
                    initialValue={idea.number}
                    onSave={(value) => handleIdeaSave(index, 'number', value)}
                    onCancel={() => handleIdeaCancel(index, 'number')}
                    placeholder="01"
                    className="inline-editor-idea-number"
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: tColor,
                      marginRight: '12px',
                      fontFamily: currentTheme.fonts.titleFont,
                      width: 'auto',
                      minWidth: '40px',
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      boxSizing: 'border-box',
                      display: 'block',
                      lineHeight: '1.2'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: tColor,
                      marginRight: '12px',
                      fontFamily: currentTheme.fonts.titleFont,
                      cursor: isEditable ? 'pointer' : 'default'
                    }}
                    onClick={() => handleIdeaEdit(index, 'number')}
                    className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                    dangerouslySetInnerHTML={{ __html: idea.number || (isEditable ? '01' : '') }}
                  />
                )}
                <div style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: tColor
                }} />
              </div>
              
              {/* Text */}
              {isEditable && editingIdeas[index]?.text ? (
                <WysiwygEditor
                  initialValue={idea.text}
                  onSave={(value) => handleIdeaSave(index, 'text', value)}
                  onCancel={() => handleIdeaCancel(index, 'text')}
                  placeholder="Click to add text"
                  className="inline-editor-idea-text"
                  style={{
                    fontSize: currentTheme.fonts.contentSize,
                    color: txtColor,
                    lineHeight: '1.4',
                    fontFamily: currentTheme.fonts.contentFont,
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block'
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: currentTheme.fonts.contentSize,
                    color: txtColor,
                    lineHeight: '1.4',
                    fontFamily: currentTheme.fonts.contentFont,
                    cursor: isEditable ? 'pointer' : 'default',
                    minHeight: '1.4em'
                  }}
                  onClick={() => handleIdeaEdit(index, 'text')}
                  className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                  dangerouslySetInnerHTML={{ __html: idea.text || (isEditable ? 'Click to add text' : '') }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section - Image */}
      <div style={{
        flex: '1 1 auto',
        width: '100%',
        height: '500px',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <ClickableImagePlaceholder
          imagePath={imageUrl}
          onImageUploaded={handleImageUpload}
          size="LARGE"
          position="CENTER"
          description="Click to upload image"
          prompt={imagePrompt || imageAlt || 'relevant illustration for the ideas'}
          isEditable={isEditable}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '8px'
          }}
        />
      </div>
    </div>
  );
};

export default SixIdeasListTemplate; 