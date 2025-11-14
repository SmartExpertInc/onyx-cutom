// custom_extensions/frontend/src/components/templates/HybridWorkBestPracticesSlideTemplate.tsx

import React from 'react';
import { HybridWorkBestPracticesSlideProps } from '@/types/slideTemplates';
import { SlideTheme } from '@/types/slideThemes';
import HybridWorkBestPracticesSlideTemplate_old from './HybridWorkBestPracticesSlideTemplate_old';

export const HybridWorkBestPracticesSlideTemplate: React.FC<HybridWorkBestPracticesSlideProps & {
  theme?: SlideTheme | string;
  onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;
  onVideoClick?: (videoPath: string, elementId?: string) => void; // ✅ NEW: Video click callback
}> = (props) => {
  return <HybridWorkBestPracticesSlideTemplate_old {...props} />;
};

export default HybridWorkBestPracticesSlideTemplate; 