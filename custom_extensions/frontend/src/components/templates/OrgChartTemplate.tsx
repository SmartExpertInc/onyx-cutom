import React, { useState, useRef, useEffect } from 'react';
import { OrgChartTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

interface ChartNode {
  id: string;
  title: string;
  level: number;
  parentId?: string;
  role?: string;
  department?: string;
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
  title = 'Космическая галактика команд',
  chartData = [
    { id: 'ceo', title: 'CEO', level: 0, role: 'Галактический лидер', department: 'Центральная звезда' },
    { id: 'cto', title: 'CTO', level: 1, parentId: 'ceo', role: 'Технологический визионер', department: 'Планета Инноваций' },
    { id: 'cfo', title: 'CFO', level: 1, parentId: 'ceo', role: 'Финансовый стратег', department: 'Планета Экономики' },
    { id: 'cmo', title: 'CMO', level: 1, parentId: 'ceo', role: 'Маркетинговый маг', department: 'Планета Креатива' },
    { id: 'dev_lead', title: 'Dev Lead', level: 2, parentId: 'cto', role: 'Архитектор кода', department: 'Спутник Разработки' },
    { id: 'qa_lead', title: 'QA Lead', level: 2, parentId: 'cto', role: 'Защитник качества', department: 'Спутник Тестирования' },
    { id: 'finance_manager', title: 'Finance Manager', level: 2, parentId: 'cfo', role: 'Хранитель бюджета', department: 'Спутник Финансов' },
    { id: 'hr_manager', title: 'HR Manager', level: 2, parentId: 'cfo', role: 'Талисман команды', department: 'Спутник HR' },
    { id: 'marketing_lead', title: 'Marketing Lead', level: 2, parentId: 'cmo', role: 'Мастер брендинга', department: 'Спутник Маркетинга' },
    { id: 'sales_lead', title: 'Sales Lead', level: 2, parentId: 'cmo', role: 'Охотник за клиентами', department: 'Спутник Продаж' },
    { id: 'senior_dev', title: 'Senior Dev', level: 3, parentId: 'dev_lead', role: 'Ветеран кодинга', department: 'Орбитальный путь' },
    { id: 'junior_dev', title: 'Junior Dev', level: 3, parentId: 'dev_lead', role: 'Новичок галактики', department: 'Орбитальный путь' }
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

  // Космические стили для разных уровней
  const getPlanetStyle = (level: number): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '20px 30px',
      margin: '12px',
      borderRadius: '50%',
      cursor: isEditable ? 'pointer' : 'default',
      textAlign: 'center' as const,
      zIndex: 1,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      minWidth: '180px',
      minHeight: '180px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    };

    switch (level) {
      case 0: // CEO - Центральная звезда
        return {
          ...baseStyle,
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.1) 70%, rgba(255, 215, 0, 0.05) 100%)',
          border: '3px solid rgba(255, 215, 0, 0.6)',
          boxShadow: '0 0 60px rgba(255, 215, 0, 0.4), inset 0 0 30px rgba(255, 215, 0, 0.2)',
          transform: 'scale(1.3)',
          minWidth: '220px',
          minHeight: '220px',
        };
      case 1: // C-level - Планеты
        return {
          ...baseStyle,
          background: 'radial-gradient(circle, rgba(100, 149, 237, 0.25) 0%, rgba(100, 149, 237, 0.1) 70%, rgba(100, 149, 237, 0.05) 100%)',
          border: '2px solid rgba(100, 149, 237, 0.5)',
          boxShadow: '0 0 40px rgba(100, 149, 237, 0.3), inset 0 0 20px rgba(100, 149, 237, 0.15)',
          transform: 'scale(1.15)',
          minWidth: '200px',
          minHeight: '200px',
        };
      case 2: // Managers - Спутники
        return {
          ...baseStyle,
          background: 'radial-gradient(circle, rgba(138, 43, 226, 0.2) 0%, rgba(138, 43, 226, 0.08) 70%, rgba(138, 43, 226, 0.04) 100%)',
          border: '2px solid rgba(138, 43, 226, 0.4)',
          boxShadow: '0 0 30px rgba(138, 43, 226, 0.25), inset 0 0 15px rgba(138, 43, 226, 0.1)',
          transform: 'scale(1.05)',
          minWidth: '160px',
          minHeight: '160px',
        };
      default: // Employees - Орбитальные объекты
        return {
          ...baseStyle,
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.06) 70%, rgba(255, 255, 255, 0.03) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.08)',
          transform: 'scale(0.95)',
          minWidth: '140px',
          minHeight: '140px',
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

  const getRoleFontSize = (level: number) => {
    switch (level) {
      case 0: return '14px';
      case 1: return '12px';
      case 2: return '11px';
      default: return '10px';
    }
  };

  const renderPlanet = (node: ChartNode, level: number) => {
    const children = getChildren(node.id);
    const hasChildren = children.length > 0;
    
    return (
      <div key={node.id} style={{ 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        margin: '8px'
      }}>
        {/* Планета */}
        <div
          style={getPlanetStyle(level)}
          onClick={() => handleChartDataEdit(node.id)}
        >
          {/* Космическая атмосфера */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
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
                fontWeight: '700',
                position: 'relative',
                zIndex: 2,
                marginBottom: '4px',
              }}
            />
          ) : (
            <div
              style={{
                fontSize: getFontSize(level),
                color: txtColor,
                fontFamily: currentTheme.fonts.contentFont,
                fontWeight: '700',
                position: 'relative',
                zIndex: 2,
                marginBottom: '4px',
              }}
            >
              {node.title || (isEditable ? 'Click to add title' : '')}
            </div>
          )}
          
          {/* Роль */}
          <div
            style={{
              fontSize: getRoleFontSize(level),
              color: txtColor,
              fontFamily: currentTheme.fonts.contentFont,
              fontWeight: '500',
              position: 'relative',
              zIndex: 2,
              opacity: 0.8,
              textAlign: 'center',
            }}
          >
            {node.role || 'Роль'}
          </div>
        </div>

        {hasChildren && (
          <div style={{ 
            paddingTop: '60px', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}>
            {/* Орбитальная дорожка */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '50%',
              width: '4px',
              height: '60px',
              background: `linear-gradient(to bottom, ${txtColor}, transparent)`,
              transform: 'translateX(-50%)',
              borderRadius: '2px',
              opacity: 0.6,
            }} />
            
            {/* Контейнер спутников */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                position: 'relative',
                width: '100%',
                maxWidth: `${Math.max(children.length * 240, 1000)}px`,
                gap: '40px',
                flexWrap: 'wrap',
                padding: '30px 0',
              }}
            >
              {/* Орбитальная линия между спутниками */}
              {children.length > 1 && (
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  left: '60px',
                  right: '60px',
                  height: '3px',
                  background: `linear-gradient(to right, transparent, ${txtColor}, transparent)`,
                  opacity: 0.4,
                  borderRadius: '2px',
                }} />
              )}
              
              {children.map((child, index) => (
                <div key={child.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  position: 'relative', 
                  flex: '0 1 auto',
                  minWidth: '200px',
                }}>
                  {/* Соединительная линия от орбиты к спутнику */}
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    left: '50%',
                    width: '3px',
                    height: '30px',
                    background: `linear-gradient(to bottom, ${txtColor}, transparent)`,
                    transform: 'translateX(-50%)',
                    borderRadius: '2px',
                    opacity: 0.6,
                  }} />
                  {renderPlanet(child, level + 1)}
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
      background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.8) 100%)`, 
      minHeight: 600, 
      padding: '40px', 
      boxSizing: 'border-box',
      fontFamily: currentTheme.fonts.contentFont,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Космический фон */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />
      
      <div style={{ marginBottom: '50px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
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
        minHeight: '500px',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1600px',
          position: 'relative',
        }}>
          {/* Космическая подсказка */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '14px',
            color: txtColor,
            opacity: 0.7,
            fontFamily: currentTheme.fonts.contentFont,
            fontWeight: '500',
            textAlign: 'center',
            zIndex: 1,
          }}>
            🌌 Космическая галактика команд 🌌
          </div>
          
          {getRootNodes().map(rootNode => renderPlanet(rootNode, 0))}
        </div>
      </div>
    </div>
  );
};

export default OrgChartTemplate;