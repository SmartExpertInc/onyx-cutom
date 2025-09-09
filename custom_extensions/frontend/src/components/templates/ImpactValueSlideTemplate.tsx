// custom_extensions/frontend/src/components/templates/ImpactValueSlideTemplate.tsx

import React, { useState } from 'react';
import { ImpactValueSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export const ImpactValueSlideTemplate: React.FC<ImpactValueSlideProps & { theme?: SlideTheme | string }> = ({
  slideId,
  year = '2024',
  subtitle = 'Presentation',
  title = 'Impact\nValue',
  metrics = [
    { number: '+30%', caption: 'Trust and loyalty' },
    { number: '$3.9', caption: 'Saved in costs' },
    { number: '-15%', caption: 'Legal expenses' }
  ],
  backgroundColor = '#EAE055',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingYear, setEditingYear] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState(metrics);

  const slide: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor,
    position: 'relative',
    fontFamily: currentTheme.fonts.titleFont,
    overflow: 'hidden'
  };

  const header: React.CSSProperties = { position: 'absolute', left: '48px', top: '28px', color: '#1E1F20', fontSize: '16px' };
  const headerRight: React.CSSProperties = { position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '28px', color: '#1E1F20', fontSize: '16px' };
  const leftCol: React.CSSProperties = { position: 'absolute', left: '48px', top: '72px', bottom: '48px', width: '30%' };
  const titleStyle: React.CSSProperties = { whiteSpace: 'pre-line', fontSize: '76px', fontWeight: 800, color: '#1E1F20', letterSpacing: '-1px', lineHeight: 0.98 };
  const divider: React.CSSProperties = { position: 'absolute', top: '56px', bottom: '56px', width: '4px', backgroundColor: 'rgba(0,0,0,0.12)', left: '50%' };
  const divider2: React.CSSProperties = { position: 'absolute', top: '56px', bottom: '56px', width: '4px', backgroundColor: 'rgba(0,0,0,0.12)', left: '75%' };

  const metricArea: React.CSSProperties = { position: 'absolute', left: '50%', right: '0', top: '96px', height: '160px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' };
  const metricNumber: React.CSSProperties = { fontSize: '92px', fontWeight: 900, color: '#1F211F', textAlign: 'center', letterSpacing: '-2px' };
  const imageRow: React.CSSProperties = { position: 'absolute', left: '36%', right: '48px', top: '290px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '28px' };
  const captionRow: React.CSSProperties = { position: 'absolute', left: '36%', right: '48px', top: '480px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '28px', color: '#5E5F5B', fontSize: '18px', textAlign: 'center' };

  return (
    <div className="impact-value-slide inter-theme" style={slide}>
      {/* Header labels */}
      <div style={header}>
        {isEditable && editingYear ? (
          <ImprovedInlineEditor initialValue={year} onSave={(v)=>{onUpdate&&onUpdate({year:v});setEditingYear(false);}} onCancel={()=>setEditingYear(false)} style={{...header}} />
        ) : (
          <div onClick={()=>isEditable&&setEditingYear(true)} style={{cursor:isEditable?'pointer':'default'}}>{year}</div>
        )}
      </div>
      <div style={headerRight}>
        {isEditable && editingSubtitle ? (
          <ImprovedInlineEditor initialValue={subtitle} onSave={(v)=>{onUpdate&&onUpdate({subtitle:v});setEditingSubtitle(false);}} onCancel={()=>setEditingSubtitle(false)} style={{...headerRight}} />
        ) : (
          <div onClick={()=>isEditable&&setEditingSubtitle(true)} style={{cursor:isEditable?'pointer':'default'}}>{subtitle}</div>
        )}
      </div>

      {/* Left column title and avatar image */}
      <div style={leftCol}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={title}
            multiline={true}
            onSave={(v)=>{onUpdate&&onUpdate({title:v});setEditingTitle(false);}}
            onCancel={()=>setEditingTitle(false)}
            style={{...titleStyle}}
          />
        ) : (
          <div onClick={()=>isEditable&&setEditingTitle(true)} style={{cursor:isEditable?'pointer':'default', ...titleStyle}}>{title}</div>
        )}

        <div style={{ position: 'absolute', left: 0, bottom: 0, width: '280px', height: '280px', backgroundColor: '#121417' }}>
          <ClickableImagePlaceholder imagePath={''} onImageUploaded={(p)=>onUpdate&&onUpdate({ leftAvatarPath: p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Vertical dividers */}
      <div style={divider} />
      <div style={divider2} />

      {/* Big numbers */}
      <div style={metricArea}>
        {currentMetrics.map((m, i)=> (
          <div key={i} style={{ display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
            <div style={metricNumber}>{m.number}</div>
          </div>
        ))}
      </div>

      {/* Three images */}
      <div style={imageRow}>
        {currentMetrics.map((m, i)=> (
          <ClickableImagePlaceholder key={i} imagePath={(m as any).imagePath || ''} onImageUploaded={(p)=>{ const nm=[...currentMetrics]; (nm[i] as any).imagePath=p; setCurrentMetrics(nm); onUpdate&&onUpdate({metrics:nm}); }} size="LARGE" position="CENTER" description={`Image ${i+1}`} isEditable={isEditable} style={{ width:'100%', height:'190px', objectFit:'cover', filter:'grayscale(100%)' }} />
        ))}
      </div>

      {/* Captions */}
      <div style={captionRow}>
        {currentMetrics.map((m, i)=> (
          <div key={i}>{m.caption}</div>
        ))}
      </div>
    </div>
  );
};

export default ImpactValueSlideTemplate;

