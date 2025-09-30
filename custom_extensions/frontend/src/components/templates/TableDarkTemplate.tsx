// custom_extensions/frontend/src/components/templates/TableDarkTemplate.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

// Table Dark Template Props
export interface TableDarkTemplateProps extends BaseTemplateProps {
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
  checkmarkColor?: string;
  crossColor?: string;
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

export const TableDarkTemplate: React.FC<TableDarkTemplateProps> = ({
  title = 'Comparison table template',
  tableData = {
    headers: ['feature 1', 'feature 2', 'feature 3', 'feature 4'],
    rows: [
      ['version 1', '✓', '✓', '✗', '✗'],
      ['version 2', '✗', '✓', '✓', '✗'],
      ['version 3', '✗', '✗', '✓', '✓']
    ]
  },
  backgroundColor = '#f8fafc',
  titleColor = '#1f2937',
  headerColor = '#ffffff',
  textColor = '#374151',
  tableBackgroundColor = '#ffffff',
  headerBackgroundColor = '#0ea5e9',
  borderColor = '#e5e7eb',
  checkmarkColor = '#0ea5e9',
  crossColor = '#94a3b8',
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
    }, 100); // Reduced timeout for faster saving
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
    const newRow = new Array(tableData.headers.length + 1).fill('');
    newRow[0] = `version ${newRows.length + 1}`;
    for (let i = 1; i < newRow.length; i++) {
      newRow[i] = i % 2 === 1 ? '✓' : '✗';
    }
    newRows.push(newRow);
    const newData = { 
      title, 
      tableData: { ...tableData, rows: newRows } 
    };
    scheduleAutoSave(newData);
  };

  const addColumn = () => {
    const newHeaders = [...tableData.headers, `feature ${tableData.headers.length + 1}`];
    const newRows = tableData.rows.map(row => [...row, '✓']);
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

  const renderCheckbox = (value: string, rowIndex: number, colIndex: number) => {
    const isChecked = value === '✓' || value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
    
    return (
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '2px',
          backgroundColor: isChecked ? '#0F58F9' : '#BED5FC',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          border: 'none',
          outline: 'none'
        }}
        onClick={() => {
          const newValue = isChecked ? '✗' : '✓';
          const newRows = [...tableData.rows];
          if (!newRows[rowIndex]) {
            newRows[rowIndex] = [];
          }
          newRows[rowIndex][colIndex] = newValue;
          const newData = { 
            title, 
            tableData: { ...tableData, rows: newRows } 
          };
          // Save immediately for checkboxes
          if (onUpdate) {
            onUpdate(newData);
          }
        }}
      >
        {isChecked && (
          <div style={{
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            lineHeight: '1'
          }}>
            ✓
          </div>
        )}
      </div>
    );
  };

  // Checkbox editor component for inline editing
  const CheckboxEditor: React.FC<{
    initialValue: string;
    onSave: (value: string) => void;
    onCancel: () => void;
    style?: React.CSSProperties;
  }> = ({ initialValue, onSave, onCancel, style }) => {
    const [value, setValue] = React.useState(initialValue);
    const isChecked = value === '✓' || value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
      <div 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        tabIndex={0}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => {
            const newValue = e.target.checked ? '✓' : '✗';
            setValue(newValue);
            onSave(newValue); // Auto-save on change
          }}
          style={{
            width: '20px',
            height: '20px',
            cursor: 'pointer',
            accentColor: currentTheme.colors.tableCheckmarkColor || checkmarkColor
          }}
          autoFocus
        />
      </div>
    );
  };

  // Slide styles - exactly as in photo
  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '600px',
    background: '#F8F8FF',
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
    color: '#09090B',
    marginBottom: '30px',
    fontFamily: 'Georgia, serif',
    lineHeight: '1.1'
  };

  // Table container styles - clean, no background, no borders
  const tableContainerStyles: React.CSSProperties = {
    width: '100%',
    borderRadius: '15px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    border: '1px solid #E0E0E0',
    display: 'flex',
    justifyContent: 'center',
    padding: '30px'
  };

  // Table styles - with spacing between cells
  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '8px 0px',
    backgroundColor: '#ffffff',
  };

  // Header styles - no borders, with spacing
  const headerStyles: React.CSSProperties = {
    backgroundColor: currentTheme.colors.tableFirstColumnColor,
    color: '#000000',
    fontWeight: 'bold',
    fontSize: '1rem',
    textAlign: 'center',
    padding: '16px 12px',
    verticalAlign: 'middle',
    height: '60px'
  };

  // First column (row headers) styles - no borders, with spacing
  const firstColumnStyles: React.CSSProperties = {
    backgroundColor: currentTheme.colors.tableFirstColumnColor,
    color: '#000000',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    textAlign: 'left',
    padding: '16px 12px',
    verticalAlign: 'middle',
    height: '60px'
  };

  // Data cell styles - no borders, with spacing
  const dataCellStyles: React.CSSProperties = {
    backgroundColor: currentTheme.colors.tableFirstColumnColor,
    color: '#000000',
    fontSize: '0.95rem',
    textAlign: 'center',
    padding: '16px 12px',
    verticalAlign: 'middle',
    height: '60px'
  };

  // Add button styles - using theme colors, perfectly aligned
  const addButtonStyles: React.CSSProperties = {
    backgroundColor: currentTheme.colors.tableHeaderColor || headerBackgroundColor,
    color: currentTheme.colors.tableHeaderTextColor || '#ffffff',
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
    backgroundColor: currentTheme.colors.tableDeleteButtonColor || '#FFB6C1',
    color: currentTheme.colors.tableDeleteButtonTextColor || '#FF0000',
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
    margin: '0 auto'
  };

  return (
    <div style={slideStyles}>
        {/* Title */}
      <div style={{ marginBottom: '30px' }}>
        <div data-draggable="true" style={{ display: 'inline-block' }}>
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
              onClick={(e: React.MouseEvent<HTMLHeadingElement>) => {
                const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (isEditable) setEditingTitle(true);
              }}
              className={isEditable ? 'cursor-pointer' : ''}
            >
              {title}
            </h1>
          )}
        </div>
        </div>

        {/* Table Container */}
      <div style={tableContainerStyles}>
        <table style={tableStyles}>
            {/* Headers */}
            <thead>
            <tr>
              {/* Product version header */}
              <th style={{ 
                ...headerStyles, 
                backgroundColor: currentTheme.colors.tableFirstColumnColor || '#F2F8FE',
                color: '#000000',
                textAlign: 'left',
                borderTopLeftRadius: '15px',
                borderTopRightRadius: '15px'
              }}>
                <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    Product version
                  </span>
                </div>
                </th>
              
              {/* Feature headers */}
                {tableData.headers.map((header, index) => (
                  <th 
                    key={index}
                    style={{ 
                    ...headerStyles,
                    borderTopLeftRadius: '15px',
                    borderTopRightRadius: '15px'
                  }}
                  onMouseEnter={() => setHoveredColumn(index)}
                  onMouseLeave={() => setHoveredColumn(null)}
                >
                  <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
                    {editingHeader === index && isEditable ? (
                      <InlineEditor
                        initialValue={header}
                        onSave={(value) => handleHeaderUpdate(index, value)}
                        onCancel={() => setEditingHeader(null)}
                        style={{
                          color: headerColor,
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          outline: 'none'
                        }}
                      />
                    ) : (
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '8px',
                          position: 'relative'
                        }}
                      >
                        <span 
                          onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                            const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                            if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                              e.preventDefault();
                              e.stopPropagation();
                              return;
                            }
                            if (isEditable) setEditingHeader(index);
                          }}
                          className={isEditable ? 'cursor-pointer' : ''}
                        >
                          {header}
                        </span>
                        {isEditable && (
                          <button
                            onClick={() => removeColumn(index)}
                            style={{
                              ...deleteButtonStyles,
                              opacity: hoveredColumn === index ? 1 : 0,
                              transition: 'opacity 0.2s ease',
                              position: 'absolute',
                              top: '50%',
                              right: '8px',
                              transform: 'translateY(-50%)'
                            }}
                            title="Remove Column"
                          >
                            ✗
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  </th>
                ))}
              
              {/* Add column button - always visible */}
                {isEditable && (
                <th style={{ 
                  ...headerStyles, 
                  backgroundColor: currentTheme.colors.tableHeaderColor || headerBackgroundColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                    <button
                      onClick={addColumn}
                    style={{
                      ...addButtonStyles,
                      opacity: 1,
                      transition: 'opacity 0.2s ease'
                    }}
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
                <tr 
                  key={rowIndex}
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
                          isFirstColumn ? (
                          <InlineEditor
                            initialValue={cell}
                            onSave={(value) => handleCellUpdate(rowIndex, colIndex, value)}
                            onCancel={() => setEditingCell(null)}
                            style={{
                                color: '#000000',
                                textAlign: 'left',
                                fontSize: '0.95rem',
                                fontWeight: 'bold',
                                backgroundColor: 'transparent',
                                border: 'none',
                                outline: 'none',
                                width: '100%'
                              }}
                            />
                          ) : (
                            <CheckboxEditor
                              initialValue={cell}
                              onSave={(value) => handleCellUpdate(rowIndex, colIndex, value)}
                              onCancel={() => setEditingCell(null)}
                              style={{
                                width: '100%'
                              }}
                            />
                          )
                        ) : (
                          isFirstColumn ? (
                            <span 
                              onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                                const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                                if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  return;
                                }
                                if (isEditable) setEditingCell({ row: rowIndex, col: colIndex });
                              }}
                              className={isEditable ? 'cursor-pointer' : ''}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                  width: '15px',
                                  height: '15px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  color: '#0F58F9',
                                  fontWeight: 'bold'
                                }}>
                                  ►
                                </div>
                                <span>{cell}</span>
                              </div>
                            </span>
                          ) : (
                            <div 
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              {renderCheckbox(cell, rowIndex, colIndex)}
                            </div>
                          )
                        )}
                      </div>
                      </td>
                    );
                  })}
                
                {/* Delete row button - appears on hover */}
                  {isEditable && (
                  <td style={{ 
                    ...dataCellStyles, 
                    textAlign: 'center', 
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                      <button
                        onClick={() => removeRow(rowIndex)}
                      style={{
                        ...deleteButtonStyles,
                        opacity: hoveredRow === rowIndex ? 1 : 0,
                        transition: 'opacity 0.2s ease'
                      }}
                        title="Remove Row"
                      >
                        ✗
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              
            {/* Add row button - appears on hover */}
              {isEditable && (
              <tr 
                onMouseEnter={() => setHoveredRow(-1)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td style={{ 
                  ...firstColumnStyles, 
                  textAlign: 'center',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottomLeftRadius: '15px',
                  borderBottomRightRadius: '15px'
                }}>
                    <button
                      onClick={addRow}
                    style={{
                      ...addButtonStyles,
                      opacity: hoveredRow === -1 ? 1 : 0,
                      transition: 'opacity 0.2s ease'
                    }}
                      title="Add Row"
                    >
                    +
                    </button>
                  </td>
                {/* Empty cells for other columns */}
                {Array.from({ length: tableData.headers.length }).map((_, colIndex) => (
                  <td 
                    key={colIndex} 
                    style={{
                      ...dataCellStyles,
                      borderBottomLeftRadius: '15px',
                      borderBottomRightRadius: '15px'
                    }}
                  />
                ))}
                {/* Empty cell for delete column */}
                <td style={{ 
                  ...dataCellStyles, 
                  textAlign: 'center',
                  borderBottomLeftRadius: '15px',
                  borderBottomRightRadius: '15px'
                }} />
                </tr>
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default TableDarkTemplate;