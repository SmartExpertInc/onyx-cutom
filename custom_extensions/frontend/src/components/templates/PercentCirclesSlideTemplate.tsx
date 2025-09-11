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
    background:'#F6F6F2', 
    color:'#0F172A', 
    fontFamily: currentTheme.fonts.titleFont, 
    position:'relative',
    border:'1px solid #3C3F46'
  };

  // Top section - main content area
  const topSection: React.CSSProperties = {
    position:'absolute',
    left:'44px',
    right:'44px',
    top:'44px',
    height:'400px',
    background:'#FFFFFF',
    border:'1px solid #3C3F46'
  };

  // Title styling - dark gray, bold, two lines
  const titleStyle: React.CSSProperties = { 
    position:'absolute', 
    left:'80px', 
    top:'80px', 
    fontSize:'32px', 
    fontWeight:700, 
    color:'#1E1E1C',
    whiteSpace:'pre-line',
    lineHeight:1.2
  };

  // Circles row - 10 circles total
  const circlesContainer: React.CSSProperties = {
    position:'absolute',
    left:'80px',
    top:'200px',
    display:'flex',
    gap:'20px',
    alignItems:'center'
  };

  // Individual circle styles - same size as avatar
  const circleBase: React.CSSProperties = {
    width:'120px',
    height:'120px',
    borderRadius:'50%',
    border:'2px solid #3C3F46',
    background:'#FFFFFF',
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  };

  const circleFilled: React.CSSProperties = {
    ...circleBase,
    background:'#4CCD6A', // Bright green
    border:'2px solid #4CCD6A',
    color:'#FFFFFF',
    fontSize:'28px',
    fontWeight:700
  };

  // Avatar positioning - upper right, overlapping border
  const avatarWrap: React.CSSProperties = { 
    position:'absolute', 
    right:'-20px', 
    top:'-20px', 
    width:'120px', 
    height:'120px', 
    borderRadius:'50%', 
    overflow:'hidden', 
    background:'#C7D6FF',
    border:'3px solid #FFFFFF',
    zIndex:10
  };

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
    background:'#4CCD6A',
    borderRadius:'12px',
    padding:'24px',
    display:'flex',
    flexDirection:'column',
    justifyContent:'center',
    position:'relative'
  };

  // Text styles for green cards
  const cardValueStyle: React.CSSProperties = {
    fontSize:'36px',
    fontWeight:700,
    color:'#FFFFFF',
    marginBottom:'8px'
  };

  const cardTextStyle: React.CSSProperties = {
    fontSize:'16px',
    color:'#FFFFFF',
    lineHeight:1.3
  };

  // Arrow icon for second card
  const arrowIcon: React.CSSProperties = {
    position:'absolute',
    bottom:'16px',
    right:'16px',
    width:'24px',
    height:'24px',
    borderRadius:'50%',
    background:'#000000',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    color:'#FFFFFF',
    fontSize:'12px'
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
            <div onClick={()=> isEditable && setEdit({ k:'title' })} style={{ cursor: isEditable ? 'pointer':'default' }}>
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
                style={{ ...inline({}), color:'#FFFFFF', fontSize:'28px', fontWeight:700 }} 
              />
            ) : (
              <div onClick={()=> isEditable && setEdit({ k:'percent' })} style={{ cursor: isEditable ? 'pointer':'default' }}>
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
          style={{ width:'100%', height:'100%', objectFit:'cover' }} 
        />
      </div>

      {/* Bottom section with green cards */}
      <div style={bottomSection}>
        {bottomCards.map((card, i) => (
          <div key={i} style={greenCard}>
            {/* Value */}
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

            {/* Text */}
            <div style={cardTextStyle} onClick={()=> isEditable && setEdit({ k:`bt${i}` })}>
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
                  style={inline(cardTextStyle)} 
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