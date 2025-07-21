// custom_extensions/frontend/src/components/templates/ComparisonSlideTemplate.tsx

import React from 'react';
import { ComparisonSlideProps } from '@/types/slideTemplates';

export const ComparisonSlideTemplate: React.FC<ComparisonSlideProps> = (props) => {
  return (
    <div style={{ padding: '40px', minHeight: '600px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>{props.title}</h1>
      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ color: '#dc3545' }}>{props.beforeTitle}</h2>
          <p>{props.beforeContent}</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ color: '#28a745' }}>{props.afterTitle}</h2>
          <p>{props.afterContent}</p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlideTemplate; 