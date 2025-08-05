// components/SlideAddButton.tsx
// Fixed-position slide adding button with template selection

import React, { useState, useRef, useEffect } from 'react';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { getAllTemplates, getTemplate } from './templates/registry';

interface SlideAddButtonProps {
  /** Current slide count for numbering */
  currentSlideCount: number;
  /** Callback when a new slide is added */
  onAddSlide: (newSlide: ComponentBasedSlide) => void;
  /** Whether the button should be visible */
  isVisible?: boolean;
}

export const SlideAddButton: React.FC<SlideAddButtonProps> = ({
  currentSlideCount,
  onAddSlide,
  isVisible = true
}) => {
  // Return null since this functionality has been moved to the right menu
  return null;
};

export default SlideAddButton; 