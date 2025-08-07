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
    { id: 'manager1', title: 'Manager 1', level: 1, parentId: 'ceo' },
    { id: 'manager2', title: 'Manager 2', level: 1, parentId: 'ceo' },
    { id: 'teamleader1_1', title: 'Team Leader 1', level: 2, parentId: 'manager1' },
    { id: 'teamleader2_1', title: 'Team Leader 2', level: 2, parentId: 'manager1' },
    { id: 'teamleader1_2', title: 'Team Leader 1', level: 2, parentId: 'manager2' },
    { id: 'teamleader2_2', title: 'Team Leader 2', level: 2, parentId: 'manager2' },
    { id: 'employee1', title: 'Employee 1', level: 3, parentId: 'teamleader1_1' },
    { id: 'employee2', title: 'Employee 2', level: 3, parentId: 'teamleader1_1' },
    { id: 'employee3', title: 'Employee 3', level: 3, parentId: 'teamleader1_2' },
    { id: 'employee4', title: 'Employee 4', level: 3, parentId: 'teamleader1_2' },
    { id: 'employee5', title: 'Employee 5', level: 3, parentId: 'teamleader2_2' }
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

    return (
      <div key={node.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            padding: '12px 20px',
            margin: '8px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: `2px solid ${txtColor}`,
            cursor: isEditable ? 'pointer' : 'default',
            minWidth: '140px',
            textAlign: 'center',
            zIndex: 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
          }}
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
                fontSize: currentTheme.fonts.contentSize,
                color: txtColor,
                fontFamily: currentTheme.fonts.contentFont,
                textAlign: 'center',
                fontWeight: '600',
              }}
            />
          ) : (
            <div
              style={{
                fontSize: currentTheme.fonts.contentSize,
                color: txtColor,
                fontFamily: currentTheme.fonts.contentFont,
                fontWeight: '600',
              }}
            >
              {node.title || (isEditable ? 'Click to add title' : '')}
            </div>
          )}
        </div>

        {hasChildren && (
          <div style={{ paddingTop: '20px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Vertical line from parent to horizontal line */}
            <div style={{ position: 'relative', height: '20px' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  width: '2px',
                  height: '20px',
                  backgroundColor: txtColor,
                  transform: 'translateX(-50%)',
                  zIndex: 0,
                  borderRadius: '1px',
                }}
              />
            </div>

            {/* Horizontal line connecting children */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'flex-start',
                position: 'relative',
                marginTop: '20px',
                width: `${Math.max(children.length * 200, 400)}px`,
                minWidth: '400px',
              }}
            >
              {/* Horizontal line */}
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '0',
                  right: '0',
                  height: '2px',
                  backgroundColor: txtColor,
                  zIndex: 0,
                  borderRadius: '1px',
                }}
              />
              
              {children.map((child, index) => (
                <div key={child.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  position: 'relative', 
                  flex: 1,
                  margin: '0 10px'
                }}>
                  {/* Vertical line from horizontal to child */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      width: '2px',
                      height: '20px',
                      backgroundColor: txtColor,
                      transform: 'translateX(-50%)',
                      zIndex: 0,
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
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        {isEditable && editingTitle ? (
          <InlineEditor
            initialValue={title}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            multiline={false}
            placeholder="Enter title..."
            style={{
              fontWeight: 700,
              fontSize: '24px',
              color: '#333',
              textAlign: 'center',
              width: '100%',
              fontFamily: 'Arial, sans-serif'
            }}
          />
        ) : (
          <div
            style={{
              fontWeight: 700,
              fontSize: '24px',
              color: '#333',
              textAlign: 'center',
              cursor: isEditable ? 'pointer' : 'default',
              fontFamily: 'Arial, sans-serif'
            }}
            onClick={() => isEditable && setEditingTitle(true)}
          >
            {title || (isEditable ? 'Click to add title' : '')}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {getRootNodes().map(rootNode => renderNode(rootNode, 0))}
      </div>
    </div>
  );
};

export default OrgChartTemplate;