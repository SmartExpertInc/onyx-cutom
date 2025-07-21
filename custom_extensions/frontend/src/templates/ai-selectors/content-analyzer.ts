// custom_extensions/frontend/src/templates/ai-selectors/content-analyzer.ts

import { SlideTemplate } from '../slides/basic/index';
import { AnyContentBlock, HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock } from '@/types/pdfLesson';

export interface ContentAnalysis {
  contentType: 'introduction' | 'data' | 'process' | 'comparison' | 'summary' | 'technical' | 'creative';
  complexity: 'simple' | 'medium' | 'complex';
  interactivityNeeded: 'low' | 'medium' | 'high';
  keywords: string[];
  suggestedTemplates: string[];
  confidence: number; // 0-1
}

export class ContentAnalyzer {
  private dataKeywords = [
    'статистика', 'графік', 'дані', 'числа', 'відсоток', 'аналіз', 'показники',
    'statistics', 'chart', 'data', 'numbers', 'percent', 'analysis', 'metrics'
  ];

  private processKeywords = [
    'крок', 'процес', 'етап', 'послідовність', 'алгоритм', 'інструкція',
    'step', 'process', 'stage', 'sequence', 'algorithm', 'instruction'
  ];

  private comparisonKeywords = [
    'порівняння', 'до', 'після', 'проти', 'різниця', 'протиставлення',
    'comparison', 'before', 'after', 'versus', 'difference', 'contrast'
  ];

  private technicalKeywords = [
    'код', 'програмування', 'функція', 'алгоритм', 'API', 'система',
    'code', 'programming', 'function', 'algorithm', 'api', 'system'
  ];

  private introductionKeywords = [
    'вступ', 'початок', 'презентація', 'знайомство', 'огляд',
    'introduction', 'beginning', 'presentation', 'overview', 'welcome'
  ];

  private summaryKeywords = [
    'підсумок', 'висновок', 'результат', 'фінал', 'завершення',
    'summary', 'conclusion', 'result', 'final', 'ending'
  ];

  analyzeSlideContent(blocks: AnyContentBlock[], slideTitle?: string): ContentAnalysis {
    const allText = this.extractAllText(blocks, slideTitle);
    const keywords = this.extractKeywords(allText);
    
    const contentType = this.determineContentType(allText, blocks);
    const complexity = this.assessComplexity(blocks, allText);
    const interactivityNeeded = this.assessInteractivityNeed(contentType, blocks);
    
    const suggestedTemplates = this.suggestTemplates(contentType, blocks, keywords);
    const confidence = this.calculateConfidence(keywords, contentType, blocks);

    return {
      contentType,
      complexity,
      interactivityNeeded,
      keywords,
      suggestedTemplates,
      confidence
    };
  }

  private extractAllText(blocks: AnyContentBlock[], slideTitle?: string): string {
    let text = slideTitle || '';
    
    blocks.forEach(block => {
      switch (block.type) {
        case 'headline':
          text += ' ' + (block as HeadlineBlock).text;
          break;
        case 'paragraph':
          text += ' ' + (block as ParagraphBlock).text;
          break;
        case 'bullet_list':
          text += ' ' + (block as BulletListBlock).items.join(' ');
          break;
        case 'numbered_list':
          text += ' ' + (block as NumberedListBlock).items.join(' ');
          break;
      }
    });

    return text.toLowerCase();
  }

  private extractKeywords(text: string): string[] {
    const words = text.match(/\b\w+\b/g) || [];
    const uniqueWords = [...new Set(words)];
    
    // Фільтруємо стоп-слова та залишаємо тільки значущі
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'will', 'be'];
    return uniqueWords.filter(word => 
      word.length > 2 && !stopWords.includes(word)
    ).slice(0, 20); // Топ 20 ключових слів
  }

  private determineContentType(text: string, blocks: AnyContentBlock[]): ContentAnalysis['contentType'] {
    const scores = {
      introduction: this.calculateKeywordScore(text, this.introductionKeywords),
      data: this.calculateKeywordScore(text, this.dataKeywords),
      process: this.calculateKeywordScore(text, this.processKeywords),
      comparison: this.calculateKeywordScore(text, this.comparisonKeywords),
      summary: this.calculateKeywordScore(text, this.summaryKeywords),
      technical: this.calculateKeywordScore(text, this.technicalKeywords),
      creative: 0
    };

    // Додаткова логіка на основі структури блоків
    if (blocks.length === 1 && blocks[0].type === 'headline') {
      scores.introduction += 0.5;
    }

    if (blocks.some(block => block.type === 'numbered_list')) {
      scores.process += 0.3;
    }

    if (blocks.filter(block => block.type === 'headline').length >= 3) {
      scores.comparison += 0.2;
    }

    const maxScore = Math.max(...Object.values(scores));
    const contentType = Object.keys(scores).find(
      key => scores[key as keyof typeof scores] === maxScore
    ) as ContentAnalysis['contentType'];

    return contentType || 'introduction';
  }

  private calculateKeywordScore(text: string, keywords: string[]): number {
    let score = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 1;
      }
    });
    return score / keywords.length;
  }

  private assessComplexity(blocks: AnyContentBlock[], text: string): ContentAnalysis['complexity'] {
    let complexityScore = 0;

    // Кількість блоків
    complexityScore += blocks.length * 0.1;

    // Довжина тексту
    complexityScore += text.length / 1000;

    // Різноманітність типів блоків
    const blockTypes = new Set(blocks.map(block => block.type));
    complexityScore += blockTypes.size * 0.2;

    if (complexityScore < 0.5) return 'simple';
    if (complexityScore < 1.5) return 'medium';
    return 'complex';
  }

  private assessInteractivityNeed(
    contentType: ContentAnalysis['contentType'], 
    blocks: AnyContentBlock[]
  ): ContentAnalysis['interactivityNeeded'] {
    let interactivityScore = 0;

    // Базова оцінка по типу контенту
    const contentTypeScores = {
      introduction: 0.2,
      data: 0.8,
      process: 0.6,
      comparison: 0.7,
      summary: 0.3,
      technical: 0.9,
      creative: 0.8
    };

    interactivityScore += contentTypeScores[contentType];

    // Додаткова оцінка по структурі
    if (blocks.some(block => block.type === 'bullet_list')) {
      interactivityScore += 0.2;
    }

    if (blocks.length > 5) {
      interactivityScore += 0.3;
    }

    if (interactivityScore < 0.4) return 'low';
    if (interactivityScore < 0.7) return 'medium';
    return 'high';
  }

  private suggestTemplates(
    contentType: ContentAnalysis['contentType'],
    blocks: AnyContentBlock[],
    keywords: string[]
  ): string[] {
    const suggestions: string[] = [];

    // Базові пропозиції по типу контенту
    switch (contentType) {
      case 'introduction':
        suggestions.push('title-basic', 'content-simple');
        break;
      case 'data':
        suggestions.push('chart-data', 'split-comparison');
        break;
      case 'process':
        suggestions.push('bullets-four', 'gif-demo', 'countdown-timer');
        break;
      case 'comparison':
        suggestions.push('split-comparison', 'split-advanced');
        break;
      case 'technical':
        suggestions.push('code-presentation', 'split-advanced');
        break;
      case 'creative':
        suggestions.push('gif-demo', 'qr-interactive');
        break;
      case 'summary':
        suggestions.push('bullets-four', 'content-simple');
        break;
    }

    // Додаткові пропозиції на основі структури блоків
    const listBlocks = blocks.filter(block => 
      block.type === 'bullet_list' || block.type === 'numbered_list'
    );

    if (listBlocks.length > 0) {
      const listBlock = listBlocks[0] as BulletListBlock | NumberedListBlock;
      if (listBlock.items.length === 4) {
        suggestions.unshift('bullets-four');
      } else if (listBlock.items.length === 6) {
        suggestions.unshift('bullets-six');
      }
    }

    return [...new Set(suggestions)]; // Видаляємо дублікати
  }

  private calculateConfidence(
    keywords: string[],
    contentType: ContentAnalysis['contentType'],
    blocks: AnyContentBlock[]
  ): number {
    let confidence = 0.5; // Базова впевненість

    // Збільшуємо впевненість, якщо є релевантні ключові слова
    const relevantKeywords = this.getRelevantKeywordsForType(contentType);
    const matchingKeywords = keywords.filter(k => 
      relevantKeywords.some(rk => k.includes(rk) || rk.includes(k))
    );
    confidence += (matchingKeywords.length / keywords.length) * 0.3;

    // Збільшуємо впевненість для чіткої структури
    if (blocks.length > 0) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  private getRelevantKeywordsForType(contentType: ContentAnalysis['contentType']): string[] {
    switch (contentType) {
      case 'introduction': return this.introductionKeywords;
      case 'data': return this.dataKeywords;
      case 'process': return this.processKeywords;
      case 'comparison': return this.comparisonKeywords;
      case 'technical': return this.technicalKeywords;
      case 'summary': return this.summaryKeywords;
      default: return [];
    }
  }
} 