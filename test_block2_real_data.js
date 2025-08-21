// Test Block 2 with real data structure
console.log('🧪 Testing Block 2 with Real Data Structure');

// Simulate real project data structure
const realProjects = [
  {
    id: 1,
    name: "Project 1",
    quality_tier: "basic",
    total_completion_time: 90,
    total_creation_hours: 2,
    microproduct_content: {
      sections: [
        {
          quality_tier: "basic",
          lessons: [
            {
              quality_tier: "basic",
              completionTime: "30m",
              hours: 1
            },
            {
              quality_tier: "interactive", 
              completionTime: "60m",
              hours: 1
            }
          ]
        }
      ]
    }
  },
  {
    id: 2,
    name: "Project 2", 
    quality_tier: "advanced",
    total_completion_time: 120,
    total_creation_hours: 3,
    microproduct_content: {
      sections: [
        {
          quality_tier: "advanced",
          lessons: [
            {
              quality_tier: "advanced",
              completionTime: "45m", 
              hours: 2
            },
            {
              quality_tier: "immersive",
              completionTime: "75m",
              hours: 1
            }
          ]
        }
      ]
    }
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
    }
  });
  
  console.log('🔧 calculateQualityTierSums: Final result:', qualityTierData);
  return qualityTierData;
};

// Test the calculation
console.log('📊 Testing with real project data...');
const result = calculateQualityTierSums(realProjects);

console.log('\n🔍 Block 2 Results:');
Object.entries(result).forEach(([tier, data]) => {
  const completionFormatted = data.completion_time > 0 ? 
    `${Math.floor(data.completion_time / 60)}h ${data.completion_time % 60}m` : '-';
  const creationFormatted = data.creation_time > 0 ? 
    `${Math.floor(data.creation_time / 60)}h ${data.creation_time % 60}m` : '-';
  
  console.log(`${tier}: ${completionFormatted} / ${creationFormatted}`);
});

console.log('\n✅ Test completed. Each tier should have different values.'); 