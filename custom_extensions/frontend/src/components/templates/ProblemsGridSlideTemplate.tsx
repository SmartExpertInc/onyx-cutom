// custom_extensions/frontend/src/components/templates/ProblemsGridSlideTemplate.tsx

import React, { useState, useRef } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import { ControlledWysiwygEditor, ControlledWysiwygEditorRef } from '../editors/ControlledWysiwygEditor';
import AvatarImageDisplay from '../AvatarImageDisplay';
import YourLogo from '../YourLogo';

export interface ProblemsGridSlideProps extends BaseTemplateProps {
  tag: string;
  title: string;
  cards: Array<{ number: string; title: string; body: string }>;
  rightText: string;
  avatarPath?: string;
  pageNumber?: string;
  logoPath?: string;
  logoText?: string;
}

export const ProblemsGridSlideTemplate: React.FC<ProblemsGridSlideProps & { 
  theme?: SlideTheme | string;
  onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;
}> = ({
  slideId,
  tag = 'The problem',
  title = 'Problem Name',
  cards = [
    { number: '1', title: 'Problem Name', body: "In today's fast-paced market, businesses face a variety of challenges that can hinder growth and success." },
    { number: '2', title: 'Problem Name', body: "In today's fast-paced market, businesses face a variety of challenges that can hinder growth and success." },
    { number: '3', title: 'Problem Name', body: "In today's fast-paced market, businesses face a variety of challenges that can hinder growth and success." },
    { number: '4', title: 'Problem Name', body: "In today's fast-paced market, businesses face a variety of challenges that can hinder growth and success." },
  ],
  rightText = "In today's fast-paced market,businesses face a variety of challenges that can hinder growth and biggest\niatoe rostornsue stroner\nproductivity toun happy\n customers.But don't worry –\n we're here to help.",
  avatarPath = '',
  pageNumber = '12',
  logoPath = '',
  logoText = 'Your Logo',
  isEditable = false,
  onUpdate,
  theme,
  onEditorActive
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editTag, setEditTag] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [editCard, setEditCard] = useState<{ idx: number; field: 'title' | 'body' } | null>(null);
  const [editRight, setEditRight] = useState(false);
  const [editPageNumber, setEditPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  // Editor refs
  const tagEditorRef = useRef<ControlledWysiwygEditorRef>(null);
  const titleEditorRef = useRef<ControlledWysiwygEditorRef>(null);
  const cardTitleEditorRefs = useRef<(ControlledWysiwygEditorRef | null)[]>([]);
  const cardBodyEditorRefs = useRef<(ControlledWysiwygEditorRef | null)[]>([]);
  const rightTextEditorRef = useRef<ControlledWysiwygEditorRef>(null);
  const pageNumberEditorRef = useRef<ControlledWysiwygEditorRef>(null);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#E0E7FF', color:'#09090B', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const tagStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'40px', background:'none', color:'#34353C', padding:'7px 18px', fontSize:'16px', borderRadius:'50px', border:'1px solid black', display:'flex', gap:'10px' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'100px', fontSize:'35px', fontWeight:800, color:'#09090B' };

  const grid: React.CSSProperties = { position:'absolute', left:'40px', top:'190px', width:'710px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px' };
  const card: React.CSSProperties = { background:'#FFFFFF', borderRadius:'6px', height:'195px', padding:'17px 28px' };
  const numBox: React.CSSProperties = { width:'28px', height:'28px', background:'#0F58F9', color:'#FFFFFF', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:700, borderRadius:'2px' };
  const cardTitle: React.CSSProperties = { marginTop:'12px', fontSize:'24px', fontWeight:700, color:'#09090B' };
  const cardBody: React.CSSProperties = { marginTop:'14px', fontSize:'14px', color:'#34353C', lineHeight:1.4, maxWidth:'740px' };

  const rightTextStyle: React.CSSProperties = { position:'absolute', right:'120px', top:'400px', width:'266px', fontSize:'16px', color:'#34353C', lineHeight:1.5, whiteSpace:'pre-line' };
  const avatar: React.CSSProperties = { position:'absolute', right:'64px', top:'45px', width:'160px', height:'160px', borderRadius:'50%', overflow:'hidden', background:'#0F58F9' };
  const pageNumberStyle: React.CSSProperties = { position:'absolute', bottom:'24px', left:'0px', color:'#5F616D', fontSize:'16px', fontWeight:600 };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ ...base, background:'transparent', border:'none', outline:'none', padding:0, margin:0, whiteSpace:'pre-line' });
  
  const inlineEditor = (base: React.CSSProperties): React.CSSProperties => ({ 
    position: 'relative',
    background:'transparent', 
    border:'none', 
    outline:'none', 
    padding:0, 
    margin:0,
    fontSize: base.fontSize,
    fontWeight: base.fontWeight,
    color: base.color,
    lineHeight: base.lineHeight,
    whiteSpace: base.whiteSpace || 'pre-line',
    width: '100%'
  });

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
        .tag-editor {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      <div className="problems-grid-slide inter-theme" style={slide}>
      <div style={tagStyle}>
        <div style={{ background:'#0F58F9', width:'7px', height:'7px', borderRadius:'50%', marginTop:'8px' }} />
        {isEditable && editTag ? (
          <ControlledWysiwygEditor
            ref={tagEditorRef}
            className="tag-editor"
            initialValue={tag}
            onSave={(v) => {
              onUpdate && onUpdate({ tag: v });
              setEditTag(false);
            }}
            onCancel={() => setEditTag(false)}
            style={inlineEditor(tagStyle)}
            onEditorReady={(editor, computedStyles) => {
              if (onEditorActive) {
                onEditorActive(editor, 'tag', computedStyles);
              }
            }}
          />
        ) : (
          <div className="tag-editor" onClick={() => isEditable && setEditTag(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }} dangerouslySetInnerHTML={{ __html: tag }} />
        )}
      </div>
      <div style={titleStyle}>
        {isEditable && editTitle ? (
          <ControlledWysiwygEditor
            ref={titleEditorRef}
            className="title-element"
            initialValue={title}
            onSave={(v) => {
              onUpdate && onUpdate({ title: v });
              setEditTitle(false);
            }}
            onCancel={() => setEditTitle(false)}
            style={inlineEditor(titleStyle)}
            onEditorReady={(editor, computedStyles) => {
              if (onEditorActive) {
                onEditorActive(editor, 'title', computedStyles);
              }
            }}
          />
        ) : (
          <div className="title-element" onClick={() => isEditable && setEditTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }} dangerouslySetInnerHTML={{ __html: title }} />
        )}
      </div>

      <div style={grid}>
        {cards.map((c, i)=> (
          <div key={i} style={card}>
            <div style={numBox}>{c.number}</div>
            <div className="title-element" style={cardTitle}>
              {isEditable && editCard && editCard.idx === i && editCard.field === 'title' ? (
                <ControlledWysiwygEditor
                  ref={(el) => {
                    if (el) cardTitleEditorRefs.current[i] = el;
                  }}
                  initialValue={c.title}
                  onSave={(v) => {
                    const next = [...cards];
                    next[i] = { ...next[i], title: v };
                    onUpdate && onUpdate({ cards: next });
                    setEditCard(null);
                  }}
                  onCancel={() => setEditCard(null)}
                  style={inline(cardTitle)}
                  onEditorReady={(editor, computedStyles) => {
                    if (onEditorActive) {
                      onEditorActive(editor, `card-${i}-title`, computedStyles);
                    }
                  }}
                />
              ) : (
                <div onClick={() => isEditable && setEditCard({ idx: i, field: 'title' })} style={{ ...cardTitle, cursor: isEditable ? 'pointer' : 'default' }} dangerouslySetInnerHTML={{ __html: c.title }} />
              )}
            </div>
            <div style={cardBody}>
              {isEditable && editCard && editCard.idx === i && editCard.field === 'body' ? (
                <ControlledWysiwygEditor
                  ref={(el) => {
                    if (el) cardBodyEditorRefs.current[i] = el;
                  }}
                  initialValue={c.body}
                  onSave={(v) => {
                    const next = [...cards];
                    next[i] = { ...next[i], body: v };
                    onUpdate && onUpdate({ cards: next });
                    setEditCard(null);
                  }}
                  onCancel={() => setEditCard(null)}
                  style={inline(cardBody)}
                  onEditorReady={(editor, computedStyles) => {
                    if (onEditorActive) {
                      onEditorActive(editor, `card-${i}-body`, computedStyles);
                    }
                  }}
                />
              ) : (
                <div onClick={() => isEditable && setEditCard({ idx: i, field: 'body' })} style={{ ...cardBody, cursor: isEditable ? 'pointer' : 'default' }} dangerouslySetInnerHTML={{ __html: c.body }} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={rightTextStyle}>
        {isEditable && editRight ? (
          <ControlledWysiwygEditor
            ref={rightTextEditorRef}
            initialValue={rightText}
            onSave={(v) => {
              onUpdate && onUpdate({ rightText: v });
              setEditRight(false);
            }}
            onCancel={() => setEditRight(false)}
            style={inlineEditor(rightTextStyle)}
            onEditorReady={(editor, computedStyles) => {
              if (onEditorActive) {
                onEditorActive(editor, 'right-text', computedStyles);
              }
            }}
          />
        ) : (
          <div onClick={() => isEditable && setEditRight(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }} dangerouslySetInnerHTML={{ __html: rightText }} />
        )}
      </div>

      <div style={avatar}>
        <AvatarImageDisplay
          size="MEDIUM"
          position="CENTER"
          style={{
            width: '88%',
            height: '135%',
            borderRadius: '50%',
            position: 'relative',
            bottom: '0px',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Page number */}
      <div style={{...pageNumberStyle, display: 'flex', alignItems: 'center', gap: '8px'}}>
        <div style={{
          width: '15px',
          height: '1px',
          backgroundColor: '#5F616D'
        }}></div>
        {isEditable && editPageNumber ? (
          <ControlledWysiwygEditor
            ref={pageNumberEditorRef}
            initialValue={currentPageNumber}
            onSave={(v) => {
              setCurrentPageNumber(v);
              setEditPageNumber(false);
              onUpdate && onUpdate({ pageNumber: v });
            }}
            onCancel={() => setEditPageNumber(false)}
            style={inlineEditor(pageNumberStyle)}
            onEditorReady={(editor, computedStyles) => {
              if (onEditorActive) {
                onEditorActive(editor, 'page-number', computedStyles);
              }
            }}
          />
        ) : (
          <div onClick={() => isEditable && setEditPageNumber(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }} dangerouslySetInnerHTML={{ __html: currentPageNumber }} />
        )}
      </div>
      </div>
    </>
  );
};

export default ProblemsGridSlideTemplate;

