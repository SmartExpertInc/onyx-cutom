// custom_extensions/frontend/src/components/templates/KpiUpdateSlideTemplate.tsx

import React, { useState } from 'react';
import { KpiUpdateSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';


  // Helper function for inline editor styling
  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    margin: 0
  });

export const KpiUpdateSlideTemplate: React.FC<KpiUpdateSlideProps & { theme?: SlideTheme | string }>= ({
  slideId,
  title = 'KPI Update',
  items = [
    { value: '10%', description: 'With so much data, it can be tempting to measure everything-or at least things that are easiest to measure. However, you need to be sure you\'re' },
    { value: '75', description: 'With so much data, it can be tempting to measure everything-or at least things that are easiest to measure. However, you need to be sure you\'re' },
    { value: '86%', description: 'With so much data, it can be tempting to measure everything-or at least things that are easiest to measure. However, you need to be sure you\'re' },
    { value: '1M', description: 'With so much data, it can be tempting to measure everything-or at least things that are easiest to measure. However, you need to be sure you\'re' }
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile',
  footerLeft = 'Company name',
  footerCenter = 'KPI Report',
  footerRight = 'February 2023',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);
  const [currentItems, setCurrentItems] = useState(items);
  const [editingItem, setEditingItem] = useState<{ index: number; field: 'value' | 'description' } | null>(null);
  const [editingFooterLeft, setEditingFooterLeft] = useState(false);
  const [editingFooterCenter, setEditingFooterCenter] = useState(false);
  const [editingFooterRight, setEditingFooterRight] = useState(false);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#F9F8F6',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont
  };

  const headerLine: React.CSSProperties = {
    position: 'absolute',
    left: '40px',
    right: '40px',
    top: '40px',
    height: '4px',
    backgroundColor: '#E6E5E3',
    borderRadius: '999px'
  };

  const headerLineCap: React.CSSProperties = {
    position: 'absolute',
  };

  const titleStyle: React.CSSProperties = {
    position: 'absolute',
    left: '56px',
    top: '90px',
    color: '#585955',
    fontSize: '26px',
    fontWeight: 500
  };

  const itemsArea: React.CSSProperties = {
    position: 'absolute',
    left: '125px',
    right: '56px',
    top: '80px',
    bottom: '148px',
    display: 'grid',
    gridTemplateColumns: '380px 1fr',
    gridAutoRows: 'minmax(120px, auto)',
    rowGap: '10px',
    columnGap: '15px 72px',
    alignItems: 'center'
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '66px',
    color: '#3B3E36',
    fontWeight: 700,
    textAlign: 'right',
    letterSpacing: '-3px',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    marginBottom: '50px'
  };

  const descStyle: React.CSSProperties = {
    color: '#878783',
    lineHeight: 1.65,
    fontSize: '15px',
    maxWidth: '500px',
    marginLeft: '50px',
    marginTop: '-28px'
  };

  const footerLine: React.CSSProperties = {
    position: 'absolute',
    left: '40px',
    right: '40px',
    bottom: '64px',
    height: '6px',
    backgroundColor: '#E6E5E3',
    borderRadius: '999px'
  };

  const footerLineCap: React.CSSProperties = {
    position: 'absolute',
  };

  return (
    <div className="kpi-update-slide inter-theme" style={slideStyles}>
      <div style={headerLine} />
      <div style={headerLineCap} />
      <div style={titleStyle}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={title}
            onSave={(v) => { onUpdate && onUpdate({ title: v }); setEditingTitle(false); }}
            onCancel={() => setEditingTitle(false)}
            className="kpi-title-editor"
            style={{ ...titleStyle, position: 'relative' }}
          />
        ) : (
          <div onClick={() => isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
        )}
      </div>

      <div style={itemsArea}>
        {/* KPI rows */}
        {currentItems.map((it, i) => (
          <React.Fragment key={i}>
            {/* Value cell */}
            <div style={{ minHeight: '116px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {isEditable && editingItem?.index === i && editingItem?.field === 'value' ? (
                <ImprovedInlineEditor
                  initialValue={it.value}
                  onSave={(v) => { const ni=[...currentItems]; ni[i]={...ni[i], value:v}; setCurrentItems(ni); onUpdate && onUpdate({ items: ni }); setEditingItem(null); }}
                  onCancel={() => setEditingItem(null)}
                  className="kpi-value-editor"
                  style={{ ...valueStyle }}
                />
              ) : (
                <div style={valueStyle} onClick={() => isEditable && setEditingItem({ index: i, field: 'value' })}>{it.value}</div>
              )}
            </div>

            {/* Description cell */}
            <div style={{ minHeight: '64px' }}>
              {isEditable && editingItem?.index === i && editingItem?.field === 'description' ? (
                <ImprovedInlineEditor
                  initialValue={it.description}
                  multiline={true}
                  onSave={(v) => { const ni=[...currentItems]; ni[i]={...ni[i], description:v}; setCurrentItems(ni); onUpdate && onUpdate({ items: ni }); setEditingItem(null); }}
                  onCancel={() => setEditingItem(null)}
                  className="kpi-desc-editor"
                  style={{ ...descStyle, minHeight: 'auto' }}
                />
              ) : (
                <div style={descStyle} onClick={() => isEditable && setEditingItem({ index: i, field: 'description' })}>{it.description}</div>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>

      <div style={footerLine} />
      <div style={footerLineCap} />

      {/* Profile image absolute bottom-left */}
      <div style={{ position: 'absolute', left: '56px', bottom: '120px', width: '140px', backgroundColor: '#2B3127', height: '140px', borderRadius: '50%', overflow: 'hidden' }}>
        <ClickableImagePlaceholder
          imagePath={profileImagePath}
          onImageUploaded={(p: string) => onUpdate && onUpdate({ profileImagePath: p })}
          size="LARGE"
          position="CENTER"
          description="Profile"
          isEditable={isEditable}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
      </div>

      {/* Footer texts (editable) */}
      <div style={{ position: 'absolute', left: '40px', bottom: '24px', color: '#babbb2', fontSize: '14px' }}>
        {isEditable && editingFooterLeft ? (
          <ImprovedInlineEditor
            initialValue={footerLeft}
            onSave={(v) => { onUpdate && onUpdate({ footerLeft: v }); setEditingFooterLeft(false); }}
            onCancel={() => setEditingFooterLeft(false)}
            style={{ color: '#babbb2', fontSize: '14px' }}
          />
        ) : (
          <span onClick={() => isEditable && setEditingFooterLeft(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{footerLeft}</span>
        )}
      </div>
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '24px', color: '#babbb2', fontSize: '14px' }}>
        {isEditable && editingFooterCenter ? (
          <ImprovedInlineEditor
            initialValue={footerCenter}
            onSave={(v) => { onUpdate && onUpdate({ footerCenter: v }); setEditingFooterCenter(false); }}
            onCancel={() => setEditingFooterCenter(false)}
            style={{ color: '#babbb2', fontSize: '14px' }}
          />
        ) : (
          <span onClick={() => isEditable && setEditingFooterCenter(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{footerCenter}</span>
        )}
      </div>
      <div style={{ position: 'absolute', right: '40px', bottom: '24px', color: '#babbb2', fontSize: '14px' }}>
        {isEditable && editingFooterRight ? (
          <ImprovedInlineEditor
            initialValue={footerRight}
            onSave={(v) => { onUpdate && onUpdate({ footerRight: v }); setEditingFooterRight(false); }}
            onCancel={() => setEditingFooterRight(false)}
            style={{ color: '#babbb2', fontSize: '14px' }}
          />
        ) : (
          <span onClick={() => isEditable && setEditingFooterRight(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{footerRight}</span>
        )}
      </div>
    </div>
  );
};

export default KpiUpdateSlideTemplate;

