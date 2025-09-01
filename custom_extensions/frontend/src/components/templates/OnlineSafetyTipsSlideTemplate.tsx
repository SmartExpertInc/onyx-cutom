// custom_extensions/frontend/src/components/templates/OnlineSafetyTipsSlideTemplate.tsx

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

export const OnlineSafetyTipsSlideTemplate: React.FC<TitleSlideProps & { 
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
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingTip1, setEditingTip1] = useState(false);
  const [editingTip2, setEditingTip2] = useState(false);
  const [editingTip3, setEditingTip3] = useState(false);
  const [editingTip4, setEditingTip4] = useState(false);
  const [editingDesc1, setEditingDesc1] = useState(false);
  const [editingDesc2, setEditingDesc2] = useState(false);
  const [editingDesc3, setEditingDesc3] = useState(false);
  const [editingDesc4, setEditingDesc4] = useState(false);
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
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  };

  const rightColumnStyles: React.CSSProperties = {
    flex: '1',
    backgroundColor: '#000000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '48px',
    fontFamily: 'Inter, sans-serif',
    color: '#000000',
    textAlign: 'left',
    marginBottom: '40px',
    lineHeight: 1.2,
    maxWidth: '100%',
    fontWeight: '700'
  };

  const tipGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    width: '100%'
  };

  const tipStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const tipNumberStyles: React.CSSProperties = {
    fontSize: '32px',
    fontFamily: 'Inter, sans-serif',
    color: '#8B5CF6',
    fontWeight: '700',
    marginBottom: '8px'
  };

  const tipTitleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontFamily: 'Inter, sans-serif',
    color: '#000000',
    fontWeight: '700',
    marginBottom: '8px',
    lineHeight: 1.3
  };

  const tipDescriptionStyles: React.CSSProperties = {
    fontSize: '16px',
    fontFamily: 'Inter, sans-serif',
    color: '#6B7280',
    lineHeight: 1.6,
    maxWidth: '100%'
  };

  const avatarStyles: React.CSSProperties = {
    width: '300px',
    height: '400px',
    objectFit: 'cover',
    borderRadius: '0'
  };

  // Default content based on the image
  const defaultTitle = "4 tips to stay safe online";
  const defaultTips = [
    {
      title: "Know the scams",
      description: "Read articles and blogs, follow the news, and share this so you can learn about different kinds of scams and what you can do to avoid them."
    },
    {
      title: "Don't click",
      description: "These phishing emails have links that lead to websites that can lure you into giving personal information or download malware to your computer"
    },
    {
      title: "Shop safely",
      description: "Don't shop on a site unless it has the \"https\". Also, protect yourself and use a credit card instead of a debit card while shopping online"
    },
    {
      title: "Passwords",
      description: "Do away with the \"Fitguy1982\" password and use an extremely uncrackable one like 9&4yiw2pyqx#. Phrases are good too."
    }
  ];

  const handleUpdate = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate({ [field]: value });
    }
  };

  return (
    <div style={slideStyles}>
      {/* Left Column - Content */}
      <div style={leftColumnStyles}>
        {/* Title */}
        <div style={titleStyles}>
          {isEditable ? (
            editingTitle ? (
              <InlineEditor
                initialValue={title || defaultTitle}
                onSave={(value) => {
                  handleUpdate('title', value);
                  setEditingTitle(false);
                }}
                onCancel={() => setEditingTitle(false)}
                style={titleStyles}
              />
            ) : (
              <div onClick={() => setEditingTitle(true)} style={{ cursor: 'pointer' }}>
                {title || defaultTitle}
              </div>
            )
          ) : (
            title || defaultTitle
          )}
        </div>

        {/* Tips Grid */}
        <div style={tipGridStyles}>
          {defaultTips.map((tip, index) => (
            <div key={index} style={tipStyles}>
              {/* Tip Number */}
              <div style={tipNumberStyles}>
                {index + 1}
              </div>
              
                             {/* Tip Title */}
               <div style={tipTitleStyles}>
                 {isEditable ? (
                   (() => {
                     let editingState = false;
                     let setEditingState: React.Dispatch<React.SetStateAction<boolean>> = () => {};
                     
                     switch(index) {
                       case 0: editingState = editingTip1; setEditingState = setEditingTip1; break;
                       case 1: editingState = editingTip2; setEditingState = setEditingTip2; break;
                       case 2: editingState = editingTip3; setEditingState = setEditingTip3; break;
                       case 3: editingState = editingTip4; setEditingState = setEditingTip4; break;
                     }
                     
                     return editingState ? (
                       <InlineEditor
                         initialValue={tip.title}
                         onSave={(value) => {
                           handleUpdate(`tip${index + 1}Title`, value);
                           setEditingState(false);
                         }}
                         onCancel={() => setEditingState(false)}
                         style={tipTitleStyles}
                       />
                     ) : (
                       <div onClick={() => setEditingState(true)} style={{ cursor: 'pointer' }}>
                         {tip.title}
                       </div>
                     );
                   })()
                 ) : (
                   tip.title
                 )}
               </div>
               
               {/* Tip Description */}
               <div style={tipDescriptionStyles}>
                 {isEditable ? (
                   (() => {
                     let editingState = false;
                     let setEditingState: React.Dispatch<React.SetStateAction<boolean>> = () => {};
                     
                     switch(index) {
                       case 0: editingState = editingDesc1; setEditingState = setEditingDesc1; break;
                       case 1: editingState = editingDesc2; setEditingState = setEditingDesc2; break;
                       case 2: editingState = editingDesc3; setEditingState = setEditingDesc3; break;
                       case 3: editingState = editingDesc4; setEditingState = setEditingDesc4; break;
                     }
                     
                     return editingState ? (
                       <InlineEditor
                         initialValue={tip.description}
                         onSave={(value) => {
                           handleUpdate(`tip${index + 1}Description`, value);
                           setEditingState(false);
                         }}
                         onCancel={() => setEditingState(false)}
                         multiline={true}
                         style={tipDescriptionStyles}
                       />
                     ) : (
                       <div onClick={() => setEditingState(true)} style={{ cursor: 'pointer' }}>
                         {tip.description}
                       </div>
                     );
                   })()
                 ) : (
                   tip.description
                 )}
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - Avatar */}
      <div style={rightColumnStyles}>
        <img
          src="/api/placeholder/300/400/000000/FFFFFF?text=Avatar"
          alt="Professional avatar"
          style={avatarStyles}
        />
      </div>
    </div>
  );
}; 