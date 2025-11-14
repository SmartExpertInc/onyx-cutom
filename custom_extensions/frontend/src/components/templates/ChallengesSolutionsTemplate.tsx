import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { ChallengesSolutionsProps } from '@/types/slideTemplates';
import Image from 'next/image';
import groupImg from './group_img.png';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

export interface ChallengesSolutionsTemplateProps {
  title?: string;
  subtitle?: string;
  theme?: string;
  isEditable?: boolean;
  slideId?: string;
  onUpdate?: (data: Partial<ChallengesSolutionsTemplateProps>) => void;
}

const ChallengesSolutionsTemplate: React.FC<ChallengesSolutionsTemplateProps & Partial<ChallengesSolutionsProps>> = ({
  title = 'Challenges & Solutions',
  subtitle = '',
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
    
    if (onUpdate) {
      onUpdate({ challenges: newItems });
    }
  };

  const handleSolutionItemSave = (index: number, value: string) => {
    const newItems = [...solutionItems];
    newItems[index] = value;
    setSolutionItems(newItems);
    
    const newEditingStates = [...editingSolutionItems];
    newEditingStates[index] = false;
    setEditingSolutionItems(newEditingStates);
    
    if (onUpdate) {
      onUpdate({ solutions: newItems });
    }
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
    flexGrow: 1,
    position: 'relative',
    height: '400px',
    width: '100%',
    overflow: 'visible',
    padding: '0 60px'
  };

  const imageContainerStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    pointerEvents: 'none'
  };

  return (
    <div style={slideStyles} ref={slideContainerRef}>
      {/* Title */}
      <div data-draggable="true">
        {isEditable && isEditingTitle ? (
          <WysiwygEditor
            initialValue={currentTitle}
            onSave={handleTitleSave}
            onCancel={() => setIsEditingTitle(false)}
            placeholder="Enter title"
            className="inline-editor-title"
            style={{
              ...titleStyles,
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
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
              const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
              if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              if (isEditable) {
                setIsEditingTitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
            dangerouslySetInnerHTML={{ __html: currentTitle }}
          />
        )}
      </div>

      {/* Subtitle - only show if subtitle exists */}
      {currentSubtitle && (
        <div data-draggable="true">
          {isEditable && isEditingSubtitle ? (
            <WysiwygEditor
              initialValue={currentSubtitle}
              onSave={handleSubtitleSave}
              onCancel={() => setIsEditingSubtitle(false)}
              placeholder="Enter subtitle"
              className="inline-editor-subtitle"
              style={{
                ...subtitleStyles,
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block'
              }}
            />
          ) : (
            <h2
              style={subtitleStyles}
              onClick={(e) => {
                const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (isEditable) {
                  setIsEditingSubtitle(true);
                }
              }}
              className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              dangerouslySetInnerHTML={{ __html: currentSubtitle }}
            />
          )}
        </div>
      )}

      {/* Main Content with Image */}
      <div style={mainContentStyles}>
        {/* Left side text items - positioned next to icons */}
        {challengeItems.map((item: string, index: number) => {
          // Position each challenge next to its icon
          const positions = [
            { top: '15%', left: '0px' },   // Top icon
            { top: '48%', left: '0px' },   // Middle icon
            { top: '75%', left: '0px' }    // Bottom icon
          ];
          const pos = positions[index] || positions[0];
          
          return (
            <div key={index} data-draggable="true" style={{
              position: 'absolute',
              ...pos,
              width: '220px',
              maxWidth: '220px',
              zIndex: 10
            }}>
              {editingChallengeItems[index] ? (
                <WysiwygEditor
                  initialValue={challengeItems[index]}
                  onSave={(value) => handleChallengeItemSave(index, value)}
                  onCancel={() => {
                    const newEditingStates = [...editingChallengeItems];
                    newEditingStates[index] = false;
                    setEditingChallengeItems(newEditingStates);
                  }}
                  placeholder="Enter challenge"
                  className="inline-editor-challenge"
                  style={{
                    fontSize: '17px',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'normal',
                    width: '100%',
                    minWidth: '200px',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block'
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
                  onClick={(e) => {
                    const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                    if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    handleChallengeItemEdit(index);
                  }}
                  className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                  dangerouslySetInnerHTML={{ __html: item }}
                />
              )}
            </div>
          );
        })}

        {/* Right side text items - positioned next to icons */}
        {solutionItems.map((item: string, index: number) => {
          // Position each solution next to its icon
          const positions = [
            { top: '15%', right: '0px' },   // Top icon
            { top: '48%', right: '0px' },   // Middle icon
            { top: '75%', right: '0px' }    // Bottom icon
          ];
          const pos = positions[index] || positions[0];
          
          return (
            <div key={index} data-draggable="true" style={{
              position: 'absolute',
              ...pos,
              width: '220px',
              maxWidth: '220px',
              zIndex: 10
            }}>
              {editingSolutionItems[index] ? (
                <WysiwygEditor
                  initialValue={solutionItems[index]}
                  onSave={(value) => handleSolutionItemSave(index, value)}
                  onCancel={() => {
                    const newEditingStates = [...editingSolutionItems];
                    newEditingStates[index] = false;
                    setEditingSolutionItems(newEditingStates);
                  }}
                  placeholder="Enter solution"
                  className="inline-editor-solution"
                  style={{
                    fontSize: '17px',
                    color: '#000000',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'normal',
                    textAlign: 'left',
                    width: '100%',
                    minWidth: '200px',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block'
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
                  onClick={(e) => {
                    const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                    if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    handleSolutionItemEdit(index);
                  }}
                  className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                  dangerouslySetInnerHTML={{ __html: item }}
                />
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
          paddingLeft: '10px',
          justifyContent: 'space-between',
          width: '400px'
        }}>
          {/* Challenges Title */}
          <div data-draggable="true" style={{ display: 'inline-block' }}>
            {isEditable && isEditingChallengesTitle ? (
              <WysiwygEditor
                initialValue={currentChallengesTitle}
                onSave={handleChallengesTitleSave}
                onCancel={() => setIsEditingChallengesTitle(false)}
                placeholder="Challenges"
                className="inline-editor-challenges-title"
                style={{
                  fontSize: '19px',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '500',
                  textAlign: 'center',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block'
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
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    setIsEditingChallengesTitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                dangerouslySetInnerHTML={{ __html: currentChallengesTitle }}
              />
            )}
          </div>
          
          {/* Solutions Title */}
          <div data-draggable="true" style={{ display: 'inline-block' }}>
            {isEditable && isEditingSolutionsTitle ? (
              <WysiwygEditor
                initialValue={currentSolutionsTitle}
                onSave={handleSolutionsTitleSave}
                onCancel={() => setIsEditingSolutionsTitle(false)}
                placeholder="Solutions"
                className="inline-editor-solutions-title"
                style={{
                  fontSize: '19px',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '500',
                  textAlign: 'left',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: '19px',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '500',
                  textAlign: 'left',
                  cursor: isEditable ? 'pointer' : 'default',
                }}
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    setIsEditingSolutionsTitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                dangerouslySetInnerHTML={{ __html: currentSolutionsTitle }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesSolutionsTemplate;