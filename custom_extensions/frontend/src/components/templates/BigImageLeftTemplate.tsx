// custom_extensions/frontend/src/components/templates/BigImageLeftTemplate.tsx

import React from 'react';
import { BigImageLeftProps } from '@/types/slideTemplates';

export const BigImageLeftTemplate: React.FC<BigImageLeftProps> = (props) => {
  return (
    <div style={{ padding: '40px', minHeight: '600px', display: 'flex', alignItems: 'center' }}>
      <div style={{ fontSize: '24px', textAlign: 'center', width: '100%' }}>
        BigImageLeftTemplate - Coming Soon
        <div style={{ fontSize: '16px', marginTop: '20px', color: '#666' }}>
          Template ID: {props.slideId}
        </div>
      </div>
    </div>
  );
};

export default BigImageLeftTemplate; 