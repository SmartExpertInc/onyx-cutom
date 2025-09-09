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
  const [editingFooterLeft, setEditingFooterLeft] = useState(false);
  const [editingFooterCenter, setEditingFooterCenter] = useState(false);
  const [editingFooterRight, setEditingFooterRight] = useState(false);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#F4F4F0',
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
    backgroundColor: '#E3E1DC',
    borderRadius: '999px'
  };

  const headerLineCap: React.CSSProperties = {
    position: 'absolute',
    right: '40px',
    top: '36px',
    width: '32px',
    height: '12px',
    backgroundColor: '#E3E1DC',
    borderRadius: '999px'
  };

  const titleStyle: React.CSSProperties = {
    position: 'absolute',
    left: '56px',
    top: '92px',
    color: '#6A7167',
    fontSize: '28px',
    fontWeight: 600
  };

  const itemsArea: React.CSSProperties = {
    position: 'absolute',
    left: '56px',
    right: '56px',
    top: '168px',
    bottom: '140px',
    display: 'grid',
    gridTemplateColumns: '360px 1fr',
    rowGap: '56px',
    columnGap: '72px',
    alignItems: 'center'
  };

  const footerLine: React.CSSProperties = {
    position: 'absolute',
    left: '40px',
    right: '40px',
    bottom: '64px',
    height: '4px',
    backgroundColor: '#E3E1DC',
    borderRadius: '999px'
  };

  const footerLineCap: React.CSSProperties = {
    position: 'absolute',
    left: '40px',
    bottom: '58px',
    width: '32px',
    height: '12px',
    backgroundColor: '#E3E1DC',
    borderRadius: '999px'
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
            <div style={{ minHeight: '116px', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
              {isEditable && editingItem?.index === i && editingItem?.field === 'value' ? (
                <ImprovedInlineEditor
                  initialValue={it.value}
                  onSave={(v) => { const ni=[...currentItems]; ni[i]={...ni[i], value:v}; setCurrentItems(ni); onUpdate && onUpdate({ items: ni }); setEditingItem(null); }}
                  onCancel={() => setEditingItem(null)}
                  className="kpi-value-editor"
                  style={{ fontSize: '120px', color: '#2E332C', fontWeight: 800, textAlign: 'right', letterSpacing: '-2px', lineHeight: 1, whiteSpace: 'nowrap' }}
                />
              ) : (
                <div style={{ fontSize: '120px', color: '#2E332C', fontWeight: 800, textAlign: 'right', letterSpacing: '-2px', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden' }} onClick={() => isEditable && setEditingItem({ index: i, field: 'value' })}>{it.value}</div>
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
                  style={{ color: '#9CA09A', lineHeight: 1.7, fontSize: '18px', minHeight: 'auto', maxWidth: '760px' }}
                />
              ) : (
                <div style={{ color: '#9CA09A', lineHeight: 1.7, fontSize: '18px', maxWidth: '760px' }} onClick={() => isEditable && setEditingItem({ index: i, field: 'description' })}>{it.description}</div>
              )}
            </div>
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
      <div style={footerLineCap} />

      {/* Profile image absolute bottom-left */}
      <div style={{ position: 'absolute', left: '56px', bottom: '120px', width: '140px', height: '140px', borderRadius: '50%', overflow: 'hidden' }}>
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

