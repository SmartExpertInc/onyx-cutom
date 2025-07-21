// custom_extensions/frontend/src/components/templates/ProcessStepsTemplate.tsx

import React from 'react';
import { ProcessStepsProps } from '@/types/slideTemplates';

export const ProcessStepsTemplate: React.FC<ProcessStepsProps> = (props) => {
  return (
    <div style={{ padding: '40px', minHeight: '600px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>{props.title}</h1>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'start' }}>
        {props.steps.map((step, index) => (
          <div key={index} style={{ textAlign: 'center', maxWidth: '200px' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>{step.icon || (index + 1)}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessStepsTemplate; 