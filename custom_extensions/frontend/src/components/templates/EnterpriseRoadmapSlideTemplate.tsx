// custom_extensions/frontend/src/components/templates/EnterpriseRoadmapSlideTemplate.tsx

import React, { useState, useEffect } from 'react';
import { EnterpriseRoadmapSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';
import YourLogo from '../YourLogo';

export const EnterpriseRoadmapSlideTemplate: React.FC<EnterpriseRoadmapSlideProps & { theme?: SlideTheme | string; logoPath?: string; logoText?: string }> = ({
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
  companyLogoPath = '',
  companyName = 'Company name',
  reportType = 'KPI Report',
  date = 'February 2023',
  logoPath = '',
  logoText = 'Your Logo',
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
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState('17');

  const normalizeRows = (input: any[], colHeaders: string[]): string[][] => {
    return (input || []).map((r: any) => {
      // If row is already an array, use it
      if (Array.isArray(r)) return r.map(String);
      // If row is an object, map to array based on column indices
      const rowArray: string[] = [];
      colHeaders.forEach((h, idx) => {
        // Try to get value from object using header as key
        if (typeof r === 'object' && r !== null) {
          const map: Record<string, any> = {
            'Feature Name': r.featureName ?? r.feature ?? r.name,
            'Status': r.status,
            'Due Date': r.dueDate ?? r.date,
            'Assignee': r.assignee ?? r.owner
          };
          rowArray[idx] = String(map[h] ?? r[h] ?? '');
        } else {
          rowArray[idx] = '';
        }
      });
      return rowArray;
    });
  };

  const [rows, setRows] = useState<string[][]>(normalizeRows(tableData as any[], defaultHeaders));

  const pushUpdate = (nextCols: string[] = cols, nextRows: string[][] = rows) => {
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
    const nextRows = rows.map((r) => [...r.slice(0, idx + 1), DEFAULT_CELL_PLACEHOLDER, ...r.slice(idx + 1)]);
    setCols(nextCols);
    setRows(nextRows);
    pushUpdate(nextCols, nextRows);
  };

  const deleteColumnAt = (idx: number) => {
    if (cols.length <= 1) return;
    const nextCols = cols.filter((_, i) => i !== idx);
    const nextRows = rows.map((r) => r.filter((_, i) => i !== idx));
    setCols(nextCols);
    setRows(nextRows);
    pushUpdate(nextCols, nextRows);
  };

  const addRowAfter = (idx: number) => {
    const newRow: string[] = cols.map(() => DEFAULT_CELL_PLACEHOLDER);
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
    const nextCols = cols.map((c, i) => (i === idx ? value : c));
    setCols(nextCols);
    setEditingHeaderIdx(null);
    pushUpdate(nextCols, rows);
  };

  const saveCell = (row: number, col: number, value: string) => {
    const nextRows = rows.map((r, i) => {
      if (i === row) {
        const newRow = [...r];
        newRow[col] = value;
        return newRow;
      }
      return r;
    });
    setRows(nextRows);
    setEditingCell(null);
    pushUpdate(cols, nextRows);
  };

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', position:'relative', background:'#FFFFFF', fontFamily: currentTheme.fonts.titleFont };
  const avatarArea: React.CSSProperties = { position:'absolute', left:'60px', top:'45px', width:'168px', height:'168px', borderRadius:'50%', overflow:'hidden', background:'#0F58F9' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'260px', top:'55px', fontSize:'35px', color:'#000000', fontWeight:600, fontFamily:'Lora, serif' };
  const descStyle: React.CSSProperties = { position:'absolute', left:'260px', top:'120px', width:'630px', color:'#555555', fontSize:'17px', lineHeight:1.4, fontFamily:'Inter, sans-serif' };

  const tableWrap: React.CSSProperties = { position:'absolute', left:'60px', right:'60px', top:'240px' };
  const gridTemplate = `${cols.map(()=> '1fr').join(' ')}`;
  const theadStyle: React.CSSProperties = { 
    display:'grid', 
    gridTemplateColumns: gridTemplate, 
    background:'#0F58F9', 
    color:'#FFFFFF', 
    padding:'10px 15px', 
    borderTopLeftRadius:'3px', 
    borderTopRightRadius:'3px',
    borderLeft: '1px solid #EDEEF2',
    borderRight: '1px solid #EDEEF2',
    borderTop: '1px solid #EDEEF2',
    borderBottom: 'none',
    fontWeight:400, 
    fontSize:'17px', 
    position:'relative' 
  };
  const rowStyle = (i:number, totalRows:number): React.CSSProperties => ({ 
    display:'grid', 
    gridTemplateColumns: gridTemplate, 
    padding:'10px 15px', 
    background: i%2===0 ? '#FFFFFF' : '#F3F5FF', 
    fontSize:'17px', 
    color:'#6B6B6D', 
    marginTop:'0px', 
    position:'relative',
    borderLeft: '1px solid #EDEEF2',
    borderRight: '1px solid #EDEEF2',
    borderTop: 'none',
    borderRadius: i === totalRows - 1 ? '0 0 3px 3px' : '0',
    borderBottom: i === totalRows - 1 ? '1px solid #EDEEF2' : 'none'
  });

  // Inline editor base styles to prevent layout shift
  const inlineEditorHeaderStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    margin: 0,
    color:'#A0A49B',
    fontWeight: 600,
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
  const inlineEditor = (base: React.CSSProperties): React.CSSProperties => ({ 
    position: 'relative',
    background:'transparent', 
    border:'none', 
    outline:'none', 
    padding:0, 
    margin:0,
    fontSize: base.fontSize,
    fontWeight: base.fontWeight,
    color: base.color,
    lineHeight: base.lineHeight,
    whiteSpace: base.whiteSpace || 'pre-line',
    width: base.width || '100%',
    fontFamily: base.fontFamily
  });

  const footerStyle: React.CSSProperties = { position:'absolute', left:'0px', right:'60px', bottom:'24px', display:'flex', justifyContent:'space-between', color:'#5F616D', fontSize:'15px', fontFamily:'Inter, sans-serif', fontWeight:600 };

  return (
    <>
      <style>{`
        .enterprise-roadmap-slide *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .enterprise-roadmap-slide .title-element {
          font-family: "Lora", serif !important;
          font-weight: 600 !important;
        }
        .enterprise-roadmap-slide .logo-text {
          font-weight: 600 !important;
        }
        .enterprise-roadmap-slide-logo, .logo-text * {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      <div className="enterprise-roadmap-slide inter-theme" style={slide}>
      <div style={avatarArea}>
        <ClickableImagePlaceholder imagePath={profileImagePath} onImageUploaded={(p)=>onUpdate&&onUpdate({ profileImagePath:p })} size="LARGE" position="CENTER" description="Profile" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover', marginTop:'3px' }} />
      </div>

      <div style={titleStyle}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={title}
            onSave={(v)=>{ onUpdate&&onUpdate({ title: v }); setEditingTitle(false); }}
            onCancel={()=>setEditingTitle(false)}
            className="title-element"
            style={inlineEditor(titleStyle)}
          />
        ) : (
          <div className="title-element" onClick={()=> isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
        )}
      </div>

      <div style={descStyle}>
        {isEditable && editingDescription ? (
          <ImprovedInlineEditor
            initialValue={description}
            multiline={true}
            onSave={(v)=>{ onUpdate&&onUpdate({ description: v }); setEditingDescription(false); }}
            onCancel={()=>setEditingDescription(false)}
            style={inlineEditor(descStyle)}
          />
        ) : (
          <div onClick={()=> isEditable && setEditingDescription(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{description}</div>
        )}
      </div>

      <div style={tableWrap}>
        <div style={theadStyle}>
          {cols.map((h, idx)=> (
            <div key={idx} onMouseEnter={()=> setHoverHeaderIdx(idx)} onMouseLeave={()=> setHoverHeaderIdx(null)} style={{ 
              position:'relative',
              borderRight: idx < cols.length - 1 ? '1px solid #EDEEF2' : 'none',
              padding: '0 0 0 15px'
            }}>
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
                <div style={{ position:'absolute', right: 15, top:'50%', transform:'translateY(-50%)', display:'flex', gap:'6px' }}>
                  <button
                    onClick={()=> addColumnAfter(idx)}
                    style={{ width:18, height:18, borderRadius:3, border:'1px solid #0A3CA8', background:'#0C45C2', color:'#FFFFFF', cursor:'pointer', padding:0, display:'inline-flex', alignItems:'center', justifyContent:'center', lineHeight:1, fontSize:12 }}
                  >
                    +
                  </button>
                  <button
                    onClick={()=> deleteColumnAt(idx)}
                    style={{ width:18, height:18, borderRadius:3, border:'1px solid #0A3CA8', background:'#0C45C2', color:'#FFFFFF', cursor:'pointer', padding:0, display:'inline-flex', alignItems:'center', justifyContent:'center', lineHeight:1, fontSize:12 }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {rows.map((r, i)=> (
          <div key={i} style={rowStyle(i, rows.length)} onMouseEnter={()=> setHoverRowIdx(i)} onMouseLeave={()=> setHoverRowIdx(null)}>
            {cols.map((h, cidx)=> (
              <div key={cidx} style={{ 
                position:'relative',
                borderRight: cidx < cols.length - 1 ? '1px solid #EDEEF2' : 'none',
                padding: '0 0 0 15px',
              }}>
                {isEditable && editingCell && editingCell.row===i && editingCell.col===cidx ? (
                  <ImprovedInlineEditor
                    initialValue={r[cidx] || ''}
                    onSave={(v)=> saveCell(i, cidx, v)}
                    onCancel={()=> setEditingCell(null)}
                    style={inlineEditorCellStyle}
                  />
                ) : (
                  <div onClick={()=> isEditable && setEditingCell({ row:i, col:cidx })} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{r[cidx] || ''}</div>
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

      <div style={footerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '15px',
            height: '1px',
            backgroundColor: '#5F616D'
          }}></div>
          {isEditable && editingPageNumber ? (
            <ImprovedInlineEditor
              initialValue={currentPageNumber}
              onSave={(v) => {
                setCurrentPageNumber(v);
                setEditingPageNumber(false);
                onUpdate && onUpdate({ pageNumber: v });
              }}
              onCancel={() => setEditingPageNumber(false)}
              style={{ position: 'relative', background: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0, color: '#5F616D', fontSize: '16px', fontWeight: 600 }}
            />
          ) : (
            <div onClick={() => isEditable && setEditingPageNumber(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>
              {currentPageNumber}
            </div>
          )}
        </div>
        <div className="enterprise-roadmap-slide-logo">
          <YourLogo
            logoPath={logoPath}
            onLogoUploaded={(p)=> onUpdate && onUpdate({ logoPath: p })}
            isEditable={isEditable}
            color="#000000"
            text={logoText}
          />
        </div>
      </div>

    </div>
    </>
  );
};

export default EnterpriseRoadmapSlideTemplate;

