// custom_extensions/frontend/src/components/templates/CultureValuesThreeColumnsSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';

export interface CultureValuesThreeColumnsProps extends BaseTemplateProps {
  logoText?: string;
  logoPath?: string;
  title: string;
  leftTitle: string;
  leftText: string;
  middleTitle: string;
  middleText: string;
  rightTitle: string;
  rightText: string;
  middlePanelColor?: string;
  avatarPath?: string;
}

export const CultureValuesThreeColumnsSlideTemplate: React.FC<CultureValuesThreeColumnsProps & { theme?: SlideTheme | string }> = ({
  slideId,
  logoText = 'Logo',
  logoPath = '',
  title = 'Our culture and values',
  leftTitle = 'Code of Conduct',
  leftText = 'Code of conduct and ethics.\n\nWe expect all employees to behave in an ethical and professional manner and to uphold the following principles: ...',
  middleTitle = 'HR Policies',
  middleText = 'HR policies, including time off, benefits, and compensation.\n\nOur HR policies are designed to support employees ...',
  rightTitle = 'IT Policies',
  rightText = 'IT policies, including data security and acceptable use.\n\nSecure password management and protection of company data ...',
  middlePanelColor = '#3B46FF',
  avatarPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editLogo, setEditLogo] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [editLeftTitle, setEditLeftTitle] = useState(false);
  const [editLeft, setEditLeft] = useState(false);
  const [editMiddleTitle, setEditMiddleTitle] = useState(false);
  const [editMiddle, setEditMiddle] = useState(false);
  const [editRightTitle, setEditRightTitle] = useState(false);
  const [editRight, setEditRight] = useState(false);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#E0E7FF', color:'black', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const top: React.CSSProperties = { position:'absolute', left:0, right:0, top:0, height:'250px', background:'#E0E7FF', borderBottom:'1px solid #d8d8d8' };
  const logoStyle: React.CSSProperties = { position:'absolute', left:'48px', top:'48px', color:'#6b7280', fontSize:'22px' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'48px', top:'88px', fontSize:'56px', fontWeight:800, color:'#242424' };
  const avatarWrap: React.CSSProperties = { position:'absolute', right:'48px', top:'48px', width:'150px', height:'150px', borderRadius:'50%', overflow:'hidden', background:'#0F58F9', boxShadow:'0 0 0 2px rgba(0,0,0,0.06) inset' };

  const grid: React.CSSProperties = { position:'absolute', left:0, right:0, bottom:0, top:'250px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr' };
  const col: React.CSSProperties = { padding:'30px 28px', fontSize:'16px', lineHeight:1.6, color:'black', background:'#0F58F9' };
  const mid: React.CSSProperties = { padding:'30px 35px', fontSize:'16px', lineHeight:1.6, color:'black', background:'#FFFFFF' };
  const cardTitleStyle: React.CSSProperties = { fontSize:'20px', fontWeight:700, marginBottom:'16px', color:'#FFFFFF' };
  const cardTitleStyleMid: React.CSSProperties = { fontSize:'24px', fontWeight:700, marginBottom:'16px', color:'#000000' };
  const pageNumberStyle: React.CSSProperties = { position:'absolute', bottom:'24px', left:'48px', color:'#FFFFFF', fontSize:'13px', fontWeight:400 };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ ...base, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, whiteSpace:'pre-wrap' });

  return (
    <>
      <style>{`
          .card-value-text *:not(.culture-value-title) {
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          }
          .culture-value-title {
            font-family: "Lora", serif !important;
            font-weight: 800 !important;
          }
          .main-title {
            font-weight: 900 !important;
          }
          .card-title {
            font-weight: 800 !important;
          }
          .card-title-left {
            color: #FFFFFF !important;
          }
          .card-title-middle {
            color: #000000 !important;
          }
          .card-title-right {
            color: #FFFFFF !important;
          }
      `}</style>
      <div className="culture-values-three-columns inter-theme" style={slide}>
        <div style={top} />
        <YourLogo
          logoPath={logoPath}
          onLogoUploaded={(p)=> onUpdate && onUpdate({ logoPath: p })}
          isEditable={isEditable}
          color="#6b7280"
          text={logoText}
          style={{ position:'absolute', left:'48px', top:'48px' }}
        />
        <div className="culture-value-title main-title" style={titleStyle}>
          {isEditable && editTitle ? (
            <ImprovedInlineEditor initialValue={title} onSave={(v)=>{ onUpdate&&onUpdate({ title:v }); setEditTitle(false); }} onCancel={()=>setEditTitle(false)} style={inline(titleStyle)} />
          ) : (
            <div onClick={()=> isEditable && setEditTitle(true)} style={{ cursor: isEditable ? 'pointer':'default' }}>{title}</div>
          )}
        </div>
        <div style={avatarWrap}>
          <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate && onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ marginTop:'3px', width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
        </div>

        <div className="card-value-text" style={grid}>
          <div style={col}>
            <div className="culture-value-title card-title card-title-left" style={cardTitleStyle}>
              {isEditable && editLeftTitle ? (
                <ImprovedInlineEditor initialValue={leftTitle} onSave={(v)=>{ onUpdate&&onUpdate({ leftTitle:v }); setEditLeftTitle(false); }} onCancel={()=>setEditLeftTitle(false)} style={inline(cardTitleStyle)} />
              ) : (
                <div onClick={()=> isEditable && setEditLeftTitle(true)} style={{ cursor: isEditable ? 'pointer':'default' }}>{leftTitle}</div>
              )}
            </div>
            {isEditable && editLeft ? (
              <ImprovedInlineEditor initialValue={leftText} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ leftText:v }); setEditLeft(false); }} onCancel={()=>setEditLeft(false)} style={inline(col)} />
            ) : (
              <div onClick={()=> isEditable && setEditLeft(true)} style={{ cursor: isEditable ? 'pointer':'default', whiteSpace:'pre-wrap' }}>{leftText}</div>
            )}
          </div>
          <div style={mid}>
            <div className="culture-value-title card-title card-title-middle" style={cardTitleStyleMid}>
              {isEditable && editMiddleTitle ? (
                <ImprovedInlineEditor initialValue={middleTitle} onSave={(v)=>{ onUpdate&&onUpdate({ middleTitle:v }); setEditMiddleTitle(false); }} onCancel={()=>setEditMiddleTitle(false)} style={inline(cardTitleStyleMid)} />
              ) : (
                <div onClick={()=> isEditable && setEditMiddleTitle(true)} style={{ cursor: isEditable ? 'pointer':'default' }}>{middleTitle}</div>
              )}
            </div>
            {isEditable && editMiddle ? (
              <ImprovedInlineEditor initialValue={middleText} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ middleText:v }); setEditMiddle(false); }} onCancel={()=>setEditMiddle(false)} style={inline(mid)} />
            ) : (
              <div onClick={()=> isEditable && setEditMiddle(true)} style={{ cursor: isEditable ? 'pointer':'default', whiteSpace:'pre-wrap' }}>{middleText}</div>
            )}
          </div>
          <div style={col}>
            <div className="culture-value-title card-title card-title-right" style={cardTitleStyle}>
              {isEditable && editRightTitle ? (
                <ImprovedInlineEditor initialValue={rightTitle} onSave={(v)=>{ onUpdate&&onUpdate({ rightTitle:v }); setEditRightTitle(false); }} onCancel={()=>setEditRightTitle(false)} style={inline(cardTitleStyle)} />
              ) : (
                <div onClick={()=> isEditable && setEditRightTitle(true)} style={{ cursor: isEditable ? 'pointer':'default' }}>{rightTitle}</div>
              )}
            </div>
            {isEditable && editRight ? (
              <ImprovedInlineEditor initialValue={rightText} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ rightText:v }); setEditRight(false); }} onCancel={()=>setEditRight(false)} style={inline(col)} />
            ) : (
              <div onClick={()=> isEditable && setEditRight(true)} style={{ cursor: isEditable ? 'pointer':'default', whiteSpace:'pre-wrap' }}>{rightText}</div>
            )}
          </div>
        </div>
        
        {/* Page number */}
        <div style={pageNumberStyle}>40</div>
      </div>
    </>
  );
};

export default CultureValuesThreeColumnsSlideTemplate;

