// custom_extensions/frontend/src/components/templates/OralHygieneSignsSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface OralHygieneSignsProps extends BaseTemplateProps {
  heading: string;
  leftItems: Array<{ number: string; title: string; body: string }>;
  rightItems: Array<{ number: string; title: string; body: string }>;
  avatarPath?: string;
}

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

export const OralHygieneSignsSlideTemplate: React.FC<OralHygieneSignsProps & { theme?: SlideTheme | string }> = ({
  slideId,
  heading = 'What are the signs of\npoor oral hygiene?',
  leftItems = [
    { number: '01', title: 'Bleeding gums', body: 'The main cause of bleeding gums is the buildup of plaque...' },
    { number: '02', title: 'Tooth decay', body: 'Cavities are permanently damaged areas ...' },
    { number: '03', title: 'Chronic bad breath', body: 'Problems with your teeth or gums ...' }
  ],
  rightItems = [
    { number: '04', title: 'Loose teeth', body: 'For adults, a loose tooth occurs when ...' },
    { number: '05', title: 'Gum recession', body: 'A form of gum disease ...' },
    { number: '06', title: 'Toothache', body: 'Minor toothaches can come from ...' }
  ],
  avatarPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editHeading, setEditHeading] = useState(false);
  const [editItem, setEditItem] = useState<{ side: 'left' | 'right'; idx: number; field: 'title' | 'body' } | null>(null);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#FFFFFF', color:'#111', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const headingStyle: React.CSSProperties = { position:'absolute', top:'30px', fontSize:'58px', width:'600px', fontWeight:800, color:'#1F2937', lineHeight:1.05 };
  const avatar: React.CSSProperties = { position:'absolute', right:'56px', top:'48px', width:'115px', height:'115px', borderRadius:'50%', overflow:'hidden', background:'#4B71D6' };
  const grid: React.CSSProperties = { position:'absolute', left:'56px', right:'56px', bottom:'56px', top:'285px', display:'grid', gridTemplateColumns:'1fr 1fr', columnGap:'72px' };
  const list: React.CSSProperties = { display:'grid', rowGap:'22px' };
  const row: React.CSSProperties = { display:'grid', gridTemplateColumns:'96px 1fr', columnGap:'18px', alignItems:'center' };
  const num: React.CSSProperties = { fontSize:'64px', fontWeight:800, color:'#5B78E6' };
  const title: React.CSSProperties = { fontSize:'18px', color:'#111827', marginBottom:'4px' };
  const body: React.CSSProperties = { fontSize:'14px', color:'#6B7280', lineHeight:1.6 };

  const inlineHeading = { ...headingStyle, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0 } as React.CSSProperties;
  const inlineTitle = { ...title, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0 } as React.CSSProperties;
  const inlineBody = { ...body, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0 } as React.CSSProperties;

  const save = (side: 'left' | 'right', idx: number, field: 'title' | 'body', value: string) => {
    if (side === 'left') {
      const next = [...leftItems];
      (next[idx] as any)[field] = value;
      onUpdate && onUpdate({ leftItems: next });
    } else {
      const next = [...rightItems];
      (next[idx] as any)[field] = value;
      onUpdate && onUpdate({ rightItems: next });
    }
    setEditItem(null);
  };

  return (
    <div className="oral-hygiene-signs inter-theme" style={slide}>
      <div style={headingStyle}>
        {isEditable && editHeading ? (
          <ImprovedInlineEditor initialValue={heading} onSave={(v)=>{ onUpdate&&onUpdate({ heading:v }); setEditHeading(false); }} onCancel={()=>setEditHeading(false)} style={inlineHeading} />
        ) : (
          <div onClick={()=> isEditable && setEditHeading(true)} style={inline({ ...headingStyle, cursor: isEditable ? 'pointer':'default', whiteSpace:'pre-line' })}>{heading}</div>
        )}
      </div>
      <div style={avatar}>
        <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={inline({ marginTop:'3px', width:'100%', height:'100%', objectFit:'cover' })} />
      </div>

      <div style={grid}>
        {[{ side:'left', items:leftItems }, { side:'right', items:rightItems }].map((group:any, gi:number)=> (
          <div key={gi} style={list}>
            {group.items.map((it:any, i:number)=> (
              <div key={i} style={row}>
                <div style={num}>{it.number}</div>
                <div>
                  {isEditable && editItem && editItem.side===group.side && editItem.idx===i && editItem.field==='title' ? (
                    <ImprovedInlineEditor initialValue={it.title} onSave={(v)=> save(group.side, i, 'title', v)} onCancel={()=> setEditItem(null)} style={inlineTitle} />
                  ) : (
                    <div onClick={()=> isEditable && setEditItem({ side:group.side, idx:i, field:'title' })} style={inline({ ...title, cursor: isEditable ? 'pointer':'default' })}>{it.title}</div>
                  )}
                  {isEditable && editItem && editItem.side===group.side && editItem.idx===i && editItem.field==='body' ? (
                    <ImprovedInlineEditor initialValue={it.body} multiline={true} onSave={(v)=> save(group.side, i, 'body', v)} onCancel={()=> setEditItem(null)} style={inlineBody} />
                  ) : (
                    <div onClick={()=> isEditable && setEditItem({ side:group.side, idx:i, field:'body' })} style={inline({ ...body, cursor: isEditable ? 'pointer':'default' })}>{it.body}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OralHygieneSignsSlideTemplate;

