// custom_extensions/frontend/src/components/templates/EnterpriseRoadmapSlideTemplate.tsx

import React, { useState } from 'react';
import { EnterpriseRoadmapSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export const EnterpriseRoadmapSlideTemplate: React.FC<EnterpriseRoadmapSlideProps & { theme?: SlideTheme | string }> = ({
  slideId,
  title = 'Enterprise Offerings: Roadmap',
  description = 'These KPIs typically measure performance in a shorter time frame, and are focused on organizational processes and efficiencies. Some examples include sales by region, average monthly transportation costs and cost per acquisition (CPA)',
  headers,
  tableData = [
    { featureName: 'Mobile optimization', status: 'Testin', dueDate: '14 April', assignee: 'Julius' },
    { featureName: 'App Marketplace', status: 'Implementing', dueDate: '28 May', assignee: 'Ben' },
    { featureName: 'Cross-platform sync', status: 'Consept', dueDate: '30 June', assignee: 'Vanessa' },
    { featureName: 'App Marketplace', status: 'Implementing', dueDate: '28 May', assignee: 'Ben' },
    { featureName: 'App Marketplace', status: 'Implementing', dueDate: '28 May', assignee: 'Ben' },
    { featureName: 'App Marketplace', status: 'Implementing', dueDate: '28 May', assignee: 'Ben' }
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

  const defaultHeaders = headers && headers.length ? headers : ['Feature Name','Status','Due Date','Assignee'];
  const [cols, setCols] = useState<string[]>(defaultHeaders);

  const normalizeRows = (input: any[], colHeaders: string[]): Record<string, string>[] => {
    return (input || []).map((r: any) => {
      // If row already uses header labels as keys, keep as is
      const hasHeaderKeys = colHeaders.every((h) => Object.prototype.hasOwnProperty.call(r, h));
      if (hasHeaderKeys) return r as Record<string, string>;
      // Map from camelCase props to visible header labels
      const mapped: Record<string, string> = {};
      const map: Record<string, string> = {
        'Feature Name': r.featureName ?? r.feature ?? r.name ?? '',
        'Status': r.status ?? '',
        'Due Date': r.dueDate ?? r.date ?? '',
        'Assignee': r.assignee ?? r.owner ?? ''
      };
      colHeaders.forEach((h) => {
        mapped[h] = (map[h] ?? '') as string;
      });
      return mapped;
    });
  };

  const [rows, setRows] = useState<Record<string,string>[]>(normalizeRows(tableData as any[], defaultHeaders));
  // Static (no edit controls) for pixel-perfect output

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', position:'relative', background:'#F9F8F6', fontFamily: currentTheme.fonts.titleFont };
  const topLine: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', top:'36px', height:'6px', background:'#E6E5E3', borderRadius:'999px' };
  const avatarArea: React.CSSProperties = { position:'absolute', left:'56px', top:'96px', width:'120px', height:'120px', borderRadius:'50%', overflow:'hidden', background:'#253020' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'430px', top:'104px', fontSize:'30px', color:'#585955', fontWeight:600 };
  const descStyle: React.CSSProperties = { position:'absolute', left:'430px', top:'152px', width:'520px', color:'#9EA59A', fontSize:'16px', lineHeight:1.6 };

  const tableWrap: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', top:'286px' };
  const gridTemplate = `${cols.map((_,i)=> i===0?'2fr':'1fr').join(' ')}`;
  const theadStyle: React.CSSProperties = { display:'grid', gridTemplateColumns: gridTemplate, background:'#2B3127', color:'#A0A49B', padding:'12px 20px', borderRadius:'2px', fontWeight:600, letterSpacing:0.2, position:'relative' };
  const rowStyle = (i:number): React.CSSProperties => ({ display:'grid', gridTemplateColumns: gridTemplate, padding:'12px 20px', background: i%2===0 ? '#F9F8F6' : '#E5E4E0', fontSize:'15px', color:'#7F7F7A', borderRadius:'2px', marginTop:'0px' });
  // No handlers: static slide (no editing UI)

  const bottomLine: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', bottom:'56px', height:'6px', background:'#E6E5E3', borderRadius:'999px' };
  const footerStyle: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', bottom:'18px', display:'flex', justifyContent:'space-between', color:'#A9A8A6', fontSize:'13px' };

  return (
    <div className="enterprise-roadmap-slide inter-theme" style={slide}>
      <div style={topLine} />

      <div style={avatarArea}>
        <ClickableImagePlaceholder imagePath={profileImagePath} onImageUploaded={(p)=>onUpdate&&onUpdate({ profileImagePath:p })} size="LARGE" position="CENTER" description="Profile" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      </div>

      <div style={titleStyle}>{title}</div>

      <div style={descStyle}>{description}</div>

      <div style={tableWrap}>
        <div style={theadStyle}>
          {cols.map((h, idx)=> (
            <div key={idx}>{h}</div>
          ))}
        </div>
        {rows.map((r, i)=> (
          <div key={i} style={rowStyle(i)}>
            {cols.map((h, cidx)=> (
              <div key={cidx}>{r[h] || ''}</div>
            ))}
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

