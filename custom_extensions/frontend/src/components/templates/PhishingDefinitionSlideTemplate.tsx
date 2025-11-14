// custom_extensions/frontend/src/components/templates/PhishingDefinitionSlideTemplate.tsx

import React from 'react';
import { PhishingDefinitionSlideProps } from '@/types/slideTemplates';
import { SlideTheme } from '@/types/slideThemes';
import PhishingDefinitionSlideTemplate_old from './PhishingDefinitionSlideTemplate_old';

export const PhishingDefinitionSlideTemplate: React.FC<PhishingDefinitionSlideProps & {
  theme?: SlideTheme | string;
  onVideoClick?: (videoPath: string, elementId?: string) => void; // ✅ NEW: Video click callback
}> = (props) => {
  return <PhishingDefinitionSlideTemplate_old {...props} />;
};

export default PhishingDefinitionSlideTemplate; 