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

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#1A1A1A', color:'#E5E7EB', fontFamily: 'Lora-Bold, serif', fontWeight: 'normal', position:'relative' };
  const tagStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'40px', background:'#292929', color:'#9B9B9B', padding:'10px 18px', fontSize:'16px' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'100px', fontSize:'50px', fontFamily: 'Lora-Bold, serif', fontWeight: 'normal', color:'#DFDFDF' };

  const grid: React.CSSProperties = { position:'absolute', left:'40px', top:'220px', width:'710px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' };
  const card: React.CSSProperties = { background:'#292929', borderRadius:'2px', height:'195px', padding:'17px 28px', boxShadow:'0 0 0 1px rgba(0,0,0,0.2) inset' };
  const numBox: React.CSSProperties = { width:'40px', height:'35px', borderRadius:'0px', background:'#8A52FC', color:'#ECE7FF', display:'inline-flex', alignItems:'center', justifyContent:'center', fontFamily: 'Lora-Bold, serif', fontWeight: 'normal' };
  const cardTitle: React.CSSProperties = { marginTop:'12px', fontSize:'24px', fontFamily: 'Lora-Bold, serif', fontWeight: 'normal', color:'#CFCFCF' };
  const cardBody: React.CSSProperties = { marginTop:'14px', fontSize:'14px', color:'#9B9B9B', lineHeight:1.4, maxWidth:'740px' };

  const rightTextStyle: React.CSSProperties = { position:'absolute', right:'10px', top:'420px', width:'376px', fontSize:'15px', color:'#A6A6A6', lineHeight:1.5, whiteSpace:'pre-line' };
  const avatar: React.CSSProperties = { position:'absolute', right:'64px', top:'72px', width:'130px', height:'130px', borderRadius:'50%', overflow:'hidden', background:'#292929' };

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
                <div onClick={()=> isEditable && setEditCard({ idx:i, field:'title' })} style={{ ...cardTitle, cursor: isEditable ? 'pointer':'default' }}>
                  {i === 0 ? (
                    (() => {
                      const parts = (c.title || '').trim().split(/\s+/);
                      const first = parts.shift() || '';
                      const rest = parts.join(' ');
                      return (
                        <>
                          <span style={{ color: '#8A52FC' }}>{first}</span>
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
  );
};

export default ProblemsGridSlideTemplate;

