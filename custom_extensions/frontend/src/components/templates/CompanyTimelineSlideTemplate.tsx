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
    { year:'2022', title:'Product Expansion', body:'We expanded our product line and launched several new features based on customer feedback.' },
    { year:'2021', title:'Record Growth', body:'Despite the challenges of the pandemic, our company experienced record growth and expanded our customer base.' },
    { year:'2020', title:'Global Pandemic', body:'The COVID-19 pandemic hit, forcing us to adapt our operations and go fully remote.' }
  ],
  avatarPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [edit, setEdit] = useState<{ k:string; row?:'top'|'bottom'; idx?:number; field?:'year'|'title'|'body' }|null>(null);

  // Main slide styles
  const slide: React.CSSProperties = { 
    width:'100%', 
    aspectRatio:'16/9', 
    background:'#111214', 
    color:'#E5E7EB', 
    fontFamily: currentTheme.fonts.titleFont, 
    position:'relative' 
  };

  // Header section
  const tagStyle: React.CSSProperties = { 
    position:'absolute', 
    left:'40px', 
    top:'40px', 
    background:'#1F2125', 
    color:'#C4C7CE', 
    border:'1px solid #2B2E33', 
    borderRadius:'8px', 
    padding:'10px 18px', 
    fontSize:'16px' 
  };

  const titleStyle: React.CSSProperties = { 
    position:'absolute', 
    left:'40px', 
    top:'112px', 
    fontSize:'64px', 
    fontWeight:800, 
    color:'#E5E7EB', 
    whiteSpace:'pre-line',
    lineHeight:1.1
  };

  const avatar: React.CSSProperties = { 
    position:'absolute', 
    right:'64px', 
    top:'72px', 
    width:'120px', 
    height:'120px', 
    borderRadius:'50%', 
    overflow:'hidden', 
    background:'#1F2125' 
  };

  // Timeline structure - single horizontal line with vertical connectors
  const mainTimelineLine: React.CSSProperties = {
    position:'absolute',
    left:'40px',
    right:'40px',
    top:'410px',
    height:'1px',
    borderTop:'1px dashed #3B3F45'
  };

  // Event positioning - exact pixel positioning like in the photo
  const eventPositions = {
    top: [
      { left: '40px', top: '216px' },    // 2016
      { left: '240px', top: '216px' },   // 2017  
      { left: '440px', top: '216px' },   // 2018
      { left: '640px', top: '216px' }    // 2019
    ],
    bottom: [
      { left: '40px', top: '520px' },    // 2022
      { left: '320px', top: '520px' },   // 2021
      { left: '600px', top: '520px' }    // 2020
    ]
  };

  // Event styles
  const yearPill: React.CSSProperties = {
    display:'inline-flex',
    alignItems:'center',
    justifyContent:'center',
    background:'#8E5BFF',
    color:'#ECE7FF',
    borderRadius:'6px',
    width:'74px',
    height:'36px',
    fontWeight:700,
    fontSize:'14px'
  };

  const eventTitle: React.CSSProperties = {
    marginTop:'16px',
    fontSize:'26px',
    fontWeight:700,
    color:'#E5E7EB',
    lineHeight:1.2
  };

  const eventBody: React.CSSProperties = {
    marginTop:'10px',
    fontSize:'16px',
    color:'#A7ABB4',
    lineHeight:1.45,
    maxWidth:'200px'
  };

  // Vertical connector lines
  const connectorLine: React.CSSProperties = {
    position:'absolute',
    width:'1px',
    borderLeft:'1px dashed #3B3F45'
  };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ 
    ...base, 
    position:'relative', 
    background:'transparent', 
    border:'none', 
    outline:'none', 
    padding:0, 
    margin:0, 
    whiteSpace:'pre-wrap' 
  });

  const renderEvent = (item: TimelineItem, position: { left: string; top: string }, row: 'top' | 'bottom', index: number) => {
    const connectorTop = row === 'top' ? '252px' : '410px';
    const connectorHeight = row === 'top' ? '158px' : '110px';
    const connectorLeft = `calc(${position.left} + 37px)`; // Center of year pill

    return (
      <div key={`${row}-${index}`} style={{ position:'absolute', left: position.left, top: position.top }}>
        {/* Vertical connector line */}
        <div style={{ 
          ...connectorLine,
          left: connectorLeft,
          top: connectorTop,
          height: connectorHeight
        }} />
        
        {/* Year pill */}
        <div style={yearPill} onClick={()=> isEditable && setEdit({ k:'year', row, idx:index, field:'year' })}>
          {isEditable && edit?.k==='year' && edit.row===row && edit.idx===index ? (
            <ImprovedInlineEditor 
              initialValue={item.year} 
              onSave={(v)=>{ 
                const next = row==='top' ? [...itemsTop] : [...itemsBottom];
                (next[index] as any).year = v;
                onUpdate && onUpdate(row==='top' ? { itemsTop: next } : { itemsBottom: next });
                setEdit(null);
              }} 
              onCancel={()=> setEdit(null)} 
              style={inline(yearPill)} 
            />
          ) : (
            item.year
          )}
        </div>

        {/* Event title */}
        <div style={eventTitle} onClick={()=> isEditable && setEdit({ k:'title', row, idx:index, field:'title' })}>
          {isEditable && edit?.k==='title' && edit.row===row && edit.idx===index ? (
            <ImprovedInlineEditor 
              initialValue={item.title} 
              onSave={(v)=>{ 
                const next = row==='top' ? [...itemsTop] : [...itemsBottom];
                (next[index] as any).title = v;
                onUpdate && onUpdate(row==='top' ? { itemsTop: next } : { itemsBottom: next });
                setEdit(null);
              }} 
              onCancel={()=> setEdit(null)} 
              style={inline(eventTitle)} 
            />
          ) : (
            item.title
          )}
        </div>

        {/* Event body */}
        <div style={eventBody} onClick={()=> isEditable && setEdit({ k:'body', row, idx:index, field:'body' })}>
          {isEditable && edit?.k==='body' && edit.row===row && edit.idx===index ? (
            <ImprovedInlineEditor 
              initialValue={item.body} 
              multiline={true}
              onSave={(v)=>{ 
                const next = row==='top' ? [...itemsTop] : [...itemsBottom];
                (next[index] as any).body = v;
                onUpdate && onUpdate(row==='top' ? { itemsTop: next } : { itemsBottom: next });
                setEdit(null);
              }} 
              onCancel={()=> setEdit(null)} 
              style={inline(eventBody)} 
            />
          ) : (
            item.body
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="company-timeline inter-theme" style={slide}>
      {/* Header */}
      <div style={tagStyle}>
        {isEditable && edit?.k==='tag' ? (
          <ImprovedInlineEditor 
            initialValue={tag} 
            onSave={(v)=>{ onUpdate && onUpdate({ tag:v }); setEdit(null); }} 
            onCancel={()=> setEdit(null)} 
            style={inline(tagStyle)} 
          />
        ) : (
          <div onClick={()=> isEditable && setEdit({ k:'tag' })} style={{ cursor: isEditable ? 'pointer':'default' }}>
            {tag}
          </div>
        )}
      </div>

      <div style={titleStyle}>
        {isEditable && edit?.k==='title' ? (
          <ImprovedInlineEditor 
            initialValue={title} 
            multiline={true}
            onSave={(v)=>{ onUpdate && onUpdate({ title:v }); setEdit(null); }} 
            onCancel={()=> setEdit(null)} 
            style={inline(titleStyle)} 
          />
        ) : (
          <div onClick={()=> isEditable && setEdit({ k:'title' })} style={{ cursor: isEditable ? 'pointer':'default' }}>
            {title}
          </div>
        )}
      </div>

      {/* Avatar */}
      <div style={avatar}>
        <ClickableImagePlaceholder 
          imagePath={avatarPath} 
          onImageUploaded={(p)=> onUpdate && onUpdate({ avatarPath:p })} 
          size="LARGE" 
          position="CENTER" 
          description="Avatar" 
          isEditable={isEditable} 
          style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} 
        />
      </div>

      {/* Main timeline line */}
      <div style={mainTimelineLine} />

      {/* Top row events */}
      {itemsTop.map((item, index) => 
        renderEvent(item, eventPositions.top[index], 'top', index)
      )}

      {/* Bottom row events */}
      {itemsBottom.map((item, index) => 
        renderEvent(item, eventPositions.bottom[index], 'bottom', index)
      )}
    </div>
  );
};

export default CompanyTimelineSlideTemplate;