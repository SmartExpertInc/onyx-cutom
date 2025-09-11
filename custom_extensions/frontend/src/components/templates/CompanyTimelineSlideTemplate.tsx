// custom_extensions/frontend/src/components/templates/CompanyTimelineSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface TimelineItem { year: string; title: string; body: string }
export interface CompanyTimelineProps extends BaseTemplateProps {
  tag: string;
  title: string;
  itemsTop: TimelineItem[];
  itemsBottom: TimelineItem[];
  avatarPath?: string;
}

export const CompanyTimelineSlideTemplate: React.FC<CompanyTimelineProps & { theme?: SlideTheme | string }> = ({
  tag = 'Company timeline',
  title = 'Our Journey So Far:\nA Timeline of Company Name',
  itemsTop = [
    { year:'2016', title:'Company Founded', body:'Our company was founded with a mission to revolutionize the industry' },
    { year:'2017', title:'Product Launch', body:'We launched our first product and received positive feedback from early adopters.' },
    { year:'2018', title:'Series A Funding', body:'We secured Series A funding to expand our team and further develop our product.' },
    { year:'2019', title:'Industry Recognition', body:'Our company was recognized as a leader in the industry by a major publication.' }
  ],
  itemsBottom = [
    { year:'2022', title:'Product Expansion', body:'We expanded our product line and launched several new feature s based on customer feedback.' },
    { year:'2021', title:'Record Growth', body:'Despite the challenges of the pandemic, our company experienced record growth and expanded our customer base.' },
    { year:'2020', title:'Global Pandemic', body:'The CoviD-19 pandemic hit, forcing us to adapt our operations and go fully remote.' }
  ],
  avatarPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [edit, setEdit] = useState<{ k:string; row?:'top'|'bottom'; idx?:number; field?:'year'|'title'|'body' }|null>(null);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#111214', color:'#E5E7EB', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const tagStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'40px', background:'#1F2125', color:'#C4C7CE', border:'1px solid #2B2E33', borderRadius:'8px', padding:'10px 18px', fontSize:'16px' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'112px', fontSize:'64px', fontWeight:800, color:'#E5E7EB', whiteSpace:'pre-line' };

  // Main horizontal timeline line
  const mainRail: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', top:'410px', height:'1px', borderTop:'1px dashed #3B3F45' };
  
  // Grid layouts for events
  const gridTop: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', top:'216px', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', columnGap:'40px' };
  const gridBottom: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', top:'520px', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', columnGap:'40px' };

  const pillYear: React.CSSProperties = { display:'inline-flex', alignItems:'center', justifyContent:'center', background:'#8E5BFF', color:'#ECE7FF', borderRadius:'6px', width:'74px', height:'36px', fontWeight:700 };
  const itemTitle: React.CSSProperties = { marginTop:'16px', fontSize:'26px', fontWeight:700 };
  const itemBody: React.CSSProperties = { marginTop:'10px', fontSize:'16px', color:'#A7ABB4', lineHeight:1.45 };

  const avatar: React.CSSProperties = { position:'absolute', right:'64px', top:'72px', width:'120px', height:'120px', borderRadius:'50%', overflow:'hidden', background:'#1F2125' };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ ...base, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, whiteSpace:'pre-wrap' });

  const renderItem = (row:'top'|'bottom', it:TimelineItem, i:number) => {
    // Calculate vertical connector position
    const connectorTop = row === 'top' ? '252px' : '410px'; // From year pill to main line
    const connectorHeight = row === 'top' ? '158px' : '110px'; // Height of connector
    const connectorLeft = `calc(40px + ${i * (row === 'top' ? 25 : 33.33)}% + 37px)`; // Center of year pill
    
    return (
      <div key={i} style={{ position:'relative' }}>
        {/* Vertical connector line */}
        <div style={{ 
          position:'absolute', 
          left: connectorLeft, 
          top: connectorTop, 
          width:'1px', 
          height: connectorHeight, 
          borderLeft:'1px dashed #3B3F45' 
        }} />
        
        <div style={pillYear} onClick={()=> isEditable && setEdit({ k:'year', row, idx:i, field:'year' })}>
          {isEditable && edit?.k==='year' && edit.row===row && edit.idx===i ? (
            <ImprovedInlineEditor initialValue={it.year} onSave={(v)=>{ const next=row==='top'?[...itemsTop]:[...itemsBottom]; (next[i] as any).year=v; onUpdate&&onUpdate(row==='top'?{ itemsTop: next }:{ itemsBottom: next }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(pillYear)} />
          ) : (
            it.year
          )}
        </div>
        <div style={itemTitle} onClick={()=> isEditable && setEdit({ k:'title', row, idx:i, field:'title' })}>
          {isEditable && edit?.k==='title' && edit.row===row && edit.idx===i ? (
            <ImprovedInlineEditor initialValue={it.title} onSave={(v)=>{ const next=row==='top'?[...itemsTop]:[...itemsBottom]; (next[i] as any).title=v; onUpdate&&onUpdate(row==='top'?{ itemsTop: next }:{ itemsBottom: next }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(itemTitle)} />
          ) : (
            it.title
          )}
        </div>
        <div style={itemBody} onClick={()=> isEditable && setEdit({ k:'body', row, idx:i, field:'body' })}>
          {isEditable && edit?.k==='body' && edit.row===row && edit.idx===i ? (
            <ImprovedInlineEditor initialValue={it.body} multiline={true} onSave={(v)=>{ const next=row==='top'?[...itemsTop]:[...itemsBottom]; (next[i] as any).body=v; onUpdate&&onUpdate(row==='top'?{ itemsTop: next }:{ itemsBottom: next }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(itemBody)} />
          ) : (
            it.body
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="company-timeline inter-theme" style={slide}>
      <div style={tagStyle}>
        {isEditable && edit?.k==='tag' ? (
          <ImprovedInlineEditor initialValue={tag} onSave={(v)=>{ onUpdate&&onUpdate({ tag:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(tagStyle)} />
        ) : (
          <div onClick={()=> isEditable && setEdit({ k:'tag' })} style={{ cursor: isEditable ? 'pointer':'default' }}>{tag}</div>
        )}
      </div>
      <div style={titleStyle}>
        {isEditable && edit?.k==='title' ? (
          <ImprovedInlineEditor initialValue={title} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ title:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(titleStyle)} />
        ) : (
          <div onClick={()=> isEditable && setEdit({ k:'title' })} style={{ cursor: isEditable ? 'pointer':'default' }}>{title}</div>
        )}
      </div>

      {/* Main horizontal timeline line */}
      <div style={mainRail} />
      
      {/* Top row events */}
      <div style={gridTop}>{itemsTop.map((it,i)=> renderItem('top', it, i))}</div>

      {/* Bottom row events */}
      <div style={gridBottom}>{itemsBottom.map((it,i)=> renderItem('bottom', it, i))}</div>

      <div style={avatar}>
        <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
      </div>
    </div>
  );
};

export default CompanyTimelineSlideTemplate;

