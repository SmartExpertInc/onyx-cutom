// custom_extensions/frontend/src/components/templates/PainPointsSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface PainPointItem { text: string; }

export interface PainPointsSlideProps extends BaseTemplateProps {
  heading?: string;
  badge?: string;
  items: PainPointItem[]; // 3 items
  rightPanelColor?: string;
  rightImagePath?: string;
  rightImageAlt?: string;
}

export const PainPointsSlideTemplate: React.FC<PainPointsSlideProps & { theme?: SlideTheme | string }> = ({
  slideId,
  heading = 'Common Pain Points',
  badge = 'Pain Points',
  items = [
    { text: 'Hindered career progression and access to valuable resources.' },
    { text: 'Strained communication and reduced effectiveness.' },
    { text: 'Missed opportunities for collaboration and growth.' }
  ],
  rightPanelColor = '#138a79',
  rightImagePath = '',
  rightImageAlt = 'Right image',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingHeading, setEditingHeading] = useState(false);
  const [editingBadge, setEditingBadge] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);

  // Base slide (very dark background, like screenshot)
  const slide: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#0C0F13',
    color: '#D6FFF6',
    fontFamily: currentTheme.fonts.titleFont,
    position: 'relative',
    padding: '60px 56px 56px 56px',
    display: 'grid',
    gridTemplateColumns: '1.08fr 0.92fr',
    columnGap: '48px'
  };

  // Top pill and heading
  const badgeWrap: React.CSSProperties = { display:'flex', justifyContent:'center' };
  const badgeStyle: React.CSSProperties = {
    border:'2px solid #22D3B6',
    color:'#22D3B6',
    borderRadius:'999px',
    padding:'14px 36px',
    fontSize:'22px',
    letterSpacing:0.3,
    boxShadow:'0 0 0 1px rgba(34,211,182,0.15) inset'
  };
  const headingStyle: React.CSSProperties = { textAlign:'center', fontSize:'72px', fontWeight:800, color:'#22D3B6', margin:'22px 0 36px', lineHeight:1.05 };

  // Left list
  const leftList: React.CSSProperties = { display:'flex', flexDirection:'column', gap:'46px', paddingLeft:'8px', marginTop:'6px' };
  const itemRow: React.CSSProperties = { display:'grid', gridTemplateColumns:'56px 1fr', gap:'20px', alignItems:'start' };
  const iconBox: React.CSSProperties = {
    width:'56px', height:'56px', borderRadius:'12px',
    border:'2px solid rgba(34,211,182,0.5)',
    background:'rgba(34,211,182,0.06)',
    display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#22D3B6',
    boxShadow:'0 6px 18px rgba(0,0,0,0.35), 0 0 0 1px rgba(34,211,182,0.12) inset'
  };
  const itemText: React.CSSProperties = { fontSize:'30px', fontWeight:700, color:'#E3EAE8', lineHeight:1.25, maxWidth:'760px' };

  // Right panel and image
  const rightWrap: React.CSSProperties = { position:'relative', width:'100%', height:'100%', display:'flex', alignItems:'center' };
  const rightPanel: React.CSSProperties = {
    position:'absolute', right:'6px', top:'120px', bottom:'72px', left:'6px',
    backgroundColor:rightPanelColor,
    borderRadius:'24px',
    boxShadow:'0 14px 30px rgba(0,0,0,0.45)'
  };
  const rightPanelBorder: React.CSSProperties = { position:'absolute', right:'0', top:'100px', bottom:'56px', left:'0', borderRadius:'28px', boxShadow:'0 0 0 3px rgba(34,211,182,0.55) inset', pointerEvents:'none' };
  const rightImageStyle: React.CSSProperties = { position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain' };

  const inlineHeading: React.CSSProperties = { ...headingStyle, position:'relative', background:'transparent', border:'none', padding:0, margin:0 };
  const inlineBadge: React.CSSProperties = { ...badgeStyle, position:'relative', background:'transparent', border:'2px solid #2ad2b5', padding:'12px 28px', margin:0 };
  const inlineItem: React.CSSProperties = { ...itemText, position:'relative', background:'transparent', border:'none', padding:0, margin:0 };

  return (
    <div className="pain-points-slide inter-theme" style={slide}>
      <div>
        <div style={badgeWrap}>
          {isEditable && editingBadge ? (
            <ImprovedInlineEditor initialValue={badge} onSave={(v)=>{ onUpdate&&onUpdate({ badge:v }); setEditingBadge(false); }} onCancel={()=>setEditingBadge(false)} style={inlineBadge} />
          ) : (
            <div onClick={()=> isEditable && setEditingBadge(true)} style={{ ...badgeStyle, cursor: isEditable ? 'pointer':'default' }}>{badge}</div>
          )}
        </div>
        <div>
          {isEditable && editingHeading ? (
            <ImprovedInlineEditor initialValue={heading} onSave={(v)=>{ onUpdate&&onUpdate({ heading:v }); setEditingHeading(false); }} onCancel={()=>setEditingHeading(false)} style={inlineHeading} />
          ) : (
            <div onClick={()=> isEditable && setEditingHeading(true)} style={{ ...headingStyle, cursor: isEditable ? 'pointer':'default' }}>{heading}</div>
          )}
        </div>

        <div style={leftList}>
          {items.map((it, i)=> (
            <div key={i} style={itemRow}>
              <div style={iconBox}>
                {/* small icons */}
                {i===0 && (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 3h12v18H6z" stroke="#2ad2b5" strokeWidth="2"/></svg>
                )}
                {i===1 && (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#2ad2b5" strokeWidth="2"/><path d="M8 12h8" stroke="#2ad2b5" strokeWidth="2"/></svg>
                )}
                {i===2 && (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M12 5l-5 5M12 5l5 5" stroke="#2ad2b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
              <div>
                {isEditable && editingItem === i ? (
                  <ImprovedInlineEditor initialValue={it.text} onSave={(v)=>{ const next=[...items]; next[i]={ text:v }; onUpdate&&onUpdate({ items: next }); setEditingItem(null); }} onCancel={()=>setEditingItem(null)} style={inlineItem} />
                ) : (
                  <div onClick={()=> isEditable && setEditingItem(i)} style={{ ...itemText, cursor: isEditable ? 'pointer':'default' }}>{it.text}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={rightWrap}>
        <div style={rightPanel} />
        <div style={rightPanelBorder} />
        <ClickableImagePlaceholder
          imagePath={rightImagePath}
          onImageUploaded={(p)=> onUpdate && onUpdate({ rightImagePath: p })}
          size="LARGE"
          position="CENTER"
          description="Right image"
          isEditable={isEditable}
          style={rightImageStyle}
        />
      </div>
    </div>
  );
};

export default PainPointsSlideTemplate;

