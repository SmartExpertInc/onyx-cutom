// custom_extensions/frontend/src/components/templates/SoftSkillsDevelopSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface SoftSkillsDevelopProps extends BaseTemplateProps {
  title: string;
  items: Array<{ title: string; body: string }>;
  rightImagePath?: string;
}

export const SoftSkillsDevelopSlideTemplate: React.FC<SoftSkillsDevelopProps & { theme?: SlideTheme | string }> = ({
  title = 'How To Develop\nSoft Skills',
  items = [
    { title:'Be an Active Listener', body:'Active listening helps better understand others and fosters meaningful connections.' },
    { title:'Seek Feedback', body:'Seeking feedback helps identify areas for improvement and personal growth' },
    { title:'Join Training Programs', body:'Training programs and courses provide structured learning and expert insights on soft skills' },
    { title:'Practice Empathy', body:'Empathy and patience build trust and create positive relationships with others.' }
  ],
  rightImagePath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [edit, setEdit] = useState<{ k:string; i?:number; f?:'title'|'body' } | null>(null);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#FFFFFF', color:'#1F2937', fontFamily: 'Lora-Bold, serif', fontWeight: 'normal', position:'relative', display:'grid', gridTemplateColumns:'1fr 520px' };
  const left: React.CSSProperties = { padding:'72px 72px' };
  const titleStyle: React.CSSProperties = { fontSize:'60px', fontFamily: 'Lora-Bold, serif', fontWeight: 'normal', color:'#222', lineHeight:0.95, whiteSpace:'pre-line' };
  const grid: React.CSSProperties = { marginTop:'70px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'46px 64px' };
  const itemTitle: React.CSSProperties = { fontSize:'22px', fontFamily: 'Lora-Bold, serif', fontWeight: 'normal', color:'#444444' };
  const itemBody: React.CSSProperties = { marginTop:'10px', fontSize:'14px', color:'#626262', lineHeight:1.5 };

  const right: React.CSSProperties = { position:'relative'};
  const purpleBar: React.CSSProperties = { position:'absolute', left:'3px', top:'72px', bottom:'0', width:'86%', background:'#906AF8' };
  const imageArea: React.CSSProperties = { position:'absolute', left:'54px', right:0, top:0, bottom:0, background:'#212121', height:'93%' };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ ...base, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, whiteSpace:'pre-wrap' });

  return (
    <div className="softskills-develop inter-theme" style={slide}>
      <div style={left}>
        {isEditable && edit?.k==='title' ? (
          <ImprovedInlineEditor initialValue={title} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ title:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(titleStyle)} />
        ) : (
          <div onClick={()=> isEditable && setEdit({ k:'title' })} style={{ ...titleStyle, cursor: isEditable ? 'pointer':'default' }}>{title}</div>
        )}
        <div style={grid}>
          {items.map((it, i)=> (
            <div key={i}>
              <div onClick={()=> isEditable && setEdit({ k:'it', i, f:'title' })} style={itemTitle}>
                {isEditable && edit?.k==='it' && edit.i===i && edit.f==='title' ? (
                  <ImprovedInlineEditor initialValue={it.title} onSave={(v)=>{ const next=[...items]; next[i]={ ...next[i], title:v }; onUpdate&&onUpdate({ items: next }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(itemTitle)} />
                ) : (
                  it.title
                )}
              </div>
              <div onClick={()=> isEditable && setEdit({ k:'it', i, f:'body' })} style={itemBody}>
                {isEditable && edit?.k==='it' && edit.i===i && edit.f==='body' ? (
                  <ImprovedInlineEditor initialValue={it.body} multiline={true} onSave={(v)=>{ const next=[...items]; next[i]={ ...next[i], body:v }; onUpdate&&onUpdate({ items: next }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(itemBody)} />
                ) : (
                  it.body
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={right}>
        <div style={purpleBar} />
        <div style={imageArea}>
          <ClickableImagePlaceholder imagePath={rightImagePath} onImageUploaded={(p)=> onUpdate&&onUpdate({ rightImagePath:p })} size="LARGE" position="CENTER" description="Right image" isEditable={isEditable} style={{ width:'84%', height:'100%', objectFit:'cover' }} />
        </div>
      </div>
    </div>
  );
};

export default SoftSkillsDevelopSlideTemplate;

