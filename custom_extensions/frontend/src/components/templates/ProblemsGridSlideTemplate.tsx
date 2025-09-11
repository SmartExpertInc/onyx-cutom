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

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#111214', color:'#E5E7EB', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const tagStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'40px', background:'#1F2125', color:'#C4C7CE', border:'1px solid #2B2E33', borderRadius:'8px', padding:'10px 18px', fontSize:'16px' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'112px', fontSize:'68px', fontWeight:800, color:'#E5E7EB' };

  const grid: React.CSSProperties = { position:'absolute', left:'40px', top:'220px', width:'854px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' };
  const card: React.CSSProperties = { background:'#1F2125', border:'1px solid #2B2E33', borderRadius:'2px', padding:'26px 28px', boxShadow:'0 0 0 1px rgba(0,0,0,0.2) inset' };
  const numBox: React.CSSProperties = { width:'44px', height:'44px', borderRadius:'6px', background:'#8E5BFF', color:'#ECE7FF', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:700 };
  const cardTitle: React.CSSProperties = { marginTop:'20px', fontSize:'28px', fontWeight:700, color:'#E5E7EB' };
  const cardBody: React.CSSProperties = { marginTop:'14px', fontSize:'18px', color:'#A7ABB4', lineHeight:1.4, maxWidth:'740px' };

  const rightTextStyle: React.CSSProperties = { position:'absolute', right:'64px', top:'420px', width:'520px', fontSize:'18px', color:'#A7ABB4', lineHeight:1.5, whiteSpace:'pre-line' };
  const avatar: React.CSSProperties = { position:'absolute', right:'64px', top:'72px', width:'120px', height:'120px', borderRadius:'50%', overflow:'hidden', background:'#1F2125' };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ ...base, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, whiteSpace:'pre-line' });

  return (
    <div className="problems-grid-slide inter-theme" style={slide}>
      <div style={tagStyle}>
        {isEditable && editTag ? (
          <ImprovedInlineEditor initialValue={tag} onSave={(v)=>{ onUpdate&&onUpdate({ tag:v }); setEditTag(false); }} onCancel={()=>setEditTag(false)} style={inline(tagStyle)} />
        ) : (
          <div onClick={()=> isEditable && setEditTag(true)} style={{ cursor: isEditable ? 'pointer':'default' }}>{tag}</div>
        )}
      </div>
      <div style={titleStyle}>
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
            <div style={cardTitle}>
              {isEditable && editCard && editCard.idx===i && editCard.field==='title' ? (
                <ImprovedInlineEditor initialValue={c.title} onSave={(v)=>{ const next=[...cards]; next[i]={ ...next[i], title:v }; onUpdate&&onUpdate({ cards: next }); setEditCard(null); }} onCancel={()=>setEditCard(null)} style={inline(cardTitle)} />
              ) : (
                <div onClick={()=> isEditable && setEditCard({ idx:i, field:'title' })} style={{ ...cardTitle, cursor: isEditable ? 'pointer':'default' }}>{c.title}</div>
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
  );
};

export default ProblemsGridSlideTemplate;

