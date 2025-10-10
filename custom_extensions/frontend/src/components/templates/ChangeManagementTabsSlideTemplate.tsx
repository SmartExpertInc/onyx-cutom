// custom_extensions/frontend/src/components/templates/ChangeManagementTabsSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
<<<<<<< HEAD
import YourLogo from '../YourLogo';
=======
import PresentationImageUpload from '../PresentationImageUpload';
>>>>>>> origin/slides-ai-fix-valeria

export interface ChangeManagementTabsProps extends BaseTemplateProps {
  topTabs: string[]; // 4 tabs
  heading: string;
  pills: [string, string, string]; // left, center (active), right
  avatarPath?: string;
<<<<<<< HEAD
  logoText?: string;
  logoPath?: string;
  pageNumber?: string;
=======
  pageNumber?: string;
  logoNew?: string;
>>>>>>> origin/slides-ai-fix-valeria
}

export const ChangeManagementTabsSlideTemplate: React.FC<ChangeManagementTabsProps & { theme?: SlideTheme | string }> = ({
  slideId,
  topTabs = [
    'Change management fundamentals',
    'The need for change',
    'Building a change-ready culture',
    'Effective communication and engagement'
  ],
  heading = 'Communication is the lifeblood\nof successful change initiatives.',
  pills = ['Organization', 'Communication', 'Stakeholders'],
  avatarPath = '',
<<<<<<< HEAD
  logoText = 'Your Logo',
  logoPath = '',
  pageNumber = '39',
=======
  pageNumber = '39',
  logoNew = '',
>>>>>>> origin/slides-ai-fix-valeria
  isEditable = false,
  onUpdate,
  theme
}: ChangeManagementTabsProps & { theme?: SlideTheme | string }) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editHeading, setEditHeading] = useState(false);
  const [editTabIdx, setEditTabIdx] = useState<number | null>(null);
  const [editPillIdx, setEditPillIdx] = useState<number | null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
<<<<<<< HEAD
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#E0E7FF', color:'#111827', fontFamily: currentTheme.fonts.titleFont, position:'relative' };

  const topTabsWrap: React.CSSProperties = { position:'absolute', left:0, right:0, top:0, height:'140px', display:'grid', gridTemplateRows:'35px 35px 35px 35px' };
  const tabRow = (bg: string, color: string): React.CSSProperties => ({ background:bg, color, display:'flex', alignItems:'center', padding:'0 32px', fontSize:'16px', fontWeight:500, fontFamily:'sans-serif' });

  const content: React.CSSProperties = { position:'absolute', left:'56px', right:'56px', top:'180px', bottom:'100px', background:'#E0E7FF' };
  const avatar: React.CSSProperties = { position:'absolute', left:'0', top:'0', width:'140px', height:'140px', borderRadius:'50%', overflow:'hidden', background:'#0F58F9' };
  const headingStyle: React.CSSProperties = { position:'absolute', left:'190px', right:'0', top:'25px', fontSize:'44px', fontWeight:400, color:'#000000', lineHeight:1.1, fontFamily:'serif', whiteSpace:'pre-line' };

  const capsulesWrap: React.CSSProperties = { position:'absolute', left:'56px', right:'56px', bottom:'60px', height:'75px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', columnGap:'20px', alignItems:'center' };
  const capsule: React.CSSProperties = { borderRadius:'50px', display:'flex', alignItems:'center', justifyContent:'center', color:'#000000', fontSize:'16px', fontWeight:500, height:'95px', background:'#FFFFFF', border:'none', fontFamily:'sans-serif', textTransform:'uppercase' };
  const capsuleActive: React.CSSProperties = { ...capsule, background:'#0F58F9', color:'#FFFFFF', height:'55px', borderRadius:'50px' };

  const logoStyles: React.CSSProperties = { position:'absolute', left:'48px', top:'48px', color:'#000000', fontSize:'16px', fontWeight:500 };
  const footerLogoStyles: React.CSSProperties = { position:'absolute', bottom:'24px', right:'48px', color:'#000000', fontSize:'16px', fontWeight:500, fontFamily:'sans-serif' };
  const pageNumberContainerStyles: React.CSSProperties = { position:'absolute', bottom:'30px', left:'0px', display:'flex', alignItems:'center', gap:'8px' };
  const smallLineStyles: React.CSSProperties = { width:'20px', height:'1px', backgroundColor:'rgba(9, 9, 11, 0.6)' };
  const pageNumberStyles: React.CSSProperties = { color:'#09090B99', fontSize:'17px', fontWeight:300, fontFamily: currentTheme.fonts.contentFont };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    onUpdate && onUpdate({ pageNumber: newPageNumber });
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
  };
=======
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#E0E7FF', color:'#111827', fontFamily: currentTheme.fonts.titleFont, position:'relative', paddingTop:'132px' };

  const topTabsWrap: React.CSSProperties = { position:'absolute', left:0, right:0, top:0, height:'188px', display:'grid', gridTemplateRows:'47px 47px 47px 47px' };
  const tabRow = (bg: string, color: string): React.CSSProperties => ({ background:bg, color, display:'flex', alignItems:'center', padding:'0 45px', fontSize:'20px', letterSpacing:0.5, fontFamily: currentTheme.fonts.contentFont });

  const content: React.CSSProperties = { position:'absolute', left:'56px', right:'56px', top:'220px', bottom:'120px' };
  const avatar: React.CSSProperties = { position:'absolute', left:'-10px', top:'10px', width:'170px', height:'170px', borderRadius:'50%', overflow:'hidden', background:'#0F58F9' };
  const headingStyle: React.CSSProperties = { position:'absolute', left:'220px', right:'56px', top:'40px', fontSize:'45px', fontWeight:500, color:'#2D2D2D', lineHeight:1.2, fontFamily: "'Lora', serif", whiteSpace: 'pre-wrap' };

  const capsulesWrap: React.CSSProperties = { position:'absolute', left:0, right:0, top:'220px', height:'110px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' };
  const capsule: React.CSSProperties = { borderRadius:'999px', display:'flex', alignItems:'center', justifyContent:'center', color:'#09090B', fontSize:'24px', height:'100%', background:'#FFFFFF', fontFamily: currentTheme.fonts.contentFont, position: 'relative', zIndex: 1, width:'500px', boxShadow:'0 4px 6px rgba(0, 0, 0, 0.1)' };
  const capsuleActive: React.CSSProperties = { ...capsule, height:'83%', background:'#0F58F9', color:'#FFFFFF', border:'16px solid #E0E7FF', zIndex: 10, width:'400px', marginLeft:'-60px', marginRight:'-60px', boxShadow:'none' };
>>>>>>> origin/slides-ai-fix-valeria

  const inlineHeading = { background:'transparent', border:'none', outline:'none', padding:0, margin:0, width: '100%', height: 'auto' } as React.CSSProperties;
  const inlineTab = { position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, color:'inherit', fontSize:'20px', fontFamily: currentTheme.fonts.contentFont } as React.CSSProperties;
  const inlineCapsule = { position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, color:'inherit', fontSize:'24px', textAlign:'center', fontFamily: currentTheme.fonts.contentFont } as React.CSSProperties;

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
  };

  const handleLogoNewUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ logoNew: newLogoPath });
    }
  };

  return (
    <div className="change-mgmt-tabs inter-theme" style={slide}>
<<<<<<< HEAD
      {/* Logo */}
      <YourLogo
        logoPath={logoPath}
        onLogoUploaded={(p: string) => onUpdate && onUpdate({ logoPath: p })}
        isEditable={isEditable}
        color="#000000"
        text={logoText}
        style={logoStyles}
      />

      {/* Top Navigation Tabs */}
      <div style={topTabsWrap}>
        {[
          ['#0F58F9','#FFFFFF'], // Blue background, white text
          ['#FFFFFF','#000000'], // White background, black text  
          ['#0F58F9','#FFFFFF'], // Blue background, white text (highlighted)
          ['#FFFFFF','#000000']  // White background, black text
        ].map((pair, rowIdx)=> (
=======
      <style>{`
        .change-mgmt-tabs *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .change-mgmt-tabs .title-element {
          font-family: "Lora", serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      <div style={topTabsWrap}>
        {[['#0F58F9','#FFFFFF'],['#FFFFFF','#09090B'],['#0F58F9','#FFFFFF'],['#FFFFFF','#09090B']].map((pair, rowIdx)=> (
>>>>>>> origin/slides-ai-fix-valeria
          <div key={rowIdx} style={tabRow(pair[0] as string, pair[1] as string)}>
            {isEditable && editTabIdx === rowIdx ? (
              <ImprovedInlineEditor initialValue={topTabs[rowIdx] ?? ''} onSave={(v)=>{ const next=[...topTabs]; next[rowIdx]=v; onUpdate&&onUpdate({ topTabs: next }); setEditTabIdx(null); }} onCancel={()=>setEditTabIdx(null)} style={inlineTab} />
            ) : (
              <div onClick={()=> isEditable && setEditTabIdx(rowIdx)} style={{ cursor: isEditable ? 'pointer':'default' }}>{topTabs[rowIdx]}</div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={content}>
        <div style={avatar}>
<<<<<<< HEAD
          <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p: string)=> onUpdate&&onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ height:'128%', objectFit:'cover', borderRadius:'50%' }} />
=======
          <ClickableImagePlaceholder 
            imagePath={avatarPath} 
            onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath:p })} 
            size="LARGE" 
            position="CENTER" 
            description="Profile photo" 
            isEditable={isEditable} 
            style={{ 
              width:'110%', 
              height:'110%', 
              borderRadius:'50%', 
              position:'relative', 
              bottom:'-10px', 
              left:'50%', 
              transform:'translateX(-50%)', 
              objectFit:'cover' 
            }} 
          />
>>>>>>> origin/slides-ai-fix-valeria
        </div>
        <div style={headingStyle}>
          {isEditable && editHeading ? (
            <ImprovedInlineEditor 
              initialValue={heading} 
              onSave={(v)=>{ onUpdate&&onUpdate({ heading:v }); setEditHeading(false); }} 
              onCancel={()=>setEditHeading(false)} 
              className="title-element" 
              style={inlineHeading} 
              multiline={true} 
            />
          ) : (
            <div 
              className="title-element" 
              onClick={()=> isEditable && setEditHeading(true)} 
              style={{ cursor: isEditable ? 'pointer':'default', userSelect: 'none' }}
            >
              {heading}
            </div>
          )}
        </div>

        {/* Bottom Buttons */}
        <div style={capsulesWrap}>
          {[0,1,2].map((i)=> (
            <div key={i} style={i===1 ? capsuleActive : capsule}>
              {isEditable && editPillIdx === i ? (
                <ImprovedInlineEditor initialValue={pills[i]} onSave={(v)=>{ const next:[string,string,string]=[...pills] as any; next[i]=v; onUpdate&&onUpdate({ pills: next }); setEditPillIdx(null); }} onCancel={()=>setEditPillIdx(null)} style={inlineCapsule} />
              ) : (
                <div onClick={()=> isEditable && setEditPillIdx(i)} style={{ cursor: isEditable ? 'pointer':'default' }}>{pills[i]}</div>
              )}
            </div>
          ))}
        </div>
      </div>

<<<<<<< HEAD
      {/* Page number with line */}
      <div style={pageNumberContainerStyles}>
        {/* Small line */}
        <div style={smallLineStyles} />
=======
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
        bottom: '30px',
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
>>>>>>> origin/slides-ai-fix-valeria
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={handlePageNumberCancel}
            className="page-number-editor"
            style={{
<<<<<<< HEAD
              ...pageNumberStyles,
=======
              color: '#09090B99',
              fontSize: '17px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
>>>>>>> origin/slides-ai-fix-valeria
              width: '30px',
              height: 'auto'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
<<<<<<< HEAD
              ...pageNumberStyles,
=======
              color: '#09090B99',
              fontSize: '17px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
>>>>>>> origin/slides-ai-fix-valeria
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentPageNumber}
          </div>
        )}
      </div>

<<<<<<< HEAD
      {/* Footer Logo */}
      <div style={footerLogoStyles}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '30px', 
          height: '30px', 
          borderRadius: '50%', 
          backgroundColor: 'transparent', 
          border: '2px solid #000000',
          marginRight: '8px',
          fontSize: '18px',
          color: '#000000'
        }}>+</div>
        Your Logo
      </div>
=======
      {/* Logo Upload Modal */}
      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={(newLogoPath: string) => {
            handleLogoNewUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
>>>>>>> origin/slides-ai-fix-valeria
    </div>
  );
};

export default ChangeManagementTabsSlideTemplate;

