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

  // Main slide with light beige background
  const slide: React.CSSProperties = { 
    width:'100%', 
    aspectRatio:'16/9', 
    background:'#ffff', 
    color:'#0F172A', 
    fontFamily: currentTheme.fonts.titleFont, 
    position:'relative',
  };

  // Top section - main content area
  const topSection: React.CSSProperties = {
    position:'absolute',
    left:'44px',
    right:'44px',
    top:'44px',
    height:'400px',
    background:'#FFFFFF',
    border:'2px solid #3C3F46',
    borderRadius:'24px'
  };

  // Title styling - dark gray, bold, two lines
  const titleStyle: React.CSSProperties = { 
    position:'absolute', 
    left:'80px', 
    top:'60px', 
    fontSize:'50px', 
    fontWeight:700, 
    color:'#121110',
    whiteSpace:'pre-line',
    lineHeight:1.2
  };

  // Circles row - 10 circles total, positioned near avatar
  const circlesContainer: React.CSSProperties = {
    position:'absolute',
    left:'80px',
    top:'245px',
    display:'flex',
    alignItems:'center'
  };

  // Individual circle styles - smaller to fit with avatar
  const circleBase: React.CSSProperties = {
    width:'90px',
    height:'90px',
    borderRadius:'43%',
    border:'2px solid #696864',
    background:'#FFFFFF',
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  };

  const circleFilled: React.CSSProperties = {
    ...circleBase,
    background:'#4CCD6A', // Bright green
    fontSize:'20px',
    fontWeight:700,
    border:'5px solid #6AAF71',
    color:'#175118',
    borderRadius:'50%'
  };

  // Avatar positioning - upper right, overlapping border
  const avatarWrap: React.CSSProperties = { 
    position:'absolute', 
    right:'70px', 
    top:'90px', 
    width:'170px', 
    height:'170px', 
    borderRadius:'50%', 
    overflow:'hidden', 
    background:'#C7D6FF',
    border:'3px solid #FFFFFF',
    zIndex:10
  };
  const ring1: React.CSSProperties = { position:'absolute', right:'113px', top:'90px', width:'170px', height:'170px', borderRadius:'50%', border:'1px solid #111111', background:'transparent', zIndex:25 };

  // Bottom section - two green cards
  const bottomSection: React.CSSProperties = {
    position:'absolute',
    left:'44px',
    right:'44px',
    bottom:'44px',
    height:'120px',
    display:'grid',
    gridTemplateColumns:'1fr 1fr',
    gap:'20px'
  };

  // Green card styling
  const greenCard: React.CSSProperties = {
    background:'#6CDB78',
    borderRadius:'12px',
    padding:'20px 50px',
    paddingRight: '175px',
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    position:'relative'
  };

  // Text styles for green cards
  const cardValueStyle: React.CSSProperties = {
    fontSize:'46px',
    fontWeight:700,
    color:'#000000',
    marginBottom:'8px'
  };

  const cardTextStyle: React.CSSProperties = {
    fontSize:'16px',
    color:'#235D26',
    lineHeight:1.3
  };

  const cardTextStyleFirst: React.CSSProperties = {
    ...cardTextStyle,
    width:'200px'
  };

  const cardTextStyleSecond: React.CSSProperties = {
    ...cardTextStyle,
    width:'270px'
  };

  // Arrow icon for second card
  const arrowIcon: React.CSSProperties = {
    position:'absolute',
    right:'49px',
    width:'45px',
    height:'45px',
    borderRadius:'50%',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    color:'#000000',
    border:'1px solid #000000',
    fontSize:'28px'
  };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ 
    ...base, 
    position:'relative', 
    background:'transparent', 
    border:'none', 
    outline:'none', 
    padding:0, 
    margin:0, 
    whiteSpace:'pre-wrap' 
  });

  return (
    <div className="percent-circles inter-theme" style={slide}>
      {/* Top section */}
      <div style={topSection}>
        {/* Title */}
        <div style={titleStyle}>
          {isEditable && edit?.k==='title' ? (
            <ImprovedInlineEditor 
              initialValue={title} 
              multiline={true} 
              onSave={(v)=>{ onUpdate && onUpdate({ title:v }); setEdit(null); }} 
              onCancel={()=> setEdit(null)} 
              style={inline(titleStyle)} 
            />
          ) : (
            <div onClick={()=> isEditable && setEdit({ k:'title' })} style={inline({ cursor: isEditable ? 'pointer':'default' })}>
              {title}
            </div>
          )}
        </div>

        {/* Circles row */}
        <div style={circlesContainer}>
          {/* First circle - filled with percentage */}
          <div style={circleFilled}>
            {isEditable && edit?.k==='percent' ? (
              <ImprovedInlineEditor 
                initialValue={percent} 
                onSave={(v)=>{ onUpdate && onUpdate({ percent:v }); setEdit(null); }} 
                onCancel={()=> setEdit(null)} 
                style={{ ...inline({}), color:'#FFFFFF', fontSize:'20px', fontWeight:700 }} 
              />
            ) : (
              <div onClick={()=> isEditable && setEdit({ k:'percent' })} style={inline({ cursor: isEditable ? 'pointer':'default' })}>
                {percent}
              </div>
            )}
          </div>
          
          {/* Remaining 9 empty circles */}
          {[...Array(9)].map((_, i) => (
            <div key={i} style={circleBase} />
          ))}
        </div>
      </div>

      {/* Avatar */}
      <div style={avatarWrap}>
        <ClickableImagePlaceholder 
          imagePath={avatarPath} 
          onImageUploaded={(p)=> onUpdate && onUpdate({ avatarPath:p })} 
          size="LARGE" 
          position="CENTER" 
          description="Avatar" 
          isEditable={isEditable} 
          style={inline({ width:'100%', height:'100%', objectFit:'cover', marginTop:'4px' })} 
        />
      </div>
      <div style={ring1} />

      {/* Bottom section with green cards */}
      <div style={bottomSection}>
        {bottomCards.map((card, i) => (
          <div key={i} style={greenCard}>
            {/* Value - only for first card */}
            {i === 0 && (
              <div style={cardValueStyle} onClick={()=> isEditable && setEdit({ k:`bv${i}` })}>
                {isEditable && edit?.k===`bv${i}` ? (
                  <ImprovedInlineEditor 
                    initialValue={card.value} 
                    onSave={(v)=>{ 
                      const next = [...bottomCards]; 
                      next[i] = { ...next[i], value:v }; 
                      onUpdate && onUpdate({ bottomCards: next }); 
                      setEdit(null); 
                    }} 
                    onCancel={()=> setEdit(null)} 
                    style={inline(cardValueStyle)} 
                  />
                ) : (
                  card.value
                )}
              </div>
            )}

            {/* Text */}
            <div style={i === 0 ? cardTextStyleFirst : cardTextStyleSecond} onClick={()=> isEditable && setEdit({ k:`bt${i}` })}>
              {isEditable && edit?.k===`bt${i}` ? (
                <ImprovedInlineEditor 
                  initialValue={card.text} 
                  multiline={true}
                  onSave={(v)=>{ 
                    const next = [...bottomCards]; 
                    next[i] = { ...next[i], text:v }; 
                    onUpdate && onUpdate({ bottomCards: next }); 
                    setEdit(null); 
                  }} 
                  onCancel={()=> setEdit(null)} 
                  style={inline(i === 0 ? cardTextStyleFirst : cardTextStyleSecond)} 
                />
              ) : (
                card.text
              )}
            </div>

            {/* Arrow icon for second card */}
            {card.hasArrow && (
              <div style={arrowIcon}>
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PercentCirclesSlideTemplate;