// custom_extensions/frontend/src/components/templates/KeySkillsDataAnalysisSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface KeySkillsDataAnalysisProps extends BaseTemplateProps {
  heading: string;
  items: string[]; // 5 items with numbers
  rightPanelColor?: string;
  rightImagePath?: string;
}

export const KeySkillsDataAnalysisSlideTemplate: React.FC<KeySkillsDataAnalysisProps & { theme?: SlideTheme | string }> = ({
  slideId,
  heading = 'Key skills\nfor data analysis:',
  items = [
    'Sorting and filtering data.',
    'Formulas and functions.',
    'Pivot tables.',
    'Data validation.',
    'Charts and graphs.'
  ],
  rightPanelColor = '#20472F',
  rightImagePath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editHeading, setEditHeading] = useState(false);
  const [editItem, setEditItem] = useState<number | null>(null);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#FFFFFF', color:'#26362C', fontFamily: currentTheme.fonts.titleFont, position:'relative', display:'grid', gridTemplateColumns:'1fr 520px', gap:'36px', padding:'56px 56px' };
  const headingStyle: React.CSSProperties = { fontSize:'72px', fontWeight:800, color:'#334D3F', lineHeight:1.05 };
  const list: React.CSSProperties = { marginTop:'28px', display:'grid', rowGap:'22px' };
  const row: React.CSSProperties = { display:'grid', gridTemplateColumns:'48px 1fr', alignItems:'center', columnGap:'18px' };
  const num: React.CSSProperties = { fontSize:'44px', color:'#3E5B4B', fontWeight:700 };
  const text: React.CSSProperties = { fontSize:'28px', color:'#4B6256' };

  const rightWrap: React.CSSProperties = { position:'relative' };
  const panel: React.CSSProperties = { position:'absolute', inset:0, borderRadius:'40px', background:rightPanelColor };
  const image: React.CSSProperties = { position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain' };

  const inlineHeading = { ...headingStyle, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0 } as React.CSSProperties;
  const inlineText = { ...text, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0 } as React.CSSProperties;

  return (
    <div className="key-skills-data-analysis inter-theme" style={slide}>
      <div>
        {isEditable && editHeading ? (
          <ImprovedInlineEditor initialValue={heading} onSave={(v)=>{ onUpdate&&onUpdate({ heading:v }); setEditHeading(false); }} onCancel={()=>setEditHeading(false)} style={inlineHeading} />
        ) : (
          <div onClick={()=> isEditable && setEditHeading(true)} style={{ ...headingStyle, cursor: isEditable ? 'pointer':'default', whiteSpace:'pre-line' }}>{heading}</div>
        )}
        <div style={list}>
          {items.map((it, i)=> (
            <div key={i} style={row}>
              <div style={num}>{String(i+1)}</div>
              <div>
                {isEditable && editItem === i ? (
                  <ImprovedInlineEditor initialValue={it} onSave={(v)=>{ const next=[...items]; next[i]=v; onUpdate&&onUpdate({ items: next }); setEditItem(null); }} onCancel={()=>setEditItem(null)} style={inlineText} />
                ) : (
                  <div onClick={()=> isEditable && setEditItem(i)} style={{ ...text, cursor: isEditable ? 'pointer':'default' }}>{it}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={rightWrap}>
        <div style={panel} />
        <ClickableImagePlaceholder imagePath={rightImagePath} onImageUploaded={(p)=> onUpdate&&onUpdate({ rightImagePath:p })} size="LARGE" position="CENTER" description="Right image" isEditable={isEditable} style={image} />
      </div>
    </div>
  );
};

export default KeySkillsDataAnalysisSlideTemplate;

