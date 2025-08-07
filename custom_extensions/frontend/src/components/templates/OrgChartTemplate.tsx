import React, { useState, useRef, useEffect } from 'react';
import { OrgChartTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

interface ChartNode {
  id: string;
  title: string;
  level: number;
  parentId?: string;
}

interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
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
          lineHeight: '1.6'
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
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        boxSizing: 'border-box',
        display: 'block',
        lineHeight: '1.2'
      }}
    />
  );
}

const OrgChartTemplate: React.FC<OrgChartTemplateProps> = ({
  title = 'Organizational chart',
  chartData = [
    { id: 'ceo', title: 'CEO', level: 0 },
    { id: 'cto', title: 'CTO', level: 1, parentId: 'ceo' },
    { id: 'cfo', title: 'CFO', level: 1, parentId: 'ceo' },
    { id: 'cmo', title: 'CMO', level: 1, parentId: 'ceo' },
    { id: 'dev_lead', title: 'Dev Lead', level: 2, parentId: 'cto' },
    { id: 'qa_lead', title: 'QA Lead', level: 2, parentId: 'cto' },
    { id: 'finance_manager', title: 'Finance Manager', level: 2, parentId: 'cfo' },
    { id: 'hr_manager', title: 'HR Manager', level: 2, parentId: 'cfo' },
    { id: 'marketing_lead', title: 'Marketing Lead', level: 2, parentId: 'cmo' },
    { id: 'sales_lead', title: 'Sales Lead', level: 2, parentId: 'cmo' },
    { id: 'senior_dev', title: 'Senior Dev', level: 3, parentId: 'dev_lead' },
    { id: 'junior_dev', title: 'Junior Dev', level: 3, parentId: 'dev_lead' }
  ],
  titleColor,
  textColor,
  backgroundColor,
  slideId,
  theme,
  isEditable = false,
  onUpdate
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const tColor = titleColor || currentTheme.colors.titleColor;
  const txtColor = textColor || currentTheme.colors.contentColor;
  const bgColor = backgroundColor || currentTheme.colors.backgroundColor;

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingChartData, setEditingChartData] = useState<{ [key: string]: boolean }>({});

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) onUpdate({ title: newTitle });
    setEditingTitle(false);
  };

  const handleTitleCancel = () => setEditingTitle(false);

  const handleChartDataSave = (id: string, value: string) => {
    if (onUpdate) {
      const updatedChartData = chartData.map(item => item.id === id ? { ...item, title: value } : item);
      onUpdate({ chartData: updatedChartData });
    }
    setEditingChartData(prev => ({ ...prev, [id]: false }));
  };

  const handleChartDataCancel = (id: string) => setEditingChartData(prev => ({ ...prev, [id]: false }));

  const handleChartDataEdit = (id: string) => {
    if (isEditable) setEditingChartData(prev => ({ ...prev, [id]: true }));
  };

  const getChildren = (parentId: string) => chartData.filter(item => item.parentId === parentId);
  const getRootNodes = () => chartData.filter(item => !item.parentId);

  const renderNode = (node: ChartNode, level: number) => {
    const children = getChildren(node.id);
    const hasChildren = children.length > 0;
    
    // Different styles for different levels
    const getNodeStyle = (level: number) => {
      const baseStyle = {
        padding: '12px 20px',
        margin: '8px',
        borderRadius: '12px',
        cursor: isEditable ? 'pointer' : 'default',
        textAlign: 'center',
        zIndex: 1,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
      };

      switch (level) {
        case 0: // CEO
          return {
            ...baseStyle,
            backgroundColor: 'rgba(255, 215, 0, 0.2)',
            border: `3px solid ${txtColor}`,
            minWidth: '180px',
            transform: 'scale(1.1)',
          };
        case 1: // C-level
          return {
            ...baseStyle,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            border: `2px solid ${txtColor}`,
            minWidth: '160px',
            transform: 'scale(1.05)',
          };
        case 2: // Managers
          return {
            ...baseStyle,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: `2px solid ${txtColor}`,
            minWidth: '140px',
          };
        default: // Employees
          return {
            ...baseStyle,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${txtColor}`,
            minWidth: '120px',
            transform: 'scale(0.95)',
          };
      }
    };

    const getFontSize = (level: number) => {
      switch (level) {
        case 0: return '18px';
        case 1: return '16px';
        case 2: return '14px';
        default: return '12px';
      }
    };

    return (
      <div key={node.id} style={{ 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        margin: level === 0 ? '0' : '10px'
      }}>
        <div
          style={getNodeStyle(level)}
          onClick={() => handleChartDataEdit(node.id)}
        >
          {isEditable && editingChartData[node.id] ? (
            <InlineEditor
              initialValue={node.title}
              onSave={(value) => handleChartDataSave(node.id, value)}
              onCancel={() => handleChartDataCancel(node.id)}
              multiline={false}
              placeholder="Enter title..."
              style={{
                fontSize: getFontSize(level),
                color: txtColor,
                fontFamily: currentTheme.fonts.contentFont,
                textAlign: 'center',
                fontWeight: level === 0 ? '700' : '600',
              }}
            />
          ) : (
            <div
              style={{
                fontSize: getFontSize(level),
                color: txtColor,
                fontFamily: currentTheme.fonts.contentFont,
                fontWeight: level === 0 ? '700' : '600',
              }}
            >
              {node.title || (isEditable ? 'Click to add title' : '')}
            </div>
          )}
        </div>

        {hasChildren && (
          <div style={{ 
            paddingTop: '30px', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}>
            {/* Curved connection lines */}
            <div style={{ 
              position: 'relative', 
              height: '30px',
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  width: '3px',
                  height: '30px',
                  backgroundColor: txtColor,
                  transform: 'translateX(-50%)',
                  zIndex: 0,
                  borderRadius: '2px',
                }}
              />
            </div>

            {/* Children container with curved connections */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'flex-start',
                position: 'relative',
                width: '100%',
                maxWidth: `${Math.max(children.length * 180, 600)}px`,
                minWidth: '600px',
              }}
            >
              {/* Curved horizontal line */}
              <svg
                style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '0',
                  width: '100%',
                  height: '60px',
                  zIndex: 0,
                }}
                viewBox={`0 0 ${Math.max(children.length * 180, 600)} 60`}
              >
                <path
                  d={`M 0 30 Q ${Math.max(children.length * 180, 600) / 4} 0, ${Math.max(children.length * 180, 600) / 2} 30 Q ${(Math.max(children.length * 180, 600) * 3) / 4} 60, ${Math.max(children.length * 180, 600)} 30`}
                  stroke={txtColor}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              
              {children.map((child, index) => (
                <div key={child.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  position: 'relative', 
                  flex: 1,
                  margin: '0 15px'
                }}>
                  {/* Vertical line from curve to child */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-30px',
                      left: '50%',
                      width: '2px',
                      height: '30px',
                      backgroundColor: txtColor,
                      transform: 'translateX(-50%)',
                      zIndex: 1,
                      borderRadius: '1px',
                    }}
                  />
                  {renderNode(child, level + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ 
      background: bgColor, 
      minHeight: 600, 
      padding: '40px', 
      boxSizing: 'border-box',
      fontFamily: currentTheme.fonts.contentFont
    }}>
             <div style={{ marginBottom: '50px', textAlign: 'center' }}>
         {isEditable && editingTitle ? (
           <InlineEditor
             initialValue={title}
             onSave={handleTitleSave}
             onCancel={handleTitleCancel}
             multiline={false}
             placeholder="Enter title..."
             style={{
               fontWeight: 700,
               fontSize: currentTheme.fonts.titleSize,
               color: tColor,
               textAlign: 'center',
               width: '100%',
               fontFamily: currentTheme.fonts.titleFont
             }}
           />
         ) : (
           <div
             style={{
               fontWeight: 700,
               fontSize: currentTheme.fonts.titleSize,
               color: tColor,
               textAlign: 'center',
               cursor: isEditable ? 'pointer' : 'default',
               fontFamily: currentTheme.fonts.titleFont
             }}
             onClick={() => isEditable && setEditingTitle(true)}
           >
             {title || (isEditable ? 'Click to add title' : '')}
           </div>
         )}
       </div>

       <div style={{ 
         display: 'flex', 
         justifyContent: 'center',
         alignItems: 'center',
         flex: 1,
         padding: '20px 0'
       }}>
         {getRootNodes().map(rootNode => renderNode(rootNode, 0))}
       </div>
    </div>
  );
};

export default OrgChartTemplate;