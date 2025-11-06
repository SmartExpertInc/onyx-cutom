// custom_extensions/frontend/src/components/templates/TableDarkTemplate.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

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

export const TableDarkTemplate: React.FC<TableDarkTemplateProps> = ({
  title = 'Comparison table template',
  tableData = {
    headers: ['Feature', 'Option 1', 'Option 2', 'Option 3'],
    rows: [
      ['Feature A', '✓', '✓', '✗'],
      ['Feature B', '✗', '✓', '✓'],
      ['Feature C', '✗', '✗', '✓']
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
    const newRow = new Array(tableData.headers.length).fill('');
    newRow[0] = `Row ${newRows.length + 1}`;
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
    const newHeaders = [...tableData.headers, `Option ${tableData.headers.length}`];
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
    // Prevent removing the first column (feature names)
    if (colIndex === 0) return;
    
    const newHeaders = tableData.headers.filter((_, index) => index !== colIndex);
    const newRows = tableData.rows.map(row => row.filter((_, index) => index !== colIndex));
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
    padding: '50px 20px 50px 50px', // Reduced right padding to minimize white space
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
    padding: '30px'
  };

  // Table styles - with spacing between cells
  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '8px 0px',
    backgroundColor: '#ffffff',
    tableLayout: 'auto' // Auto width for proper column sizing
  };

  // Header styles - no borders, with spacing
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
              dangerouslySetInnerHTML={{ __html: title }}
            />
          )}
        </div>
        </div>

        {/* Table Container */}
      <div style={tableContainerStyles}>
        <table style={tableStyles}>
            {/* Headers */}
            <thead>
            <tr>
              {/* First column header - from data */}
              {tableData.headers.length > 0 && (
              <th style={{ 
                ...headerStyles,
                textAlign: 'left',
                borderTopLeftRadius: '15px',
                borderTopRightRadius: '15px'
              }}>
                <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
                    {editingHeader === -1 && isEditable ? (
                      <WysiwygEditor
                        initialValue={tableData.headers[0]}
                        onSave={(value) => handleHeaderUpdate(0, value)}
                        onCancel={() => setEditingHeader(null)}
                        placeholder="Enter header..."
                        className="inline-editor-header"
                        style={{
                          color: '#ffffff',
                          textAlign: 'left',
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
                      <span 
                        style={{ fontWeight: 'bold', fontSize: '1rem', color: '#ffffff' }}
                        onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                          const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                          if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          if (isEditable) setEditingHeader(-1);
                        }}
                        className={isEditable ? 'cursor-pointer' : ''}
                        dangerouslySetInnerHTML={{ __html: tableData.headers[0] }}
                      />
                    )}
                </div>
                </th>
              )}
              
              {/* Remaining column headers */}
                {tableData.headers.slice(1).map((header, idx) => {
                  const actualIndex = idx + 1; // Adjust index since we're using slice(1)
                  return (
                  <th 
                    key={idx}
                    style={{ 
                    ...headerStyles,
                    borderTopLeftRadius: '15px',
                    borderTopRightRadius: '15px',
                    position: 'relative'
                  }}
                  onMouseEnter={() => setHoveredColumn(actualIndex)}
                  onMouseLeave={() => setHoveredColumn(null)}
                >
                  <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
                    {editingHeader === actualIndex && isEditable ? (
                      <WysiwygEditor
                        initialValue={header}
                        onSave={(value) => handleHeaderUpdate(actualIndex, value)}
                        onCancel={() => setEditingHeader(null)}
                        placeholder="Enter header..."
                        className="inline-editor-header"
                        style={{
                          color: '#ffffff',
                          textAlign: 'center',
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
                          justifyContent: 'center', 
                          gap: '8px',
                          position: 'relative',
                          color: '#ffffff'
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
                            if (isEditable) setEditingHeader(actualIndex);
                          }}
                          className={isEditable ? 'cursor-pointer' : ''}
                          dangerouslySetInnerHTML={{ __html: header }}
                        />
                      </div>
                    )}
                  </div>
                  {/* Delete column button - positioned absolutely on top right of header */}
                  {isEditable && (
                    <button
                      onClick={() => removeColumn(actualIndex)}
                      style={{
                        ...deleteButtonStyles,
                        opacity: hoveredColumn === actualIndex ? 1 : 0,
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
                  );
                })}
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
                        {isFirstColumn ? (
                          // First column: text with inline editing
                          isEditingThisCell && isEditable ? (
                          <WysiwygEditor
                            initialValue={cell}
                            onSave={(value) => handleCellUpdate(rowIndex, colIndex, value)}
                            onCancel={() => setEditingCell(null)}
                            placeholder="Enter cell content..."
                            className="inline-editor-cell"
                            style={{
                                color: '#000000',
                                textAlign: 'left',
                                fontSize: '0.95rem',
                                fontWeight: 'bold',
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
                                <span dangerouslySetInnerHTML={{ __html: cell }} />
                              </div>
                            </span>
                          )
                          ) : (
                          // All other columns: checkbox only (no text allowed)
                            <div 
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              {renderCheckbox(cell, rowIndex, colIndex)}
                            </div>
                        )}
                      </div>
                      </td>
                    );
                  })}
                  {/* Delete row button - positioned absolutely outside table */}
                  {isEditable && (
                    <button
                      onClick={() => removeRow(rowIndex)}
                      style={{
                        ...deleteButtonStyles,
                        opacity: hoveredRow === rowIndex ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        position: 'absolute',
                        right: '-40px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                      title="Remove Row"
                    >
                      ✗
                    </button>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default TableDarkTemplate;