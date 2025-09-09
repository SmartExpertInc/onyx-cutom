// custom_extensions/frontend/src/components/templates/FinancialImpactMosaicSlideTemplate.tsx

import React, { useState } from 'react';
import { FinancialImpactMosaicSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export const FinancialImpactMosaicSlideTemplate: React.FC<FinancialImpactMosaicSlideProps & { theme?: SlideTheme | string }> = ({
  slideId,
  leftTitle = 'The financial\nimpact',
  kpiTitle = '$170 billion',
  kpiSubtitle = 'Annual cost of US workplace accidents & injuries',
  leftAvatarPath = '',
  leftAvatarAlt = 'Avatar',
  topRightImagePath = '',
  bottomRightImagePath = '',
  midStatLeft = '52%',
  midStatRight = '$4-$6',
  midStatLeftCaption = 'Reduction in compensation costs',
  midStatRightCaption = 'ROI for every $1 invested',
  footerDate = 'Date Goes Here',
  footerPage = 'Page Number',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', position:'relative', background:'#101e28', fontFamily: currentTheme.fonts.titleFont, color:'#e5e7eb' };

  const grid: React.CSSProperties = { position:'absolute', inset: '0 0 0 0', display:'grid', gridTemplateColumns:'1.1fr 1.9fr', gridTemplateRows:'1.15fr 0.85fr', gap:'12px', padding:'12px' };
  const leftTop: React.CSSProperties = { background:'#e65f42', display:'flex', alignItems:'center', justifyContent:'center' };
  const leftBottom: React.CSSProperties = { background:'#e65f42', display:'flex', alignItems:'flex-end', padding:'24px', fontSize:'46px', fontWeight:800, lineHeight:1.06 };
  const centerTop: React.CSSProperties = { background:'#0f2330', position:'relative' };
  const centerMidLeft: React.CSSProperties = { background:'#0f2330', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'46px', fontWeight:800 };
  const centerMidRight: React.CSSProperties = { background:'#0f2330', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'46px', fontWeight:800 };
  const rightBottom: React.CSSProperties = { background:'#0f2330', position:'relative' };

  return (
    <div className="financial-impact-mosaic-slide inter-theme" style={slide}>
      <div style={grid}>
        {/* Left column top: Avatar */}
        <div style={leftTop}>
          <div style={{ width:'260px', height:'360px', background:'#111' }}>
            <ClickableImagePlaceholder imagePath={leftAvatarPath} onImageUploaded={(p)=>onUpdate&&onUpdate({ leftAvatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        </div>

        {/* Center-top KPI */}
        <div style={centerTop}>
          <div style={{ position:'absolute', right:'24px', top:'24px', textAlign:'right' }}>
            <div style={{ fontSize:'64px', fontWeight:800 }}>{kpiTitle}</div>
            <div style={{ marginTop:'6px', color:'#9aa3ac', fontSize:'19px' }}>{kpiSubtitle}</div>
          </div>
          <ClickableImagePlaceholder imagePath={topRightImagePath} onImageUploaded={(p)=>onUpdate&&onUpdate({ topRightImagePath:p })} size="LARGE" position="CENTER" description="Top image" isEditable={isEditable} style={{ position:'absolute', inset: '0 0 0 0', objectFit:'cover', opacity:0.22 }} />
        </div>

        {/* Left-bottom big title */}
        <div style={leftBottom}>
          <div style={{ whiteSpace:'pre-line', color:'#ffffff' }}>{leftTitle}</div>
        </div>

        {/* Center mid left stat */}
        <div style={centerMidLeft}>
          <div>
            <div style={{ textAlign:'center' }}>{midStatLeft}</div>
            <div style={{ marginTop:'10px', textAlign:'center', color:'#9aa3ac', fontSize:'18px' }}>{midStatLeftCaption}</div>
          </div>
        </div>

        {/* Center mid right stat */}
        <div style={centerMidRight}>
          <div>
            <div style={{ textAlign:'center' }}>{midStatRight}</div>
            <div style={{ marginTop:'10px', textAlign:'center', color:'#9aa3ac', fontSize:'18px' }}>{midStatRightCaption}</div>
          </div>
        </div>

        {/* Right bottom photo + footer */}
        <div style={rightBottom}>
          <ClickableImagePlaceholder imagePath={bottomRightImagePath} onImageUploaded={(p)=>onUpdate&&onUpdate({ bottomRightImagePath:p })} size="LARGE" position="CENTER" description="Bottom image" isEditable={isEditable} style={{ position:'absolute', inset:'0 0 0 0', objectFit:'cover' }} />
          <div style={{ position:'absolute', bottom:'12px', right:'24px', display:'flex', gap:'28px', color:'#c0c7cd', fontSize:'14px' }}>
            <div>{footerDate}</div>
            <div>{footerPage}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialImpactMosaicSlideTemplate;

