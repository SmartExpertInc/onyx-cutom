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
  slideId,
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
  pageNumber = '40',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editLogo, setEditLogo] = useState(false);
  const [editHeading, setEditHeading] = useState(false);
  const [editCol, setEditCol] = useState<{ idx: number; field: 'title' | 'body' } | null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#EFEFEF', color:'#111', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const top: React.CSSProperties = { position:'absolute', left:0, right:0, top:0, height:'250px', background:'#E0E7FF', borderBottom:'1px solid #d8d8d8' };
  const logoStyle: React.CSSProperties = { position:'absolute', left:'48px', top:'48px', color:'#6b7280', fontSize:'22px' };
  const headingStyle: React.CSSProperties = { position:'absolute', left:'48px', top:'90px', fontSize:'53px', fontWeight:800, color:'#202020' };
  const avatarWrap: React.CSSProperties = { position:'absolute', right:'48px', top:'36px', width:'170px', height:'170px', borderRadius:'50%', overflow:'hidden', background:'#0F58F9', boxShadow:'0 0 0 2px rgba(0,0,0,0.06) inset' };

  const grid: React.CSSProperties = { position:'absolute', left:0, right:0, bottom:0, top:'250px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr' };
  const colBase: React.CSSProperties = { padding:'32px 36px', background:'#0F58F9', color:'#FFFFFF', display:'grid', rowGap:'14px' };
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
      fontSize:'20px'
    };
  };
  const title: React.CSSProperties = { fontSize:'26px', fontWeight:800, letterSpacing:0.5 };
  const body: React.CSSProperties = { fontSize:'16px', lineHeight:1.6, opacity:0.7 };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ ...base, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, whiteSpace:'pre-wrap' });

  const saveCol = (idx: number, field: 'title' | 'body', value: string) => {
    const next = [...columns] as [BenefitColumn, BenefitColumn, BenefitColumn, BenefitColumn];
    next[idx] = { ...next[idx], [field]: value } as BenefitColumn;
    onUpdate && onUpdate({ columns: next });
    setEditCol(null);
  };

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
        onLogoUploaded={(p)=> onUpdate&&onUpdate({ logoPath:p })}
        isEditable={isEditable}
        color="#09090B"
        fontSize="17px"
        text={logoText}
        style={{ position:'absolute', left:'20px', top:'20px' }}
      />
      <div style={headingStyle}>
        {isEditable && editHeading ? (
          <ImprovedInlineEditor initialValue={heading} onSave={(v)=>{ onUpdate&&onUpdate({ heading:v }); setEditHeading(false); }} onCancel={()=>setEditHeading(false)} className="title-element" style={inline(headingStyle)} />
        ) : (
          <div className="title-element" onClick={()=> isEditable && setEditHeading(true)} style={{ cursor: isEditable ? 'pointer':'default' }}>{heading}</div>
        )}
      </div>
      <div style={avatarWrap}>
        <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
      </div>

      <div style={grid}>
        {columns.map((c, i)=> (
          <div key={i} style={c.accent ? colAccent : colBase}>
            <div className="number-badge" style={numberBadge(i+1)}>{i+1}</div>

            <div>
              {isEditable && editCol && editCol.idx===i && editCol.field==='title' ? (
                <ImprovedInlineEditor initialValue={c.title} onSave={(v)=> saveCol(i,'title',v)} onCancel={()=> setEditCol(null)} className="title-element" style={inline(title)} />
              ) : (
                <div className="title-element" onClick={()=> isEditable && setEditCol({ idx:i, field:'title' })} style={{ ...title, cursor: isEditable ? 'pointer':'default' }}>{c.title}</div>
              )}
            </div>
            <div>
              {isEditable && editCol && editCol.idx===i && editCol.field==='body' ? (
                <ImprovedInlineEditor initialValue={c.body} multiline={true} onSave={(v)=> saveCol(i,'body',v)} onCancel={()=> setEditCol(null)} style={inline(body)} />
              ) : (
                <div onClick={()=> isEditable && setEditCol({ idx:i, field:'body' })} style={{ ...body, cursor: isEditable ? 'pointer':'default', whiteSpace:'pre-wrap' }}>{c.body}</div>
              )}
            </div>
          </div>
        ))}
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
          backgroundColor: 'rgba(255, 255, 255, 0.7)'
        }} />
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={handlePageNumberCancel}
            className="page-number-editor"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '19px',
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
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '19px',
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
    </div>
  );
};

export default BenefitsAndPerksColumnsSlideTemplate;

