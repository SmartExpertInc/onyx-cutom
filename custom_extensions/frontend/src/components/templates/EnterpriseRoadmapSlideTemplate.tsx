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
  headers,
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
  const defaultHeaders = headers && headers.length ? headers : ['Feature Name','Status','Due Date','Assignee'];
  const [cols, setCols] = useState<string[]>(defaultHeaders);
  const [rows, setRows] = useState<Record<string,string>[]>(tableData as Record<string,string>[]);
  const [hoveredHeader, setHoveredHeader] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', position:'relative', background:'#F9F8F6', fontFamily: currentTheme.fonts.titleFont };
  const topLine: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', top:'36px', height:'4px', background:'#E6E5E3', borderRadius:'999px' };
  const avatarArea: React.CSSProperties = { position:'absolute', left:'56px', top:'96px', width:'120px', height:'120px', borderRadius:'50%', overflow:'hidden', background:'#253020' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'208px', top:'104px', fontSize:'30px', color:'#585955', fontWeight:600 };
  const descStyle: React.CSSProperties = { position:'absolute', left:'208px', top:'152px', width:'720px', color:'#9EA59A', fontSize:'16px', lineHeight:1.6 };

  const tableWrap: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', top:'286px' };
  const gridTemplate = `${cols.map((_,i)=> i===0?'2fr':'1fr').join(' ')}`;
  const theadStyle: React.CSSProperties = { display:'grid', gridTemplateColumns: gridTemplate, background:'#2F342A', color:'#FFFFFF', padding:'16px 20px', borderRadius:'2px', fontWeight:600, letterSpacing:0.2, position:'relative' };
  const rowStyle = (i:number): React.CSSProperties => ({ display:'grid', gridTemplateColumns: gridTemplate, padding:'16px 20px', background: i%2===0 ? '#FFFFFF' : '#EFEDE9', fontSize:'15px', color:'#676E64', borderRadius:'4px', marginTop:'12px' });
  const smallIcon: React.CSSProperties = { width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', lineHeight:1, cursor:'pointer', boxShadow:'0 1px 2px rgba(0,0,0,0.15)' };

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
        {/* Headers row with inline edit and column controls */}
        <div style={theadStyle}>
          {cols.map((h, idx)=> (
            <div key={idx} style={{ position:'relative' }} onMouseEnter={()=>setHoveredHeader(idx)} onMouseLeave={()=>setHoveredHeader(null)}>
              <div>{h}</div>
              {isEditable && hoveredHeader === idx && (
                <div style={{ position:'absolute', top:'-10px', right:'-10px', display:'flex', gap:'6px' }}>
                  <div
                    title="Remove column"
                    onClick={()=>{ if(cols.length>1){ const nc=cols.filter((_,i)=>i!==idx); const key=h; const nr=rows.map(r=>{ const { [key]:_, ...rest } = r; return rest;}); setCols(nc); setRows(nr); onUpdate && onUpdate({ headers:nc, tableData:nr }); }}
                    style={{ ...smallIcon, background:'#ffffff', color:'#2C3327', border:'1px solid #DAD9D6' }}>×</div>
                  <div
                    title="Add column to the right"
                    onClick={()=>{ const name=`Column ${cols.length+1}`; const nc=[...cols.slice(0, idx+1), name, ...cols.slice(idx+1)]; const nr=rows.map(r=>{ const entries=Object.entries(r); const before=Object.fromEntries(entries.slice(0, idx+1)); const after=Object.fromEntries(entries.slice(idx+1)); return { ...before, [name]: '', ...after };}); setCols(nc); setRows(nr); onUpdate && onUpdate({ headers:nc, tableData:nr }); }}
                    style={{ ...smallIcon, background:'#ffffff', color:'#2C3327', border:'1px solid #DAD9D6' }}>+</div>
                </div>
              )}
            </div>
          ))}
          {isEditable && (
            <div style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)' }}>
              <div title="Add column" onClick={()=>{ const name=`Column ${cols.length+1}`; const nc=[...cols, name]; const nr=rows.map(r=> ({ ...r, [name]: '' })); setCols(nc); setRows(nr); onUpdate && onUpdate({ headers:nc, tableData:nr }); }} style={{ ...smallIcon, background:'#ffffff', color:'#2C3327', border:'1px solid #DAD9D6' }}>+</div>
            </div>
          )}
        </div>

        {/* Rows */}
        {rows.map((r, i)=> (
          <div key={i} style={{ position:'relative' }} onMouseEnter={()=>setHoveredRow(i)} onMouseLeave={()=>setHoveredRow(null)}>
            <div style={rowStyle(i)}>
              {cols.map((h, cidx)=> (
                <div key={cidx}>{r[h] || ''}</div>
              ))}
            </div>
            {isEditable && hoveredRow === i && (
              <div style={{ position:'absolute', right:'-10px', top:'50%', transform:'translateY(-50%)' }}>
                <div title="Remove row" onClick={()=>{ const nr=rows.filter((_,ri)=>ri!==i); setRows(nr); onUpdate && onUpdate({ tableData:nr, headers:cols }); }} style={{ ...smallIcon, background:'#ffffff', color:'#2C3327', border:'1px solid #DAD9D6' }}>×</div>
              </div>
            )}
          </div>
        ))}

        {isEditable && (
          <div style={{ position:'absolute', right:'8px', bottom:'-36px' }}>
            <div title="Add row" onClick={()=>{ const blank: Record<string,string> = {}; cols.forEach(h=> blank[h]=''); const nr=[...rows, blank]; setRows(nr); onUpdate && onUpdate({ tableData:nr, headers:cols }); }} style={{ ...smallIcon, background:'#ffffff', color:'#2C3327', border:'1px solid #DAD9D6' }}>+</div>
          </div>
        )}
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

