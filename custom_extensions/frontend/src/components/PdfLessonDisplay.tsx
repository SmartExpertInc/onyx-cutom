// custom_extensions/frontend/src/components/PdfLessonDisplay.tsx
"use client";

import React, { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  PdfLessonData, AnyContentBlock, HeadlineBlock, ParagraphBlock,
  BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock,
} from '@/types/pdfLesson';
import {
  AlertCircle, CheckCircle, Info, XCircle, Minus, Type, List, ListOrdered,
  Award, Brain, BookOpen, Edit3, Lightbulb, Search, Compass, CloudDrizzle, EyeOff,
  ClipboardCheck, AlertTriangle, Star, ArrowRight, Circle,
} from 'lucide-react';
import { locales } from '@/locales';
import { useLanguage } from '../contexts/LanguageContext';

// Type definitions for internal structuring
type MiniSection = {
  type: "mini_section";
  headline: HeadlineBlock;
  list: BulletListBlock | NumberedListBlock;
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

const LessonGoalIcon = () => (
  <svg width="16" height="16" viewBox="-1 -1 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5 shrink-0" style={{overflow:'visible'}}>
    <rect width="16" height="16" rx="8" fill="#FF1414"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M7.66681 3.66672C5.08942 3.66672 3 5.75606 3 8.33336C3 10.9107 5.08942 13 7.66681 13C10.2442 13 12.3336 10.9107 12.3336 8.33336C12.3336 7.70679 12.2098 7.10913 11.9858 6.56324L11.9441 6.6049C11.8353 6.71373 11.6922 6.78166 11.5391 6.79694L11.0311 6.84761C11.232 7.30193 11.3438 7.80451 11.3438 8.33325C11.3438 10.364 9.69753 12.0101 7.66681 12.0101C5.63599 12.0101 3.9898 10.3639 3.9898 8.33325C3.9898 6.30261 5.6361 4.65637 7.66681 4.65637C8.19535 4.65637 8.69784 4.76817 9.15206 4.96889L9.20263 4.46137C9.21791 4.30813 9.28617 4.1649 9.39489 4.05607L9.43656 4.01441C8.89076 3.79049 8.2933 3.66672 7.66681 3.66672ZM9.36818 6.16003L9.53428 4.49445C9.5422 4.41772 9.5765 4.34627 9.63058 4.29175L10.8249 3.09753C10.9172 3.00574 11.0538 2.97551 11.1757 3.02069C11.2977 3.06576 11.3832 3.17766 11.393 3.30715L11.4873 4.51237L12.6933 4.60713C12.822 4.61735 12.9342 4.70188 12.9793 4.82401C13.0245 4.94602 12.9941 5.08321 12.9027 5.175L11.7085 6.36922C11.6544 6.42385 11.5827 6.4576 11.506 6.4653L9.84 6.63139L7.90272 8.56893C7.83786 8.63389 7.75234 8.66665 7.66681 8.66665C7.58129 8.66665 7.49576 8.63389 7.4309 8.56893C7.30119 8.43878 7.30119 8.22772 7.4309 8.09746L9.36818 6.16003ZM7.66681 6.99997C7.78609 6.99997 7.90173 7.01569 8.01177 7.04515L7.19522 7.86178C6.93524 8.12175 6.93534 8.54398 7.19489 8.80428C7.3201 8.92981 7.48961 8.99994 7.66681 8.99994C7.84391 8.99994 8.0132 8.92981 8.13841 8.80461L8.95485 7.98798C8.98431 8.09812 9.00014 8.21387 9.00014 8.33336C9.00014 9.06975 8.40323 9.66664 7.66681 9.66664C6.9304 9.66664 6.33348 9.06975 6.33348 8.33336C6.33348 7.59697 6.9304 6.99997 7.66681 6.99997ZM7.66681 5.32296C8.1782 5.32296 8.6598 5.45069 9.08149 5.6756L9.04829 6.00845L8.52865 6.52806C8.26768 6.40319 7.97538 6.33328 7.6667 6.33328C6.56214 6.33328 5.66666 7.22872 5.66666 8.33325C5.66666 9.43777 6.56214 10.3332 7.6667 10.3332C8.77127 10.3332 9.66675 9.43777 9.66675 8.33325C9.66675 8.02447 9.59672 7.73207 9.47174 7.47089L9.99148 6.95105L10.3241 6.91786C10.5494 7.33975 10.6771 7.82144 10.6771 8.33303C10.6771 9.99553 9.32927 11.3433 7.6667 11.3433C6.00414 11.3433 4.6563 9.99553 4.6563 8.33303C4.6563 6.67053 6.00425 5.32296 7.66681 5.32296Z" fill="white"/>
  </svg>
);

const NewBulletIcon = () => (
  <svg width="7" height="7" viewBox="0 0 3 4" xmlns="http://www.w3.org/2000/svg" className="mr-1.5 mt-[1px] shrink-0 icon-new-bullet" style={{ fill: "#FF1414" }}>
    <path d="M3 2L8.69979e-08 3.73205L2.38419e-07 0.267944L3 2Z" />
  </svg>
);

const LastSectionStarIcon = () => (
  <svg width="16" height="16" viewBox="-1 -1 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5 shrink-0" style={{overflow:'visible'}}>
    <rect width="16" height="16" rx="8" fill="#FF1414"/>
    <path d="M7.68389 3.24065C7.78339 2.91978 8.21661 2.91978 8.31611 3.24065L9.26859 6.31234C9.31309 6.45584 9.4407 6.553 9.5847 6.553H12.667C12.989 6.553 13.1228 6.98473 12.8624 7.18304L10.3687 9.08144C10.2522 9.17013 10.2035 9.32733 10.248 9.47083L11.2005 12.5425C11.3 12.8634 10.9495 13.1302 10.689 12.9319L8.19536 11.0335C8.07887 10.9448 7.92113 10.9448 7.80464 11.0335L5.31101 12.9319C5.05052 13.1302 4.70004 12.8634 4.79954 12.5425L5.75202 9.47083C5.79651 9.32733 5.74777 9.17013 5.63127 9.08144L3.13765 7.18304C2.87716 6.98473 3.01103 6.553 3.33301 6.553H6.41531C6.5593 6.553 6.68692 6.45584 6.73141 6.31234L7.68389 3.24065Z" fill="white"/>
  </svg>
);

const iconMap: { [key: string]: React.ElementType } = {
  alertCircle: AlertCircle, checkCircle: CheckCircle, info: Info, xCircle: XCircle,
  type: Type, list: List, listOrdered: ListOrdered,
  award: Award, brain: Brain, bookOpen: Edit3, lightbulb: Lightbulb,
  search: Search, compass: Compass, cloudDrizzle: CloudDrizzle, eyeOff: EyeOff,
  clipboardCheck: ClipboardCheck, alertTriangle: AlertTriangle,
  star: Star, 
  arrowRight: ArrowRight, circle: Circle,
  default: Minus,
};

const THEME_COLORS = {
  primaryText: 'text-[#4B4B4B]',        
  headingText: 'text-black',        
  subHeadingText: 'text-black',     
  accentRed: 'text-black', 
  accentRedBg: 'bg-[#FF1414]',      
  veryLightAccentBg: 'bg-[#FAFAFA]',
  lightBorder: 'border-gray-200',   
  mutedText: 'text-[#4B4B4B]',          
  defaultBorder: 'border-gray-300', 
  underlineAccent: 'border-[#FF1414]',
  alertInfoText: 'text-[#4B4B4B]',      
  alertSuccessText: 'text-[#4B4B4B]',   
  alertWarningText: 'text-[#4B4B4B]',   
  alertDangerText: 'text-[#4B4B4B]',    
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
        case 'info': return { bgColor: THEME_COLORS.alertInfoBg, borderColor: THEME_COLORS.alertInfoBorder, textColor: THEME_COLORS.alertInfoText, iconColorClass: THEME_COLORS.alertInfoIcon, Icon: Info };
        case 'success': return { bgColor: THEME_COLORS.alertSuccessBg, borderColor: THEME_COLORS.alertSuccessBorder, textColor: THEME_COLORS.alertSuccessText, iconColorClass: THEME_COLORS.alertSuccessIcon, Icon: CheckCircle };
        case 'warning': return { bgColor: THEME_COLORS.alertWarningBg, borderColor: THEME_COLORS.alertWarningBorder, textColor: THEME_COLORS.alertWarningText, iconColorClass: THEME_COLORS.alertWarningIcon, Icon: AlertTriangle };
        case 'danger': return { bgColor: THEME_COLORS.alertDangerBg, borderColor: THEME_COLORS.alertDangerBorder, textColor: THEME_COLORS.alertDangerText, iconColorClass: THEME_COLORS.alertDangerIcon, Icon: XCircle };
        default: return { bgColor: THEME_COLORS.alertInfoBg, borderColor: THEME_COLORS.alertInfoBorder, textColor: THEME_COLORS.alertInfoText, iconColorClass: THEME_COLORS.alertInfoIcon, Icon: Info };
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
  isLastSectionHeaderWithStar?: boolean;
  isMiniSectionList?: boolean; 
}

const RenderBlock: React.FC<RenderBlockProps> = (props) => {
  const { 
    block, depth = 0, isFirstInBox, isLastInBox, 
    isMiniSectionHeadline, isListItemContent,
    isEditing, onTextChange, basePath = [],
    isLastSectionHeaderWithStar, isMiniSectionList
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
      const { level, text, backgroundColor, textColor: headlineTextColor, isImportant } = block as HeadlineBlock;
      const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
      
      let textStyleClass = 'uppercase '; 
      if (level === 1) { textStyleClass += `text-lg lg:text-xl font-semibold ${THEME_COLORS.headingText}`; } 
      else if (level === 2) { textStyleClass += `text-base lg:text-lg font-semibold ${THEME_COLORS.headingText}`; }  
      else if (level === 3) { textStyleClass += `text-base lg:text-lg font-semibold ${THEME_COLORS.accentRed}`; } 
      else if (level === 4) { textStyleClass += `text-sm lg:text-base font-medium ${THEME_COLORS.subHeadingText}`; }
      else { textStyleClass += `text-base font-medium ${THEME_COLORS.subHeadingText}`; }

      if (depth > 0) {
        textStyleClass = 'uppercase '; 
        if (level === 3) textStyleClass += `text-sm font-semibold ${THEME_COLORS.accentRed}`; 
        else if (level === 4) textStyleClass += `text-xs font-medium ${THEME_COLORS.subHeadingText}`;
      }
      if (isMiniSectionHeadline) {
          textStyleClass = 'uppercase '; 
          textStyleClass += level === 3 ? `text-base font-semibold ${THEME_COLORS.accentRed}` : `text-sm font-medium ${THEME_COLORS.accentRed}`; 
          if (depth > 0) { 
            textStyleClass = 'uppercase '; 
            textStyleClass += level === 3 ? `text-sm font-semibold ${THEME_COLORS.accentRed}` : `text-xs font-medium ${THEME_COLORS.accentRed}`;
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
            {isLastSectionHeaderWithStar ? <LastSectionStarIcon /> : (isMiniSectionHeadline && <LessonGoalIcon />)}
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
      let paragraphClasses = `${THEME_COLORS.primaryText} text-[10px] leading-normal`; 
      if (isTopLevelParagraph) paragraphClasses += ` w-[75%]`; 
      const defaultMb = depth > 0 ? 'mb-1' : 'mb-2';
      const finalMb = isLastInBox ? 'mb-0' : defaultMb;
      
      let recommendationClasses = "";
      if (isRecommendation) {
        recommendationClasses = `pl-2.5 border-l-[3px] border-[#FF1414] py-1`;
      }
      const styledText = parseAndStyleText(text);

      if (isEditing && onTextChange) {
        const currentRawText = (block as ParagraphBlock).text;
        return (
          <div className={`${isRecommendation ? recommendationClasses : ''} ${finalMb}`}> 
            <textarea 
              value={currentRawText} 
              onChange={(e) => handleInputChangeEvent(fieldPath('text'), e)}
              className={`${editingTextareaClass} ${isTopLevelParagraph ? 'w-[75%]' : 'w-full'} text-[10px] leading-normal ${THEME_COLORS.primaryText.replace('text-black', '')}`} 
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
      
      let BulletIconToRender: React.ElementType | null = NewBulletIcon; 
      if (block.type === 'bullet_list') {
        if (currentBlockIconName && currentBlockIconName !== "none") {
            BulletIconToRender = iconMap[currentBlockIconName] || NewBulletIcon; 
        } else if (currentBlockIconName === "none") {
            BulletIconToRender = null; 
        }
      }

      const ListTag = isNumbered ? 'ol' : 'ul';
      let listClasses = `list-none ${isLastInBox ? 'mb-0' : 'mb-2'} ${isNumbered ? 'space-y-2' : 'space-y-0.5'}`;
      if (isMiniSectionList) {
        listClasses += " pl-[22px]"; 
      }

      const listItemBaseTextStyle = `text-[10px] ${THEME_COLORS.primaryText}`;

      return (
        <ListTag className={listClasses.trim()}>
          {items.map((item, index) => {
            const itemNumber = isNumbered ? `${depth > 0 ? String.fromCharCode(97 + depth -1) : ''}${index + 1}` : '';
            const currentItemPathForData = listItemPath(index); 
            const isPlainStringNoBold = (typeof item === 'string') && !item.includes('**');
            const textSource = (typeof item === 'string') ? ((isNumbered && isPlainStringNoBold) ? `**${item}**` : item) : "";
            const styledItemText = (typeof item === 'string') ? parseAndStyleText(textSource) : null;

            if (isNumbered) {
              const liBoxClass = `${THEME_COLORS.veryLightAccentBg} border border-[#FF1414] rounded-md p-2.5`;
              return (
                <li key={index} className={`${liBoxClass} ${listItemBaseTextStyle}`}>
                  <div className={`flex items-center`}>
                    <span 
                      className={`mr-2.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${THEME_COLORS.accentRedBg} text-white text-[10px] font-medium`}
                    > {itemNumber} </span>
                    <div className="flex-grow">
                      {typeof item === 'string' ? (
                        isEditing && onTextChange ? (
                          <input 
                            type="text" 
                            value={item} 
                            onChange={(e) => handleInputChangeEvent(currentItemPathForData, e)}
                            className={`${editingInputClass} ${listItemBaseTextStyle.replace(THEME_COLORS.primaryText, '')}`}
                          />
                        ) : ( <span>{styledItemText}</span> )
                      ) : (
                        <RenderBlock 
                            block={item as AnyContentBlock} depth={depth + 1} 
                            isFirstInBox={true} isLastInBox={true} isListItemContent={true} 
                            isEditing={isEditing} onTextChange={onTextChange} 
                            basePath={currentItemPathForData} 
                        />
                      )}
                    </div>
                  </div>
                </li>
              );
            } else { // Bullet List
              return (
                <li key={index} className={`py-0.5 ${listItemBaseTextStyle} flex items-center`}>
                  {BulletIconToRender && <div className="pt-[0.1em] mr-1.5 shrink-0"><BulletIconToRender /></div>}
                  <div className="flex-grow">
                    {typeof item === 'string' ? (
                      isEditing && onTextChange ? (
                        <input 
                          type="text" value={item} 
                          onChange={(e) => handleInputChangeEvent(currentItemPathForData, e)}
                          className={`${editingInputClass} ${listItemBaseTextStyle.replace(THEME_COLORS.primaryText, '')} ml-0`}
                        />
                      ) : ( <span>{styledItemText}</span>)
                    ) : ( 
                        <RenderBlock 
                          block={item as AnyContentBlock} depth={depth + 1} 
                          isLastInBox={index === items.length -1 && isLastInBox}
                          isEditing={isEditing} onTextChange={onTextChange}
                          basePath={currentItemPathForData}
                        />
                    )}
                  </div>
                </li>
              );
            }
          })}
        </ListTag>
      );
    }
    case 'alert': { 
        const alertBlock = block as AlertBlock;
        const { bgColor, borderColor, textColor, iconColorClass, Icon } = getAlertColors(alertBlock.alertType); 
        const CustomIcon = alertBlock.iconName ? iconMap[alertBlock.iconName] || Icon : Icon;
        const finalBgColor = alertBlock.backgroundColor || bgColor;
        const finalBorderColor = alertBlock.borderColor || borderColor;
        const finalTextColorToUse = alertBlock.textColor || textColor; 
        const finalIconColorClass = alertBlock.iconColor ? '' : iconColorClass; 
        const finalIconColorStyle = alertBlock.iconColor || undefined;
        const defaultAlertMb = 'my-3';
        const finalAlertMb = isLastInBox ? 'mb-0 mt-3' : defaultAlertMb; 
        const alertTextStyle = `text-[10px]`;
        
        const styledAlertTitle = alertBlock.title ? parseAndStyleText(alertBlock.title) : null;
        const styledAlertText = parseAndStyleText(alertBlock.text);

        return (
          <div className={`p-2.5 border-l-4 rounded-r-sm ${finalBgColor} ${finalBorderColor} ${depth > 0 ? 'ml-3' : ''} ${finalAlertMb}`} style={{ backgroundColor: alertBlock.backgroundColor || undefined, borderColor: alertBlock.borderColor || undefined }}>
            <div className="flex">
              <div className="shrink-0 pt-[1px]"><CustomIcon size={16} className={`${finalIconColorClass}`} style={{ color: finalIconColorStyle }} /></div>
              <div className={`ml-2 flex-grow ${finalTextColorToUse}`}> 
                {alertBlock.title && ( isEditing && onTextChange ? ( <input type="text" value={alertBlock.title || ''} onChange={(e) => handleInputChangeEvent(fieldPath('title'), e)} className={`${editingInputClass} ${alertTextStyle} font-semibold mb-0.5 ${finalTextColorToUse.replace(THEME_COLORS.alertInfoText, '')}`}/>
                  ) : ( <h3 className={`${alertTextStyle} font-semibold`} style={{ color: alertBlock.textColor || undefined }}>{styledAlertTitle}</h3> )
                )}
                {isEditing && onTextChange ? ( <textarea value={alertBlock.text} onChange={(e) => handleInputChangeEvent(fieldPath('text'), e)} className={`${editingTextareaClass} ${alertTextStyle} ${alertBlock.title ? 'mt-0.5' : ''} ${finalTextColorToUse.replace(THEME_COLORS.alertInfoText, '')}`}/>
                ) : ( <div className={`${alertTextStyle} ${alertBlock.title ? 'mt-0.5' : ''}`} style={{ color: alertBlock.textColor || undefined }}>{styledAlertText}</div> )}
                {isEditing && onTextChange && (
                  <div className="mt-3 mb-2 p-3 bg-gray-50 border border-gray-200 rounded-lg flex flex-wrap gap-4 items-center">
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <label className="font-medium text-gray-800">Alert Type</label>
                      <select
                        value={alertBlock.alertType}
                        onChange={e => onTextChange(fieldPath('alertType'), e.target.value)}
                        className="border rounded px-2 py-1 text-sm bg-white"
                      >
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="danger">Danger</option>
                      </select>
                      <span className="text-xs text-gray-500">Controls the color and icon</span>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <label className="font-medium text-gray-800">Icon Name</label>
                      <input
                        type="text"
                        value={alertBlock.iconName || ''}
                        onChange={e => onTextChange(fieldPath('iconName'), e.target.value)}
                        className="border rounded px-2 py-1 text-sm bg-white"
                        placeholder="iconName"
                      />
                      <span className="text-xs text-gray-500">Lucide or custom icon</span>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <label className="font-medium text-gray-800">Background</label>
                      <input
                        type="color"
                        value={alertBlock.backgroundColor || ''}
                        onChange={e => onTextChange(fieldPath('backgroundColor'), e.target.value)}
                        className="w-8 h-8 p-0 border rounded"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <label className="font-medium text-gray-800">Border</label>
                      <input
                        type="color"
                        value={alertBlock.borderColor || ''}
                        onChange={e => onTextChange(fieldPath('borderColor'), e.target.value)}
                        className="w-8 h-8 p-0 border rounded"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <label className="font-medium text-gray-800">Text Color</label>
                      <input
                        type="color"
                        value={alertBlock.textColor || ''}
                        onChange={e => onTextChange(fieldPath('textColor'), e.target.value)}
                        className="w-8 h-8 p-0 border rounded"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <label className="font-medium text-gray-800">Icon Color</label>
                      <input
                        type="color"
                        value={alertBlock.iconColor || ''}
                        onChange={e => onTextChange(fieldPath('iconColor'), e.target.value)}
                        className="w-8 h-8 p-0 border rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
    case 'section_break': {
      const sb = block as SectionBreakBlock;
      if (sb.style === 'none') return <div className="my-4"></div>;
      let hrClassName = "my-3 border-t border-gray-200"; 
      if (sb.style === 'dashed') hrClassName = "my-3 border-dashed border-gray-200"; 
      return <hr className={hrClassName} />;
    }
    case 'table': {
      const { headers, rows, caption } = block as any;
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full border border-gray-300 text-[10px]">
            {caption && <caption className="text-xs text-gray-500 mb-2">{caption}</caption>}
            <thead>
              <tr>
                {headers.map((header: string, idx: number) => (
                  <th key={idx} className="border-b border-gray-300 px-2 py-1 bg-gray-100 font-semibold text-left">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: string[], rIdx: number) => (
                <tr key={rIdx}>
                  {row.map((cell: string, cIdx: number) => (
                    <td key={cIdx} className="border-b border-gray-200 px-2 py-1 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    default:
      const exhaustiveCheck: never = block;
      return <div className="text-red-500 text-[10px]">Unsupported block type: {(exhaustiveCheck as any)?.type}</div>;
  }
};

// Add a simple Switch component for better UX
const Switch = ({ checked, onChange, label, help }: { checked: boolean, onChange: (v: boolean) => void, label: string, help?: string }) => (
  <label className="flex items-center gap-2 mt-2 mb-2 cursor-pointer select-none">
    <span className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
        style={{ left: checked ? '1.5rem' : '0' }}
      />
      <span className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 ${checked ? 'bg-green-400' : ''}`}></span>
    </span>
    <span className="font-medium text-gray-800">{label}</span>
    {help && <span className="text-xs text-gray-500 ml-2">{help}</span>}
  </label>
);

export interface PdfLessonDisplayProps {
  dataToDisplay: PdfLessonData | null;
  isEditing?: boolean;
  onTextChange?: (path: (string | number)[], newText: string) => void;
  parentProjectName?: string;
  lessonNumber?: number;
}

const PdfLessonDisplay = ({ dataToDisplay, isEditing, onTextChange, parentProjectName, lessonNumber }: PdfLessonDisplayProps): React.JSX.Element | null => {
  const { t } = useLanguage();

  if (!dataToDisplay) {
    return <div className="p-6 text-center text-gray-500 text-xs">No lesson content available to display.</div>;
  }
  
  const renderableItems: RenderableItem[] = [];
  let i = 0;
  let isFirstH2Processed = false;
  let skipNextH2Headline = false;
  const contentBlocksToProcess = dataToDisplay.contentBlocks || [];

  if (dataToDisplay.lessonTitle && contentBlocksToProcess.length > 0) {
    const firstBlock = contentBlocksToProcess[0];
    if (firstBlock.type === 'headline' &&
        ((firstBlock as HeadlineBlock).level === 1 || (firstBlock as HeadlineBlock).level === 2) &&
        (firstBlock as HeadlineBlock).text.trim().toLowerCase() === dataToDisplay.lessonTitle.trim().toLowerCase()) {
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
        if (innerBlock.type === 'headline' && ((innerBlock as HeadlineBlock).level === 3 || (innerBlock as HeadlineBlock).level === 4) && (innerBlock as HeadlineBlock).isImportant === true && innerNextBlock && (innerNextBlock.type === 'bullet_list' || innerNextBlock.type === 'numbered_list')) {
          sectionItemsInternal.push({ type: "mini_section", headline: innerBlock as HeadlineBlock, list: innerNextBlock as BulletListBlock | NumberedListBlock });
          i += 2; 
        } else { sectionItemsInternal.push(innerBlock); i++;  }
      }
      renderableItems.push({ type: "major_section", headline: majorSectionHeadline, items: sectionItemsInternal, _skipRenderHeadline: headlineToSkipThisIteration });
    } else if (currentBlock.type === 'headline' && ((currentBlock as HeadlineBlock).level === 3 || (currentBlock as HeadlineBlock).level === 4) && (currentBlock as HeadlineBlock).isImportant === true && nextBlock && (nextBlock.type === 'bullet_list' || nextBlock.type === 'numbered_list')) {
      renderableItems.push({ type: "mini_section", headline: currentBlock as HeadlineBlock, list: nextBlock as BulletListBlock | NumberedListBlock });
      i += 2; 
    } else {
      if (i === 0 && skipNextH2Headline && currentBlock.type === 'headline' && ((currentBlock as HeadlineBlock).level === 1 || (currentBlock as HeadlineBlock).level === 2)) { i++; continue; }
      renderableItems.push({ type: "standalone_block", content: currentBlock });
      i++; 
    }
  } 

  const findOriginalIndex = (blockToFind: AnyContentBlock | HeadlineBlock | BulletListBlock | NumberedListBlock): number => {
      return (dataToDisplay?.contentBlocks || []).findIndex(cb => cb === blockToFind);
  };

  const lastHeadlineBlock = [...(dataToDisplay.contentBlocks || [])]
    .reverse()
    .find(block => block.type === 'headline');
  
  const styledLessonTitle = parseAndStyleText(dataToDisplay.lessonTitle);

  return (
    <div className="font-['Inter',_sans-serif] bg-white p-4 sm:p-6 md:p-8 shadow-lg rounded-md max-w-3xl mx-auto my-6">
      {parentProjectName && (
          <div className="pl-2.5 border-l-[3px] border-[#FF1414] py-1 mb-2">
              <span className="uppercase text-lg sm:text-xl font-medium text-black">
                  <span style={{ color: '#FF1414' }}>{t('common.course', 'COURSE')}:</span> {parentProjectName}
              </span>
          </div>
      )}
      {dataToDisplay.lessonTitle && (
        <div className={`mb-4`}>
          {isEditing && onTextChange ? (
            <input
              type="text"
              value={dataToDisplay.lessonTitle} 
              onChange={(e) => onTextChange!(['lessonTitle'], e.target.value)}
              className={`uppercase w-full text-2xl sm:text-3xl font-medium ${THEME_COLORS.headingText} mb-1.5 p-1 ${editingInputClass} outline-none focus:ring-1 focus:ring-yellow-500`}
              style={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit', textTransform: 'uppercase' }}
            />
          ) : (
            <h1 className={`uppercase text-2xl sm:text-3xl font-medium ${THEME_COLORS.headingText} mb-1.5`}>
              {lessonNumber && <span style={{ color: '#FF1414' }}>{t('common.lesson', 'LESSON')} №{lessonNumber}:</span>} {styledLessonTitle}
            </h1>
          )}
        </div>
      )}
      <div className="max-w-none">
        {renderableItems.map((item, index) => {
          let showDividerBeforeItem = false; 
          if (index > 0) { 
            const previousItem = renderableItems[index - 1];
            if (item.type === 'major_section' || (item.type === 'standalone_block' && item.content.type === 'headline') || item.type === 'mini_section') {
              let prevItemExemptsDivider = false;
              if (previousItem.type === 'mini_section') prevItemExemptsDivider = true;
              else if (previousItem.type === 'standalone_block' && previousItem.content.type === 'numbered_list') prevItemExemptsDivider = true;
              if (!prevItemExemptsDivider) showDividerBeforeItem = true;
            }
          }
          
          const fragmentKey = `renderable-item-${index}`;
          let isCurrentItemEffectivelyLast = false;
          if (index === renderableItems.length - 1) { isCurrentItemEffectivelyLast = true; } 
          else {
            const nextItem = renderableItems[index + 1]; let dividerWillBeBeforeNextItem = false;
            if (nextItem.type === 'major_section' || (nextItem.type === 'standalone_block' && nextItem.content.type === 'headline') || nextItem.type === 'mini_section') { 
                let currentItemExemptsNextDivider = false;
                if (item.type === 'mini_section') currentItemExemptsNextDivider = true;
                else if (item.type === 'standalone_block' && item.content.type === 'numbered_list') currentItemExemptsNextDivider = true;
                if (!currentItemExemptsNextDivider) dividerWillBeBeforeNextItem = true;
            }
            isCurrentItemEffectivelyLast = dividerWillBeBeforeNextItem;
          }

          return (
            <React.Fragment key={fragmentKey}>
              {showDividerBeforeItem && ( <hr className="my-3 border-t border-gray-200" /> )}
              {item.type === "major_section" && (
                <div className="my-2"> 
                  {!item._skipRenderHeadline && 
                    <RenderBlock 
                        block={item.headline} 
                        isFirstInBox={true} 
                        isLastInBox={item.items.length === 0 && isCurrentItemEffectivelyLast} 
                        isEditing={isEditing} onTextChange={onTextChange} 
                        basePath={['contentBlocks', findOriginalIndex(item.headline)]} 
                        isLastSectionHeaderWithStar={item.headline === lastHeadlineBlock}
                    />
                  } 
                  {item.items.map((subItem, subIndex) => {
                      const isLastSubItemInMajor = subIndex === item.items.length - 1;
                      if (typeof subItem === 'object' && 'type' in subItem && subItem.type === "mini_section") {
                        const miniSec = subItem as MiniSection;
                        return (
                          <div key={`major-${index}-mini-${subIndex}`} className="bg-rose-50 border-l-4 border-rose-500 rounded-md p-3 my-2">
                            <RenderBlock 
                                block={miniSec.headline} 
                                isFirstInBox={true} isLastInBox={false} isMiniSectionHeadline={true} 
                                isEditing={isEditing} onTextChange={onTextChange} 
                                basePath={['contentBlocks', findOriginalIndex(miniSec.headline)]}
                                isLastSectionHeaderWithStar={miniSec.headline === lastHeadlineBlock}
                            />
                            <RenderBlock block={miniSec.list} isFirstInBox={false} isLastInBox={true} isEditing={isEditing} onTextChange={onTextChange} basePath={['contentBlocks', findOriginalIndex(miniSec.list)]} isMiniSectionList={true}/>
                          </div>);
                      } else {
                        return <RenderBlock key={`major-${index}-block-${subIndex}`} block={subItem as AnyContentBlock} isLastInBox={isLastSubItemInMajor && isCurrentItemEffectivelyLast} isEditing={isEditing} onTextChange={onTextChange} basePath={['contentBlocks', findOriginalIndex(subItem as AnyContentBlock)]}/>;
                      }
                  })}
                </div>
              )}
              {item.type === "mini_section" && (
                 (() => {
                    return (
                        <div className="bg-rose-50 border-l-4 border-rose-500 rounded-md p-3 my-2">
                        <RenderBlock 
                            block={item.headline} 
                            isFirstInBox={true} isLastInBox={false} isMiniSectionHeadline={true} 
                            isEditing={isEditing} onTextChange={onTextChange} 
                            basePath={['contentBlocks', findOriginalIndex(item.headline)]}
                            isLastSectionHeaderWithStar={item.headline === lastHeadlineBlock}
                        />
                        <RenderBlock block={item.list} isFirstInBox={false} isLastInBox={true} isEditing={isEditing} onTextChange={onTextChange} basePath={['contentBlocks', findOriginalIndex(item.list)]} isMiniSectionList={true}/>
                        </div> );
                })()
              )}
              {item.type === "standalone_block" && ( 
                <RenderBlock 
                    block={item.content} 
                    isLastInBox={isCurrentItemEffectivelyLast} 
                    isEditing={isEditing} onTextChange={onTextChange} 
                    basePath={['contentBlocks', findOriginalIndex(item.content)]}
                    isLastSectionHeaderWithStar={item.content.type === 'headline' && item.content === lastHeadlineBlock}
                /> 
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PdfLessonDisplay;