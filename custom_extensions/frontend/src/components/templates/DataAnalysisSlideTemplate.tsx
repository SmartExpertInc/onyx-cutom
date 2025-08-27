// custom_extensions/frontend/src/components/templates/DataAnalysisSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { DataAnalysisSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface BarChartData {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarChartData[];
  onDelete: (id: string) => void;
  isEditable?: boolean;
  theme: SlideTheme;
}

function BarChart({ data, onDelete, isEditable = false, theme }: BarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '40px'
    }}>
      <div style={{
        fontSize: '24px',
        color: '#333333',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Data Analytics Overview
      </div>
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        justifyContent: 'space-between'
      }}>
        {data.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}
            onMouseEnter={() => setHoveredBar(item.id)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            {/* Label */}
            <div style={{
              width: '100px',
              fontSize: '16px',
              color: '#333333',
              fontWeight: '500',
              textAlign: 'right'
            }}>
              {item.label}
            </div>
            
            {/* Bar container */}
            <div style={{
              flex: 1,
              height: '35px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '17px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Bar */}
              <div style={{
                height: '100%',
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
                borderRadius: '17px',
                transition: 'width 0.3s ease',
                position: 'relative'
              }} />
              
              {/* Value label on bar */}
              <div style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '14px',
                color: '#ffffff',
                fontWeight: 'bold',
                zIndex: 2
              }}>
                {item.value}%
              </div>
            </div>
            
            {/* Delete button */}
            {isEditable && hoveredBar === item.id && (
              <div
                onClick={() => onDelete(item.id)}
                style={{
                  position: 'absolute',
                  right: '-30px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#ff4444',
                  border: 'none',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 3,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.backgroundColor = '#ff0000';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.backgroundColor = '#ff4444';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                ×
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InlineEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  multiline = false, 
  placeholder = "",
  className = "",
  style = {}
}: InlineEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
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

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [multiline]);

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className={`inline-editor-textarea ${className}`}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          ...style,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          resize: 'none',
          overflow: 'hidden',
          width: '100%',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          minHeight: '1.6em',
          boxSizing: 'border-box',
          display: 'block',
        }}
        rows={1}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      className={`inline-editor-input ${className}`}
      type="text"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      style={{
        ...style,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        boxSizing: 'border-box',
        display: 'block',
      }}
    />
  );
}

export const DataAnalysisSlideTemplate: React.FC<DataAnalysisSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Introduction to Data Analysis',
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  excelIconPath = '',
  excelIconAlt = 'Excel icon',
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  
  // Bar chart data
  const [chartData, setChartData] = useState<BarChartData[]>([
    { id: '1', label: 'Sales Growth', value: 75, color: '#FF6B35' },
    { id: '2', label: 'Market Share', value: 60, color: '#4ECDC4' },
    { id: '3', label: 'Revenue', value: 85, color: '#45B7D1' },
    { id: '4', label: 'Profit Margin', value: 45, color: '#96CEB4' },
    { id: '5', label: 'Customer Satisfaction', value: 90, color: '#FFE66D' }
  ]);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '600px',
    backgroundColor: themeBg,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, profileImagePath, profileImageAlt, excelIconPath, excelIconAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, profileImagePath, profileImageAlt, excelIconPath, excelIconAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleExcelIconUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, profileImagePath, profileImageAlt, excelIconPath, excelIconAlt, backgroundColor, titleColor, contentColor, accentColor }, excelIconPath: newImagePath });
    }
  };

  const handleChartDelete = (id: string) => {
    setChartData(prevData => prevData.filter(item => item.id !== id));
  };

  return (
    <div className="data-analysis-slide-template" style={slideStyles}>
      {/* Left Section - Profile Image */}
      <div style={{
        width: '33%',
        height: '100%',
        backgroundColor: themeAccent,
        borderRadius: '20px',
        margin: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ClickableImagePlaceholder
          imagePath={profileImagePath}
          onImageUploaded={handleProfileImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Profile photo"
          isEditable={isEditable}
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '20px',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Right Section - Title and Bar Chart */}
      <div style={{
        width: '67%',
        height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        margin: '40px 40px 40px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 40px'
      }}>
        {/* Title */}
        <div style={{
          fontSize: '48px',
          color: '#333333',
          fontWeight: 'bold',
          lineHeight: '1.2',
          whiteSpace: 'pre-line',
          minHeight: '60px',
          maxHeight: '120px',
          display: 'flex',
          alignItems: 'flex-start',
          overflow: 'hidden'
        }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="data-analysis-title-editor"
              style={{
                fontSize: '48px',
                color: '#333333',
                fontWeight: 'bold',
                lineHeight: '1.2',
                whiteSpace: 'pre-line',
                width: '100%',
                height: '100%',
                minHeight: '60px',
                maxHeight: '120px'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingTitle(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'flex-start'
              }}
            >
              {currentTitle}
            </div>
          )}
        </div>

        {/* Bar Chart Section */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'stretch',
          marginTop: '40px'
        }}>
          <BarChart
            data={chartData}
            onDelete={handleChartDelete}
            isEditable={isEditable}
            theme={currentTheme}
          />
        </div>
      </div>
    </div>
  );
};

export default DataAnalysisSlideTemplate; 