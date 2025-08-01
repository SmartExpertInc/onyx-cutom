"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  TextPresentationData, AnyContentBlock, HeadlineBlock, ParagraphBlock,
  BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock, ImageBlock,
} from '@/types/textPresentation';
import {
  CheckCircle, Info as InfoIconLucide, XCircle, AlertTriangle,
  Settings, X, Palette, Type, List, AlertCircle, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { locales } from '@/locales';
import { useLanguage } from '../contexts/LanguageContext';
import { uploadOnePagerImage } from '@/lib/designTemplateApi';

// Type definitions for internal structuring
type MiniSection = {
  type: "mini_section";
  headline: HeadlineBlock;
  list: BulletListBlock | NumberedListBlock | ParagraphBlock | AlertBlock;
};
type StandaloneBlock = { type: "standalone_block"; content: AnyContentBlock };
type MajorSection = {
  type: "major_section";
  headline: HeadlineBlock;
  items: Array<AnyContentBlock | MiniSection>;
  _skipRenderHeadline?: boolean
};
type RenderableItem = MajorSection | MiniSection | StandaloneBlock;

const parseAndStyleText = (text: string | undefined | null): React.ReactNode[] => {
  if (!text) return [];
  const segments = text.split(/\*\*(.*?)\*\*/g); 
  return segments.map((segment, index) => {
    if (index % 2 === 1) { 
      return <span key={index} className="font-medium text-black">{segment}</span>;
    }
    return segment; 
  }).filter(segment => segment !== ""); 
};

const NewBulletIcon = () => (
  <div className="w-0.75 h-0.75 rounded-full bg-black mr-1.5 mt-[1px] shrink-0" />
);

// Helper function to detect if text starts with an emoji
const startsWithEmoji = (text: string): boolean => {
  const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(text.trim());
};

// Helper function to get the first emoji from text
const getFirstEmoji = (text: string): string | null => {
  const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  const match = text.trim().match(emojiRegex);
  return match ? match[0] : null;
};

// Helper function to render emoji as bullet icon
const EmojiBulletIcon: React.FC<{emoji: string}> = ({ emoji }) => (
  <span className="mr-1.5 mt-[1px] shrink-0 text-base">{emoji}</span>
);

// --- New Icon Set ---
const InfoIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </svg>
);
const GoalIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg width="1em" height="1em" viewBox="-1 -1 18 18" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" style={{overflow:'visible'}}>
        <rect width="16" height="16" rx="8" fill="#FF1414"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M7.66681 3.66672C5.08942 3.66672 3 5.75606 3 8.33336C3 10.9107 5.08942 13 7.66681 13C10.2442 13 12.3336 10.9107 12.3336 8.33336C12.3336 7.70679 12.2098 7.10913 11.9858 6.56324L11.9441 6.6049C11.8353 6.71373 11.6922 6.78166 11.5391 6.79694L11.0311 6.84761C11.232 7.30193 11.3438 7.80451 11.3438 8.33325C11.3438 10.364 9.69753 12.0101 7.66681 12.0101C5.63599 12.0101 3.9898 10.3639 3.9898 8.33325C3.9898 6.30261 5.6361 4.65637 7.66681 4.65637C8.19535 4.65637 8.69784 4.76817 9.15206 4.96889L9.20263 4.46137C9.21791 4.30813 9.28617 4.1649 9.39489 4.05607L9.43656 4.01441C8.89076 3.79049 8.2933 3.66672 7.66681 3.66672ZM9.36818 6.16003L9.53428 4.49445C9.5422 4.41772 9.5765 4.34627 9.63058 4.29175L10.8249 3.09753C10.9172 3.00574 11.0538 2.97551 11.1757 3.02069C11.2977 3.06576 11.3832 3.17766 11.393 3.30715L11.4873 4.51237L12.6933 4.60713C12.822 4.61735 12.9342 4.70188 12.9793 4.82401C13.0245 4.94602 12.9941 5.08321 12.9027 5.175L11.7085 6.36922C11.6544 6.42385 11.5827 6.4576 11.506 6.4653L9.84 6.63139L7.90272 8.56893C7.83786 8.63389 7.75234 8.66665 7.66681 8.66665C7.58129 8.66665 7.49576 8.63389 7.4309 8.56893C7.30119 8.43878 7.30119 8.22772 7.4309 8.09746L9.36818 6.16003ZM7.66681 6.99997C7.78609 6.99997 7.90173 7.01569 8.01177 7.04515L7.19522 7.86178C6.93524 8.12175 6.93534 8.54398 7.19489 8.80428C7.3201 8.92981 7.48961 8.99994 7.66681 8.99994C7.84391 8.99994 8.0132 8.92981 8.13841 8.80461L8.95485 7.98798C8.98431 8.09812 9.00014 8.21387 9.00014 8.33336C9.00014 9.06975 8.40323 9.66664 7.66681 9.66664C6.9304 9.66664 6.33348 9.06975 6.33348 8.33336C6.33348 7.59697 6.9304 6.99997 7.66681 6.99997ZM7.66681 5.32296C8.1782 5.32296 8.6598 5.45069 9.08149 5.6756L9.04829 6.00845L8.52865 6.52806C8.26768 6.40319 7.97538 6.33328 7.6667 6.33328C6.56214 6.33328 5.66666 7.22872 5.66666 8.33325C5.66666 9.43777 6.56214 10.3332 7.6667 10.3332C8.77127 10.3332 9.66675 9.43777 9.66675 8.33325C9.66675 8.02447 9.59672 7.73207 9.47174 7.47089L9.99148 6.95105L10.3241 6.91786C10.5494 7.33975 10.6771 7.82144 10.6771 8.33303C10.6771 9.99553 9.32927 11.3433 7.6667 11.3433C6.00414 11.3433 4.6563 9.99553 4.6563 8.33303C4.6563 6.67053 6.00425 5.32296 7.66681 5.32296Z" fill="white"/>
    </svg>
);
const StarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg width="1em" height="1em" viewBox="-1 -1 18 18" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" style={{overflow:'visible'}}>
        <rect width="16" height="16" rx="8" fill="#FF1414"/>
        <path d="M7.68389 3.24065C7.78339 2.91978 8.21661 2.91978 8.31611 3.24065L9.26859 6.31234C9.31309 6.45584 9.4407 6.553 9.5847 6.553H12.667C12.989 6.553 13.1228 6.98473 12.8624 7.18304L10.3687 9.08144C10.2522 9.17013 10.2035 9.32733 10.248 9.47083L11.2005 12.5425C11.3 12.8634 10.9495 13.1302 10.689 12.9319L8.19536 11.0335C8.07887 10.9448 7.92113 10.9448 7.80464 11.0335L5.31101 12.9319C5.05052 13.1302 4.70004 12.8634 4.79954 12.5425L5.75202 9.47083C5.79651 9.32733 5.74777 9.17013 5.63127 9.08144L3.13765 7.18304C2.87716 6.98473 3.01103 6.553 3.33301 6.553H6.41531C6.5593 6.553 6.68692 6.45584 6.73141 6.31234L7.68389 3.24065Z" fill="white"/>
    </svg>
);
const AppleIcon: React.FC<{className?: string}> = ({ className }) => <svg viewBox="0 0 24 24" width="1em" height="1em" className={className} fill="currentColor"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>;
const AwardIcon: React.FC<{className?: string}> = ({ className }) => <svg viewBox="0 0 24 24" width="1em" height="1em" className={className} strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>;
const BoxesIcon: React.FC<{className?: string}> = ({ className }) => <svg viewBox="0 0 24 24" width="1em" height="1em" className={className} strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="m7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5-3-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/></svg>;
const CalendarIcon: React.FC<{className?: string}> = ({ className }) => <svg viewBox="0 0 24 24" width="1em" height="1em" className={className} strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M11 14h1v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M8 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/></svg>;
const ChartIcon: React.FC<{className?: string}> = ({ className }) => <svg viewBox="0 0 24 24" width="1em" height="1em" className={className} strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 11.207a.5.5 0 0 1 .146-.353l2-2a.5.5 0 0 1 .708 0l3.292 3.292a.5.5 0 0 0 .708 0l4.292-4.292a.5.5 0 0 1 .854.353V16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z"/></svg>;
const ClockIcon: React.FC<{className?: string}> = ({ className }) => <svg viewBox="0 0 24 24" width="1em" height="1em" className={className} strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const GlobeIcon: React.FC<{className?: string}> = ({ className }) => <svg viewBox="0 0 24 24" width="1em" height="1em" className={className} strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;


const iconMap: { [key: string]: React.ElementType } = {
  info: InfoIcon,
  goal: GoalIcon,
  star: StarIcon,
  apple: AppleIcon,
  award: AwardIcon,
  boxes: BoxesIcon,
  calendar: CalendarIcon,
  chart: ChartIcon,
  clock: ClockIcon,
  globe: GlobeIcon,
  // Add Lucide icon mappings for alerts to match PDF defaults
  check: CheckCircle,
  alertTriangle: AlertTriangle,
  xCircle: XCircle,
  // Add new-bullet for bullet lists
  'new-bullet': NewBulletIcon,
  // Add none for no icon
  none: () => null,
};

const THEME_COLORS = {
  primaryText: 'text-black',        
  headingText: 'text-black',        
  subHeadingText: 'text-black',     
  accentRed: 'text-[#FF1414]', 
  accentRedBg: 'bg-[#FF1414]',      
  veryLightAccentBg: 'bg-[#FAFAFA]',
  lightBorder: 'border-gray-200',   
  mutedText: 'text-black',          
  defaultBorder: 'border-gray-300', 
  underlineAccent: 'border-[#FF1414]',
  alertInfoText: 'text-black',      
  alertSuccessText: 'text-black',   
  alertWarningText: 'text-black',   
  alertDangerText: 'text-black',    
  alertInfoIcon: 'text-blue-500', 
  alertSuccessIcon: 'text-green-500',
  alertWarningIcon: 'text-yellow-500',
  alertDangerIcon: 'text-red-500',
  alertInfoBg: 'bg-blue-50', alertInfoBorder: 'border-blue-400',
  alertSuccessBg: 'bg-green-50', alertSuccessBorder: 'border-green-400',
  alertWarningBg: 'bg-yellow-50', alertWarningBorder: 'border-yellow-400',
  alertDangerBg: 'bg-red-50', alertDangerBorder: 'border-red-400',
};

const editingInputClass = "w-full p-1 bg-yellow-50 border border-yellow-300 rounded text-black outline-none focus:ring-1 focus:ring-yellow-500";
const editingTextareaClass = `${editingInputClass} min-h-[50px] resize-y`;

const getAlertColors = (alertType: AlertBlock['alertType']) => {
  switch (alertType) {
    case 'success':
      return {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-500',
        textColor: 'text-black',
        iconColorClass: 'text-green-500',
        Icon: CheckCircle
      };
    case 'warning':
      return {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-500',
        textColor: 'text-black',
        iconColorClass: 'text-yellow-500',
        Icon: AlertTriangle
      };
    case 'danger':
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500',
        textColor: 'text-black',
        iconColorClass: 'text-red-500',
        Icon: XCircle
      };
    case 'info':
    default:
      return {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        textColor: 'text-black',
        iconColorClass: 'text-blue-500',
        Icon: InfoIconLucide
      };
  }
};

interface RenderBlockProps { 
  block: AnyContentBlock;
  depth?: number;
  isFirstInBox?: boolean;
  isLastInBox?: boolean;
  isMiniSectionHeadline?: boolean;
  isListItemContent?: boolean;
  isEditing?: boolean;
  onTextChange?: (path: (string | number)[], newValue: any) => void;
  basePath?: (string | number)[];
  suppressRecommendationStripe?: boolean;
  contentBlockIndex?: number;
  onMoveBlockUp?: (index: number) => void;
  onMoveBlockDown?: (index: number) => void;
  isFirstBlock?: boolean;
  isLastBlock?: boolean;
}

// Modern Settings Modal Component
const BlockSettingsModal = ({ 
  isOpen, 
  onClose, 
  block, 
  onTextChange, 
  basePath 
}: {
  isOpen: boolean;
  onClose: () => void;
  block: AnyContentBlock;
  onTextChange?: (path: (string | number)[], newValue: any) => void;
  basePath: (string | number)[];
}) => {
  const { t } = useLanguage();
  
  const fieldPath = (fieldKey: string) => {
    const path = [...basePath, fieldKey];
    console.log('🔧 [FIELD PATH] Creating path:', {
      fieldKey,
      basePath,
      resultPath: path,
      basePathString: JSON.stringify(basePath),
      resultPathString: JSON.stringify(path)
    });
    return path;
  };
  
  if (!isOpen) return null;

  // Debug modal when it opens
  console.log('🏗️ [MODAL OPENED] BlockSettingsModal props:', {
    blockType: block.type,
    basePath,
    onTextChangeAvailable: !!onTextChange,
    blockData: block
  });

  const renderHeadlineSettings = () => {
    const headlineBlock = block as HeadlineBlock;
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">{t('interface.blockSettings.importantSection')}</label>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={!!headlineBlock.isImportant}
              onChange={e => onTextChange?.(fieldPath('isImportant'), String(e.target.checked))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{t('interface.blockSettings.importantSectionDescription')}</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">{t('interface.blockSettings.icon')}</label>
          <select
            value={headlineBlock.iconName || ''}
            onChange={e => onTextChange?.(fieldPath('iconName'), e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="">{t('interface.blockSettings.noIcon')}</option>
            <option value="info">ℹ️ {t('interface.blockSettings.infoIcon')}</option>
            <option value="goal">🎯 {t('interface.blockSettings.goalIcon')}</option>
            <option value="star">⭐ {t('interface.blockSettings.starIcon')}</option>
            <option value="apple">🍎 {t('interface.blockSettings.appleIcon')}</option>
            <option value="award">🏆 {t('interface.blockSettings.awardIcon')}</option>
            <option value="boxes">📦 {t('interface.blockSettings.boxesIcon')}</option>
            <option value="calendar">📅 {t('interface.blockSettings.calendarIcon')}</option>
            <option value="chart">📊 {t('interface.blockSettings.chartIcon')}</option>
            <option value="clock">⏰ {t('interface.blockSettings.clockIcon')}</option>
            <option value="globe">🌍 {t('interface.blockSettings.globeIcon')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">{t('interface.blockSettings.headingLevel')}</label>
          <select
            value={headlineBlock.level || 1}
            onChange={e => onTextChange?.(fieldPath('level'), e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value={1}>{t('interface.blockSettings.large')} (H1)</option>
            <option value={2}>{t('interface.blockSettings.medium')} (H2)</option>
            <option value={3}>{t('interface.blockSettings.small')} (H3)</option>
            <option value={4}>{t('interface.blockSettings.extraSmall')} (H4)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">{t('interface.blockSettings.fontSize')}</label>
          <select
            value={headlineBlock.fontSize || '10px'}
            onChange={e => onTextChange?.(fieldPath('fontSize'), e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="8px">{t('interface.blockSettings.extraSmall')} (8px)</option>
            <option value="10px">{t('interface.blockSettings.small')} (10px)</option>
            <option value="12px">{t('interface.blockSettings.medium')} (12px)</option>
            <option value="14px">{t('interface.blockSettings.large')} (14px)</option>
            <option value="16px">{t('interface.blockSettings.extraLarge')} (16px)</option>
          </select>
        </div>
      </div>
    );
  };

  const renderParagraphSettings = () => {
    const paragraphBlock = block as ParagraphBlock;
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">{t('interface.blockSettings.recommendation')}</label>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={!!paragraphBlock.isRecommendation}
              onChange={e => onTextChange?.(fieldPath('isRecommendation'), String(e.target.checked))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{t('interface.blockSettings.recommendationDescription')}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">{t('interface.blockSettings.textSize')}</label>
          <select
            value={paragraphBlock.fontSize || '10px'}
            onChange={e => onTextChange?.(fieldPath('fontSize'), e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="8px">{t('interface.blockSettings.extraSmall')} (8px)</option>
            <option value="10px">{t('interface.blockSettings.small')} (10px)</option>
            <option value="12px">{t('interface.blockSettings.medium')} (12px)</option>
            <option value="14px">{t('interface.blockSettings.large')} (14px)</option>
            <option value="16px">{t('interface.blockSettings.extraLarge')} (16px)</option>
          </select>
        </div>
      </div>
    );
  };

  const renderListSettings = () => {
    const listBlock = block as BulletListBlock;
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">List Icon</label>
          <select
            value={listBlock.iconName || ''}
            onChange={e => onTextChange?.(fieldPath('iconName'), e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="">Default bullet</option>
            <option value="none">No icon</option>
            <option value="info">ℹ️ Info</option>
            <option value="goal">🎯 Goal</option>
            <option value="star">⭐ Star</option>
            <option value="apple">🍎 Apple</option>
            <option value="award">🏆 Award</option>
            <option value="boxes">📦 Boxes</option>
            <option value="calendar">📅 Calendar</option>
            <option value="chart">📊 Chart</option>
            <option value="clock">⏰ Clock</option>
            <option value="globe">🌍 Globe</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">Text Size</label>
          <select
            value={listBlock.fontSize || '10px'}
            onChange={e => onTextChange?.(fieldPath('fontSize'), e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="8px">Extra Small (8px)</option>
            <option value="10px">Small (10px)</option>
            <option value="12px">Medium (12px)</option>
            <option value="14px">Large (14px)</option>
            <option value="16px">Extra Large (16px)</option>
          </select>
        </div>
      </div>
    );
  };

  const renderAlertSettings = () => {
    const alertBlock = block as AlertBlock;
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">Alert Type</label>
          <select
            value={alertBlock.alertType}
            onChange={e => onTextChange?.(fieldPath('alertType'), e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="info">ℹ️ Info</option>
            <option value="success">✅ Success</option>
            <option value="warning">⚠️ Warning</option>
            <option value="danger">❌ Danger</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">Custom Icon</label>
          <select
            value={alertBlock.iconName || ''}
            onChange={e => onTextChange?.(fieldPath('iconName'), e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="">Use default for alert type</option>
            <option value="info">ℹ️ Info</option>
            <option value="check">✅ Check</option>
            <option value="alertTriangle">⚠️ Warning</option>
            <option value="xCircle">❌ Error</option>
            <option value="goal">🎯 Goal</option>
            <option value="star">⭐ Star</option>
            <option value="apple">🍎 Apple</option>
            <option value="award">🏆 Award</option>
            <option value="boxes">📦 Boxes</option>
            <option value="calendar">📅 Calendar</option>
            <option value="chart">📊 Chart</option>
            <option value="clock">⏰ Clock</option>
            <option value="globe">🌍 Globe</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">Background Color</label>
            <input
              type="color"
              value={alertBlock.backgroundColor || '#ffffff'}
              onChange={e => onTextChange?.(fieldPath('backgroundColor'), e.target.value)}
              className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">Border Color</label>
            <input
              type="color"
              value={alertBlock.borderColor || '#000000'}
              onChange={e => onTextChange?.(fieldPath('borderColor'), e.target.value)}
              className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">Text Color</label>
            <input
              type="color"
              value={alertBlock.textColor || '#000000'}
              onChange={e => onTextChange?.(fieldPath('textColor'), e.target.value)}
              className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">Icon Color</label>
            <input
              type="color"
              value={alertBlock.iconColor || '#000000'}
              onChange={e => onTextChange?.(fieldPath('iconColor'), e.target.value)}
              className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">Text Size</label>
          <select
            value={alertBlock.fontSize || '10px'}
            onChange={e => onTextChange?.(fieldPath('fontSize'), e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="8px">Extra Small (8px)</option>
            <option value="10px">Small (10px)</option>
            <option value="12px">Medium (12px)</option>
            <option value="14px">Large (14px)</option>
            <option value="16px">Extra Large (16px)</option>
          </select>
        </div>
      </div>
    );
  };

  const renderImageSettings = () => {
    const imageBlock = block as ImageBlock;
    return (
      <div className="space-y-8">
        {/* Image Preview */}
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-2">{t('interface.imageSettings.imagePreview', 'Image Preview')}</div>
            {imageBlock.src ? (
              <img 
                src={imageBlock.src} 
                alt={imageBlock.alt || t('interface.imageSettings.preview', 'Preview')} 
                className="max-w-full h-auto max-h-32 mx-auto rounded"
                style={{ 
                  maxWidth: imageBlock.maxWidth || '100%',
                  borderRadius: imageBlock.borderRadius || '8px'
                }}
              />
            ) : (
              <div className="text-gray-400 text-sm">{t('interface.imageSettings.noImageLoaded', 'No image loaded')}</div>
            )}
          </div>
        </div>

        {/* Alt Text */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('interface.imageSettings.altText', 'Alt Text')} <span className="text-gray-500 font-normal">({t('interface.imageSettings.forAccessibility', 'for accessibility')})</span>
          </label>
          <input
            type="text"
            value={imageBlock.alt || ''}
            onChange={e => onTextChange?.(fieldPath('alt'), e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            placeholder={t('interface.imageSettings.altTextPlaceholder', 'Describe what this image shows...')}
          />
          <p className="text-xs text-gray-500 mt-1">{t('interface.imageSettings.altTextHelp', 'This helps screen readers describe the image to users')}</p>
        </div>
        
        {/* Caption */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('interface.imageSettings.caption', 'Caption')} <span className="text-gray-500 font-normal">({t('interface.imageSettings.optional', 'optional')})</span>
          </label>
          <input
            type="text"
            value={imageBlock.caption || ''}
            onChange={e => onTextChange?.(fieldPath('caption'), e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            placeholder={t('interface.imageSettings.captionPlaceholder', 'Add a caption below the image...')}
          />
        </div>
        
        {/* Max Width */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('interface.imageSettings.maxWidth', 'Max Width')} <span className="text-gray-500 font-normal">({t('interface.imageSettings.controlsImageSize', 'controls image size')})</span>
          </label>
          <input
            type="text"
            value={imageBlock.maxWidth || '100%'}
            onChange={e => onTextChange?.(fieldPath('maxWidth'), e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            placeholder={t('interface.imageSettings.maxWidthPlaceholder', 'e.g., 100%, 500px, 50vw')}
          />
          <p className="text-xs text-gray-500 mt-1">{t('interface.imageSettings.maxWidthHelp', 'Examples: 100% (full width), 500px (fixed width), 50vw (half viewport width)')}</p>
        </div>

        {/* Size Controls */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <label className="block text-sm font-semibold text-blue-900 mb-3">
            {t('interface.imageSettings.quickSizeControls', 'Quick Size Controls')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const currentWidth = typeof imageBlock.width === 'number' ? imageBlock.width : 300;
                const newWidth = Math.max(50, currentWidth - 50);
                onTextChange?.(fieldPath('width'), newWidth);
              }}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
              {t('interface.imageSettings.smaller', 'Smaller')}
            </button>
            <button
              onClick={() => {
                const currentWidth = typeof imageBlock.width === 'number' ? imageBlock.width : 300;
                const newWidth = Math.min(800, currentWidth + 50);
                onTextChange?.(fieldPath('width'), newWidth);
              }}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
              {t('interface.imageSettings.larger', 'Larger')}
            </button>
            <button
              onClick={() => {
                onTextChange?.(fieldPath('width'), 300);
              }}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
              title={t('interface.imageSettings.resetToDefaultSize', 'Reset to default size')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            {t('interface.imageSettings.currentWidth', 'Current width')}: {typeof imageBlock.width === 'number' ? `${imageBlock.width}px` : t('interface.imageSettings.auto', 'auto')}
          </p>
        </div>

        {/* Basic Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">{t('interface.imageSettings.alignment', 'Alignment')}</label>
          <select
            value={imageBlock.alignment || 'center'}
            onChange={e => onTextChange?.(fieldPath('alignment'), e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="left">{t('interface.imageSettings.left', 'Left')}</option>
            <option value="center">{t('interface.imageSettings.center', 'Center')}</option>
            <option value="right">{t('interface.imageSettings.right', 'Right')}</option>
          </select>
        </div>
        
        <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">{t('interface.imageSettings.borderRadius', 'Border Radius')}</label>
          <select
            value={imageBlock.borderRadius || '8px'}
            onChange={e => onTextChange?.(fieldPath('borderRadius'), e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="0px">{t('interface.imageSettings.none', 'None')}</option>
              <option value="4px">{t('interface.imageSettings.small', 'Small')}</option>
              <option value="8px">{t('interface.imageSettings.medium', 'Medium')}</option>
              <option value="12px">{t('interface.imageSettings.large', 'Large')}</option>
            <option value="50%">{t('interface.imageSettings.circular', 'Circular')}</option>
          </select>
          </div>
        </div>

        {/* Layout Settings */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {t('interface.imageSettings.layoutOptions', 'Layout Options')}
          </h3>
          
          {/* Layout Mode */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('interface.imageSettings.layoutMode', 'Layout Mode')} <span className="text-gray-500 font-normal">({t('interface.imageSettings.layoutModeHelp', 'how image appears with other content')})</span>
            </label>
            <select
              value={imageBlock.layoutMode || 'standalone'}
              onChange={e => {
                const newLayoutMode = e.target.value;
                console.log('🔄 [LAYOUT CHANGE] Setting layoutMode:', newLayoutMode, 'for block:', {
                  originalBlock: imageBlock,
                  currentLayoutMode: imageBlock.layoutMode,
                  newLayoutMode: newLayoutMode,
                  fieldPath: fieldPath('layoutMode'),
                  fullPath: [...(basePath || []), 'layoutMode']
                });
                
                // Call onTextChange and verify it's working
                const result = onTextChange?.(fieldPath('layoutMode'), newLayoutMode);
                console.log('🔄 [LAYOUT CHANGE] onTextChange result:', result);
                console.log('🔄 [LAYOUT CHANGE] onTextChange function:', onTextChange);
                console.log('🔄 [LAYOUT CHANGE] basePath from modal:', basePath);
                console.log('✅ [LAYOUT CHANGE] Change applied successfully! The layoutMode should now be saved to the backend.');
                console.log('ℹ️ [LAYOUT CHANGE] Note: The modal block reference may show old data due to React state timing, but the actual data is updated correctly.');
                
                // Close modal after successful change
                setTimeout(() => {
                  console.log('🔄 [LAYOUT CHANGE] Closing modal after successful change application.');
                }, 50);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="standalone">📄 {t('interface.imageSettings.standalone', 'Standalone (full width)')}</option>
              <option value="side-by-side-left">⬅️ {t('interface.imageSettings.sideBySideLeft', 'Side-by-side (image left)')}</option>
              <option value="side-by-side-right">➡️ {t('interface.imageSettings.sideBySideRight', 'Side-by-side (image right)')}</option>
              <option value="inline-left">⬅️ {t('interface.imageSettings.inlineLeft', 'Inline (image left, text wraps)')}</option>
              <option value="inline-right">➡️ {t('interface.imageSettings.inlineRight', 'Inline (image right, text wraps)')}</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {t('interface.imageSettings.layoutModeDescription', 'Side-by-side: Image and content are equal height. Inline: Text flows around the image.')}
            </p>
          </div>

          {/* Layout Partner Selection - Only show for side-by-side modes */}
          {(imageBlock.layoutMode === 'side-by-side-left' || imageBlock.layoutMode === 'side-by-side-right') && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t('interface.imageSettings.partnerContent', 'Partner Content')} <span className="text-gray-500 font-normal">({t('interface.imageSettings.partnerContentHelp', 'content to place alongside image')})</span>
              </label>
              <select
                value={imageBlock.layoutPartnerIndex || ''}
                onChange={e => {
                  const value = e.target.value ? parseInt(e.target.value) : null;
                  console.log('🔄 [LAYOUT CHANGE] Setting layoutPartnerIndex:', value, 'for block:', imageBlock);
                  onTextChange?.(fieldPath('layoutPartnerIndex'), value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="">{t('interface.imageSettings.selectContentBlock', 'Select content block...')}</option>
                {/* This will be populated dynamically based on available content blocks */}
                <option value="0">{t('interface.imageSettings.block1', 'Block 1: Headline/Paragraph')}</option>
                <option value="1">{t('interface.imageSettings.block2', 'Block 2: List/Content')}</option>
                <option value="2">{t('interface.imageSettings.block3', 'Block 3: Another content block')}</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {t('interface.imageSettings.partnerContentDescription', 'Choose which content block should appear alongside this image.')}
              </p>
            </div>
          )}

          {/* Layout Proportion - Only show for side-by-side modes */}
          {(imageBlock.layoutMode === 'side-by-side-left' || imageBlock.layoutMode === 'side-by-side-right') && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t('interface.imageSettings.spaceDistribution', 'Space Distribution')} <span className="text-gray-500 font-normal">({t('interface.imageSettings.spaceDistributionHelp', 'how much space each element gets')})</span>
              </label>
              <select
                value={imageBlock.layoutProportion || '50-50'}
                onChange={e => {
                  console.log('🔄 [LAYOUT CHANGE] Setting layoutProportion:', e.target.value, 'for block:', imageBlock);
                  onTextChange?.(fieldPath('layoutProportion'), e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="50-50">⚖️ {t('interface.imageSettings.equal', 'Equal (50% each)')}</option>
                <option value="60-40">📊 {t('interface.imageSettings.imageLarger', 'Image larger (60% image, 40% content)')}</option>
                <option value="40-60">📝 {t('interface.imageSettings.contentLarger', 'Content larger (40% image, 60% content)')}</option>
                <option value="70-30">🖼️ {t('interface.imageSettings.imageDominant', 'Image dominant (70% image, 30% content)')}</option>
                <option value="30-70">📄 {t('interface.imageSettings.contentDominant', 'Content dominant (30% image, 70% content)')}</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {t('interface.imageSettings.spaceDistributionDescription', 'Controls how much horizontal space the image and content each take up.')}
              </p>
            </div>
          )}

          {/* Layout Preview */}
          {(imageBlock.layoutMode && imageBlock.layoutMode !== 'standalone') && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-dashed border-blue-200">
              <div className="text-center">
                <div className="text-blue-600 text-sm font-medium mb-2">{t('interface.imageSettings.layoutPreview', 'Layout Preview')}</div>
                <div className="flex items-center justify-center space-x-2 text-xs">
                  {imageBlock.layoutMode === 'side-by-side-left' && (
                    <>
                      <div className="bg-blue-200 px-2 py-1 rounded">🖼️ {t('interface.imageSettings.image', 'Image')}</div>
                      <div className="text-blue-400">+</div>
                      <div className="bg-green-200 px-2 py-1 rounded">📄 {t('interface.imageSettings.content', 'Content')}</div>
                    </>
                  )}
                  {imageBlock.layoutMode === 'side-by-side-right' && (
                    <>
                      <div className="bg-green-200 px-2 py-1 rounded">📄 {t('interface.imageSettings.content', 'Content')}</div>
                      <div className="text-blue-400">+</div>
                      <div className="bg-blue-200 px-2 py-1 rounded">🖼️ {t('interface.imageSettings.image', 'Image')}</div>
                    </>
                  )}
                  {(imageBlock.layoutMode === 'inline-left' || imageBlock.layoutMode === 'inline-right') && (
                    <div className="text-blue-600">
                      {t('interface.imageSettings.textWillWrap', 'Text will wrap around the image')}
                    </div>
                  )}
                </div>
                {imageBlock.layoutProportion && (
                  <div className="text-xs text-blue-500 mt-1">
                    {t('interface.imageSettings.space', 'Space')}: {imageBlock.layoutProportion}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getBlockTitle = () => {
    switch (block.type) {
      case 'headline': return t('interface.blockSettings.headlineSettings');
      case 'paragraph': return t('interface.blockSettings.paragraphSettings');
      case 'bullet_list': return t('interface.blockSettings.bulletListSettings');
      case 'numbered_list': return t('interface.blockSettings.numberedListSettings');
      case 'alert': return t('interface.blockSettings.alertSettings');
      case 'image': return t('interface.blockSettings.imageSettings');
      default: return t('interface.blockSettings.blockSettings');
    }
  };

  const getBlockIcon = () => {
    switch (block.type) {
      case 'headline': return <Type className="w-5 h-5" />;
      case 'paragraph': return <Type className="w-5 h-5" />;
      case 'bullet_list': return <List className="w-5 h-5" />;
      case 'numbered_list': return <List className="w-5 h-5" />;
      case 'alert': return <AlertCircle className="w-5 h-5" />;
      case 'image': return <Settings className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const renderSettings = () => {
    switch (block.type) {
      case 'headline': return renderHeadlineSettings();
      case 'paragraph': return renderParagraphSettings();
      case 'bullet_list': return renderListSettings();
      case 'numbered_list': return renderListSettings();
      case 'alert': return renderAlertSettings();
      case 'image': return renderImageSettings();
      default: return <p className="text-gray-500">No settings available for this block type.</p>;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}>
      <div className="absolute inset-0 backdrop-blur-sm bg-white bg-opacity-30" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            {getBlockIcon()}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{getBlockTitle()}</h2>
                <p className="text-blue-100 text-sm">{t('interface.modal.customizeContent', 'Customize your content')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {renderSettings()}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('interface.modal.cancel', 'Cancel')}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('interface.modal.applyChanges', 'Apply Changes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add a simple Switch component for better UX
const Switch = ({ checked, onChange, label, help }: { checked: boolean, onChange: (v: boolean) => void, label: string, help?: string }) => (
  <label className="flex items-center gap-1 mt-1 mb-1 cursor-pointer select-none text-xs">
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="form-checkbox h-3 w-3 text-green-500 border-gray-300 rounded focus:ring-0"
      style={{ minWidth: 12, minHeight: 12 }}
    />
    <span className="font-medium text-gray-800 text-xs">{label}</span>
    {help && <span className="text-[10px] text-gray-400 ml-1">{help}</span>}
  </label>
);

// Update RenderBlock to use the new modal approach
const RenderBlock: React.FC<RenderBlockProps> = (props) => {
  const { 
    block, depth = 0, isFirstInBox, isLastInBox, 
    isMiniSectionHeadline, isListItemContent,
    isEditing, onTextChange, basePath = [],
    suppressRecommendationStripe, contentBlockIndex,
    onMoveBlockUp, onMoveBlockDown, isFirstBlock, isLastBlock
  } = props;

  const [showSettings, setShowSettings] = useState(false);

  const fieldPath = (fieldKey: string) => {
    const path = [...basePath, fieldKey];
    console.log('🔧 [FIELD PATH] Creating path:', {
      fieldKey,
      basePath,
      resultPath: path,
      basePathString: JSON.stringify(basePath),
      resultPathString: JSON.stringify(path)
    });
    return path;
  };
  const listItemPath = (itemIndex: number, fieldKey?: string) => {
      const path = [...basePath, 'items', itemIndex];
      return fieldKey ? [...path, fieldKey] : path;
  };

  const handleInputChangeEvent = (
    pathForData: (string | number)[], 
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> 
  ) => {
    if (onTextChange) {
      onTextChange(pathForData, event.target.value);
    }
  };
  
  switch (block.type) {
    case 'headline': {
      const { level, text, backgroundColor, textColor: headlineTextColor, iconName, isImportant, fontSize } = block as HeadlineBlock;
      const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
      const IconComponent = iconName ? iconMap[iconName] : null;
      
      let textStyleClass = 'uppercase '; 
      if (level === 1) { textStyleClass += `text-lg lg:text-xl font-bold ${THEME_COLORS.headingText}`; } 
      else if (level === 2) { textStyleClass += `text-base lg:text-lg font-bold ${THEME_COLORS.headingText}`; }  
      else if (level === 3) { textStyleClass += `text-base lg:text-lg font-bold ${THEME_COLORS.headingText}`; } 
      else if (level === 4) { textStyleClass += `text-sm lg:text-base font-bold ${THEME_COLORS.subHeadingText}`; }
      else { textStyleClass += `text-base font-bold ${THEME_COLORS.subHeadingText}`; }

      if (depth > 0) {
        textStyleClass = 'uppercase '; 
        if (level === 3) textStyleClass += `text-sm font-bold ${THEME_COLORS.accentRed}`; 
        else if (level === 4) textStyleClass += `text-xs font-bold ${THEME_COLORS.subHeadingText}`;
      }
      if (isMiniSectionHeadline) {
          textStyleClass = 'uppercase '; 
          textStyleClass += level === 3 ? `text-base font-bold ${THEME_COLORS.accentRed}` : `text-sm font-bold ${THEME_COLORS.accentRed}`; 
          if (depth > 0) { 
            textStyleClass = 'uppercase '; 
            textStyleClass += level === 3 ? `text-sm font-bold ${THEME_COLORS.accentRed}` : `text-xs font-bold ${THEME_COLORS.accentRed}`;
          }
      }

      let calculatedMt = ''; let calculatedMb = ''; let calculatedPt = '';
      if (level === 1) { calculatedMb = 'mb-2'; } 
      else if (level === 2) { calculatedMb = 'mb-3'; calculatedPt = 'pt-4'; } 
      else if (level === 3) { calculatedMb = 'mb-1.5'; calculatedMt = 'mt-2.5'; } 
      else if (level === 4) { calculatedMb = 'mb-1'; calculatedMt = 'mt-2'; } 
      else { calculatedMb = 'mb-1.5'; } 
      if (depth > 0) { if (level === 3 || level === 4) { calculatedMb = 'mb-1'; calculatedMt = 'mt-1';} } 
      if (isListItemContent) calculatedMt = ''; 
      if (isMiniSectionHeadline && isFirstInBox) calculatedMb = 'mb-1'; 
      if (isLastInBox) calculatedMb = 'mb-0';
      
      const finalClassName = `flex items-center ${textStyleClass} ${calculatedPt} ${calculatedMt} ${calculatedMb}`.replace(/\s+/g, ' ').trim();
      const styledText = parseAndStyleText(text);

      return (
        <div className={`w-full group relative ${depth === 0 ? 'mt-6' : 'mt-4'}`}>
          {/* Arrow buttons for reordering */}
          {isEditing && contentBlockIndex !== undefined && onMoveBlockUp && onMoveBlockDown && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 rounded px-2 py-1 text-xs text-gray-600 z-40 flex gap-1">
              <button
                onClick={() => onMoveBlockUp(contentBlockIndex)}
                disabled={isFirstBlock}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move up"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => onMoveBlockDown(contentBlockIndex)}
                disabled={isLastBlock}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move down"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
          
          <Tag
            className={finalClassName}
            style={{ 
              backgroundColor: backgroundColor || 'transparent', 
              color: headlineTextColor || undefined, 
              padding: backgroundColor ? '0.4rem 0.6rem' : undefined, 
              borderRadius: backgroundColor ? '0.25rem' : undefined,
              fontSize: fontSize || undefined
            }}
          >
            {IconComponent && <IconComponent className={`mr-1.5 shrink-0 ${THEME_COLORS.accentRed}`} />}
            {isEditing && onTextChange ? (
              <input 
                type="text" 
                value={text}
                onChange={(e) => handleInputChangeEvent(fieldPath('text'), e)}
                className={`${editingInputClass} ${textStyleClass.replace(/text-\w+/g, '').replace(/font-\w+/g, '').replace('uppercase', '')} m-0 p-0`} 
                style={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit', display: 'inline', width: 'auto', flexGrow: 1, textTransform: 'uppercase' }}
              />
            ) : ( styledText )}
          </Tag>
          
          {/* Settings Button - Only for images (headlines don't have settings) */}
        </div>
      );
    }
    case 'paragraph': { 
      const { text, isRecommendation, fontSize } = block as ParagraphBlock;
      const isTopLevelParagraph = depth === 0;
      let paragraphClasses = `text-black leading-normal text-left`; 
      if (isTopLevelParagraph) paragraphClasses += ` w-full`; 
      const defaultMb = depth > 0 ? 'mb-1' : 'mb-2';
      const finalMb = isLastInBox ? 'mb-0' : defaultMb;
      
      let recommendationClasses = "";
      if (isRecommendation && !suppressRecommendationStripe) {
        recommendationClasses = `pl-2.5 border-l-[3px] border-[#FF1414] py-1`;
      }
      const styledText = parseAndStyleText(text);

      if (isEditing && onTextChange) {
        const currentRawText = (block as ParagraphBlock).text;
        return (
          <div className={`${isRecommendation ? recommendationClasses : ''} ${finalMb} text-left group relative`}>
            {/* Arrow buttons for reordering */}
            {contentBlockIndex !== undefined && onMoveBlockUp && onMoveBlockDown && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 rounded px-2 py-1 text-xs text-gray-600 z-40 flex gap-1">
                <button
                  onClick={() => onMoveBlockUp(contentBlockIndex)}
                  disabled={isFirstBlock}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => onMoveBlockDown(contentBlockIndex)}
                  disabled={isLastBlock}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
            
            <textarea 
              value={currentRawText} 
              onChange={(e) => handleInputChangeEvent(fieldPath('text'), e)}
              className={`${editingTextareaClass} ${isTopLevelParagraph ? 'w-full' : 'w-full'} leading-normal text-black text-left`} 
              style={{ fontSize: fontSize || '10px' }}
            />
            
            {/* No settings button for paragraphs */}
          </div>
        );
      }
      return ( <p className={`${paragraphClasses} ${finalMb} ${recommendationClasses}`.trim()} style={{ fontSize: fontSize || '10px' }}>{styledText}</p> );
    }
    case 'bullet_list': 
    case 'numbered_list': {
      const currentBlockIconName = block.type === 'bullet_list' ? (block as BulletListBlock).iconName : undefined;
      const { items, fontSize } = block; 
      const isNumbered = block.type === 'numbered_list';
      const hasRecommendation = !isNumbered && items.some(item => typeof item === 'object' && item !== null && (item as AnyContentBlock).type === 'paragraph' && (item as ParagraphBlock).isRecommendation);
      
      let BulletIconToRender: React.ElementType | null = NewBulletIcon; 
      if (block.type === 'bullet_list') {
        if (currentBlockIconName && currentBlockIconName !== "none") {
            BulletIconToRender = iconMap[currentBlockIconName] || NewBulletIcon; 
        } else if (currentBlockIconName === "none") {
            BulletIconToRender = null; 
        }
      }

      const ListTag = isNumbered ? 'ol' : 'ul';
      const listStyle = isNumbered 
        ? 'list-none' 
        : 'list-none';
      
      const textIndentClass = isNumbered ? 'pl-0' : 'pl-1';
      const finalMb = isLastInBox ? 'mb-0' : 'mb-2';

      let containerClasses = `flex flex-col ${finalMb} `;
      if (hasRecommendation) {
        containerClasses += `pl-2.5 border-l-[3px] border-[#FF1414] py-1`;
      }

      return (
        <div className={`${containerClasses.trim()} group relative`}>
          {/* Arrow buttons for reordering */}
          {contentBlockIndex !== undefined && onMoveBlockUp && onMoveBlockDown && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 rounded px-2 py-1 text-xs text-gray-600 z-40 flex gap-1">
            <button
                onClick={() => onMoveBlockUp(contentBlockIndex)}
                disabled={isFirstBlock}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move up"
            >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
            </button>
              <button
                onClick={() => onMoveBlockDown(contentBlockIndex)}
                disabled={isLastBlock}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move down"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
          
          <ListTag className={`${listStyle} ${textIndentClass} space-y-1.5`} style={{ fontSize: fontSize || '10px' }}>
            {items.map((item, index) => {
              const isLastItem = index === items.length - 1;
              const itemIsString = typeof item === 'string';
              const isRecommendationPara = !itemIsString && (item as AnyContentBlock).type === 'paragraph' && (item as ParagraphBlock).isRecommendation;
              
              const isPlainStringNoBold = itemIsString && !item.includes("**");
              // Only wrap with ** when inside a numbered list and the original string has no bold markers
              const textSource = itemIsString ? ((isNumbered && isPlainStringNoBold) ? `**${item}**` : item) : "";
              let styledItemText = itemIsString ? parseAndStyleText(textSource) : null;

              if (isNumbered) {
                return (
                  <li key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-semibold text-xs">{index + 1}</div>
                    <div className="flex-grow">
                      {itemIsString ? (
                        isEditing && onTextChange ? (
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleInputChangeEvent(listItemPath(index), e)}
                            className={`${editingInputClass} w-full text-xs`}
                          />
                        ) : (
                          <span className="text-black text-xs leading-snug">{styledItemText}</span>
                        )
                      ) : Array.isArray(item) ? (
                          <div className="flex flex-col">
                              {(item as AnyContentBlock[]).map((block, blockIndex) => (
                                  <RenderBlock
                                      key={blockIndex}
                                      block={block}
                                      depth={(depth || 0) + 1}
                                      isListItemContent={true}
                                      isLastInBox={blockIndex === (item as AnyContentBlock[]).length - 1}
                                      isEditing={isEditing}
                                      onTextChange={onTextChange}
                                      basePath={listItemPath(index, String(blockIndex))}
                                      suppressRecommendationStripe={hasRecommendation}
                                  />
                              ))}
                          </div>
                      ) : (
                          <RenderBlock 
                              block={item as AnyContentBlock}
                              depth={(depth || 0) + 1}
                              isListItemContent={true}
                              isLastInBox={isLastItem}
                              isEditing={isEditing}
                              onTextChange={onTextChange}
                              basePath={listItemPath(index)}
                              suppressRecommendationStripe={hasRecommendation}
                          />
                      )}
                    </div>
                  </li>
                );
              }
              
              if (isEditing && onTextChange && itemIsString) {
                return (
                  <li key={index} className="flex items-center">
                    {BulletIconToRender && !isNumbered && (
                      <div className="flex-shrink-0 mr-1.5 flex items-center">
                        <BulletIconToRender />
                      </div>
                    )}
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleInputChangeEvent(listItemPath(index), e)}
                      className={`${editingInputClass} w-full`}
                    />
                  </li>
                );
              }

              // Remove all emoji bullet logic and always use BulletIconToRender
              const nestedIndentation = depth > 0 ? 'ml-6' : '';

              return (
                <li
                  key={index}
                  className={`flex items-center text-black text-xs leading-tight ${nestedIndentation}`}
                >
                  {!isNumbered && BulletIconToRender && (
                    <div className="flex-shrink-0 mr-1.5 flex items-center">
                      <BulletIconToRender />
                    </div>
                  )}
                  <div className="flex-grow">
                    {itemIsString ? (
                        <span className={isNumbered ? 'ml-1' : ''}>{styledItemText}</span>
                    ) : Array.isArray(item) ? (
                        <div className="flex flex-col">
                            {(item as AnyContentBlock[]).map((block, blockIndex) => (
                                <RenderBlock
                                    key={blockIndex}
                                    block={block}
                                    depth={(depth || 0) + 1}
                                    isListItemContent={true}
                                    isLastInBox={blockIndex === (item as AnyContentBlock[]).length - 1}
                                    isEditing={isEditing}
                                    onTextChange={onTextChange}
                                    basePath={listItemPath(index, String(blockIndex))}
                                    suppressRecommendationStripe={hasRecommendation}
                                />
                            ))}
                        </div>
                    ) : (
                        <RenderBlock 
                            block={item as AnyContentBlock}
                            depth={(depth || 0) + 1}
                            isListItemContent={true}
                            isLastInBox={isLastItem}
                            isEditing={isEditing}
                            onTextChange={onTextChange}
                            basePath={listItemPath(index)}
                            suppressRecommendationStripe={hasRecommendation}
                        />
                    )}
                  </div>
                </li>
              );
            })}
          </ListTag>
        </div>
      );
    }
    case 'alert': {
      const { alertType, title, text, iconName, backgroundColor, borderColor, textColor, iconColor, fontSize } = block as AlertBlock;
      const { bgColor, borderColor: defaultBorderColor, textColor: defaultTextColor, iconColorClass, Icon } = getAlertColors(alertType);
      // Force black text color for all alerts
      const effectiveTextColor = '#000000';
      
      // Use custom icon if specified, otherwise use default for alert type
      const AlertIconComponent = iconName ? iconMap[iconName] : Icon;
      
      return (
        <div className={`p-2 border-l-4 ${bgColor} ${defaultBorderColor} ${isLastInBox ? 'mb-0' : 'mb-3'} group relative`} role="alert">
          {/* Arrow buttons for reordering */}
          {contentBlockIndex !== undefined && onMoveBlockUp && onMoveBlockDown && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 rounded px-2 py-1 text-xs text-gray-600 z-40 flex gap-1">
              <button
                onClick={() => onMoveBlockUp(contentBlockIndex)}
                disabled={isFirstBlock}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move up"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => onMoveBlockDown(contentBlockIndex)}
                disabled={isLastBlock}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move down"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="flex">
            <div className="py-1">
              <AlertIconComponent className={`h-4 w-4 ${iconColorClass} mr-2`} style={{ color: iconColor || undefined }} />
            </div>
            <div className="flex-grow">
              {isEditing && onTextChange ? (
                <>
                  {title && (
                    <input
                      type="text"
                      value={title}
                      onChange={e => handleInputChangeEvent(fieldPath('title'), e)}
                      className={`${editingInputClass} font-bold mb-1`}
                      placeholder="Alert title"
                      style={{ fontSize: fontSize || '10px' }}
                    />
                  )}
                  <textarea
                    value={text}
                    onChange={e => handleInputChangeEvent(fieldPath('text'), e)}
                    className={`${editingTextareaClass} mb-2`}
                    placeholder="Alert text"
                    style={{ fontSize: fontSize || '10px' }}
                  />
                </>
              ) : (
                <>
                  {title && <p className={`font-bold`} style={{ color: effectiveTextColor, fontSize: fontSize || '10px' }}>{title}</p>}
                  <p style={{ color: effectiveTextColor, fontSize: fontSize || '10px' }}>{text}</p>
                </>
              )}
            </div>
          </div>
          
          {/* No settings button for alerts */}
        </div>
      );
    }
    case 'section_break': {
      const { style } = block as SectionBreakBlock;
      if (style === 'none') return null;
      const borderStyle = style === 'dashed' ? 'border-dashed' : 'border-solid';
      return <hr className={`my-3 border-t ${borderStyle} ${THEME_COLORS.defaultBorder}`} />;
    }
    case 'table': {
      const { headers, rows, caption } = block as any;
      // Helper to render bold for **text**
      const renderCellContent = (cell: string) => {
        const segments = cell.split('**');
        return segments.map((seg, idx) => idx % 2 === 1 ? <strong key={idx}>{seg}</strong> : seg);
      };
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full border border-gray-200 text-[10px] rounded-lg overflow-hidden" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            {caption && <caption className="text-xs text-gray-500 mb-2">{caption}</caption>}
            <thead>
              <tr>
                {headers.map((header: string, idx: number) => (
                  <th
                    key={idx}
                    className="px-6 py-4 text-left font-bold border-b border-gray-300 bg-[#232B3A] text-white"
                    style={{ fontWeight: 700, fontSize: '11px', letterSpacing: 0.2, borderTopLeftRadius: idx === 0 ? 8 : 0, borderTopRightRadius: idx === headers.length - 1 ? 8 : 0 }}
                  >
                    {isEditing && onTextChange ? (
                      <input
                        type="text"
                        value={header}
                        onChange={e => onTextChange([...basePath, 'headers', idx], e.target.value)}
                        className="bg-[#232B3A] text-white font-bold border-none outline-none w-full px-1 py-0.5 rounded"
                        style={{ fontSize: '11px' }}
                      />
                    ) : (
                      renderCellContent(header)
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: string[], rIdx: number) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-[#F7F8FA]'}>
                  {row.map((cell: string, cIdx: number) => (
                    <td
                      key={cIdx}
                      className="border-b border-gray-200 px-6 py-4 align-middle text-black text-left"
                      style={{ fontSize: '11px', minWidth: 60 }}
                    >
                      {isEditing && onTextChange ? (
                        <input
                          type="text"
                          value={cell}
                          onChange={e => onTextChange([...basePath, 'rows', rIdx, cIdx], e.target.value)}
                          className="bg-transparent text-black border border-gray-300 rounded px-1 py-0.5 w-full outline-none focus:border-blue-400"
                          style={{ fontSize: '11px' }}
                        />
                      ) : (
                        renderCellContent(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'image': {
      const { src, alt, caption, width, height, alignment = 'center', borderRadius, maxWidth, layoutMode = 'standalone', layoutPartnerIndex, layoutProportion = '50-50' } = block as ImageBlock;
      
      console.log('🖼️ [IMAGE RENDER] Rendering image block:', {
        block,
        blockType: block.type,
        src,
        alt,
        caption,
        width,
        height,
        alignment,
        borderRadius,
        maxWidth,
        allBlockProperties: Object.keys(block),
        blockAsString: JSON.stringify(block, null, 2),
        hasValidSrc: !!src && typeof src === 'string' && src.length > 0,
        srcLength: src ? src.length : 0,
        blockKeys: Object.keys(block),
        blockValues: Object.values(block),
        isValidImageBlock: !!(src && typeof src === 'string' && block.type === 'image'),
        suspiciousProperties: Object.keys(block).filter(key => !['type', 'src', 'alt', 'caption', 'width', 'height', 'alignment', 'borderRadius', 'maxWidth'].includes(key))
      });
      
      // ENHANCED SAFETY CHECK: Detect corrupted blocks more accurately
      const blockAny = block as any;
      const hasStyle = 'style' in blockAny;
      const hasValidImageProperties = src && typeof src === 'string' && src.startsWith('/static_design_images/');
      const hasInvalidProperties = hasStyle || !hasValidImageProperties;
      
      if (hasInvalidProperties) {
        console.log('🚨 [IMAGE RENDER] INVALID IMAGE BLOCK DETECTED!', {
          block,
          analysis: {
            hasStyle: hasStyle,
            styleValue: blockAny.style,
            hasValidSrc: hasValidImageProperties,
            srcValue: src,
            blockType: block.type,
            suspiciousKeys: Object.keys(blockAny).filter(key => !['type', 'src', 'alt', 'caption', 'width', 'height', 'alignment', 'borderRadius', 'maxWidth'].includes(key)),
            allKeys: Object.keys(blockAny),
            reason: hasStyle ? 'Block has style property (section break contamination)' : 'Invalid or missing src property'
          }
        });
        
        // If it has section break properties, render as section break
        if (hasStyle && (blockAny.style === 'solid' || blockAny.style === 'dashed' || blockAny.style === 'none')) {
          console.log('🔄 [IMAGE RENDER] Converting corrupted image block to section break');
          if (blockAny.style === 'none') return null;
          const borderStyle = blockAny.style === 'dashed' ? 'border-dashed' : 'border-solid';
          return <hr className={`my-3 border-t ${borderStyle} border-gray-300`} />;
        }
        
        // Otherwise show error placeholder
        return (
          <div className="my-4 text-center">
            <div className="inline-block p-4 border-2 border-red-300 rounded-lg bg-red-50 text-red-700">
              <p className="font-semibold">⚠️ Invalid Image Block</p>
              <p className="text-sm mt-1">Block type: {block.type}</p>
              <p className="text-xs mt-1">Reason: {hasStyle ? 'Contaminated with section break properties' : 'Missing or invalid image source'}</p>
              <details className="mt-2">
                <summary className="text-xs cursor-pointer">Debug Info</summary>
                <pre className="text-xs mt-1 text-left overflow-auto">{JSON.stringify(block, null, 2)}</pre>
              </details>
            </div>
          </div>
        );
      }
      
      const alignmentClass = alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center';
      
      // Calculate current width for scaling controls
      const currentWidth = width ? (typeof width === 'number' ? width : parseInt(width)) : 300;
      const imageWidth = Math.max(50, Math.min(currentWidth, 800)); // Constrain between 50px and 800px
      
      // Ensure proper image path resolution with null check
      if (!src) {
        console.log('🚨 [IMAGE RENDER] No src found for image block:', {
          block,
          srcValue: src,
          srcType: typeof src,
          blockKeys: Object.keys(block)
        });
        return (
          <div className={`my-4 ${alignmentClass}`}>
            <div className="inline-block p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-center">
              <p>Image source not available</p>
              <p className="text-xs mt-1 text-red-500">Debug: src = {JSON.stringify(src)}</p>
              {caption && <p className="text-sm mt-2 italic">{caption}</p>}
            </div>
          </div>
        );
      }
      
      const imageSrc = src.startsWith('/') ? src : `/${src}`;
      
      // Handle different layout modes
      if (layoutMode === 'inline-left' || layoutMode === 'inline-right') {
        // Inline layout - text wraps around image
        const floatDirection = layoutMode === 'inline-left' ? 'left' : 'right';
        const marginDirection = layoutMode === 'inline-left' ? 'right' : 'left';
        
        return (
          <div className={`my-4 group relative`}>
            {/* Arrow buttons for reordering */}
            {isEditing && contentBlockIndex !== undefined && onMoveBlockUp && onMoveBlockDown && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 rounded px-2 py-1 text-xs text-gray-600 z-40 flex gap-1">
                <button
                  onClick={() => onMoveBlockUp(contentBlockIndex)}
                  disabled={isFirstBlock}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => onMoveBlockDown(contentBlockIndex)}
                  disabled={isLastBlock}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Settings button */}
            {isEditing && (
              <button
                onClick={() => setShowSettings(true)}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700 rounded p-1.5 text-xs text-white shadow-lg z-50"
                title="Image settings"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
            
            <img 
              src={imageSrc} 
              alt={alt || 'Image'} 
              className="rounded-lg shadow-md"
              style={{
                maxWidth: maxWidth || '200px',
                width: width || 'auto',
                height: height || 'auto',
                borderRadius: borderRadius || '8px',
                float: floatDirection,
                margin: `0 ${marginDirection === 'right' ? '16px' : '0'} 16px ${marginDirection === 'left' ? '16px' : '0'}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div style={{ display: 'none', padding: '20px', border: '2px dashed #ccc', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
              {alt || 'Image not available'}
            </div>
            {caption && (
              <p style={{ fontSize: '10px', color: '#666', textAlign: 'center', margin: '8px 0 0 0', fontStyle: 'italic', clear: 'both' }}>
                {caption}
              </p>
            )}
            
            {/* Settings Modal for inline layout */}
            <BlockSettingsModal
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
              block={block}
              onTextChange={onTextChange}
              basePath={basePath}
            />
          </div>
        );
      } else if (layoutMode === 'side-by-side-left' || layoutMode === 'side-by-side-right') {
        // Side-by-side layout - this will be handled by the parent component
        // For now, render as standalone but with layout info
        return (
          <div className={`my-4 ${alignmentClass} group relative`} data-layout-mode={layoutMode} data-partner-index={layoutPartnerIndex} data-proportion={layoutProportion}>
            {/* Arrow buttons for reordering */}
            {isEditing && contentBlockIndex !== undefined && onMoveBlockUp && onMoveBlockDown && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 rounded px-2 py-1 text-xs text-gray-600 z-40 flex gap-1">
                <button
                  onClick={() => onMoveBlockUp(contentBlockIndex)}
                  disabled={isFirstBlock}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => onMoveBlockDown(contentBlockIndex)}
                  disabled={isLastBlock}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Settings button */}
            {isEditing && (
              <button
                onClick={() => setShowSettings(true)}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700 rounded p-1.5 text-xs text-white shadow-lg z-50"
                title="Image settings"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
            
            <img 
              src={imageSrc} 
              alt={alt || 'Image'} 
              className="rounded-lg shadow-md"
              style={{
                maxWidth: maxWidth || '100%',
                width: width || 'auto',
                height: height || 'auto',
                borderRadius: borderRadius || '8px',
                display: 'block',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div style={{ display: 'none', padding: '20px', border: '2px dashed #ccc', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
              {alt || 'Image not available'}
            </div>
            {caption && (
              <p style={{ fontSize: '10px', color: '#666', textAlign: alignment as 'left' | 'center' | 'right', margin: '8px 0 0 0', fontStyle: 'italic' }}>
                {caption}
              </p>
            )}
            
            {/* Settings Modal for side-by-side layout */}
            <BlockSettingsModal
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
              block={block}
              onTextChange={onTextChange}
              basePath={basePath}
            />
          </div>
        );
      }
      
      // Standard standalone layout
      return (
        <div className={`my-4 ${alignmentClass} group relative`}>
          {/* Arrow buttons for reordering */}
          {contentBlockIndex !== undefined && onMoveBlockUp && onMoveBlockDown && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 rounded px-2 py-1 text-xs text-gray-600 z-40 flex gap-1">
              <button
                onClick={() => onMoveBlockUp(contentBlockIndex)}
                disabled={isFirstBlock}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move up"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => onMoveBlockDown(contentBlockIndex)}
                disabled={isLastBlock}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move down"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="inline-block relative">
            {/* Use regular img tag for better compatibility in view mode */}
            <img
              src={imageSrc}
              alt={alt || 'Uploaded image'}
              className="h-auto shadow-sm"
              style={{
                width: `${imageWidth}px`,
                height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
                borderRadius: borderRadius || '8px',
                maxWidth: maxWidth || '100%'
              }}
              onError={(e) => {
                console.error('Image failed to load:', imageSrc);
                // Fallback: try with different path resolution
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('/api/custom-projects-backend/')) {
                  target.src = `/api/custom-projects-backend${imageSrc}`;
                }
              }}
            />
            
            {/* Scaling Controls in Edit Mode */}

            
            {caption && (
              <p className="text-xs text-gray-600 mt-2 italic">
                {isEditing && onTextChange ? (
                  <input
                    type="text"
                    value={caption}
                    onChange={e => handleInputChangeEvent(fieldPath('caption'), e)}
                    className={`${editingInputClass} text-center italic`}
                    placeholder="Image caption"
                  />
                ) : (
                  caption
                )}
              </p>
            )}
          </div>
          
          {/* Modern Settings Button */}
          {isEditing && onTextChange && (
            <button
              onClick={() => setShowSettings(true)}
              className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 hover:border-gray-300"
              title="Image settings"
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
          )}
          
          <BlockSettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            block={block}
            onTextChange={onTextChange}
            basePath={basePath}
          />
        </div>
      );
    }
    default:
      return null;
  }
};

export interface TextPresentationDisplayProps {
  dataToDisplay: TextPresentationData | null;
  isEditing?: boolean;
  onTextChange?: (path: (string | number)[], newValue: any) => void;
  parentProjectName?: string;
}

// Image Upload Component
const ImageUploadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onImageUploaded: (imagePath: string) => void;
}> = ({ isOpen, onClose, onImageUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError(null);
    
    try {
      const result = await uploadOnePagerImage(file);
      onImageUploaded(result.file_path);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('interface.imageUpload.title')}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-sm text-gray-600">{t('interface.imageUpload.uploadingText')}</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {t('interface.imageUpload.dragAndDropText')}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('interface.imageUpload.chooseFileButton')}
              </label>
            </>
          )}
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          {t('interface.imageUpload.supportedFormatsText')}
        </div>
      </div>
    </div>
  );
};

const TextPresentationDisplay = ({ dataToDisplay, isEditing, onTextChange, parentProjectName }: TextPresentationDisplayProps): React.JSX.Element | null => {
  const searchParams = useSearchParams();
  const lang = dataToDisplay?.detectedLanguage || searchParams?.get('lang') || 'en';
  const locale = locales[lang as keyof typeof locales] || locales.en;
  const { t } = useLanguage();
  
  const [showImageUpload, setShowImageUpload] = useState(false);

  // 🔍 COMPREHENSIVE LOGGING: Print entire content when one-pager opens
  useEffect(() => {
    if (dataToDisplay) {
      console.log('📋 [ONE-PAGER OPENED] Complete content structure:', {
        dataToDisplay,
        contentBlocks: dataToDisplay.contentBlocks,
        contentBlocksLength: dataToDisplay.contentBlocks?.length || 0,
        contentBlocksStringified: JSON.stringify(dataToDisplay.contentBlocks, null, 2),
        allBlockTypes: dataToDisplay.contentBlocks?.map((block, index) => ({
          index,
          type: block.type,
          allKeys: Object.keys(block),
          blockAsString: JSON.stringify(block, null, 2)
        })) || []
      });

      // 🔍 Analyze for potential corruption
      const corruptedBlocks = dataToDisplay.contentBlocks?.filter((block, index) => {
        if (block.type === 'image') {
          const imageBlock = block as any;
          const hasStyle = 'style' in imageBlock;
          const hasValidSrc = imageBlock.src && typeof imageBlock.src === 'string' && imageBlock.src.startsWith('/static_design_images/');
          const isCorrupted = hasStyle || !hasValidSrc;
          
          if (isCorrupted) {
            console.warn(`🚨 [CORRUPTION DETECTED] Block at index ${index}:`, {
              block,
              issues: {
                hasStyle: hasStyle,
                hasValidSrc: hasValidSrc,
                srcValue: imageBlock.src
              }
            });
          }
          
          return isCorrupted;
        }
        return false;
      }) || [];

      if (corruptedBlocks.length > 0) {
        console.error('🚨 [CRITICAL] Found corrupted image blocks:', corruptedBlocks);
      }
    }
  }, [dataToDisplay]);

  const handleImageUploaded = useCallback((imagePath: string) => {
    if (onTextChange && dataToDisplay) {
      const newImageBlock: ImageBlock = {
        type: 'image',
        src: imagePath,
        alt: '',
        caption: '',
        alignment: 'center',
        borderRadius: '8px',
        maxWidth: '100%'
      };
      
      console.log('🖼️ [IMAGE UPLOAD] Creating new image block:', {
        imagePath,
        newImageBlock,
        blockType: newImageBlock.type,
        blockSrc: newImageBlock.src,
        blockProperties: Object.keys(newImageBlock)
      });
      
      const updatedContentBlocks = [...(dataToDisplay.contentBlocks || []), newImageBlock];
      
      console.log('🖼️ [IMAGE UPLOAD] Updated content blocks:', {
        totalBlocks: updatedContentBlocks.length,
        lastBlock: updatedContentBlocks[updatedContentBlocks.length - 1],
        allBlockTypes: updatedContentBlocks.map(block => block.type),
        fullContentBlocksString: JSON.stringify(updatedContentBlocks, null, 2)
      });
      
      // 🔍 CRITICAL SAVE TRACKING: Log exactly what we're passing to onTextChange
      console.log('🔄 [CRITICAL SAVE] About to call onTextChange with:', {
        path: ['contentBlocks'],
        valueType: typeof updatedContentBlocks,
        valueLength: updatedContentBlocks.length,
        valueStringified: JSON.stringify(updatedContentBlocks, null, 2),
        imageBlocks: updatedContentBlocks.filter(block => block.type === 'image').map((block, index) => ({
          index: updatedContentBlocks.indexOf(block),
          block,
          blockStringified: JSON.stringify(block, null, 2),
          blockKeys: Object.keys(block)
        }))
      });
      
      onTextChange(['contentBlocks'], updatedContentBlocks);
    }
  }, [onTextChange, dataToDisplay]);

  if (!dataToDisplay) {
    return <div className="p-6 text-center text-gray-500 text-xs">{t('textPresentationDisplay.noContent', 'No text content available to display.')}</div>;
  }
  
  const renderableItems: RenderableItem[] = [];
  let i = 0;
  let isFirstH2Processed = false;
  let skipNextH2Headline = false;
  const contentBlocksToProcess = dataToDisplay.contentBlocks || [];

  if (dataToDisplay.textTitle && contentBlocksToProcess.length > 0) {
    const firstBlock = contentBlocksToProcess[0];
    if (firstBlock.type === 'headline' &&
        ((firstBlock as HeadlineBlock).level === 1 || (firstBlock as HeadlineBlock).level === 2) &&
        (firstBlock as HeadlineBlock).text.trim().toLowerCase() === dataToDisplay.textTitle.trim().toLowerCase()) {
      skipNextH2Headline = true;
    }
  }

  while (i < contentBlocksToProcess.length) {
    if (contentBlocksToProcess[i].type === 'section_break') { i++; continue; }
    const currentBlock = contentBlocksToProcess[i];
    const nextBlock = (i + 1 < contentBlocksToProcess.length) ? contentBlocksToProcess[i+1] : null;
    if (currentBlock.type === 'headline' && (currentBlock as HeadlineBlock).level === 2) {
      const majorSectionHeadline = currentBlock as HeadlineBlock;
      const sectionItemsInternal: Array<AnyContentBlock | MiniSection> = [];
      let headlineToSkipThisIteration = false;
      if (!isFirstH2Processed && skipNextH2Headline) { headlineToSkipThisIteration = true; }
      isFirstH2Processed = true;
      i++; 
      while (i < contentBlocksToProcess.length && !(contentBlocksToProcess[i].type === 'headline' && (contentBlocksToProcess[i] as HeadlineBlock).level === 2)) {
        if (contentBlocksToProcess[i].type === 'section_break') { i++; continue; }
        const innerBlock = contentBlocksToProcess[i];
        const innerNextBlock = (i + 1 < contentBlocksToProcess.length) ? contentBlocksToProcess[i+1] : null;
        if (innerBlock.type === 'headline' && ((innerBlock as HeadlineBlock).level === 3 || (innerBlock as HeadlineBlock).level === 4) && ((innerBlock as HeadlineBlock).isImportant === true || (innerBlock as HeadlineBlock).level === 4) && innerNextBlock && (innerNextBlock.type === 'bullet_list' || innerNextBlock.type === 'numbered_list' || innerNextBlock.type === 'paragraph' || innerNextBlock.type === 'alert')) {
          sectionItemsInternal.push({ type: "mini_section", headline: innerBlock as HeadlineBlock, list: innerNextBlock as BulletListBlock | NumberedListBlock | ParagraphBlock | AlertBlock });
          i += 2; 
        } else { sectionItemsInternal.push(innerBlock); i++;  }
      }
      renderableItems.push({ type: "major_section", headline: majorSectionHeadline, items: sectionItemsInternal, _skipRenderHeadline: headlineToSkipThisIteration });
    } else if (currentBlock.type === 'headline' && ((currentBlock as HeadlineBlock).level === 3 || (currentBlock as HeadlineBlock).level === 4) && ((currentBlock as HeadlineBlock).isImportant === true || (currentBlock as HeadlineBlock).level === 4) && nextBlock && (nextBlock.type === 'bullet_list' || nextBlock.type === 'numbered_list' || nextBlock.type === 'paragraph' || nextBlock.type === 'alert')) {
      renderableItems.push({ type: "mini_section", headline: currentBlock as HeadlineBlock, list: nextBlock as BulletListBlock | NumberedListBlock | ParagraphBlock | AlertBlock });
      i += 2; 
    } else {
      if (i === 0 && skipNextH2Headline && currentBlock.type === 'headline' && ((currentBlock as HeadlineBlock).level === 1 || (currentBlock as HeadlineBlock).level === 2)) { i++; continue; }
      renderableItems.push({ type: "standalone_block", content: currentBlock });
      i++; 
    }
  } 

  // 🔄 ARROW REORDERING HANDLERS - Work directly with contentBlocks
  const handleMoveBlockUp = useCallback((contentBlockIndex: number) => {
    if (contentBlockIndex <= 0 || !dataToDisplay || !onTextChange) return;
    
    const contentBlocks = [...(dataToDisplay.contentBlocks || [])];
    if (contentBlockIndex >= contentBlocks.length) return;
    
    // Swap the blocks
    const blockToMove = contentBlocks[contentBlockIndex];
    const blockAbove = contentBlocks[contentBlockIndex - 1];
    
    contentBlocks[contentBlockIndex] = blockAbove;
    contentBlocks[contentBlockIndex - 1] = blockToMove;
    
    console.log('⬆️ [MOVE UP] Content block moved from index:', contentBlockIndex, 'to index:', contentBlockIndex - 1);
    console.log('⬆️ [MOVE UP] Block type:', blockToMove.type, 'moved above:', blockAbove.type);
    
    // Update the content blocks
    onTextChange(['contentBlocks'], contentBlocks);
  }, [dataToDisplay, onTextChange]);

  const handleMoveBlockDown = useCallback((contentBlockIndex: number) => {
    if (!dataToDisplay || !onTextChange) return;
    
    const contentBlocks = [...(dataToDisplay.contentBlocks || [])];
    if (contentBlockIndex >= contentBlocks.length - 1) return;
    
    // Swap the blocks
    const blockToMove = contentBlocks[contentBlockIndex];
    const blockBelow = contentBlocks[contentBlockIndex + 1];
    
    contentBlocks[contentBlockIndex] = blockBelow;
    contentBlocks[contentBlockIndex + 1] = blockToMove;
    
    console.log('⬇️ [MOVE DOWN] Content block moved from index:', contentBlockIndex, 'to index:', contentBlockIndex + 1);
    console.log('⬇️ [MOVE DOWN] Block type:', blockToMove.type, 'moved below:', blockBelow.type);
    
    // Update the content blocks
    onTextChange(['contentBlocks'], contentBlocks);
  }, [dataToDisplay, onTextChange]);

  const findOriginalIndex = (blockToFind: AnyContentBlock | HeadlineBlock | BulletListBlock | NumberedListBlock | ParagraphBlock | AlertBlock): number => {
      return (dataToDisplay?.contentBlocks || []).findIndex(cb => cb === blockToFind);
  };
  
  const styledTextTitle = parseAndStyleText(dataToDisplay.textTitle);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="font-['Inter',_sans-serif] bg-white p-4 sm:p-6 md:p-8 shadow-lg rounded-md max-w-3xl mx-auto my-6">
        <div className="bg-[#f4f5f6] rounded-3xl p-4 sm:p-6 md:p-8">
          {dataToDisplay.textTitle && (
            <header className="mb-4 text-left">
              {parentProjectName && <p className="text-xs uppercase font-semibold tracking-wider text-gray-500 mb-1 text-left">{parentProjectName}</p>}
              
              {isEditing && onTextChange ? (
                  <input 
                      type="text" 
                      value={dataToDisplay.textTitle} 
                      onChange={(e) => onTextChange && onTextChange(['textTitle'], e.target.value)} 
                      className={`${editingInputClass} text-2xl lg:text-3xl font-bold ${THEME_COLORS.headingText} text-left`}
                  />
              ) : (
                  <h1 className={`text-2xl lg:text-3xl font-bold ${THEME_COLORS.headingText} mb-2 text-left`}>{dataToDisplay.textTitle}</h1>
              )}

              <hr className={`mt-2 mb-0 border-t-2 ${THEME_COLORS.underlineAccent}`} />
            </header>
          )}

          <main className="text-left">
            {renderableItems.map((item, index) => {
              const isLastItem = index === renderableItems.length - 1;
              
              // 🎯 ARROW REORDERING STYLING
              const reorderClasses = isEditing ? [
                'transition-all duration-200',
                'relative group'
              ].filter(Boolean).join(' ') : '';

              if (item.type === 'major_section') {
                const originalHeadlineIndex = findOriginalIndex(item.headline);
                return (
                  <div key={index} className={reorderClasses}>

                    <section className="mb-4 p-3 rounded-md text-left">
                      {!item._skipRenderHeadline && (
                        <RenderBlock
                          block={item.headline}
                          basePath={['contentBlocks', originalHeadlineIndex]}
                          isEditing={isEditing}
                          onTextChange={onTextChange}
                          contentBlockIndex={originalHeadlineIndex}
                          onMoveBlockUp={handleMoveBlockUp}
                          onMoveBlockDown={handleMoveBlockDown}
                          isFirstBlock={originalHeadlineIndex === 0}
                          isLastBlock={originalHeadlineIndex >= (dataToDisplay?.contentBlocks?.length || 0) - 1}
                        />
                      )}
                      <div className={item._skipRenderHeadline ? '' : 'pl-1'} style={{ textAlign: 'left' }}>
                        {item.items.map((subItem, subIndex) => {
                          const isLastSubItem = subIndex === item.items.length - 1;
                          if (subItem.type === 'mini_section') {
                            const originalMiniHeadlineIndex = findOriginalIndex(subItem.headline);
                            const originalMiniListIndex = findOriginalIndex(subItem.list);
                            return (
                              <div key={subIndex} className="p-3 my-4 !bg-white border-l-2 border-[#FF1414] text-left shadow-sm rounded-sm">
                                <RenderBlock
                                  block={subItem.headline}
                                  isMiniSectionHeadline={true}
                                  isFirstInBox={subIndex === 0}
                                  basePath={['contentBlocks', originalMiniHeadlineIndex]}
                                  isEditing={isEditing}
                                  onTextChange={onTextChange}
                                  contentBlockIndex={originalMiniHeadlineIndex}
                                  onMoveBlockUp={handleMoveBlockUp}
                                  onMoveBlockDown={handleMoveBlockDown}
                                  isFirstBlock={originalMiniHeadlineIndex === 0}
                                  isLastBlock={originalMiniHeadlineIndex >= (dataToDisplay?.contentBlocks?.length || 0) - 1}
                                />
                                <RenderBlock
                                  block={subItem.list}
                                  isLastInBox={isLastSubItem}
                                  basePath={['contentBlocks', originalMiniListIndex]}
                                  isEditing={isEditing}
                                  onTextChange={onTextChange}
                                  contentBlockIndex={originalMiniListIndex}
                                  onMoveBlockUp={handleMoveBlockUp}
                                  onMoveBlockDown={handleMoveBlockDown}
                                  isFirstBlock={originalMiniListIndex === 0}
                                  isLastBlock={originalMiniListIndex >= (dataToDisplay?.contentBlocks?.length || 0) - 1}
                                />
                              </div>
                            );
                          } else { // It's an AnyContentBlock
                            const originalSubIndex = findOriginalIndex(subItem);
                            return <RenderBlock
                              key={subIndex}
                              block={subItem}
                              isLastInBox={isLastSubItem}
                              basePath={['contentBlocks', originalSubIndex]}
                              isEditing={isEditing}
                              onTextChange={onTextChange}
                              contentBlockIndex={originalSubIndex}
                              onMoveBlockUp={handleMoveBlockUp}
                              onMoveBlockDown={handleMoveBlockDown}
                              isFirstBlock={originalSubIndex === 0}
                              isLastBlock={originalSubIndex >= (dataToDisplay?.contentBlocks?.length || 0) - 1}
                            />;
                          }
                        })}
                      </div>
                    </section>
                  </div>
                );
              }

              if (item.type === 'mini_section') {
                const originalHeadlineIndex = findOriginalIndex(item.headline);
                const originalListIndex = findOriginalIndex(item.list);
                return (
                  <div key={index} className={reorderClasses}>

                    <div className="p-3 my-4 !bg-white border-l-2 border-[#FF1414] text-left shadow-sm rounded-sm">
                      <RenderBlock
                        block={item.headline}
                        isMiniSectionHeadline={true}
                        isFirstInBox={index === 0}
                        basePath={['contentBlocks', originalHeadlineIndex]}
                        isEditing={isEditing}
                        onTextChange={onTextChange}
                        contentBlockIndex={originalHeadlineIndex}
                        onMoveBlockUp={handleMoveBlockUp}
                        onMoveBlockDown={handleMoveBlockDown}
                        isFirstBlock={originalHeadlineIndex === 0}
                        isLastBlock={originalHeadlineIndex >= (dataToDisplay?.contentBlocks?.length || 0) - 1}
                      />
                      <RenderBlock
                        block={item.list}
                        isLastInBox={isLastItem}
                        basePath={['contentBlocks', originalListIndex]}
                        isEditing={isEditing}
                        onTextChange={onTextChange}
                        contentBlockIndex={originalListIndex}
                        onMoveBlockUp={handleMoveBlockUp}
                        onMoveBlockDown={handleMoveBlockDown}
                        isFirstBlock={originalListIndex === 0}
                        isLastBlock={originalListIndex >= (dataToDisplay?.contentBlocks?.length || 0) - 1}
                      />
                    </div>
                  </div>
                );
              }

              if (item.type === 'standalone_block') {
                const originalIndex = findOriginalIndex(item.content);
                return (
                  <div key={index} className={reorderClasses}>

                    <RenderBlock
                      block={item.content}
                      isLastInBox={isLastItem}
                      basePath={['contentBlocks', originalIndex]}
                      isEditing={isEditing}
                      onTextChange={onTextChange}
                      contentBlockIndex={originalIndex}
                      onMoveBlockUp={handleMoveBlockUp}
                      onMoveBlockDown={handleMoveBlockDown}
                      isFirstBlock={originalIndex === 0}
                      isLastBlock={originalIndex >= (dataToDisplay?.contentBlocks?.length || 0) - 1}
                    />
                  </div>
                );
              }

              return null;
            })}
          </main>
        </div>
      </div>
      
      {/* Floating Add Image Button - Only show in editing mode */}
      {isEditing && onTextChange && (
        <button
          onClick={() => setShowImageUpload(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors duration-200 z-50"
          title="Add Image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
      
      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImageUploaded={handleImageUploaded}
      />
    </div>
  );
};

export default TextPresentationDisplay; 
