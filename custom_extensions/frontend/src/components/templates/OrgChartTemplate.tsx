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
    { id: 'teamleader1-1', title: 'Team Leader 1', level: 2, parentId: 'manager1' },
    { id: 'teamleader1-2', title: 'Team Leader 2', level: 2, parentId: 'manager1' },
    { id: 'teamleader2-1', title: 'Team Leader 1', level: 2, parentId: 'manager2' },
    { id: 'teamleader2-2', title: 'Team Leader 2', level: 2, parentId: 'manager2' },
    { id: 'employee1-1', title: 'Employee 1', level: 3, parentId: 'teamleader1-1' },
    { id: 'employee1-2', title: 'Employee 2', level: 3, parentId: 'teamleader1-1' },
    { id: 'employee2-1', title: 'Employee 3', level: 3, parentId: 'teamleader2-1' },
    { id: 'employee2-2', title: 'Employee 4', level: 3, parentId: 'teamleader2-1' },
    { id: 'employee3-1', title: 'Employee 5', level: 3, parentId: 'teamleader2-2' }
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

  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingChartData, setEditingChartData] = useState<{ [key: string]: boolean }>({});

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleChartDataSave = (id: string, value: string) => {
    if (onUpdate) {
      const updatedChartData = chartData.map(item => 
        item.id === id ? { ...item, title: value } : item
      );
      onUpdate({ chartData: updatedChartData });
    }
    setEditingChartData(prev => ({ ...prev, [id]: false }));
  };

  const handleChartDataCancel = (id: string) => {
    setEditingChartData(prev => ({ ...prev, [id]: false }));
  };

  const handleChartDataEdit = (id: string) => {
    if (!isEditable) return;
    setEditingChartData(prev => ({ ...prev, [id]: true }));
  };

  // Helper function to get children of a node
  const getChildren = (parentId: string) => {
    return chartData.filter(item => item.parentId === parentId);
  };

  // Helper function to get root nodes
  const getRootNodes = () => {
    return chartData.filter(item => !item.parentId);
  };

  // Render a node and its children
  const renderNode = (node: ChartNode, level: number) => {
    const children = getChildren(node.id);
    const hasChildren = children.length > 0;
  
    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        {/* Node */}
        <div
          style={{
            padding: '8px 16px',
            margin: '4px',
            borderRadius: '4px',
            backgroundColor: bgColor,
            border: `2px solid ${txtColor}`,
            cursor: isEditable ? 'pointer' : 'default',
            minWidth: '120px',
            textAlign: 'center',
            zIndex: 1,
          }}
          onClick={() => handleChartDataEdit(node.id)}
          className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
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
              }}
            />
          ) : (
            <div
              style={{
                fontSize: currentTheme.fonts.contentSize,
                color: txtColor,
                fontFamily: currentTheme.fonts.contentFont,
                fontWeight: 500,
              }}
            >
              {node.title || (isEditable ? 'Click to add title' : '')}
            </div>
          )}
        </div>
  
        {hasChildren && (
          <div style={{ position: 'relative', paddingTop: '40px', width: '100%' }}>
            {/* Вертикальная линия от родителя вниз */}
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
              }}
            />
  
            {/* Горизонтальная линия, соединяющая всех детей */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '10%',
                right: '10%',
                height: '2px',
                backgroundColor: txtColor,
                zIndex: 0,
              }}
            />
  
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                marginTop: '20px',
                position: 'relative',
                width: '100%',
              }}
            >
              {children.map((child) => (
                <div key={child.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  {/* Вертикальная линия от горизонтали вниз к ребёнку */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      height: '20px',
                      width: '2px',
                      backgroundColor: txtColor,
                      zIndex: 0,
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
    <div
      style={{
        background: bgColor,
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: currentTheme.fonts.contentFont,
        position: 'relative',
        padding: '40px',
        boxSizing: 'border-box'
      }}
    >
      {/* Title Section */}
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
            className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
          >
            {title || (isEditable ? 'Click to add title' : '')}
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '20px'
      }}>
        {getRootNodes().map(rootNode => renderNode(rootNode, 0))}
      </div>
    </div>
  );
};

export default OrgChartTemplate; 