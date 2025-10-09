// custom_extensions/frontend/src/components/templates/HighPerformingTeamsSlideTemplate.tsx

import React, { useMemo, useRef, useState } from 'react';
import { HighPerformingTeamsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';

export const HighPerformingTeamsSlideTemplate: React.FC<HighPerformingTeamsSlideProps & { theme?: SlideTheme | string }> = ({
  slideId: _slideId,
  title = 'The Power of High-Performing Teams',
  description = 'High-performing teams are the driving force behind exceptional results. They achieve more, innovate faster, and adapt to challenges with resilience.',
  panelColor: _panelColor = '#E9B84C',
  lineColor = '#0F58F9',
  points = [
    { x: 16, y: 92 },   // bottom-left with visual padding (200x100 viewBox)
    { x: 50, y: 75 },
    { x: 90, y: 55 },
    { x: 130, y: 35 },
    { x: 170, y: 15 },
    { x: 190, y: 5 }    // top-right with visual padding
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
  // Preserve initial X positions to optionally lock specific points horizontally
  const initialXsRef = useRef<number[]>(points.map(p => p.x));
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

  // Top part (42% height) with gradient background
  const topPart: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
    background: 'linear-gradient(180deg, #0F58F9 0%, #1023A1 170.85%)',
    overflow: 'hidden'
  };

  // Bottom part (60% height) with blue background
  const bottomPart: React.CSSProperties = {
    position: 'absolute',
    top: '38%',
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
    width: '170px',
    height: '170px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  };

  // Title positioned to the right of avatar
  const titleStyle: React.CSSProperties = {
    position: 'absolute',
    left: '290px',
    top: '90px',
    transform: 'translateY(-50%)',
    fontSize: '46px',
    fontWeight: 800,
    color: '#FFFFFF',
    maxWidth: '900px',
    lineHeight: 1.2
  };

  // Description positioned below title
  const paragraph: React.CSSProperties = {
    position: 'absolute',
    left: '290px',
    top: '115px',
    transform: 'translateY(calc(-50% + 45px))',
    width: '660px',
    maxWidth: '660px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '20px',
    lineHeight: 1.6,
    opacity: 0.9
  };

  // White panel with chart in bottom part
  const panel: React.CSSProperties = {
    position: 'absolute',
    left: '66px',
    right: '66px',
    top: '56px',
    bottom: '56px',
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    overflow: 'hidden'
  };

  const svgRef = useRef<SVGSVGElement | null>(null);

  const pathD = useMemo(() => {
    if (curvePoints.length === 0) return '';
    const d: string[] = [];
    d.push(`M ${curvePoints[0].x} ${curvePoints[0].y}`);
    for (let i = 1; i < curvePoints.length; i++) {
      d.push(`L ${curvePoints[i].x} ${curvePoints[i].y}`);
    }
    return d.join(' ');
  }, [curvePoints]);

  const startDrag = (idx: number, _e: React.MouseEvent) => {
    if (!isEditable || !svgRef.current) return;
    const svg = svgRef.current;
    const onMove = (me: MouseEvent) => {
      // Create an SVG point and transform it to viewBox coordinates
      const pt = svg.createSVGPoint();
      pt.x = me.clientX;
      pt.y = me.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
      
      // Map to viewBox coordinates (0-200 for x, 0-100 for y)
      let rx = Math.max(0, Math.min(200, svgP.x));
      const ry = Math.max(0, Math.min(100, svgP.y));

      // Lock the first and last points horizontally (left/right edges)
      const isEdgePoint = idx === 0 || idx === (curvePoints.length - 1);
      if (isEdgePoint) {
        rx = initialXsRef.current[idx] ?? curvePoints[idx].x;
      }
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
      <style>{`
        .high-performing-teams-slide *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .high-performing-teams-slide .title-element {
          font-family: "Lora", serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      {/* Top Part - 40% height with gradient background */}
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
            className="title-element"
            style={{
              fontSize: '46px',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.2,
              width: '900px',
              maxWidth: '900px',
              height: 'auto',
            }}
          />
        ) : (
          <div 
            className="title-element" 
            onClick={() => isEditable && setEditingTitle(true)} 
            style={{ 
              cursor: isEditable ? 'pointer' : 'default', 
              userSelect: 'none'
            }}
          >
            {title}
          </div>
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
            style={{
              fontSize: '20px',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.7)',
              opacity: 0.9,
              width: '660px',
              maxWidth: '660px',
              height: 'auto',
            }}
          />
        ) : (
          <div 
            onClick={() => isEditable && setEditingDesc(true)} 
            style={{ 
              cursor: isEditable ? 'pointer' : 'default', 
              userSelect: 'none'
            }}
          >
            {description}
          </div>
        )}
        </div>
      </div>

      {/* Bottom Part - 60% height with blue background */}
      <div style={bottomPart}>
        {/* White panel with editable line chart */}
        <div style={panel}>
            <svg 
              ref={svgRef} 
              viewBox="0 0 200 100" 
              preserveAspectRatio="xMidYMid meet"
              style={{ 
                position: 'absolute', 
                top: '-230px',
                left: '170px',
                height: 'calc(200% + 100px)'
              }}
            >
            <path 
              d={pathD} 
              fill="none" 
              stroke="#0F58F9" 
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {curvePoints.map((pt, i) => {
              const isEdge = i === 0 || i === (curvePoints.length - 1);
              if (isEdge) return null; // hide circles on the edges
              return (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3"
                  fill="#FFFFFF"
                  stroke="#0F58F9"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                  onMouseDown={(e) => isEditable && startDrag(i, e)}
                  style={{ cursor: isEditable ? 'pointer' : 'default' }}
                />
              );
            })}
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

