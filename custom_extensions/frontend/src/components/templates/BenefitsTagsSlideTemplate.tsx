// custom_extensions/frontend/src/components/templates/BenefitsTagsSlideTemplate.tsx

import React from 'react';
import { BenefitsTagsSlideProps } from '@/types/slideTemplates';
import { SlideTheme } from '@/types/slideThemes';
import BenefitsTagsSlideTemplate_old from './BenefitsTagsSlideTemplate_old';

export const BenefitsTagsSlideTemplate: React.FC<BenefitsTagsSlideProps & {
  theme?: SlideTheme | string;
}> = (props) => {
  return <BenefitsTagsSlideTemplate_old {...props} />;
};

export default BenefitsTagsSlideTemplate; 