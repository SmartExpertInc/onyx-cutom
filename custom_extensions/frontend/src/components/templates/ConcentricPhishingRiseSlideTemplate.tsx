// custom_extensions/frontend/src/components/templates/ConcentricPhishingRiseSlideTemplate.tsx

import React, { useState } from 'react';
import { ConcentricPhishingRiseSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';


  // Helper function for inline editor styling
  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    margin: 0
  });

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
  const [editingNumber, setEditingNumber] = useState<null | 'big' | 'medium' | 'small'>(null);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', position:'relative', background:'#ffffff', fontFamily: currentTheme.fonts.titleFont };

  const rightText: React.CSSProperties = { position:'absolute', right:'20px', top:'30px', width:'502px' };
  const titleStyle: React.CSSProperties = { fontSize:'52px', fontWeight:800, color:'#151515', letterSpacing:'-0.5px' };
  const descStyle: React.CSSProperties = { marginTop:'12px', color:'#8C8C8C', fontSize:'15px', lineHeight:1.6 };

  const circles: React.CSSProperties = { position:'absolute', left:'20px', bottom:'25px', width:'620px' };
  const overlay: React.CSSProperties = { position:'absolute', left:'20px', bottom:'25px', width:'620px', height:'620px', pointerEvents:'none' };
  const actorHolder: React.CSSProperties = { position:'absolute', right:'96px', bottom:'56px', width:'160px', height:'160px', borderRadius:'50%', overflow:'hidden', background:'#111' };

  return (
    <div className="concentric-phishing-rise-slide inter-theme" style={slide}>
      {/* Concentric circles */}
      <svg viewBox="0 0 880 880" style={circles}>
        <circle cx="440" cy="440" r="400" fill="#fff" stroke="#111" strokeWidth="2" />
        <circle cx="440" cy="560" r="280" fill="#0a0a0a" stroke="#0a0a0a" strokeWidth="2" />
        <circle cx="440" cy="720" r="120" fill="#fff" stroke="#fff" strokeWidth="2" />
        {/* Titles */}
        <text x="370" y="130" fill="#222" fontSize="18" fontWeight="600">Big circle data</text>
        <text x="353" y="380" fill="#C1C1C1" fontSize="18" fontWeight="600">Medium circle data</text>
        <text x="370" y="670" fill="#222" fontSize="18" fontWeight="600">Small circle data</text>
      </svg>

      {/* Editable numbers overlay to match screenshot positioning */}
      <div style={overlay}>
        {/* Big */}
        <div style={{ position:'absolute', left:'217px', top:'109px', pointerEvents:'auto' }}>
          {isEditable && editingNumber === 'big' ? (
            <ImprovedInlineEditor
              initialValue={bigLabel}
              onSave={(v)=>{ onUpdate && onUpdate({ bigLabel: v }); setEditingNumber(null); }}
              onCancel={()=>setEditingNumber(null)}
              style={{ fontSize:'75px', fontWeight:800, color:'#151515', lineHeight:1 }}
            />
          ) : (
            <div onClick={()=> isEditable && setEditingNumber('big')} style={{ cursor: isEditable ? 'pointer' : 'default', fontSize:'75px', fontWeight:800, color:'#151515', lineHeight:1 }}>{bigLabel}</div>
          )}
        </div>

        {/* Medium */}
        <div style={{ position:'absolute', left:'245px', top:'288px', pointerEvents:'auto' }}>
          {isEditable && editingNumber === 'medium' ? (
            <ImprovedInlineEditor
              initialValue={mediumLabel}
              onSave={(v)=>{ onUpdate && onUpdate({ mediumLabel: v }); setEditingNumber(null); }}
              onCancel={()=>setEditingNumber(null)}
              style={{ fontSize:'60px', fontWeight:800, color:'#ffffff', lineHeight:1 }}
            />
          ) : (
            <div onClick={()=> isEditable && setEditingNumber('medium')} style={{ cursor: isEditable ? 'pointer' : 'default', fontSize:'60px', fontWeight:800, color:'#ffffff', lineHeight:1 }}>{mediumLabel}</div>
          )}
        </div>

        {/* Small */}
        <div style={{ position:'absolute', left:'265px', top:'488px', pointerEvents:'auto' }}>
          {isEditable && editingNumber === 'small' ? (
            <ImprovedInlineEditor
              initialValue={smallLabel}
              onSave={(v)=>{ onUpdate && onUpdate({ smallLabel: v }); setEditingNumber(null); }}
              onCancel={()=>setEditingNumber(null)}
              style={{ fontSize:'40px', fontWeight:800, color:'#151515', lineHeight:1 }}
            />
          ) : (
            <div onClick={()=> isEditable && setEditingNumber('small')} style={{ cursor: isEditable ? 'pointer' : 'default', fontSize:'40px', fontWeight:800, color:'#151515', lineHeight:1 }}>{smallLabel}</div>
          )}
        </div>
      </div>

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
        <ClickableImagePlaceholder imagePath={actorImagePath} onImageUploaded={(p)=>onUpdate&&onUpdate({ actorImagePath:p })} size="LARGE" position="CENTER" description="Actor" isEditable={isEditable} style={{ width:'100%', height:'100%', marginTop: '4px', objectFit:'cover' }} />
      </div>
    </div>
  );
};

export default ConcentricPhishingRiseSlideTemplate;