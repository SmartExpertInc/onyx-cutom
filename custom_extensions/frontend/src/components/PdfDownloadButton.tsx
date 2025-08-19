"use client";

import React, { useCallback } from 'react';
import { Download } from 'lucide-react';
import { PdfLessonData, HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock } from '@/types/pdfLesson';
import { useLanguage } from '../contexts/LanguageContext';

interface PdfDownloadButtonProps {
  dataToDisplay: PdfLessonData | null;
  parentProjectName?: string;
  lessonNumber?: number;
}

const PdfDownloadButton = ({ dataToDisplay, parentProjectName, lessonNumber }: PdfDownloadButtonProps) => {
  const { t } = useLanguage();

  const downloadAndPreviewPDF = useCallback(() => {
    if (!dataToDisplay) return;

    // Открываем превью в новом окне
    const previewWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    if (!previewWindow) {
      alert('Пожалуйста, разрешите всплывающие окна для этого сайта.');
      return;
    }

    // Создаем HTML для превью
    const previewHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Preview - ${dataToDisplay.lessonTitle || 'Lesson'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: white;
            color: black;
            line-height: 1.6;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 1px solid #ddd;
        }

        .header {
            background: #FF1414;
            color: white;
            padding: 30px;
            text-align: center;
        }

        .title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 15px;
            text-transform: uppercase;
        }

        .course-info {
            font-size: 1rem;
            opacity: 0.9;
        }

        .content {
            padding: 30px;
        }

        .block {
            margin-bottom: 30px;
        }

        .block-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #000;
            margin-bottom: 15px;
            border-bottom: 2px solid #FF1414;
            padding-bottom: 5px;
        }

        .alert {
            padding: 15px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 4px solid;
        }

        .alert-info {
            background: #dbeafe;
            border-color: #3b82f6;
        }

        .alert-success {
            background: #dcfce7;
            border-color: #22c55e;
        }

        .alert-warning {
            background: #fef3c7;
            border-color: #f59e0b;
        }

        .alert-danger {
            background: #fee2e2;
            border-color: #ef4444;
        }

        .bullet-list, .numbered-list {
            margin: 15px 0;
            padding-left: 20px;
        }

        .bullet-list li, .numbered-list li {
            margin: 8px 0;
        }

        .paragraph {
            margin: 15px 0;
            line-height: 1.6;
        }

        .section-break {
            margin: 20px 0;
            border-top: 1px solid #ddd;
        }

        @media print {
            body {
                padding: 0;
            }
            
            .container {
                border: none;
            }
            
            .header {
                background: #FF1414 !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">${dataToDisplay.lessonTitle || 'Lesson'}</h1>
            <div class="course-info">
                ${parentProjectName ? `<div><strong>Course:</strong> ${parentProjectName}</div>` : ''}
                ${lessonNumber ? `<div><strong>Lesson:</strong> №${lessonNumber}</div>` : ''}
            </div>
        </div>

        <div class="content">
            ${(dataToDisplay.contentBlocks || []).map(block => {
                switch (block.type) {
                    case 'headline':
                        return `<h${(block as HeadlineBlock).level} class="block-title">${(block as HeadlineBlock).text}</h${(block as HeadlineBlock).level}>`;
                    case 'paragraph':
                        return `<div class="paragraph">${(block as ParagraphBlock).text}</div>`;
                    case 'bullet_list':
                        return `<ul class="bullet-list">${(block as BulletListBlock).items.map(item => `<li>${item}</li>`).join('')}</ul>`;
                    case 'numbered_list':
                        return `<ol class="numbered-list">${(block as NumberedListBlock).items.map(item => `<li>${item}</li>`).join('')}</ol>`;
                    case 'alert':
                        const alertBlock = block as AlertBlock;
                        return `<div class="alert alert-${alertBlock.style || 'info'}">${alertBlock.text}</div>`;
                    case 'section_break':
                        return `<div class="section-break"></div>`;
                    default:
                        return `<div>${JSON.stringify(block)}</div>`;
                }
            }).join('')}
        </div>
    </div>
</body>
</html>`;
    
    // Записываем HTML в новое окно
    previewWindow.document.write(previewHTML);
    previewWindow.document.close();
    
    // Фокусируемся на новом окне
    previewWindow.focus();
    
    // Запускаем скачивание PDF
    downloadPDF();
  }, [dataToDisplay, parentProjectName, lessonNumber]);

  const downloadPDF = useCallback(() => {
    // Создаем временную ссылку для скачивания
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...'; // Здесь будет base64 PDF
    link.download = `${dataToDisplay?.lessonTitle || 'lesson'}_${parentProjectName || 'course'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('PDF download started!');
  }, [dataToDisplay, parentProjectName]);

  return (
    <button 
      onClick={downloadAndPreviewPDF}
      className="bg-[#FF1414] hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md"
    >
      <Download size={16} />
      {t('common.downloadPdf', 'Download PDF')}
    </button>
  );
};

export default PdfDownloadButton; 