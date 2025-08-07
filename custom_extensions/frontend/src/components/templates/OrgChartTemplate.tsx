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
    
    // Modern design styles for different levels
    const getNodeStyle = (level: number): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        padding: '16px 24px',
        margin: '12px',
        borderRadius: '20px',
        cursor: isEditable ? 'pointer' : 'default',
        textAlign: 'center' as const,
        zIndex: 1,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      };

      // Add subtle gradient overlay
      const gradientOverlay = {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        borderRadius: '20px',
        pointerEvents: 'none' as const,
      };

      switch (level) {
        case 0: // CEO - Premium style
          return {
            ...baseStyle,
            backgroundColor: 'rgba(255, 215, 0, 0.15)',
            border: `2px solid rgba(255, 215, 0, 0.4)`,
            minWidth: '200px',
            transform: 'scale(1.15)',
            boxShadow: '0 12px 40px rgba(255, 215, 0, 0.2)',
          };
        case 1: // C-level - Executive style
          return {
            ...baseStyle,
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: `2px solid rgba(255, 255, 255, 0.3)`,
            minWidth: '180px',
            transform: 'scale(1.08)',
            boxShadow: '0 10px 36px rgba(0,0,0,0.15)',
          };
        case 2: // Managers - Professional style
          return {
            ...baseStyle,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: `1px solid rgba(255, 255, 255, 0.2)`,
            minWidth: '160px',
            transform: 'scale(1.02)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
          };
        default: // Employees - Clean style
          return {
            ...baseStyle,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: `1px solid rgba(255, 255, 255, 0.15)`,
            minWidth: '140px',
            transform: 'scale(0.98)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          };
      }
    };

    const getFontSize = (level: number) => {
      switch (level) {
        case 0: return '20px';
        case 1: return '18px';
        case 2: return '16px';
        default: return '14px';
      }
    };

    const getSpacing = (level: number) => {
      switch (level) {
        case 0: return '60px';
        case 1: return '50px';
        case 2: return '40px';
        default: return '30px';
      }
    };

    return (
      <div key={node.id} style={{ 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        margin: level === 0 ? '0' : '8px'
      }}>
        <div
          style={getNodeStyle(level)}
          onClick={() => handleChartDataEdit(node.id)}
        >
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            borderRadius: '20px',
            pointerEvents: 'none',
          }} />
          
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
                position: 'relative',
                zIndex: 2,
              }}
            />
          ) : (
            <div
              style={{
                fontSize: getFontSize(level),
                color: txtColor,
                fontFamily: currentTheme.fonts.contentFont,
                fontWeight: level === 0 ? '700' : '600',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {node.title || (isEditable ? 'Click to add title' : '')}
            </div>
          )}
        </div>

        {hasChildren && (
          <div style={{ 
            paddingTop: getSpacing(level), 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}>
            {/* Modern children container */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                position: 'relative',
                width: '100%',
                maxWidth: `${Math.max(children.length * 200, 800)}px`,
                gap: '20px',
                flexWrap: 'wrap',
              }}
            >
              {children.map((child, index) => (
                <div key={child.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  position: 'relative', 
                  flex: children.length <= 3 ? '0 1 auto' : '1',
                  minWidth: children.length <= 3 ? '180px' : '160px',
                }}>
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
          padding: '40px 0',
          minHeight: '500px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '1200px',
          }}>
            {getRootNodes().map(rootNode => renderNode(rootNode, 0))}
          </div>
        </div>
    </div>
  );
};

export default OrgChartTemplate;