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
  logoText = 'Your Logo',
  logoPath = '',
  heading = 'Our culture and values',
  avatarPath = '',
  columns = [
    { title: 'Health and Wellness', body: 'Medical, dental, and vision insurance. Wellness programs and resources (gym memberships, fitness classes, mental health resources).' },
    { title: 'Financial Benefits', body: '401(k) retirement savings plan; Life insurance and disability coverage; Flexible spending accounts (FSA) for healthcare and dependent care expenses.' },
    { title: 'Time off and work-life balance', body: 'Paid time off (PTO) for vacation, sick days, and holidays; Flexible work arrangements (remote work, flexible schedules); Parental leave and family care leave.' },
    { title: 'Professional Development', body: 'Tuition reimbursement for continued education; Professional development funds for training and conferences; Mentorship and coaching programs.' }
  ],
  isEditable = false,
  onUpdate,
  theme
}: BenefitsAndPerksColumnsProps & { theme?: SlideTheme | string }) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editLogo, setEditLogo] = useState(false);
  const [editHeading, setEditHeading] = useState(false);
  const [editCol, setEditCol] = useState<{ idx: number; field: 'title' | 'body' } | null>(null);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#F5F5F5', color:'#111', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const top: React.CSSProperties = { position:'absolute', left:0, right:0, top:0, height:'240px', background:'#E5E5E5' };
  const logoStyle: React.CSSProperties = { position:'absolute', left:'48px', top:'48px', color:'#000', fontSize:'16px', fontWeight:500 };
  const headingStyle: React.CSSProperties = { position:'absolute', left:'50%', top:'50%', transform:'translate(-50%, -50%)', fontSize:'48px', fontWeight:400, color:'#2D2D2D', fontFamily:'serif', textAlign:'center', margin:0, padding:0 };
  const avatarWrap: React.CSSProperties = { position:'absolute', right:'48px', top:'48px', width:'80px', height:'80px', borderRadius:'50%', overflow:'hidden', background:'#2563EB', boxShadow:'none' };

  const grid: React.CSSProperties = { position:'absolute', left:0, right:0, bottom:0, top:'240px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr' };
  const colBase: React.CSSProperties = { padding:'40px 32px', background:'#FFFFFF', display:'flex', flexDirection:'column', gap:'20px' };
  const colAccent: React.CSSProperties = { ...colBase, background:'#2563EB', color:'#FFFFFF' };
  
  const numberBadge = (n: number): React.CSSProperties => {
    const isBlueColumn = n === 1 || n === 3; // Колонки 1 и 3 синие
    return {
      width:'36px',
      height:'36px',
      borderRadius:'6px',
      background: isBlueColumn ? '#FFFFFF' : '#2563EB',
      color: isBlueColumn ? '#2563EB' : '#FFFFFF',
      border: isBlueColumn ? '2px solid #2563EB' : '2px solid #FFFFFF',
      display:'inline-flex',
      alignItems:'center',
      justifyContent:'center',
      fontWeight:600,
      fontSize:'18px',
      fontFamily:'sans-serif'
    };
  };
  
  const title: React.CSSProperties = { fontSize:'28px', fontWeight:600, letterSpacing:0, color:'inherit', fontFamily:'sans-serif' };
  const body: React.CSSProperties = { fontSize:'16px', lineHeight:1.5, color:'inherit', fontFamily:'sans-serif' };

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
        onLogoUploaded={(p: string)=> onUpdate&&onUpdate({ logoPath:p })}
        isEditable={isEditable}
        color="#000000"
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
        <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p: string)=> onUpdate&&onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
      </div>

      <div style={grid}>
        {columns.map((c, i)=> {
          const isBlueColumn = i === 0 || i === 2; // Колонки 1 и 3 синие (индексы 0 и 2)
          const columnStyle = isBlueColumn ? colAccent : colBase;
          
          return (
            <div key={i} style={columnStyle}>
              <div style={{ display:'flex', alignItems:'center' }}>
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
          );
        })}
      </div>
    </div>
  );
};

export default BenefitsAndPerksColumnsSlideTemplate;

