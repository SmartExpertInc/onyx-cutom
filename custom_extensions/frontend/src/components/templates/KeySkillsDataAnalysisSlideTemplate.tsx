// custom_extensions/frontend/src/components/templates/KeySkillsDataAnalysisSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';

export interface KeySkillsDataAnalysisProps extends BaseTemplateProps {
  heading: string;
  items: string[]; // 5 items with numbers
  avatarImagePath?: string;
  logoPath?: string;
  pageNumber?: string;
}

export const KeySkillsDataAnalysisSlideTemplate: React.FC<KeySkillsDataAnalysisProps & { theme?: SlideTheme | string }> = ({
  slideId: _slideId,
  heading = 'Key skills\nfor data analysis:',
  items = [
    'Sorting and filtering data.',
    'Formulas and functions.',
    'Pivot tables.',
    'Data validation.',
    'Charts and graphs.'
  ],
  avatarImagePath = '',
  logoPath = '',
  pageNumber = '36',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editHeading, setEditHeading] = useState(false);
  const [editItem, setEditItem] = useState<number | null>(null);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#FFFFFF', color:'#26362C', fontFamily: currentTheme.fonts.titleFont, position:'relative', display:'grid', gridTemplateColumns:'35% 65%', gap:'0px', padding:'0px' };
  const leftSection: React.CSSProperties = { background:'linear-gradient(180deg, #0F58F9 0%, #1023A1 100%)', padding:'56px', position:'relative' };
  const rightSection: React.CSSProperties = { background:'#E0E7FF', padding:'56px 32px' };
  const headingStyle: React.CSSProperties = { fontSize:'56px', fontWeight:800, color:'#FFFFFF', lineHeight:1.2, position:'absolute', top:'100px', left:'56px', maxWidth:'calc(100% - 112px)' };
  const list: React.CSSProperties = { display:'flex', flexDirection:'column', gap:'22px' };
  const row: React.CSSProperties = { display:'grid', gridTemplateColumns:'45px 1fr', alignItems:'center', columnGap:'18px' };
  const numSquare: React.CSSProperties = { width:'43px', height:'43px', backgroundColor:'#0F58F9', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center' };
  const num: React.CSSProperties = { fontSize:'28px', color:'#FFFFFF', fontWeight:700, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" };
  const text: React.CSSProperties = { fontSize:'36px', color:'#09090B', fontFamily: "'Lora', serif", opacity: 0.8 };

  const avatarWrap: React.CSSProperties = { position:'absolute', bottom:'60px', left:'56px', width:'170px', height:'170px', borderRadius:'50%', backgroundColor:'#FFFFFF', overflow:'hidden', border: '2px solid #E5E7EB' };
  const avatarImage: React.CSSProperties = { width:'110%', height:'110%', borderRadius:'50%', position:'relative', bottom:'-10px', left:'50%', transform:'translateX(-50%)', objectFit:'cover' };

  const inlineHeading = { ...headingStyle, background:'transparent', border:'none', outline:'none', padding:0, margin:0 } as React.CSSProperties;
  const inlineText = { ...text, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, fontFamily: "'Lora', serif", fontSize:'36px', opacity: 0.8 } as React.CSSProperties;

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setEditingPageNumber(false);
  };

  return (
    <div className="key-skills-data-analysis inter-theme" style={slide}>
      <style>{`
        .key-skills-data-analysis *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .key-skills-data-analysis .title-element {
          font-family: "Lora", serif !important;
          font-weight: 500 !important;
        } 
      `}</style>
      {/* Left Section - Heading and Avatar */}
      <div style={leftSection}>
        {isEditable && editHeading ? (
          <ImprovedInlineEditor initialValue={heading} onSave={(v)=>{ onUpdate&&onUpdate({ heading:v }); setEditHeading(false); }} onCancel={()=>setEditHeading(false)} className="title-element" style={inlineHeading} />
        ) : (
          <div className="title-element" onClick={()=> isEditable && setEditHeading(true)} style={{ ...headingStyle, cursor: isEditable ? 'pointer':'default', whiteSpace:'pre-line' }}>{heading}</div>
        )}
        <div style={avatarWrap}>
          <ClickableImagePlaceholder 
            imagePath={avatarImagePath} 
            onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarImagePath:p })} 
            size="LARGE" 
            position="CENTER" 
            description="Avatar image" 
            isEditable={isEditable} 
            style={avatarImage} 
          />
        </div>
      </div>
      {/* Right Section - Numbered List */}
      <div style={{...rightSection, ...list}}>
        {items.map((it, i)=> (
          <div key={i} style={row}>
            <div style={numSquare}>
              <div style={num}>{String(i+1)}</div>
            </div>
            <div>
              {isEditable && editItem === i ? (
                <ImprovedInlineEditor initialValue={it} onSave={(v)=>{ const next=[...items]; next[i]=v; onUpdate&&onUpdate({ items: next }); setEditItem(null); }} onCancel={()=>setEditItem(null)} className="title-element" style={inlineText} />
              ) : (
                <div className="title-element" onClick={()=> isEditable && setEditItem(i)} style={{ ...text, cursor: isEditable ? 'pointer':'default' }}>{it}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Logo */}
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        {logoPath ? (
          <ClickableImagePlaceholder
            imagePath={logoPath}
            onImageUploaded={(p) => onUpdate && onUpdate({ logoPath: p })}
            size="SMALL"
            position="CENTER"
            description="Your Logo"
            isEditable={isEditable}
            style={{ height: '30px', maxWidth: '120px', objectFit: 'contain' }}
          />
        ) : (
          <div
            onClick={() => isEditable && setShowLogoUpload(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isEditable ? 'pointer' : 'default'
            }}
          >
            <div style={{
              width: '30px',
              height: '30px',
              border: '2px solid #ffffff',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: '#ffffff', position: 'absolute' }} />
              <div style={{ width: '2px', height: '12px', backgroundColor: '#ffffff', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 400, color: '#ffffff', fontFamily: currentTheme.fonts.contentFont }}>Your Logo</span>
          </div>
        )}
      </div>

      {/* Page number with line */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '0px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Small line */}
        <div style={{
          width: '20px',
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.6)'
        }} />
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={handlePageNumberCancel}
            className="page-number-editor"
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '17px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
              width: '30px',
              height: 'auto'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '17px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentPageNumber}
          </div>
        )}
      </div>

      {showLogoUpload && (
        <PresentationImageUpload
          isOpen={showLogoUpload}
          onClose={() => setShowLogoUpload(false)}
          onImageUploaded={(p: string) => { onUpdate && onUpdate({ logoPath: p }); setShowLogoUpload(false); }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default KeySkillsDataAnalysisSlideTemplate;

