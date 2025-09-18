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
  leftText: string;
  middleText: string;
  rightText: string;
  middlePanelColor?: string;
  avatarPath?: string;
}

export const CultureValuesThreeColumnsSlideTemplate: React.FC<CultureValuesThreeColumnsProps & { theme?: SlideTheme | string }> = ({
  slideId,
  logoText = 'Logo',
  logoPath = '',
  title = 'Our culture and values',
  leftText = 'Code of conduct and ethics.\n\nWe expect all employees to behave in an ethical and professional manner and to uphold the following principles: ...',
  middleText = 'HR policies, including time off, benefits, and compensation.\n\nOur HR policies are designed to support employees ...',
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
  const [editLeft, setEditLeft] = useState(false);
  const [editMiddle, setEditMiddle] = useState(false);
  const [editRight, setEditRight] = useState(false);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#EDEDED', color:'#222', fontFamily: 'Lora-Bold, serif', position:'relative' };
  const top: React.CSSProperties = { position:'absolute', left:0, right:0, top:0, height:'250px', background:'#E7E7E7', borderBottom:'1px solid #d8d8d8' };
  const logoStyle: React.CSSProperties = { position:'absolute', left:'48px', top:'48px', color:'#6b7280', fontSize:'22px' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'48px', top:'88px', fontSize:'56px', fontFamily: 'Lora-Bold, serif', color:'#242424' };
  const avatarWrap: React.CSSProperties = { position:'absolute', right:'48px', top:'48px', width:'115px', height:'115px', borderRadius:'50%', overflow:'hidden', background:'#000000', boxShadow:'0 0 0 2px rgba(0,0,0,0.06) inset' };

  const grid: React.CSSProperties = { position:'absolute', left:0, right:0, bottom:0, top:'250px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr' };
  const col: React.CSSProperties = { padding:'36px 42px', fontSize:'16px', lineHeight:1.6, color:'#5D5D5D', background:'#CCCCCC' };
  const mid: React.CSSProperties = { ...col, background: '#4231EA', color:'#ABA6EB' };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ ...base, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, whiteSpace:'pre-wrap' });

  return (
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
      <div style={titleStyle}>
        {isEditable && editTitle ? (
          <ImprovedInlineEditor initialValue={title} onSave={(v)=>{ onUpdate&&onUpdate({ title:v }); setEditTitle(false); }} onCancel={()=>setEditTitle(false)} style={inline(titleStyle)} />
        ) : (
          <div onClick={()=> isEditable && setEditTitle(true)} style={{ cursor: isEditable ? 'pointer':'default' }}>{title}</div>
        )}
      </div>
      <div style={avatarWrap}>
        <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate && onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ marginTop:'3px', width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
      </div>

      <div style={grid}>
        <div style={col}>
          {isEditable && editLeft ? (
            <ImprovedInlineEditor initialValue={leftText} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ leftText:v }); setEditLeft(false); }} onCancel={()=>setEditLeft(false)} style={inline(col)} />
          ) : (
            <div onClick={()=> isEditable && setEditLeft(true)} style={{ cursor: isEditable ? 'pointer':'default', whiteSpace:'pre-wrap' }}>{leftText}</div>
          )}
        </div>
        <div style={mid}>
          {isEditable && editMiddle ? (
            <ImprovedInlineEditor initialValue={middleText} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ middleText:v }); setEditMiddle(false); }} onCancel={()=>setEditMiddle(false)} style={inline(mid)} />
          ) : (
            <div onClick={()=> isEditable && setEditMiddle(true)} style={{ cursor: isEditable ? 'pointer':'default', whiteSpace:'pre-wrap' }}>{middleText}</div>
          )}
        </div>
        <div style={col}>
          {isEditable && editRight ? (
            <ImprovedInlineEditor initialValue={rightText} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ rightText:v }); setEditRight(false); }} onCancel={()=>setEditRight(false)} style={inline(col)} />
          ) : (
            <div onClick={()=> isEditable && setEditRight(true)} style={{ cursor: isEditable ? 'pointer':'default', whiteSpace:'pre-wrap' }}>{rightText}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CultureValuesThreeColumnsSlideTemplate;

