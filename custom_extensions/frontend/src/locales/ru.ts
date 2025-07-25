export const ru = {
  common: {
    course: "КУРС",
    lesson: "УРОК",
    save: "Сохранить",
    saving: "Сохранение...",
    confirmCancelEdit: "Вы уверены, что хотите отменить? Все несохраненные изменения будут потеряны.",
    errorDetails: "Подробности:",
    sourceChatTooltip: "Перейти в чат, где был создан этот контент",
    sourceChat: "Исходный чат",
    cancelEdit: "Отмена",
    edit: "Редактировать",
    downloadPdf: "Скачать PDF",
    saveErrorTitle: "Ошибка сохранения:",
    rendering: "Отрисовка содержимого..."
  },
  trainingPlan: {
    moduleAndLessons: "Модуль и уроки",
    knowledgeCheck: "Проверка знаний",
    contentAvailability: "Наличие контента",
    source: "Источник информации",
    time: "Час",
    qualityTier: "Уровень качества",
    timeUnitSingular: "ч",
    timeUnitDecimalPlural: "ч",
    timeUnitGeneralPlural: "ч",
    updateError: "Ошибка обновления имени: {error}",
    errorLoadingProjectTitle: "Ошибка загрузки проекта",
    errorLoadingProjectMessage: "Возникла проблема при получении данных проекта. Пожалуйста, повторите попытку позже.",
    returnToProjects: "Вернуться к списку проектов",
    projectNotFoundTitle: "Проект не найден",
    projectNotFoundMessage: "Проект, который вы ищете, не найден или у вас нет прав на его просмотр.",
    allProjects: "Все проекты",
    loadingProject: "Загрузка проекта..."
  },
  qualityTiers: {
    basic: "Базовый",
    interactive: "Интерактивный",
    advanced: "Продвинутый",
    immersive: "Иммерсивный"
  },
  videoLesson: {
    slide: "Слайд",
    displayedTextLabel: "Отображаемый текст",
    displayingImageLabel: "Изображение (описание)",
    displayedVideoLabel: "Видео (описание)",
    voiceoverTextLabel: "Текст озвучки",
    noSlides: "Слайды не найдены.",
    editMainTitlePlaceholder: "Заголовок видео-урока",
    editSlideTitlePlaceholder: "Заголовок слайда",
    editTextPlaceholder: "Короткое предложение для слайда...",
    editImageDescPlaceholder: "Краткое описание изображения...",
    editVideoDescPlaceholder: "Краткое описание видео/анимации...",
    editVoiceoverPlaceholder: "Текст озвучки (до 3 предложений)...",
    emptyContent: "...",
  },
  quiz: {
    quizTitle: "Название теста",
    question: "Вопрос",
    correctAnswer: "Правильный ответ",
    correctAnswers: "Правильные ответы",
    acceptableAnswers: "Допустимые ответы",
    prompts: "Элементы",
    options: "Варианты",
    correctMatches: "Правильные соответствия",
    itemsToSort: "Элементы для сортировки",
    explanation: "Объяснение",
    selectOption: "Выберите вариант",
    multipleChoice: "Один правильный ответ",
    multiSelect: "Несколько правильных ответов",
    matching: "Соответствие",
    sorting: "Сортировка",
    openAnswer: "Свободный ответ",
    answerKey: "Ключ ответов",
    correctOrder: "Правильный порядок",
    emptyContent: "...",
  },
  modals: {
    createLesson: {
      title: "Создать урок",
      lessonPresentation: "Презентация урока",
      videoLessonScript: "Сценарий видео-урока",
      videoLesson: "Видео-урок",
      comingSoon: "Скоро!",
      errorNoSessionId: "Ошибка: ID сессии чата недоступен. Невозможно создать урок."
    },
    createTest: {
      title: "Создать тест",
      quiz: "Тест",
      quizTooltip: "Создать тест для этого урока",
      errorNoSessionId: "Ошибка: ID сессии чата недоступен. Невозможно создать тест."
    },
    createContent: {
      title: "Создать контент",
      lessonTypes: "Типы уроков",
      assessmentTypes: "Типы оценивания",
      createNewLesson: "Создать новый урок"
    },
    folderSettings: {
      title: "Настройки папки",
      subtitle: "Настройка качества производства для",
      basic: "Базовый",
      basicDescription: "Простой контент электронного обучения с основными функциями для простых потребностей в обучении",
      interactive: "Интерактивный",
      interactiveDescription: "Увлекательный контент с интерактивными элементами для лучшего вовлечения и запоминания",
      advanced: "Продвинутый",
      advancedDescription: "Сложные учебные процессы с персонализированным контентом и продвинутой интерактивностью",
      immersive: "Иммерсивный",
      immersiveDescription: "Премиальные учебные процессы с передовыми технологиями для максимального вовлечения",
      features: "Функции",
      hoursRange: "Диапазон часов",
      customRate: "Пользовательская ставка",
      example: "Пример",
      cancel: "Отмена",
      saveChanges: "Сохранить изменения",
      saving: "Сохранение..."
    },
    projectSettings: {
      title: "Настройки курса",
      subtitle: "Настройка качества производства для"
    },
    clientName: {
      title: "Экспорт в PDF",
      subtitle: "Создать профессиональный PDF отчет",
      clientNameLabel: "Имя клиента (необязательно)",
      clientNamePlaceholder: "Введите имя клиента...",
      selectFoldersProducts: "Выбрать папки и продукты",
      folders: "Папки",
      unassignedProducts: "Неприсвоенные продукты",
      selected: "выбрано",
      skip: "Пропустить",
      generate: "Создать PDF",
      generating: "Создание..."
    },
    folderExport: {
      title: "Создание PDF",
      subtitle: "Создание PDF экспорта для папки",
      description: "Это может занять несколько минут в зависимости от количества файлов..."
    }
  },
  projects: {
    loading: "Загрузка продуктов...",
    error: "Ошибка: {error}",
    noProductsSelected: "Нет выбранных продуктов для удаления.",
    confirmDelete: "Вы уверены, что хотите удалить {count} выбранных продуктов?",
    deleteError: "Ошибка удаления продуктов: {error}",
  },
  // New translations for the projects page interface
  interface: {
    // Header
    products: "Продукты",
    trash: "Корзина",
    getUnlimitedAI: "Получить неограниченный ИИ",
    credits: "кредитов",
    loading: "Загрузка...",
    
    // Sidebar
    jumpTo: "Перейти к",
    keyboardShortcut: "⌘+K",
    sharedWithYou: "Поделились с вами",
    folders: "Папки",
    createOrJoinFolder: "Создать или присоединиться к папке",
    organizeProducts: "Организуйте свои продукты по темам и делитесь ими с командой",
    templates: "Шаблоны",
    themes: "Темы",
    
    // Main content
    all: "Все",
    trainingPlans: "Планы обучения",
    pdfLessons: "PDF уроки",
    videoLessons: "Видео уроки",
    textPresentations: "Текстовые презентации",
    quizzes: "Тесты",
    sort: "Сортировка",
    columns: "Столбцы",
    grid: "Сетка",
    list: "Список",
    noProjectsFound: "Продукты не найдены.",
    
    // Table headers
    title: "Название",
    created: "Создан",
    creator: "Создатель",
    numberOfLessons: "Количество уроков",
    estCreationTime: "Оц. время создания",
    estCompletionTime: "Оц. время завершения",
    actions: "Действия",
    
    // Project actions
    rename: "Переименовать",
    duplicate: "Дублировать",
    share: "Поделиться",
    export: "Экспорт",
    delete: "Удалить",
    deleting: "Удаление...",
    restore: "Восстановить",
    deletePermanently: "Удалить навсегда",
    moveToFolder: "Переместить в папку",
    settings: "Настройки",
    
    // Folder actions
    folderSettings: "Настройки папки",
    deleteFolder: "Удалить папку",
    moveFolder: "Переместить папку",
    
    // Modals
    createFolder: "Создать или присоединиться к папке",
    createFolderDescription: "Вы можете присоединиться к папке, чтобы отслеживать, над чем работают люди.",
    findOrCreateFolder: "Найти или создать новую папку",
    createFolderButton: "Создать папку",
    createAtTopLevel: "Создать на верхнем уровне (без родительской папки)",
    allFolders: "Все папки",
    noFoldersFound: "Папки не найдены.",
    done: "Готово",
    
    // Quality tiers
    basic: "Базовый",
    interactive: "Интерактивный",
    advanced: "Продвинутый",
    immersive: "Иммерсивный",
    
    // Time units
    hours: "ч",
    minutes: "мин",
    
    // Status
    private: "Приватный",
    createdByYou: "Создано вами",
    
    // Help button
    help: "Помощь",
    
    // Language selector
    language: "Язык",
    english: "Английский",
    ukrainian: "Украинский",
    spanish: "Испанский",
    russian: "Русский",

    // Create page
    createWithAI: "Создать с ИИ",
    howToGetStarted: "Как бы вы хотели начать?",
    home: "Главная",
    pasteInText: "Вставить текст",
    pasteInTextDescription: "Создать из заметок, плана или существующего контента",
    generate: "Генерировать",
    generateDescription: "Создать из однострочного запроса за несколько секунд",
    importFileOrUrl: "Импортировать файл или URL",
    importFileOrUrlDescription: "Улучшить существующие документы, презентации или веб-страницы",
    popular: "ПОПУЛЯРНО",

    // Projects table toolbar
    createNew: "Создать новое",
    import: "Импорт",
    showColumns: "Показать столбцы",
    numberOfLessonsShort: "Количество уроков",
    estCreationTimeShort: "Оц. время создания",
    estCompletionTimeShort: "Оц. время завершения",

    // Filters
    recentlyViewed: "Недавно просмотренные",
    favorites: "Избранное",

    // Authentication
    checkingAuthentication: "Проверка аутентификации...",

    // Block settings
    blockSettings: "Настройки блока",
    noSettingsAvailable: "Для этого типа блока настройки недоступны.",
    close: "Закрыть",
    // Analytics page
    analytics: {
      title: 'Панель аналитики запросов',
      subtitle: 'Комплексный мониторинг всех API запросов по всем аккаунтам',
      loadingData: 'Загрузка данных аналитики...',
      errorLoading: 'Ошибка загрузки аналитики',
      retry: 'Повторить',
      noDataAvailable: 'Данные аналитики недоступны',
      refreshData: 'Обновить данные',
      exportCsv: 'Экспорт CSV',
      exportJson: 'Экспорт JSON',
      activeFilters: 'Активные фильтры:',
      clearAllFilters: 'Очистить все фильтры',
      filters: 'Фильтры',
      dateRange: 'Диапазон дат',
      to: 'до',
      endpoint: 'Эндпоинт',
      filterEndpoint: 'Фильтр эндпоинта...',
      httpMethod: 'HTTP метод',
      allMethods: 'Все методы',
      statusCode: 'Код статуса',
      statusCodePlaceholder: 'например, 200, 404',
      totalRequests: 'Всего запросов',
      successRate: 'Процент успеха',
      avgResponseTime: 'Среднее время ответа',
      performancePercentiles: 'Процентили производительности',
      p50Median: 'P50 (Медиана)',
      p95: 'P95',
      p99: 'P99',
      dataTransfer: 'Передача данных',
      totalTransferred: 'Всего передано',
      failedRequests: 'Неудачные запросы',
      errorRequests: 'Запросы с ошибками',
      responseTimeRange: 'Диапазон времени ответа',
      fastest: 'Быстрейший',
      average: 'Средний',
      slowest: 'Медленнейший',
      aiModelUsage: 'Использование AI модели',
      totalAiRequests: 'Всего запросов',
      avgTokens: 'Среднее токенов',
      totalTokens: 'Всего токенов',
      tokenRange: 'Диапазон токенов',
      topEndpoints: 'Топ эндпоинты',
      requests: 'запросов',
      avg: 'среднее',
      error: 'ошибка',
      recentErrors: 'Последние ошибки',
      time: 'Время',
      method: 'Метод',
      status: 'Статус',
      responseTime: 'Время ответа',
      user: 'Пользователь',
      errorMessage: 'Ошибка',
      anonymous: 'Анонимный',
      noErrorMessage: 'Нет сообщения об ошибке'
    },
    // Pipelines page
    pipelines: {
      title: 'Продукты',
      loadingProducts: 'Загрузка продуктов...',
      error: 'Ошибка',
      addNewProduct: 'Добавить новый продукт',
      noProductsConfigured: 'Продукты еще не настроены. Нажмите "Добавить новый продукт" для начала.',
      productName: 'Название продукта',
      discoveryPhase: 'Фаза исследования',
      structuringPhase: 'Фаза структурирования',
      actions: 'Действия',
      editProduct: 'Редактировать продукт',
      deleteProduct: 'Удалить продукт',
      deleteConfirmation: 'Вы уверены, что хотите удалить продукт "{name}"? Это действие нельзя отменить.',
      productDeleted: 'Продукт успешно удален!',
      failedToDelete: 'Не удалось удалить продукт.',
      loadingProductsPage: 'Загрузка страницы продуктов...'
    },
    // Add to project page
    addToProject: {
      title: 'Создать новый экземпляр продукта',
      error: 'Ошибка',
      selectProductType: '1. Выберите тип продукта',
      noProductTypes: 'Типы продуктов недоступны. Пожалуйста, добавьте шаблоны дизайна в панели администратора.',
      configureProject: '2. Настройте проект',
      addToProject: 'Добавить в проект:',
      selectOrCreateProject: '-- Выберите или создайте проект --',
      loadingProjects: 'Загрузка проектов...',
      createNewProject: '--- Создать новый проект ---',
      newProjectName: 'Название нового проекта:',
      enterNewProjectName: 'Введите название для нового проекта',
      advancedOptions: 'Дополнительные опции',
      instanceName: 'Название экземпляра (необязательно):',
      instanceNamePlaceholder: 'По умолчанию "{name}" или заголовок ответа AI',
      instanceNameHelp: 'Если оставить пустым, будет использоваться название продукта (или заголовок AI).',
      createProductInstance: 'Создать экземпляр продукта',
      creating: 'Создание...',
      loadingPageDetails: 'Загрузка деталей страницы...'
    },
    // Module and Lesson Settings Modals
    modals: {
      moduleSettings: {
        title: 'Настройки модуля',
        subtitle: 'Настройте качество производства для',
        tier: 'Уровень',
        contentExamples: 'Примеры контента',
        hoursRange: 'Диапазон часов',
        example: 'Пример',
        moduleQualityTier: 'Уровень качества модуля установлен на',
        perCompletionHour: 'ч за час завершения',
        cancel: 'Отмена',
        saveChanges: 'Сохранить изменения',
        saving: 'Сохранение...',
        failedToSave: 'Не удалось сохранить настройки уровня модуля'
      },
      lessonSettings: {
        title: 'Настройки урока',
        subtitle: 'Настройте качество производства для',
        tier: 'Уровень',
        contentExamples: 'Примеры контента',
        hoursRange: 'Диапазон часов',
        example: 'Пример',
        lessonQualityTier: 'Уровень качества урока установлен на',
        perCompletionHour: 'ч за час завершения',
        cancel: 'Отмена',
        saveChanges: 'Сохранить изменения',
        saving: 'Сохранение...',
        failedToSave: 'Не удалось сохранить настройки уровня урока'
      }
    }
  }
}; 