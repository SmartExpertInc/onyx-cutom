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

  const rightText: React.CSSProperties = { position:'absolute', right:'20px', top:'30px', width:'502px' };
  const titleStyle: React.CSSProperties = { fontSize:'52px', fontWeight:800, color:'#151515', letterSpacing:'-0.5px' };
  const descStyle: React.CSSProperties = { marginTop:'12px', color:'#8C8C8C', fontSize:'15px', lineHeight:1.6 };

  const circles: React.CSSProperties = { position:'absolute', left:'20px', bottom:'25px', width:'620px' };
  const actorHolder: React.CSSProperties = { position:'absolute', right:'96px', bottom:'56px', width:'160px', height:'160px', borderRadius:'50%', overflow:'hidden', background:'#111' };

  return (
    <div className="concentric-phishing-rise-slide inter-theme" style={slide}>
      {/* Concentric circles */}
      <svg viewBox="0 0 880 880" style={circles}>
        <circle cx="440" cy="440" r="400" fill="#fff" stroke="#111" strokeWidth="2" />
        <circle cx="440" cy="560" r="280" fill="#0a0a0a" stroke="#0a0a0a" strokeWidth="2" />
        <circle cx="440" cy="760" r="120" fill="#fff" stroke="#fff" strokeWidth="2" />
        {/* Labels */}
        <text x="220" y="290" fill="#151515" fontSize="100" fontWeight="800">{bigLabel}</text>
        <text x="340" y="560" fill="#ffffff" fontSize="72" fontWeight="800">{mediumLabel}</text>
        <text x="380" y="780" fill="#151515" fontSize="48" fontWeight="800">{smallLabel}</text>
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

      <div style={{ position:'absolute', left:'20px', bottom:'25px', backgroundColor: 'orange'}}>
      </div>

      {/* Actor avatar */}
      <div style={actorHolder}>
        <ClickableImagePlaceholder imagePath={actorImagePath} onImageUploaded={(p)=>onUpdate&&onUpdate({ actorImagePath:p })} size="LARGE" position="CENTER" description="Actor" isEditable={isEditable} style={{ width:'100%', height:'100%', marginTop: '4px', objectFit:'cover' }} />
      </div>
    </div>
  );
};

export default ConcentricPhishingRiseSlideTemplate;