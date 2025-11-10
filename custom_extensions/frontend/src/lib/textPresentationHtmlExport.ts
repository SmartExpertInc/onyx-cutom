// custom_extensions/frontend/src/lib/textPresentationHtmlExport.ts

import {
  TextPresentationData,
  AnyContentBlock,
  HeadlineBlock,
  ParagraphBlock,
  BulletListBlock,
  NumberedListBlock,
  AlertBlock,
  SectionBreakBlock,
  ImageBlock,
  TableBlock,
  ColumnContainerBlock,
  PurpleBoxBlock,
  ListItem,
} from '@/types/textPresentation';

const purpleBoxIconSvgs: Record<string, string> = {
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15 15 0 0 0 0 20"></path><path d="M12 2a15 15 0 0 1 0 20"></path></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><line x1="7" y1="13" x2="7" y2="21"></line><line x1="12" y1="9" x2="12" y2="21"></line><line x1="17" y1="5" x2="17" y2="21"></line></svg>`,
  boxes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l9 5-9 5-9-5 9-5z"></path><path d="M3 7v10l9 5 9-5V7"></path><path d="M12 12v10"></path></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="8"></line></svg>`,
  goal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 14.9 8.62 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 9.1 8.62 12 2"></polygon></svg>`,
  apple: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 13c-1.13 3.7-.43 7.2 1 9-4 .67-8-1.33-10-5-2-3.65-1.19-8.52 2-10 1.18-.63 3 .5 4 0 .83-.38 1.5-2.27 1-4 2.67.67 4 4 2 6 2 .5 3 3 0 4Z"></path><path d="M12 7s-1-1-2-1-2 .5-2 .5"></path></svg>`,
  award: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M9 14l-3 7 6-3 6 3-3-7"></path></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
};

const customToolIconSvgs: Record<string, string> = {
  drilling: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.6315 6.92906H22.3646C23.6174 6.92906 24.6387 5.90782 24.6387 4.64904V3.5625C24.6387 2.90935 24.1043 2.375 23.4512 2.375H14.5449C13.8918 2.375 13.3574 2.90935 13.3574 3.5625V4.64904C13.3574 5.90782 14.3786 6.92906 15.6315 6.92906Z" fill="currentColor"/><path d="M18.9988 29.1841C19.1531 29.1841 19.3016 29.1247 19.4203 29.0059L21.825 26.6013C21.9378 26.4944 21.9972 26.34 21.9972 26.1856V25.7344L17.3125 27.7413L18.5772 29.0059C18.6959 29.1247 18.8444 29.1841 18.9988 29.1841Z" fill="currentColor"/><path d="M16.002 8.11719V11.8756L15.5091 12.0834C15.2063 12.2141 15.0698 12.5644 15.1945 12.8672C15.3319 13.1743 15.7048 13.3135 16.002 13.1641L22.0048 10.605L22.4916 10.3972C23.2186 10.068 22.7236 8.98124 22.0047 9.31659C22.0048 9.31657 22.0048 8.11719 22.0048 8.11719H16.002Z" fill="currentColor"/><path d="M22.8052 14.2319C22.6785 13.921 22.3068 13.7779 22.0037 13.9291V11.8984C19.7415 12.818 16.5389 14.3141 16.0009 14.3863C16.0009 14.3863 16.0009 16.4763 16.0009 16.4763L15.5021 16.69C14.7774 17.0265 15.2782 18.1042 16.0009 17.7706C16.0009 17.7706 22.0037 15.2175 22.0037 15.2175L22.4906 15.0097C22.7934 14.885 22.9359 14.5347 22.8052 14.2319Z" fill="currentColor"/><path d="M22.806 18.8472C22.6771 18.5317 22.3056 18.3965 21.9985 18.5444L22.0044 16.5078L16.4647 18.865C16.3163 18.9303 16.1619 18.9778 16.0016 18.9956V21.0915L15.5029 21.3053C15.206 21.43 15.0635 21.7803 15.1941 22.0831C15.3265 22.4012 15.7007 22.5293 16.0016 22.3859C16.0016 22.386 21.9985 19.8328 21.9985 19.8328L22.4913 19.625C22.7941 19.4944 22.9366 19.15 22.806 18.8472Z" fill="currentColor"/><path d="M22.4895 24.2383C23.2167 23.907 22.7339 22.8259 21.9966 23.1517L21.9966 21.1211C19.8318 22.0204 16.391 23.5734 15.9998 23.6149L15.9998 25.7108L15.5545 25.9008C14.9618 26.1419 15.1566 27.052 15.7861 27.0408C15.9377 27.0576 16.2607 26.8825 16.4035 26.833L21.9966 24.4461L22.4895 24.2383Z" fill="currentColor"/><path d="M13.6543 14.8438C13.6543 14.5172 13.3871 14.25 13.0605 14.25H2.9668C2.64024 14.25 2.37305 14.5172 2.37305 14.8438V17.8125H13.6543V14.8438Z" fill="currentColor"/><path d="M4.19587 23.7916C4.55413 24.0002 5.42014 24.0001 5.77522 23.7915C6.04836 23.6847 6.3868 23.5481 7.01024 23.5481C8.08021 23.5346 8.11102 23.9306 9.02899 23.9519C9.93919 23.9296 9.97634 23.5341 11.0418 23.5482C12.1217 23.5345 12.1395 23.9308 13.0605 23.9519C13.0606 23.9519 13.6543 23.9519 13.6543 23.9519V19H2.37305V23.5481C2.99299 23.5137 3.83458 23.5907 4.19587 23.7916Z" fill="currentColor"/><path d="M15.2218 29.3063C14.1062 28.2068 13.5778 26.6901 13.6543 25.1382C13.0357 25.1726 12.1918 25.0955 11.8315 24.8947C11.4779 24.6871 10.6149 24.6851 10.2581 24.8948C9.98493 25.0016 9.64648 25.1382 9.029 25.1382C7.95384 25.1527 7.92784 24.7575 7.01024 24.7344C6.08863 24.7563 6.06338 25.1521 4.98555 25.1381C3.91648 25.1517 3.88407 24.7557 2.96681 24.7344C2.9668 24.7344 2.37305 24.7344 2.37305 24.7344V29.6863H15.6433C15.4949 29.5676 15.3584 29.4428 15.2218 29.3063Z" fill="currentColor"/><path d="M35.0293 14.25H24.9355C24.609 14.25 24.3418 14.5172 24.3418 14.8438V17.8125H35.623V14.8438C35.623 14.5172 35.3559 14.25 35.0293 14.25Z" fill="currentColor"/><path d="M24.3418 23.5481H24.9355C26.0032 23.5346 26.0406 23.9309 26.9543 23.9519C27.8748 23.9299 27.902 23.5342 28.979 23.5481C29.5965 23.5481 29.9349 23.6847 30.208 23.7916C30.5617 23.9991 31.4245 24.0011 31.7815 23.7915C32.0546 23.6847 32.393 23.5481 33.0105 23.5481C33.634 23.5481 33.9724 23.6847 34.2396 23.7916C34.5375 23.9715 35.2111 23.9602 35.6231 23.9518L35.623 19H24.3418V23.5481Z" fill="currentColor"/><path d="M33.8012 24.8947C33.4476 24.6871 32.5846 24.6851 32.2277 24.8948C31.9546 25.0016 31.6162 25.1382 30.9987 25.1382C29.9233 25.1526 29.8977 24.7575 28.9799 24.7344C28.0586 24.7563 28.0328 25.1521 26.9552 25.1381C25.8859 25.1517 25.8539 24.7557 24.9365 24.7344C24.9365 24.7344 24.3427 24.7344 24.3427 24.7344C24.4898 26.6531 23.8234 28.5456 22.3477 29.6863C22.3477 29.6863 35.624 29.6863 35.624 29.6863V25.1382C35.0034 25.1725 34.1629 25.0957 33.8012 24.8947ZM27.5371 28.196C26.7572 28.1852 26.7565 27.0231 27.5371 27.0085C28.3178 27.0232 28.3169 28.1853 27.5371 28.196ZM30.874 27.6022C30.094 27.5914 30.0933 26.4294 30.874 26.4147C31.6547 26.4295 31.6538 27.5915 30.874 27.6022Z" fill="currentColor"/><path d="M2.37305 35.0312C2.37305 35.3578 2.64024 35.625 2.9668 35.625H35.0293C35.3559 35.625 35.6231 35.3578 35.6231 35.0312V30.875H2.37305V35.0312Z" fill="currentColor"/></svg>`,
  sawing: `<svg viewBox="0 0 34 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.98869 0.936214C7.7403 -0.312104 5.70909 -0.312039 4.46077 0.936214L0.939119 4.45793C-0.309133 5.70625 -0.309133 7.73747 0.939119 8.98585L5.7164 13.7631L13.766 5.7135L8.98869 0.936214ZM5.46704 7.97958L3.95773 6.47027L6.47318 3.95483L7.98248 5.46413L5.46704 7.97958Z" fill="currentColor"/><path d="M33.4429 25.6133H0.00292969V29.8822H33.4429V25.6133Z" fill="currentColor"/><path d="M15.2743 7.42188L9.1875 13.5087L10.0213 17.3441L13.8784 18.1828L14.7169 22.0398L18.6397 22.8926L18.8239 23.4762H29.9987L15.2743 7.42188Z" fill="currentColor"/></svg>`,
  finishing: `<svg viewBox="0 0 34 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M33.4411 21.6254V17.6914H26.5567V18.6749C26.5567 21.3864 24.3507 22.6089 21.6392 22.6089H19.6722C17.5031 22.6089 15.7383 24.3736 15.7383 26.5428H33.4411V23.5924H27.5402V21.6254H33.4411Z" fill="currentColor"/><path d="M21.6378 20.6419C23.2647 20.6419 24.5882 20.3019 24.5882 18.6749V17.6914H0.000976562V20.6419H8.85239V22.6089H0.000976562V26.5428H13.7698C13.7698 23.289 16.417 20.6419 19.6708 20.6419H21.6378ZM12.7864 22.6089H10.8194V20.6419H12.7864V22.6089Z" fill="currentColor"/><path d="M27.5394 1.95454C27.4427 -0.652497 23.7013 -0.65053 23.6055 1.95454V5.8885H27.5394V1.95454Z" fill="currentColor"/><path d="M26.5556 15.7234C28.7283 15.7234 30.4896 13.9621 30.4896 11.7894V7.85547H20.6547V11.7894C20.6547 13.9621 18.8934 15.7234 16.7207 15.7234H26.5556Z" fill="currentColor"/></svg>`,
};

const getPurpleBoxIconHtml = (icon?: string | null): string => {
  if (!icon) return '';
  const key = icon.toLowerCase();
  const iconSvg =
    purpleBoxIconSvgs[key] ||
    customToolIconSvgs[key];
  if (!iconSvg) return '';
  const wrapperStyle = `
    width: 36px;
    height: 36px;
    border-radius: 18px;
    background-color: #0F58F9;
    color: #FFFFFF;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  `.trim();
  return `<span style="${wrapperStyle}"><span style="width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;">${iconSvg}</span></span>`;
};

/**
 * Escapes HTML special characters to prevent XSS
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Converts an image URL to a base64 data URI for embedding in PDFs
 */
const imageToDataUri = async (imageUrl: string): Promise<string> => {
  try {
    // If it's already a data URI, return as-is
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // Convert relative URLs to absolute
    let absoluteUrl = imageUrl;
    if (!imageUrl.startsWith('http')) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      absoluteUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`;
    }
    
    // Fetch the image
    const response = await fetch(absoluteUrl);
    const blob = await response.blob();
    
    // Convert to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert image to data URI:', error);
    // Return original URL as fallback
    return imageUrl;
  }
};

/**
 * Parses text with **bold** markers and returns HTML
 * Also handles blue coloring for text before colons when applyBlueColon is true
 */
const parseStyledText = (text: string | undefined | null, applyBlueColon: boolean = false): string => {
  if (!text) return '';
  
  // Check if text contains a colon and apply blue color to text before it
  const colonIndex = text.indexOf(':');
  
  if (colonIndex !== -1 && applyBlueColon) {
    // Split into before and after the first colon
    const beforeColon = text.substring(0, colonIndex);
    const afterColon = text.substring(colonIndex);
    
    // Process both parts for bold markers
    const processSegment = (segment: string): string => {
      const segments = segment.split(/\*\*(.*?)\*\*/g);
      return segments
        .map((seg, index) => {
          if (index % 2 === 1) {
            return `<strong style="font-weight: 600; color: #0F58F9;">${escapeHtml(seg)}</strong>`;
          }
          return escapeHtml(seg);
        })
        .join('');
    };
    
    // Apply blue color to text before colon
    const beforeColonHtml = `<span style="font-weight: 600; color: #0F58F9;">${processSegment(beforeColon)}</span>`;
    const afterColonHtml = processSegment(afterColon);
    
    return beforeColonHtml + afterColonHtml;
  }
  
  // Original behavior if no colon or applyBlueColon is false
  const segments = text.split(/\*\*(.*?)\*\*/g);
  return segments
    .map((segment, index) => {
      if (index % 2 === 1) {
        // Odd indices are bold text
        return `<strong style="font-weight: 600; color: #0F58F9;">${escapeHtml(segment)}</strong>`;
      }
      return escapeHtml(segment);
    })
    .join('');
};

/**
 * Generates HTML for a headline block
 */
const renderHeadline = (block: HeadlineBlock): string => {
  const levelMap: { [key: number]: string } = {
    1: '1.25rem', // text-xl = 20px = 1.25rem
    2: '1.25rem', // text-xl = 20px = 1.25rem
    3: '1.125rem', // text-lg = 18px = 1.125rem
    4: '1rem', // text-base = 16px = 1rem
  };
  
  const fontSize = block.fontSize || levelMap[block.level] || '1.25rem';
  const backgroundColor = block.backgroundColor || 'transparent';
  
  // Match TextPresentationDisplay colors exactly:
  // Level 1 & 2: #171718 (dark gray), font-bold (700) or font-semibold (600)
  // Level 3: #0F58F9 (blue), font-medium (500)
  // Level 4: #0F58F9 (blue), font-bold (700)
  let textColor = block.textColor;
  let fontWeight = 700;
  if (!textColor) {
    if (block.level === 1) {
      textColor = '#171718';
      fontWeight = 700; // font-bold
    } else if (block.level === 2) {
      textColor = '#171718';
      fontWeight = 600; // font-semibold
    } else if (block.level === 3) {
      textColor = '#0F58F9';
      fontWeight = 500; // font-medium
    } else if (block.level === 4) {
      textColor = '#0F58F9';
      fontWeight = 700; // font-bold
    } else {
      textColor = '#171718';
    }
  }
  
  const marginTop = block.level === 1 ? '0' : block.level === 2 ? '1.25rem' : '0.625rem';
  const marginBottom = block.level === 1 ? '0.5rem' : block.level === 2 ? '0.75rem' : '0.375rem';
  
  const style = `
    font-size: ${fontSize};
    font-weight: ${fontWeight};
    color: ${textColor};
    background-color: ${backgroundColor};
    margin-top: ${marginTop};
    margin-bottom: ${marginBottom};
    line-height: 1.3;
    ${backgroundColor !== 'transparent' ? 'padding: 12px 16px; border-radius: 8px;' : ''}
  `.trim();
  
  return `<h${block.level} style="${style}">${parseStyledText(block.text)}</h${block.level}>`;
};

/**
 * Generates HTML for a paragraph block
 */
const renderParagraph = (block: ParagraphBlock): string => {
  const fontSize = block.fontSize || '1rem'; // text-base = 16px = 1rem
  const isRecommendation = block.isRecommendation || false;
  
  let style = `
    font-size: ${fontSize};
    font-weight: 300; /* font-light */
    line-height: 1.5; /* leading-normal */
    color: #4B5563; /* text-gray-600 */
    margin-bottom: 1rem; /* mb-2 = 8px, but frontend uses mb-2 which is 0.5rem, but actual spacing is more */
    text-align: left;
  `.trim();
  
  // Add blue left border for recommendations
  if (isRecommendation) {
    style += `
      padding: 0.75rem 1rem;
      border-left: 4px solid #0F58F9;
      background-color: rgba(15, 88, 249, 0.08);
      border-radius: 8px;
    `.trim();
  }
  
  // Apply blue colon for all paragraphs (especially useful in recommendations)
  return `<p style="${style}">${parseStyledText(block.text, true)}</p>`;
};

/**
 * Generates HTML for an alert block
 */
const renderAlert = (block: AlertBlock): string => {
  const alertStyles: { [key: string]: { bg: string; border: string; } } = {
    info: { bg: '#dbeafe', border: '#3b82f6', },
    warning: { bg: '#fef3c7', border: '#f59e0b', },
    success: { bg: '#d1fae5', border: '#10b981', },
    danger: { bg: '#fee2e2', border: '#ef4444', },
  };
  
  const alertStyle = alertStyles[block.alertType] || alertStyles.info;
  const backgroundColor = block.backgroundColor || alertStyle.bg;
  const borderColor = block.borderColor || alertStyle.border;
  const textColor = block.textColor || '#000000'; // Always black text to match TextPresentationDisplay
  const fontSize = block.fontSize || '16px';
  
  const containerStyle = `
    background-color: ${backgroundColor};
    border-left: 4px solid ${borderColor};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  `.trim();
  
  const titleStyle = `
    font-weight: 600;
    color: ${textColor};
    font-size: ${fontSize};
    margin-bottom: 8px;
  `.trim();
  
  const textStyle = `
    color: ${textColor};
    font-size: ${fontSize};
    line-height: 1.6;
  `.trim();
  
  let html = `<div style="${containerStyle}">`;
  if (block.title) {
    html += `<div style="${titleStyle}">${parseStyledText(block.title)}</div>`;
  }
  html += `<div style="${textStyle}">${parseStyledText(block.text)}</div>`;
  html += `</div>`;
  
  return html;
};

/**
 * Generates HTML for a bullet list block
 */
const renderBulletList = (block: BulletListBlock): string => {
  const fontSize = block.fontSize || '16px';
  
  const listStyle = `
    margin-bottom: 16px;
    padding-left: 0;
    list-style: none;
  `.trim();
  
  const itemStyle = `
    font-size: ${fontSize};
    font-weight: 300; /* font-light to match paragraphs */
    line-height: 1.6;
    color: #4B5563; /* text-gray-600 */
    margin-bottom: 0.5rem;
    display: flex;
    align-items: flex-start;
  `.trim();
  
  const bulletStyle = `
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #0F58F9;
    margin-right: 12px;
    margin-top: 8px;
    flex-shrink: 0;
  `.trim();
  
  const recommendationStyle = `
    border-left: 4px solid #0F58F9;
    padding: 12px 16px;
    background-color: rgba(15, 88, 249, 0.08);
    border-radius: 8px;
  `.trim();
  
  let html = `<ul style="${listStyle}">`;
  block.items.forEach((item) => {
    const itemText = typeof item === 'string' ? item : JSON.stringify(item);
    const isRecommendationItem = typeof item === 'string' && item.toLowerCase().includes('recommendation');
    
    // Apply recommendation style only to recommendation items
    const finalItemStyle = isRecommendationItem ? `${itemStyle}; ${recommendationStyle}` : itemStyle;
    
    html += `<li style="${finalItemStyle}">`;
    // Only show bullet if it's NOT a recommendation item
    if (!isRecommendationItem) {
      html += `<span style="${bulletStyle}"></span>`;
    }
    html += `<span>${parseStyledText(itemText, true)}</span>
    </li>`;
  });
  html += `</ul>`;
  
  return html;
};

/**
 * Generates HTML for a numbered list block
 */
const renderNumberedList = (block: NumberedListBlock): string => {
  const fontSize = block.fontSize || '16px';
  
  const listStyle = `
    margin-bottom: 16px;
    padding-left: 0;
    list-style: none;
    counter-reset: list-counter;
  `.trim();
  
  const itemStyle = `
    font-size: ${fontSize};
    line-height: 1.6;
    color: #4B5563;
    font-weight: 300;
    margin-bottom: 8px;
    display: flex;
    align-items: flex-start;
    counter-increment: list-counter;
  `.trim();
  
  const numberStyle = `
    font-weight: 600;
    color: #0F58F9;
    margin-right: 12px;
    flex-shrink: 0;
    min-width: 24px;
  `.trim();
  
  const recommendationStyle = `
    border-left: 4px solid #0F58F9;
    padding: 12px 16px;
    background-color: rgba(15, 88, 249, 0.08);
    border-radius: 8px;
  `.trim();
  
  let html = `<ol style="${listStyle}">`;
  block.items.forEach((item, index) => {
    const itemText = typeof item === 'string' ? item : JSON.stringify(item);
    const isRecommendationItem = typeof item === 'string' && item.toLowerCase().includes('recommendation');
    
    // Apply recommendation style only to recommendation items
    const finalItemStyle = isRecommendationItem ? `${itemStyle}; ${recommendationStyle}` : itemStyle;
    
    html += `<li style="${finalItemStyle}">`;
    // Only show number if it's NOT a recommendation item
    if (!isRecommendationItem) {
      html += `<span style="${numberStyle}">${index + 1}.</span>`;
    }
    html += `<span>${parseStyledText(itemText, true)}</span>
    </li>`;
  });
  html += `</ol>`;
  
  return html;
};

/**
 * Generates HTML for a section break
 */
const renderSectionBreak = (block: SectionBreakBlock): string => {
  const style = block.style || 'solid';
  const borderStyle = style === 'dashed' ? 'dashed' : 'solid';
  
  const hrStyle = `
    border: none;
    border-top: 2px ${borderStyle} #E4E4E7;
    margin: 32px 0;
  `.trim();
  
  return `<hr style="${hrStyle}" />`;
};

/**
 * Generates HTML for an image block - matches TextPresentationDisplay exactly
 */
const renderImage = async (block: ImageBlock): Promise<string> => {
  const alignment = block.alignment || 'center';
  const layoutMode = block.layoutMode || 'standalone';
  
  // Convert image to data URI for reliable PDF embedding
  const imageSrc = await imageToDataUri(block.src);
  
  const borderRadius = block.borderRadius || '8px';
  const boxShadow = block.boxShadow || '0 2px 4px rgba(0,0,0,0.1)';
  const border = block.border || 'none';
  const opacity = block.opacity || 1;
  const transform = block.transform || 'none';
  
  // Handle different layout modes - match TextPresentationDisplay exactly
  if (layoutMode === 'inline-left' || layoutMode === 'inline-right') {
    // Inline layout - text wraps around image
    const floatDirection = layoutMode === 'inline-left' ? 'left' : 'right';
    const marginDirection = layoutMode === 'inline-left' ? 'right' : 'left';
    const maxWidth = block.maxWidth || '200px';
    const width = block.width || 'auto';
    const height = block.height || 'auto';
    
    const containerStyle = `
      margin: 0;
    `.trim();
    
    const imgStyle = `
      max-width: ${maxWidth};
      width: ${typeof width === 'number' ? `${width}px` : width};
      height: ${typeof height === 'number' ? `${height}px` : height};
      border-radius: ${borderRadius};
      display: block;
      box-shadow: ${boxShadow};
      border: ${border};
      opacity: ${opacity};
      transform: ${transform};
      float: ${floatDirection};
      margin: 0 ${marginDirection === 'right' ? '16px' : '0'} 16px ${marginDirection === 'left' ? '16px' : '0'};
    `.trim();
    
    let html = `<div style="${containerStyle}">`;
    html += `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(block.alt || 'Image')}" style="${imgStyle}" />`;
    if (block.caption) {
      const captionStyle = `
        font-size: 10px;
        color: #666;
        text-align: center;
        margin: 8px 0 0 0;
        font-style: italic;
        clear: both;
      `.trim();
      html += `<p style="${captionStyle}">${parseStyledText(block.caption)}</p>`;
    }
    html += `</div>`;
    
    return html;
  }
  
  // Standalone layout - match TextPresentationDisplay exactly
  const currentWidth = block.width ? (typeof block.width === 'number' ? block.width : parseInt(block.width as string)) : 300;
  const imageWidth = Math.max(50, Math.min(currentWidth, 800)); // Constrain between 50px and 800px
  
  const height = block.height ? (typeof block.height === 'number' ? `${block.height}px` : block.height) : 'auto';
  const maxWidth = block.maxWidth || '100%';
  
  const alignmentClass = alignment === 'left' ? 'text-align: left;' : alignment === 'right' ? 'text-align: right;' : 'text-align: center;';
  
  const containerStyle = `
    margin: 16px 0;
    ${alignmentClass}
  `.trim();
  
  const imgStyle = `
    width: ${imageWidth}px;
    height: ${height};
    border-radius: ${borderRadius};
    max-width: ${maxWidth};
    box-shadow: ${boxShadow};
    border: ${border};
    opacity: ${opacity};
    transform: ${transform};
    display: inline-block;
  `.trim();
  
  let html = `<div style="${containerStyle}">`;
  html += `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(block.alt || 'Uploaded image')}" style="${imgStyle}" />`;
  if (block.caption) {
    const captionStyle = `
      font-size: 12px;
      color: #4B5563;
      margin-top: 8px;
      font-style: italic;
    `.trim();
    html += `<p style="${captionStyle}">${parseStyledText(block.caption)}</p>`;
  }
  html += `</div>`;
  
  return html;
};

/**
 * Generates HTML for a table block
 */
const renderTable = (block: TableBlock): string => {
  const tableStyle = `
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
  `.trim();
  
  const thStyle = `
    background-color: #F4F4F5;
    color: #171718;
    font-weight: 600;
    padding: 12px;
    text-align: left;
    border-bottom: 2px solid #E4E4E7;
  `.trim();
  
  const tdStyle = `
    padding: 12px;
    border-bottom: 1px solid #E4E4E7;
    color: #171718;
  `.trim();
  
  let html = `<table style="${tableStyle}">`;
  
  // Headers
  html += `<thead><tr>`;
  block.headers.forEach((header) => {
    html += `<th style="${thStyle}">${escapeHtml(header)}</th>`;
  });
  html += `</tr></thead>`;
  
  // Rows
  html += `<tbody>`;
  block.rows.forEach((row) => {
    html += `<tr>`;
    row.forEach((cell) => {
      html += `<td style="${tdStyle}">${parseStyledText(cell)}</td>`;
    });
    html += `</tr>`;
  });
  html += `</tbody>`;
  
  html += `</table>`;
  
  if (block.caption) {
    const captionStyle = `
      font-size: 14px;
      color: #71717A;
      text-align: center;
      margin-top: 8px;
      font-style: italic;
    `.trim();
    html += `<div style="${captionStyle}">${parseStyledText(block.caption)}</div>`;
  }
  
  return html;
};

/**
 * Generates HTML for purple boxes section from data
 */
const renderPurpleBoxes = (
  purpleBoxContent:
    | PurpleBoxBlock
    | {
        title?: string;
        description?: string;
        cards: Array<{ title: string; description: string; icon?: string | null }>;
      }
    | null
    | undefined,
): string => {
  if (!purpleBoxContent || !purpleBoxContent.cards || purpleBoxContent.cards.length === 0) {
    return '';
  }
  
  const cards = purpleBoxContent.cards;
  const gridCols = cards.length === 1 ? '1' : cards.length === 2 ? '2' : cards.length === 3 ? '3' : '4';
  
  const containerStyle = `
    display: grid;
    grid-template-columns: repeat(${gridCols}, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  `.trim();
  
  const cardStyle = `
    background-color: #CCDBFCCC;
    border: 1px solid #CCCCCC;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `.trim();

  const iconRowStyle = `
    display: flex;
    align-items: center;
    gap: 12px;
  `.trim();

  let html = `<div style="margin: 16px 0;">`;
  html += `<div style="${containerStyle}">`;
  cards.forEach((card) => {
    const titleStyle = `
      font-weight: 600;
      color: #171718;
      font-size: 16px;
      margin: 0;
    `.trim();
    
    const descriptionStyle = `
      font-size: 14px;
      color: #4B5563;
      line-height: 1.5;
      margin: 0;
    `.trim();

    html += `<div style="${cardStyle}">`;
    const iconHtml = getPurpleBoxIconHtml(card.icon);
    if (iconHtml) {
      html += `<div style="${iconRowStyle}">${iconHtml}<h3 style="${titleStyle}">${escapeHtml(card.title)}</h3></div>`;
    } else {
      html += `<h3 style="${titleStyle}">${escapeHtml(card.title)}</h3>`;
    }
    html += `<p style="${descriptionStyle}">${escapeHtml(card.description)}</p>`;
    html += `</div>`;
  });
  html += `</div></div>`;
  
  return html;
};

/**
 * Renders a content block based on its type
 */
const renderContentBlock = async (block: AnyContentBlock): Promise<string> => {
  switch (block.type) {
    case 'headline':
      return renderHeadline(block as HeadlineBlock);
    case 'paragraph':
      return renderParagraph(block as ParagraphBlock);
    case 'alert':
      return renderAlert(block as AlertBlock);
    case 'bullet_list':
      return renderBulletList(block as BulletListBlock);
    case 'numbered_list':
      return renderNumberedList(block as NumberedListBlock);
    case 'section_break':
      return renderSectionBreak(block as SectionBreakBlock);
    case 'image':
      return await renderImage(block as ImageBlock);
    case 'table':
      return renderTable(block as TableBlock);
    case 'column_container':
      return await renderColumnContainer(block as ColumnContainerBlock);
    case 'purple_box':
      return renderPurpleBoxes(block as PurpleBoxBlock);
    default:
      return '';
  }
};

/**
 * Renders a column container block
 */
const renderColumnContainer = async (block: ColumnContainerBlock): Promise<string> => {
  const columnCount = block.columnCount || 2;
  const columns = block.columns || [];
  
  const containerStyle = `
    display: grid;
    grid-template-columns: repeat(${columnCount}, 1fr);
    gap: 24px;
    margin: 16px 0;
  `.trim();
  
  const columnStyle = `
    display: flex;
    flex-direction: column;
    gap: 8px;
  `.trim();
  
  let html = `<div style="${containerStyle}">`;
  
  for (const column of columns) {
    html += `<div style="${columnStyle}">`;
    const columnBlocks = await Promise.all(
      column.map((colBlock) => renderContentBlock(colBlock))
    );
    html += columnBlocks.join('\n');
    html += `</div>`;
  }
  
  html += `</div>`;
  
  return html;
};

/**
 * Generates a complete HTML document from TextPresentationData
 */
export const generateTextPresentationHtml = async (
  data: TextPresentationData,
  title?: string
): Promise<string> => {
  const documentTitle = title || data.textTitle || 'Text Presentation';
  
  // Check if purple box section should be included and get purpleBoxContent from data
  const purpleBoxSection = (data as any)?.purpleBoxSection !== undefined 
    ? (data as any)?.purpleBoxSection 
    : true;
  const purpleBoxContent = (data as any)?.purpleBoxContent || null;
  
  // Generate HTML for all content blocks (with image conversion)
  const contentBlocks = await Promise.all(
    data.contentBlocks.map((block) => renderContentBlock(block))
  );
  const contentHtml = contentBlocks.join('\n');
  
  // Generate purple boxes HTML if enabled and data exists
  const purpleBoxesHtml = (purpleBoxSection && purpleBoxContent) ? renderPurpleBoxes(purpleBoxContent) : '';
  
  // Complete HTML document with styles
  const html = `<!DOCTYPE html>
<html lang="${data.detectedLanguage || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(documentTitle)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #171718;
      background-color: #F2F2F4;
      padding: 24px;
      margin: 0 auto;
    }
    
    .main-container {
      max-width: 80rem; /* max-w-5xl equivalent */
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 2px solid #CCCCCC;
      border-radius: 10px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    
    .header-section {
      background-color: #FFFFFF;
      border-bottom: 1px solid #CCCCCC;
      padding: 16px 40px;
    }
    
    .content-section {
      background-color: #FFFFFF;
      padding: 16px 32px;
    }
    
    h1 {
      font-size: 1.5rem; /* text-2xl */
      font-weight: 700;
      color: #0F58F9;
      padding: 16px 0;
      margin: 0;
      text-align: left;
    }
    
    @media (min-width: 1024px) {
      h1 {
        font-size: 1.875rem; /* lg:text-3xl */
      }
    }
    
    @media print {
      body {
        padding: 0;
        background-color: white;
      }
      
      .main-container {
        box-shadow: none;
        border: none;
        border-radius: 0;
      }
      
      @page {
        size: A4;
        margin: 8mm;
      }
    }
    
    h2, h3, h4, h5, h6 {
      font-family: inherit;
    }
  </style>
</head>
<body>
  <div class="main-container">
    ${data.textTitle ? `<div class="header-section"><h1>${escapeHtml(data.textTitle)}</h1></div>` : ''}
    <div class="content-section">
      ${purpleBoxesHtml}
      ${contentHtml}
    </div>
  </div>
</body>
</html>`;
  
  return html;
};

/**
 * Downloads the HTML content as a file
 */
export const downloadHtmlFile = (html: string, filename: string): void => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

