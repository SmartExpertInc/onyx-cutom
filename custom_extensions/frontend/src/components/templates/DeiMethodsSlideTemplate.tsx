// custom_extensions/frontend/src/components/templates/DeiMethodsSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface DeiMethodsProps extends BaseTemplateProps {
  headerTitle: string;
  section1Title: string;
  section1Lines: string[]; // 2 lines
  section2Title: string;
  section2Lines: string[]; // 2 lines
  avatarPath?: string;
}

export const DeiMethodsSlideTemplate: React.FC<DeiMethodsProps & { theme?: SlideTheme | string }> = ({
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
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editKey, setEditKey] = useState<string | null>(null);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#F6F6F2', color:'#0F172A', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const card: React.CSSProperties = { position:'absolute', left:'44px', right:'44px', top:'44px', bottom:'44px', background:'#FFFFFF', borderRadius:'24px', border:'1px solid #102412' };
  const header: React.CSSProperties = { position:'absolute', left:'44px', right:'44px', top:'44px', height:'160px', background:'#6CDC78', border:'1px solid #102412', borderBottom:'none', borderTopLeftRadius:'24px', borderTopRightRadius:'24px', borderBottomLeftRadius:'0', borderBottomRightRadius:'0' };
  const headerText: React.CSSProperties = { position:'absolute', left:'80px', top:'84px', fontSize:'42px', fontWeight:800, color:'#102412' };
  
  // Content block wrapper with top radius
  const contentBlock: React.CSSProperties = { 
    position:'absolute', 
    left:'44px', 
    right:'44px', 
    top:'188px', 
    bottom:'44px', 
    background:'#FFFFFF', 
    borderTopLeftRadius:'24px', 
    borderTopRightRadius:'24px', 
    borderBottomLeftRadius:'24px', 
    borderBottomRightRadius:'24px', 
    border:'1px solid #102412', 
    borderTop:'none' 
  };

  const section1TitleStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'45px', fontSize:'40px', fontWeight:800, color:'#1E1E1C' };
  const section1LinesStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'115px', fontSize:'17px', color:'#454441', lineHeight:1.6, whiteSpace:'pre-line' };

  const section2TitleStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'200px', fontSize:'40px', fontWeight:800, color:'#1E1E1C' };
  const section2LinesStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'270px', fontSize:'17px', color:'#595854', lineHeight:1.6, whiteSpace:'pre-line' };

  const avatarWrap: React.CSSProperties = { position:'absolute', right:'72px', top:'72px', width:'170px', height:'170px', borderRadius:'50%', overflow:'hidden', background:'#C7D6FF', zIndex:2 };
  const ring1: React.CSSProperties = { position:'absolute', right:'115px', top:'72px', width:'220px', height:'220px', borderRadius:'50%', border:'1px solid #111111', background:'transparent', zIndex:3 };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ ...base, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, whiteSpace:'pre-wrap' });

  return (
    <div className="dei-methods-slide inter-theme" style={slide}>
      <div style={card} />
      <div style={header} />
      <div style={ring1} />
      <div style={avatarWrap}>
        <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      </div>

      <div style={headerText}>
        {isEditable && editKey==='headerTitle' ? (
          <ImprovedInlineEditor initialValue={headerTitle} onSave={(v)=>{ onUpdate&&onUpdate({ headerTitle:v }); setEditKey(null); }} onCancel={()=> setEditKey(null)} style={inline(headerText)} />
        ) : (
          <div onClick={()=> isEditable && setEditKey('headerTitle')} style={{ cursor: isEditable ? 'pointer':'default' }}>{headerTitle}</div>
        )}
      </div>

      {/* Content block wrapper */}
      <div style={contentBlock}>
        <div style={section1TitleStyle}>
          {isEditable && editKey==='s1t' ? (
            <ImprovedInlineEditor initialValue={section1Title} onSave={(v)=>{ onUpdate&&onUpdate({ section1Title:v }); setEditKey(null); }} onCancel={()=> setEditKey(null)} style={inline(section1TitleStyle)} />
          ) : (
            <div onClick={()=> isEditable && setEditKey('s1t')} style={{ cursor: isEditable ? 'pointer':'default' }}>{section1Title}</div>
          )}
        </div>
        <div style={section1LinesStyle}>
          {isEditable && editKey==='s1l' ? (
            <ImprovedInlineEditor initialValue={section1Lines.join('\n')} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ section1Lines: v.split('\n') }); setEditKey(null); }} onCancel={()=> setEditKey(null)} style={inline(section1LinesStyle)} />
          ) : (
            <div onClick={()=> isEditable && setEditKey('s1l')} style={{ cursor: isEditable ? 'pointer':'default' }}>{section1Lines.join('\n')}</div>
          )}
        </div>

        <div style={section2TitleStyle}>
          {isEditable && editKey==='s2t' ? (
            <ImprovedInlineEditor initialValue={section2Title} onSave={(v)=>{ onUpdate&&onUpdate({ section2Title:v }); setEditKey(null); }} onCancel={()=> setEditKey(null)} style={inline(section2TitleStyle)} />
          ) : (
            <div onClick={()=> isEditable && setEditKey('s2t')} style={{ cursor: isEditable ? 'pointer':'default' }}>{section2Title}</div>
          )}
        </div>
        <div style={section2LinesStyle}>
          {isEditable && editKey==='s2l' ? (
            <ImprovedInlineEditor initialValue={section2Lines.join('\n')} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ section2Lines: v.split('\n') }); setEditKey(null); }} onCancel={()=> setEditKey(null)} style={inline(section2LinesStyle)} />
          ) : (
            <div onClick={()=> isEditable && setEditKey('s2l')} style={{ cursor: isEditable ? 'pointer':'default' }}>{section2Lines.join('\n')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeiMethodsSlideTemplate;

