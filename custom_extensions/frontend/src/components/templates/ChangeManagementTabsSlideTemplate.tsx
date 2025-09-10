// custom_extensions/frontend/src/components/templates/ChangeManagementTabsSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface ChangeManagementTabsProps extends BaseTemplateProps {
  topTabs: string[]; // 4 tabs
  heading: string;
  pills: [string, string, string]; // left, center (active), right
  avatarPath?: string;
}

export const ChangeManagementTabsSlideTemplate: React.FC<ChangeManagementTabsProps & { theme?: SlideTheme | string }> = ({
  slideId,
  topTabs = [
    'CHANGE MANAGEMENT FUNDAMENTALS',
    'THE NEED FOR CHANGE',
    'BUILDING A CHANGE-READY CULTURE',
    'EFFECTIVE COMMUNICATION AND ENGAGEMENT'
  ],
  heading = 'Communication is the lifeblood of successful change initiatives.',
  pills = ['ORGANIZATIONS', 'COMMUNICATION', 'STAKEHOLDERS'],
  avatarPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editHeading, setEditHeading] = useState(false);
  const [editTabIdx, setEditTabIdx] = useState<number | null>(null);
  const [editPillIdx, setEditPillIdx] = useState<number | null>(null);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#FFFFFF', color:'#111827', fontFamily: currentTheme.fonts.titleFont, position:'relative', paddingTop:'132px' };

  const topTabsWrap: React.CSSProperties = { position:'absolute', left:0, right:0, top:0, height:'180px', display:'grid', gridTemplateRows:'45px 45px 45px 45px' };
  const tabRow = (bg: string, color: string): React.CSSProperties => ({ background:bg, color, display:'flex', alignItems:'center', padding:'0 24px', fontSize:'14px', letterSpacing:0.5 });

  const content: React.CSSProperties = { position:'absolute', left:'56px', right:'56px', top:'220px', bottom:'120px' };
  const avatar: React.CSSProperties = { position:'absolute', left:'48px', top:'8px', width:'78px', height:'78px', borderRadius:'0px', overflow:'hidden', background:'#D7EBFF' };
  const headingStyle: React.CSSProperties = { position:'absolute', left:'154px', right:'56px', top:0, fontSize:'42px', fontWeight:800, color:'#2D2D2D', lineHeight:1.2 };

  const capsulesWrap: React.CSSProperties = { position:'absolute', left:'56px', right:'56px', top:'150px', height:'82px', display:'grid', gridTemplateColumns:'1fr 164px 1fr', columnGap:'1px', alignItems:'center' };
  const capsule: React.CSSProperties = { border:'2px solid #1f2937', borderRadius:'999px', display:'flex', alignItems:'center', justifyContent:'center', color:'#434343', fontSize:'12px', height:'100%', background:'#fff' };
  const capsuleActive: React.CSSProperties = { ...capsule, height:'60%', background:'#111111', color:'#A5A5A5', borderColor:'#111111' };

  const inlineHeading = { ...headingStyle, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0 } as React.CSSProperties;
  const inlineTab = { position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, color:'inherit', fontSize:'14px' } as React.CSSProperties;
  const inlineCapsule = { position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, color:'inherit', fontSize:'12px', textAlign:'center' } as React.CSSProperties;

  return (
    <div className="change-mgmt-tabs inter-theme" style={slide}>
      <div style={topTabsWrap}>
        {[['#000000','#A5A5A5'],['#F4D9AA','#5E4B32'],['#CFC7F8','#4F4A6B'],['#FFFFFF','#5A5A5A']].map((pair, rowIdx)=> (
          <div key={rowIdx} style={tabRow(pair[0] as string, pair[1] as string)}>
            {isEditable && editTabIdx === rowIdx ? (
              <ImprovedInlineEditor initialValue={topTabs[rowIdx] ?? ''} onSave={(v)=>{ const next=[...topTabs]; next[rowIdx]=v; onUpdate&&onUpdate({ topTabs: next }); setEditTabIdx(null); }} onCancel={()=>setEditTabIdx(null)} style={inlineTab} />
            ) : (
              <div onClick={()=> isEditable && setEditTabIdx(rowIdx)} style={{ cursor: isEditable ? 'pointer':'default' }}>{topTabs[rowIdx]}</div>
            )}
          </div>
        ))}
      </div>

      <div style={content}>
        <div style={avatar}>
          <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
        <div style={headingStyle}>
          {isEditable && editHeading ? (
            <ImprovedInlineEditor initialValue={heading} onSave={(v)=>{ onUpdate&&onUpdate({ heading:v }); setEditHeading(false); }} onCancel={()=>setEditHeading(false)} style={inlineHeading} />
          ) : (
            <div onClick={()=> isEditable && setEditHeading(true)} style={{ cursor: isEditable ? 'pointer':'default' }}>{heading}</div>
          )}
        </div>

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
    </div>
  );
};

export default ChangeManagementTabsSlideTemplate;

