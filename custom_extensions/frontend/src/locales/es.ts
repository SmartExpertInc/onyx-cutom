export const es = {
  common: {
    course: "CURSO",
    lesson: "LECCIÓN",
    save: "Guardar",
    saving: "Guardando...",
    confirmCancelEdit: "¿Estás seguro de que quieres cancelar? Cualquier cambio no guardado se perderá.",
    errorDetails: "Detalles:",
    sourceChatTooltip: "Ir al chat donde se generó este contenido",
    sourceChat: "Chat de origen",
    cancelEdit: "Cancelar",
    edit: "Editar",
    downloadPdf: "Descargar PDF",
    saveErrorTitle: "Error al guardar:",
    rendering: "Renderizando contenido..."
  },
  trainingPlan: {
    moduleAndLessons: "Módulo / Lección",
    knowledgeCheck: "Verificación de conocimientos",
    contentAvailability: "Disponibilidad de contenido",
    source: "Fuente de información",
    time: "Tiempo",
    qualityTier: "Nivel de calidad",
    timeUnitSingular: "h",
    timeUnitDecimalPlural: "h",
    timeUnitGeneralPlural: "h"
  },
  qualityTiers: {
    basic: "Básico",
    interactive: "Interactivo",
    advanced: "Avanzado",
    immersive: "Inmersivo"
  },
  videoLesson: {
    slide: "Diapositiva",
    displayedTextLabel: "Texto mostrado",
    displayingImageLabel: "Imagen (descripción)",
    displayedVideoLabel: "Video (descripción)",
    voiceoverTextLabel: "Texto de narración",
    noSlides: "No se encontraron diapositivas.",
    editMainTitlePlaceholder: "Título de la lección de video",
    editSlideTitlePlaceholder: "Título de la diapositiva",
    editTextPlaceholder: "Frase corta para la diapositiva...",
    editImageDescPlaceholder: "Descripción concisa de la imagen...",
    editVideoDescPlaceholder: "Descripción concisa del video/animación...",
    editVoiceoverPlaceholder: "Texto de narración (máx. 3 frases)...",
    emptyContent: "...",
  },
  quiz: {
    quizTitle: "Título del cuestionario",
    question: "Pregunta",
    correctAnswer: "Respuesta correcta",
    correctAnswers: "Respuestas correctas",
    acceptableAnswers: "Respuestas aceptables",
    prompts: "Elementos",
    options: "Opciones",
    correctMatches: "Coincidencias correctas",
    itemsToSort: "Elementos para ordenar",
    explanation: "Explicación",
    selectOption: "Seleccionar una opción",
    multipleChoice: "Opción múltiple",
    multiSelect: "Selección múltiple",
    matching: "Coincidencia",
    sorting: "Ordenamiento",
    openAnswer: "Respuesta abierta",
    answerKey: "Clave de respuestas",
    correctOrder: "Orden correcto",
    emptyContent: "...",
  },
  modals: {
    createLesson: {
      title: "Crear una lección",
      lessonPresentation: "Presentación de la lección",
      videoLessonScript: "Guión de lección de video",
      videoLesson: "Lección de video",
      comingSoon: "¡Próximamente!",
      errorNoSessionId: "Error: ID de sesión de chat no disponible. No se puede crear la lección."
    },
    createTest: {
      title: "Crear prueba",
      quiz: "Cuestionario",
      quizTooltip: "Crear un cuestionario para esta lección",
      errorNoSessionId: "Error: ID de sesión de chat no disponible. No se puede crear la prueba."
    },
    createContent: {
      title: "Crear contenido",
      lessonTypes: "Tipos de lecciones",
      assessmentTypes: "Tipos de evaluación",
      createNewLesson: "Crear nueva lección"
    },
    folderSettings: {
      title: "Configuración de carpeta",
      subtitle: "Configurar calidad de producción para",
      basic: "Básico",
      basicDescription: "Contenido de e-learning simple con funciones esenciales para necesidades de entrenamiento directas",
      interactive: "Interactivo",
      interactiveDescription: "Contenido atractivo con elementos interactivos para mejor compromiso y retención del aprendiz",
      advanced: "Avanzado",
      advancedDescription: "Experiencias de aprendizaje sofisticadas con contenido personalizado e interactividad avanzada",
      immersive: "Inmersivo",
      immersiveDescription: "Experiencias de aprendizaje premium con tecnología de vanguardia para máximo compromiso",
      features: "Características",
      hoursRange: "Rango de horas",
      customRate: "Tasa personalizada",
      example: "Ejemplo",
      cancel: "Cancelar",
      saveChanges: "Guardar cambios",
      saving: "Guardando..."
    },
    projectSettings: {
      title: "Configuración del curso",
      subtitle: "Configurar calidad de producción para"
    },
    clientName: {
      title: "Exportar a PDF",
      subtitle: "Generar un reporte PDF profesional",
      clientNameLabel: "Nombre del cliente (Opcional)",
      clientNamePlaceholder: "Ingrese el nombre del cliente...",
      selectFoldersProducts: "Seleccionar carpetas y productos",
      folders: "Carpetas",
      unassignedProducts: "Productos sin asignar",
      selected: "seleccionado",
      skip: "Omitir",
      generate: "Generar PDF",
      generating: "Generando..."
    },
    folderExport: {
      title: "Generando PDF",
      subtitle: "Creando exportación PDF para carpeta",
      description: "Esto puede tomar unos momentos dependiendo del número de archivos..."
    }
  },
  projects: {
    loading: "Cargando productos...",
    error: "Error: {error}",
    noProductsSelected: "No hay productos válidos seleccionados para eliminar.",
    confirmDelete: "¿Estás seguro de que quieres eliminar {count} productos seleccionados?",
    deleteError: "Error al eliminar proyectos: {error}",
    updateError: "Error al actualizar nombre: {error}",
    errorLoadingProjectTitle: "Error al cargar proyecto",
    errorLoadingProjectMessage: "Hubo un problema al obtener los datos del proyecto. Por favor, inténtalo de nuevo más tarde.",
    returnToProjects: "Volver a la lista de proyectos",
    projectNotFoundTitle: "Proyecto no encontrado",
    projectNotFoundMessage: "El proyecto que buscas no se pudo encontrar o no tienes permiso para verlo.",
    allProjects: "Todos los proyectos",
    loadingProject: "Cargando proyecto..."
  },
  // New translations for the projects page interface
  interface: {
    // Header
    products: "Productos",
    trash: "Papelera",
    getUnlimitedAI: "Obtener IA ilimitada",
    credits: "créditos",
    loading: "Cargando...",
    
    // Sidebar
    jumpTo: "Ir a",
    keyboardShortcut: "⌘+K",
    sharedWithYou: "Compartido contigo",
    folders: "Carpetas",
    createOrJoinFolder: "Crear o unirse a una carpeta",
    organizeProducts: "Organiza tus productos por tema y compártelos con tu equipo",
    templates: "Plantillas",
    themes: "Temas",
    
    // Main content
    all: "Todos",
    trainingPlans: "Planes de entrenamiento",
    pdfLessons: "Lecciones PDF",
    videoLessons: "Lecciones de video",
    textPresentations: "Presentaciones de texto",
    quizzes: "Cuestionarios",
    sort: "Ordenar",
    columns: "Columnas",
    grid: "Cuadrícula",
    list: "Lista",
    noProjectsFound: "No se encontraron productos.",
    
    // Table headers
    title: "Título",
    created: "Creado",
    creator: "Creador",
    numberOfLessons: "Número de lecciones",
    estCreationTime: "Tiempo est. creación",
    estCompletionTime: "Tiempo est. finalización",
    actions: "Acciones",
    
    // Project actions
    rename: "Renombrar",
    duplicate: "Duplicar",
    share: "Compartir",
    export: "Exportar",
    delete: "Eliminar",
    deleting: "Eliminando...",
    restore: "Restaurar",
    deletePermanently: "Eliminar permanentemente",
    moveToFolder: "Mover a carpeta",
    settings: "Configuración",
    
    // Folder actions
    folderSettings: "Configuración de carpeta",
    deleteFolder: "Eliminar carpeta",
    moveFolder: "Mover carpeta",
    
    // Modals
    createFolder: "Crear o unirse a una carpeta",
    createFolderDescription: "Puedes unirte a una carpeta para hacer seguimiento de lo que está trabajando la gente.",
    findOrCreateFolder: "Buscar o crear una nueva carpeta",
    createFolderButton: "Crear carpeta",
    createAtTopLevel: "Crear en el nivel superior (sin carpeta padre)",
    allFolders: "Todas las carpetas",
    noFoldersFound: "No se encontraron carpetas.",
    done: "Hecho",
    
    // Quality tiers
    basic: "Básico",
    interactive: "Interactivo",
    advanced: "Avanzado",
    immersive: "Inmersivo",
    
    // Time units
    hours: "h",
    minutes: "min",
    
    // Status
    private: "Privado",
    createdByYou: "Creado por ti",
    
    // Help button
    help: "Ayuda",
    
    // Language selector
    language: "Idioma",
    english: "Inglés",
    ukrainian: "Ucraniano",
    spanish: "Español",
    russian: "Ruso",

    // Create page
    createWithAI: "Crear con IA",
    howToGetStarted: "¿Cómo te gustaría comenzar?",
    home: "Inicio",
    pasteInText: "Pegar texto",
    pasteInTextDescription: "Crear desde notas, un esquema o contenido existente",
    generate: "Generar",
    generateDescription: "Crear desde un prompt de una línea en segundos",
    importFileOrUrl: "Importar archivo o URL",
    importFileOrUrlDescription: "Mejorar documentos, presentaciones o páginas web existentes",
    popular: "POPULAR",

    // Projects table toolbar
    createNew: "Crear nuevo",
    import: "Importar",
    showColumns: "Mostrar columnas",
    numberOfLessonsShort: "Número de lecciones",
    estCreationTimeShort: "Tiempo est. creación",
    estCompletionTimeShort: "Tiempo est. finalización",

    // Filters
    recentlyViewed: "Visto recientemente",
    favorites: "Favoritos",

    // Authentication
    checkingAuthentication: "Verificando autenticación...",

    // Block settings
    blockSettings: "Configuración de bloque",
    noSettingsAvailable: "No hay configuraciones disponibles para este tipo de bloque.",
    close: "Cerrar",
    // Analytics page
    analytics: {
      title: 'Panel de Análisis de Solicitudes',
      subtitle: 'Seguimiento integral de todas las solicitudes API en todas las cuentas',
      loadingData: 'Cargando datos de análisis...',
      errorLoading: 'Error al cargar análisis',
      retry: 'Reintentar',
      noDataAvailable: 'No hay datos de análisis disponibles',
      refreshData: 'Actualizar datos',
      exportCsv: 'Exportar CSV',
      exportJson: 'Exportar JSON',
      activeFilters: 'Filtros activos:',
      clearAllFilters: 'Limpiar todos los filtros',
      filters: 'Filtros',
      dateRange: 'Rango de fechas',
      to: 'a',
      endpoint: 'Endpoint',
      filterEndpoint: 'Filtrar endpoint...',
      httpMethod: 'Método HTTP',
      allMethods: 'Todos los métodos',
      statusCode: 'Código de estado',
      statusCodePlaceholder: 'ej., 200, 404',
      totalRequests: 'Total de solicitudes',
      successRate: 'Tasa de éxito',
      avgResponseTime: 'Tiempo de respuesta promedio',
      performancePercentiles: 'Percentiles de rendimiento',
      p50Median: 'P50 (Mediana)',
      p95: 'P95',
      p99: 'P99',
      dataTransfer: 'Transferencia de datos',
      totalTransferred: 'Total transferido',
      failedRequests: 'Solicitudes fallidas',
      errorRequests: 'Solicitudes con error',
      responseTimeRange: 'Rango de tiempo de respuesta',
      fastest: 'Más rápido',
      average: 'Promedio',
      slowest: 'Más lento',
      aiModelUsage: 'Uso del modelo AI',
      totalAiRequests: 'Total de solicitudes',
      avgTokens: 'Promedio de tokens',
      totalTokens: 'Total de tokens',
      tokenRange: 'Rango de tokens',
      topEndpoints: 'Endpoints principales',
      requests: 'solicitudes',
      avg: 'prom',
      error: 'error',
      recentErrors: 'Errores recientes',
      time: 'Tiempo',
      method: 'Método',
      status: 'Estado',
      responseTime: 'Tiempo de respuesta',
      user: 'Usuario',
      errorMessage: 'Error',
      anonymous: 'Anónimo',
      noErrorMessage: 'Sin mensaje de error'
    },
    // Pipelines page
    pipelines: {
      title: 'Productos',
      loadingProducts: 'Cargando productos...',
      error: 'Error',
      addNewProduct: 'Agregar nuevo producto',
      noProductsConfigured: 'Aún no hay productos configurados. Haga clic en "Agregar nuevo producto" para comenzar.',
      productName: 'Nombre del producto',
      discoveryPhase: 'Fase de descubrimiento',
      structuringPhase: 'Fase de estructuración',
      actions: 'Acciones',
      editProduct: 'Editar producto',
      deleteProduct: 'Eliminar producto',
      deleteConfirmation: '¿Está seguro de que desea eliminar el producto "{name}"? Esta acción no se puede deshacer.',
      productDeleted: '¡Producto eliminado exitosamente!',
      failedToDelete: 'No se pudo eliminar el producto.',
      loadingProductsPage: 'Cargando página de productos...'
    },
    // Add to project page
    addToProject: {
      title: 'Crear nueva instancia de producto',
      error: 'Error',
      selectProductType: '1. Seleccionar tipo de producto',
      noProductTypes: 'No hay tipos de productos disponibles. Por favor, agregue algunas plantillas de diseño en el panel de administración.',
      configureProject: '2. Configurar proyecto',
      addToProject: 'Agregar al proyecto:',
      selectOrCreateProject: '-- Seleccionar o crear proyecto --',
      loadingProjects: 'Cargando proyectos...',
      createNewProject: '--- Crear nuevo proyecto ---',
      newProjectName: 'Nombre del nuevo proyecto:',
      enterNewProjectName: 'Ingrese el nombre para el nuevo proyecto',
      advancedOptions: 'Opciones avanzadas',
      instanceName: 'Nombre de la instancia (opcional):',
      instanceNamePlaceholder: 'Por defecto "{name}" o título de respuesta de IA',
      instanceNameHelp: 'Si se deja en blanco, se usará el nombre del producto (o título de IA).',
      createProductInstance: 'Crear instancia de producto',
      creating: 'Creando...',
      loadingPageDetails: 'Cargando detalles de la página...'
    },
    // Module and Lesson Settings Modals
    modals: {
      // ... existing code ...
      moduleSettings: {
        title: 'Configuración del módulo',
        subtitle: 'Configurar calidad de producción para',
        tier: 'Nivel',
        contentExamples: 'Ejemplos de contenido',
        hoursRange: 'Rango de horas',
        example: 'Ejemplo',
        moduleQualityTier: 'Nivel de calidad del módulo establecido en',
        perCompletionHour: 'h por hora de finalización',
        cancel: 'Cancelar',
        saveChanges: 'Guardar cambios',
        saving: 'Guardando...',
        failedToSave: 'No se pudo guardar la configuración del nivel del módulo'
      },
      lessonSettings: {
        title: 'Configuración de la lección',
        subtitle: 'Configurar calidad de producción para',
        tier: 'Nivel',
        contentExamples: 'Ejemplos de contenido',
        hoursRange: 'Rango de horas',
        example: 'Ejemplo',
        lessonQualityTier: 'Nivel de calidad de la lección establecido en',
        perCompletionHour: 'h por hora de finalización',
        cancel: 'Cancelar',
        saveChanges: 'Guardar cambios',
        saving: 'Guardando...',
        failedToSave: 'No se pudo guardar la configuración del nivel de la lección'
      }
    }
  }
}; 