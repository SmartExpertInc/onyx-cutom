// custom_extensions/frontend/src/components/templates/ChallengesSolutionsTemplate.tsx

import React, { useState } from 'react';
import { ChallengesSolutionsProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

export const ChallengesSolutionsTemplate: React.FC<ChallengesSolutionsProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  slideId,
  title,
  challengesTitle = 'Виклики',
  solutionsTitle = 'Рішення',
  challenges,
  solutions,
  onUpdate,
  theme,
  isEditable = false
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingChallengesTitle, setEditingChallengesTitle] = useState(false);
  const [editingSolutionsTitle, setEditingSolutionsTitle] = useState(false);
  const [editingChallenges, setEditingChallenges] = useState<number[]>([]);
  const [editingSolutions, setEditingSolutions] = useState<number[]>([]);
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
    minHeight: '600px',
    backgroundColor: currentTheme.colors.backgroundColor,
    padding: '60px',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontWeight: 700,
    color: currentTheme.colors.titleColor,
    fontFamily: currentTheme.fonts.titleFont,
    textAlign: 'center',
    marginBottom: '50px',
    lineHeight: 1.3,
    maxWidth: '900px',
    margin: '0 auto 50px auto',
    wordWrap: 'break-word'
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    maxWidth: '1000px',
    margin: '0 auto'
  };

  const calloutBoxStyles = (bgColor: string): React.CSSProperties => ({
    backgroundColor: bgColor,
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  });

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: currentTheme.colors.contentColor,
    fontFamily: currentTheme.fonts.titleFont,
    margin: 0,
    wordWrap: 'break-word'
  };

  const listStyles: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };

  const listItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '12px',
    fontSize: currentTheme.fonts.contentSize,
    lineHeight: 1.5,
    color: currentTheme.colors.contentColor,
    fontFamily: currentTheme.fonts.contentFont
  };

  const bulletStyles: React.CSSProperties = {
    minWidth: '6px',
    width: '6px',
    height: '6px',
    backgroundColor: currentTheme.colors.contentColor,
    borderRadius: '50%',
    marginTop: '8px'
  };

  // Handle title editing
  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  // Handle challenges title editing
  const handleChallengesTitleSave = (newChallengesTitle: string) => {
    if (onUpdate) {
      onUpdate({ challengesTitle: newChallengesTitle });
    }
    setEditingChallengesTitle(false);
  };

  const handleChallengesTitleCancel = () => {
    setEditingChallengesTitle(false);
  };

  // Handle solutions title editing
  const handleSolutionsTitleSave = (newSolutionsTitle: string) => {
    if (onUpdate) {
      onUpdate({ solutionsTitle: newSolutionsTitle });
    }
    setEditingSolutionsTitle(false);
  };

  const handleSolutionsTitleCancel = () => {
    setEditingSolutionsTitle(false);
  };

  // Handle challenge editing
  const handleChallengeSave = (index: number, newChallenge: string) => {
    if (onUpdate && challenges) {
      const updatedChallenges = [...challenges];
      updatedChallenges[index] = newChallenge;
      onUpdate({ challenges: updatedChallenges });
    }
    setEditingChallenges(editingChallenges.filter(i => i !== index));
  };

  const handleChallengeCancel = (index: number) => {
    setEditingChallenges(editingChallenges.filter((i: number) => i !== index));
  };

  // Handle solution editing
  const handleSolutionSave = (index: number, newSolution: string) => {
    if (onUpdate && solutions) {
      const updatedSolutions = [...solutions];
      updatedSolutions[index] = newSolution;
      onUpdate({ solutions: updatedSolutions });
    }
    setEditingSolutions(editingSolutions.filter((i: number) => i !== index));
  };

  const handleSolutionCancel = (index: number) => {
    setEditingSolutions(editingSolutions.filter((i: number) => i !== index));
  };

  const startEditingChallenge = (index: number) => {
    setEditingChallenges([...editingChallenges, index]);
  };

  const startEditingSolution = (index: number) => {
    setEditingSolutions([...editingSolutions, index]);
  };

  // SVG Icons
  const XMarkIcon = () => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 512 512" 
      fill={currentTheme.colors.accentColor}
      style={inline({ flexShrink: 0 })}
    >
      <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/>
    </svg>
  );

  const CheckIcon = () => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 512 512" 
      fill={currentTheme.colors.accentColor}
      style={inline({ flexShrink: 0 })}
    >
      <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"/>
    </svg>
  );

  return (
    <div className="challenges-solutions-template" style={slideStyles}>
      {/* Main Title */}
      {isEditable && editingTitle ? (
        <ImprovedInlineEditor
          initialValue={title || ''}
          onSave={handleTitleSave}
          onCancel={handleTitleCancel}
          multiline={true}
          placeholder="Enter slide title..."
          className="inline-editor-title"
          style={inline({
            ...titleStyles,
            // Ensure title behaves exactly like h1 element
            margin: '0 auto 50px auto',
            padding: '0',
            border: 'none',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            boxSizing: 'border-box',
            display: 'block'
          })}
        />
      ) : (
        <h1 
          style={titleStyles}
          onClick={() => {
            if (isEditable) {
              setEditingTitle(true);
            }
          }}
          className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
        >
          {title || 'Click to add title'}
        </h1>
      )}

      {/* Two Column Grid */}
      <div style={gridStyles}>
        {/* Challenges Column */}
        <div style={calloutBoxStyles(currentTheme.colors.backgroundColor)}>
          <div style={headerStyles}>
            <XMarkIcon />
            {isEditable && editingChallengesTitle ? (
              <ImprovedInlineEditor
                initialValue={challengesTitle || ''}
                onSave={handleChallengesTitleSave}
                onCancel={handleChallengesTitleCancel}
                multiline={true}
                placeholder="Enter challenges title..."
                className="inline-editor-challenges-title"
                style={inline({
                  ...sectionTitleStyles,
                  // Ensure title behaves exactly like h2 element
                  margin: '0',
                  padding: '0',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block'
                })}
              />
            ) : (
              <h2 
                style={sectionTitleStyles}
                onClick={() => {
                  if (isEditable) {
                    setEditingChallengesTitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {challengesTitle || 'Click to add challenges title'}
              </h2>
            )}
          </div>
          <ul style={listStyles}>
            {challenges?.map((challenge: string, index: number) => (
              <li key={index} style={listItemStyles}>
                <div style={bulletStyles}></div>
                {isEditable && editingChallenges.includes(index) ? (
                  <ImprovedInlineEditor
                    initialValue={challenge || ''}
                    onSave={(newChallenge) => handleChallengeSave(index, newChallenge)}
                    onCancel={() => handleChallengeCancel(index)}
                    multiline={true}
                    placeholder="Enter challenge..."
                    className="inline-editor-challenge"
                    style={inline({
                      fontSize: currentTheme.fonts.contentSize,
                      lineHeight: 1.5,
                      color: currentTheme.colors.contentColor,
                      fontFamily: currentTheme.fonts.contentFont,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      resize: 'none',
                      overflow: 'hidden',
                      width: '100%',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      boxSizing: 'border-box',
                      display: 'block',
                      margin: '0',
                      padding: '0'
                    })}
                  />
                ) : (
                  <span 
                    onClick={() => {
                      if (isEditable) {
                        startEditingChallenge(index);
                      }
                    }}
                    className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                  >
                    {challenge || 'Click to add challenge'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Solutions Column */}
        <div style={calloutBoxStyles(currentTheme.colors.backgroundColor)}>
          <div style={headerStyles}>
            <CheckIcon />
            {isEditable && editingSolutionsTitle ? (
              <ImprovedInlineEditor
                initialValue={solutionsTitle || ''}
                onSave={handleSolutionsTitleSave}
                onCancel={handleSolutionsTitleCancel}
                multiline={true}
                placeholder="Enter solutions title..."
                className="inline-editor-solutions-title"
                style={inline({
                  ...sectionTitleStyles,
                  // Ensure title behaves exactly like h2 element
                  margin: '0',
                  padding: '0',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block'
                })}
              />
            ) : (
              <h2 
                style={sectionTitleStyles}
                onClick={() => {
                  if (isEditable) {
                    setEditingSolutionsTitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {solutionsTitle || 'Click to add solutions title'}
              </h2>
            )}
          </div>
          <ul style={listStyles}>
            {solutions?.map((solution: string, index: number) => (
              <li key={index} style={listItemStyles}>
                <div style={bulletStyles}></div>
                {isEditable && editingSolutions.includes(index) ? (
                  <ImprovedInlineEditor
                    initialValue={solution || ''}
                    onSave={(newSolution) => handleSolutionSave(index, newSolution)}
                    onCancel={() => handleSolutionCancel(index)}
                    multiline={true}
                    placeholder="Enter solution..."
                    className="inline-editor-solution"
                    style={inline({
                      fontSize: currentTheme.fonts.contentSize,
                      lineHeight: 1.5,
                      color: currentTheme.colors.contentColor,
                      fontFamily: currentTheme.fonts.contentFont,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      resize: 'none',
                      overflow: 'hidden',
                      width: '100%',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      boxSizing: 'border-box',
                      display: 'block',
                      margin: '0',
                      padding: '0'
                    })}
                  />
                ) : (
                  <span 
                    onClick={() => {
                      if (isEditable) {
                        startEditingSolution(index);
                      }
                    }}
                    className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                  >
                    {solution || 'Click to add solution'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChallengesSolutionsTemplate; 