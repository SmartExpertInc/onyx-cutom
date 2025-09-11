// custom_extensions/frontend/src/components/templates/PercentCirclesSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface PercentCirclesProps extends BaseTemplateProps {
  title: string;
  percent: string; // e.g., '10%'
  bottomCards: Array<{ value: string; text: string; hasArrow?: boolean }>;
  avatarPath?: string;
}

export const PercentCirclesSlideTemplate: React.FC<PercentCirclesProps & { theme?: SlideTheme | string }> = ({
  title = '% of Fortune 500 CEOs\nwho are women',
  percent = '10%',
  bottomCards = [
    { value:'3%', text:'Minorities hold just 3% of executive roles.' },
    { value:'35%', text:'Companies with diverse leadership outperform competitors by 35%', hasArrow:true }
  ],
  avatarPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [edit, setEdit] = useState<{ k:string; i?:number }|null>(null);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#F6F6F2', color:'#0F172A', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const card: React.CSSProperties = { position:'absolute', left:'44px', right:'44px', top:'44px', bottom:'244px', background:'#FFFFFF', borderRadius:'24px', boxShadow:'0 0 0 2px #111111 inset' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'88px', top:'104px', fontSize:'64px', fontWeight:800, whiteSpace:'pre-line' };
  const avatarWrap: React.CSSProperties = { position:'absolute', right:'88px', top:'76px', width:'170px', height:'170px', borderRadius:'50%', overflow:'hidden', background:'#C7D6FF' };

  const circlesWrap: React.CSSProperties = { position:'absolute', left:'88px', right:'88px', top:'280px', height:'180px', display:'grid', gridTemplateColumns:'repeat(11, 1fr)', columnGap:'20px' };
  const circleBase: React.CSSProperties = { border:'3px solid #3C3F46', borderRadius:'30px', width:'140px', height:'140px', background:'#FFFFFF' };
  const circleActive: React.CSSProperties = { ...circleBase, background:'#4CCD6A', color:'#0A0F0C', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:700 };

  const bottomRow: React.CSSProperties = { position:'absolute', left:'44px', right:'44px', bottom:'44px', display:'grid', gridTemplateColumns:'1fr 1fr', columnGap:'36px' };
  const greenCard: React.CSSProperties = { background:'#4CCD6A', borderRadius:'16px', boxShadow:'0 0 0 2px #111 inset', height:'140px', display:'grid', gridTemplateColumns:'140px 1fr 60px', alignItems:'center', padding:'0 24px' };
  const valueStyle: React.CSSProperties = { fontSize:'56px', fontWeight:800 };
  const textStyle: React.CSSProperties = { fontSize:'20px', color:'#0F172A' };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ ...base, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, whiteSpace:'pre-wrap' });

  return (
    <div className="percent-circles inter-theme" style={slide}>
      <div style={card} />
      <div style={titleStyle}>
        {isEditable && edit?.k==='title' ? (
          <ImprovedInlineEditor initialValue={title} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ title:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(titleStyle)} />
        ) : (
          <div onClick={()=> isEditable && setEdit({ k:'title' })} style={{ cursor: isEditable ? 'pointer':'default' }}>{title}</div>
        )}
      </div>
      <div style={avatarWrap}>
        <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      </div>

      <div style={circlesWrap}>
        {[...Array(11)].map((_,i)=> (
          <div key={i} style={i===0 ? circleActive : circleBase}>
            {i===0 ? percent : null}
          </div>
        ))}
      </div>

      <div style={bottomRow}>
        {bottomCards.map((c,i)=> (
          <div key={i} style={greenCard}>
            <div onClick={()=> isEditable && setEdit({ k:`bv${i}` })} style={valueStyle}>
              {isEditable && edit?.k===`bv${i}` ? (
                <ImprovedInlineEditor initialValue={c.value} onSave={(v)=>{ const next=[...bottomCards]; next[i]={ ...next[i], value:v }; onUpdate&&onUpdate({ bottomCards: next }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(valueStyle)} />
              ) : (
                c.value
              )}
            </div>
            <div onClick={()=> isEditable && setEdit({ k:`bt${i}` })} style={textStyle}>
              {isEditable && edit?.k===`bt${i}` ? (
                <ImprovedInlineEditor initialValue={c.text} multiline={true} onSave={(v)=>{ const next=[...bottomCards]; next[i]={ ...next[i], text:v }; onUpdate&&onUpdate({ bottomCards: next }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(textStyle)} />
              ) : (
                c.text
              )}
            </div>
            <div>{c.hasArrow ? '➜' : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PercentCirclesSlideTemplate;

