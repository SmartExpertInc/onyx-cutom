// custom_extensions/frontend/src/components/templates/TableLightTemplate.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

// Table Light Template Props
export interface TableLightTemplateProps extends BaseTemplateProps {
  title: string;
  tableData: {
    headers: string[];
    rows: string[][];
  };
  backgroundColor?: string;
  titleColor?: string;
  headerColor?: string;
  textColor?: string;
  tableBackgroundColor?: string;
  headerBackgroundColor?: string;
  borderColor?: string;
  accentColor?: string;
  theme?: any;
}

export const TableLightTemplate: React.FC<TableLightTemplateProps> = ({
  title = 'This is table',
  tableData = {
    headers: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F'],
    rows: [
      ['Mercury', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
      ['Mars', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
      ['Saturn', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX']
    ]
  },
  backgroundColor = '#ffffff',
  titleColor = '#000000',
  headerColor = '#ffffff',
  textColor = '#000000',
  tableBackgroundColor = '#ffffff',
  headerBackgroundColor = '#2176FF',
  borderColor = '#E0E0E0',
  accentColor = '#2176FF',
  theme,
  isEditable = false,
  onUpdate
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  
  // State for inline editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editingHeader, setEditingHeader] = useState<number | null>(null);
  
  // State for hover effects
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

  // Auto-save timeout
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const scheduleAutoSave = (newData: any) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (onUpdate) {
        onUpdate(newData);
      }
    }, 300);
  };

  const handleTitleUpdate = (newTitle: string) => {
    setEditingTitle(false);
    const newData = { title: newTitle, tableData };
    scheduleAutoSave(newData);
  };

  const handleHeaderUpdate = (headerIndex: number, newValue: string) => {
    setEditingHeader(null);
    const newHeaders = [...tableData.headers];
    newHeaders[headerIndex] = newValue;
    const newData = { 
      title, 
      tableData: { ...tableData, headers: newHeaders } 
    };
    scheduleAutoSave(newData);
  };

  const handleCellUpdate = (rowIndex: number, colIndex: number, newValue: string) => {
    setEditingCell(null);
    const newRows = [...tableData.rows];
    if (!newRows[rowIndex]) {
      newRows[rowIndex] = [];
    }
    newRows[rowIndex][colIndex] = newValue;
    const newData = { 
      title, 
      tableData: { ...tableData, rows: newRows } 
    };
    scheduleAutoSave(newData);
  };

  const addRow = () => {
    const newRows = [...tableData.rows];
    const newRow = new Array(tableData.headers.length + 1).fill('XX');
    newRow[0] = `Planet ${newRows.length + 1}`;
    newRows.push(newRow);
    const newData = { 
      title, 
      tableData: { ...tableData, rows: newRows } 
    };
    scheduleAutoSave(newData);
  };

  const addColumn = () => {
    const newHeaders = [...tableData.headers, `Team ${String.fromCharCode(65 + tableData.headers.length)}`];
    const newRows = tableData.rows.map(row => [...row, 'XX']);
    const newData = { 
      title, 
      tableData: { headers: newHeaders, rows: newRows } 
    };
    scheduleAutoSave(newData);
  };

  const removeRow = (rowIndex: number) => {
    const newRows = tableData.rows.filter((_, index) => index !== rowIndex);
    const newData = { 
      title, 
      tableData: { ...tableData, rows: newRows } 
    };
    scheduleAutoSave(newData);
  };

  const removeColumn = (colIndex: number) => {
    const newHeaders = tableData.headers.filter((_, index) => index !== colIndex);
    const newRows = tableData.rows.map(row => row.filter((_, index) => index !== colIndex + 1));
    const newData = { 
      title, 
      tableData: { headers: newHeaders, rows: newRows } 
    };
    scheduleAutoSave(newData);
  };

  // Slide styles - NO BACKGROUND
  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '600px',
    background: 'transparent', // NO BACKGROUND as requested
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '50px 20px 50px 50px', // Reduced right padding to minimize white space
    fontFamily: 'Georgia, serif'
  };

  // Title styles - exactly as in photo
  const titleStyles: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '30px',
    fontFamily: 'Georgia, serif',
    lineHeight: '1.1'
  };

  // Table container styles - clean, no background, no borders
  const tableContainerStyles: React.CSSProperties = {
    width: '100%',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  };

  // Table styles - perfectly aligned
  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#ffffff',
    tableLayout: 'auto' // Auto width for proper column sizing
  };

  // Header styles - using theme colors, no borders
  const headerStyles: React.CSSProperties = {
    backgroundColor: '#0F58F9',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '1rem',
    textAlign: 'center',
    padding: '16px 12px',
    verticalAlign: 'middle',
    height: '60px'
  };

  // First column (row headers) styles - using theme colors, no borders
  const firstColumnStyles: React.CSSProperties = {
    backgroundColor: '#F2F8FE',
    color: '#000000',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    textAlign: 'left',
    padding: '16px 12px',
    verticalAlign: 'middle',
    height: '60px'
  };

  // Data cell styles - no borders
  const dataCellStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: '0.95rem',
    textAlign: 'center',
    padding: '16px 12px',
    verticalAlign: 'middle',
    height: '60px'
  };

  // Add button styles - using theme colors, perfectly aligned
  const addButtonStyles: React.CSSProperties = {
    backgroundColor: '#0F58F9',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 auto'
  };

  // Delete button styles - perfectly aligned
  const deleteButtonStyles: React.CSSProperties = {
    backgroundColor: '#FFB6C1',
    color: '#FF0000',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    margin: '0 auto' // Perfect centering
  };

  return (
    <div style={slideStyles}>
      {/* Editing toolbar - positioned above table */}
      {isEditable && (
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={addRow}
            style={{
              backgroundColor: '#0F58F9',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Add Row"
          >
            + Add Row
          </button>
          <button
            onClick={addColumn}
            style={{
              backgroundColor: '#0F58F9',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Add Column"
          >
            + Add Column
          </button>
        </div>
      )}
      
      {/* Title */}
      <div style={{ marginBottom: '30px' }}>
        <div data-draggable="true" style={{ display: 'inline-block' }}>
          {editingTitle && isEditable ? (
            <WysiwygEditor
              initialValue={title}
              onSave={handleTitleUpdate}
              onCancel={() => setEditingTitle(false)}
              placeholder="Enter table title..."
              className="inline-editor-title"
              style={{
                ...titleStyles,
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block',
                lineHeight: '1.1'
              }}
            />
          ) : (
            <h1 
              style={titleStyles}
              onClick={(e) => {
                const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (isEditable) setEditingTitle(true);
              }}
              className={isEditable ? 'cursor-pointer' : ''}
              dangerouslySetInnerHTML={{ __html: title }}
            />
          )}
        </div>
      </div>

      {/* Table Container - NO BACKGROUND */}
      <div style={tableContainerStyles}>
        <table style={tableStyles}>
          {/* Headers */}
          <thead>
            <tr>
              {/* Team headers */}
              {tableData.headers.map((header, index) => (
                <th 
                  key={index} 
                  style={{
                    ...headerStyles,
                    textAlign: index === 0 ? 'left' : 'center',
                    position: 'relative'
                  }}
                  onMouseEnter={() => setHoveredColumn(index)}
                  onMouseLeave={() => setHoveredColumn(null)}
                >
                  <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
                    {editingHeader === index && isEditable ? (
                      <WysiwygEditor
                        initialValue={header}
                        onSave={(value) => handleHeaderUpdate(index, value)}
                        onCancel={() => setEditingHeader(null)}
                        placeholder="Enter header..."
                        className="inline-editor-header"
                        style={{
                          color: '#ffffff',
                          textAlign: index === 0 ? 'left' : 'center',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          padding: '8px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          wordWrap: 'break-word',
                          whiteSpace: 'pre-wrap',
                          boxSizing: 'border-box',
                          display: 'block',
                          lineHeight: '1.2'
                        }}
                      />
                    ) : (
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: index === 0 ? 'flex-start' : 'center', 
                          gap: '8px',
                          position: 'relative',
                          color: '#ffffff'
                        }}
                      >
                        <span 
                          onClick={(e) => {
                            const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                            if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                              e.preventDefault();
                              e.stopPropagation();
                              return;
                            }
                            if (isEditable) setEditingHeader(index);
                          }}
                          className={isEditable ? 'cursor-pointer' : ''}
                          dangerouslySetInnerHTML={{ __html: header }}
                        />
                      </div>
                    )}
                  </div>
                  {/* Delete column button - positioned absolutely on top right of header */}
                  {isEditable && index > 0 && (
                    <button
                      onClick={() => removeColumn(index)}
                      style={{
                        ...deleteButtonStyles,
                        opacity: hoveredColumn === index ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        zIndex: 10
                      }}
                      title="Remove Column"
                    >
                      ✗
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                style={{ position: 'relative' }}
                onMouseEnter={() => setHoveredRow(rowIndex)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {row.map((cell, colIndex) => {
                  const isFirstColumn = colIndex === 0;
                  const isEditingThisCell = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                  
                  return (
                    <td 
                      key={colIndex}
                      style={isFirstColumn ? firstColumnStyles : dataCellStyles}
                    >
                      <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
                        {isEditingThisCell && isEditable ? (
                          <WysiwygEditor
                            initialValue={cell}
                            onSave={(value) => handleCellUpdate(rowIndex, colIndex, value)}
                            onCancel={() => setEditingCell(null)}
                            placeholder="Enter cell content..."
                            className="inline-editor-cell"
                            style={{
                              color: '#000000',
                              textAlign: isFirstColumn ? 'left' : 'center',
                              fontSize: '0.95rem',
                              fontWeight: isFirstColumn ? 'bold' : 'normal',
                              padding: '8px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              wordWrap: 'break-word',
                              whiteSpace: 'pre-wrap',
                              boxSizing: 'border-box',
                              display: 'block',
                              lineHeight: '1.2',
                              width: '100%'
                            }}
                          />
                        ) : (
                          <span 
                            onClick={(e) => {
                              const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                              if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                              }
                              if (isEditable) setEditingCell({ row: rowIndex, col: colIndex });
                            }}
                            className={isEditable ? 'cursor-pointer' : ''}
                            dangerouslySetInnerHTML={{ __html: cell }}
                          />
                        )}
                      </div>
                    </td>
                  );
                })}
                {/* Delete row button - positioned absolutely outside table */}
                {isEditable && (
                  <td style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)' }}>
                    <button
                      onClick={() => removeRow(rowIndex)}
                      style={{
                        ...deleteButtonStyles,
                        opacity: hoveredRow === rowIndex ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        position: 'relative'
                      }}
                      title="Remove Row"
                    >
                      ✗
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableLightTemplate;