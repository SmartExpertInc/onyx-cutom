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
}

export const BenefitsAndPerksColumnsSlideTemplate: React.FC<BenefitsAndPerksColumnsProps & { theme?: SlideTheme | string }> = ({
  slideId,
  logoText = 'Logo',
  logoPath = '',
  heading = 'Benefits and Perks',
  avatarPath = '',
  columns = [
    { title: 'HEALTH AND WELLNESS', body: 'Medical, dental, and vision insurance....' },
    { title: 'FINANCIAL BENEFITS', body: '401(k) retirement savings plan; ...', accent: true },
    { title: 'TIME OFF AND WORK-LIFE BALANCE', body: 'Paid time off (PTO) ...' },
    { title: 'PROFESSIONAL DEVELOPMENT', body: 'Tuition reimbursement for continued education; ...', accent: true }
  ],
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editLogo, setEditLogo] = useState(false);
  const [editHeading, setEditHeading] = useState(false);
  const [editCol, setEditCol] = useState<{ idx: number; field: 'title' | 'body' } | null>(null);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#EFEFEF', color:'#111', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const top: React.CSSProperties = { position:'absolute', left:0, right:0, top:0, height:'180px', background:'#E7E7E7', borderBottom:'1px solid #d8d8d8' };
  const logoStyle: React.CSSProperties = { position:'absolute', left:'48px', top:'48px', color:'#6b7280', fontSize:'22px' };
  const headingStyle: React.CSSProperties = { position:'absolute', left:'48px', top:'90px', fontSize:'64px', fontWeight:800, color:'#2b2b2b' };
  const avatarWrap: React.CSSProperties = { position:'absolute', right:'48px', top:'36px', width:'96px', height:'96px', borderRadius:'50%', overflow:'hidden', background:'#ffffff', boxShadow:'0 0 0 2px rgba(0,0,0,0.06) inset' };

  const grid: React.CSSProperties = { position:'absolute', left:0, right:0, bottom:0, top:'180px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr' };
  const colBase: React.CSSProperties = { padding:'32px 36px', background:'#D8D8D8', display:'grid', rowGap:'14px' };
  const colAccent: React.CSSProperties = { ...colBase, background:'#3B46FF', color:'#E2E5FF' };
  const numberBadge = (n: number): React.CSSProperties => ({ width:'32px', height:'32px', borderRadius:'50%', background:'#111', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'16px' });
  const title: React.CSSProperties = { fontSize:'26px', fontWeight:800, letterSpacing:0.5 };
  const body: React.CSSProperties = { fontSize:'16px', lineHeight:1.6 };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ ...base, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, whiteSpace:'pre-wrap' });

  const saveCol = (idx: number, field: 'title' | 'body', value: string) => {
    const next = [...columns] as [BenefitColumn, BenefitColumn, BenefitColumn, BenefitColumn];
    next[idx] = { ...next[idx], [field]: value } as BenefitColumn;
    onUpdate && onUpdate({ columns: next });
    setEditCol(null);
  };

  return (
    <div className="benefits-perks-columns inter-theme" style={slide}>
      <div style={top} />
      <YourLogo
        logoPath={logoPath}
        onLogoUploaded={(p)=> onUpdate&&onUpdate({ logoPath:p })}
        isEditable={isEditable}
        color="#6b7280"
        text={logoText}
        style={{ position:'absolute', left:'48px', top:'48px' }}
      />
      <div style={headingStyle}>
        {isEditable && editHeading ? (
          <ImprovedInlineEditor initialValue={heading} onSave={(v)=>{ onUpdate&&onUpdate({ heading:v }); setEditHeading(false); }} onCancel={()=>setEditHeading(false)} style={inline(headingStyle)} />
        ) : (
          <div onClick={()=> isEditable && setEditHeading(true)} style={{ cursor: isEditable ? 'pointer':'default' }}>{heading}</div>
        )}
      </div>
      <div style={avatarWrap}>
        <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
      </div>

      <div style={grid}>
        {columns.map((c, i)=> (
          <div key={i} style={c.accent ? colAccent : colBase}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={numberBadge(i+1)}>{i+1}</div>
            </div>
            <div>
              {isEditable && editCol && editCol.idx===i && editCol.field==='title' ? (
                <ImprovedInlineEditor initialValue={c.title} onSave={(v)=> saveCol(i,'title',v)} onCancel={()=> setEditCol(null)} style={inline(title)} />
              ) : (
                <div onClick={()=> isEditable && setEditCol({ idx:i, field:'title' })} style={{ ...title, cursor: isEditable ? 'pointer':'default' }}>{c.title}</div>
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
    </div>
  );
};

export default BenefitsAndPerksColumnsSlideTemplate;

