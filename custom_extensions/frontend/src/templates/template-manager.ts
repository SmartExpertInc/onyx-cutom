// custom_extensions/frontend/src/templates/template-manager.ts

import { SlideTemplate, basicTemplates } from './slides/basic/index';
import { deckgoAdvancedTemplates } from './deckgo/advanced-templates';
import { ContentAnalyzer, ContentAnalysis } from './ai-selectors/content-analyzer';
import { AnyContentBlock, DeckSlide } from '@/types/pdfLesson';

export class TemplateManager {
  private analyzer: ContentAnalyzer;
  private allTemplates: Map<string, SlideTemplate> = new Map();

  constructor() {
    this.analyzer = new ContentAnalyzer();
    this.loadAllTemplates();
  }

  /**
   * Завантажує всі доступні шаблони з різних категорій
   */
  private loadAllTemplates(): void {
    // Завантажуємо базові шаблони
    basicTemplates.forEach(template => {
      this.allTemplates.set(template.id, template);
    });

    // Завантажуємо розширені DeckDeckGo шаблони
    deckgoAdvancedTemplates.forEach(template => {
      this.allTemplates.set(template.id, template);
    });

    console.log(`Завантажено ${this.allTemplates.size} шаблонів`);
  }

  /**
   * Отримує всі шаблони згруповані по категоріях
   */
  getTemplatesByCategory(): Record<string, SlideTemplate[]> {
    const categories: Record<string, SlideTemplate[]> = {
      basic: [],
      business: [],
      educational: [],
      creative: [],
      technical: []
    };

    Array.from(this.allTemplates.values()).forEach(template => {
      categories[template.category].push(template);
    });

    return categories;
  }

  /**
   * AI-базований аналіз та рекомендація шаблонів для слайду
   */
  analyzeAndRecommend(slide: DeckSlide): {
    analysis: ContentAnalysis;
    recommendedTemplates: SlideTemplate[];
    explanations: string[];
  } {
    const analysis = this.analyzer.analyzeSlideContent(slide.contentBlocks, slide.slideTitle);
    
    const recommendedTemplates = analysis.suggestedTemplates
      .map(templateId => this.allTemplates.get(templateId))
      .filter((template): template is SlideTemplate => template !== undefined)
      .slice(0, 3); // Топ 3 рекомендації

    const explanations = this.generateExplanations(analysis, recommendedTemplates);

    return {
      analysis,
      recommendedTemplates,
      explanations
    };
  }

  /**
   * Автоматичний вибір найкращого шаблону для слайду
   */
  autoSelectTemplate(slide: DeckSlide): SlideTemplate | null {
    const { recommendedTemplates } = this.analyzeAndRecommend(slide);
    return recommendedTemplates[0] || null;
  }

  /**
   * Пошук шаблонів за ключовими словами
   */
  searchTemplates(query: string): SlideTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    
    return Array.from(this.allTemplates.values()).filter(template => {
      return (
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.aiKeywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery)) ||
        template.contextTags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    });
  }

  /**
   * Отримує шаблон за ID
   */
  getTemplate(templateId: string): SlideTemplate | undefined {
    return this.allTemplates.get(templateId);
  }

  /**
   * Фільтрує шаблони за рівнем інтерактивності
   */
  getTemplatesByInteractivity(level: 'low' | 'medium' | 'high'): SlideTemplate[] {
    return Array.from(this.allTemplates.values()).filter(
      template => template.interactivity === level
    );
  }

  /**
   * Отримує сумісні DeckDeckGo шаблони
   */
  getDeckGoCompatibleTemplates(): SlideTemplate[] {
    return Array.from(this.allTemplates.values()).filter(
      template => template.deckgoTemplate !== undefined
    );
  }

  /**
   * Аналізує всю презентацію та пропонує покращення
   */
  analyzePresentationFlow(slides: DeckSlide[]): {
    overallAnalysis: {
      diversity: number; // Різноманітність шаблонів 0-1
      interactivityBalance: number; // Баланс інтерактивності 0-1
      flowScore: number; // Оцінка логічного потоку 0-1
    };
    suggestions: string[];
  } {
    const templateTypes = new Set<string>();
    let totalInteractivity = 0;
    const contentTypes: string[] = [];

    slides.forEach(slide => {
      const analysis = this.analyzer.analyzeSlideContent(slide.contentBlocks, slide.slideTitle);
      contentTypes.push(analysis.contentType);
      
      const interactivityScores = { low: 1, medium: 2, high: 3 };
      totalInteractivity += interactivityScores[analysis.interactivityNeeded];
      
      const autoTemplate = this.autoSelectTemplate(slide);
      if (autoTemplate) {
        templateTypes.add(autoTemplate.category);
      }
    });

    const diversity = templateTypes.size / 5; // 5 категорій максимум
    const avgInteractivity = totalInteractivity / (slides.length * 3);
    const flowScore = this.calculateFlowScore(contentTypes);

    const suggestions = this.generatePresentationSuggestions(
      diversity, 
      avgInteractivity, 
      flowScore,
      contentTypes
    );

    return {
      overallAnalysis: {
        diversity: Math.min(diversity, 1),
        interactivityBalance: avgInteractivity,
        flowScore
      },
      suggestions
    };
  }

  /**
   * Генерує пояснення для рекомендованих шаблонів
   */
  private generateExplanations(
    analysis: ContentAnalysis,
    templates: SlideTemplate[]
  ): string[] {
    const explanations: string[] = [];

    templates.forEach((template, index) => {
      let explanation = '';
      
      switch (index) {
        case 0:
          explanation = `🎯 Найкращий вибір: "${template.name}" підходить для ${analysis.contentType} контенту`;
          break;
        case 1:
          explanation = `🔄 Альтернатива: "${template.name}" добре працює з ${analysis.interactivityNeeded} рівнем інтерактивності`;
          break;
        case 2:
          explanation = `💡 Варіант: "${template.name}" може покращити складність ${analysis.complexity}`;
          break;
      }

      // Додаємо деталі про DeckDeckGo сумісність
      if (template.deckgoTemplate) {
        explanation += ` (DeckDeckGo: ${template.deckgoTemplate})`;
      }

      explanations.push(explanation);
    });

    return explanations;
  }

  /**
   * Розраховує оцінку логічного потоку презентації
   */
  private calculateFlowScore(contentTypes: string[]): number {
    const idealFlow = ['introduction', 'data', 'process', 'comparison', 'summary'];
    let score = 0;
    
    // Перевіряємо наявність вступу та підсумку
    if (contentTypes[0] === 'introduction') score += 0.3;
    if (contentTypes[contentTypes.length - 1] === 'summary') score += 0.3;
    
    // Перевіряємо різноманітність у середній частині
    const middleTypes = new Set(contentTypes.slice(1, -1));
    score += (middleTypes.size / 4) * 0.4; // 4 можливі типи в середині
    
    return Math.min(score, 1);
  }

  /**
   * Генерує поради для покращення презентації
   */
  private generatePresentationSuggestions(
    diversity: number,
    interactivity: number,
    flowScore: number,
    contentTypes: string[]
  ): string[] {
    const suggestions: string[] = [];

    if (diversity < 0.4) {
      suggestions.push('🎨 Додайте більше різноманітних шаблонів для кращої візуальної привабливості');
    }

    if (interactivity < 0.3) {
      suggestions.push('⚡ Розгляньте додавання більш інтерактивних елементів для залучення аудиторії');
    }

    if (interactivity > 0.8) {
      suggestions.push('🎯 Надто багато інтерактивних елементів може відвернути від основного повідомлення');
    }

    if (flowScore < 0.5) {
      suggestions.push('📝 Покращіть логічний потік: почніть зі вступу, закінчіть підсумком');
    }

    if (!contentTypes.includes('introduction')) {
      suggestions.push('🚀 Додайте вступний слайд для кращого початку презентації');
    }

    if (!contentTypes.includes('summary')) {
      suggestions.push('🏁 Додайте підсумковий слайд для ефектного завершення');
    }

    return suggestions;
  }

  /**
   * Експортує конфігурацію шаблону для бекенду
   */
  exportTemplateConfig(templateId: string): object | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    return {
      id: template.id,
      name: template.name,
      category: template.category,
      layout: template.layout,
      deckgoTemplate: template.deckgoTemplate,
      aiKeywords: template.aiKeywords,
      contextTags: template.contextTags,
      interactivity: template.interactivity,
      blocks: template.blocks
    };
  }
}

// Синглтон інстанс для використання в додатку
export const templateManager = new TemplateManager(); 