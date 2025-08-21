// Test script to verify frontend logging works correctly

console.log('[FRONTEND_DEBUG] === TEST FRONTEND LOGGING ===');

// Mock data similar to what would come from API
const mockData = {
  projects: [
    {
      id: 1,
      title: 'Basic Course',
      project_name: 'Basic Course',
      microproduct_name: 'Basic Course',
      quality_tier: 'basic',
      total_completion_time: 60,
      total_creation_hours: 120,
      folder_id: 1,
      created_at: '2024-01-01'
    },
    {
      id: 2,
      title: 'Interactive Course',
      project_name: 'Interactive Course',
      microproduct_name: 'Interactive Course',
      quality_tier: 'interactive',
      total_completion_time: 120,
      total_creation_hours: 300,
      folder_id: 1,
      created_at: '2024-01-02'
    },
    {
      id: 3,
      title: 'Advanced Course',
      project_name: 'Advanced Course',
      microproduct_name: 'Advanced Course',
      quality_tier: 'advanced',
      total_completion_time: 180,
      total_creation_hours: 720,
      folder_id: 1,
      created_at: '2024-01-03'
    },
    {
      id: 4,
      title: 'Immersive Course',
      project_name: 'Immersive Course',
      microproduct_name: 'Immersive Course',
      quality_tier: 'immersive',
      total_completion_time: 240,
      total_creation_hours: 1200,
      folder_id: 1,
      created_at: '2024-01-04'
    }
  ],
  folders: []
};

console.log('[FRONTEND_DEBUG] === BLOCK 2 QUALITY TIER SUMS START ===');
console.log('[FRONTEND_DEBUG] Input data:', mockData);

// Simulate the quality tier processing logic
const qualityTierSums = {
  'basic': { completionTime: 0, creationTime: 0 },
  'interactive': { completionTime: 0, creationTime: 0 },
  'advanced': { completionTime: 0, creationTime: 0 },
  'immersive': { completionTime: 0, creationTime: 0 }
};

const allProjects = mockData.projects || [];
console.log('[FRONTEND_DEBUG] Processing projects for quality tier sums:', allProjects.length);
console.log('[FRONTEND_DEBUG] Raw projects data:', allProjects);

// Detailed logging of each project
console.log('[FRONTEND_DEBUG] === DETAILED PROJECT ANALYSIS ===');
allProjects.forEach((project, index) => {
  console.log(`[FRONTEND_DEBUG] Project ${index + 1}:`, {
    id: project.id,
    title: project.project_name || project.microproduct_name || 'Untitled',
    quality_tier: project.quality_tier,
    total_completion_time: project.total_completion_time,
    total_creation_hours: project.total_creation_hours,
    folder_id: project.folder_id,
    created_at: project.created_at
  });
});
console.log('[FRONTEND_DEBUG] === END PROJECT ANALYSIS ===');

// Quality tier processing with detailed logging
console.log('[FRONTEND_DEBUG] === QUALITY TIER PROCESSING ===');

const getEffectiveQualityTier = (project, folderQualityTier = 'interactive') => {
  if (project.quality_tier) {
    const tier = project.quality_tier.toLowerCase();
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
  }
  return 'interactive';
};

allProjects.forEach((project) => {
  const effectiveTier = getEffectiveQualityTier(project, 'interactive');
  console.log(`[FRONTEND_DEBUG] Project ${project.id}: quality_tier=${project.quality_tier}, effective_tier=${effectiveTier}, completion_time=${project.total_completion_time}, creation_hours=${project.total_creation_hours}`);
  
  qualityTierSums[effectiveTier].completionTime += project.total_completion_time || 0;
  qualityTierSums[effectiveTier].creationTime += project.total_creation_hours || 0;
});

console.log('[FRONTEND_DEBUG] Final quality tier sums:', qualityTierSums);
console.log('[FRONTEND_DEBUG] === END QUALITY TIER PROCESSING ===');

// Simulate rendering
const qualityLevels = [
  { key: 'basic', name: 'Level 1 - Basic' },
  { key: 'interactive', name: 'Level 2 - Interactive' },
  { key: 'advanced', name: 'Level 3 - Advanced' },
  { key: 'immersive', name: 'Level 4 - Immersive' }
];

qualityLevels.forEach((level) => {
  const tierData = qualityTierSums[level.key];
  console.log(`[FRONTEND_DEBUG] Rendering row for ${level.name}: completionTime=${tierData.completionTime}, creationTime=${tierData.creationTime}`);
});

console.log('[FRONTEND_DEBUG] === TEST COMPLETED ==='); 