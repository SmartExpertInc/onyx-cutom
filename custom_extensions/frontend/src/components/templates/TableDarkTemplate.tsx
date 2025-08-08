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
  showCheckmarks?: boolean;
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

export const TableDarkTemplate: React.FC<TableDarkTemplateProps> = ({
  title = 'This is a table',
  tableData = {
    headers: ['Mars', 'Venus', 'Jupiter'],
    rows: [
      ['Task 1', '✓', '✗', '✓'],
      ['Task 2', '✗', '✓', '✗'],
      ['Task 3', '✓', '✗', '✓'],
      ['Task 4', '✗', '✓', '✗']
    ]
  },
  showCheckmarks = true,
  backgroundColor = '#1a1a1a',
  titleColor = '#ffffff',
  headerColor = '#ffffff',
  textColor = '#ffffff',
  tableBackgroundColor = '#2a2a2a',
  headerBackgroundColor = '#3a3a3a',
  borderColor = '#4a4a4a',
  checkmarkColor = '#10b981',
  crossColor = '#ef4444',
  theme,
  isEditable = false,
  onUpdate
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent } = currentTheme.colors;
  
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
    const newRow = new Array(tableData.headers.length + 1).fill('');
    newRow[0] = `Task ${newRows.length + 1}`;
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
    const newHeaders = [...tableData.headers, `Column ${tableData.headers.length + 1}`];
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

  const renderCheckmark = (value: string) => {
    if (!showCheckmarks) return value;
    
    if (value === '✓' || value.toLowerCase() === 'yes' || value.toLowerCase() === 'true') {
      return (
        <div className="flex items-center justify-center">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: checkmarkColor }}
          >
            ✓
          </div>
        </div>
      );
    }
    
    if (value === '✗' || value.toLowerCase() === 'no' || value.toLowerCase() === 'false') {
      return (
        <div className="flex items-center justify-center">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: crossColor }}
          >
            ✗
          </div>
        </div>
      );
    }
    
    return value;
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col justify-center items-center p-8 font-sans"
      style={{ 
        backgroundColor: themeBg,
        minHeight: '600px'
      }}
    >
      {/* Decorative curved element */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-bl-full opacity-20"
        style={{ backgroundColor: themeContent }}
      ></div>

      {/* Main Content Container */}
      <div className="w-full max-w-4xl mx-auto z-10">
        
        {/* Title */}
        <div className="text-left mb-8">
          {editingTitle && isEditable ? (
            <InlineEditor
              initialValue={title}
              onSave={handleTitleUpdate}
              onCancel={() => setEditingTitle(false)}
              style={{
                color: themeTitle,
                fontSize: '3rem',
                fontWeight: 'bold',
                lineHeight: '1.2'
              }}
            />
          ) : (
            <h1 
              className="text-5xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: themeTitle }}
              onClick={() => isEditable && setEditingTitle(true)}
            >
              {title}
            </h1>
          )}
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-lg shadow-2xl">
          <table className="w-full border-collapse">
            
            {/* Headers */}
            <thead>
              <tr style={{ backgroundColor: headerBackgroundColor }}>
                <th 
                  className="p-4 text-left font-bold border-r-2"
                  style={{ 
                    color: themeTitle,
                    themeContent: themeContent,
                    fontSize: '1.1rem'
                  }}
                >
                  {/* Empty corner cell */}
                </th>
                {tableData.headers.map((header, index) => (
                  <th 
                    key={index}
                    className="p-4 text-center font-bold border-r-2 last:border-r-0 relative group"
                    style={{ 
                      color: themeTitle,
                      themeContent: themeContent,
                      fontSize: '1.1rem'
                    }}
                  >
                    {editingHeader === index && isEditable ? (
                      <InlineEditor
                        initialValue={header}
                        onSave={(value) => handleHeaderUpdate(index, value)}
                        onCancel={() => setEditingHeader(null)}
                        style={{
                          color: themeTitle,
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span 
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => isEditable && setEditingHeader(index)}
                        >
                          {header}
                        </span>
                        {isEditable && (
                          <button
                            onClick={() => removeColumn(index)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity text-xs"
                          >
                            ✗
                          </button>
                        )}
                      </div>
                    )}
                  </th>
                ))}
                {isEditable && (
                  <th className="p-4 text-center">
                    <button
                      onClick={addColumn}
                      className="text-green-400 hover:text-green-300 transition-colors font-bold text-lg"
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
                  className="border-b-2 hover:bg-opacity-10 hover:bg-white transition-colors group"
                  style={{ 
                    themeContent: themeContent,
                    backgroundColor: tableBackgroundColor 
                  }}
                >
                  {row.map((cell, colIndex) => {
                    const isFirstColumn = colIndex === 0;
                    const isEditingThisCell = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                    
                    return (
                      <td 
                        key={colIndex}
                        className={`p-4 border-r-2 last:border-r-0 relative ${
                          isFirstColumn ? 'text-left font-semibold' : 'text-center'
                        }`}
                        style={{ 
                          color: themeContent,
                          themeContent: themeContent,
                          fontSize: '1rem'
                        }}
                      >
                        {isEditingThisCell && isEditable ? (
                          <InlineEditor
                            initialValue={cell}
                            onSave={(value) => handleCellUpdate(rowIndex, colIndex, value)}
                            onCancel={() => setEditingCell(null)}
                            style={{
                              color: themeContent,
                              textAlign: isFirstColumn ? 'left' : 'center',
                              fontSize: '1rem',
                              fontWeight: isFirstColumn ? 'bold' : 'normal'
                            }}
                          />
                        ) : (
                          <span 
                            className="cursor-pointer hover:opacity-80 block"
                            onClick={() => isEditable && setEditingCell({ row: rowIndex, col: colIndex })}
                          >
                            {isFirstColumn ? cell : renderCheckmark(cell)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {isEditable && (
                    <td className="p-4 text-center">
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                        title="Remove Row"
                      >
                        ✗
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              
              {/* Add Row Button */}
              {isEditable && (
                <tr>
                  <td 
                    colSpan={tableData.headers.length + 2}
                    className="p-4 text-center"
                    style={{ backgroundColor: tableBackgroundColor }}
                  >
                    <button
                      onClick={addRow}
                      className="text-green-400 hover:text-green-300 transition-colors font-bold text-lg"
                      title="Add Row"
                    >
                      + Add Row
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom thumbnails strip */}
        <div className="flex justify-center gap-2 mt-8 opacity-60">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div 
              key={i}
              className="w-12 h-8 rounded border"
              style={{ 
                backgroundColor: tableBackgroundColor,
                themeContent: themeContent 
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableDarkTemplate;