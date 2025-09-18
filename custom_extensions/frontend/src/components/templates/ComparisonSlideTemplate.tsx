// custom_extensions/frontend/src/components/templates/ComparisonSlideTemplate.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ComparisonSlideTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

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
        width: '100%',
        borderBottom: '2px solid #007bff',
      }}
    />
  );
}

export function ComparisonSlideTemplate({
  slideId,
  title = "Comparison",
  subtitle = "",
  tableData = { headers: [], rows: [] },
  isEditable = false,
  onUpdate,
  theme: themeProp,
  voiceoverText
}: ComparisonSlideTemplateProps) {
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  
  // Get the resolved theme
  const theme = themeProp || getSlideTheme(DEFAULT_SLIDE_THEME);

  const updateTitle = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
  };

  const updateSubtitle = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
  };

  const updateHeader = (index: number, newValue: string) => {
    const newHeaders = [...tableData.headers];
    newHeaders[index] = newValue;
    
    if (onUpdate) {
      onUpdate({
        tableData: {
          ...tableData,
          headers: newHeaders
        }
      });
    }
  };

  const updateCell = (rowIndex: number, colIndex: number, newValue: string) => {
    const newRows = [...tableData.rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = newValue;
    
    if (onUpdate) {
      onUpdate({
        tableData: {
          ...tableData,
          rows: newRows
        }
      });
    }
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (isEditable) {
      setEditingCell({ row: rowIndex, col: colIndex });
    }
  };

  const handleHeaderClick = (index: number) => {
    if (isEditable) {
      setEditingCell({ row: -1, col: index });
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
  };

  const saveEdit = (newValue: string) => {
    if (editingCell) {
      if (editingCell.row === -1) {
        // Editing header
        updateHeader(editingCell.col, newValue);
      } else {
        // Editing cell
        updateCell(editingCell.row, editingCell.col, newValue);
      }
      setEditingCell(null);
    }
  };

  return (
    <div 
      className="comparison-slide-template"
      style={{
        background: theme.colors.backgroundColor,
        color: theme.colors.contentColor,
        minHeight: '100vh',
        padding: '4rem 3rem',
        fontFamily: theme.fonts.contentFont
      }}
    >
      {/* Title */}
      <div className="text-center mb-8">
        {isEditable ? (
          <h1 
            className="text-5xl font-bold mb-4 cursor-pointer hover:bg-opacity-20 hover:bg-white rounded p-2"
            onClick={() => {
              const newTitle = prompt('Edit title:', title);
              if (newTitle !== null) updateTitle(newTitle);
            }}
            style={{ color: theme.colors.titleColor }}
          >
            {title}
          </h1>
        ) : (
          <h1 
            className="text-5xl font-bold mb-4"
            style={{ color: theme.colors.titleColor }}
          >
            {title}
          </h1>
        )}
        
        {subtitle && (
          isEditable ? (
            <p 
              className="text-2xl opacity-80 cursor-pointer hover:bg-opacity-20 hover:bg-white rounded p-2"
              onClick={() => {
                const newSubtitle = prompt('Edit subtitle:', subtitle);
                if (newSubtitle !== null) updateSubtitle(newSubtitle);
              }}
              style={{ color: theme.colors.subtitleColor }}
            >
              {subtitle}
            </p>
          ) : (
            <p 
              className="text-2xl opacity-80"
              style={{ color: theme.colors.subtitleColor }}
            >
              {subtitle}
            </p>
          )
        )}
      </div>

      {/* Comparison Table */}
      <div className="flex justify-center">
        <div className="max-w-6xl w-full">
          <table className="w-full border-collapse shadow-2xl rounded-lg overflow-hidden">
            {/* Headers */}
            <thead>
                                <tr style={{ backgroundColor: theme.colors.accentColor }}>
                {tableData.headers.map((header, index) => (
                  <th
                    key={index}
                    className={`text-xl font-semibold py-4 px-6 text-center ${isEditable ? 'cursor-pointer hover:bg-opacity-80' : ''}`}
                    style={{ 
                      color: '#ffffff',
                      backgroundColor: theme.colors.accentColor,
                      borderBottom: `2px solid ${theme.colors.borderColor || theme.colors.accentColor}`
                    }}
                    onClick={() => handleHeaderClick(index)}
                  >
                    {editingCell?.row === -1 && editingCell?.col === index ? (
                      <InlineEditor
                        initialValue={header}
                        onSave={saveEdit}
                        onCancel={cancelEdit}
                        style={{ color: '#ffffff', fontWeight: 'bold' }}
                      />
                    ) : (
                      header
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
                  style={{
                    background: rowIndex % 2 === 0 ? theme.colors.backgroundColor : 'transparent',
                  }}
                  className="hover:bg-opacity-50 transition-colors"
                >
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className={`text-lg py-4 px-6 text-center border-b ${isEditable ? 'cursor-pointer hover:bg-opacity-20 hover:bg-white' : ''}`}
                      style={{ 
                        color: theme.colors.contentColor,
                        borderBottomColor: theme.colors.borderColor || theme.colors.accentColor + '40'
                      }}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                        <InlineEditor
                          initialValue={cell}
                          onSave={saveEdit}
                          onCancel={cancelEdit}
                          style={{ color: theme.colors.contentColor }}
                        />
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voiceover Text (for video lessons) */}
      {voiceoverText && (
        <div 
          className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-60 text-white p-3 rounded text-sm"
          style={{ fontSize: '0.875rem', lineHeight: '1.25rem' }}
        >
          {voiceoverText}
        </div>
      )}
    </div>
  );
}

export default ComparisonSlideTemplate; 