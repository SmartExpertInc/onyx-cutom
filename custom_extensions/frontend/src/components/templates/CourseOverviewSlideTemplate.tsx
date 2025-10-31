// custom_extensions/frontend/src/components/templates/CourseOverviewSlideTemplate.tsx

import React from 'react';
import { CourseOverviewSlideProps } from '@/types/slideTemplates';
import { SlideTheme } from '@/types/slideThemes';
import CourseOverviewSlideTemplate_old from './CourseOverviewSlideTemplate_old';

export const CourseOverviewSlideTemplate: React.FC<CourseOverviewSlideProps & {
  theme?: SlideTheme | string;
}> = (props) => {
  return <CourseOverviewSlideTemplate_old {...props} />;
};

export default CourseOverviewSlideTemplate; 