export const en = {
  common: {
    course: "COURSE",
    lesson: "LESSON",
    save: "Save",
    saving: "Saving...",
    confirmCancelEdit: "Are you sure you want to cancel? Any unsaved changes will be lost.",
    errorDetails: "Details:",
    sourceChatTooltip: "Go to the chat where this content was generated",
    sourceChat: "Source Chat",
    cancelEdit: "Cancel",
    edit: "Edit",
    downloadPdf: "Download PDF",
    saveErrorTitle: "Save Error:",
    rendering: "Rendering content..."
  },
  qualityTiers: {
    basic: "Basic",
    interactive: "Interactive",
    advanced: "Advanced",
    immersive: "Immersive"
  },
  videoLesson: {
    slide: "Slide",
    displayedTextLabel: "Displayed text",
    displayingImageLabel: "Image (description)",
    displayedVideoLabel: "Video (description)",
    voiceoverTextLabel: "Voiceover text",
    noSlides: "No slides found.",
    editMainTitlePlaceholder: "Video Lesson Title",
    editSlideTitlePlaceholder: "Slide Title",
    editTextPlaceholder: "Short sentence for the slide...",
    editImageDescPlaceholder: "Concise image description...",
    editVideoDescPlaceholder: "Concise video/animation description...",
    editVoiceoverPlaceholder: "Voiceover text (max 3 sentences)...",
    emptyContent: "...",
    deleteError: "Error deleting projects: {error}",
    updateError: "Error updating name: {error}",
    errorLoadingProjectTitle: "Error Loading Project",
    errorLoadingProjectMessage: "There was a problem fetching the project data. Please try again later.",
    returnToProjects: "Return to Projects List",
    projectNotFoundTitle: "Project Not Found",
    projectNotFoundMessage: "The project you are looking for could not be found or you may not have permission to view it.",
    allProjects: "All Projects",
    loadingProject: "Loading Project..."
  },
  quiz: {
    quizTitle: "Quiz Title",
    question: "Question",
    correctAnswer: "Correct Answer",
    correctAnswers: "Correct Answers",
    acceptableAnswers: "Acceptable Answers",
    prompts: "Items",
    options: "Options",
    correctMatches: "Correct Matches",
    itemsToSort: "Items to Sort",
    explanation: "Explanation",
    selectOption: "Select an option",
    multipleChoice: "Multiple Choice",
    multiSelect: "Multi-Select",
    matching: "Matching",
    sorting: "Sorting",
    openAnswer: "Open Answer",
    answerKey: "Answer Key",
    correctOrder: "Correct Order",
    emptyContent: "...",
  },
  modals: {
    createLesson: {
      title: "Create a Lesson",
      lessonPresentation: "Lesson Presentation",
      videoLessonScript: "Video Lesson Script",
      videoLesson: "Video Lesson",
      comingSoon: "Coming soon!",
      errorNoSessionId: "Error: Source chat session ID is not available. Cannot create lesson."
    },
    createTest: {
      title: "Create Test",
      quiz: "Quiz",
      quizTooltip: "Create a quiz for this lesson",
      errorNoSessionId: "Error: Source chat session ID is not available. Cannot create test."
    },
    createContent: {
      title: "Create Content",
      lessonTypes: "Lesson Types",
      assessmentTypes: "Assessment Types",
      createNewLesson: "Create New Lesson"
    },
    folderSettings: {
      title: "Folder Settings",
      subtitle: "Configure production quality for",
      basic: "Basic",
      basicDescription: "Simple e-learning content with essential features for straightforward training needs",
      interactive: "Interactive",
      interactiveDescription: "Engaging content with interactive elements for better learner engagement and retention",
      advanced: "Advanced",
      advancedDescription: "Sophisticated learning experiences with personalized content and advanced interactivity",
      immersive: "Immersive",
      immersiveDescription: "Premium learning experiences with cutting-edge technology for maximum engagement",
      features: "Features",
      hoursRange: "Hours Range",
      customRate: "Custom Rate",
      example: "Example",
      cancel: "Cancel",
      saveChanges: "Save Changes",
      saving: "Saving...",
      failedToSave: "Failed to save folder tier setting"
    },
    projectSettings: {
      title: "Course Settings",
      subtitle: "Configure production quality for"
    },
    clientName: {
      title: "Export to PDF",
      subtitle: "Generate a professional PDF report",
      clientNameLabel: "Client Name (Optional)",
      clientNamePlaceholder: "Enter client name...",
      selectFoldersProducts: "Select Folders & Products",
      folders: "Folders",
      unassignedProducts: "Unassigned Products",
      selected: "selected",
      skip: "Skip",
      generate: "Generate PDF",
      generating: "Generating..."
    },
    folderExport: {
      title: "Generating PDF",
      subtitle: "Creating PDF export for folder",
      description: "This may take a few moments depending on the number of files..."
    },
    moduleSettings: {
      title: 'Module Settings',
      subtitle: 'Configure production quality for',
      tier: 'Tier',
      contentExamples: 'Content Examples',
      hoursRange: 'Hours Range',
      example: 'Example',
      moduleQualityTier: 'Module quality tier set to',
      perCompletionHour: 'h per completion hour',
      cancel: 'Cancel',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      failedToSave: 'Failed to save module tier setting'
    },
    lessonSettings: {
      title: 'Lesson Settings',
      subtitle: 'Configure production quality for',
      tier: 'Tier',
      contentExamples: 'Content Examples',
      hoursRange: 'Hours Range',
      example: 'Example',
      lessonQualityTier: 'Lesson quality tier set to',
      perCompletionHour: 'h per completion hour',
      cancel: 'Cancel',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      failedToSave: 'Failed to save lesson tier setting'
    }
  },
  projects: {
    loading: "Loading products...",
    error: "Error: {error}",
    noProductsSelected: "No valid products selected for deletion.",
    confirmDelete: "Are you sure you want to delete {count} selected products?",
    deleteError: "Error deleting projects: {error}",
    updateError: "Error updating name: {error}",
    errorLoadingProjectTitle: "Error Loading Project",
    errorLoadingProjectMessage: "There was a problem fetching the project data. Please try again later.",
    returnToProjects: "Return to Projects List",
    projectNotFoundTitle: "Project Not Found",
    projectNotFoundMessage: "The project you are looking for could not be found or you may not have permission to view it.",
    allProjects: "All Projects",
    loadingProject: "Loading Project..."
  },
  // New translations for the projects page interface
  interface: {
    // Header
    products: "Products",
    trash: "Trash",
    getUnlimitedAI: "Get unlimited AI",
    credits: "credits",
    loading: "Loading...",
    
    // Sidebar
    jumpTo: "Jump to",
    keyboardShortcut: "⌘+K",
    sharedWithYou: "Shared with you",
    folders: "Folders",
    createOrJoinFolder: "Create or join a folder",
    organizeProducts: "Organize your products by topic and share them with your team",
    templates: "Templates",
    themes: "Themes",
    
    // Main content
    all: "All",
    trainingPlans: "Training Plans",
    pdfLessons: "PDF Lessons",
    videoLessons: "Video Lessons",
    textPresentations: "Text Presentations",
    quizzes: "Quizzes",
    sort: "Sort",
    columns: "Columns",
    grid: "Grid",
    list: "List",
    noProjectsFound: "No projects found.",
    
    // Table headers
    title: "Title",
    created: "Created",
    creator: "Creator",
    numberOfLessons: "Number of Lessons",
    estCreationTime: "Est. Creation Time",
    estCompletionTime: "Est. Completion Time",
    actions: "Actions",
    
    // Project actions
    rename: "Rename",
    duplicate: "Duplicate",
    share: "Share",
    export: "Export",
    delete: "Delete",
    deleting: "Deleting...",
    restore: "Restore",
    deletePermanently: "Delete Permanently",
    moveToFolder: "Move to Folder",
    settings: "Settings",
    
    // Folder actions
    folderSettings: "Folder Settings",
    deleteFolder: "Delete Folder",
    moveFolder: "Move Folder",
    
    // Modals
    createFolder: "Create or join a folder",
    createFolderDescription: "You can join a folder to keep track of what folks are working on.",
    findOrCreateFolder: "Find or create a new folder",
    createFolderButton: "Create folder",
    createAtTopLevel: "Create at top level (no parent folder)",
    allFolders: "All folders",
    noFoldersFound: "No folders found.",
    done: "Done",
    
    // Quality tiers
    basic: "Basic",
    interactive: "Interactive", 
    advanced: "Advanced",
    immersive: "Immersive",
    
    // Time units
    hours: "h",
    minutes: "min",
    
    // Status
    private: "Private",
    createdByYou: "Created by you",
    you: "You",
    item: "item",
    items: "items",
    loadingProjects: "Loading projects...",
    
    // Help button
    help: "Help",
    
    // Language selector
    language: "Language",
    english: "English",
    ukrainian: "Ukrainian", 
    spanish: "Spanish",
    russian: "Russian",

    // Create page
    createWithAI: "Create with AI",
    howToGetStarted: "How would you like to get started?",
    home: "Home",
    pasteInText: "Paste in text",
    pasteInTextDescription: "Create from notes, an outline, or existing content",
    generateDescription: "Create from a one-line prompt in a few seconds",
    importFileOrUrl: "Import file or URL",
    importFileOrUrlDescription: "Enhance existing docs, presentations, or webpages",
    popular: "POPULAR",

    // Projects table toolbar
    createNew: "Create new",
    import: "Import",
    showColumns: "Show columns",
    numberOfLessonsShort: "Number of lessons",
    estCreationTimeShort: "Est. creation time",
    estCompletionTimeShort: "Est. completion time",

    // Filters
    recentlyViewed: "Recently viewed",
    favorites: "Favorites",

    // Authentication
    checkingAuthentication: "Checking authentication...",

    // Block settings
    blockSettings: "Block Settings",
    noSettingsAvailable: "No settings available for this block type.",
    close: "Close",

    // Generate page
    generate: {
      subtitle: "What would you like to create today?",
      subtitleFromFiles: "Create content from your selected files",
      subtitleFromText: "Create content from your text",
      aiWillUseDocuments: "The AI will use your selected documents as source material to create educational content.",
      aiWillUseTextAsContext: "The AI will use your text as reference material and context to create new educational content.",
      aiWillBuildUponText: "The AI will build upon your existing content structure, enhancing and formatting it into a comprehensive educational product.",
      presentationQuestion: "Do you want to create a presentation from an existing Course Outline?",
      quizQuestion: "Do you want to create a quiz from an existing Course Outline?",
      onePagerQuestion: "Do you want to create a one-pager from an existing Course Outline?",
      promptPlaceholder: "Describe what you'd like to make"
    },

    // Pipelines
    pipelines: {
      deleteConfirmation: "Are you sure you want to delete the product \"{name}\"? This action cannot be undone."
    },

    // Project View Page
    projectView: {
      loadingProjectDetails: "Loading project details...",
      backButton: "Back",
      openProducts: "Open Products",
      downloadPdf: "Download PDF",
      smartEdit: "Smart Edit",
      editContent: "Edit Content",
      saveContent: "Save Content",
      saving: "Saving...",
      columns: "Columns",
      moveToTrash: "Move to Trash",
      visibleColumns: "Visible Columns",
      loadingContentDisplay: "Loading content display...",
      contentDetails: "Content Details",
      utilizesDesignComponent: "This project instance utilizes the design component:",
      unknownComponent: "Unknown",
      specificUIForDirectViewing: "A specific UI for direct viewing or editing this component type might not yet be fully implemented on this page.",
      editGeneralDetails: "You can typically edit the project's general details (like name or design template) via the main project editing page.",
      toggleRawContentPreview: "Toggle Raw Content Preview",
      noSlideDeckData: "No slide deck data available",
      projectDataNotLoaded: "Project data not loaded yet.",
      contentEditingNotSupported: "Content editing is currently supported for {types} types on this page.",
      projectDataOrIdNotAvailable: "Project data or ID is not available for download.",
      errorProjectIdOrDataMissing: "Error: Project ID or data is missing.",
      errorProjectInstanceDataNotLoaded: "Error: Project instance data not loaded.",
      errorCannotSaveComponentType: "Error: Cannot save. Content editing for this component type is not supported here.",
      contentSavedSuccessfully: "Content saved successfully!",
      saveFailed: "Save failed: {error}",
      errorProjectIdOrEditableDataMissing: "Project ID or editable data is missing.",
      errorProjectInstanceDataNotLoadedForSave: "Project instance data not loaded.",
      errorContentEditingNotSupportedForSave: "Content editing is not supported for this component type on this page.",
      errorFailedToSaveModuleTierSetting: "Failed to save module tier setting",
      errorFailedToSaveLessonTierSetting: "Failed to save lesson tier setting",
      errorFailedToMoveToTrash: "Could not move to trash",
      // New translations for missing strings
      invalidProjectIdFormat: "Invalid Project ID format.",
      couldNotFetchFullProjectsList: "Could not fetch full projects list to determine parent project name.",
      newTrainingPlanTitle: "New Training Plan",
      newPdfLessonTitle: "New PDF Lesson",
      newSlideDeckTitle: "New Slide Deck",
      newVideoLessonTitle: "New Video Lesson",
      newQuizTitle: "New Quiz",
      newTextPresentationTitle: "New Text Presentation",
      unknownErrorOccurred: "An unknown error occurred while fetching project data.",
      projectIdMissing: "Project ID is missing in URL.",
      projectIdOrEditableDataMissing: "Project ID or editable data is missing.",
      validationError: "Validation error",
      validationErrors: "Validation errors",
      couldNotSaveData: "Could not save data.",
      contentEditingSupported: "Content editing is currently supported for",
      typesOnThisPage: "types on this page.",
      projectDataOrIdNotAvailableForDownload: "Project data or ID is not available for download.",
      failedToMoveToTrash: "Failed to move to trash",
      couldNotMoveToTrash: "Could not move to trash",
      loadingProject: "Loading project details...",
      errorLoadingProject: "Error: Failed to load project data.",
      projectNotFound: "Project not found or data unavailable.",
      project: "Project",
      configureVisibleColumns: "Configure visible columns",
      moveToTrashTooltip: "Move this product to Trash"
    }
  }
}; 