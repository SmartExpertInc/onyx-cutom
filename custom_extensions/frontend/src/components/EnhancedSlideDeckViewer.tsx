// custom_extensions/frontend/src/components/EnhancedSlideDeckViewer.tsx

import React, { useState, useEffect, useRef } from 'react';
import { SlideDeckData, DeckSlide, AnyContentBlock } from '@/types/pdfLesson';
import { templateManager } from '../templates/template-manager';
import { SlideTemplate } from '../templates/slides/basic/index';
import { ContentAnalysis } from '../templates/ai-selectors/content-analyzer';

interface EnhancedSlideDeckViewerProps {
  deck: SlideDeckData;
  isEditable?: boolean;
  onSave?: (updatedDeck: SlideDeckData) => void;
}

export default function EnhancedSlideDeckViewer({ deck, isEditable = false, onSave }: EnhancedSlideDeckViewerProps) {
  const [localDeck, setLocalDeck] = useState<SlideDeckData>(deck);
  const [selectedSlideId, setSelectedSlideId] = useState<string>(deck.slides[0]?.slideId || '');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [templatesByCategory, setTemplatesByCategory] = useState<Record<string, SlideTemplate[]>>({});
  const [currentAnalysis, setCurrentAnalysis] = useState<ContentAnalysis | null>(null);
  const [recommendedTemplates, setRecommendedTemplates] = useState<SlideTemplate[]>([]);
  const [presentationInsights, setPresentationInsights] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState<SlideTemplate[]>([]);

  // Ініціалізація
  useEffect(() => {
    setLocalDeck(deck);
    setTemplatesByCategory(templateManager.getTemplatesByCategory());
    
    // Аналізуємо всю презентацію
    if (deck.slides.length > 0) {
      const insights = templateManager.analyzePresentationFlow(deck.slides);
      setPresentationInsights(insights);
    }
  }, [deck]);

  // Аналізуємо поточний слайд при зміні
  useEffect(() => {
    const currentSlide = localDeck.slides.find(s => s.slideId === selectedSlideId);
    if (currentSlide) {
      const result = templateManager.analyzeAndRecommend(currentSlide);
      setCurrentAnalysis(result.analysis);
      setRecommendedTemplates(result.recommendedTemplates);
    }
  }, [selectedSlideId, localDeck]);

  // Пошук шаблонів
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = templateManager.searchTemplates(searchQuery);
      setFilteredTemplates(results);
    } else {
      setFilteredTemplates([]);
    }
  }, [searchQuery]);

  // Застосовуємо шаблон до слайду
  const applyTemplate = (slideId: string, templateId: string) => {
    const template = templateManager.getTemplate(templateId);
    if (!template) return;

    const updatedDeck = { ...localDeck };
    const slide = updatedDeck.slides.find(s => s.slideId === slideId);
    
    if (slide) {
      slide.contentBlocks = [...template.blocks];
      
      // Якщо шаблон має DeckDeckGo специфікацію
      if (template.deckgoTemplate) {
        (slide as any).deckgoTemplate = template.deckgoTemplate;
      }
      
      setLocalDeck(updatedDeck);
      onSave?.(updatedDeck);
    }
    setShowTemplates(false);
  };

  // Автоматичне застосування найкращого шаблону
  const autoApplyBestTemplate = (slideId: string) => {
    const slide = localDeck.slides.find(s => s.slideId === slideId);
    if (!slide) return;

    const bestTemplate = templateManager.autoSelectTemplate(slide);
    if (bestTemplate) {
      applyTemplate(slideId, bestTemplate.id);
    }
  };

  // Додавання нового слайду з AI рекомендацією
  const addSmartSlide = () => {
    const newSlide: DeckSlide = {
      slideId: `slide-${Date.now()}`,
      slideNumber: localDeck.slides.length + 1,
      slideTitle: `Slide ${localDeck.slides.length + 1}`,
      contentBlocks: []
    };

    // AI визначає найкращий тип слайду на основі контексту
    let suggestedTemplate: SlideTemplate | null = null;
    
    if (localDeck.slides.length === 0) {
      // Перший слайд - завжди титульний
      suggestedTemplate = templateManager.getTemplate('title-basic') || null;
    } else if (localDeck.slides.length === localDeck.slides.length) {
      // Останній слайд - підсумок
      suggestedTemplate = templateManager.searchTemplates('summary')[0] || null;
    } else {
      // Аналізуємо попередні слайди для кращої рекомендації
      const insights = templateManager.analyzePresentationFlow(localDeck.slides);
      if (insights.overallAnalysis.interactivityBalance < 0.5) {
        const interactiveTemplates = templateManager.getTemplatesByInteractivity('high');
        suggestedTemplate = interactiveTemplates[0] || null;
      }
    }

    if (suggestedTemplate) {
      newSlide.contentBlocks = [...suggestedTemplate.blocks];
      if (suggestedTemplate.deckgoTemplate) {
        (newSlide as any).deckgoTemplate = suggestedTemplate.deckgoTemplate;
      }
    }

    const updatedDeck = {
      ...localDeck,
      slides: [...localDeck.slides, newSlide]
    };

    setLocalDeck(updatedDeck);
    setSelectedSlideId(newSlide.slideId);
    onSave?.(updatedDeck);
  };

  // Оптимізація всієї презентації
  const optimizePresentation = () => {
    const optimizedDeck = { ...localDeck };
    
    optimizedDeck.slides.forEach(slide => {
      const bestTemplate = templateManager.autoSelectTemplate(slide);
      if (bestTemplate && bestTemplate.interactivity === 'high') {
        // Застосовуємо тільки високоінтерактивні шаблони для покращення
        slide.contentBlocks = [...bestTemplate.blocks];
        if (bestTemplate.deckgoTemplate) {
          (slide as any).deckgoTemplate = bestTemplate.deckgoTemplate;
        }
      }
    });

    setLocalDeck(optimizedDeck);
    onSave?.(optimizedDeck);
  };

  // Компонент для відображення AI інсайтів
  const AIInsightsPanel = () => (
    <div className="ai-insights-panel bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        🤖 AI Аналіз Презентації
      </h3>
      
      {presentationInsights && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(presentationInsights.overallAnalysis.diversity * 100)}%
              </div>
              <div className="text-sm text-gray-600">Різноманітність</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(presentationInsights.overallAnalysis.interactivityBalance * 100)}%
              </div>
              <div className="text-sm text-gray-600">Інтерактивність</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(presentationInsights.overallAnalysis.flowScore * 100)}%
              </div>
              <div className="text-sm text-gray-600">Логічність</div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-gray-700 mb-2">💡 Рекомендації:</h4>
            <ul className="space-y-1">
              {presentationInsights.suggestions.map((suggestion: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="mr-2">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {currentAnalysis && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="font-semibold text-gray-700 mb-2">
            🎯 Поточний слайд: {currentAnalysis.contentType}
          </h4>
          <div className="text-sm text-gray-600">
            Складність: <span className="font-medium">{currentAnalysis.complexity}</span> | 
            Інтерактивність: <span className="font-medium">{currentAnalysis.interactivityNeeded}</span> | 
            Впевненість: <span className="font-medium">{Math.round(currentAnalysis.confidence * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );

  // Компонент для розширеного селектора шаблонів
  const EnhancedTemplateSelector = () => (
    <div className="enhanced-template-selector bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      {/* Пошук шаблонів */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Пошук шаблонів..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute right-3 top-2.5">
            🔍
          </div>
        </div>
      </div>

      {/* AI рекомендації */}
      {recommendedTemplates.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            ✨ AI Рекомендації для поточного слайду
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {recommendedTemplates.map((template, index) => (
              <button
                key={template.id}
                className="flex items-center p-3 rounded-lg border border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                onClick={() => applyTemplate(selectedSlideId, template.id)}
              >
                <span className="text-2xl mr-3">{template.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{template.name}</div>
                  <div className="text-sm text-gray-600">{template.description}</div>
                  {template.deckgoTemplate && (
                    <div className="text-xs text-blue-600 mt-1">
                      DeckDeckGo: {template.deckgoTemplate}
                    </div>
                  )}
                </div>
                <div className="text-xs bg-blue-200 px-2 py-1 rounded text-blue-800">
                  #{index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Результати пошуку */}
      {filteredTemplates.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">
            🔍 Результати пошуку ({filteredTemplates.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                className="template-card p-3 rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all text-left"
                onClick={() => applyTemplate(selectedSlideId, template.id)}
              >
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">{template.icon}</span>
                  <span className="font-medium text-sm">{template.name}</span>
                </div>
                <div className="text-xs text-gray-600">{template.description}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                  <span>{template.category}</span>
                  {template.interactivity && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      template.interactivity === 'high' ? 'bg-red-100 text-red-700' :
                      template.interactivity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {template.interactivity}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Шаблони по категоріях */}
      {Object.entries(templatesByCategory).map(([category, templates]) => (
        templates.length > 0 && (
          <div key={category} className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 capitalize">
              {category === 'basic' ? '🟢 Базові' :
               category === 'business' ? '💼 Бізнес' :
               category === 'educational' ? '📚 Освітні' :
               category === 'creative' ? '🎨 Креативні' :
               '💻 Технічні'} ({templates.length})
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className="template-card p-3 rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all text-left"
                  onClick={() => applyTemplate(selectedSlideId, template.id)}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">{template.icon}</span>
                    <span className="font-medium text-sm">{template.name}</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">{template.description}</div>
                  {template.deckgoTemplate && (
                    <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      DeckDeckGo
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );

  return (
    <div className="enhanced-slide-deck-viewer">
      {/* Покращений Header */}
      <div className="professional-header bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="presentation-info">
            <h1 className="text-2xl font-bold text-gray-900">{localDeck.lessonTitle}</h1>
            <span className="text-gray-600">{localDeck.slides.length} слайдів</span>
          </div>
          
          {isEditable && (
            <div className="flex items-center gap-3">
              <button 
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
                onClick={() => setShowAIInsights(!showAIInsights)}
              >
                🤖 AI Інсайти
              </button>
              
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                ⊞ Шаблони
              </button>
              
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                onClick={addSmartSlide}
              >
                ✨ Smart Слайд
              </button>

              <button 
                className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                onClick={optimizePresentation}
                title="Автоматична оптимізація презентації"
              >
                ⚡
              </button>

              <button 
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => autoApplyBestTemplate(selectedSlideId)}
                title="Застосувати найкращий шаблон"
              >
                🎯
              </button>
            </div>
          )}
        </div>

        {/* AI Інсайти панель */}
        {showAIInsights && isEditable && (
          <div className="mt-4">
            <AIInsightsPanel />
          </div>
        )}

        {/* Розширений селектор шаблонів */}
        {showTemplates && isEditable && (
          <div className="mt-4">
            <EnhancedTemplateSelector />
          </div>
        )}
      </div>

      {/* Основний контент - використовуємо оригінальну логіку SlideDeckViewer */}
      <div className="main-content flex">
        {/* Sidebar з мініатюрами слайдів */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Слайди</h3>
          <div className="space-y-2">
            {localDeck.slides.map((slide) => (
              <div
                key={slide.slideId}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedSlideId === slide.slideId 
                    ? 'bg-blue-100 border-blue-300 border-2' 
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSlideId(slide.slideId)}
              >
                <div className="text-sm font-medium text-gray-800 mb-1">
                  {slide.slideNumber}. {slide.slideTitle}
                </div>
                <div className="text-xs text-gray-500">
                  {slide.contentBlocks.length} блоків
                </div>
                {(slide as any).deckgoTemplate && (
                  <div className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded mt-1 inline-block">
                    DeckDeckGo
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Область перегляду слайдів */}
        <div className="flex-1 p-6 bg-white">
          {selectedSlideId && localDeck.slides.find(s => s.slideId === selectedSlideId) && (
            <div className="slide-viewer bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[600px]">
              {/* Тут буде відображатися вміст поточного слайду */}
              <div className="slide-content">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {localDeck.slides.find(s => s.slideId === selectedSlideId)?.slideTitle}
                </h2>
                
                <div className="prose max-w-none">
                  {localDeck.slides.find(s => s.slideId === selectedSlideId)?.contentBlocks.map((block, index) => (
                    <div key={index} className="mb-4">
                      {/* Тут буде рендеритися кожен блок контенту */}
                      <div className="content-block p-2 border-l-4 border-blue-200">
                        {JSON.stringify(block, null, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { EnhancedSlideDeckViewer }; 