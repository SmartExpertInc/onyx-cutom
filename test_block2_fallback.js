// Test Block 2 fallback logic (when microproduct_content is not available)
console.log('🧪 Testing Block 2 Fallback Logic');

// Simulate projects without microproduct_content (like in real preview)
const projectsWithoutMicroproduct = [
  {
    id: 1,
    name: "Project 1",
    quality_tier: "basic",
    total_completion_time: 90,
    total_creation_hours: 2
  },
  {
    id: 2,
    name: "Project 2", 
    quality_tier: "advanced",
    total_completion_time: 120,
    total_creation_hours: 3
  },
  {
    id: 3,
    name: "Project 3",
    quality_tier: "interactive", 
    total_completion_time: 60,
    total_creation_hours: 1
  },
  {
    id: 4,
    name: "Project 4",
    quality_tier: "immersive",
    total_completion_time: 180,
    total_creation_hours: 4
  }
];

// Copy the exact calculation logic from ProjectsTable.tsx
const calculateQualityTierSums = (projects) => {
  console.log('🔧 calculateQualityTierSums: Starting calculation with', projects.length, 'projects');
  
  const qualityTierData = {
    'basic': { completion_time: 0, creation_time: 0 },
    'interactive': { completion_time: 0, creation_time: 0 },
    'advanced': { completion_time: 0, creation_time: 0 },
    'immersive': { completion_time: 0, creation_time: 0 }
  };
  
  const getEffectiveQualityTier = (lessonQualityTier, sectionQualityTier, projectQualityTier, folderQualityTier = 'interactive') => {
    const tier = (lessonQualityTier || sectionQualityTier || projectQualityTier || folderQualityTier || 'interactive').toLowerCase();
    
    const tierMapping = {
      'basic': 'basic',
      'interactive': 'interactive', 
      'advanced': 'advanced',
      'immersive': 'immersive',
      'starter': 'basic',
      'medium': 'interactive',
      'professional': 'immersive'
    };
    return tierMapping[tier] || 'interactive';
  };
  
  projects.forEach((project, projectIndex) => {
    console.log(`🔧 Processing project ${projectIndex + 1}:`, project.name || 'Unnamed project');
    console.log(`🔧 Project structure:`, {
      hasQualityTier: !!project.quality_tier,
      hasMicroproductContent: 'microproduct_content' in project,
      hasSections: project.microproduct_content?.sections?.length || 0
    });
    
    const projectQualityTier = project.quality_tier || null;
    
    const microproductContent = 'microproduct_content' in project ? project.microproduct_content : null;
    if (microproductContent && typeof microproductContent === 'object' && microproductContent.sections) {
      const sections = microproductContent.sections;
      if (Array.isArray(sections)) {
        sections.forEach((section) => {
          if (section && typeof section === 'object' && section.lessons) {
            const sectionQualityTier = section.quality_tier;
            const lessons = section.lessons;
            if (Array.isArray(lessons)) {
              lessons.forEach((lesson) => {
                if (lesson && typeof lesson === 'object') {
                  const lessonQualityTier = lesson.quality_tier || null;
                  const effectiveTier = getEffectiveQualityTier(
                    lessonQualityTier, 
                    sectionQualityTier || null, 
                    projectQualityTier, 
                    'interactive'
                  );
                  
                  let lessonCompletionTimeRaw = lesson.completionTime || 0;
                  const lessonCreationHours = lesson.hours || 0;
                  
                  let lessonCompletionTime;
                  if (typeof lessonCompletionTimeRaw === 'string') {
                    lessonCompletionTime = parseInt(lessonCompletionTimeRaw.replace('m', '')) || 0;
                  } else {
                    lessonCompletionTime = parseInt(lessonCompletionTimeRaw.toString()) || 0;
                  }
                  
                  console.log(`🔧 Lesson: tier=${effectiveTier}, completion=${lessonCompletionTime}m, creation=${lessonCreationHours}h`);
                  
                  qualityTierData[effectiveTier].completion_time += lessonCompletionTime;
                  qualityTierData[effectiveTier].creation_time += lessonCreationHours * 60;
                }
              });
            }
          }
        });
      }
    } else {
      // Fallback: Use project-level data if microproduct_content is not available
      console.log(`🔧 Fallback: Using project-level data for ${project.name}`);
      const effectiveTier = getEffectiveQualityTier(
        null, 
        null, 
        projectQualityTier, 
        'interactive'
      );
      
      // Use project totals
      const projectCompletionTime = project.total_completion_time || 0;
      const projectCreationHours = project.total_creation_hours || 0;
      
      console.log(`🔧 Project fallback: tier=${effectiveTier}, completion=${projectCompletionTime}m, creation=${projectCreationHours}h`);
      
      qualityTierData[effectiveTier].completion_time += projectCompletionTime;
      qualityTierData[effectiveTier].creation_time += projectCreationHours * 60;
    }
  });
  
  console.log('🔧 calculateQualityTierSums: Final result:', qualityTierData);
  return qualityTierData;
};

// Test the fallback calculation
console.log('📊 Testing with projects without microproduct_content...');
const result = calculateQualityTierSums(projectsWithoutMicroproduct);

console.log('\n🔍 Block 2 Results (Fallback):');
Object.entries(result).forEach(([tier, data]) => {
  const completionFormatted = data.completion_time > 0 ? 
    `${Math.floor(data.completion_time / 60)}h ${data.completion_time % 60}m` : '-';
  const creationFormatted = data.creation_time > 0 ? 
    `${Math.floor(data.creation_time / 60)}h ${data.creation_time % 60}m` : '-';
  
  console.log(`${tier}: ${completionFormatted} / ${creationFormatted}`);
});

console.log('\n✅ Fallback test completed. Each tier should have different values based on project quality_tier.'); 