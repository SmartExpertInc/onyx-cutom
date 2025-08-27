// custom_extensions/frontend/src/components/templates/ImpactStatementsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ImpactStatementsSlideProps } from '@/types/slideTemplates';
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
      gap: '15px',
      padding: '20px'
    }}>
      <div style={{
        fontSize: '18px',
        color: theme.colors.titleColor,
        fontWeight: 'bold',
        marginBottom: '10px'
      }}>
        Performance Metrics
      </div>
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        justifyContent: 'space-between'
      }}>
        {data.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={() => setHoveredBar(item.id)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            {/* Label */}
            <div style={{
              width: '80px',
              fontSize: '12px',
              color: theme.colors.contentColor,
              fontWeight: '500',
              textAlign: 'right'
            }}>
              {item.label}
            </div>
            
            {/* Bar container */}
            <div style={{
              flex: 1,
              height: '25px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Bar */}
              <div style={{
                height: '100%',
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
                borderRadius: '12px',
                transition: 'width 0.3s ease',
                position: 'relative'
              }} />
              
              {/* Value label on bar */}
              <div style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '11px',
                color: theme.colors.backgroundColor,
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
                  right: '-25px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#ff4444',
                  border: 'none',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: '12px',
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

export const ImpactStatementsSlideTemplate: React.FC<ImpactStatementsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Here are some impact value statements backed by numbers:',
  statements = [
    { number: '50%', description: 'decrease in turnover rates.' },
    { number: '$2.8B', description: 'the cost of harassment to businesses in the United States annually.' },
    { number: '40%', description: 'increase in employee morale and engagement' }
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
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
  const [editingStatements, setEditingStatements] = useState<number | null>(null);
  const [editingNumbers, setEditingNumbers] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentStatements, setCurrentStatements] = useState(statements);
  
  // Bar chart data
  const [chartData, setChartData] = useState<BarChartData[]>([
    { id: '1', label: 'Sales', value: 75, color: '#FF6B35' },
    { id: '2', label: 'Growth', value: 60, color: '#4ECDC4' },
    { id: '3', label: 'Revenue', value: 85, color: '#45B7D1' },
    { id: '4', label: 'Profit', value: 45, color: '#96CEB4' }
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
    padding: '60px 80px',
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleStatementSave = (index: number, newDescription: string) => {
    const newStatements = [...currentStatements];
    newStatements[index] = { ...newStatements[index], description: newDescription };
    setCurrentStatements(newStatements);
    setEditingStatements(null);
    if (onUpdate) {
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, statements: newStatements });
    }
  };

  const handleNumberSave = (index: number, newNumber: string) => {
    const newStatements = [...currentStatements];
    newStatements[index] = { ...newStatements[index], number: newNumber };
    setCurrentStatements(newStatements);
    setEditingNumbers(null);
    if (onUpdate) {
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, statements: newStatements });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleStatementCancel = () => {
    setCurrentStatements(statements);
    setEditingStatements(null);
  };

  const handleNumberCancel = () => {
    setCurrentStatements(statements);
    setEditingNumbers(null);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleChartDelete = (id: string) => {
    setChartData(prevData => prevData.filter(item => item.id !== id));
  };

  return (
    <div className="impact-statements-slide-template" style={slideStyles}>
      {/* Left section with title and profile image */}
      <div style={{
        width: '75%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Title */}
        <div style={{
          maxWidth: '390px',
          fontSize: '40px',
          color: themeTitle,
          lineHeight: '1.2',
          marginBottom: '40px',
          minHeight: '50px',
          maxHeight: '100px',
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
              className="impact-title-editor"
              style={{
                maxWidth: '390px',
                fontSize: '40px',
                color: themeTitle,
                lineHeight: '1.2',
                width: '100%',
                height: '100%',
                minHeight: '50px',
                maxHeight: '100px'
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

        {/* Profile image in orange container */}
        <div style={{
          width: '300px',
          height: '200px',
          backgroundColor: themeAccent,
          borderRadius: '24px',
          overflow: 'hidden',
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
              width: '43%',
              height: '92%',
              objectFit: 'cover',
              position: 'relative',
              bottom: '-21px',
            }}
          />
        </div>
      </div>

      {/* Right section with impact statements and bar chart */}
      <div style={{
        display: 'flex',
        gap: '20px',
        width: '65%',
        height: '100%'
      }}>
        {/* Левая колонка (два блока) */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '30px'
        }}>
          {currentStatements.slice(0, 2).map((statement, index) => (
            <div
              key={index}
              style={{
                backgroundColor: themeAccent,
                borderRadius: '10px',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                minHeight: index === 1 ? '42%' : '51%'
              }}
            >
              {/* Number */}
              <div style={{
                fontSize: '48px',
                color: themeBg,
                fontWeight: 'bold',
                minHeight: '60px',
                maxHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                {isEditable && editingNumbers === index ? (
                  <InlineEditor
                    initialValue={statement.number}
                    onSave={(value) => handleNumberSave(index, value)}
                    onCancel={handleNumberCancel}
                    className="statement-number-editor"
                    style={{
                      fontSize: '48px',
                      color: themeBg,
                      fontWeight: 'bold',
                      width: '100%',
                      height: '100%',
                      minHeight: '60px',
                      maxHeight: '60px'
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingNumbers(index)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {statement.number}
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{
                fontSize: '16px',
                color: themeBg,
                lineHeight: '1.4',
                minHeight: '25px',
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                {isEditable && editingStatements === index ? (
                  <InlineEditor
                    initialValue={statement.description}
                    onSave={(value) => handleStatementSave(index, value)}
                    onCancel={handleStatementCancel}
                    multiline={true}
                    className="statement-description-editor"
                    style={{
                      fontSize: '16px',
                      color: themeBg,
                      lineHeight: '1.4',
                      width: '100%'
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingStatements(index)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {statement.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Правая колонка (bar chart) */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'stretch'
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            width: '100%',
            height: '100%',
            border: '1px solid rgba(255, 255, 255, 0.1)'
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
    </div>
  );
};

export default ImpactStatementsSlideTemplate; 