// custom_extensions/frontend/src/components/templates/KpiUpdateSlideTemplate.tsx

import React, { useState } from 'react';
import { KpiUpdateSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

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

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#f7f6f2',
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
    backgroundColor: '#e5e3de',
    borderRadius: '2px'
  };

  const titleStyle: React.CSSProperties = {
    position: 'absolute',
    left: '56px',
    top: '90px',
    color: '#6f756b',
    fontSize: '24px',
    fontWeight: 500
  };

  const itemsArea: React.CSSProperties = {
    position: 'absolute',
    left: '48px',
    right: '48px',
    top: '140px',
    bottom: '120px',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    rowGap: '56px',
    columnGap: '48px',
    alignItems: 'center'
  };

  const footerLine: React.CSSProperties = {
    position: 'absolute',
    left: '40px',
    right: '40px',
    bottom: '72px',
    height: '4px',
    backgroundColor: '#e5e3de',
    borderRadius: '2px'
  };

  return (
    <div className="kpi-update-slide inter-theme" style={slideStyles}>
      <div style={headerLine} />
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
        {/* Left profile image */}
        <div style={{ gridColumn: '1 / 2', gridRow: '1 / span 3', alignSelf: 'end' }}>
          <div style={{ width: '128px', height: '128px', borderRadius: '50%', overflow: 'hidden' }}>
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
        </div>

        {/* KPI rows */}
        {currentItems.map((it, i) => (
          <React.Fragment key={i}>
            {isEditable && editingItem?.index === i && editingItem?.field === 'value' ? (
              <ImprovedInlineEditor
                initialValue={it.value}
                onSave={(v) => { const ni=[...currentItems]; ni[i]={...ni[i], value:v}; setCurrentItems(ni); onUpdate && onUpdate({ items: ni }); setEditingItem(null); }}
                onCancel={() => setEditingItem(null)}
                className="kpi-value-editor"
                style={{ fontSize: i === 3 ? '100px' : '96px', color: '#33382e', fontWeight: 700, textAlign: 'right' }}
              />
            ) : (
              <div style={{ fontSize: i === 3 ? '100px' : '96px', color: '#33382e', fontWeight: 700, textAlign: 'right' }} onClick={() => isEditable && setEditingItem({ index: i, field: 'value' })}>{it.value}</div>
            )}

            {isEditable && editingItem?.index === i && editingItem?.field === 'description' ? (
              <ImprovedInlineEditor
                initialValue={it.description}
                multiline={true}
                onSave={(v) => { const ni=[...currentItems]; ni[i]={...ni[i], description:v}; setCurrentItems(ni); onUpdate && onUpdate({ items: ni }); setEditingItem(null); }}
                onCancel={() => setEditingItem(null)}
                className="kpi-desc-editor"
                style={{ color: '#8a8f86', lineHeight: 1.6 }}
              />
            ) : (
              <div style={{ color: '#8a8f86', lineHeight: 1.6 }} onClick={() => isEditable && setEditingItem({ index: i, field: 'description' })}>{it.description}</div>
            )}
          </React.Fragment>
        ))}

        {isEditable && (
          <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
            <button
              onClick={() => { const ni=[...currentItems, { value: '10%', description: 'New metric description' }]; setCurrentItems(ni); onUpdate && onUpdate({ items: ni }); }}
              style={{ background: '#33382e', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', marginRight: '8px' }}
            >
              Add row
            </button>
            {currentItems.length > 1 && (
              <button
                onClick={() => { const ni=currentItems.slice(0, -1); setCurrentItems(ni); onUpdate && onUpdate({ items: ni }); }}
                style={{ background: '#e5e3de', color: '#33382e', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer' }}
              >
                Remove last
              </button>
            )}
          </div>
        )}
      </div>

      <div style={footerLine} />
      {/* Footer texts */}
      <div style={{ position: 'absolute', left: '40px', bottom: '32px', color: '#babbb2', fontSize: '14px' }}>{footerLeft}</div>
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '32px', color: '#babbb2', fontSize: '14px' }}>{footerCenter}</div>
      <div style={{ position: 'absolute', right: '40px', bottom: '32px', color: '#babbb2', fontSize: '14px' }}>{footerRight}</div>
    </div>
  );
};

export default KpiUpdateSlideTemplate;

