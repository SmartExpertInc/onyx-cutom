// custom_extensions/frontend/src/components/templates/ProblemsGridSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface ProblemsGridSlideProps extends BaseTemplateProps {
  tag: string;
  title: string;
  cards: Array<{ number: string; title: string; body: string }>;
  rightText: string;
  avatarPath?: string;
}

export const ProblemsGridSlideTemplate: React.FC<ProblemsGridSlideProps & { theme?: SlideTheme | string }> = ({
  slideId,
  tag = 'The problem',
  title = 'Problem Name',
  cards = [
    { number: '1', title: 'Problem Name', body: "In today's fast-paced market, businesses face a variety of challenges that can hinder growth and success." },
    { number: '2', title: 'Problem Name', body: "In today's fast-paced market, businesses face a variety of challenges that can hinder growth and success." },
    { number: '3', title: 'Problem Name', body: "In today's fast-paced market, businesses face a variety of challenges that can hinder growth and success." },
    { number: '4', title: 'Problem Name', body: "In today's fast-paced market, businesses face a variety of challenges that can hinder growth and success." },
  ],
  rightText = "In today's fast-paced market,businesses face a variety of challenges that can hinder growth and bigges\niatoerostornsuestroner\nproductivitytounhappycustomers.Butdon'tworry – we're here to help.",
  avatarPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editTag, setEditTag] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [editCard, setEditCard] = useState<{ idx: number; field: 'title' | 'body' } | null>(null);
  const [editRight, setEditRight] = useState(false);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#E0E7FF', color:'#09090B', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const tagStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'40px', background:'none', color:'#34353C', padding:'8px 18px', fontSize:'16px', borderRadius:'50px', border:'1px solid black', display:'flex', gap:'10px' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'100px', fontSize:'50px', fontWeight:800, color:'#09090B' };

  const grid: React.CSSProperties = { position:'absolute', left:'40px', top:'220px', width:'710px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px' };
  const card: React.CSSProperties = { background:'#FFFFFF', borderRadius:'6px', height:'195px', padding:'17px 28px' };
  const numBox: React.CSSProperties = { width:'28px', height:'28px', background:'#0F58F9', color:'#ECE7FF', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:700, borderRadius:'2px' };
  const cardTitle: React.CSSProperties = { marginTop:'12px', fontSize:'24px', fontWeight:700, color:'#09090B' };
  const cardBody: React.CSSProperties = { marginTop:'14px', fontSize:'14px', color:'#34353C', lineHeight:1.4, maxWidth:'740px' };

  const rightTextStyle: React.CSSProperties = { position:'absolute', right:'120px', top:'430px', width:'266px', fontSize:'17px', color:'#34353C', lineHeight:1.5, whiteSpace:'pre-line' };
  const avatar: React.CSSProperties = { position:'absolute', right:'64px', top:'72px', width:'155px', height:'155px', borderRadius:'50%', overflow:'hidden', background:'#0F58F9' };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ ...base, position:'absolute', background:'transparent', border:'none', outline:'none', padding:0, margin:0, whiteSpace:'pre-line', top: base.top, left: base.left, right: base.right, bottom: base.bottom });

  return (
    <>
      <style>{`
        .problems-grid-slide *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 400 !important;
        }
        .problems-grid-slide .title-element {
          font-family: "Lora", serif !important;
          font-weight: 600 !important;
        }
        .problems-grid-slide .title-element * {
          font-family: "Lora", serif !important;
          font-weight: 600 !important;
        }
      `}</style>
      <div className="problems-grid-slide inter-theme" style={slide}>
      <div style={tagStyle}>
        <div style={{ background:'#0F58F9', width:'7px', height:'7px', borderRadius:'50%', marginTop:'8px' }} />
        {isEditable && editTag ? (
          <ImprovedInlineEditor initialValue={tag} onSave={(v)=>{ onUpdate&&onUpdate({ tag:v }); setEditTag(false); }} onCancel={()=>setEditTag(false)} style={inline(tagStyle)} />
        ) : (
          <div onClick={()=> isEditable && setEditTag(true)} style={{ cursor: isEditable ? 'pointer':'default' }}>{tag}</div>
        )}
      </div>
      <div className="title-element" style={titleStyle}>
        {isEditable && editTitle ? (
          <ImprovedInlineEditor initialValue={title} onSave={(v)=>{ onUpdate&&onUpdate({ title:v }); setEditTitle(false); }} onCancel={()=>setEditTitle(false)} style={inline(titleStyle)} />
        ) : (
          <div onClick={()=> isEditable && setEditTitle(true)} style={{ cursor: isEditable ? 'pointer':'default' }}>{title}</div>
        )}
      </div>

      <div style={grid}>
        {cards.map((c, i)=> (
          <div key={i} style={card}>
            <div style={numBox}>{c.number}</div>
            <div className="title-element" style={cardTitle}>
              {isEditable && editCard && editCard.idx===i && editCard.field==='title' ? (
                <ImprovedInlineEditor initialValue={c.title} onSave={(v)=>{ const next=[...cards]; next[i]={ ...next[i], title:v }; onUpdate&&onUpdate({ cards: next }); setEditCard(null); }} onCancel={()=>setEditCard(null)} style={inline(cardTitle)} />
              ) : (
                <div onClick={()=> isEditable && setEditCard({ idx:i, field:'title' })} style={{ ...cardTitle, cursor: isEditable ? 'pointer':'default' }}>
                  {i === 0 ? (
                    (() => {
                      const parts = (c.title || '').trim().split(/\s+/);
                      const first = parts.shift() || '';
                      const rest = parts.join(' ');
                      return (
                        <>
                          <span style={{ color: 'black' }}>{first}</span>
                          {rest ? ' ' + rest : ''}
                        </>
                      );
                    })()
                  ) : (
                    c.title
                  )}
                </div>
              )}
            </div>
            <div style={cardBody}>
              {isEditable && editCard && editCard.idx===i && editCard.field==='body' ? (
                <ImprovedInlineEditor initialValue={c.body} multiline={true} onSave={(v)=>{ const next=[...cards]; next[i]={ ...next[i], body:v }; onUpdate&&onUpdate({ cards: next }); setEditCard(null); }} onCancel={()=>setEditCard(null)} style={inline(cardBody)} />
              ) : (
                <div onClick={()=> isEditable && setEditCard({ idx:i, field:'body' })} style={{ ...cardBody, cursor: isEditable ? 'pointer':'default' }}>{c.body}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={rightTextStyle}>
        {isEditable && editRight ? (
          <ImprovedInlineEditor initialValue={rightText} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ rightText:v }); setEditRight(false); }} onCancel={()=> setEditRight(false)} style={inline(rightTextStyle)} />
        ) : (
          <div onClick={()=> isEditable && setEditRight(true)} style={{ cursor: isEditable ? 'pointer':'default' }}>{rightText}</div>
        )}
      </div>

      <div style={avatar}>
        <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
      </div>
      </div>
    </>
  );
};

export default ProblemsGridSlideTemplate;

