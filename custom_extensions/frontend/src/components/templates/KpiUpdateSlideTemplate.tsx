// custom_extensions/frontend/src/components/templates/KpiUpdateSlideTemplate.tsx

import React, { useState, useRef } from 'react';
import { KpiUpdateSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import AvatarImageDisplay from '../AvatarImageDisplay';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';
import { ControlledWysiwygEditor, ControlledWysiwygEditorRef } from '../editors/ControlledWysiwygEditor';

export const KpiUpdateSlideTemplate: React.FC<KpiUpdateSlideProps & { 
  theme?: SlideTheme | string;
  onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;
}> = ({
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
  theme,
  onEditorActive
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [editingYourLogoText, setEditingYourLogoText] = useState(false);
  const [currentItems, setCurrentItems] = useState(items);
  const [editingItem, setEditingItem] = useState<{ index: number; field: 'value' | 'description' } | null>(null);
  
  // Editor refs
  const titleEditorRef = useRef<ControlledWysiwygEditorRef>(null);
  const itemValueEditorRefs = useRef<(ControlledWysiwygEditorRef | null)[]>([]);
  const itemDescriptionEditorRefs = useRef<(ControlledWysiwygEditorRef | null)[]>([]);
  const [editingFooterLeft, setEditingFooterLeft] = useState(false);
  const [editingFooterCenter, setEditingFooterCenter] = useState(false);
  const [editingFooterRight, setEditingFooterRight] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState('19');
  const [currentYourLogoText, setCurrentYourLogoText] = useState('Your Logo');
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState('');
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#E0E7FF',
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
    left: '40px',
    top: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const titlePillStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #09090B'
  };

  const titleDotStyle: React.CSSProperties = {
    width: '8px',
    height: '8px',
    backgroundColor: 'blue',
    borderRadius: '50%'
  };

  const titleTextStyle: React.CSSProperties = {
    color: '#585955',
    fontSize: '16px',
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
    color: '#09090B',
    fontWeight: 700,
    textAlign: 'right',
    letterSpacing: '-3px',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    marginBottom: '50px'
  };

  const descStyle: React.CSSProperties = {
    color: '#09090B',
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

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ title, items, profileImagePath, profileImageAlt, footerLeft, footerCenter, footerRight }, pageNumber: newPageNumber });
    }
  };

  const handleYourLogoTextSave = (newYourLogoText: string) => {
    setCurrentYourLogoText(newYourLogoText);
    setEditingYourLogoText(false);
    if (onUpdate) {
      onUpdate({ ...{ title, items, profileImagePath, profileImageAlt, footerLeft, footerCenter, footerRight }, yourLogoText: newYourLogoText });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ title, items, profileImagePath, profileImageAlt, footerLeft, footerCenter, footerRight }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <div className="kpi-update-slide" style={slideStyles}>
      <div style={titleStyle}>
        <div style={titlePillStyle}>
          <div style={titleDotStyle} />
          {isEditable && editingTitle ? (
            <ControlledWysiwygEditor
              ref={titleEditorRef}
              initialValue={title}
              onSave={(v) => { onUpdate && onUpdate({ title: v }); setEditingTitle(false); }}
              onCancel={() => setEditingTitle(false)}
              placeholder="Enter title..."
              className="kpi-title-editor"
              style={{
                ...titleTextStyle,
                padding: '8px 12px',
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }}
              onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, 'title', computedStyles)}
            />
          ) : (
            <div 
              onClick={() => isEditable && setEditingTitle(true)} 
              style={{ ...titleTextStyle, cursor: isEditable ? 'pointer' : 'default' }}
              dangerouslySetInnerHTML={{ __html: title }}
            />
          )}
        </div>
      </div>

      <div style={itemsArea}>
        {/* KPI rows */}
        {currentItems.map((it, i) => (
          <React.Fragment key={i}>
            {/* Value cell */}
            <div style={{ minHeight: '116px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {isEditable && editingItem?.index === i && editingItem?.field === 'value' ? (
                <ControlledWysiwygEditor
                  ref={(el) => {
                    if (!itemValueEditorRefs.current) itemValueEditorRefs.current = [];
                    itemValueEditorRefs.current[i] = el;
                  }}
                  initialValue={it.value}
                  onSave={(v) => { const ni=[...currentItems]; ni[i]={...ni[i], value:v}; setCurrentItems(ni); onUpdate && onUpdate({ items: ni }); setEditingItem(null); }}
                  onCancel={() => setEditingItem(null)}
                  placeholder="Enter value..."
                  className="kpi-value-editor"
                  style={{
                    ...valueStyle,
                    padding: '8px 12px',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                  onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, `item-${i}-value`, computedStyles)}
                />
              ) : (
                <div style={valueStyle} onClick={() => isEditable && setEditingItem({ index: i, field: 'value' })} dangerouslySetInnerHTML={{ __html: it.value }} />
              )}
            </div>

            {/* Description cell */}
            <div style={{ minHeight: '64px', position: 'relative' }}>
              {isEditable && editingItem?.index === i && editingItem?.field === 'description' ? (
                <ControlledWysiwygEditor
                  ref={(el) => {
                    if (!itemDescriptionEditorRefs.current) itemDescriptionEditorRefs.current = [];
                    itemDescriptionEditorRefs.current[i] = el;
                  }}
                  initialValue={it.description}
                  onSave={(v) => { const ni=[...currentItems]; ni[i]={...ni[i], description:v}; setCurrentItems(ni); onUpdate && onUpdate({ items: ni }); setEditingItem(null); }}
                  onCancel={() => setEditingItem(null)}
                  placeholder="Enter description..."
                  className="kpi-desc-editor"
                  style={{
                    ...descStyle,
                    minHeight: 'auto',
                    padding: '8px 12px',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                  onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, `item-${i}-description`, computedStyles)}
                />
              ) : (
                <div style={descStyle} onClick={() => isEditable && setEditingItem({ index: i, field: 'description' })} dangerouslySetInnerHTML={{ __html: it.description }} />
              )}
              
              {/* Separator line under each description */}
              <div style={{
                position: 'absolute',
                bottom: '-5px',
                left: '-50px', // Start from the beginning of the percentage area
                right: '0',
                height: '1px',
                backgroundColor: 'rgba(0, 0, 0, 0.1)'
              }} />
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Avatar absolute bottom-left */}
      <div style={{ position: 'absolute', left: '56px', bottom: '120px', width: '140px', backgroundColor: '#0F58F9', height: '140px', borderRadius: '50%', overflow: 'hidden' }}>
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

      {/* Page number in bottom-left */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '0px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10
      }}>
        {/* Small line */}
        <div style={{
          width: '20px',
          height: '1px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }} />
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={() => setEditingPageNumber(false)}
            className="page-number-editor"
            style={{
              color: '#000000',
              fontSize: '17px',
              fontWeight: '300',
              width: '30px',
              height: 'auto',
              background: 'transparent',
              border: 'none',
              outline: 'none'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
              color: '#000000',
              fontSize: '17px',
              fontWeight: '300',
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentPageNumber}
          </div>
        )}
      </div>

      {/* Your Logo in bottom-right */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 10
      }}>
        {currentCompanyLogoPath ? (
          // Show uploaded logo image
          <ClickableImagePlaceholder
            imagePath={currentCompanyLogoPath}
            onImageUploaded={handleCompanyLogoUploaded}
            size="SMALL"
            position="CENTER"
            description="Company logo"
            isEditable={isEditable}
            style={{
              height: '30px',
              maxWidth: '120px',
              objectFit: 'contain'
            }}
          />
        ) : (
          // Show default logo design with clickable area
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: isEditable ? 'pointer' : 'default'
          }}
          onClick={() => isEditable && setShowLogoUploadModal(true)}
          >
            <div style={{
              width: '30px',
              height: '30px',
              border: '2px solid #000000',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000000'
            }}>
              <div style={{
                width: '12px',
                height: '2px',
                backgroundColor: '#FFFFFF',
                position: 'absolute'
              }} />
              <div style={{
                width: '2px',
                height: '12px',
                backgroundColor: '#FFFFFF',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }} />
            </div>
            {isEditable && editingYourLogoText ? (
              <ImprovedInlineEditor
                initialValue={currentYourLogoText}
                onSave={handleYourLogoTextSave}
                onCancel={() => setEditingYourLogoText(false)}
                className="your-logo-text-editor"
                style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#000000',
                  width: '80px',
                  height: 'auto',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none'
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingYourLogoText(true)}
                style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#000000',
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {currentYourLogoText}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logo Upload Modal */}
      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={(newLogoPath: string) => {
            handleCompanyLogoUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default KpiUpdateSlideTemplate;

