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
    close: "Закрыть"
  }
}; 