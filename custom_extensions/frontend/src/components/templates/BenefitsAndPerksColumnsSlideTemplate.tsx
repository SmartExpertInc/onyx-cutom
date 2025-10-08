// custom_extensions/frontend/src/components/templates/BenefitsAndPerksColumnsSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';

export interface BenefitColumn { title: string; body: string; accent?: boolean; }

export interface BenefitsAndPerksColumnsProps extends BaseTemplateProps {
  logoText?: string;
  logoPath?: string;
  heading: string;
  avatarPath?: string;
  columns: [BenefitColumn, BenefitColumn, BenefitColumn, BenefitColumn];
  pageNumber?: string;
}

export const BenefitsAndPerksColumnsSlideTemplate: React.FC<BenefitsAndPerksColumnsProps & { theme?: SlideTheme | string }> = ({
  slideId: _slideId,
  logoText = 'Your Logo',
  logoPath = '',
  heading = 'Our culture and values',
  avatarPath = '',
  columns = [
    { title: 'Health and Wellness', body: 'Medical, dental, and vision insurance.Wellness programs and resources (gym memberships, fitness classes, mental health resources).' },
    { title: 'Financial Benefits', body: '401(k) retirement savings plan; Life insurance and disability coverage; Flexible spending accounts (FSA) for healthcare and dependent care expenses.', accent: true },
    { title: 'Time off and work-life balance', body: 'Paid time off (PTO) for vacation, sick days, and holidays; Flexible work arrangements (remote work, flexible schedules); Parental leave and family care leave.' },
    { title: 'Professional Development', body: 'Tuition reimbursement for continued education; Professional development funds for training and conferences; Mentorship and coaching programs.', accent: true }
  ],
  pageNumber: _pageNumber = '40',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  // Editing state
  const [editingHeading, setEditingHeading] = useState(false);
  const [editingColumns, setEditingColumns] = useState<{ idx: number; field: 'title' | 'body' } | null>(null);
  
  // Current values state
  const [currentHeading, setCurrentHeading] = useState(heading);
  const [currentColumns, setCurrentColumns] = useState(columns);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#EFEFEF', color:'#111', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const top: React.CSSProperties = { position:'absolute', left:0, right:0, top:0, height:'250px', background:'#E0E7FF', borderBottom:'1px solid #d8d8d8' };
  const _logoStyle: React.CSSProperties = { position:'absolute', left:'48px', top:'48px', color:'#6b7280', fontSize:'22px' };
  const headingStyle: React.CSSProperties = { position:'absolute', left:'48px', top:'90px', fontSize:'58px', fontWeight:800, color:'#09090B', lineHeight:1.2, maxWidth:'900px' };
  const avatarWrap: React.CSSProperties = { position:'absolute', top:'36px', right:'48px', width:'170px', height:'170px', borderRadius:'50%', backgroundColor:'#0F58F9', overflow:'hidden' };

  const grid: React.CSSProperties = { position:'absolute', left:0, right:0, bottom:0, top:'250px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr' };
  const colBase: React.CSSProperties = { padding:'32px 32px', background:'#0F58F9', color:'#FFFFFF', position:'relative' };
  const colAccent: React.CSSProperties = { ...colBase, background:'#FFFFFF', color:'#0F58F9' };
  const numberBadge = (n: number): React.CSSProperties => {
    const isAccent = n === 2 || n === 4;
    return {
      width:'35px',
      height:'35px',
      borderRadius:'4px',
      background: isAccent ? '#0F58F9' : '#FFFFFF',
      color: isAccent ? '#FFFFFF' : '#0F58F9',
      display:'inline-flex',
      alignItems:'center',
      justifyContent:'center',
      fontWeight:700,
      fontSize:'20px',
      marginBottom:'25px'
    };
  };
  const title: React.CSSProperties = { fontSize:'26px', fontWeight:800, letterSpacing:0.5, lineHeight:1.3 };
  const titleAccent: React.CSSProperties = { ...title, color:'#09090B' };
  const body: React.CSSProperties = { fontSize:'16px', opacity:0.7, lineHeight:1.3, position:'absolute', top:'268px', left:'32px', right:'32px' };
  const bodyAccent: React.CSSProperties = { fontSize:'16px', color:'#09090B', opacity:0.7, lineHeight:1.3, position:'absolute', top:'268px', left:'32px', right:'32px' };

  // Editor styles that maintain layout without absolute positioning
  const titleEditor = (isAccent: boolean): React.CSSProperties => ({
    fontSize: '26px',
    fontWeight: 800,
    letterSpacing: 0.5,
    lineHeight: 1.3,
    color: isAccent ? '#09090B' : 'inherit',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    margin: 0,
    width: '100%',
    height: 'auto',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowWrap: 'break-word'
  });

  const bodyEditor = (isAccent: boolean): React.CSSProperties => ({
    fontSize: '16px',
    opacity: 0.7,
    lineHeight: 1.3,
    color: isAccent ? '#09090B' : 'inherit',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    margin: 0,
    width: '100%',
    height: 'auto',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    position: 'absolute',
    top: '268px',
    left: '32px',
    right: '32px'
  });

  // Save handlers
  const handleHeadingSave = (newHeading: string) => {
    setCurrentHeading(newHeading);
    setEditingHeading(false);
    if (onUpdate) {
      onUpdate({ ...{ logoText, logoPath, heading, avatarPath, columns, pageNumber: _pageNumber }, heading: newHeading });
    }
  };

  const handleColumnSave = (idx: number, field: 'title' | 'body', value: string) => {
    const newColumns = [...currentColumns] as [BenefitColumn, BenefitColumn, BenefitColumn, BenefitColumn];
    newColumns[idx] = { ...newColumns[idx], [field]: value };
    setCurrentColumns(newColumns);
    setEditingColumns(null);
    if (onUpdate) {
      onUpdate({ ...{ logoText, logoPath, heading, avatarPath, columns, pageNumber: _pageNumber }, columns: newColumns });
    }
  };

  const handleLogoPathUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ logoText, logoPath, heading, avatarPath, columns, pageNumber: _pageNumber }, logoPath: newLogoPath });
    }
  };

  const handleAvatarPathUploaded = (newAvatarPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ logoText, logoPath, heading, avatarPath, columns, pageNumber: _pageNumber }, avatarPath: newAvatarPath });
    }
  };

  return (
    <div className="benefits-perks-columns inter-theme" style={slide}>
      <style>{`
        .benefits-perks-columns *:not(.title-element):not(.number-badge) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .benefits-perks-columns .title-element {
          font-family: "Lora", serif !important;
          font-weight: 500 !important;
        }
        .benefits-perks-columns .number-badge {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 700 !important;
        }
      `}</style>
      <div style={top} />
      <YourLogo
        logoPath={logoPath}
        onLogoUploaded={handleLogoPathUploaded}
        isEditable={isEditable}
        color="#09090B"
        fontSize="17px"
        text={logoText}
        style={{ position:'absolute', left:'20px', top:'20px' }}
      />
      <div style={headingStyle}>
        {isEditable && editingHeading ? (
          <ImprovedInlineEditor 
            initialValue={currentHeading} 
            onSave={handleHeadingSave} 
            onCancel={() => setEditingHeading(false)} 
            className="title-element" 
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: 0,
              margin: 0,
              width: '100%',
              height: 'auto'
            }} 
          />
        ) : (
          <div 
            className="title-element" 
            onClick={() => isEditable && setEditingHeading(true)} 
            style={{ cursor: isEditable ? 'pointer' : 'default', userSelect: 'none' }}
          >
            {currentHeading}
          </div>
        )}
      </div>
      <div style={avatarWrap}>
        <ClickableImagePlaceholder 
          imagePath={avatarPath} 
          onImageUploaded={handleAvatarPathUploaded} 
          size="LARGE" 
          position="CENTER" 
          description="Avatar" 
          isEditable={isEditable} 
          style={{ width:'110%', height:'110%', borderRadius:'50%', position:'relative', bottom:'-10px', left:'50%', transform:'translateX(-50%)', objectFit:'cover' }} 
        />
      </div>

      <div style={grid}>
        {currentColumns.map((c, i) => (
          <div key={i} style={c.accent ? colAccent : colBase}>
            <div className="number-badge" style={numberBadge(i+1)}>{i+1}</div>
            {isEditable && editingColumns && editingColumns.idx === i && editingColumns.field === 'title' ? (
              <ImprovedInlineEditor 
                initialValue={c.title} 
                onSave={(v) => handleColumnSave(i, 'title', v)} 
                onCancel={() => setEditingColumns(null)} 
                className="title-element" 
                style={titleEditor(!!c.accent)} 
              />
            ) : (
              <div 
                className="title-element" 
                onClick={() => isEditable && setEditingColumns({ idx: i, field: 'title' })} 
                style={{ ...(c.accent ? titleAccent : title), cursor: isEditable ? 'pointer' : 'default', userSelect: 'none' }}
              >
                {c.title}
              </div>
            )}
            {isEditable && editingColumns && editingColumns.idx === i && editingColumns.field === 'body' ? (
              <ImprovedInlineEditor 
                initialValue={c.body} 
                multiline={true} 
                onSave={(v) => handleColumnSave(i, 'body', v)} 
                onCancel={() => setEditingColumns(null)} 
                style={bodyEditor(!!c.accent)} 
              />
            ) : (
              <div 
                onClick={() => isEditable && setEditingColumns({ idx: i, field: 'body' })} 
                style={{ ...(c.accent ? bodyAccent : body), cursor: isEditable ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'pre-wrap' }}
              >
                {c.body}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenefitsAndPerksColumnsSlideTemplate;

