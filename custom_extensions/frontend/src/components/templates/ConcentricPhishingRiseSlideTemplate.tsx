// custom_extensions/frontend/src/components/templates/ConcentricPhishingRiseSlideTemplate.tsx

import React, { useState } from 'react';
import { ConcentricPhishingRiseSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export const ConcentricPhishingRiseSlideTemplate: React.FC<ConcentricPhishingRiseSlideProps & { theme?: SlideTheme | string }> = ({
  slideId,
  title = 'Phishing rise',
  description = "This has become a growing threat in the world of today, and in 2o16 they hit a 12-year high. Tara Seals' US North America News Reporter, Infosecurity Magazine noted that they Anti-Phishing Working Group documented a 250% increase in phishing sites between October 2015 and March 2016. There has also been a noted that 93% of phishing emails are now ransomware.",
  bigLabel = '564$',
  mediumLabel = '321$',
  smallLabel = '128$',
  actorImagePath = '',
  actorImageAlt = 'Actor',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', position:'relative', background:'#ffffff', fontFamily: currentTheme.fonts.titleFont };

  const rightText: React.CSSProperties = { position:'absolute', right:'96px', top:'140px', width:'520px' };
  const titleStyle: React.CSSProperties = { fontSize:'64px', fontWeight:800, color:'#151515', letterSpacing:'-0.5px' };
  const descStyle: React.CSSProperties = { marginTop:'12px', color:'#8C8C8C', fontSize:'16px', lineHeight:1.6 };

  const circles: React.CSSProperties = { position:'absolute', left:'-160px', top:'-120px', width:'1000px', height:'1000px' };
  const actorHolder: React.CSSProperties = { position:'absolute', right:'96px', bottom:'72px', width:'180px', height:'180px', borderRadius:'50%', overflow:'hidden', background:'#111' };

  return (
    <div className="concentric-phishing-rise-slide inter-theme" style={slide}>
      {/* Concentric circles */}
      <svg viewBox="0 0 1000 1000" style={circles}>
        <circle cx="500" cy="500" r="460" fill="#fff" stroke="#111" strokeWidth="2" />
        <circle cx="500" cy="640" r="320" fill="#0a0a0a" stroke="#0a0a0a" strokeWidth="2" />
        <circle cx="500" cy="860" r="140" fill="#fff" stroke="#fff" strokeWidth="2" />
        {/* Labels */}
        <text x="280" y="320" fill="#151515" fontSize="120" fontWeight="800">{bigLabel}</text>
        <text x="390" y="640" fill="#ffffff" fontSize="84" fontWeight="800">{mediumLabel}</text>
        <text x="450" y="880" fill="#151515" fontSize="56" fontWeight="800">{smallLabel}</text>
      </svg>

      {/* Right section */}
      <div style={rightText}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor initialValue={title} onSave={(v)=>{onUpdate&&onUpdate({title:v});setEditingTitle(false);}} onCancel={()=>setEditingTitle(false)} style={{...titleStyle}} />
        ) : (
          <div onClick={()=>isEditable&&setEditingTitle(true)} style={{cursor:isEditable?'pointer':'default', ...titleStyle}}>{title}</div>
        )}

        {isEditable && editingDesc ? (
          <ImprovedInlineEditor initialValue={description} multiline={true} onSave={(v)=>{onUpdate&&onUpdate({description:v});setEditingDesc(false);}} onCancel={()=>setEditingDesc(false)} style={{...descStyle}} />
        ) : (
          <div onClick={()=>isEditable&&setEditingDesc(true)} style={{cursor:isEditable?'pointer':'default', ...descStyle}}>{description}</div>
        )}
      </div>

      {/* Actor avatar */}
      <div style={actorHolder}>
        <ClickableImagePlaceholder imagePath={actorImagePath} onImageUploaded={(p)=>onUpdate&&onUpdate({ actorImagePath:p })} size="LARGE" position="CENTER" description="Actor" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      </div>
    </div>
  );
};

export default ConcentricPhishingRiseSlideTemplate;

