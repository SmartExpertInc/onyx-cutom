import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import Image from 'next/image';
import contradImg from './contrad_img.png';

export interface ContraindicationsIndicationsTemplateProps {
  title?: string;
  subtitle?: string;
  theme?: string;
  isEditable?: boolean;
  slideId?: string;
  onUpdate?: (data: Partial<ContraindicationsIndicationsTemplateProps>) => void;
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

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        style={{
          ...style,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit',
          textAlign: 'inherit',
          lineHeight: 'inherit',
          width: '100%',
          minHeight: '60px'
        }}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      style={{
        ...style,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        color: 'inherit',
        textAlign: 'inherit',
        width: '100%'
      }}
    />
  );
}

const ContraindicationsIndicationsTemplate: React.FC<ContraindicationsIndicationsTemplateProps> = ({
  title = 'Contraindications and Indications',
  subtitle = 'Type The Subtitle Of Your Great Here',
  theme,
  isEditable = true,
  slideId = 'contraindications-indications',
  onUpdate
}: ContraindicationsIndicationsTemplateProps) => {
  const currentTheme = getSlideTheme(theme) || DEFAULT_SLIDE_THEME;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSubtitle, setCurrentSubtitle] = useState(subtitle);
  
  // Состояние для текстовых элементов
  const [leftProjectTitle, setLeftProjectTitle] = useState('The first project');
  const [rightProjectTitle, setRightProjectTitle] = useState('The second project');
  const [leftHeadings, setLeftHeadings] = useState(['Heading text goes here', 'Heading text goes here', 'Heading text goes here']);
  const [rightHeadings, setRightHeadings] = useState(['Heading text goes here', 'Heading text goes here', 'Heading text goes here']);
  const [leftDescriptions, setLeftDescriptions] = useState(['Lorem ipsum dolor sit amet, consectetur elit, sed do', 'Lorem ipsum dolor sit amet, consectetur elit, sed do', 'Lorem ipsum dolor sit amet, consectetur elit, sed do']);
  const [rightDescriptions, setRightDescriptions] = useState(['Lorem ipsum dolor sit amet, consectetur elit, sed do', 'Lorem ipsum dolor sit amet, consectetur elit, sed do', 'Lorem ipsum dolor sit amet, consectetur elit, sed do']);
  
  // Состояния редактирования
  const [editingLeftProject, setIsEditingLeftProject] = useState(false);
  const [editingRightProject, setIsEditingRightProject] = useState(false);
  const [editingLeftHeadings, setEditingLeftHeadings] = useState([false, false, false]);
  const [editingRightHeadings, setEditingRightHeadings] = useState([false, false, false]);
  const [editingLeftDescriptions, setEditingLeftDescriptions] = useState([false, false, false]);
  const [editingRightDescriptions, setEditingRightDescriptions] = useState([false, false, false]);
  
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const handleTitleSave = (value: string) => {
    setCurrentTitle(value);
    setIsEditingTitle(false);
    if (onUpdate) {
      onUpdate({ title: value });
    }
  };

  const handleSubtitleSave = (value: string) => {
    setCurrentSubtitle(value);
    setIsEditingSubtitle(false);
    if (onUpdate) {
      onUpdate({ subtitle: value });
    }
  };

  const handleLeftProjectSave = (value: string) => {
    setLeftProjectTitle(value);
    setIsEditingLeftProject(false);
  };

  const handleRightProjectSave = (value: string) => {
    setRightProjectTitle(value);
    setIsEditingRightProject(false);
  };

  const handleLeftHeadingSave = (index: number, value: string) => {
    const newHeadings = [...leftHeadings];
    newHeadings[index] = value;
    setLeftHeadings(newHeadings);
    const newEditingStates = [...editingLeftHeadings];
    newEditingStates[index] = false;
    setEditingLeftHeadings(newEditingStates);
  };

  const handleRightHeadingSave = (index: number, value: string) => {
    const newHeadings = [...rightHeadings];
    newHeadings[index] = value;
    setRightHeadings(newHeadings);
    const newEditingStates = [...editingRightHeadings];
    newEditingStates[index] = false;
    setEditingRightHeadings(newEditingStates);
  };

  const handleLeftDescriptionSave = (index: number, value: string) => {
    const newDescriptions = [...leftDescriptions];
    newDescriptions[index] = value;
    setLeftDescriptions(newDescriptions);
    const newEditingStates = [...editingLeftDescriptions];
    newEditingStates[index] = false;
    setEditingLeftDescriptions(newEditingStates);
  };

  const handleRightDescriptionSave = (index: number, value: string) => {
    const newDescriptions = [...rightDescriptions];
    newDescriptions[index] = value;
    setRightDescriptions(newDescriptions);
    const newEditingStates = [...editingRightDescriptions];
    newEditingStates[index] = false;
    setEditingRightDescriptions(newEditingStates);
  };

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: '#ffffff',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Georgia, serif',
    minHeight: '600px',
    position: 'relative',
    overflow: 'hidden'
  };

  const titleStyles: React.CSSProperties = {
    color: '#000000',
    fontSize: '2.5rem',
    fontFamily: 'Georgia, serif',
    marginBottom: '10px',
    textAlign: 'center',
    wordWrap: 'break-word',
    fontWeight: 'bold',
    flexShrink: 0
  };

  const subtitleStyles: React.CSSProperties = {
    color: '#000000',
    fontSize: '1.1rem',
    fontFamily: 'Arial, sans-serif',
    marginBottom: '40px',
    textAlign: 'center',
    wordWrap: 'break-word',
    fontWeight: 'normal',
    flexShrink: 0
  };

  const mainContentStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    position: 'relative',
    height: '400px',
    width: '100%'
  };

  const imageContainerStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  };

  return (
    <div style={slideStyles} ref={slideContainerRef}>
      {/* Title */}
      {isEditingTitle ? (
        <InlineEditor
          initialValue={currentTitle}
          onSave={handleTitleSave}
          onCancel={() => setIsEditingTitle(false)}
          placeholder="Enter title"
          style={titleStyles}
        />
      ) : (
        <h1
          style={titleStyles}
          onClick={() => isEditable && setIsEditingTitle(true)}
          data-draggable={isEditable}
        >
          {currentTitle}
        </h1>
      )}

      {/* Subtitle */}
      {isEditingSubtitle ? (
        <InlineEditor
          initialValue={currentSubtitle}
          onSave={handleSubtitleSave}
          onCancel={() => setIsEditingSubtitle(false)}
          placeholder="Enter subtitle"
          style={subtitleStyles}
        />
      ) : (
        <h2
          style={subtitleStyles}
          onClick={() => isEditable && setIsEditingSubtitle(true)}
          data-draggable={isEditable}
        >
          {currentSubtitle}
        </h2>
      )}

      {/* Main Content with Image */}
      <div style={mainContentStyles}>
        <div style={imageContainerStyles}>
          <Image src={contradImg} alt="Contraindications and Indications" style={{width: '100%', height: '100%'}} />
        </div>

        {/* Left Project Title */}
        <div style={{
          position: 'absolute',
          left: '15%',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10
        }}>
          {editingLeftProject ? (
            <InlineEditor
              initialValue={leftProjectTitle}
              onSave={handleLeftProjectSave}
              onCancel={() => setIsEditingLeftProject(false)}
              placeholder="Enter project title"
              style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.3)',
                padding: '10px',
                borderRadius: '8px',
                minWidth: '150px'
              }}
            />
          ) : (
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                textAlign: 'center',
                cursor: isEditable ? 'pointer' : 'default',
                background: 'rgba(0,0,0,0.3)',
                padding: '10px',
                borderRadius: '8px',
                minWidth: '150px'
              }}
              onClick={() => isEditable && setIsEditingLeftProject(true)}
              data-draggable={isEditable}
            >
              {leftProjectTitle}
            </div>
          )}
        </div>

        {/* Right Project Title */}
        <div style={{
          position: 'absolute',
          right: '15%',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10
        }}>
          {editingRightProject ? (
            <InlineEditor
              initialValue={rightProjectTitle}
              onSave={handleRightProjectSave}
              onCancel={() => setIsEditingRightProject(false)}
              placeholder="Enter project title"
              style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.3)',
                padding: '10px',
                borderRadius: '8px',
                minWidth: '150px'
              }}
            />
          ) : (
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                textAlign: 'center',
                cursor: isEditable ? 'pointer' : 'default',
                background: 'rgba(0,0,0,0.3)',
                padding: '10px',
                borderRadius: '8px',
                minWidth: '150px'
              }}
              onClick={() => isEditable && setIsEditingRightProject(true)}
              data-draggable={isEditable}
            >
              {rightProjectTitle}
            </div>
          )}
        </div>

        {/* Left Side Text Blocks */}
        {leftHeadings.map((heading: string, index: number) => (
          <div key={`left-${index}`} style={{
            position: 'absolute',
            left: '5%',
            top: `${25 + index * 15}%`,
            zIndex: 10,
            maxWidth: '200px'
          }}>
            {/* Heading */}
            {editingLeftHeadings[index] ? (
              <InlineEditor
                initialValue={leftHeadings[index]}
                onSave={(value) => handleLeftHeadingSave(index, value)}
                onCancel={() => {
                  const newEditingStates = [...editingLeftHeadings];
                  newEditingStates[index] = false;
                  setEditingLeftHeadings(newEditingStates);
                }}
                placeholder="Enter heading"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  marginBottom: '4px',
                  cursor: isEditable ? 'pointer' : 'default'
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  marginBottom: '4px',
                  cursor: isEditable ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (isEditable) {
                    const newEditingStates = [...editingLeftHeadings];
                    newEditingStates[index] = true;
                    setEditingLeftHeadings(newEditingStates);
                  }
                }}
                data-draggable={isEditable}
              >
                {heading}
              </div>
            )}

            {/* Description */}
            {editingLeftDescriptions[index] ? (
              <InlineEditor
                initialValue={leftDescriptions[index]}
                onSave={(value) => handleLeftDescriptionSave(index, value)}
                onCancel={() => {
                  const newEditingStates = [...editingLeftDescriptions];
                  newEditingStates[index] = false;
                  setEditingLeftDescriptions(newEditingStates);
                }}
                placeholder="Enter description"
                multiline={true}
                style={{
                  fontSize: '0.8rem',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  lineHeight: '1.3',
                  cursor: isEditable ? 'pointer' : 'default'
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  lineHeight: '1.3',
                  cursor: isEditable ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (isEditable) {
                    const newEditingStates = [...editingLeftDescriptions];
                    newEditingStates[index] = true;
                    setEditingLeftDescriptions(newEditingStates);
                  }
                }}
                data-draggable={isEditable}
              >
                {leftDescriptions[index]}
              </div>
            )}
          </div>
        ))}

        {/* Right Side Text Blocks */}
        {rightHeadings.map((heading: string, index: number) => (
          <div key={`right-${index}`} style={{
            position: 'absolute',
            right: '5%',
            top: `${25 + index * 15}%`,
            zIndex: 10,
            maxWidth: '200px',
            textAlign: 'right'
          }}>
            {/* Heading */}
            {editingRightHeadings[index] ? (
              <InlineEditor
                initialValue={rightHeadings[index]}
                onSave={(value) => handleRightHeadingSave(index, value)}
                onCancel={() => {
                  const newEditingStates = [...editingRightHeadings];
                  newEditingStates[index] = false;
                  setEditingRightHeadings(newEditingStates);
                }}
                placeholder="Enter heading"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  marginBottom: '4px',
                  cursor: isEditable ? 'pointer' : 'default',
                  textAlign: 'right'
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  marginBottom: '4px',
                  cursor: isEditable ? 'pointer' : 'default',
                  textAlign: 'right'
                }}
                onClick={() => {
                  if (isEditable) {
                    const newEditingStates = [...editingRightHeadings];
                    newEditingStates[index] = true;
                    setEditingRightHeadings(newEditingStates);
                  }
                }}
                data-draggable={isEditable}
              >
                {heading}
              </div>
            )}

            {/* Description */}
            {editingRightDescriptions[index] ? (
              <InlineEditor
                initialValue={rightDescriptions[index]}
                onSave={(value) => handleRightDescriptionSave(index, value)}
                onCancel={() => {
                  const newEditingStates = [...editingRightDescriptions];
                  newEditingStates[index] = false;
                  setEditingRightDescriptions(newEditingStates);
                }}
                placeholder="Enter description"
                multiline={true}
                style={{
                  fontSize: '0.8rem',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  lineHeight: '1.3',
                  cursor: isEditable ? 'pointer' : 'default',
                  textAlign: 'right'
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  lineHeight: '1.3',
                  cursor: isEditable ? 'pointer' : 'default',
                  textAlign: 'right'
                }}
                onClick={() => {
                  if (isEditable) {
                    const newEditingStates = [...editingRightDescriptions];
                    newEditingStates[index] = true;
                    setEditingRightDescriptions(newEditingStates);
                  }
                }}
                data-draggable={isEditable}
              >
                {rightDescriptions[index]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContraindicationsIndicationsTemplate;