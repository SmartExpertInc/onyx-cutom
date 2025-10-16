import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { ChallengesSolutionsProps } from '@/types/slideTemplates';
import Image from 'next/image';
import groupImg from './group_img.png';

export interface ChallengesSolutionsTemplateProps {
  title?: string;
  subtitle?: string;
  theme?: string;
  isEditable?: boolean;
  slideId?: string;
  onUpdate?: (data: Partial<ChallengesSolutionsTemplateProps>) => void;
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

const ChallengesSolutionsTemplate: React.FC<ChallengesSolutionsTemplateProps & Partial<ChallengesSolutionsProps>> = ({
  title = 'Challenges & Solutions',
  subtitle = 'Type The Subtitle Of Your Great Here',
  theme,
  isEditable = true,
  slideId = 'challenges-solutions',
  onUpdate,
  challengesTitle = 'Challenges',
  solutionsTitle = 'Solutions',
  challenges = [],
  solutions = []
}: ChallengesSolutionsTemplateProps & Partial<ChallengesSolutionsProps>) => {
  const currentTheme = getSlideTheme(theme) || DEFAULT_SLIDE_THEME;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [isEditingChallengesTitle, setIsEditingChallengesTitle] = useState(false);
  const [isEditingSolutionsTitle, setIsEditingSolutionsTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSubtitle, setCurrentSubtitle] = useState(subtitle);
  const [currentChallengesTitle, setCurrentChallengesTitle] = useState(challengesTitle);
  const [currentSolutionsTitle, setCurrentSolutionsTitle] = useState(solutionsTitle);
  
  // Состояние для элементов списков
  const [challengeItems, setChallengeItems] = useState(
    (Array.isArray(challenges) && challenges.length > 0) ? challenges : [
      'Title goes here', 'Title goes here', 'Title goes here'
    ]
  );
  const [solutionItems, setSolutionItems] = useState(
    (Array.isArray(solutions) && solutions.length > 0) ? solutions : [
      'Title goes here', 'Title goes here', 'Title goes here'
    ]
  );
  
  // Состояния редактирования для каждого элемента
  const [editingChallengeItems, setEditingChallengeItems] = useState([false, false, false]);
  const [editingSolutionItems, setEditingSolutionItems] = useState([false, false, false]);
  
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

  const handleChallengesTitleSave = (value: string) => {
    setCurrentChallengesTitle(value);
    setIsEditingChallengesTitle(false);
    if (onUpdate) {
      onUpdate({ challengesTitle: value });
    }
  };

  const handleSolutionsTitleSave = (value: string) => {
    setCurrentSolutionsTitle(value);
    setIsEditingSolutionsTitle(false);
    if (onUpdate) {
      onUpdate({ solutionsTitle: value });
    }
  };

  // Обработчики для элементов списков
  const handleChallengeItemSave = (index: number, value: string) => {
    const newItems = [...challengeItems];
    newItems[index] = value;
    setChallengeItems(newItems);
    
    const newEditingStates = [...editingChallengeItems];
    newEditingStates[index] = false;
    setEditingChallengeItems(newEditingStates);
  };

  const handleSolutionItemSave = (index: number, value: string) => {
    const newItems = [...solutionItems];
    newItems[index] = value;
    setSolutionItems(newItems);
    
    const newEditingStates = [...editingSolutionItems];
    newEditingStates[index] = false;
    setEditingSolutionItems(newEditingStates);
  };

  const handleChallengeItemEdit = (index: number) => {
    if (isEditable) {
      const newEditingStates = [...editingChallengeItems];
      newEditingStates[index] = true;
      setEditingChallengeItems(newEditingStates);
    }
  };

  const handleSolutionItemEdit = (index: number) => {
    if (isEditable) {
      const newEditingStates = [...editingSolutionItems];
      newEditingStates[index] = true;
      setEditingSolutionItems(newEditingStates);
    }
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
        {/* Left side text items - positioned next to icons */}
        {challengeItems.map((item: string, index: number) => {
          // Position each challenge next to its icon
          const positions = [
            { top: '15%', left: '20px' },   // Top icon
            { top: '48%', left: '20px' },   // Middle icon
            { top: '75%', left: '20px' }    // Bottom icon
          ];
          const pos = positions[index] || positions[0];
          
          return (
            <div key={index} style={{
              position: 'absolute',
              ...pos,
              width: '280px',
              zIndex: 10
            }}>
              {editingChallengeItems[index] ? (
                <InlineEditor
                  initialValue={challengeItems[index]}
                  onSave={(value) => handleChallengeItemSave(index, value)}
                  onCancel={() => {
                    const newEditingStates = [...editingChallengeItems];
                    newEditingStates[index] = false;
                    setEditingChallengeItems(newEditingStates);
                  }}
                  placeholder="Enter challenge"
                  style={{
                    fontSize: '17px',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'normal',
                    width: '100%',
                    minWidth: '200px'
                  }}
                />
              ) : (
                <div 
                  style={{
                    fontSize: '17px',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'normal',
                    cursor: isEditable ? 'pointer' : 'default',
                    textAlign: 'left',
                    width: '100%',
                    wordWrap: 'break-word'
                  }}
                  onClick={() => handleChallengeItemEdit(index)}
                  data-draggable={isEditable}
                >
                  {item}
                </div>
              )}
            </div>
          );
        })}

        {/* Right side text items - positioned next to icons */}
        {solutionItems.map((item: string, index: number) => {
          // Position each solution next to its icon
          const positions = [
            { top: '15%', right: '20px' },   // Top icon
            { top: '48%', right: '20px' },   // Middle icon
            { top: '75%', right: '20px' }    // Bottom icon
          ];
          const pos = positions[index] || positions[0];
          
          return (
            <div key={index} style={{
              position: 'absolute',
              ...pos,
              width: '280px',
              zIndex: 10
            }}>
              {editingSolutionItems[index] ? (
                <InlineEditor
                  initialValue={solutionItems[index]}
                  onSave={(value) => handleSolutionItemSave(index, value)}
                  onCancel={() => {
                    const newEditingStates = [...editingSolutionItems];
                    newEditingStates[index] = false;
                    setEditingSolutionItems(newEditingStates);
                  }}
                  placeholder="Enter solution"
                  style={{
                    fontSize: '17px',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'normal',
                    textAlign: 'left',
                    width: '100%',
                    minWidth: '200px'
                  }}
                />
              ) : (
                <div 
                  style={{
                    fontSize: '17px',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'normal',
                    textAlign: 'left',
                    cursor: isEditable ? 'pointer' : 'default',
                    width: '100%',
                    wordWrap: 'break-word'
                  }}
                  onClick={() => handleSolutionItemEdit(index)}
                  data-draggable={isEditable}
                >
                  {item}
                </div>
              )}
            </div>
          );
        })}

        <div style={imageContainerStyles}>
          <Image src={groupImg} alt="Group" width={500} height={400} />
        </div>

        {/* Bottom labels - positioned below central icons */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, 160px)',
          display: 'flex',
          gap: '70px',
          zIndex: 10,
          paddingLeft: '40px'
        }}>
          {/* Challenges Title */}
          <div data-draggable="true" style={{ display: 'inline-block' }}>
            {isEditable && isEditingChallengesTitle ? (
              <InlineEditor
                initialValue={currentChallengesTitle}
                onSave={handleChallengesTitleSave}
                onCancel={() => setIsEditingChallengesTitle(false)}
                placeholder="Challenges"
                style={{
                  fontSize: '19px',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '500',
                  textAlign: 'center',
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: '19px',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '500',
                  textAlign: 'center',
                  cursor: isEditable ? 'pointer' : 'default',
                }}
                onClick={() => isEditable && setIsEditingChallengesTitle(true)}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {currentChallengesTitle}
              </div>
            )}
          </div>
          
          {/* Solutions Title */}
          <div data-draggable="true" style={{ display: 'inline-block' }}>
            {isEditable && isEditingSolutionsTitle ? (
              <InlineEditor
                initialValue={currentSolutionsTitle}
                onSave={handleSolutionsTitleSave}
                onCancel={() => setIsEditingSolutionsTitle(false)}
                placeholder="Solutions"
                style={{
                  fontSize: '19px',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '500',
                  textAlign: 'center',
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: '19px',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '500',
                  textAlign: 'center',
                  cursor: isEditable ? 'pointer' : 'default',
                }}
                onClick={() => isEditable && setIsEditingSolutionsTitle(true)}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {currentSolutionsTitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesSolutionsTemplate;