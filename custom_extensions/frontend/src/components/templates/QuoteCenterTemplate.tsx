// custom_extensions/frontend/src/components/templates/QuoteCenterTemplate.tsx

import React from 'react';
import { QuoteCenterProps } from '@/types/slideTemplates';

export const QuoteCenterTemplate: React.FC<QuoteCenterProps> = (props) => {
  return (
    <div style={{ padding: '40px', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontStyle: 'italic', marginBottom: '20px' }}>
          "{props.quote}"
        </div>
        {props.author && (
          <div style={{ fontSize: '18px', color: '#666' }}>
            — {props.author}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteCenterTemplate; 