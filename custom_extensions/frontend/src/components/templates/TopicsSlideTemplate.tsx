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
  logoNew?: string;
  pageNumber?: string;
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
  logoNew = '',
  pageNumber = '32',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editKey, setEditKey] = useState<string | null>(null);
  const [_showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  const slide: React.CSSProperties = { 
    width:'100%', 
    aspectRatio:'16/9', 
    backgroundColor:'#E0E7FF', 
    color:'#09090BCC', 
    fontFamily: currentTheme.fonts.titleFont, 
    position:'relative',
    overflow:'hidden'
  };

  // Left section - avatar with dark green background
  const leftSection: React.CSSProperties = {
    position:'absolute',
    left:0,
    top:0,
    width:'45%',
    height:'100%',
    background:'linear-gradient(180deg, #0F58F9 0%, #1023A1 170.85%)',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
  };
//save1
  const avatarContainer: React.CSSProperties = {
    width:'470px',
    position:'absolute',
    bottom:'-25px',
    borderRadius:'16px',
    overflow:'hidden',
  };

  // Right section - topics with black background
  const rightSection: React.CSSProperties = {
    position:'absolute',
    right:0,
    top:'120px',
    width:'55%',
    background:'#E0E7FF',
    padding:'60px 80px',
    display:'flex',
    flexDirection:'column',
    justifyContent:'center'
  };

  // Topics header banner
  const topicsBanner: React.CSSProperties = {
    width:'fit-content',
    borderRadius:'50px',
    border: '1px solid #09090BC',
    marginBottom:'50px',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    padding: '15px 25px'
  };

  const topicsTitleStyle: React.CSSProperties = {
    fontSize:'42px',
    fontWeight:700,
    color:'#09090BCC',
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
    width:'7px',
    height:'8px',
    flexShrink:0
  };

  const topicText: React.CSSProperties = {
    fontSize:'24px',
    fontWeight:400,
    color:'rgba(9, 9, 11, 0.8)',
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

  const handleLogoNewUploaded = (path: string) => {
    onUpdate && onUpdate({ logoNew: path });
    setShowLogoUploadModal(false);
  };

  const handlePageNumberSave = (value: string) => {
    setCurrentPageNumber(value);
    onUpdate && onUpdate({ pageNumber: value });
    setEditingPageNumber(false);
  };

  const handlePageNumberCancel = () => {
    setEditingPageNumber(false);
  };

  return (
    <div className="topics-slide inter-theme" style={slide}>
      <style>{`
        .topics-slide *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .topics-slide .title-element {
          font-family: "Lora", serif !important;
          font-weight: 500 !important;
        }
      `}</style>
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
          <div className="title-element" style={topicsTitleStyle} onClick={() => isEditable && setEditKey('title')}>
            {isEditable && editKey === 'title' ? (
              <ImprovedInlineEditor 
                initialValue={title} 
                onSave={(value) => { 
                  onUpdate && onUpdate({ title: value }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                className="title-element"
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
              <svg width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={bulletPoint}>
                <path d="M6 2.73354C6.66667 3.11844 6.66667 4.08069 6 4.46559L1.5 7.06367C0.833334 7.44857 -3.3649e-08 6.96745 0 6.19765L2.2713e-07 1.00149C2.60779e-07 0.231693 0.833333 -0.249434 1.5 0.135466L6 2.73354Z" fill="#0F58F9"/>
              </svg>
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

      {/* Logo in top-right corner */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '30px'
      }}>
        {logoNew ? (
          <ClickableImagePlaceholder
            imagePath={logoNew}
            onImageUploaded={handleLogoNewUploaded}
            size="SMALL"
            position="CENTER"
            description="Company logo"
            isEditable={isEditable}
            style={{
              height: '30px',
              maxWidth: '120px',
              objectFit: 'contain'
            }}
          />
        ) : (
          <div 
            onClick={() => isEditable && setShowLogoUploadModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isEditable ? 'pointer' : 'default'
            }}
          >
            <div style={{
              width: '30px',
              height: '30px',
              border: '2px solid #09090B',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: '#09090B', position: 'absolute' }} />
              <div style={{ width: '2px', height: '12px', backgroundColor: '#09090B', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 400, color: '#09090B', fontFamily: currentTheme.fonts.contentFont }}>Your Logo</span>
          </div>
        )}
      </div>

      {/* Page number with line in bottom-right */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        right: '0px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={handlePageNumberCancel}
            className="page-number-editor"
            style={{
              color: '#09090B99',
              fontSize: '17px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
              width: '30px',
              height: 'auto'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
              color: '#09090B99',
              fontSize: '17px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentPageNumber}
          </div>
        )}
        {/* Small line */}
        <div style={{
          width: '20px',
          height: '1px',
          backgroundColor: 'rgba(9, 9, 11, 0.6)'
        }} />
      </div>
    </div>
  );
};

export default TopicsSlideTemplate;