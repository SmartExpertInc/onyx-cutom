// custom_extensions/frontend/src/components/templates/PercentCirclesSlideTemplate.tsx

import React from 'react';
import { PercentCirclesProps } from '@/types/slideTemplates';
import { SlideTheme } from '@/types/slideThemes';
import PercentCirclesSlideTemplate_old from './PercentCirclesSlideTemplate_old';

export const PercentCirclesSlideTemplate: React.FC<PercentCirclesProps & {
  theme?: SlideTheme | string;
  onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;
}> = (props) => {
  return <PercentCirclesSlideTemplate_old {...props} />;
};

export default PercentCirclesSlideTemplate;