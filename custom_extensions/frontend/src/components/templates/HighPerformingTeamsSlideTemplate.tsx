// custom_extensions/frontend/src/components/templates/HighPerformingTeamsSlideTemplate.tsx

import React, { useMemo, useRef, useState } from 'react';
import { HighPerformingTeamsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';

export const HighPerformingTeamsSlideTemplate: React.FC<HighPerformingTeamsSlideProps & { theme?: SlideTheme | string }> = ({
  slideId: _slideId,
  title = 'The Power of High-\nPerforming Teams',
  description = 'High-performing teams are the driving force behind exceptional results. They achieve more, innovate faster, and adapt to challenges with resilience.',
  panelColor: _panelColor = '#E9B84C',
  lineColor = '#0F58F9',
  points = [
    { x: 6, y: 72 },
    { x: 22, y: 58 },
    { x: 40, y: 64 },
    { x: 58, y: 48 },
    { x: 72, y: 42 },
    { x: 84, y: 38 }
  ],
  avatarPath = '',
  avatarAlt: _avatarAlt = 'Avatar',
  logoNew = '',
  pageNumber = '17',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [curvePoints, setCurvePoints] = useState(points);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  const slide: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    position: 'relative',
    backgroundColor: '#ffffff',
    fontFamily: currentTheme.fonts.titleFont,
    overflow: 'hidden'
  };

  // Top part (30% height) with gradient background
  const topPart: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    background: 'linear-gradient(180deg, #0F58F9 0%, #1023A1 170.85%)',
    overflow: 'hidden'
  };

  // Bottom part (70% height) with blue background
  const bottomPart: React.CSSProperties = {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E0E7FF',
    overflow: 'hidden'
  };

  // Avatar container (like in ResourcesListSlideTemplate)
  const avatarContainer: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '56px',
    transform: 'translateY(-50%)',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  };

  // Title positioned to the right of avatar
  const titleStyle: React.CSSProperties = {
    position: 'absolute',
    left: '180px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '32px',
    fontWeight: 800,
    color: '#FFFFFF',
    maxWidth: '500px'
  };

  // Description positioned below title
  const paragraph: React.CSSProperties = {
    position: 'absolute',
    left: '180px',
    top: '50%',
    transform: 'translateY(calc(-50% + 45px))',
    maxWidth: '500px',
    color: '#FFFFFF',
    fontSize: '14px',
    lineHeight: 1.6,
    opacity: 0.9
  };

  // White panel with chart in bottom part
  const panel: React.CSSProperties = {
    position: 'absolute',
    left: '56px',
    right: '56px',
    top: '56px',
    bottom: '56px',
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    padding: '32px'
  };

  const svgRef = useRef<SVGSVGElement | null>(null);

  const pathD = useMemo(() => {
    const toXY = (p: { x: number; y: number }) => {
      // points are in percentages relative to panel rect
      return p;
    };
    const pts = curvePoints.map(toXY);
    if (pts.length === 0) return '';
    const d: string[] = [];
    d.push(`M ${pts[0].x}% ${pts[0].y}%`);
    for (let i = 1; i < pts.length; i++) {
      d.push(`L ${pts[i].x}% ${pts[i].y}%`);
    }
    return d.join(' ');
  }, [curvePoints]);

  const startDrag = (idx: number, _e: React.MouseEvent) => {
    if (!isEditable || !svgRef.current) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const onMove = (me: MouseEvent) => {
      const rx = Math.max(0, Math.min(100, ((me.clientX - rect.left) / rect.width) * 100));
      const ry = Math.max(0, Math.min(100, ((me.clientY - rect.top) / rect.height) * 100));
      const next = [...curvePoints];
      next[idx] = { x: rx, y: ry };
      setCurvePoints(next);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      onUpdate && onUpdate({ points: curvePoints });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleLogoNewUploaded = (path: string) => {
    if (onUpdate) {
      onUpdate({ logoNew: path });
    }
    setShowLogoUploadModal(false);
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setEditingPageNumber(false);
  };

  return (
    <div className="high-performing-teams-slide inter-theme" style={slide}>
      {/* Top Part - 30% height with gradient background */}
      <div style={topPart}>
        {/* Avatar Container */}
        <div style={avatarContainer}>
          <ClickableImagePlaceholder
            imagePath={avatarPath}
            onImageUploaded={(p: string) => onUpdate && onUpdate({ avatarPath: p })}
            size="LARGE"
            position="CENTER"
            description="Profile photo"
            isEditable={isEditable}
            style={{
              width: '110%',
              height: '110%',
              borderRadius: '50%',
              position: 'relative',
              bottom: '-5px',
              left: '50%',
              transform: 'translateX(-50%)',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Title */}
        <div style={titleStyle}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={title}
              multiline={true}
              onSave={(v) => { onUpdate && onUpdate({ title: v }); setEditingTitle(false); }}
              onCancel={() => setEditingTitle(false)}
              style={{ ...titleStyle, position: 'relative', left: 0, top: 0, transform: 'none' }}
            />
          ) : (
            <div onClick={() => isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
          )}
        </div>

        {/* Description */}
        <div style={paragraph}>
          {isEditable && editingDesc ? (
            <ImprovedInlineEditor
              initialValue={description}
              multiline={true}
              onSave={(v) => { onUpdate && onUpdate({ description: v }); setEditingDesc(false); }}
              onCancel={() => setEditingDesc(false)}
              style={{ ...paragraph, position: 'relative', left: 0, top: 0, transform: 'none', width: '100%' }}
            />
          ) : (
            <div onClick={() => isEditable && setEditingDesc(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{description}</div>
          )}
        </div>
      </div>

      {/* Bottom Part - 70% height with blue background */}
      <div style={bottomPart}>
        {/* White panel with editable line chart */}
        <div style={panel}>
          <svg 
            ref={svgRef} 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            style={{ 
              position: 'absolute', 
              inset: 0,
              width: '100%',
              height: '100%'
            }}
          >
            <path 
              d={pathD} 
              fill="none" 
              stroke={lineColor} 
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {isEditable && curvePoints.map((pt, i) => (
              <circle
                key={i}
                cx={`${pt.x}%`}
                cy={`${pt.y}%`}
                r="1.5"
                fill={lineColor}
                onMouseDown={(e) => startDrag(i, e)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Logo in bottom-right corner */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '30px'
      }}>
        {logoNew ? (
          <ClickableImagePlaceholder
            imagePath={logoNew}
            onImageUploaded={handleLogoNewUploaded}
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
          <div 
            onClick={() => isEditable && setShowLogoUploadModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isEditable ? 'pointer' : 'default'
            }}
          >
            <div style={{
              width: '30px',
              height: '30px',
              border: '2px solid #09090B',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: '#09090B', position: 'absolute' }} />
              <div style={{ width: '2px', height: '12px', backgroundColor: '#09090B', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 400, color: '#09090B', fontFamily: currentTheme.fonts.contentFont }}>Your Logo</span>
          </div>
        )}
      </div>

      {/* Page number with line */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '0px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Small line */}
        <div style={{
          width: '20px',
          height: '1px',
          backgroundColor: 'rgba(9, 9, 11, 0.6)'
        }} />
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={handlePageNumberCancel}
            className="page-number-editor"
            style={{
              color: '#09090B99',
              fontSize: '17px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
              width: '30px',
              height: 'auto'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
              color: '#09090B99',
              fontSize: '17px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentPageNumber}
          </div>
        )}
      </div>

      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={handleLogoNewUploaded}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default HighPerformingTeamsSlideTemplate;

