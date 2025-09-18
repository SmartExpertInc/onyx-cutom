// custom_extensions/frontend/src/components/templates/EnterpriseRoadmapSlideTemplate.tsx

import React, { useState } from 'react';
import { EnterpriseRoadmapSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

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
  const [hoverHeaderIdx, setHoverHeaderIdx] = useState<number | null>(null);
  const [hoverRowIdx, setHoverRowIdx] = useState<number | null>(null);
  const [editingHeaderIdx, setEditingHeaderIdx] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

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

  const pushUpdate = (nextCols: string[] = cols, nextRows: Record<string, string>[] = rows) => {
    if (onUpdate) {
      onUpdate({ headers: nextCols, tableData: nextRows });
    }
  };

  const DEFAULT_CELL_PLACEHOLDER = 'text text text';

  const addColumnAfter = (idx: number) => {
    const nameBase = 'Column';
    let newName = `${nameBase} ${cols.length + 1}`;
    let suffix = cols.length + 1;
    while (cols.includes(newName)) {
      suffix += 1;
      newName = `${nameBase} ${suffix}`;
    }
    const nextCols = [...cols.slice(0, idx + 1), newName, ...cols.slice(idx + 1)];
    const nextRows = rows.map((r) => ({ ...r, [newName]: DEFAULT_CELL_PLACEHOLDER }));
    setCols(nextCols);
    setRows(nextRows);
    pushUpdate(nextCols, nextRows);
  };

  const deleteColumnAt = (idx: number) => {
    if (cols.length <= 1) return;
    const key = cols[idx];
    const nextCols = cols.filter((_, i) => i !== idx);
    const nextRows = rows.map((r) => {
      const { [key]: _omit, ...rest } = r;
      return rest;
    });
    setCols(nextCols);
    setRows(nextRows);
    pushUpdate(nextCols, nextRows);
  };

  const addRowAfter = (idx: number) => {
    const newRow: Record<string, string> = {};
    cols.forEach((h) => (newRow[h] = DEFAULT_CELL_PLACEHOLDER));
    const nextRows = [...rows.slice(0, idx + 1), newRow, ...rows.slice(idx + 1)];
    setRows(nextRows);
    pushUpdate(cols, nextRows);
  };

  const deleteRowAt = (idx: number) => {
    if (rows.length <= 1) return;
    const nextRows = rows.filter((_, i) => i !== idx);
    setRows(nextRows);
    pushUpdate(cols, nextRows);
  };

  const saveHeader = (idx: number, value: string) => {
    const old = cols[idx];
    const nextCols = cols.map((c, i) => (i === idx ? value : c));
    // remap row keys
    const nextRows = rows.map((r) => {
      const { [old]: oldVal, ...rest } = r;
      return { ...rest, [value]: oldVal };
    });
    setCols(nextCols);
    setRows(nextRows);
    setEditingHeaderIdx(null);
    pushUpdate(nextCols, nextRows);
  };

  const saveCell = (row: number, col: number, value: string) => {
    const key = cols[col];
    const nextRows = rows.map((r, i) => (i === row ? { ...r, [key]: value } : r));
    setRows(nextRows);
    setEditingCell(null);
    pushUpdate(cols, nextRows);
  };

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', position:'relative', background:'#F9F8F6', fontFamily: 'Lora-Bold, serif', fontWeight: 'normal' };
  const topLine: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', top:'36px', height:'6px', background:'#E6E5E3', borderRadius:'999px' };
  const avatarArea: React.CSSProperties = { position:'absolute', left:'56px', top:'96px', width:'140px', height:'140px', borderRadius:'50%', overflow:'hidden', background:'#253020' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'430px', top:'104px', fontSize:'30px', color:'#6C6D68', fontFamily: 'Lora-Bold, serif', fontWeight: 'normal' };
  const descStyle: React.CSSProperties = { position:'absolute', left:'430px', top:'152px', width:'520px', color:'#9D9C98', fontSize:'16px', lineHeight:1.6 };

  const tableWrap: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', top:'286px' };
  const gridTemplate = `${cols.map((_,i)=> i===0?'2fr':'1fr').join(' ')}`;
  const theadStyle: React.CSSProperties = { display:'grid', gridTemplateColumns: gridTemplate, background:'#2B3127', color:'#A0A49B', padding:'12px 20px', borderRadius:'2px', fontFamily: 'Lora-Bold, serif', fontWeight: 'normal', letterSpacing:0.2, position:'relative' };
  const rowStyle = (i:number): React.CSSProperties => ({ display:'grid', gridTemplateColumns: gridTemplate, padding:'12px 20px', background: i%2===0 ? '#F9F8F6' : '#E5E4E0', fontSize:'15px', color:'#7F7F7A', borderRadius:'2px', marginTop:'0px', position:'relative' });

  // Inline editor base styles to prevent layout shift
  const inlineEditorHeaderStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    margin: 0,
    color:'#A0A49B',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
    lineHeight: 1.2,
  };
  const inlineEditorCellStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    margin: 0,
    fontSize:'15px',
    color:'#7F7F7A',
    lineHeight: 1.4,
  };
  const inlineEditorTitleStyle: React.CSSProperties = { ...titleStyle, position:'relative', backgroundColor:'transparent', border:'none', outline:'none', padding:0, margin:0 };
  const inlineEditorDescStyle: React.CSSProperties = { ...descStyle, position:'relative', backgroundColor:'transparent', border:'none', outline:'none', padding:0, margin:0 };
  // No handlers: static slide (no editing UI)

  const bottomLine: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', bottom:'56px', height:'6px', background:'#E6E5E3', borderRadius:'999px' };
  const footerStyle: React.CSSProperties = { position:'absolute', left:'40px', right:'40px', bottom:'18px', display:'flex', justifyContent:'space-between', color:'#A9A8A6', fontSize:'13px' };

  return (
    <div className="enterprise-roadmap-slide inter-theme" style={slide}>
      <div style={topLine} />

      <div style={avatarArea}>
        <ClickableImagePlaceholder imagePath={profileImagePath} onImageUploaded={(p)=>onUpdate&&onUpdate({ profileImagePath:p })} size="LARGE" position="CENTER" description="Profile" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover', marginTop:'3px' }} />
      </div>

      <div style={titleStyle}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={title}
            onSave={(v)=>{ onUpdate&&onUpdate({ title: v }); setEditingTitle(false); }}
            onCancel={()=>setEditingTitle(false)}
            style={inlineEditorTitleStyle}
          />
        ) : (
          <div onClick={()=> isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
        )}
      </div>

      <div style={descStyle}>
        {isEditable && editingDescription ? (
          <ImprovedInlineEditor
            initialValue={description}
            multiline={true}
            onSave={(v)=>{ onUpdate&&onUpdate({ description: v }); setEditingDescription(false); }}
            onCancel={()=>setEditingDescription(false)}
            style={inlineEditorDescStyle}
          />
        ) : (
          <div onClick={()=> isEditable && setEditingDescription(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{description}</div>
        )}
      </div>

      <div style={tableWrap}>
        <div style={theadStyle}>
          {cols.map((h, idx)=> (
            <div key={idx} onMouseEnter={()=> setHoverHeaderIdx(idx)} onMouseLeave={()=> setHoverHeaderIdx(null)} style={{ position:'relative' }}>
              {isEditable && editingHeaderIdx === idx ? (
                <ImprovedInlineEditor
                  initialValue={h}
                  onSave={(v)=> saveHeader(idx, v)}
                  onCancel={()=> setEditingHeaderIdx(null)}
                  style={inlineEditorHeaderStyle}
                />
              ) : (
                <span onClick={()=> isEditable && setEditingHeaderIdx(idx)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{h}</span>
              )}
              {isEditable && hoverHeaderIdx === idx && (
                <div style={{ position:'absolute', right:-12, top:'50%', transform:'translateY(-50%)', display:'flex', gap:'6px' }}>
                  <button
                    onClick={()=> addColumnAfter(idx)}
                    style={{ width:18, height:18, borderRadius:3, border:'1px solid #5a5a5a', background:'#384033', color:'#A0A49B', cursor:'pointer', padding:0, display:'inline-flex', alignItems:'center', justifyContent:'center', lineHeight:1, fontSize:12 }}
                  >
                    +
                  </button>
                  <button
                    onClick={()=> deleteColumnAt(idx)}
                    style={{ width:18, height:18, borderRadius:3, border:'1px solid #5a5a5a', background:'#384033', color:'#A0A49B', cursor:'pointer', padding:0, display:'inline-flex', alignItems:'center', justifyContent:'center', lineHeight:1, fontSize:12 }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {rows.map((r, i)=> (
          <div key={i} style={rowStyle(i)} onMouseEnter={()=> setHoverRowIdx(i)} onMouseLeave={()=> setHoverRowIdx(null)}>
            {cols.map((h, cidx)=> (
              <div key={cidx} style={{ position:'relative' }}>
                {isEditable && editingCell && editingCell.row===i && editingCell.col===cidx ? (
                  <ImprovedInlineEditor
                    initialValue={r[h] || ''}
                    onSave={(v)=> saveCell(i, cidx, v)}
                    onCancel={()=> setEditingCell(null)}
                    style={inlineEditorCellStyle}
                  />
                ) : (
                  <div onClick={()=> isEditable && setEditingCell({ row:i, col:cidx })} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{r[h] || ''}</div>
                )}
              </div>
            ))}
            {isEditable && hoverRowIdx === i && (
              <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', display:'flex', gap:'6px' }}>
                <button
                  onClick={()=> addRowAfter(i)}
                  style={{ width:20, height:20, borderRadius:3, border:'1px solid #b0b0b0', background:'#FFFFFF', color:'#555', cursor:'pointer', padding:0, display:'inline-flex', alignItems:'center', justifyContent:'center', lineHeight:1, fontSize:12 }}
                >
                  +
                </button>
                <button
                  onClick={()=> deleteRowAt(i)}
                  style={{ width:20, height:20, borderRadius:3, border:'1px solid #b0b0b0', background:'#FFFFFF', color:'#555', cursor:'pointer', padding:0, display:'inline-flex', alignItems:'center', justifyContent:'center', lineHeight:1, fontSize:12 }}
                >
                  ×
                </button>
              </div>
            )}
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

