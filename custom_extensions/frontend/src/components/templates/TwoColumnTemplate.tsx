// custom_extensions/frontend/src/components/templates/TwoColumnTemplate.tsx

import React from 'react';
import { TwoColumnProps } from '@/types/slideTemplates';

export const TwoColumnTemplate: React.FC<TwoColumnProps> = (props) => {
  return (
    <div style={{ padding: '40px', minHeight: '600px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>{props.title}</h1>
      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 1 }}>
          <h2>{props.leftTitle}</h2>
          <p>{props.leftContent}</p>
        </div>
        <div style={{ flex: 1 }}>
          <h2>{props.rightTitle}</h2>
          <p>{props.rightContent}</p>
        </div>
      </div>
    </div>
  );
};

export default TwoColumnTemplate; 