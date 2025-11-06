// custom_extensions/frontend/src/components/templates/CultureValuesThreeColumnsSlideTemplate.tsx

import React, { useState, useRef } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';
import { ControlledWysiwygEditor, ControlledWysiwygEditorRef } from '../editors/ControlledWysiwygEditor';

export interface CultureValuesThreeColumnsProps extends BaseTemplateProps {
  logoText?: string;
  logoPath?: string;
  title: string;
  leftTitle: string;
  leftText: string;
  middleTitle: string;
  middleText: string;
  rightTitle: string;
  rightText: string;
  middlePanelColor?: string;
  avatarPath?: string;
  backgroundColor?: string;
}

export const CultureValuesThreeColumnsSlideTemplate: React.FC<CultureValuesThreeColumnsProps & { 
  theme?: SlideTheme | string;
  onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;
}> = ({
  slideId,
  logoText = 'Your Logo',
  logoPath = '',
  title = 'Our culture and values',
  leftTitle = 'Code of Conduct',
  leftText = 'Code of conduct and ethics.\n\nWe expect all employees to behave in an ethical and professional manner and to uphold the following principles: ...',
  middleTitle = 'HR Policies',
  middleText = 'HR policies, including time off, benefits, and compensation.\n\nOur HR policies are designed to support employees ...',
  rightTitle = 'IT Policies',
  rightText = 'IT policies, including data security and acceptable use.\n\nSecure password management and protection of company data ...',
  middlePanelColor = '#3B46FF',
  avatarPath = '',
  isEditable = false,
  onUpdate,
  theme,
  onEditorActive,
  backgroundColor
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editLogo, setEditLogo] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [editLeftTitle, setEditLeftTitle] = useState(false);
  const [editLeft, setEditLeft] = useState(false);
  const [editMiddleTitle, setEditMiddleTitle] = useState(false);
  const [editMiddle, setEditMiddle] = useState(false);
  const [editRightTitle, setEditRightTitle] = useState(false);
  const [editRight, setEditRight] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState('40');
  
  // Editor refs
  const titleEditorRef = useRef<ControlledWysiwygEditorRef>(null);
  const leftTitleEditorRef = useRef<ControlledWysiwygEditorRef>(null);
  const leftTextEditorRef = useRef<ControlledWysiwygEditorRef>(null);
  const middleTitleEditorRef = useRef<ControlledWysiwygEditorRef>(null);
  const middleTextEditorRef = useRef<ControlledWysiwygEditorRef>(null);
  const rightTitleEditorRef = useRef<ControlledWysiwygEditorRef>(null);
  const rightTextEditorRef = useRef<ControlledWysiwygEditorRef>(null);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background: backgroundColor || '#E0E7FF', color:'black', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const top: React.CSSProperties = { position:'absolute', left:0, right:0, top:0, height:'250px', background:'#E0E7FF', borderBottom:'1px solid #d8d8d8' };
  const logoStyle: React.CSSProperties = { position:'absolute', left:'48px', top:'48px', color:'#6b7280', fontSize:'22px' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'48px', top:'88px', fontSize:'56px', fontWeight:800, color:'#242424' };
  const avatarWrap: React.CSSProperties = { position:'absolute', right:'48px', top:'40px', width:'170px', height:'170px', borderRadius:'50%', overflow:'hidden', background:'#0F58F9', boxShadow:'0 0 0 2px rgba(0,0,0,0.06) inset' };

  const grid: React.CSSProperties = { position:'absolute', left:0, right:0, bottom:0, top:'250px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr' };
  const col: React.CSSProperties = { padding: '30px 38px 25px 28px', fontSize:'15px', lineHeight:1.6, color:'#FFFFFF', background:'#0F58F9' };
  const mid: React.CSSProperties = { padding:'30px 38px 25px 28px', fontSize:'15px', lineHeight:1.6, color:'black', background:'#FFFFFF' };
  const cardTitleStyle: React.CSSProperties = { fontSize:'18px', fontWeight:800, marginBottom:'16px', color:'#FFFFFF' };
  const cardTitleStyleMid: React.CSSProperties = { fontSize:'18px', fontWeight:800, marginBottom:'16px', color:'#000000' };
  const pageNumberStyle: React.CSSProperties = { position:'absolute', bottom:'15px', left:'0px', color:'#9EBBFC', fontSize:'15px', fontWeight:600 };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ 
    ...base, 
    position:'relative', 
    background:'transparent', 
    border:'none', 
    outline:'none', 
    padding:0, 
    margin:0, 
    whiteSpace:'pre-wrap',
    boxSizing: 'border-box',
    width: '100%',
    minHeight: 'auto'
  });
  
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
    whiteSpace: base.whiteSpace || 'pre-wrap',
    width: '100%',
    fontFamily: base.fontFamily
  });
  return (
    <>
      <style>{`
          .culture-values-three-columns *:not(.title-element) {
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          }
          .culture-values-three-columns .title-element {
            font-family: "Lora", serif !important;
            font-weight: 600 !important;
          }
          .culture-values-three-columns .title-element * {
            font-family: "Lora", serif !important;
            font-weight: 600 !important;
          }
          .culture-values-three-columns .section-title {
            font-family: "Lora", serif !important;
            font-weight: 600 !important;
          }
          .card-title-left {
            color: #FFFFFF !important;
            font-weight: 600 !important;
          }
          .card-title-left * {
            color: #FFFFFF !important;
            font-weight: 600 !important;
          }
          .card-title-middle {
            color: #000000 !important;
            font-weight: 600 !important;
          }
          .card-title-middle * {
            color: #000000 !important;
            font-weight: 600 !important;
          }
          .card-title-right {
            color: #FFFFFF !important;
            font-weight: 600 !important;
          }
          .card-title-right * {
            color: #FFFFFF !important;
            font-weight: 600 !important;
          }
      `}</style>
      <div className="culture-values-three-columns" style={slide}>
        <div style={top} />
        <YourLogo
          logoPath={logoPath}
          onLogoUploaded={(p)=> onUpdate && onUpdate({ logoPath: p })}
          isEditable={isEditable}
          color="black"
          text={'Your Logo'}
          style={{ position:'absolute', left:'25px', top:'25px' }}
        />
        <div style={titleStyle}>
          {isEditable && editTitle ? (
            <ControlledWysiwygEditor
              ref={titleEditorRef}
              className="culture-value-title title-element"
              initialValue={title}
              onSave={(v)=>{ onUpdate&&onUpdate({ title:v }); setEditTitle(false); }}
              onCancel={()=>setEditTitle(false)}
              placeholder="Enter title..."
              style={{
                ...inlineEditor(titleStyle),
                padding: '8px 12px',
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }}
              onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, 'title', computedStyles)}
            />
          ) : (
            <div className="culture-value-title title-element" onClick={()=> isEditable && setEditTitle(true)} style={{ cursor: isEditable ? 'pointer':'default' }} dangerouslySetInnerHTML={{ __html: title }} />
          )}
        </div>
        <div style={avatarWrap}>
          <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate && onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ marginTop:'3px', width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
        </div>

        <div className="card-value-text" style={grid}>
          <div style={col}>
            <div className="culture-value-title card-title card-title-left" style={cardTitleStyle}>
              {isEditable && editLeftTitle ? (
                <ControlledWysiwygEditor
                  ref={leftTitleEditorRef}
                  initialValue={leftTitle}
                  onSave={(v)=>{ onUpdate&&onUpdate({ leftTitle:v }); setEditLeftTitle(false); }}
                  onCancel={()=>setEditLeftTitle(false)}
                  placeholder="Enter title..."
                  style={{
                    ...inline(cardTitleStyle),
                    padding: '8px 12px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                  onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, 'leftTitle', computedStyles)}
                />
              ) : (
                <div onClick={()=> isEditable && setEditLeftTitle(true)} style={{ cursor: isEditable ? 'pointer':'default' }} dangerouslySetInnerHTML={{ __html: leftTitle }} />
              )}
            </div>
            {isEditable && editLeft ? (
              <ControlledWysiwygEditor
                ref={leftTextEditorRef}
                initialValue={leftText}
                onSave={(v)=>{ onUpdate&&onUpdate({ leftText:v }); setEditLeft(false); }}
                onCancel={()=>setEditLeft(false)}
                placeholder="Enter text..."
                style={{
                  fontSize:'15px',
                  lineHeight:1.6,
                  color:'#FFFFFF',
                  padding: '8px 12px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  width:'100%'
                }}
                onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, 'leftText', computedStyles)}
              />
            ) : (
              <div onClick={()=> isEditable && setEditLeft(true)} style={{ cursor: isEditable ? 'pointer':'default', whiteSpace:'pre-wrap' }} dangerouslySetInnerHTML={{ __html: leftText }} />
            )}
          </div>
          <div style={mid}>
            <div className="culture-value-title card-title card-title-middle" style={cardTitleStyleMid}>
              {isEditable && editMiddleTitle ? (
                <ControlledWysiwygEditor
                  ref={middleTitleEditorRef}
                  initialValue={middleTitle}
                  onSave={(v)=>{ onUpdate&&onUpdate({ middleTitle:v }); setEditMiddleTitle(false); }}
                  onCancel={()=>setEditMiddleTitle(false)}
                  placeholder="Enter title..."
                  style={{
                    ...inline(cardTitleStyleMid),
                    padding: '8px 12px',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                  onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, 'middleTitle', computedStyles)}
                />
              ) : (
                <div onClick={()=> isEditable && setEditMiddleTitle(true)} style={{ cursor: isEditable ? 'pointer':'default' }} dangerouslySetInnerHTML={{ __html: middleTitle }} />
              )}
            </div>
            {isEditable && editMiddle ? (
              <ControlledWysiwygEditor
                ref={middleTextEditorRef}
                initialValue={middleText}
                onSave={(v)=>{ onUpdate&&onUpdate({ middleText:v }); setEditMiddle(false); }}
                onCancel={()=>setEditMiddle(false)}
                placeholder="Enter text..."
                style={{
                  fontSize:'15px',
                  lineHeight:1.6,
                  color:'black',
                  padding: '8px 12px',
                  border: '1px solid rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  width:'100%'
                }}
                onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, 'middleText', computedStyles)}
              />
            ) : (
              <div onClick={()=> isEditable && setEditMiddle(true)} style={{ cursor: isEditable ? 'pointer':'default', whiteSpace:'pre-wrap' }} dangerouslySetInnerHTML={{ __html: middleText }} />
            )}
          </div>
          <div style={col}>
            <div className="culture-value-title card-title card-title-right" style={cardTitleStyle}>
              {isEditable && editRightTitle ? (
                <ControlledWysiwygEditor
                  ref={rightTitleEditorRef}
                  initialValue={rightTitle}
                  onSave={(v)=>{ onUpdate&&onUpdate({ rightTitle:v }); setEditRightTitle(false); }}
                  onCancel={()=>setEditRightTitle(false)}
                  placeholder="Enter title..."
                  style={{
                    ...inline(cardTitleStyle),
                    padding: '8px 12px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                  onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, 'rightTitle', computedStyles)}
                />
              ) : (
                <div onClick={()=> isEditable && setEditRightTitle(true)} style={{ cursor: isEditable ? 'pointer':'default' }} dangerouslySetInnerHTML={{ __html: rightTitle }} />
              )}
            </div>
            {isEditable && editRight ? (
              <ControlledWysiwygEditor
                ref={rightTextEditorRef}
                initialValue={rightText}
                onSave={(v)=>{ onUpdate&&onUpdate({ rightText:v }); setEditRight(false); }}
                onCancel={()=>setEditRight(false)}
                placeholder="Enter text..."
                style={{
                  fontSize:'15px',
                  lineHeight:1.6,
                  color:'#FFFFFF',
                  padding: '8px 12px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  width:'100%'
                }}
                onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, 'rightText', computedStyles)}
              />
            ) : (
              <div onClick={()=> isEditable && setEditRight(true)} style={{ cursor: isEditable ? 'pointer':'default', whiteSpace:'pre-wrap' }} dangerouslySetInnerHTML={{ __html: rightText }} />
            )}
          </div>
        </div>
        
        {/* Page number */}
        <div style={{...pageNumberStyle, display: 'flex', alignItems: 'center', gap: '8px'}}>
          <div style={{
            width: '15px',
            height: '1px',
            backgroundColor: '#9EBBFC'
          }}></div>
          {isEditable && editingPageNumber ? (
            <ImprovedInlineEditor
              initialValue={currentPageNumber}
              onSave={(v) => {
                setCurrentPageNumber(v);
                setEditingPageNumber(false);
                onUpdate && onUpdate({ pageNumber: v });
              }}
              onCancel={() => setEditingPageNumber(false)}
              style={{ position: 'relative', background: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0, color: '#9EBBFC', fontSize: '16px', fontWeight: 600 }}
            />
          ) : (
            <div onClick={() => isEditable && setEditingPageNumber(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>
              {currentPageNumber}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CultureValuesThreeColumnsSlideTemplate;

