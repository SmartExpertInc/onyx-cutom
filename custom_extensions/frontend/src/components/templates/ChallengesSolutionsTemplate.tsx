// custom_extensions/frontend/src/components/templates/ChallengesSolutionsTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ChallengesSolutionsProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

// FIXED: Function to detect language and provide localized headers
const getLocalizedHeaders = (title: string, challenges: string[], solutions: string[]): { challengesTitle: string, solutionsTitle: string } => {
  // Combine all text content to analyze language
  const allText = [title, ...(challenges || []), ...(solutions || [])].join(' ').toLowerCase();
  
  // Language detection patterns
  const ukrainianChars = /[її єю ґ]/gi;
  const russianChars = /[ыъё]/gi;
  const spanishChars = /[ñáéíóúü]/gi;
  
  // Count matches
  const ukrainianMatches = (allText.match(ukrainianChars) || []).length;
  const russianMatches = (allText.match(russianChars) || []).length;
  const spanishMatches = (allText.match(spanishChars) || []).length;
  
  // Determine language based on character frequency
  if (ukrainianMatches > 0) {
    return { challengesTitle: 'Виклики', solutionsTitle: 'Рішення' };
  } else if (russianMatches > 0) {
    return { challengesTitle: 'Вызовы', solutionsTitle: 'Решения' };
  } else if (spanishMatches > 0) {
    return { challengesTitle: 'Desafíos', solutionsTitle: 'Soluciones' };
  } else {
    // Default to English
    return { challengesTitle: 'Challenges', solutionsTitle: 'Solutions' };
  }
};

export const ChallengesSolutionsTemplate: React.FC<ChallengesSolutionsProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  slideId,
  title,
  challengesTitle,
  solutionsTitle,
  challenges,
  solutions,
  onUpdate,
  theme,
  isEditable = false
}) => {
  // FIXED: Use localized headers based on content language
  const localizedHeaders = getLocalizedHeaders(title || '', challenges || [], solutions || []);
  const finalChallengesTitle = challengesTitle || localizedHeaders.challengesTitle;
  const finalSolutionsTitle = solutionsTitle || localizedHeaders.solutionsTitle;
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingChallengesTitle, setEditingChallengesTitle] = useState(false);
  const [editingSolutionsTitle, setEditingSolutionsTitle] = useState(false);
  const [editingChallenges, setEditingChallenges] = useState<number[]>([]);
  const [editingSolutions, setEditingSolutions] = useState<number[]>([]);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs for draggable elements (following Big Image Left pattern)
  const titleRef = useRef<HTMLDivElement>(null);
  
  // Use existing slideId for element positioning (following Big Image Left pattern)
  
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
        background: currentTheme.colors.backgroundColor,
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
      style={{ flexShrink: 0 }}
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
      style={{ flexShrink: 0 }}
    >
      <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"/>
    </svg>
  );

  return (
    <div className="challenges-solutions-template" style={slideStyles}>
      {/* Main Title - wrapped */}
      <div 
        ref={titleRef}
        data-moveable-element={`${slideId}-title`}
        data-draggable="true" 
        style={{ display: 'inline-block', width: '100%' }}
      >
        {isEditable && editingTitle ? (
          <WysiwygEditor
            initialValue={title || ''}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            placeholder="Enter slide title..."
            className="inline-editor-title"
            style={{
              ...titleStyles,
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              boxSizing: 'border-box',
              display: 'block',
              lineHeight: '1.3'
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
                setEditingTitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover-border-opacity-50' : ''}
            dangerouslySetInnerHTML={{ __html: title || 'Click to add title' }}
          />
        )}
      </div>

      {/* Two Column Grid */}
      <div style={gridStyles}>
        {/* Challenges Column */}
        <div 
          data-moveable-element={`${slideId}-challenges`}
          data-draggable="true"
          style={calloutBoxStyles(currentTheme.colors.backgroundColor)}
        >
          <div style={headerStyles}>
            <XMarkIcon />
            {isEditable && editingChallengesTitle ? (
              <WysiwygEditor
                initialValue={finalChallengesTitle || ''}
                onSave={handleChallengesTitleSave}
                onCancel={handleChallengesTitleCancel}
                placeholder="Enter challenges title..."
                className="inline-editor-challenges-title"
                style={{
                  ...sectionTitleStyles,
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block',
                  lineHeight: '1.2'
                }}
              />
            ) : (
              <h2 
                style={sectionTitleStyles}
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    setEditingChallengesTitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover-border-opacity-50' : ''}
                dangerouslySetInnerHTML={{ __html: finalChallengesTitle || 'Click to add challenges title' }}
              />
            )}
          </div>
          <ul style={listStyles}>
            {challenges?.map((challenge: string, index: number) => (
              <li key={index} style={listItemStyles}>
                <div style={bulletStyles}></div>
                {isEditable && editingChallenges.includes(index) ? (
                  <WysiwygEditor
                    initialValue={challenge || ''}
                    onSave={(newChallenge) => handleChallengeSave(index, newChallenge)}
                    onCancel={() => handleChallengeCancel(index)}
                    placeholder="Enter challenge..."
                    className="inline-editor-challenge"
                    style={{
                      fontSize: currentTheme.fonts.contentSize,
                      lineHeight: 1.5,
                      color: currentTheme.colors.contentColor,
                      fontFamily: currentTheme.fonts.contentFont,
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      boxSizing: 'border-box',
                      display: 'block',
                      margin: '0'
                    }}
                  />
                ) : (
                  <span 
                    onClick={(e) => {
                      const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                      if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      if (isEditable) {
                        startEditingChallenge(index);
                      }
                    }}
                    className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover-border-opacity-50' : ''}
                    dangerouslySetInnerHTML={{ __html: challenge || 'Click to add challenge' }}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Solutions Column */}
        <div 
          data-moveable-element={`${slideId}-solutions`}
          data-draggable="true"
          style={calloutBoxStyles(currentTheme.colors.backgroundColor)}
        >
          <div style={headerStyles}>
            <CheckIcon />
            {isEditable && editingSolutionsTitle ? (
              <WysiwygEditor
                initialValue={finalSolutionsTitle || ''}
                onSave={handleSolutionsTitleSave}
                onCancel={handleSolutionsTitleCancel}
                placeholder="Enter solutions title..."
                className="inline-editor-solutions-title"
                style={{
                  ...sectionTitleStyles,
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block',
                  lineHeight: '1.2'
                }}
              />
            ) : (
              <h2 
                style={sectionTitleStyles}
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    setEditingSolutionsTitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover-border-opacity-50' : ''}
                dangerouslySetInnerHTML={{ __html: solutionsTitle || 'Click to add solutions title' }}
              />
            )}
          </div>
          <ul style={listStyles}>
            {solutions?.map((solution: string, index: number) => (
              <li key={index} style={listItemStyles}>
                <div style={bulletStyles}></div>
                {isEditable && editingSolutions.includes(index) ? (
                  <WysiwygEditor
                    initialValue={solution || ''}
                    onSave={(newSolution) => handleSolutionSave(index, newSolution)}
                    onCancel={() => handleSolutionCancel(index)}
                    placeholder="Enter solution..."
                    className="inline-editor-solution"
                    style={{
                      fontSize: currentTheme.fonts.contentSize,
                      lineHeight: 1.5,
                      color: currentTheme.colors.contentColor,
                      fontFamily: currentTheme.fonts.contentFont,
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      boxSizing: 'border-box',
                      display: 'block',
                      margin: '0'
                    }}
                  />
                ) : (
                  <span 
                    onClick={(e) => {
                      const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                      if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      if (isEditable) {
                        startEditingSolution(index);
                      }
                    }}
                    className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
                    dangerouslySetInnerHTML={{ __html: solution || 'Click to add solution' }}
                  />
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