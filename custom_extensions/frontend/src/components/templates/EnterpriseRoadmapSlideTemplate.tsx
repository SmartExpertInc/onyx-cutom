// custom_extensions/frontend/src/components/templates/EnterpriseRoadmapSlideTemplate.tsx

import React, { useState } from 'react';
import { EnterpriseRoadmapSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export const EnterpriseRoadmapSlideTemplate: React.FC<EnterpriseRoadmapSlideProps & { theme?: SlideTheme | string }> = ({
  slideId,
  title = 'Enterprise Offerings: Roadmap',
  description = 'These KPIs typically measure performance in a shorter time frame, and are focused on organizational processes and efficiencies. Some examples include sales by region, average monthly transportation costs and cost per acquisition (CPA)',
  tableData = [
    { featureName: 'Mobile optimization', status: 'Testing', dueDate: '14 April', assignee: 'Julius' },
    { featureName: 'App Marketplace', status: 'Implementing', dueDate: '28 May', assignee: 'Ben' },
    { featureName: 'Cross-platform sync', status: 'Concept', dueDate: '30 June', assignee: 'Vanessa' }
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile',
  companyName = 'Company name',
  reportType = 'KPI Report',
  date = 'February 2023',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [rows, setRows] = useState(tableData);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', position:'relative', background:'#F9F8F6', fontFamily: currentTheme.fonts.titleFont };
  const topLine: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', top:'36px', height:'4px', background:'#E6E5E3', borderRadius:'999px' };
  const avatarArea: React.CSSProperties = { position:'absolute', left:'56px', top:'96px', width:'120px', height:'120px', borderRadius:'50%', overflow:'hidden', background:'#253020' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'208px', top:'104px', fontSize:'30px', color:'#585955', fontWeight:600 };
  const descStyle: React.CSSProperties = { position:'absolute', left:'208px', top:'152px', width:'720px', color:'#9EA59A', fontSize:'16px', lineHeight:1.6 };

  const tableWrap: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', top:'286px' };
  const theadStyle: React.CSSProperties = { display:'grid', gridTemplateColumns:'2fr 1.1fr 1fr 1fr', background:'#2C3327', color:'#FFFFFF', padding:'14px 18px', borderRadius:'6px', fontWeight:600, letterSpacing:0.2 };
  const rowStyle = (i:number): React.CSSProperties => ({ display:'grid', gridTemplateColumns:'2fr 1.1fr 1fr 1fr', padding:'14px 18px', background: i%2===1 ? '#EDECE8' : '#FFFFFF', borderRadius:'8px', marginTop:'12px', fontSize:'15px', color:'#676E64' });

  const bottomLine: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', bottom:'56px', height:'6px', background:'#E6E5E3', borderRadius:'999px' };
  const footerStyle: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', bottom:'18px', display:'flex', justifyContent:'space-between', color:'#BABBB2', fontSize:'13px' };

  return (
    <div className="enterprise-roadmap-slide inter-theme" style={slide}>
      <div style={topLine} />

      <div style={avatarArea}>
        <ClickableImagePlaceholder imagePath={profileImagePath} onImageUploaded={(p)=>onUpdate&&onUpdate({ profileImagePath:p })} size="LARGE" position="CENTER" description="Profile" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      </div>

      <div style={titleStyle}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor initialValue={title} onSave={(v)=>{onUpdate&&onUpdate({title:v});setEditingTitle(false);}} onCancel={()=>setEditingTitle(false)} style={{...titleStyle, position:'relative', left:0, top:0}} />
        ) : (
          <div onClick={()=>isEditable&&setEditingTitle(true)} style={{cursor:isEditable?'pointer':'default'}}>{title}</div>
        )}
      </div>

      <div style={descStyle}>
        {isEditable && editingDesc ? (
          <ImprovedInlineEditor initialValue={description} multiline={true} onSave={(v)=>{onUpdate&&onUpdate({description:v});setEditingDesc(false);}} onCancel={()=>setEditingDesc(false)} style={{...descStyle, position:'relative', left:0, top:0, width:'100%'}} />
        ) : (
          <div onClick={()=>isEditable&&setEditingDesc(true)} style={{cursor:isEditable?'pointer':'default'}}>{description}</div>
        )}
      </div>

      <div style={tableWrap}>
        <div style={theadStyle}>
          <div>Feature Name</div>
          <div>Status</div>
          <div>Due Date</div>
          <div>Assignee</div>
        </div>
        {rows.map((r, i)=> (
          <div key={i} style={rowStyle(i)}>
            <div>{r.featureName}</div>
            <div>{r.status}</div>
            <div>{r.dueDate}</div>
            <div>{r.assignee}</div>
          </div>
        ))}
      </div>

      <div style={bottomLine} />
      <div style={footerStyle}>
        <div>{companyName}</div>
        <div>{reportType}</div>
        <div>{date}</div>
      </div>
    </div>
  );
};

export default EnterpriseRoadmapSlideTemplate;

