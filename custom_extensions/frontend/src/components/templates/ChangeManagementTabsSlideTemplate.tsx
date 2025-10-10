// custom_extensions/frontend/src/components/templates/ChangeManagementTabsSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';

export interface ChangeManagementTabsProps extends BaseTemplateProps {
  topTabs: string[]; // 4 tabs
  heading: string;
  pills: [string, string, string]; // left, center (active), right
  avatarPath?: string;
  logoText?: string;
  logoPath?: string;
  pageNumber?: string;
}

export const ChangeManagementTabsSlideTemplate: React.FC<ChangeManagementTabsProps & { theme?: SlideTheme | string }> = ({
  slideId,
  topTabs = [
    'Change management fundamentals',
    'The need for change',
    'Building a change-ready culture',
    'Effective communication and engagement'
  ],
  heading = 'Communication is the lifeblood\nof successful change initiatives.',
  pills = ['Organization', 'Communication', 'Stakeholders'],
  avatarPath = '',
  logoText = 'Your Logo',
  logoPath = '',
  pageNumber = '39',
  isEditable = false,
  onUpdate,
  theme
}: ChangeManagementTabsProps & { theme?: SlideTheme | string }) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editHeading, setEditHeading] = useState(false);
  const [editTabIdx, setEditTabIdx] = useState<number | null>(null);
  const [editPillIdx, setEditPillIdx] = useState<number | null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#E0E7FF', color:'#111827', fontFamily: currentTheme.fonts.titleFont, position:'relative' };

  const topTabsWrap: React.CSSProperties = { position:'absolute', left:0, right:0, top:0, height:'140px', display:'grid', gridTemplateRows:'35px 35px 35px 35px' };
  const tabRow = (bg: string, color: string): React.CSSProperties => ({ background:bg, color, display:'flex', alignItems:'center', padding:'0 32px', fontSize:'16px', fontWeight:500, fontFamily:'sans-serif' });

  const content: React.CSSProperties = { position:'absolute', left:'56px', right:'56px', top:'180px', bottom:'100px', background:'#E0E7FF' };
  const avatar: React.CSSProperties = { position:'absolute', left:'0', top:'0', width:'140px', height:'140px', borderRadius:'50%', overflow:'hidden', background:'#0F58F9' };
  const headingStyle: React.CSSProperties = { position:'absolute', left:'160px', right:'0', top:'0', fontSize:'44px', fontWeight:400, color:'#000000', lineHeight:1.1, fontFamily:'serif', whiteSpace:'pre-line' };

  const capsulesWrap: React.CSSProperties = { position:'absolute', left:'56px', right:'56px', bottom:'60px', height:'50px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', columnGap:'20px', alignItems:'center' };
  const capsule: React.CSSProperties = { borderRadius:'25px', display:'flex', alignItems:'center', justifyContent:'center', color:'#000000', fontSize:'16px', fontWeight:500, height:'100%', background:'#FFFFFF', border:'none', fontFamily:'sans-serif', textTransform:'uppercase' };
  const capsuleActive: React.CSSProperties = { ...capsule, background:'#0F58F9', color:'#FFFFFF' };

  const logoStyles: React.CSSProperties = { position:'absolute', left:'48px', top:'48px', color:'#000000', fontSize:'16px', fontWeight:500 };
  const footerLogoStyles: React.CSSProperties = { position:'absolute', bottom:'24px', right:'48px', color:'#9CA3AF', fontSize:'14px', fontWeight:500, fontFamily:'sans-serif' };
  const pageNumberContainerStyles: React.CSSProperties = { position:'absolute', bottom:'30px', left:'0px', display:'flex', alignItems:'center', gap:'8px' };
  const smallLineStyles: React.CSSProperties = { width:'20px', height:'1px', backgroundColor:'rgba(9, 9, 11, 0.6)' };
  const pageNumberStyles: React.CSSProperties = { color:'#09090B99', fontSize:'17px', fontWeight:300, fontFamily: currentTheme.fonts.contentFont };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    onUpdate && onUpdate({ pageNumber: newPageNumber });
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
  };

  const inlineHeading = { ...headingStyle, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0 } as React.CSSProperties;
  const inlineTab = { position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, color:'inherit', fontSize:'14px' } as React.CSSProperties;
  const inlineCapsule = { position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, color:'inherit', fontSize:'12px', textAlign:'center' } as React.CSSProperties;

  return (
    <div className="change-mgmt-tabs inter-theme" style={slide}>
      {/* Logo */}
      <YourLogo
        logoPath={logoPath}
        onLogoUploaded={(p: string) => onUpdate && onUpdate({ logoPath: p })}
        isEditable={isEditable}
        color="#000000"
        text={logoText}
        style={logoStyles}
      />

      {/* Top Navigation Tabs */}
      <div style={topTabsWrap}>
        {[
          ['#0F58F9','#FFFFFF'], // Blue background, white text
          ['#FFFFFF','#000000'], // White background, black text  
          ['#0F58F9','#FFFFFF'], // Blue background, white text (highlighted)
          ['#FFFFFF','#000000']  // White background, black text
        ].map((pair, rowIdx)=> (
          <div key={rowIdx} style={tabRow(pair[0] as string, pair[1] as string)}>
            {isEditable && editTabIdx === rowIdx ? (
              <ImprovedInlineEditor initialValue={topTabs[rowIdx] ?? ''} onSave={(v)=>{ const next=[...topTabs]; next[rowIdx]=v; onUpdate&&onUpdate({ topTabs: next }); setEditTabIdx(null); }} onCancel={()=>setEditTabIdx(null)} style={inlineTab} />
            ) : (
              <div onClick={()=> isEditable && setEditTabIdx(rowIdx)} style={{ cursor: isEditable ? 'pointer':'default' }}>{topTabs[rowIdx]}</div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={content}>
        <div style={avatar}>
          <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p: string)=> onUpdate&&onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
        </div>
        <div style={headingStyle}>
          {isEditable && editHeading ? (
            <ImprovedInlineEditor initialValue={heading} onSave={(v)=>{ onUpdate&&onUpdate({ heading:v }); setEditHeading(false); }} onCancel={()=>setEditHeading(false)} style={inlineHeading} />
          ) : (
            <div onClick={()=> isEditable && setEditHeading(true)} style={{ cursor: isEditable ? 'pointer':'default' }}>{heading}</div>
          )}
        </div>

        {/* Bottom Buttons */}
        <div style={capsulesWrap}>
          {[0,1,2].map((i)=> (
            <div key={i} style={i===1 ? capsuleActive : capsule}>
              {isEditable && editPillIdx === i ? (
                <ImprovedInlineEditor initialValue={pills[i]} onSave={(v)=>{ const next:[string,string,string]=[...pills] as any; next[i]=v; onUpdate&&onUpdate({ pills: next }); setEditPillIdx(null); }} onCancel={()=>setEditPillIdx(null)} style={inlineCapsule} />
              ) : (
                <div onClick={()=> isEditable && setEditPillIdx(i)} style={{ cursor: isEditable ? 'pointer':'default' }}>{pills[i]}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Page number with line */}
      <div style={pageNumberContainerStyles}>
        {/* Small line */}
        <div style={smallLineStyles} />
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={handlePageNumberCancel}
            className="page-number-editor"
            style={{
              ...pageNumberStyles,
              width: '30px',
              height: 'auto'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
              ...pageNumberStyles,
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentPageNumber}
          </div>
        )}
      </div>

      {/* Footer Logo */}
      <div style={footerLogoStyles}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '16px', 
          height: '16px', 
          borderRadius: '50%', 
          backgroundColor: '#9CA3AF', 
          marginRight: '8px',
          fontSize: '12px',
          color: '#FFFFFF'
        }}>+</div>
        Your Logo
      </div>
    </div>
  );
};

export default ChangeManagementTabsSlideTemplate;

