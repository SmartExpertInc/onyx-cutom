// custom_extensions/frontend/src/components/templates/ChallengesSolutionsTemplate.tsx

import React from 'react';
import { ChallengesSolutionsProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import SimpleInlineEditor from '../SimpleInlineEditor';

export const ChallengesSolutionsTemplate: React.FC<ChallengesSolutionsProps & { theme?: SlideTheme }> = ({
  slideId,
  title,
  challengesTitle = 'Виклики',
  solutionsTitle = 'Рішення',
  challenges,
  solutions,
  onUpdate,
  theme
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);

  const handleTitleChange = (newTitle: string) => {
    if (onUpdate) { onUpdate({ title: newTitle }); }
  };

  const handleChallengesTitleChange = (newChallengesTitle: string) => {
    if (onUpdate) { onUpdate({ challengesTitle: newChallengesTitle }); }
  };

  const handleSolutionsTitleChange = (newSolutionsTitle: string) => {
    if (onUpdate) { onUpdate({ solutionsTitle: newSolutionsTitle }); }
  };

  const handleChallengesChange = (newChallengesText: string) => {
    const newChallenges = newChallengesText.split('\n').filter(item => item.trim());
    if (onUpdate) { onUpdate({ challenges: newChallenges }); }
  };

  const handleSolutionsChange = (newSolutionsText: string) => {
    const newSolutions = newSolutionsText.split('\n').filter(item => item.trim());
    if (onUpdate) { onUpdate({ solutions: newSolutions }); }
  };

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
    margin: '0 auto 50px auto'
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
    margin: 0
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

  const XMarkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 6L7 15L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="challenges-solutions-template" style={slideStyles}>
      <h1 style={titleStyles}>
        <SimpleInlineEditor
          value={title || ''}
          onSave={handleTitleChange}
          placeholder="Enter slide title..."
          maxLength={100}
          className="challenges-solutions-title-editable"
        />
      </h1>

      <div style={gridStyles}>
        {/* Challenges Section */}
        <div style={calloutBoxStyles('rgba(255, 107, 107, 0.1)')}>
          <div style={headerStyles}>
            <XMarkIcon />
            <h3 style={sectionTitleStyles}>
              <SimpleInlineEditor
                value={challengesTitle || ''}
                onSave={handleChallengesTitleChange}
                placeholder="Challenges"
                maxLength={50}
                className="challenges-title-editable"
              />
            </h3>
          </div>
          <div>
            <SimpleInlineEditor
              value={Array.isArray(challenges) ? challenges.join('\n') : ''}
              onSave={handleChallengesChange}
              multiline={true}
              placeholder="Enter challenges, one per line..."
              maxLength={1000}
              rows={8}
              className="challenges-content-editable"
            />
          </div>
          {/* Display challenges */}
          {Array.isArray(challenges) && challenges.length > 0 && (
            <ul style={listStyles}>
              {challenges.map((challenge, index) => (
                <li key={index} style={listItemStyles}>
                  <div style={bulletStyles} />
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Solutions Section */}
        <div style={calloutBoxStyles('rgba(76, 175, 80, 0.1)')}>
          <div style={headerStyles}>
            <CheckIcon />
            <h3 style={sectionTitleStyles}>
              <SimpleInlineEditor
                value={solutionsTitle || ''}
                onSave={handleSolutionsTitleChange}
                placeholder="Solutions"
                maxLength={50}
                className="solutions-title-editable"
              />
            </h3>
          </div>
          <div>
            <SimpleInlineEditor
              value={Array.isArray(solutions) ? solutions.join('\n') : ''}
              onSave={handleSolutionsChange}
              multiline={true}
              placeholder="Enter solutions, one per line..."
              maxLength={1000}
              rows={8}
              className="solutions-content-editable"
            />
          </div>
          {/* Display solutions */}
          {Array.isArray(solutions) && solutions.length > 0 && (
            <ul style={listStyles}>
              {solutions.map((solution, index) => (
                <li key={index} style={listItemStyles}>
                  <div style={bulletStyles} />
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengesSolutionsTemplate; 