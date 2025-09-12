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

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

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

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#E3E8FB', color:'#4B5563', fontFamily: currentTheme.fonts.titleFont, position:'relative', padding:'20px 0' };
  const titleStyle: React.CSSProperties = { textAlign:'center', fontSize:'84px', fontWeight:800, color:'#4B4F58' };

  const listWrap: React.CSSProperties = { marginTop:'40px', display:'grid', rowGap:'20px' };
  const row: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr', alignItems:'center' };
  const rowInner: React.CSSProperties = { margin:'0 auto', width:'900px', display:'grid', gridTemplateColumns:'120px 1fr', alignItems:'center', columnGap:'0px' };
  const bullet: React.CSSProperties = { width:'90px', height:'90px', borderRadius:'50%', background:'#E4C8F3' };
  const text: React.CSSProperties = { fontSize:'28px', color:'#6E7380' };

  const cardWrap: React.CSSProperties = { position:'absolute', left:'50%', transform:'translateX(-50%)', bottom:'20px', display:'grid', gridTemplateColumns:'1fr 96px', alignItems:'center', width:'740px' };
  const card: React.CSSProperties = { height:'94px', background:'#F0F3FD', border:'1px solid #ffffff', marginRight:'50px', borderRadius:'999px', display:'flex', alignItems:'center', padding:'0 36px', columnGap:'18px' };
  const nameText: React.CSSProperties = { fontSize:'18px', color:'#75787F' };
  const dot: React.CSSProperties = { width:6, height:6, marginBottom:'10px', fontSize:'11px', color:'#6A6E77' };
  const roleText: React.CSSProperties = { fontSize:'18px', color:'#75787F' };
  const avatar: React.CSSProperties = { width:'96px', height:'96px', borderRadius:'50%', overflow:'hidden', background:'#ffffff'};

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
          <div onClick={()=> isEditable && setEditTitle(true)} style={inline({ ...titleStyle, cursor: isEditable ? 'pointer':'default' })}>{title}</div>
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
                  <div onClick={()=> isEditable && setEditItem(i)} style={inline({ ...text, cursor: isEditable ? 'pointer':'default' })}>{it}</div>
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
            <div onClick={()=> isEditable && setEditName(true)} style={inline({ ...nameText, cursor: isEditable ? 'pointer':'default' })}>{speakerName}</div>
          )}
          <div style={dot}>1</div>
          {isEditable && editRole ? (
            <ImprovedInlineEditor initialValue={speakerTitle} onSave={(v)=>{ onUpdate&&onUpdate({ speakerTitle: v }); setEditRole(false); }} onCancel={()=> setEditRole(false)} style={inlineRole} />
          ) : (
            <div onClick={()=> isEditable && setEditRole(true)} style={inline({ ...roleText, cursor: isEditable ? 'pointer':'default' })}>{speakerTitle}</div>
          )}
        </div>
        <div style={avatar}>
          <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath: p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={inline({ width:'100%', marginTop:'3px', height:'100%', objectFit:'cover', borderRadius:'50%' })} />
        </div>
      </div>
    </div>
  );
};

export default ResourcesSlideTemplate;

