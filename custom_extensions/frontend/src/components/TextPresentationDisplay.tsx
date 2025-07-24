"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  TextPresentationData, AnyContentBlock, HeadlineBlock, ParagraphBlock,
  BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock,
} from '@/types/textPresentation';
import {
  CheckCircle, Info as InfoIconLucide, XCircle, AlertTriangle,
} from 'lucide-react';
import { locales } from '@/locales';

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
        case 'info': return { bgColor: THEME_COLORS.alertInfoBg, borderColor: THEME_COLORS.alertInfoBorder, textColor: THEME_COLORS.alertInfoText, iconColorClass: THEME_COLORS.alertInfoIcon, Icon: InfoIconLucide };
        case 'success': return { bgColor: THEME_COLORS.alertSuccessBg, borderColor: THEME_COLORS.alertSuccessBorder, textColor: THEME_COLORS.alertSuccessText, iconColorClass: THEME_COLORS.alertSuccessIcon, Icon: CheckCircle };
        case 'warning': return { bgColor: THEME_COLORS.alertWarningBg, borderColor: THEME_COLORS.alertWarningBorder, textColor: THEME_COLORS.alertWarningText, iconColorClass: THEME_COLORS.alertWarningIcon, Icon: AlertTriangle };
        case 'danger': return { bgColor: THEME_COLORS.alertDangerBg, borderColor: THEME_COLORS.alertDangerBorder, textColor: THEME_COLORS.alertDangerText, iconColorClass: THEME_COLORS.alertDangerIcon, Icon: XCircle };
        default: return { bgColor: THEME_COLORS.alertInfoBg, borderColor: THEME_COLORS.alertInfoBorder, textColor: THEME_COLORS.alertInfoText, iconColorClass: THEME_COLORS.alertInfoIcon, Icon: InfoIconLucide };
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
  onTextChange?: (path: (string | number)[], newText: string) => void;
  basePath?: (string | number)[];
  suppressRecommendationStripe?: boolean;
}

const RenderBlock: React.FC<RenderBlockProps> = (props) => {
  const { 
    block, depth = 0, isFirstInBox, isLastInBox, 
    isMiniSectionHeadline, isListItemContent,
    isEditing, onTextChange, basePath = [],
    suppressRecommendationStripe
  } = props;

  const fieldPath = (fieldKey: string) => [...basePath, fieldKey];
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
      const { level, text, backgroundColor, textColor: headlineTextColor, iconName, isImportant } = block as HeadlineBlock;
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
        <div className="w-full">
          <Tag
            className={finalClassName}
            style={{ backgroundColor: backgroundColor || 'transparent', color: headlineTextColor || undefined , padding: backgroundColor ? '0.4rem 0.6rem' : undefined, borderRadius: backgroundColor ? '0.25rem' : undefined }}
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
          {isEditing && onTextChange && (
            <div className="mt-2 mb-2">
              <Switch
                checked={!!isImportant}
                onChange={v => onTextChange(fieldPath('isImportant'), String(v))}
                label="Mark as Important Section"
                help="Highlights this section visually. Use for key takeaways or goals."
              />
            </div>
          )}
        </div>
      );
    }
    case 'paragraph': { 
      const { text, isRecommendation } = block as ParagraphBlock;
      const isTopLevelParagraph = depth === 0;
      let paragraphClasses = `text-black text-[10px] leading-normal text-left`; 
      if (isTopLevelParagraph) paragraphClasses += ` w-full`; 
      const defaultMb = depth > 0 ? 'mb-1' : 'mb-2';
      const finalMb = isLastInBox ? 'mb-0' : defaultMb;
      
      let recommendationClasses = "";
      if (isRecommendation && !suppressRecommendationStripe) {
        recommendationClasses = `pl-2.5 border-l-[3px] border-[#FF1414] py-1 rounded-sm`;
      }
      const styledText = parseAndStyleText(text);

      if (isEditing && onTextChange) {
        const currentRawText = (block as ParagraphBlock).text;
        return (
          <div className={`${isRecommendation ? recommendationClasses : ''} ${finalMb} text-left`}>
            <textarea 
              value={currentRawText} 
              onChange={(e) => handleInputChangeEvent(fieldPath('text'), e)}
              className={`${editingTextareaClass} ${isTopLevelParagraph ? 'w-full' : 'w-full'} text-[10px] leading-normal text-black text-left`} 
            />
            <div className="mt-2 mb-2">
              <Switch
                checked={!!isRecommendation}
                onChange={v => onTextChange(fieldPath('isRecommendation'), String(v))}
                label="Recommendation Paragraph"
                help="Visually marks this paragraph as a recommendation."
              />
            </div>
          </div>
        );
      }
      return ( <p className={`${paragraphClasses} ${finalMb} ${recommendationClasses}`.trim()}>{styledText}</p> );
    }
    case 'bullet_list': 
    case 'numbered_list': {
      const currentBlockIconName = block.type === 'bullet_list' ? (block as BulletListBlock).iconName : undefined;
      const { items } = block; 
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
        containerClasses += `pl-2.5 border-l-[3px] border-[#FF1414] py-1 rounded-sm`;
      }

      return (
        <div className={containerClasses.trim()}>
          <ListTag className={`${listStyle} ${textIndentClass} space-y-1.5`}>
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
                  <li key={index} className="flex items-start">
                    {BulletIconToRender && !isNumbered && <BulletIconToRender />}
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleInputChangeEvent(listItemPath(index), e)}
                      className={`${editingInputClass} ml-2 w-full`}
                    />
                  </li>
                );
              }

              // Remove all emoji bullet logic and always use BulletIconToRender
              const nestedIndentation = depth > 0 ? 'ml-6' : '';

              return (
                <li
                  key={index}
                  className={`flex items-start text-black text-xs leading-tight ${nestedIndentation}`}
                >
                  {!isNumbered && BulletIconToRender && <BulletIconToRender />}
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
      const { alertType, title, text, iconName, backgroundColor, borderColor, textColor, iconColor } = block as AlertBlock;
      const { bgColor, borderColor: defaultBorderColor, textColor: defaultTextColor, iconColorClass, Icon } = getAlertColors(alertType);
      return (
        <div className={`p-2 border-l-4 ${bgColor} ${defaultBorderColor} ${isLastInBox ? 'mb-0' : 'mb-3'}`} role="alert">
          <div className="flex">
            <div className="py-1"><Icon className={`h-4 w-4 ${iconColorClass} mr-2`} /></div>
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
                    />
                  )}
                  <textarea
                    value={text}
                    onChange={e => handleInputChangeEvent(fieldPath('text'), e)}
                    className={`${editingTextareaClass} text-xs mb-2`}
                    placeholder="Alert text"
                  />
                  <div className="mt-2 mb-1 p-2 bg-gray-50 border border-gray-200 rounded flex flex-wrap gap-2 items-center text-xs">
                    <div className="flex flex-col gap-0.5 min-w-[90px]">
                      <label className="font-medium text-gray-800 text-xs">Alert Type</label>
                      <select
                        value={alertType}
                        onChange={e => onTextChange(fieldPath('alertType'), e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs bg-white"
                        style={{ minWidth: 60 }}
                      >
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="danger">Danger</option>
                      </select>
                      <span className="text-[10px] text-gray-400">Color & icon</span>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-[90px]">
                      <label className="font-medium text-gray-800 text-xs">Icon Name</label>
                      <input
                        type="text"
                        value={iconName || ''}
                        onChange={e => onTextChange(fieldPath('iconName'), e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs bg-white"
                        placeholder="iconName"
                        style={{ minWidth: 60 }}
                      />
                      <span className="text-[10px] text-gray-400">Lucide/custom</span>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-[70px]">
                      <label className="font-medium text-gray-800 text-xs">Bg</label>
                      <input
                        type="color"
                        value={backgroundColor || ''}
                        onChange={e => onTextChange(fieldPath('backgroundColor'), e.target.value)}
                        className="w-5 h-5 p-0 border rounded"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-[70px]">
                      <label className="font-medium text-gray-800 text-xs">Border</label>
                      <input
                        type="color"
                        value={borderColor || ''}
                        onChange={e => onTextChange(fieldPath('borderColor'), e.target.value)}
                        className="w-5 h-5 p-0 border rounded"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-[70px]">
                      <label className="font-medium text-gray-800 text-xs">Text</label>
                      <input
                        type="color"
                        value={textColor || ''}
                        onChange={e => onTextChange(fieldPath('textColor'), e.target.value)}
                        className="w-5 h-5 p-0 border rounded"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-[70px]">
                      <label className="font-medium text-gray-800 text-xs">Icon</label>
                      <input
                        type="color"
                        value={iconColor || ''}
                        onChange={e => onTextChange(fieldPath('iconColor'), e.target.value)}
                        className="w-5 h-5 p-0 border rounded"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {title && <p className={`font-bold ${textColor}`}>{title}</p>}
                  <p className={`text-xs ${textColor}`}>{text}</p>
                </>
              )}
            </div>
          </div>
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
                    className="px-3 py-2 text-left font-bold border-b border-gray-300 bg-[#232B3A] text-white"
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
                      className="border-b border-gray-200 px-3 py-2 align-top text-black text-left"
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
    default:
      return null;
  }
};

// Add a simple Switch component for better UX
const Switch = ({ checked, onChange, label, help }: { checked: boolean, onChange: (v: boolean) => void, label: string, help?: string }) => (
  <label className="flex items-center gap-1 mt-1 mb-1 cursor-pointer select-none text-xs">
    <span className="relative inline-block w-7 mr-1 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer"
        style={{ left: checked ? '1.1rem' : '0' }}
      />
      <span className={`toggle-label block overflow-hidden h-4 rounded-full bg-gray-300 ${checked ? 'bg-green-400' : ''}`}></span>
    </span>
    <span className="font-medium text-gray-800 text-xs">{label}</span>
    {help && <span className="text-[10px] text-gray-400 ml-1">{help}</span>}
  </label>
);

export interface TextPresentationDisplayProps {
  dataToDisplay: TextPresentationData | null;
  isEditing?: boolean;
  onTextChange?: (path: (string | number)[], newText: string) => void;
  parentProjectName?: string;
}

const TextPresentationDisplay = ({ dataToDisplay, isEditing, onTextChange, parentProjectName }: TextPresentationDisplayProps): React.JSX.Element | null => {
  const searchParams = useSearchParams();
  const lang = dataToDisplay?.detectedLanguage || searchParams?.get('lang') || 'en';
  const locale = locales[lang as keyof typeof locales] || locales.en;

  if (!dataToDisplay) {
    return <div className="p-6 text-center text-gray-500 text-xs">No text content available to display.</div>;
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
        if (innerBlock.type === 'headline' && ((innerBlock as HeadlineBlock).level === 3 || (innerBlock as HeadlineBlock).level === 4) && (innerBlock as HeadlineBlock).isImportant === true && innerNextBlock && (innerNextBlock.type === 'bullet_list' || innerNextBlock.type === 'numbered_list' || innerNextBlock.type === 'paragraph' || innerNextBlock.type === 'alert')) {
          sectionItemsInternal.push({ type: "mini_section", headline: innerBlock as HeadlineBlock, list: innerNextBlock as BulletListBlock | NumberedListBlock | ParagraphBlock | AlertBlock });
          i += 2; 
        } else { sectionItemsInternal.push(innerBlock); i++;  }
      }
      renderableItems.push({ type: "major_section", headline: majorSectionHeadline, items: sectionItemsInternal, _skipRenderHeadline: headlineToSkipThisIteration });
    } else if (currentBlock.type === 'headline' && ((currentBlock as HeadlineBlock).level === 3 || (currentBlock as HeadlineBlock).level === 4) && (currentBlock as HeadlineBlock).isImportant === true && nextBlock && (nextBlock.type === 'bullet_list' || nextBlock.type === 'numbered_list' || nextBlock.type === 'paragraph' || nextBlock.type === 'alert')) {
      renderableItems.push({ type: "mini_section", headline: currentBlock as HeadlineBlock, list: nextBlock as BulletListBlock | NumberedListBlock | ParagraphBlock | AlertBlock });
      i += 2; 
    } else {
      if (i === 0 && skipNextH2Headline && currentBlock.type === 'headline' && ((currentBlock as HeadlineBlock).level === 1 || (currentBlock as HeadlineBlock).level === 2)) { i++; continue; }
      renderableItems.push({ type: "standalone_block", content: currentBlock });
      i++; 
    }
  } 

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

              if (item.type === 'major_section') {
                const originalHeadlineIndex = findOriginalIndex(item.headline);
                return (
                  <section key={index} className="mb-4 p-3 rounded-md text-left">
                    {!item._skipRenderHeadline && (
                      <RenderBlock
                        block={item.headline}
                        basePath={['contentBlocks', originalHeadlineIndex]}
                        isEditing={isEditing}
                        onTextChange={onTextChange}
                      />
                    )}
                    <div className={item._skipRenderHeadline ? '' : 'pl-1'} style={{ textAlign: 'left' }}>
                      {item.items.map((subItem, subIndex) => {
                        const isLastSubItem = subIndex === item.items.length - 1;
                        if (subItem.type === 'mini_section') {
                          const originalMiniHeadlineIndex = findOriginalIndex(subItem.headline);
                          const originalMiniListIndex = findOriginalIndex(subItem.list);
                          return (
                            <div key={subIndex} className="p-3 my-4 border-l-2 border-[#FF1414] bg-white text-left">
                              <RenderBlock
                                block={subItem.headline}
                                isMiniSectionHeadline={true}
                                isFirstInBox={subIndex === 0}
                                basePath={['contentBlocks', originalMiniHeadlineIndex]}
                                isEditing={isEditing}
                                onTextChange={onTextChange}
                              />
                              <RenderBlock
                                block={subItem.list}
                                isLastInBox={isLastSubItem}
                                basePath={['contentBlocks', originalMiniListIndex]}
                                isEditing={isEditing}
                                onTextChange={onTextChange}
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
                          />;
                        }
                      })}
                    </div>
                  </section>
                );
              }

              if (item.type === 'mini_section') {
                const originalHeadlineIndex = findOriginalIndex(item.headline);
                const originalListIndex = findOriginalIndex(item.list);
                return (
                  <div key={index} className="p-3 my-4 rounded-md bg-rose-50 border-l-4 border-rose-500 text-left">
                    <RenderBlock
                      block={item.headline}
                      isMiniSectionHeadline={true}
                      isFirstInBox={index === 0}
                      basePath={['contentBlocks', originalHeadlineIndex]}
                      isEditing={isEditing}
                      onTextChange={onTextChange}
                    />
                    <RenderBlock
                      block={item.list}
                      isLastInBox={isLastItem}
                      basePath={['contentBlocks', originalListIndex]}
                      isEditing={isEditing}
                      onTextChange={onTextChange}
                    />
                  </div>
                );
              }

              if (item.type === 'standalone_block') {
                const originalIndex = findOriginalIndex(item.content);
                return (
                  <RenderBlock
                    key={index}
                    block={item.content}
                    isLastInBox={isLastItem}
                    basePath={['contentBlocks', originalIndex]}
                    isEditing={isEditing}
                    onTextChange={onTextChange}
                  />
                );
              }

              return null;
            })}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TextPresentationDisplay; 