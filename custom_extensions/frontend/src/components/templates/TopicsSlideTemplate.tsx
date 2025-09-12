// custom_extensions/frontend/src/components/templates/TopicsSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface TopicsSlideProps extends BaseTemplateProps {
  title: string;
  topics: string[];
  avatarPath?: string;
}

export const TopicsSlideTemplate: React.FC<TopicsSlideProps & { theme?: SlideTheme | string }> = ({
  title = 'Topics',
  topics = [
    'Fixed mindset VS Growth mindset',
    'Growth mindset - Success & Fulfilment',
    'How to develop a growth mindset',
    'Learning from errors'
  ],
  avatarPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editKey, setEditKey] = useState<string | null>(null);

  const slide: React.CSSProperties = { 
    width:'100%', 
    aspectRatio:'16/9', 
    background:'#000000', 
    color:'#FFFFFF', 
    fontFamily: currentTheme.fonts.titleFont, 
    position:'relative',
    borderRadius:'20px',
    overflow:'hidden'
  };

  // Left section - avatar with dark green background
  const leftSection: React.CSSProperties = {
    position:'absolute',
    left:0,
    top:0,
    width:'45%',
    height:'100%',
    background:'#2C6657',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    borderTopRightRadius:'50px',
    borderBottomRightRadius:'50px',
  };

  const avatarContainer: React.CSSProperties = {
    width:'410px',
    position:'absolute',
    bottom:'-30px',
    borderRadius:'16px',
    overflow:'hidden',
  };

  // Right section - topics with black background
  const rightSection: React.CSSProperties = {
    position:'absolute',
    right:0,
    top:0,
    width:'55%',
    height:'100%',
    background:'#000000',
    padding:'60px 80px',
    display:'flex',
    flexDirection:'column',
    justifyContent:'center'
  };

  // Topics header banner
  const topicsBanner: React.CSSProperties = {
    background:'#F2E5B4',
    width:'200px',
    borderRadius:'27px',
    marginBottom:'40px',
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  };

  const topicsTitleStyle: React.CSSProperties = {
    fontSize:'42px',
    fontWeight:700,
    color:'#443F33',
    textAlign:'center'
  };

  // Topics list
  const topicsList: React.CSSProperties = {
    display:'flex',
    flexDirection:'column',
    gap:'24px'
  };

  const topicItem: React.CSSProperties = {
    display:'flex',
    alignItems:'center',
    gap:'16px'
  };

  const bulletPoint: React.CSSProperties = {
    width:'12px',
    height:'12px',
    borderRadius:'50%',
    background:'#F5E6A3',
    flexShrink:0
  };

  const topicText: React.CSSProperties = {
    fontSize:'16px',
    fontWeight:400,
    color:'#C1C1C1',
    lineHeight:1.4
  };

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

  return (
    <div style={slide}>
      {/* Left section - Avatar with dark green background */}
      <div style={leftSection}>
        <div style={avatarContainer}>
          <ClickableImagePlaceholder
            imagePath={avatarPath}
            onImageUploaded={(path) => onUpdate && onUpdate({ avatarPath: path })}
            description="Avatar" 
            isEditable={isEditable} 
            style={{ width:'100%', height:'100%', objectFit:'cover' }} 
          />
        </div>
      </div>

      {/* Right section - Topics */}
      <div style={rightSection}>
        {/* Topics header banner */}
        <div style={topicsBanner}>
          <div style={topicsTitleStyle} onClick={() => isEditable && setEditKey('title')}>
            {isEditable && editKey === 'title' ? (
              <ImprovedInlineEditor 
                initialValue={title} 
                onSave={(value) => { 
                  onUpdate && onUpdate({ title: value }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(topicsTitleStyle)} 
              />
            ) : (
              title
            )}
          </div>
        </div>

        {/* Topics list */}
        <div style={topicsList}>
          {topics.map((topic, index) => (
            <div key={index} style={topicItem}>
              <div style={bulletPoint} />
              <div 
                style={topicText} 
                onClick={() => isEditable && setEditKey(`topic-${index}`)}
              >
                {isEditable && editKey === `topic-${index}` ? (
                  <ImprovedInlineEditor 
                    initialValue={topic} 
                    onSave={(value) => { 
                      const newTopics = [...topics];
                      newTopics[index] = value;
                      onUpdate && onUpdate({ topics: newTopics }); 
                      setEditKey(null); 
                    }} 
                    onCancel={() => setEditKey(null)} 
                    style={inline(topicText)} 
                  />
                ) : (
                  topic
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicsSlideTemplate;