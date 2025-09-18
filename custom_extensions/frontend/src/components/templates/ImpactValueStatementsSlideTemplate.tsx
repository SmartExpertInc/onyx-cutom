// custom_extensions/frontend/src/components/templates/ImpactValueStatementsSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface ImpactValueStatementsProps extends BaseTemplateProps {
  title: string;
  statements: Array<{
    percentage: string;
    description: string;
  }>;
  avatarPath?: string;
}

export const ImpactValueStatementsSlideTemplate: React.FC<ImpactValueStatementsProps & { theme?: SlideTheme | string }> = ({
  title = 'Impact Value Statements',
  statements = [
    { percentage: '27%', description: 'increase in profit margins of companies' },
    { percentage: '10%', description: 'increase in revenue growth led by data-driven decisions' },
    { percentage: '50%', description: 'less failure when engaging stakeholders in decisions' }
  ],
  avatarPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editKey, setEditKey] = useState<string | null>(null);

  const slide: React.CSSProperties = {,
    width: '100%',
    aspectRatio: '16/9',
    background: '#F5F5F5',
    color: '#333333',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
    position: 'relative',

  // Left content area
  const leftContent: React.CSSProperties = {,
    position: 'absolute',
    left: '80px',
    top: '80px',
    width: '600px',
    height: 'calc(100% - 160px)',

  const titleStyle: React.CSSProperties = {,
    fontSize: '43px',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
    color: 'rgb(60 58 58)',
    marginBottom: '50px',
    lineHeight: 1.2,

  const statementsContainer: React.CSSProperties = {,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',

  const statementStyle: React.CSSProperties = {,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',

  const percentageStyle: React.CSSProperties = {,
    fontSize: '42px',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
    color: '#2563EB',
    lineHeight: 1,

  const descriptionStyle: React.CSSProperties = {,
    fontSize: '16px',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
    color: 'rgb(88 88 88)',
    lineHeight: 1.4,

  // Right image area
  const rightImageArea: React.CSSProperties = {,
    position: 'absolute',
    right: '80px',
    top: '80px',
    width: '400px',
    height: 'calc(100% - 160px)',
    background: '#2563EB',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',

  const imageContainer: React.CSSProperties = {,
    width: '320px',
    position: 'absolute',
    bottom: '-30px',
    borderRadius: '16px',
    overflow: 'hidden',

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

  return (
    <div style={slide}>
      {/* Left content area */}
      <div style={leftContent}>
        {/* Title */}
        <div style={titleStyle} onClick={() => isEditable && setEditKey('title')}>
          {isEditable && editKey === 'title' ? (
            <ImprovedInlineEditor 
              initialValue={title} 
              multiline={true}
              onSave={(value) => { 
                onUpdate && onUpdate({ title: value }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              style={inline(titleStyle)} 
            />
          ) : (
            title
          )}
        </div>

        {/* Statements */}
        <div style={statementsContainer}>
          {statements.map((statement, index) => (
            <div key={index} style={statementStyle}>
              {/* Percentage */}
              <div 
                style={percentageStyle} 
                onClick={() => isEditable && setEditKey(`percentage-${index}`)}
              >
                {isEditable && editKey === `percentage-${index}` ? (
                  <ImprovedInlineEditor 
                    initialValue={statement.percentage} 
                    onSave={(value) => { 
                      const newStatements = [...statements];
                      newStatements[index] = { ...newStatements[index], percentage: value };
                      onUpdate && onUpdate({ statements: newStatements }); 
                      setEditKey(null); 
                    }} 
                    onCancel={() => setEditKey(null)} 
                    style={inline(percentageStyle)} 
                  />
                ) : (
                  statement.percentage
                )}
              </div>

              {/* Description */}
              <div 
                style={descriptionStyle} 
                onClick={() => isEditable && setEditKey(`description-${index}`)}
              >
                {isEditable && editKey === `description-${index}` ? (
                  <ImprovedInlineEditor 
                    initialValue={statement.description} 
                    multiline={true}
                    onSave={(value) => { 
                      const newStatements = [...statements];
                      newStatements[index] = { ...newStatements[index], description: value };
                      onUpdate && onUpdate({ statements: newStatements }); 
                      setEditKey(null); 
                    }} 
                    onCancel={() => setEditKey(null)} 
                    style={inline(descriptionStyle)} 
                  />
                ) : (
                  statement.description
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right image area */}
      <div style={rightImageArea}>
        <div style={imageContainer}>
          <ClickableImagePlaceholder
            imagePath={avatarPath}
            onImageUploaded={(path) => onUpdate && onUpdate({ avatarPath: path })}
            description="Avatar" 
            isEditable={isEditable} 
            style={{ width:'100%', height:'100%', objectFit:'cover' }} 
          />
        </div>
      </div>
    </div>
  );
};

export default ImpactValueStatementsSlideTemplate;