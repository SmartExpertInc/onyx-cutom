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
  ListItem,
} from '@/types/textPresentation';

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
 */
const parseStyledText = (text: string | undefined | null): string => {
  if (!text) return '';
  
  // Split by bold markers (**text**)
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
    1: '20px',
    2: '20px',
    3: '18px',
    4: '16px',
  };
  
  const fontSize = block.fontSize || levelMap[block.level] || '20px';
  const backgroundColor = block.backgroundColor || 'transparent';
  
  // Match TextPresentationDisplay colors exactly:
  // Level 1 & 2: #171718 (dark gray)
  // Level 3 & 4: #0F58F9 (blue)
  let textColor = block.textColor;
  if (!textColor) {
    if (block.level === 1 || block.level === 2) {
      textColor = '#171718';
    } else if (block.level === 3 || block.level === 4) {
      textColor = '#0F58F9';
    } else {
      textColor = '#171718';
    }
  }
  
  const fontWeight = (block.level === 1 || block.level === 3 || block.level === 4) ? 700 : 600;
  const marginTop = block.level === 1 ? '16px' : block.level === 2 ? '20px' : '10px';
  const marginBottom = block.level === 1 ? '8px' : block.level === 2 ? '12px' : '6px';
  
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
  const fontSize = block.fontSize || '16px';
  const style = `
    font-size: ${fontSize};
    line-height: 1.6;
    color: #171718;
    margin-bottom: 16px;
  `.trim();
  
  return `<p style="${style}">${parseStyledText(block.text)}</p>`;
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
    line-height: 1.6;
    color: #171718;
    margin-bottom: 8px;
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
  
  let html = `<ul style="${listStyle}">`;
  block.items.forEach((item) => {
    const itemText = typeof item === 'string' ? item : JSON.stringify(item);
    html += `<li style="${itemStyle}">
      <span style="${bulletStyle}"></span>
      <span>${parseStyledText(itemText)}</span>
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
    color: #171718;
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
  
  let html = `<ol style="${listStyle}">`;
  block.items.forEach((item, index) => {
    const itemText = typeof item === 'string' ? item : JSON.stringify(item);
    html += `<li style="${itemStyle}">
      <span style="${numberStyle}">${index + 1}.</span>
      <span>${parseStyledText(itemText)}</span>
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
 * Generates HTML for an image block
 */
const renderImage = async (block: ImageBlock): Promise<string> => {
  const alignment = block.alignment || 'center';
  const maxWidth = block.maxWidth || '100%';
  const borderRadius = block.borderRadius || '8px';
  const boxShadow = block.boxShadow || 'none';
  const border = block.border || 'none';
  const opacity = block.opacity || 1;
  const transform = block.transform || 'none';
  
  const containerStyle = `
    margin: 24px 0;
    text-align: ${alignment};
  `.trim();
  
  const imgStyle = `
    max-width: ${maxWidth};
    height: auto;
    border-radius: ${borderRadius};
    box-shadow: ${boxShadow};
    border: ${border};
    opacity: ${opacity};
    transform: ${transform};
    display: inline-block;
  `.trim();
  
  // Convert image to data URI for reliable PDF embedding
  const imageSrc = await imageToDataUri(block.src);
  
  let html = `<div style="${containerStyle}">`;
  html += `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(block.alt || '')}" style="${imgStyle}" />`;
  if (block.caption) {
    const captionStyle = `
      font-size: 14px;
      color: #71717A;
      margin-top: 8px;
      font-style: italic;
    `.trim();
    html += `<div style="${captionStyle}">${parseStyledText(block.caption)}</div>`;
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
    default:
      return '';
  }
};

/**
 * Generates a complete HTML document from TextPresentationData
 */
export const generateTextPresentationHtml = async (
  data: TextPresentationData,
  title?: string
): Promise<string> => {
  const documentTitle = title || data.textTitle || 'Text Presentation';
  
  // Generate HTML for all content blocks (with image conversion)
  const contentBlocks = await Promise.all(
    data.contentBlocks.map((block) => renderContentBlock(block))
  );
  const contentHtml = contentBlocks.join('\n');
  
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
      background-color: #FFFFFF;
      padding: 40px 20px;
      max-width: 210mm; /* A4 width */
      margin: 0 auto;
    }
    
    @media print {
      body {
        padding: 0;
        background-color: white;
      }
      
      @page {
        size: A4;
        margin: 20mm;
      }
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: inherit;
    }
  </style>
</head>
<body>
  <div style="max-width: 100%; margin: 0 auto;">
    <h1 style="font-size: 24px; font-weight: 700; color: #0F58F9; margin-bottom: 16px; padding: 16px 0; border-bottom: 1px solid #CCCCCC;">
      ${escapeHtml(data.textTitle)}
    </h1>
    ${contentHtml}
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

