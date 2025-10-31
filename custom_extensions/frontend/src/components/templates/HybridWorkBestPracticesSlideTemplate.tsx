// custom_extensions/frontend/src/components/templates/HybridWorkBestPracticesSlideTemplate.tsx

import React from 'react';
import { HybridWorkBestPracticesSlideProps } from '@/types/slideTemplates';
import { SlideTheme } from '@/types/slideThemes';
import HybridWorkBestPracticesSlideTemplate_old from './HybridWorkBestPracticesSlideTemplate_old';

export const HybridWorkBestPracticesSlideTemplate: React.FC<HybridWorkBestPracticesSlideProps & {
  theme?: SlideTheme | string;
}> = (props) => {
  return <HybridWorkBestPracticesSlideTemplate_old {...props} />;
};

export default HybridWorkBestPracticesSlideTemplate; 