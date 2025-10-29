// custom_extensions/frontend/src/components/templates/PercentCirclesSlideTemplate.tsx

import React, { useState, useEffect } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';
import { ChevronRight } from 'lucide-react';

export interface PercentCirclesProps extends BaseTemplateProps {
  title: string;
  percent: string; // e.g., '10%'
  bottomCards: Array<{ value: string; text: string; hasArrow?: boolean }>;
  avatarPath?: string;
  logoPath?: string;
  logoText?: string;
  pageNumber?: string;
  slideIndex?: number;
}

export const PercentCirclesSlideTemplate: React.FC<PercentCirclesProps & { theme?: SlideTheme | string }> = ({
  title = '% of Fortune 500 CEOs\nwho are women',
  percent = '10%',
  bottomCards = [
    { value:'3%', text:'Minorities hold just 3% of executive roles.' },
    { value:'35%', text:'Companies with diverse leadership outperform competitors by 35%', hasArrow:true }
  ],
  avatarPath = '',
  logoPath = '',
  logoText = 'Your Logo',
  pageNumber = '1',
  slideIndex = 1,
  isEditable = true, // Set to true by default for testing
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [edit, setEdit] = useState<{ k:string; i?:number }|null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);
  const [currentPercent, setCurrentPercent] = useState(percent);

  // Sync percent prop with local state
  useEffect(() => {
    setCurrentPercent(percent);
  }, [percent]);

  // Main slide with light blue background
  const slide: React.CSSProperties = { 
    width:'100%', 
    aspectRatio:'16/9', 
    background:'#E0E7FF', 
    color:'#000000', 
    fontFamily: currentTheme.fonts.titleFont, 
    position:'relative',
  };

  // Top section - main content area
  const topSection: React.CSSProperties = {
    position:'absolute',
    left:'44px',
    right:'44px',
    top:'30px',
    height:'400px',
    background:'#FFFFFF',
    borderRadius:'6px',
    boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  // Title styling - black, bold, two lines
  const titleStyle: React.CSSProperties = { 
    position:'absolute', 
    left:'50px', 
    top:'50px', 
    right:'550px', // Add right margin to prevent overlap with avatar
    fontSize:'47px', 
    fontWeight:1100, 
    color:'#000000',
    whiteSpace:'pre-line',
    lineHeight:1.2,
    fontFamily:'serif'
  };

  // Circles row - 10 circles total, positioned near avatar
  const circlesContainer: React.CSSProperties = {
    position:'absolute',
    left:'50px',
    top:'245px',
    display:'flex',
    alignItems:'center'
  };

  // Individual circle styles - smaller to fit with avatar
  const circleBase: React.CSSProperties = {
    width:'90px',
    height:'90px',
    borderRadius:'50%',
    border:'2px solid #0F58F9',
    background:'#F3F5FF',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    marginRight:'10px'
  };

  const circleFilled: React.CSSProperties = {
    ...circleBase,
    background:'#0F58F9', // Blue
    fontSize:'23px',
    fontWeight:600,
    border:'none',
    color:'#FFFFFF',
    borderRadius:'50%'
  };

  // Avatar positioning - upper right, overlapping border
  const avatarWrap: React.CSSProperties = { 
    position:'absolute', 
    right:'70px', 
    top:'60px', 
    width:'170px', 
    height:'170px', 
    borderRadius:'50%', 
    overflow:'hidden', 
    background:'#0F58F9',
    border:'3px solid #FFFFFF',
    zIndex:10
  };
  // const ring1: React.CSSProperties = { position:'absolute', right:'113px', top:'90px', width:'170px', height:'170px', borderRadius:'50%', border:'1px solid #4285F4', background:'transparent', zIndex:25 };

  // Bottom section - two green cards
  const bottomSection: React.CSSProperties = {
    position:'absolute',
    left:'44px',
    right:'44px',
    bottom:'75px',
    height:'135px',
    display:'grid',
    gridTemplateColumns:'1fr 1fr',
    gap:'20px'
  };

  // White card styling
  const whiteCard: React.CSSProperties = {
    background:'#FFFFFF',
    borderRadius:'6px',
    padding:'20px 30px',
    paddingRight: '190px',
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    position:'relative',
    boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  // Text styles for white cards
  const cardValueStyle: React.CSSProperties = {
    fontSize:'53px',
    fontWeight:900,
    color:'#000000',
    marginBottom:'8px'
  };

  const cardTextStyle: React.CSSProperties = {
    fontSize:'18px',
    color:'#34353C',
    lineHeight:1.3,
    fontFamily:'Inter, sans-serif',
    fontWeight:400
  };

  const cardTextStyleFirst: React.CSSProperties = {
    ...cardTextStyle,
    width:'200px'
  };

  const cardTextStyleSecond: React.CSSProperties = {
    ...cardTextStyle,
    width:'300px'
  };

  // Arrow icon for second card
  const arrowIcon: React.CSSProperties = {
    position:'absolute',
    right:'49px',
    width:'45px',
    height:'45px',
    borderRadius:'2px',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    color:'#FFFFFF',
    background:'#0F58F9',
    border:'none',
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
    width: '100%',
    fontFamily: base.fontFamily
  });

  // Calculate number of circles to fill based on percentage
  const getFilledCirclesCount = (percentStr: string): number => {
    const numericValue = parseInt(percentStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numericValue) || numericValue < 1) return 1;
    if (numericValue >= 100) return 10;
    if (numericValue >= 90) return 9;
    if (numericValue >= 80) return 8;
    if (numericValue >= 70) return 7;
    if (numericValue >= 60) return 6;
    if (numericValue >= 50) return 5;
    if (numericValue >= 40) return 4;
    if (numericValue >= 30) return 3;
    if (numericValue >= 20) return 2;
    return 1;
  };

  const filledCount = getFilledCirclesCount(currentPercent);

  // Logo section styling
  const logoSection: React.CSSProperties = {
    position:'absolute',
    bottom:'24px',
    right:'44px',
    display:'flex',
    alignItems:'center',
    gap:'8px',
    fontSize:'14px',
    color:'black',
    fontFamily:'"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const logoIcon: React.CSSProperties = {
    width:'20px',
    height:'20px',
    borderRadius:'50%',
    border:'1px solid black',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    fontSize:'12px',
    cursor: isEditable ? 'pointer' : 'default'
  };

  return (
    <>
      <style>{`
        .percent-circles *:not(.title-element):not(.card-value-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .percent-circles .title-element,
        .percent-circles .card-value-element {
          font-family: "Lora", serif !important;
          font-weight: 600 !important;
        }
        .percent-circles .percent-text {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 600 !important;
        }
        .percent-circles .card-text {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 400 !important;
        }
        .card-text * {
          font-weight: 400 !important;
        }
        .percent-circles .logo-text {
          font-weight: 600 !important;
        }
      `}</style>
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
              className="title-element"
              style={inlineEditor(titleStyle)} 
            />
          ) : (
            <div className="title-element" onClick={()=> isEditable && setEdit({ k:'title' })} style={{ cursor: isEditable ? 'pointer':'default' }}>
              {title}
            </div>
          )}
        </div>

        {/* Circles row */}
        <div style={circlesContainer}>
          {/* Render all 10 circles */}
          {[...Array(10)].map((_, i) => {
            const isFilled = i < filledCount;
            const isLastFilled = i === filledCount - 1;
            
            return (
              <div key={i} style={isFilled ? circleFilled : circleBase}>
                {/* Show percentage only in the last filled circle */}
                {isLastFilled && (
                  <>
                    {isEditable && edit?.k==='percent' ? (
                      <ImprovedInlineEditor 
                        initialValue={currentPercent} 
                        onSave={(v)=>{ 
                          setCurrentPercent(v);
                          onUpdate && onUpdate({ percent:v }); 
                          setEdit(null); 
                        }} 
                        onCancel={()=> setEdit(null)} 
                        className="percent-text"
                        style={{ ...inline({}), color:'#FFFFFF', fontSize:'23px', fontWeight:700, textAlign:'center' }} 
                      />
                    ) : (
                      <div 
                        className="percent-text" 
                        onClick={()=> isEditable && setEdit({ k:'percent' })} 
                        style={{ cursor: isEditable ? 'pointer':'default' }}
                      >
                        {currentPercent}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Avatar */}
      <div style={avatarWrap}>
        <ClickableImagePlaceholder 
          imagePath={avatarPath} 
          onImageUploaded={(p)=> {
            console.log('Image uploaded:', p);
            onUpdate && onUpdate({ avatarPath:p });
          }} 
          size="LARGE" 
          position="CENTER" 
          description="Avatar" 
          isEditable={isEditable} 
          style={{ width:'100%', height:'100%', objectFit:'cover', marginTop:'4px', cursor: isEditable ? 'pointer' : 'default' }} 
        />
      </div>
      {/* <div style={ring1} /> */}

      {/* Bottom section with white cards */}
      <div style={bottomSection}>
        {bottomCards.map((card, i) => (
          <div key={i} style={whiteCard}>
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
                     className="card-value-element"
                     style={inline(cardValueStyle)} 
                   />
                 ) : (
                   <div className="card-value-element">
                     {card.value}
                   </div>
                 )}
               </div>
             )}

            {/* Text */}
            <div className="card-text" style={i === 0 ? cardTextStyleFirst : cardTextStyleSecond} onClick={()=> isEditable && setEdit({ k:`bt${i}` })}>
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
                  className="card-text"
                  style={inline(i === 0 ? cardTextStyleFirst : cardTextStyleSecond)} 
                />
              ) : (
                <div className="card-text">
                  {card.text}
                </div>
              )}
            </div>

            {/* Arrow icon for second card */}
            {card.hasArrow && (
              <div style={arrowIcon}>
                <ChevronRight /> 
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Logo section */}
      <div style={logoSection}>
        <YourLogo
          logoPath={logoPath}
          onLogoUploaded={(p) => onUpdate && onUpdate({ logoPath: p })}
          isEditable={isEditable}
          color="#000000"
          text={logoText}
        />
      </div>

      {/* Page number */}
      <div style={{
        position:'absolute',
        bottom:'24px',
        left:'0px',
        color:'#34353C',
        fontSize:'16px',
        fontWeight:400,
        fontFamily:'Inter, sans-serif',
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
            style={{ position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, color:'#34353C', fontSize:'16px', fontWeight:600, fontFamily:'Inter, sans-serif' }}
          />
        ) : (
          <div onClick={() => isEditable && setEditingPageNumber(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>
            {currentPageNumber}
          </div>
        )}
      </div>

    </div>
    </>
  );
};

export default PercentCirclesSlideTemplate;