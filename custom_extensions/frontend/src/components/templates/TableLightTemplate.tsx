// custom_extensions/frontend/src/components/templates/TableLightTemplate.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

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

interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function InlineEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  className = "",
  style = {}
}: InlineEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(value);
  };

  return (
    <input
      ref={inputRef}
      className={`inline-editor-input ${className}`}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      style={{
        ...style,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        boxSizing: 'border-box',
        display: 'block'
      }}
    />
  );
}

export const TableLightTemplate: React.FC<TableLightTemplateProps> = ({
  title = 'This is table',
  tableData = {
    headers: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F'],
    rows: [
      ['Mercury', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
      ['Mars', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
      ['Saturn', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
      ['Venus', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
      ['Jupiter', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
      ['Earth', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
      ['Moon', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX']
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
    padding: '50px',
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

  // Table container styles - clean, no background
  const tableContainerStyles: React.CSSProperties = {
    width: '100%',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '1px solid #E0E0E0'
  };

  // Table styles
  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#ffffff'
  };

  // Header styles - blue background as in photo
  const headerStyles: React.CSSProperties = {
    backgroundColor: '#2176FF',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '1rem',
    textAlign: 'center',
    padding: '16px 12px',
    borderRight: '1px solid #E0E0E0'
  };

  // First column (row headers) styles
  const firstColumnStyles: React.CSSProperties = {
    backgroundColor: '#F8F8F8',
    color: '#000000',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    textAlign: 'left',
    padding: '16px 12px',
    borderRight: '1px solid #E0E0E0',
    borderBottom: '1px solid #E0E0E0'
  };

  // Data cell styles
  const dataCellStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: '0.95rem',
    textAlign: 'center',
    padding: '16px 12px',
    borderRight: '1px solid #E0E0E0',
    borderBottom: '1px solid #E0E0E0'
  };

  // Add button styles
  const addButtonStyles: React.CSSProperties = {
    backgroundColor: '#2176FF',
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
    fontWeight: 'bold'
  };

  // Delete button styles
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
    fontWeight: 'bold'
  };

  return (
    <div style={slideStyles}>
      {/* Title */}
      <div style={{ marginBottom: '30px' }}>
        {editingTitle && isEditable ? (
          <InlineEditor
            initialValue={title}
            onSave={handleTitleUpdate}
            onCancel={() => setEditingTitle(false)}
            style={titleStyles}
          />
        ) : (
          <h1 
            style={titleStyles}
            onClick={() => isEditable && setEditingTitle(true)}
            className={isEditable ? 'cursor-pointer' : ''}
          >
            {title}
          </h1>
        )}
      </div>

      {/* Table Container - NO BACKGROUND */}
      <div style={tableContainerStyles}>
        <table style={tableStyles}>
          {/* Headers */}
          <thead>
            <tr>
              {/* Empty corner cell */}
              <th style={{ ...headerStyles, backgroundColor: '#2176FF' }}></th>
              
              {/* Team headers */}
              {tableData.headers.map((header, index) => (
                <th key={index} style={headerStyles}>
                  {editingHeader === index && isEditable ? (
                    <InlineEditor
                      initialValue={header}
                      onSave={(value) => handleHeaderUpdate(index, value)}
                      onCancel={() => setEditingHeader(null)}
                      style={{
                        color: '#ffffff',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span 
                        onClick={() => isEditable && setEditingHeader(index)}
                        className={isEditable ? 'cursor-pointer' : ''}
                      >
                        {header}
                      </span>
                      {isEditable && (
                        <button
                          onClick={() => removeColumn(index)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            opacity: 0.7
                          }}
                        >
                          ✗
                        </button>
                      )}
                    </div>
                  )}
                </th>
              ))}
              
              {/* Add column button */}
              {isEditable && (
                <th style={{ ...headerStyles, backgroundColor: '#2176FF' }}>
                  <button
                    onClick={addColumn}
                    style={addButtonStyles}
                    title="Add Column"
                  >
                    +
                  </button>
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => {
                  const isFirstColumn = colIndex === 0;
                  const isEditingThisCell = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                  
                  return (
                    <td 
                      key={colIndex}
                      style={isFirstColumn ? firstColumnStyles : dataCellStyles}
                    >
                      {isEditingThisCell && isEditable ? (
                        <InlineEditor
                          initialValue={cell}
                          onSave={(value) => handleCellUpdate(rowIndex, colIndex, value)}
                          onCancel={() => setEditingCell(null)}
                          style={{
                            color: '#000000',
                            textAlign: isFirstColumn ? 'left' : 'center',
                            fontSize: '0.95rem',
                            fontWeight: isFirstColumn ? 'bold' : 'normal',
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            width: '100%'
                          }}
                        />
                      ) : (
                        <span 
                          onClick={() => isEditable && setEditingCell({ row: rowIndex, col: colIndex })}
                          className={isEditable ? 'cursor-pointer' : ''}
                        >
                          {cell}
                        </span>
                      )}
                    </td>
                  );
                })}
                
                {/* Delete row button */}
                {isEditable && (
                  <td style={{ ...dataCellStyles, textAlign: 'center' }}>
                    <button
                      onClick={() => removeRow(rowIndex)}
                      style={deleteButtonStyles}
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