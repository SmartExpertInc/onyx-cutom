import React, { useState, useRef, useEffect } from 'react';
import { EventListTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

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

const EventListTemplate: React.FC<EventListTemplateProps & {
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
  getPlaceholderGenerationState?: (elementId: string) => { isGenerating: boolean; hasImage: boolean; error?: string };
}> = ({
  title,
  presenter,
  subject,
  events = [],
  isEditable = false,
  onUpdate,
  titleColor,
  descriptionColor,
  backgroundColor,
  slideId,
  theme,
  imagePrompt,
  imageAlt,
  imagePath,
  widthPx,
  heightPx,
  imageScale,
  imageOffset,
  objectFit,
  getPlaceholderGenerationState
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);

  // Inline editing state for title and presenter info
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingPresenter, setEditingPresenter] = useState(false);
  const [editingSubject, setEditingSubject] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<'date' | 'description' | null>(null);

  // Refs for MoveableManager integration
  const titleRef = useRef<HTMLDivElement>(null);
  const presenterRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const handleEventChange = (idx: number, key: 'date' | 'description', value: string) => {
    if (!onUpdate) return;
    const updated = events.map((ev, i) => i === idx ? { ...ev, [key]: value } : ev);
    onUpdate({ events: updated });
    setEditingIdx(null);
    setEditingField(null);
  };

  const handleEditStart = (idx: number, field: 'date' | 'description') => {
    if (!isEditable) return;
    setEditingIdx(idx);
    setEditingField(field);
  };

  const handleEditCancel = () => {
    setEditingIdx(null);
    setEditingField(null);
    setEditingTitle(false);
    setEditingPresenter(false);
    setEditingSubject(false);
  };

  // Handle title editing
  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handlePresenterSave = (newPresenter: string) => {
    if (onUpdate) {
      onUpdate({ presenter: newPresenter });
    }
    setEditingPresenter(false);
  };

  const handleSubjectSave = (newSubject: string) => {
    if (onUpdate) {
      onUpdate({ subject: newSubject });
    }
    setEditingSubject(false);
  };

  // Handle image upload
  const handleImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ imagePath: newImagePath });
    }
  };

  // Handle size and transform changes for the placeholder
  const handleSizeTransformChange = (payload: any) => {
    if (onUpdate) {
      const updateData: any = {};
      
      if (payload.imagePosition) {
        updateData.imageOffset = payload.imagePosition;
      }
      
      if (payload.imageSize) {
        updateData.widthPx = payload.imageSize.width;
        updateData.heightPx = payload.imageSize.height;
      }
      
      if (payload.objectFit) {
        updateData.objectFit = payload.objectFit;
      }
      
      onUpdate(updateData);
    }
  };

  // AI prompt logic
  const displayPrompt = imagePrompt || imageAlt || 'timeline illustration for research stages';

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    background: currentTheme.colors.backgroundColor,
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont,
    overflow: 'hidden'
  };

  // Left side with title and presenter info (blue background)
  const leftSectionStyles: React.CSSProperties = {
    width: '33%',
    height: '600px',
    position: 'absolute',
    left: '0',
    top: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    background: '#1e3a8a', // Blue background matching the screenshot
    padding: '60px 40px',
    zIndex: 2
  };

  // Right side with timeline (uses rightSectionBackgroundColor from theme or falls back to white)
  const rightSectionStyles: React.CSSProperties = {
    width: '67%',
    height: '600px',
    position: 'absolute',
    right: '0',
    top: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: currentTheme.colors.rightSectionBackgroundColor || '#ffffff',
    padding: '40px',
    zIndex: 1
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '2.5rem',
    fontFamily: currentTheme.fonts.titleFont,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: '40px',
    wordWrap: 'break-word',
    lineHeight: '1.1'
  };

  const presenterStyles: React.CSSProperties = {
    fontSize: '1.1rem',
    color: '#ffffff',
    marginBottom: '8px',
    fontFamily: currentTheme.fonts.contentFont,
    wordWrap: 'break-word',
    lineHeight: '1.4'
  };

  const subjectStyles: React.CSSProperties = {
    fontSize: '1.1rem',
    color: '#ffffff',
    fontFamily: currentTheme.fonts.contentFont,
    wordWrap: 'break-word',
    lineHeight: '1.4'
  };

  const stepTitleStyles: React.CSSProperties = {
    fontWeight: 700,
    fontSize: '1.1rem',
    color: currentTheme.colors.titleColor,
    textAlign: 'center',
    marginBottom: '8px',
    fontFamily: currentTheme.fonts.titleFont,
    wordWrap: 'break-word',
    lineHeight: '1.2'
  };

  const stepDescriptionStyles: React.CSSProperties = {
    fontWeight: 400,
    fontSize: '0.9rem',
    color: currentTheme.colors.contentColor,
    fontFamily: currentTheme.fonts.contentFont,
    textAlign: 'center',
    wordWrap: 'break-word',
    lineHeight: '1.4'
  };

  return (
    <div ref={slideContainerRef} className="event-list-template" style={slideStyles}>
      {/* Left section with title and presenter info (blue background) */}
      <div style={leftSectionStyles}>
        {/* Title */}
        <div 
          ref={titleRef}
          data-moveable-element={`${slideId}-title`}
          data-draggable="true"
        >
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={title || 'Add title'}
              onSave={handleTitleSave}
              onCancel={handleEditCancel}
              multiline={true}
              placeholder="Enter slide title..."
              className="inline-editor-title"
              style={{
                ...titleStyles,
                padding: '0',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block'
              }}
            />
          ) : (
            <h1 
              style={titleStyles}
              onClick={(e) => {
                if (e.currentTarget.getAttribute('data-just-dragged') === 'true') {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (isEditable) {
                  setEditingTitle(true);
                }
              }}
              className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {title || 'Add title'}
            </h1>
          )}
        </div>

        {/* Presenter */}
        <div 
          ref={presenterRef}
          data-moveable-element={`${slideId}-presenter`}
          data-draggable="true"
        >
          {isEditable && editingPresenter ? (
            <InlineEditor
              initialValue={presenter || 'Add presenter name'}
              onSave={handlePresenterSave}
              onCancel={handleEditCancel}
              multiline={false}
              placeholder="Enter presenter name..."
              className="inline-editor-presenter"
              style={{
                ...presenterStyles,
                padding: '0',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block'
              }}
            />
          ) : (
            <div 
              style={presenterStyles}
              onClick={(e) => {
                if (e.currentTarget.getAttribute('data-just-dragged') === 'true') {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (isEditable) {
                  setEditingPresenter(true);
                }
              }}
              className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {presenter || 'Add presenter name'}
            </div>
          )}
        </div>

        {/* Subject */}
        <div 
          ref={subjectRef}
          data-moveable-element={`${slideId}-subject`}
          data-draggable="true"
        >
          {isEditable && editingSubject ? (
            <InlineEditor
              initialValue={subject || 'Add subject'}
              onSave={handleSubjectSave}
              onCancel={handleEditCancel}
              multiline={false}
              placeholder="Enter subject..."
              className="inline-editor-subject"
              style={{
                ...subjectStyles,
                padding: '0',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block'
              }}
            />
          ) : (
            <div 
              style={subjectStyles}
              onClick={(e) => {
                if (e.currentTarget.getAttribute('data-just-dragged') === 'true') {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (isEditable) {
                  setEditingSubject(true);
                }
              }}
              className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {subject || 'Add subject'}
            </div>
          )}
        </div>
      </div>

      {/* Right section with timeline */}
      <div style={rightSectionStyles}>
        {/* Timeline */}
        <div 
          ref={timelineRef}
          data-moveable-element={`${slideId}-timeline`}
          data-draggable="true"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '600px',
            position: 'relative',
            padding: '60px 0'
          }}
        >
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            top: '80px',
            left: '80px',
            right: '80px',
            height: '2px',
            backgroundColor: '#1e3a8a',
            zIndex: 1
          }} />

          {/* Timeline steps */}
          {events.slice(0, 3).map((event, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              position: 'relative',
              zIndex: 2,
              minHeight: '120px'
            }}>
              {/* Timeline node */}
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#1e3a8a',
                border: '3px solid #ffffff',
                marginBottom: '20px',
                position: 'relative',
                flexShrink: 0
              }} />

              {/* Step title */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                minHeight: '60px',
                justifyContent: 'flex-start'
              }}>
                {isEditable && editingIdx === idx && editingField === 'date' ? (
                  <InlineEditor
                    initialValue={event.date}
                    onSave={val => handleEventChange(idx, 'date', val)}
                    onCancel={handleEditCancel}
                    multiline={false}
                    placeholder="Enter step title..."
                    className="inline-editor-step-title"
                    style={{
                      ...stepTitleStyles,
                      padding: '0',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      overflow: 'hidden',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      boxSizing: 'border-box',
                      display: 'block',
                      width: '100%'
                    }}
                  />
                ) : (
                  <div
                    style={{ 
                      ...stepTitleStyles,
                      cursor: isEditable ? 'pointer' : 'default',
                      width: '100%'
                    }}
                    onClick={() => handleEditStart(idx, 'date')}
                    className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                  >
                    {event.date || 'Add step title'}
                  </div>
                )}
                
                {/* Step description */}
                {isEditable && editingIdx === idx && editingField === 'description' ? (
                  <InlineEditor
                    initialValue={event.description}
                    onSave={val => handleEventChange(idx, 'description', val)}
                    onCancel={handleEditCancel}
                    multiline={false}
                    placeholder="Enter step description..."
                    className="inline-editor-step-description"
                    style={{
                      ...stepDescriptionStyles,
                      padding: '0',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      overflow: 'hidden',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      boxSizing: 'border-box',
                      display: 'block',
                      width: '100%'
                    }}
                  />
                ) : (
                  <div
                    style={{ 
                      ...stepDescriptionStyles,
                      cursor: isEditable ? 'pointer' : 'default',
                      width: '100%'
                    }}
                    onClick={() => handleEditStart(idx, 'description')}
                    className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                  >
                    {event.description || 'Add step description'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventListTemplate;