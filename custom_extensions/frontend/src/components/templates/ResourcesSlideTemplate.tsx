// custom_extensions/frontend/src/components/templates/ResourcesSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface ResourcesSlideProps extends BaseTemplateProps {
  title: string;
  items: string[]; // three lines
  speakerName: string;
  speakerTitle: string;
  avatarPath?: string;
}

export const ResourcesSlideTemplate: React.FC<ResourcesSlideProps & { theme?: SlideTheme | string }> = ({
  slideId,
  title = 'Resources',
  items = [
    'Resource 1 | Website/Book Title - Link/Author Name',
    'Resource 2 | Website/Book Title - Link/Author Name',
    'Resource 3 | Website/Book Title - Link/Author Name'
  ],
  speakerName = "Speaker's Name",
  speakerTitle = "Speaker's Title",
  avatarPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editTitle, setEditTitle] = useState(false);
  const [editItem, setEditItem] = useState<number | null>(null);
  const [editName, setEditName] = useState(false);
  const [editRole, setEditRole] = useState(false);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#E7EAF8', color:'#4B5563', fontFamily: currentTheme.fonts.titleFont, position:'relative', padding:'80px 0' };
  const titleStyle: React.CSSProperties = { textAlign:'center', fontSize:'84px', fontWeight:800, color:'#4B4F58' };

  const listWrap: React.CSSProperties = { marginTop:'70px', display:'grid', rowGap:'55px' };
  const row: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr', alignItems:'center' };
  const rowInner: React.CSSProperties = { margin:'0 auto', width:'900px', display:'grid', gridTemplateColumns:'120px 1fr', alignItems:'center', columnGap:'32px' };
  const bullet: React.CSSProperties = { width:'120px', height:'120px', borderRadius:'50%', background:'#DABEF1', boxShadow:'0 0 0 8px rgba(0,0,0,0.04) inset' };
  const text: React.CSSProperties = { fontSize:'36px', color:'#606B75' };

  const cardWrap: React.CSSProperties = { position:'absolute', left:'50%', transform:'translateX(-50%)', bottom:'68px', display:'grid', gridTemplateColumns:'1fr 96px', alignItems:'center', width:'720px' };
  const card: React.CSSProperties = { height:'94px', background:'#ECEFF6', borderRadius:'999px', boxShadow:'0 4px 14px rgba(0,0,0,0.08) inset', display:'flex', alignItems:'center', padding:'0 36px', columnGap:'18px' };
  const nameText: React.CSSProperties = { fontSize:'22px', color:'#6B7280' };
  const dot: React.CSSProperties = { width:6, height:6, borderRadius:'50%', background:'#9CA3AF' };
  const roleText: React.CSSProperties = { fontSize:'22px', color:'#6B7280' };
  const avatar: React.CSSProperties = { width:'96px', height:'96px', borderRadius:'50%', overflow:'hidden', background:'#ffffff', boxShadow:'0 0 0 6px rgba(0,0,0,0.04) inset' };

  const inlineTitle = { ...titleStyle, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0 } as React.CSSProperties;
  const inlineText = { ...text, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0 } as React.CSSProperties;
  const inlineName = { ...nameText, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0 } as React.CSSProperties;
  const inlineRole = { ...roleText, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0 } as React.CSSProperties;

  return (
    <div className="resources-slide inter-theme" style={slide}>
      <div>
        {isEditable && editTitle ? (
          <ImprovedInlineEditor initialValue={title} onSave={(v)=>{ onUpdate&&onUpdate({ title:v }); setEditTitle(false); }} onCancel={()=> setEditTitle(false)} style={inlineTitle} />
        ) : (
          <div onClick={()=> isEditable && setEditTitle(true)} style={{ ...titleStyle, cursor: isEditable ? 'pointer':'default' }}>{title}</div>
        )}
      </div>

      <div style={listWrap}>
        {items.map((it, i)=> (
          <div key={i} style={row}>
            <div style={rowInner}>
              <div style={bullet} />
              <div>
                {isEditable && editItem===i ? (
                  <ImprovedInlineEditor initialValue={it} onSave={(v)=>{ const next=[...items]; next[i]=v; onUpdate&&onUpdate({ items: next }); setEditItem(null); }} onCancel={()=> setEditItem(null)} style={inlineText} />
                ) : (
                  <div onClick={()=> isEditable && setEditItem(i)} style={{ ...text, cursor: isEditable ? 'pointer':'default' }}>{it}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={cardWrap}>
        <div style={card}>
          {isEditable && editName ? (
            <ImprovedInlineEditor initialValue={speakerName} onSave={(v)=>{ onUpdate&&onUpdate({ speakerName: v }); setEditName(false); }} onCancel={()=> setEditName(false)} style={inlineName} />
          ) : (
            <div onClick={()=> isEditable && setEditName(true)} style={{ ...nameText, cursor: isEditable ? 'pointer':'default' }}>{speakerName}</div>
          )}
          <div style={dot} />
          {isEditable && editRole ? (
            <ImprovedInlineEditor initialValue={speakerTitle} onSave={(v)=>{ onUpdate&&onUpdate({ speakerTitle: v }); setEditRole(false); }} onCancel={()=> setEditRole(false)} style={inlineRole} />
          ) : (
            <div onClick={()=> isEditable && setEditRole(true)} style={{ ...roleText, cursor: isEditable ? 'pointer':'default' }}>{speakerTitle}</div>
          )}
        </div>
        <div style={avatar}>
          <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath: p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
        </div>
      </div>
    </div>
  );
};

export default ResourcesSlideTemplate;

