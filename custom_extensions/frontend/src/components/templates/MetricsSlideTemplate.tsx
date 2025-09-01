// custom_extensions/frontend/src/components/templates/MetricsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { TitleSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';

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

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

  // Set initial height for textarea to match content
  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      // Set initial height based on content
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
          // Only override browser defaults, preserve all passed styles
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
        // Only override browser defaults, preserve all passed styles
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        boxSizing: 'border-box',
        display: 'block'
      }}
    />
  );
}

export const MetricsSlideTemplate: React.FC<TitleSlideProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  slideId,
  title,
  subtitle,
  author,
  date,
  backgroundImage,
  onUpdate,
  theme,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, subtitleColor } = currentTheme.colors;

  // Inline editing state
  const [editingMetric1, setEditingMetric1] = useState(false);
  const [editingMetric2, setEditingMetric2] = useState(false);
  const [editingMetric3, setEditingMetric3] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '600px',
    backgroundColor: '#ffffff',
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'row',
    padding: '0',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const leftColumnStyles: React.CSSProperties = {
    flex: '1',
    padding: '60px 80px',
    backgroundColor: '#134E4A',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '32px'
  };

  const rightColumnStyles: React.CSSProperties = {
    flex: '1',
    backgroundColor: '#EA580C',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: '0 0 32px 0'
  };

  const metricStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const arrowIconStyles: React.CSSProperties = {
    fontSize: '24px',
    color: '#ffffff',
    fontWeight: '600'
  };

  const metricTextStyles: React.CSSProperties = {
    fontSize: '20px',
    fontFamily: 'Inter, sans-serif',
    color: '#ffffff',
    lineHeight: 1.4,
    margin: '0'
  };

  const avatarStyles: React.CSSProperties = {
    width: '300px',
    height: '400px',
    objectFit: 'cover',
    borderRadius: '0 0 32px 0'
  };

  // Default content based on the image
  const defaultMetric1 = "300% increase in online visibility";
  const defaultMetric2 = "$5 for every $1 spent average ROI";
  const defaultMetric3 = "95% increase in customer loyalty";

  const handleUpdate = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate({ [field]: value });
    }
  };

  return (
    <div style={slideStyles}>
      {/* Left Column - Metrics */}
      <div style={leftColumnStyles}>
        {/* Metric 1 */}
        <div style={metricStyles}>
          <span style={arrowIconStyles}>↑</span>
          <div style={metricTextStyles}>
            {isEditable ? (
              editingMetric1 ? (
                <InlineEditor
                  initialValue={defaultMetric1}
                  onSave={(value) => {
                    handleUpdate('metric1', value);
                    setEditingMetric1(false);
                  }}
                  onCancel={() => setEditingMetric1(false)}
                  style={metricTextStyles}
                />
              ) : (
                <div onClick={() => setEditingMetric1(true)} style={{ ...metricTextStyles, cursor: 'pointer' }}>
                  {defaultMetric1}
                </div>
              )
            ) : (
              defaultMetric1
            )}
          </div>
        </div>

        {/* Metric 2 */}
        <div style={metricStyles}>
          <span style={arrowIconStyles}>↑</span>
          <div style={metricTextStyles}>
            {isEditable ? (
              editingMetric2 ? (
                <InlineEditor
                  initialValue={defaultMetric2}
                  onSave={(value) => {
                    handleUpdate('metric2', value);
                    setEditingMetric2(false);
                  }}
                  onCancel={() => setEditingMetric2(false)}
                  style={metricTextStyles}
                />
              ) : (
                <div onClick={() => setEditingMetric2(true)} style={{ ...metricTextStyles, cursor: 'pointer' }}>
                  {defaultMetric2}
                </div>
              )
            ) : (
              defaultMetric2
            )}
          </div>
        </div>

        {/* Metric 3 */}
        <div style={metricStyles}>
          <span style={arrowIconStyles}>↑</span>
          <div style={metricTextStyles}>
            {isEditable ? (
              editingMetric3 ? (
                <InlineEditor
                  initialValue={defaultMetric3}
                  onSave={(value) => {
                    handleUpdate('metric3', value);
                    setEditingMetric3(false);
                  }}
                  onCancel={() => setEditingMetric3(false)}
                  style={metricTextStyles}
                />
              ) : (
                <div onClick={() => setEditingMetric3(true)} style={{ ...metricTextStyles, cursor: 'pointer' }}>
                  {defaultMetric3}
                </div>
              )
            ) : (
              defaultMetric3
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Avatar */}
      <div style={rightColumnStyles}>
        <img
          src="/api/placeholder/300/400/EA580C/FFFFFF?text=Avatar"
          alt="Professional avatar"
          style={avatarStyles}
        />
      </div>
    </div>
  );
}; 