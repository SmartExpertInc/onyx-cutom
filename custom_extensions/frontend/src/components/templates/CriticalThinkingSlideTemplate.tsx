// custom_extensions/frontend/src/components/templates/CriticalThinkingSlideTemplate.tsx

import React from 'react';
import { CriticalThinkingSlideProps } from '@/types/slideTemplates';
import { SlideTheme } from '@/types/slideThemes';
import CriticalThinkingSlideTemplate_old from './CriticalThinkingSlideTemplate_old';

export const CriticalThinkingSlideTemplate: React.FC<CriticalThinkingSlideProps & {
  theme?: SlideTheme | string;
}> = (props) => {
  return <CriticalThinkingSlideTemplate_old {...props} />;
};

export default CriticalThinkingSlideTemplate; 