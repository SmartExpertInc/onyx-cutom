// custom_extensions/frontend/src/components/templates/HighPerformingTeamsSlideTemplate.tsx

import React, { useMemo, useRef, useState } from 'react';
import { HighPerformingTeamsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export const HighPerformingTeamsSlideTemplate: React.FC<HighPerformingTeamsSlideProps & { theme?: SlideTheme | string }> = ({
  slideId,
  title = 'The Power of High-\nPerforming Teams',
  description = 'High-performing teams are the driving force behind exceptional results. They achieve more, innovate faster, and adapt to challenges with resilience.',
  panelColor = '#E9B84C',
  lineColor = '#5A4DF6',
  points = [
    { x: 6, y: 72 },
    { x: 22, y: 58 },
    { x: 40, y: 64 },
    { x: 58, y: 48 },
    { x: 72, y: 42 },
    { x: 84, y: 38 }
  ],
  avatarPath = '',
  avatarAlt = 'Avatar',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [curvePoints, setCurvePoints] = useState(points);

  const slide: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    position: 'relative',
    backgroundColor: '#ffffff',
    fontFamily: currentTheme.fonts.titleFont,
    overflow: 'hidden'
  };

  const titleStyle: React.CSSProperties = {
    position: 'absolute',
    left: '64px',
    top: '64px',
    whiteSpace: 'pre-line',
    fontSize: '38px',
    fontWeight: 800,
    color: '#343244',
    letterSpacing: '-0.4px',
    maxWidth: '520px'
  };

  const paragraph: React.CSSProperties = {
    position: 'absolute',
    right: '70px',
    top: '80px',
    maxWidth: '418px',
    color: '#6E6D73',
    fontSize: '16px',
    lineHeight: 1.6
  };

  const panel: React.CSSProperties = {
    position: 'absolute',
    left: '64px',
    right: '64px',
    bottom: '56px',
    top: '210px',
    backgroundColor: panelColor,
    borderRadius: '36px'
  };

  const avatarHolder: React.CSSProperties = {
    position: 'absolute',
    left: '360px',
    bottom: '-3px',
    width: '360px',
    height: '605px',
    zIndex: 2
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

  const startDrag = (idx: number, e: React.MouseEvent) => {
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

  return (
    <div className="high-performing-teams-slide inter-theme" style={slide}>
      {/* Title */}
      <div style={titleStyle}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={title}
            multiline={true}
            onSave={(v) => { onUpdate && onUpdate({ title: v }); setEditingTitle(false); }}
            onCancel={() => setEditingTitle(false)}
            style={{ ...titleStyle, position: 'relative', left: 0, top: 0 }}
          />
        ) : (
          <div onClick={() => isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
        )}
      </div>

      {/* Paragraph */}
      <div style={paragraph}>
        {isEditable && editingDesc ? (
          <ImprovedInlineEditor
            initialValue={description}
            multiline={true}
            onSave={(v) => { onUpdate && onUpdate({ description: v }); setEditingDesc(false); }}
            onCancel={() => setEditingDesc(false)}
            style={{ ...paragraph, position: 'relative', right: 0, top: 0, width: '100%' }}
          />
        ) : (
          <div onClick={() => isEditable && setEditingDesc(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{description}</div>
        )}
      </div>

      {/* Rounded panel with editable line chart */}
{/*       <div style={panel}>
        <svg ref={svgRef} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
          <path d={pathD} fill="none" stroke={lineColor} strokeWidth={3} />
          {curvePoints.map((p, idx) => (
            <g key={idx} transform={`translate(${p.x},${p.y})`}>
              <circle cx={0} cy={0} r={3} fill="#ffffff" stroke={lineColor} strokeWidth={2} onMouseDown={(e) => startDrag(idx, e)} style={{ cursor: isEditable ? 'grab' : 'default' }} />
            </g>
          ))}
        </svg>
      </div> */}

      {/* Avatar overlays the panel */}
      <div style={avatarHolder}>
        <ClickableImagePlaceholder
          imagePath={avatarPath}
          onImageUploaded={(p: string) => onUpdate && onUpdate({ avatarPath: p })}
          size="LARGE"
          position="CENTER"
          description="Actor"
          isEditable={isEditable}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    </div>
  );
};

export default HighPerformingTeamsSlideTemplate;

