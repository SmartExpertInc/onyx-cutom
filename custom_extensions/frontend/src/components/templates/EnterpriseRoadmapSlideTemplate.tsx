// custom_extensions/frontend/src/components/templates/EnterpriseRoadmapSlideTemplate.tsx

import React, { useState } from 'react';
import { EnterpriseRoadmapSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

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
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState('');

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

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', position:'relative', background:'#FFFFFF', fontFamily: currentTheme.fonts.titleFont };
  const avatarArea: React.CSSProperties = { position:'absolute', left:'60px', top:'55px', width:'150px', height:'150px', borderRadius:'50%', overflow:'hidden', background:'#0F58F9' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'250px', top:'60px', fontSize:'35px', color:'#000000', fontWeight:600, fontFamily:'Lora, serif' };
  const descStyle: React.CSSProperties = { position:'absolute', left:'250px', top:'125px', width:'600px', color:'#555555', fontSize:'16px', lineHeight:1.4, fontFamily:'Inter, sans-serif' };

  const tableWrap: React.CSSProperties = { position:'absolute', left:'60px', right:'60px', top:'230px' };
  const gridTemplate = `${cols.map((_,i)=> i===0?'2fr':'1fr').join(' ')}`;
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
  const inlineEditorTitleStyle: React.CSSProperties = { ...titleStyle, position:'relative', backgroundColor:'transparent', border:'none', outline:'none', padding:0, margin:0 };
  const inlineEditorDescStyle: React.CSSProperties = { ...descStyle, position:'relative', backgroundColor:'transparent', border:'none', outline:'none', padding:0, margin:0 };
  // No handlers: static slide (no editing UI)

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ slideId, title, description, headers, tableData, profileImagePath, profileImageAlt, companyName, reportType, date }, companyLogoPath: newLogoPath });
    }
  };

  const footerStyle: React.CSSProperties = { position:'absolute', left:'60px', right:'60px', bottom:'20px', display:'flex', justifyContent:'space-between', color:'#A2A19D', fontSize:'14px', fontFamily:'Inter, sans-serif' };

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
            style={inlineEditorTitleStyle}
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
            style={inlineEditorDescStyle}
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
              // padding: '0 0 0 15px'
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

      <div style={footerStyle}>
        <div>17</div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: 'black',
          fontFamily: 'Inter, sans-serif',
          fontWeight: '400'
        }}>
          {currentCompanyLogoPath ? (
            // Show uploaded logo image
            <ClickableImagePlaceholder
              imagePath={currentCompanyLogoPath}
              onImageUploaded={handleCompanyLogoUploaded}
              size="SMALL"
              position="CENTER"
              description="Company logo"
              isEditable={isEditable}
              style={{
                height: '20px',
                maxWidth: '80px',
                objectFit: 'contain'
              }}
            />
          ) : (
            // Show default logo design with clickable area
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: isEditable ? 'pointer' : 'default'
            }}
            onClick={() => isEditable && setShowLogoUploadModal(true)}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '1px solid black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'black'
              }}>
                +
              </div>
              <div className="logo-text" style={{ fontSize: '14px', color: 'black', fontFamily: 'Inter, sans-serif' }}>Your Logo</div>
            </div>
          )}
        </div>
      </div>

      {/* Logo Upload Modal */}
      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={(newLogoPath: string) => {
            handleCompanyLogoUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
    </div>
    </>
  );
};

export default EnterpriseRoadmapSlideTemplate;

