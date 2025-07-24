// custom_extensions/frontend/src/components/templates/ProcessStepsTemplate.tsx

import React from 'react';
import { ProcessStepsProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export const ProcessStepsTemplate: React.FC<ProcessStepsProps & { theme?: SlideTheme }> = (props) => {
  const currentTheme = props.theme || getSlideTheme(DEFAULT_SLIDE_THEME);

  return (
    <div
      style={{
        padding: '40px',
        minHeight: '600px',
        backgroundColor: currentTheme.colors.backgroundColor,
        fontFamily: currentTheme.fonts.contentFont,
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          marginBottom: '40px',
          fontWeight: '700',
          fontFamily: currentTheme.fonts.titleFont,
          fontSize: currentTheme.fonts.titleSize,
          color: currentTheme.colors.titleColor,
        }}
      >
        {props.title}
      </h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'start',
          gap: '32px',
        }}
      >
        {props.steps.map((step, index) => {
          // Підтримка масиву рядків (як генерує AI)
          const stepDescription = typeof step === 'string' ? step : step.description;
          return (
            <div
              key={index}
              style={{
                textAlign: 'center',
                maxWidth: '220px',
                background: 'rgba(0,0,0,0.08)',
                borderRadius: '12px',
                padding: '24px 16px',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: currentTheme.colors.accentColor,
                  marginBottom: '10px',
                  fontFamily: currentTheme.fonts.titleFont,
                }}
              >
                {index + 1}
              </div>
              <p
                style={{
                  fontFamily: currentTheme.fonts.contentFont,
                  fontSize: currentTheme.fonts.contentSize,
                  color: currentTheme.colors.contentColor,
                  margin: 0,
                }}
              >
                {stepDescription}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessStepsTemplate; 