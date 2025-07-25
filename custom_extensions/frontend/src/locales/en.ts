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
  trainingPlan: {
    moduleAndLessons: "Module / Lesson",
    knowledgeCheck: "Knowledge Check",
    contentAvailability: "Content Availability",
    source: "Information Source",
    time: "Time",
    qualityTier: "Quality Tier",
    timeUnitSingular: "h",
    timeUnitDecimalPlural: "h",
    timeUnitGeneralPlural: "h"
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
    loadingProject: "Loading Project...",
    createTest: {
      title: "Create Test",
      quiz: "Quiz",
      quizTooltip: "Create a quiz for this lesson",
      errorNoSessionId: "Error: Source chat session ID is not available. Cannot create test."
    }
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
    
    // Help button
    help: "Help",
    
    // Language selector
    language: "Language",
    english: "English",
    ukrainian: "Ukrainian", 
    spanish: "Spanish",
    russian: "Russian"
  }
}; 