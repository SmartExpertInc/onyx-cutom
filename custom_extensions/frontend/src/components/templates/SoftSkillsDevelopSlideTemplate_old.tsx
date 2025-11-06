// custom_extensions/frontend/src/components/templates/SoftSkillsDevelopSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';

export interface SoftSkillsDevelopProps extends BaseTemplateProps {
  title: string;
  items: Array<{ title: string; body: string }>;
  rightImagePath?: string;
  logoText?: string;
  logoPath?: string;
  pageNumber?: string;
}

export const SoftSkillsDevelopSlideTemplate_old: React.FC<SoftSkillsDevelopProps & { theme?: SlideTheme | string }> = ({
  title = 'How To Develop\nSoft Skills',
  items = [
    { title:'Be an Active Listener', body:'Active listening helps better understand others and fosters meaningful connections.' },
    { title:'Seek Feedback', body:'Seeking feedback helps identify areas for improvement and personal growth' },
    { title:'Join Training Programs', body:'Training programs and courses provide structured learning and expert insights on soft skills' },
    { title:'Practice Empathy', body:'Empathy and patience build trust and create positive relationships with others.' }
  ],
  rightImagePath = '',
  logoText = 'Your Logo',
  logoPath = '',
  pageNumber = '35',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [edit, setEdit] = useState<{ k:string; i?:number; f?:'title'|'body' } | null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#FFFFFF', color:'#1F2937', fontFamily: currentTheme.fonts.titleFont, position:'relative', display:'grid', gridTemplateColumns:'1fr 520px' };
  const left: React.CSSProperties = { padding: "72px 85px 72px 50px", position:'relative' };
  const titleStyle: React.CSSProperties = { fontSize:'60px', fontWeight:800, color:'#222', lineHeight:0.95, whiteSpace:'pre-line', marginTop:'20px' };
  const grid: React.CSSProperties = { marginTop:'70px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'46px 60px' };
  const itemTitle: React.CSSProperties = { fontSize:'22px', fontWeight:600, color:'black' };
  const itemBody: React.CSSProperties = { marginTop:'10px', fontSize:'14px', color:'#3A3A3C', lineHeight:1.5 };
  const pageNumberStyle: React.CSSProperties = { position:'absolute', bottom:'24px', left:'0px', color:'#1F2937', fontSize:'16px', fontWeight:600, fontFamily:'Inter, sans-serif' };

  const right: React.CSSProperties = { position:'relative'};
  const imageArea: React.CSSProperties = { position:'absolute', left:'-18px', right:0, top:0, bottom:0, background: 'linear-gradient(to bottom, #0F58F9, #1023A1)', height:'100%' };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ ...base, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, whiteSpace:'pre-wrap' });

  return (
    <>
      <style>{`
        .softskills-title {
          font-weight: 600 !important;
          font-family: "Lora", serif !important;
        }
        .softskills-item-title {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 600 !important;
        }
        .softskills-item-desk * {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .softskills-page-number * {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .softskills-logo * {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      <div className="softskills-develop inter-theme" style={slide}>
        <div style={left}>
          <div className="softskills-logo">
            <YourLogo
              logoPath={logoPath}
              onLogoUploaded={(p)=> onUpdate && onUpdate({ logoPath: p })}
              isEditable={isEditable}
              color="#000000"
              text={logoText}
              style={{ position:'absolute', top:'20px', left:'20px', fontFamily: 'Inter, sans-serif !important' }}
            />
          </div>
          {isEditable && edit?.k==='title' ? (
            <ImprovedInlineEditor initialValue={title} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ title:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(titleStyle)} />
          ) : (
            <div className="softskills-title" onClick={()=> isEditable && setEdit({ k:'title' })} style={{ ...titleStyle, cursor: isEditable ? 'pointer':'default' }}>{title}</div>
          )}
          <div style={grid}>
            {items.map((it, i)=> (
              <div key={i}>
                <div className="softskills-item-title" onClick={()=> isEditable && setEdit({ k:'it', i, f:'title' })} style={itemTitle}>
                  {isEditable && edit?.k==='it' && edit.i===i && edit.f==='title' ? (
                    <ImprovedInlineEditor initialValue={it.title} onSave={(v)=>{ const next=[...items]; next[i]={ ...next[i], title:v }; onUpdate&&onUpdate({ items: next }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(itemTitle)} />
                  ) : (
                    it.title
                  )}
                </div>
                <div className="softskills-item-desk" onClick={()=> isEditable && setEdit({ k:'it', i, f:'body' })} style={itemBody}>
                  {isEditable && edit?.k==='it' && edit.i===i && edit.f==='body' ? (
                    <ImprovedInlineEditor initialValue={it.body} multiline={true} onSave={(v)=>{ const next=[...items]; next[i]={ ...next[i], body:v }; onUpdate&&onUpdate({ items: next }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(itemBody)} />
                  ) : (
                    it.body
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Page number */}
          <div className="softskills-page-number" style={{...pageNumberStyle, display: 'flex', alignItems: 'center', gap: '8px'}}>
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
                style={inline(pageNumberStyle)}
              />
            ) : (
              <div onClick={() => isEditable && setEditingPageNumber(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>
                {currentPageNumber}
              </div>
            )}
          </div>
        </div>
        <div style={right}>
          <div style={imageArea}>
            <ClickableImagePlaceholder imagePath={rightImagePath} onImageUploaded={(p)=> onUpdate&&onUpdate({ rightImagePath:p })} size="LARGE" position="CENTER" description="Right image" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SoftSkillsDevelopSlideTemplate_old;

