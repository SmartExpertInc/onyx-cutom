// custom_extensions/frontend/src/components/templates/DeiMethodsSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import AvatarImageDisplay from '../AvatarImageDisplay';
import YourLogo from '../YourLogo';

export interface DeiMethodsProps extends BaseTemplateProps {
  headerTitle: string;
  section1Title: string;
  section1Lines: string[]; // 2 lines
  section2Title: string;
  section2Lines: string[]; // 2 lines
  avatarPath?: string;
  logoPath?: string;
  logoText?: string;
}

export const DeiMethodsSlideTemplate_old: React.FC<DeiMethodsProps & { theme?: SlideTheme | string }> = ({
  headerTitle = 'Methods to Meet DEI Standards',
  section1Title = 'Diverse Recruitment:',
  section1Lines = [
    'Source candidates from underrepresented groups.',
    'Use blind screening processes to focus on skills and qualifications.'
  ],
  section2Title = 'Mentorship and Sponsorship Programs:',
  section2Lines = [
    'Mentor and sponsor diverse talent.',
    'Create opportunities for growth & advancement.'
  ],
  avatarPath = '',
  logoPath = '',
  logoText = 'Your Logo',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState('16');

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#F0F2F7', color:'#0F172A', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const card: React.CSSProperties = { position:'absolute', left:'44px', right:'44px', top:'44px', bottom:'44px', background:'#FFFFFF', borderRadius:'24px', border:'1px solid #102412' };
  const header: React.CSSProperties = { position:'absolute', left:'0', right:'0', top:'0', height:'40%', background:'linear-gradient(to bottom, #0F58F9, #1023A1)', border:'none' };
  const headerText: React.CSSProperties = { position:'absolute', left:'60px', top:'18%', transform:'translateY(-50%)', fontSize:'46px', fontWeight:600, color:'#FFFFFF', fontFamily:'Lora, serif', zIndex:5, maxWidth:'75%' };
  
  // Content block wrapper
  const contentBlock: React.CSSProperties = { 
    position:'absolute', 
    left:'0', 
    right:'0', 
    top:'38%', 
    bottom:'0', 
    background:'#E0E7FF', 
    border:'none'
  };

  const section1TitleStyle: React.CSSProperties = { position:'absolute', left:'60px', top:'40px', fontSize:'35px', fontWeight:600, color:'black', fontFamily:'Lora, serif' };
  const section1LinesStyle: React.CSSProperties = { position:'absolute', left:'60px', top:'100px', fontSize:'20px', color:'#34353C', lineHeight:1.6, whiteSpace:'pre-line', fontFamily:'Inter, sans-serif' };

  const section2TitleStyle: React.CSSProperties = { position:'absolute', left:'60px', top:'190px', fontSize:'35px', fontWeight:600, color:'black', fontFamily:'Lora, serif' };
  const section2LinesStyle: React.CSSProperties = { position:'absolute', left:'60px', top:'250px', fontSize:'20px', color:'#34353C', lineHeight:1.6, whiteSpace:'pre-line', fontFamily:'Inter, sans-serif' };

  const avatarWrap: React.CSSProperties = { position:'absolute', right:'60px', top:'40px', width:'172px', height:'172px', borderRadius:'50%', overflow:'hidden', background:'#FFFFFF', zIndex:10 };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ ...base, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, whiteSpace:'pre-wrap' });
  
  const inlineEditor = (base: React.CSSProperties): React.CSSProperties => ({ 
    position: 'relative',
    background:'transparent', 
    border:'none', 
    outline:'none', 
    padding:0, 
    margin:0,
    fontSize: base.fontSize,
    fontWeight: base.fontWeight,
    color: base.color,
    lineHeight: base.lineHeight,
    whiteSpace: base.whiteSpace || 'pre-line',
    width: '100%'
  });

  return (
    <>
      <style>{`
        .dei-methods-slide *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .dei-methods-slide .title-element {
          font-family: "Lora", serif !important;
          font-weight: 600 !important;
        }
        .dei-methods-slide-logo * {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      <div className="dei-methods-slide inter-theme" style={slide}>
      {/* Header section */}
      <div style={header} />
      <div style={avatarWrap}>
        <AvatarImageDisplay
          size="MEDIUM"
          position="CENTER"
          style={{
            width: '88%',
            height: '135%',
            borderRadius: '50%',
            position: 'relative',
            bottom: '0px',
            objectFit: 'cover'
          }}
        />
      </div>

      {isEditable && editKey==='headerTitle' ? (
        <ImprovedInlineEditor 
          initialValue={headerTitle} 
          onSave={(v)=>{ onUpdate&&onUpdate({ headerTitle:v }); setEditKey(null); }} 
          onCancel={()=> setEditKey(null)} 
          className="title-element" 
          style={{
            ...headerText,
            background:'transparent', 
            border:'none', 
            outline:'none', 
            padding:0, 
            margin:0, 
            whiteSpace:'pre-wrap'
          }} 
        />
      ) : (
        <div style={headerText}>
          <div className="title-element" onClick={()=> isEditable && setEditKey('headerTitle')} style={{ cursor: isEditable ? 'pointer':'default' }}>{headerTitle}</div>
        </div>
      )}

      {/* Content block wrapper */}
      <div style={contentBlock}>
        <div style={section1TitleStyle}>
          {isEditable && editKey==='s1t' ? (
            <ImprovedInlineEditor 
              initialValue={section1Title} 
              onSave={(v)=>{ onUpdate&&onUpdate({ section1Title:v }); setEditKey(null); }} 
              onCancel={()=> setEditKey(null)} 
              className="title-element" 
              style={inlineEditor(section1TitleStyle)} 
            />
          ) : (
            <div className="title-element" onClick={()=> isEditable && setEditKey('s1t')} style={{ cursor: isEditable ? 'pointer':'default' }}>{section1Title}</div>
          )}
        </div>
        {isEditable && editKey==='s1l' ? (
          <ImprovedInlineEditor 
            initialValue={section1Lines.join('\n')} 
            multiline={true} 
            onSave={(v)=>{ onUpdate&&onUpdate({ section1Lines: v.split('\n') }); setEditKey(null); }} 
            onCancel={()=> setEditKey(null)} 
            style={{
              ...section1LinesStyle,
              background:'transparent', 
              border:'none', 
              outline:'none', 
              padding:0, 
              margin:0, 
              whiteSpace:'pre-line'
            }} 
          />
        ) : (
          <div style={section1LinesStyle}>
            <div onClick={()=> isEditable && setEditKey('s1l')} style={{ cursor: isEditable ? 'pointer':'default' }}>{section1Lines.join('\n')}</div>
          </div>
        )}

        <div style={section2TitleStyle}>
          {isEditable && editKey==='s2t' ? (
            <ImprovedInlineEditor 
              initialValue={section2Title} 
              onSave={(v)=>{ onUpdate&&onUpdate({ section2Title:v }); setEditKey(null); }} 
              onCancel={()=> setEditKey(null)} 
              className="title-element" 
              style={inlineEditor(section2TitleStyle)} 
            />
          ) : (
            <div className="title-element" onClick={()=> isEditable && setEditKey('s2t')} style={{ cursor: isEditable ? 'pointer':'default' }}>{section2Title}</div>
          )}
        </div>
        {isEditable && editKey==='s2l' ? (
          <ImprovedInlineEditor 
            initialValue={section2Lines.join('\n')} 
            multiline={true} 
            onSave={(v)=>{ onUpdate&&onUpdate({ section2Lines: v.split('\n') }); setEditKey(null); }} 
            onCancel={()=> setEditKey(null)} 
            style={{
              ...section2LinesStyle,
              background:'transparent', 
              border:'none', 
              outline:'none', 
              padding:0, 
              margin:0, 
              whiteSpace:'pre-line'
            }} 
          />
        ) : (
          <div style={section2LinesStyle}>
            <div onClick={()=> isEditable && setEditKey('s2l')} style={{ cursor: isEditable ? 'pointer':'default' }}>{section2Lines.join('\n')}</div>
          </div>
        )}
      </div>

      {/* Footer with page number and logo */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '0px',
        fontSize: '16px',
        color: '#333333',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '15px',
          height: '1px',
          backgroundColor: '#5F616D'
        }}></div>
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={(v) => {
              setCurrentPageNumber(v);
              setEditingPageNumber(false);
              onUpdate && onUpdate({ pageNumber: v });
            }}
            onCancel={() => setEditingPageNumber(false)}
            style={{ position: 'relative', background: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0, color: '#333333', fontSize: '16px', fontWeight: 600 }}
          />
        ) : (
          <div onClick={() => isEditable && setEditingPageNumber(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>
            {currentPageNumber}
          </div>
        )}
      </div>
      
      {/* Logo */}
      <div className='dei-methods-slide-logo' style={{ position: 'absolute', bottom: '20px', right: '60px', zIndex: 10 }}>
        <YourLogo
          logoPath={logoPath}
          onLogoUploaded={(p) => onUpdate && onUpdate({ logoPath: p })}
          isEditable={isEditable}
          color="#000000"
          text={logoText}
        />
      </div>
    </div>
    </>
  );
};

export default DeiMethodsSlideTemplate_old;

