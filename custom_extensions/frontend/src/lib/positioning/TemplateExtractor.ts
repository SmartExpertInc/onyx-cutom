// lib/positioning/TemplateExtractor.ts
// Utility for extracting positionable items from existing templates

import {
  PositionableItem,
  Position,
  CanvasConfig
} from '@/types/positioning';

import {
  ComponentBasedSlide,
  TemplateId,
  BulletPointsProps,
  TwoColumnProps,
  ProcessStepsProps,
  BigNumbersTemplateProps,
  PyramidTemplateProps,
  TimelineTemplateProps,
  ChallengesSolutionsProps
} from '@/types/slideTemplates';

export class TemplateExtractor {
  private static readonly DEFAULT_CANVAS: CanvasConfig = {
    width: 1200,
    height: 675, // 16:9 aspect ratio
    gridSize: 20,
    snapToGrid: false,
    showGrid: false,
    backgroundColor: '#ffffff',
    padding: {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40
    }
  };

  /**
   * Extract positionable items from a template slide
   */
  static extractItemsFromSlide(slide: ComponentBasedSlide): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const extractor = this.getExtractorForTemplate(slide.templateId as TemplateId);
    if (!extractor) {
      return {
        items: TemplateExtractor.createFallbackItems(slide),
        canvasConfig: TemplateExtractor.DEFAULT_CANVAS
      };
    }

    return extractor(slide.props);
  }

  /**
   * Convert a template slide to positioning mode
   */
  static convertSlideToPositioning(slide: ComponentBasedSlide): ComponentBasedSlide {
    const { items, canvasConfig } = this.extractItemsFromSlide(slide);
    
    return {
      ...slide,
      items,
      canvasConfig,
      positioningMode: 'hybrid',
      metadata: {
        ...slide.metadata,
        hasCustomPositioning: true,
        originalTemplateId: slide.templateId
      }
    };
  }

  /**
   * Get the appropriate extractor function for a template
   */
  private static getExtractorForTemplate(templateId: TemplateId): 
    ((props: any) => { items: PositionableItem[]; canvasConfig: CanvasConfig }) | null {
    
    const extractors: Record<TemplateId, ((props: any) => { items: PositionableItem[]; canvasConfig: CanvasConfig }) | null> = {
      'bullet-points': this.extractBulletPoints,
      'bullet-points-right': this.extractBulletPointsRight,
      'two-column': this.extractTwoColumn,
      'process-steps': this.extractProcessSteps,
      'big-numbers': this.extractBigNumbers,
      'pyramid': this.extractPyramid,
      'timeline': this.extractTimeline,
      'challenges-solutions': this.extractChallengesSolutions,
      'content-slide': this.extractContentSlide,
      'title-slide': this.extractTitleSlide,
      'hero-title-slide': this.extractHeroTitleSlide,
      'big-image-left': this.extractBigImageLeft,
      'big-image-top': this.extractBigImageTop,
      'quote-center': this.extractQuoteCenter,
      'four-box-grid': this.extractFourBoxGrid,
      'event-list': this.extractEventList,
      'six-ideas-list': this.extractSixIdeasList,
      'contraindications-indications': this.extractContraindicationsIndications,
      'metrics-analytics': this.extractMetricsAnalytics,
      'org-chart': this.extractOrgChart,
      'pie-chart-infographics': this.extractPieChartInfographics,
      'bar-chart-infographics': this.extractBarChartInfographics,
      'market-share': this.extractMarketShare,
      'comparison-slide': null,
    };

    return extractors[templateId] || null;
  }

  // === TEMPLATE-SPECIFIC EXTRACTORS ===

  /**
   * Extract items from bullet points template
   */
  private static extractBulletPoints(props: BulletPointsProps): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];
    let currentY = 80;

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: currentY, width: 1080, height: 60 },
        'heading'
      ));
      currentY += 100;
    }

    // Image (if present)
    if (props.imagePath || props.imagePrompt) {
      items.push(TemplateExtractor.createImageItem(
        'main-image',
        props.imagePath || '',
        props.imagePrompt || '',
        { x: 800, y: currentY, width: 320, height: 200 }
      ));
    }

    // Bullets
    if (props.bullets && props.bullets.length > 0) {
      const bulletListItem = TemplateExtractor.createBulletListItem(
        'bullet-list',
        props.bullets,
        { x: 60, y: currentY, width: 700, height: props.bullets.length * 40 + 20 }
      );
      items.push(bulletListItem);
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from bullet points right template
   */
  private static extractBulletPointsRight(props: BulletPointsProps): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Image on the right
    if (props.imagePath || props.imagePrompt) {
      items.push(TemplateExtractor.createImageItem(
        'main-image',
        props.imagePath || '',
        props.imagePrompt || '',
        { x: 800, y: 180, width: 340, height: 400 }
      ));
    }

    // Bullets on the left
    if (props.bullets && props.bullets.length > 0) {
      const bulletListItem = TemplateExtractor.createBulletListItem(
        'bullet-list',
        props.bullets,
        { x: 60, y: 180, width: 700, height: props.bullets.length * 40 + 20 }
      );
      items.push(bulletListItem);
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from two column template
   */
  private static extractTwoColumn(props: TwoColumnProps): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];
    const columnWidth = 520;
    const gap = 40;

    // Main title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'main-title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Left column
    let leftY = 180;
    
    // Left title
    if (props.leftTitle) {
      items.push(TemplateExtractor.createTextItem(
        'left-title',
        props.leftTitle,
        { x: 60, y: leftY, width: columnWidth, height: 40 },
        'heading'
      ));
      leftY += 60;
    }

    // Left image
    if (props.leftImagePath || props.leftImagePrompt) {
      items.push(TemplateExtractor.createImageItem(
        'left-image',
        props.leftImagePath || '',
        props.leftImagePrompt || '',
        { x: 60, y: leftY, width: columnWidth, height: 200 }
      ));
      leftY += 220;
    }

    // Left content
    if (props.leftContent) {
      items.push(TemplateExtractor.createTextItem(
        'left-content',
        props.leftContent,
        { x: 60, y: leftY, width: columnWidth, height: 200 },
        'text'
      ));
    }

    // Right column
    let rightY = 180;
    const rightX = 60 + columnWidth + gap;

    // Right title
    if (props.rightTitle) {
      items.push(TemplateExtractor.createTextItem(
        'right-title',
        props.rightTitle,
        { x: rightX, y: rightY, width: columnWidth, height: 40 },
        'heading'
      ));
      rightY += 60;
    }

    // Right image
    if (props.rightImagePath || props.rightImagePrompt) {
      items.push(TemplateExtractor.createImageItem(
        'right-image',
        props.rightImagePath || '',
        props.rightImagePrompt || '',
        { x: rightX, y: rightY, width: columnWidth, height: 200 }
      ));
      rightY += 220;
    }

    // Right content
    if (props.rightContent) {
      items.push(TemplateExtractor.createTextItem(
        'right-content',
        props.rightContent,
        { x: rightX, y: rightY, width: columnWidth, height: 200 },
        'text'
      ));
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from process steps template
   */
  private static extractProcessSteps(props: ProcessStepsProps): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Steps
    if (props.steps && props.steps.length > 0) {
      const stepWidth = Math.floor((1080 - (props.steps.length - 1) * 20) / props.steps.length);
      
      props.steps.forEach((step, index) => {
        const x = 60 + index * (stepWidth + 20);
        const y = 200;

        // Step container
        items.push(TemplateExtractor.createStepItem(
          `step-${index + 1}`,
          step,
          index + 1,
          { x, y, width: stepWidth, height: 300 }
        ));
      });
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from big numbers template
   */
  private static extractBigNumbers(props: BigNumbersTemplateProps): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Numbers
    if (props.steps && props.steps.length > 0) {
      const itemWidth = Math.floor((1080 - (props.steps.length - 1) * 40) / props.steps.length);
      
      props.steps.forEach((item, index) => {
        const x = 60 + index * (itemWidth + 40);
        const y = 200;

        items.push(TemplateExtractor.createBigNumberItem(
          `number-${index + 1}`,
          item,
          { x, y, width: itemWidth, height: 300 }
        ));
      });
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract steps from pyramid template
   */
  private static extractPyramid(props: PyramidTemplateProps): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title and subtitle
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 50 },
        'heading'
      ));
    }

    if (props.subtitle) {
      items.push(TemplateExtractor.createTextItem(
        'subtitle',
        props.subtitle,
        { x: 60, y: 140, width: 800, height: 40 },
        'text'
      ));
    }

    // Pyramid visual (as a shape)
    items.push(TemplateExtractor.createShapeItem(
      'pyramid-shape',
      'pyramid',
      { x: 60, y: 200, width: 500, height: 400 }
    ));

    // Pyramid steps
    if (props.steps && props.steps.length > 0) {  // Changed from 'items' to 'steps'
      const itemPositions = [
        { x: 600, y: 220, width: 540, height: 80 },   // Top
        { x: 600, y: 320, width: 540, height: 80 },   // Middle
        { x: 600, y: 420, width: 540, height: 80 }    // Bottom
      ];

      props.steps.forEach((item, index) => {  // Changed from 'items' to 'steps'
        if (index < itemPositions.length) {
          items.push(TemplateExtractor.createPyramidItem(
            `pyramid-item-${index + 1}`,
            item,
            itemPositions[index]
          ));
        }
      });
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from timeline template
   */
  private static extractTimeline(props: TimelineTemplateProps): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Timeline line
    items.push(TemplateExtractor.createShapeItem(
      'timeline-line',
      'line',
      { x: 100, y: 350, width: 1000, height: 4 }
    ));

    // Timeline steps
    if (props.steps && props.steps.length > 0) {
      const stepWidth = Math.floor(1000 / props.steps.length);
      
      props.steps.forEach((step, index) => {
        const x = 100 + index * stepWidth;
        const y = index % 2 === 0 ? 200 : 400; // Alternate above/below line

        items.push(TemplateExtractor.createTimelineItem(
          `timeline-step-${index + 1}`,
          step,
          { x, y, width: stepWidth - 20, height: 120 }
        ));
      });
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from challenges solutions template
   */
  private static extractChallengesSolutions(props: ChallengesSolutionsProps): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];
    const columnWidth = 520;
    const gap = 40;

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Challenges column
    if (props.challenges && props.challenges.length > 0) {
      items.push(TemplateExtractor.createTextItem(
        'challenges-title',
        props.challengesTitle || 'Challenges',
        { x: 60, y: 160, width: columnWidth, height: 40 },
        'heading'
      ));

      items.push(TemplateExtractor.createBulletListItem(
        'challenges-list',
        props.challenges,
        { x: 60, y: 220, width: columnWidth, height: props.challenges.length * 40 + 20 },
        'challenge'
      ));
    }

    // Solutions column
    if (props.solutions && props.solutions.length > 0) {
      const rightX = 60 + columnWidth + gap;
      
      items.push(TemplateExtractor.createTextItem(
        'solutions-title',
        props.solutionsTitle || 'Solutions',
        { x: rightX, y: 160, width: columnWidth, height: 40 },
        'heading'
      ));

      items.push(TemplateExtractor.createBulletListItem(
        'solutions-list',
        props.solutions,
        { x: rightX, y: 220, width: columnWidth, height: props.solutions.length * 40 + 20 },
        'solution'
      ));
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from content slide template
   */
  private static extractContentSlide(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Content
    if (props.content) {
      items.push(TemplateExtractor.createTextItem(
        'content',
        props.content,
        { x: 60, y: 180, width: 1080, height: 400 },
        'text'
      ));
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from title slide template
   */
  private static extractTitleSlide(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 200, width: 1080, height: 100 },
        'heading'
      ));
    }

    // Subtitle
    if (props.subtitle) {
      items.push(TemplateExtractor.createTextItem(
        'subtitle',
        props.subtitle,
        { x: 60, y: 320, width: 1080, height: 60 },
        'text'
      ));
    }

    // Author and date
    if (props.author || props.date) {
      const authorDate = [props.author, props.date].filter(Boolean).join(' • ');
      items.push(TemplateExtractor.createTextItem(
        'author-date',
        authorDate,
        { x: 60, y: 500, width: 1080, height: 40 },
        'text'
      ));
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from hero title slide template
   */
  private static extractHeroTitleSlide(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Accent element
    if (props.showAccent) {
      items.push(TemplateExtractor.createShapeItem(
        'accent',
        'accent',
        { x: 60, y: 150, width: 200, height: 300 }
      ));
    }

    // Title
    if (props.title) {
      const titleX = props.showAccent ? 300 : 60;
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: titleX, y: 200, width: 1080 - titleX + 60, height: 120 },
        'heading'
      ));
    }

    // Subtitle
    if (props.subtitle) {
      const subtitleX = props.showAccent ? 300 : 60;
      items.push(TemplateExtractor.createTextItem(
        'subtitle',
        props.subtitle,
        { x: subtitleX, y: 340, width: 1080 - subtitleX + 60, height: 80 },
        'text'
      ));
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  // === ITEM CREATION HELPERS ===

  /**
   * Create a generic text item
   */
  private static createTextItem(
    id: string,
    content: string,
    position: Position,
    type: 'heading' | 'text' = 'text'
  ): PositionableItem {
    return {
      id,
      type: 'text',
      content: { text: content, style: type },
      position,
      defaultPosition: { ...position },
      constraints: {
        minWidth: 100,
        minHeight: 30,
        snapToGrid: true
      },
      metadata: {
        templateOrigin: 'extracted',
        isUserCreated: false,
        lastModified: new Date().toISOString()
      }
    };
  }

  /**
   * Create an image item
   */
  private static createImageItem(
    id: string,
    imagePath: string,
    prompt: string,
    position: Position
  ): PositionableItem {
    return {
      id,
      type: 'image',
      content: { 
        imagePath, 
        prompt, 
        alt: prompt || 'Image' 
      },
      position,
      defaultPosition: { ...position },
      constraints: {
        minWidth: 100,
        minHeight: 100,
        maintainAspectRatio: true,
        snapToGrid: true
      },
      metadata: {
        templateOrigin: 'extracted',
        isUserCreated: false,
        lastModified: new Date().toISOString()
      }
    };
  }

  /**
   * Create a bullet list item
   */
  private static createBulletListItem(
    id: string,
    bullets: string[],
    position: Position,
    listType: string = 'bullet'
  ): PositionableItem {
    return {
      id,
      type: 'bullet-list',
      content: { 
        bullets, 
        listType,
        bulletStyle: 'dot'
      },
      position,
      defaultPosition: { ...position },
      constraints: {
        minWidth: 200,
        minHeight: 100,
        snapToGrid: true
      },
      metadata: {
        templateOrigin: 'extracted',
        isUserCreated: false,
        lastModified: new Date().toISOString()
      }
    };
  }

  /**
   * Create a shape item
   */
  private static createShapeItem(
    id: string,
    shapeType: string,
    position: Position
  ): PositionableItem {
    return {
      id,
      type: 'shape',
      content: { 
        shapeType,
        fillColor: '#007bff',
        strokeColor: '#0056b3',
        strokeWidth: 2
      },
      position,
      defaultPosition: { ...position },
      constraints: {
        minWidth: 50,
        minHeight: 50,
        snapToGrid: true
      },
      metadata: {
        templateOrigin: 'extracted',
        isUserCreated: false,
        lastModified: new Date().toISOString()
      }
    };
  }

  /**
   * Create a step item for process steps
   */
  private static createStepItem(
    id: string,
    step: { title: string; description: string; icon?: string },
    stepNumber: number,
    position: Position
  ): PositionableItem {
    return {
      id,
      type: 'container',
      content: { 
        stepNumber,
        title: step.title,
        description: step.description,
        icon: step.icon
      },
      position,
      defaultPosition: { ...position },
      constraints: {
        minWidth: 150,
        minHeight: 200,
        snapToGrid: true
      },
      metadata: {
        templateOrigin: 'extracted',
        isUserCreated: false,
        lastModified: new Date().toISOString()
      }
    };
  }

  /**
   * Create a big number item
   */
  private static createBigNumberItem(
    id: string,
    item: { value: string; label: string; description: string },
    position: Position
  ): PositionableItem {
    return {
      id,
      type: 'container',
      content: { 
        type: 'big-number',
        value: item.value,
        label: item.label,
        description: item.description
      },
      position,
      defaultPosition: { ...position },
      constraints: {
        minWidth: 200,
        minHeight: 250,
        snapToGrid: true
      },
      metadata: {
        templateOrigin: 'extracted',
        isUserCreated: false,
        lastModified: new Date().toISOString()
      }
    };
  }

  /**
   * Create a pyramid item
   */
  private static createPyramidItem(
    id: string,
    item: { heading: string; description: string },
    position: Position
  ): PositionableItem {
    return {
      id,
      type: 'container',
      content: { 
        type: 'pyramid-item',
        heading: item.heading,
        description: item.description
      },
      position,
      defaultPosition: { ...position },
      constraints: {
        minWidth: 300,
        minHeight: 60,
        snapToGrid: true
      },
      metadata: {
        templateOrigin: 'extracted',
        isUserCreated: false,
        lastModified: new Date().toISOString()
      }
    };
  }

  /**
   * Create a timeline item
   */
  private static createTimelineItem(
    id: string,
    step: { heading: string; description: string },
    position: Position
  ): PositionableItem {
    return {
      id,
      type: 'container',
      content: { 
        type: 'timeline-item',
        heading: step.heading,
        description: step.description
      },
      position,
      defaultPosition: { ...position },
      constraints: {
        minWidth: 150,
        minHeight: 100,
        snapToGrid: true
      },
      metadata: {
        templateOrigin: 'extracted',
        isUserCreated: false,
        lastModified: new Date().toISOString()
      }
    };
  }

  /**
   * Extract items from big image left template
   */
  private static extractBigImageLeft(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Image on the left
    if (props.imagePath || props.imageUrl) {
      items.push(TemplateExtractor.createImageItem(
        'main-image',
        props.imagePath || props.imageUrl || '',
        props.imagePrompt || '',
        { x: 60, y: 160, width: 400, height: 400 }
      ));
    }

    // Content on the right
    if (props.content) {
      items.push(TemplateExtractor.createTextItem(
        'subtitle',
        props.content,
        { x: 500, y: 160, width: 640, height: 400 },
        'text'
      ));
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from big image top template
   */
  private static extractBigImageTop(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Image at the top
    if (props.imagePath || props.imageUrl) {
      items.push(TemplateExtractor.createImageItem(
        'main-image',
        props.imagePath || props.imageUrl || '',
        props.imagePrompt || '',
        { x: 60, y: 160, width: 1080, height: 300 }
      ));
    }

    // Content below
    if (props.subtitle) {
      items.push(TemplateExtractor.createTextItem(
        'subtitle',
        props.subtitle,
        { x: 60, y: 480, width: 1080, height: 120 },
        'text'
      ));
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from quote center template
   */
  private static extractQuoteCenter(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Quote text (centered)
    if (props.quote) {
      items.push(TemplateExtractor.createTextItem(
        'quote',
        `"${props.quote}"`,
        { x: 150, y: 200, width: 900, height: 200 },
        'heading'
      ));
    }

    // Author (centered below quote)
    if (props.author) {
      items.push(TemplateExtractor.createTextItem(
        'author',
        `— ${props.author}`,
        { x: 150, y: 420, width: 900, height: 60 },
        'text'
      ));
    }

    // Attribution (if provided)
    if (props.attribution) {
      items.push(TemplateExtractor.createTextItem(
        'attribution',
        props.attribution,
        { x: 150, y: 500, width: 900, height: 40 },
        'text'
      ));
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from four box grid template
   */
  private static extractFourBoxGrid(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Four boxes in 2x2 grid
    if (props.boxes && props.boxes.length > 0) {
      const boxWidth = 500;
      const boxHeight = 200;
      const gap = 40;
      const startX = 60;
      const startY = 180;

      props.boxes.forEach((box: any, index: number) => {
        if (index < 4) { // Only handle first 4 boxes
          const row = Math.floor(index / 2);
          const col = index % 2;
          const x = startX + col * (boxWidth + gap);
          const y = startY + row * (boxHeight + gap);

          items.push(TemplateExtractor.createContainerItem(
            `box-${index + 1}`,
            {
              type: 'four-box-item',
              heading: box.heading || `Box ${index + 1}`,
              text: box.text || ''
            },
            { x, y, width: boxWidth, height: boxHeight }
          ));
        }
      });
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Create a container item for complex content
   */
  private static createContainerItem(
    id: string,
    content: any,
    position: Position
  ): PositionableItem {
    return {
      id,
      type: 'container',
      content,
      position,
      defaultPosition: { ...position },
      constraints: {
        minWidth: 200,
        minHeight: 150,
        snapToGrid: true
      },
      metadata: {
        templateOrigin: 'extracted',
        isUserCreated: false,
        lastModified: new Date().toISOString()
      }
    };
  }

  // === NEW TEMPLATE EXTRACTORS ===

  /**
   * Extract items from event list template
   */
  private static extractEventList(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Events list
    if (props.events && props.events.length > 0) {
      let currentY = 180;
      props.events.forEach((event: any, index: number) => {
        // Date
        if (event.date) {
          items.push(TemplateExtractor.createTextItem(
            `event-date-${index + 1}`,
            event.date,
            { x: 60, y: currentY, width: 200, height: 40 },
            'text'
          ));
        }

        // Description
        if (event.description) {
          items.push(TemplateExtractor.createTextItem(
            `event-description-${index + 1}`,
            event.description,
            { x: 280, y: currentY, width: 860, height: 40 },
            'text'
          ));
        }

        currentY += 60;
      });
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from six ideas list template
   */
  private static extractSixIdeasList(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Image (if present)
    if (props.imagePath || props.imageUrl) {
      items.push(TemplateExtractor.createImageItem(
        'main-image',
        props.imagePath || props.imageUrl || '',
        props.imagePrompt || '',
        { x: 800, y: 180, width: 340, height: 400 }
      ));
    }

    // Ideas list
    if (props.ideas && props.ideas.length > 0) {
      let currentY = 180;
      props.ideas.forEach((idea: any, index: number) => {
        if (index < 6) { // Only handle first 6 ideas
          // Number
          if (idea.number) {
            items.push(TemplateExtractor.createTextItem(
              `idea-number-${index + 1}`,
              idea.number,
              { x: 60, y: currentY, width: 60, height: 40 },
              'heading'
            ));
          }

          // Text
          if (idea.text) {
            items.push(TemplateExtractor.createTextItem(
              `idea-text-${index + 1}`,
              idea.text,
              { x: 140, y: currentY, width: 640, height: 40 },
              'text'
            ));
          }

          currentY += 60;
        }
      });
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from contraindications indications template
   */
  private static extractContraindicationsIndications(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];
    const columnWidth = 520;
    const gap = 40;

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Contraindications column
    if (props.contraindications && props.contraindications.length > 0) {
      items.push(TemplateExtractor.createTextItem(
        'contraindications-title',
        'Contraindications',
        { x: 60, y: 160, width: columnWidth, height: 40 },
        'heading'
      ));

      items.push(TemplateExtractor.createBulletListItem(
        'contraindications-list',
        props.contraindications,
        { x: 60, y: 220, width: columnWidth, height: props.contraindications.length * 40 + 20 },
        'contraindication'
      ));
    }

    // Indications column
    if (props.indications && props.indications.length > 0) {
      const rightX = 60 + columnWidth + gap;
      
      items.push(TemplateExtractor.createTextItem(
        'indications-title',
        'Indications',
        { x: rightX, y: 160, width: columnWidth, height: 40 },
        'heading'
      ));

      items.push(TemplateExtractor.createBulletListItem(
        'indications-list',
        props.indications,
        { x: rightX, y: 220, width: columnWidth, height: props.indications.length * 40 + 20 },
        'indication'
      ));
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from metrics analytics template
   */
  private static extractMetricsAnalytics(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Metrics
    if (props.metrics && props.metrics.length > 0) {
      const itemWidth = Math.floor((1080 - (props.metrics.length - 1) * 40) / props.metrics.length);
      
      props.metrics.forEach((metric: any, index: number) => {
        const x = 60 + index * (itemWidth + 40);
        const y = 200;

        items.push(TemplateExtractor.createBigNumberItem(
          `metric-${index + 1}`,
          metric,
          { x, y, width: itemWidth, height: 300 }
        ));
      });
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from org chart template
   */
  private static extractOrgChart(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Org chart items
    if (props.chartData && props.chartData.length > 0) {
      let currentY = 180;
      props.chartData.forEach((item: any, index: number) => {
        items.push(TemplateExtractor.createContainerItem(
          `org-item-${index + 1}`,
          {
            type: 'org-chart-item',
            title: item.title,
            level: item.level,
            parentId: item.parentId
          },
          { x: 60 + (item.level * 100), y: currentY, width: 300, height: 80 }
        ));
        currentY += 100;
      });
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from pie chart infographics template
   */
  private static extractPieChartInfographics(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Pie chart (as a shape)
    items.push(TemplateExtractor.createShapeItem(
      'pie-chart',
      'pie-chart',
      { x: 60, y: 180, width: 400, height: 400 }
    ));

    // Chart data legend
    if (props.chartData && props.chartData.segments) {
      let currentY = 180;
      props.chartData.segments.forEach((segment: any, index: number) => {
        items.push(TemplateExtractor.createContainerItem(
          `segment-${index + 1}`,
          {
            type: 'pie-segment',
            label: segment.label,
            percentage: segment.percentage,
            color: segment.color,
            description: segment.description
          },
          { x: 500, y: currentY, width: 640, height: 60 }
        ));
        currentY += 80;
      });
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from bar chart infographics template
   */
  private static extractBarChartInfographics(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];

    // Title
    if (props.title) {
      items.push(TemplateExtractor.createTextItem(
        'title',
        props.title,
        { x: 60, y: 80, width: 1080, height: 60 },
        'heading'
      ));
    }

    // Bar chart (as a shape)
    items.push(TemplateExtractor.createShapeItem(
      'bar-chart',
      'bar-chart',
      { x: 60, y: 180, width: 800, height: 400 }
    ));

    // Chart data legend
    if (props.chartData && props.chartData.categories) {
      let currentY = 180;
      props.chartData.categories.forEach((category: any, index: number) => {
        items.push(TemplateExtractor.createContainerItem(
          `category-${index + 1}`,
          {
            type: 'bar-category',
            label: category.label,
            value: category.value,
            color: category.color,
            description: category.description
          },
          { x: 900, y: currentY, width: 240, height: 60 }
        ));
        currentY += 80;
      });
    }

    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  /**
   * Extract items from market share template
   */
  private static extractMarketShare(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];
    
    if (props.title) {
      items.push({
        id: 'title',
        type: 'text',
        content: props.title,
        x: 400,
        y: 50,
        width: 800,
        height: 60,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center'
      });
    }
    
    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

  private static extractComparisonSlide(props: any): {
    items: PositionableItem[];
    canvasConfig: CanvasConfig;
  } {
    const items: PositionableItem[] = [];
    
    if (props.title) {
      items.push({
        id: 'title',
        type: 'text',
        content: props.title,
        x: 400,
        y: 50,
        width: 800,
        height: 60,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center'
      });
    }
    
    return {
      items,
      canvasConfig: TemplateExtractor.DEFAULT_CANVAS
    };
  }

}
