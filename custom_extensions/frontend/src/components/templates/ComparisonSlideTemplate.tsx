// custom_extensions/frontend/src/components/templates/ComparisonSlideTemplate.tsx

import React from 'react';
import { ComparisonSlideProps } from '@/types/slideTemplates';

export const ComparisonSlideTemplate: React.FC<ComparisonSlideProps> = ({
  title,
  beforeTitle,
  beforeContent,
  afterTitle,
  afterContent,
  backgroundColor = '#ffffff',
  titleColor = '#1a1a1a',
  contentColor = '#333333'
}) => {
  return (
    <div style={{ 
      padding: '40px', 
      minHeight: '600px',
      backgroundColor: backgroundColor  // ← Now using the backgroundColor prop
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        color: titleColor  // ← Now using titleColor prop
      }}>
        {title}
      </h1>
      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ color: '#dc3545' }}>{beforeTitle}</h2>
          <p style={{ color: contentColor }}>{beforeContent}</p>  {/* ← Now using contentColor prop */}
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ color: '#28a745' }}>{afterTitle}</h2>
          <p style={{ color: contentColor }}>{afterContent}</p>  {/* ← Now using contentColor prop */}
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlideTemplate; 