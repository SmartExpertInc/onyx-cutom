// custom_extensions/frontend/src/components/templates/ConnectionSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import YourLogo from '../YourLogo';

export interface ConnectionSlideProps extends BaseTemplateProps {
  title?: string;
  description?: string;
  avatarPath?: string;
  backgroundImagePath?: string; // right side dimmed background image
  logoPath?: string; // top-left small logo
  logoText?: string; // editable "Your Logo"
  tabs?: string[]; // bottom navigation labels
  activeTabIndex?: number; // which tab is active (0-based)
  vennLabels?: { culture: string; managers: string; teams: string };
}

export const ConnectionSlideTemplate: React.FC<ConnectionSlideProps & { theme?: SlideTheme | string }> = ({
  slideId,
  title = 'Connection',
  description = 'Connections create trust, encourage open communication, and build a culture of collaboration.',
  avatarPath = '',
  backgroundImagePath = '',
  logoPath = '',
  logoText = 'Your Logo',
  tabs = ['The Problem','The Solution','Guiding the way','Connection','Transformation','The Journey'],
  activeTabIndex = 3,
  vennLabels = { culture: 'Culture', managers: 'Managers', teams: 'Teams' },
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingLogoText, setEditingLogoText] = useState(false);
  const [editingVenn, setEditingVenn] = useState<null | keyof typeof vennLabels>(null);
  const [editingTabIndex, setEditingTabIndex] = useState<number | null>(null);

  const slide: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#121212',
    position: 'relative',
    overflow: 'hidden',
    color: '#d1d5db',
    fontFamily: currentTheme.fonts.titleFont,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr'
  };

  const left: React.CSSProperties = {
    padding: '88px 56px 140px 56px',
    backgroundColor: '#E0E7FF',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '45px',
    color: '#09090B',
    fontWeight: 800,
    marginTop: '5px',
    marginBottom: '20px'
  };

  const desc: React.CSSProperties = {
    fontSize: '15px',
    lineHeight: 1.5,
    maxWidth: '380px',
    color: '#09090B'
  };

  const right: React.CSSProperties = {
    position: 'relative',
    backgroundColor: '#1b1b1b'
  };

  const vennWrapper: React.CSSProperties = {
    position: 'absolute',
    right: '72px',
    top: '96px',
    width: '640px',
    height: '640px'
  };
  const bigCircle: React.CSSProperties = {
    position: 'absolute',
    right: '0',
    top: '15px',
    width: '440px',
    height: '440px',
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)'
  };

  const small: React.CSSProperties = {
    position: 'absolute',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: '150px',
    left: '240px'
  };

  const smallRight: React.CSSProperties = {
    position: 'absolute',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: '150px',
    right: '40px'
  };

  const footer: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65px',
    backgroundColor: '#0D0D0D',
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    borderTop: '1px solid #2b2b2b'
  };

  const tab: React.CSSProperties = {
    backgroundColor: '#0F58F9',
    color: '#ffffff',
    border: '1px solid #ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  };

  const topBar: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    minHeight: '64px',
    display: 'flex',
    alignItems: 'center',
    padding: '25px 50px',
    zIndex: 2
  };

  return (
    <div className="connection-slide" style={slide}>
      {/* Top bar with logo */}
      <div style={topBar}>
        <YourLogo
          logoPath={logoPath}
          onLogoUploaded={(p) => onUpdate && onUpdate({ logoPath: p })}
          isEditable={isEditable}
          color="#000000"
          text={logoText}
        />
      </div>

      <div style={left}>
        <div style={titleStyle}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={title}
              onSave={(v) => { onUpdate && onUpdate({ title: v }); setEditingTitle(false); }}
              onCancel={() => setEditingTitle(false)}
              style={{ ...titleStyle, position: 'relative' }}
            />
          ) : (
            <div onClick={() => isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
          )}
        </div>
        <div style={desc}>
          {isEditable && editingDescription ? (
            <ImprovedInlineEditor
              initialValue={description}
              multiline={true}
              onSave={(v) => { onUpdate && onUpdate({ description: v }); setEditingDescription(false); }}
              onCancel={() => setEditingDescription(false)}
              style={{ ...desc, position: 'relative' }}
            />
          ) : (
            <div onClick={() => isEditable && setEditingDescription(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{description}</div>
          )}
        </div>

        {/* Avatar */}
        <div style={{ marginTop: '150px', backgroundColor: '#ffffff', width: '140px', height: '140px', borderRadius: '50%', overflow: 'hidden' }}>
          <ClickableImagePlaceholder
            imagePath={avatarPath}
            onImageUploaded={(p: string) => onUpdate && onUpdate({ avatarPath: p })}
            size="LARGE"
            position="CENTER"
            description="Avatar"
            isEditable={isEditable}
            style={{ marginTop: '3px', height: '125%', objectFit: 'cover', borderRadius: '50%' }}
          />
        </div>
      </div>

      <div style={right}>
        {/* Background image with dark overlay */}
        <ClickableImagePlaceholder
          imagePath={backgroundImagePath}
          onImageUploaded={(p: string) => onUpdate && onUpdate({ backgroundImagePath: p })}
          size="LARGE"
          position="CENTER"
          description="Background"
          isEditable={isEditable}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)' }}
        />
        {/* Keep overlay but let clicks pass to the image below for editing */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.35))', pointerEvents: 'none' }} />
        {/* Venn circles */}
        <div style={vennWrapper}>
          <div style={bigCircle} />
          <div style={small} />
          <div style={smallRight} />
        </div>

        {/* Venn labels */}
        <div style={{ position: 'absolute', right: '72px', top: '96px', width: '640px', height: '640px', pointerEvents: 'none' }}>
          {/* Culture (top center of big circle) */}
          <div style={{ position: 'absolute', left: '59%', top: '56px', color: '#B1B0B1', opacity: 0.9, fontSize: '22px', pointerEvents: 'auto' }}>
            {isEditable && editingVenn === 'culture' ? (
              <ImprovedInlineEditor
                initialValue={vennLabels.culture}
                onSave={(v) => { onUpdate && onUpdate({ vennLabels: { ...vennLabels, culture: v } }); setEditingVenn(null); }}
                onCancel={() => setEditingVenn(null)}
                style={{ color: '#d1d5db', fontSize: '22px' }}
              />
            ) : (
              <span style={{ cursor: isEditable ? 'pointer' : 'default' }} onClick={() => isEditable && setEditingVenn('culture')}>{vennLabels.culture}</span>
            )}
          </div>

          {/* Managers (center of left small circle) */}
          <div style={{ position: 'absolute', left: '332px', top: '240px', transform: 'translate(-50%, -50%)', color: '#e5e7eb', fontSize: '26px', pointerEvents: 'auto' }}>
            {isEditable && editingVenn === 'managers' ? (
              <ImprovedInlineEditor
                initialValue={vennLabels.managers}
                onSave={(v) => { onUpdate && onUpdate({ vennLabels: { ...vennLabels, managers: v } }); setEditingVenn(null); }}
                onCancel={() => setEditingVenn(null)}
                style={{ color: '#e5e7eb', fontSize: '26px' }}
              />
            ) : (
              <span style={{ cursor: isEditable ? 'pointer' : 'default' }} onClick={() => isEditable && setEditingVenn('managers')}>{vennLabels.managers}</span>
            )}
          </div>

          {/* Teams (center of right small circle) */}
          <div style={{ position: 'absolute', right: '133px', top: '240px', transform: 'translate(50%, -50%)', color: '#e5e7eb', fontSize: '26px', pointerEvents: 'auto' }}>
            {isEditable && editingVenn === 'teams' ? (
              <ImprovedInlineEditor
                initialValue={vennLabels.teams}
                onSave={(v) => { onUpdate && onUpdate({ vennLabels: { ...vennLabels, teams: v } }); setEditingVenn(null); }}
                onCancel={() => setEditingVenn(null)}
                style={{ color: '#e5e7eb', fontSize: '26px' }}
              />
            ) : (
              <span style={{ cursor: isEditable ? 'pointer' : 'default' }} onClick={() => isEditable && setEditingVenn('teams')}>{vennLabels.teams}</span>
            )}
          </div>

          {/* Center plus button */}
          <div style={{ position: 'absolute', left: '396px', top: '217px', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '20px', height: '3px', backgroundColor: '#fff', position: 'absolute' }} />
            <div style={{ width: '3px', height: '20px', backgroundColor: '#fff', position: 'absolute' }} />
          </div>
        </div>
      </div>

      <div style={footer}>
        {tabs.map((t, i) => (
          <div key={i} style={{ ...tab, borderTop: i===activeTabIndex ? '3px solid #ffffff' : 'none', backgroundColor: i===activeTabIndex ? '#ffffff' : '#0F58F9', color: i===activeTabIndex ? '#0F58F9' : '#ffffff', position: 'relative', cursor: isEditable ? 'pointer' : 'default' }} onClick={() => isEditable && setEditingTabIndex(i)}>
            {isEditable && editingTabIndex === i ? (
              <ImprovedInlineEditor
                initialValue={t}
                onSave={(v) => {
                  const next = [...tabs];
                  next[i] = v;
                  onUpdate && onUpdate({ tabs: next });
                  setEditingTabIndex(null);
                }}
                onCancel={() => setEditingTabIndex(null)}
                style={{ color: '#c8c8c8', fontSize: '16px' }}
              />
            ) : (
              <span>{t}</span>
            )}
            {i===activeTabIndex && <div style={{ position: 'absolute', left: 0, right: 0, bottom: '-6px', height: '3px', backgroundColor: '#2563eb', borderRadius: '2px' }} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionSlideTemplate;

