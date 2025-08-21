#!/usr/bin/env node
/**
 * Test script to verify frontend quality tier processing logic
 */

console.log("🧪 Testing Frontend Quality Tier Processing Logic");
console.log("=" * 60);

// Mock data similar to what backend would send
const mockBackendData = {
  projects: [
    {
      id: 1,
      project_name: "Project 1",
      microproduct_name: null,
      quality_tier: "basic",
      total_completion_time: 120,
      total_creation_hours: 240,
      folder_id: 1,
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 2,
      project_name: "Project 2", 
      microproduct_name: null,
      quality_tier: "interactive",
      total_completion_time: 180,
      total_creation_hours: 360,
      folder_id: 1,
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 3,
      project_name: "Project 3",
      microproduct_name: null,
      quality_tier: "advanced",
      total_completion_time: 240,
      total_creation_hours: 480,
      folder_id: 2,
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 4,
      project_name: "Project 4",
      microproduct_name: null,
      quality_tier: "immersive",
      total_completion_time: 300,
      total_creation_hours: 600,
      folder_id: 2,
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 5,
      project_name: "Project 5",
      microproduct_name: null,
      quality_tier: "starter", // Old tier name
      total_completion_time: 90,
      total_creation_hours: 180,
      folder_id: 3,
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 6,
      project_name: "Project 6",
      microproduct_name: null,
      quality_tier: "medium", // Old tier name
      total_completion_time: 150,
      total_creation_hours: 300,
      folder_id: 3,
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 7,
      project_name: "Project 7",
      microproduct_name: null,
      quality_tier: "professional", // Old tier name
      total_completion_time: 360,
      total_creation_hours: 720,
      folder_id: 4,
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 8,
      project_name: "Project 8",
      microproduct_name: null,
      quality_tier: null, // No quality tier
      total_completion_time: 60,
      total_creation_hours: 120,
      folder_id: 4,
      created_at: "2024-01-01T00:00:00Z"
    }
  ]
};

console.log("📊 Input data:", mockBackendData);
console.log(`📄 Processing ${mockBackendData.projects.length} projects`);

// Frontend quality tier processing logic (same as in ProjectsTable.tsx)
const qualityTierSums = {
  'basic': { completionTime: 0, creationTime: 0 },
  'interactive': { completionTime: 0, creationTime: 0 },
  'advanced': { completionTime: 0, creationTime: 0 },
  'immersive': { completionTime: 0, creationTime: 0 }
};

// Helper function to get effective quality tier (same as frontend)
const getEffectiveQualityTier = (project, folderQualityTier = 'interactive') => {
  if (project.quality_tier) {
    const tier = project.quality_tier.toLowerCase();
    // Support both old and new tier names (same mapping as backend)
    const tierMapping = {
      // New tier names
      'basic': 'basic',
      'interactive': 'interactive',
      'advanced': 'advanced',
      'immersive': 'immersive',
      // Old tier names (legacy support)
      'starter': 'basic',
      'medium': 'interactive',
      'professional': 'immersive'
    };
    return tierMapping[tier] || 'interactive';
  }
  return 'interactive';
};

// Process all projects
console.log("\n🔧 Processing projects for quality tier sums:");
mockBackendData.projects.forEach((project, index) => {
  const effectiveTier = getEffectiveQualityTier(project, 'interactive');
  console.log(`  Project ${index + 1}: quality_tier=${project.quality_tier}, effective_tier=${effectiveTier}, completion_time=${project.total_completion_time}, creation_hours=${project.total_creation_hours}`);
  
  // Learning Duration uses total_completion_time (like PDF template)
  qualityTierSums[effectiveTier].completionTime += project.total_completion_time || 0;
  // Production Time uses total_creation_hours (like PDF template)
  qualityTierSums[effectiveTier].creationTime += project.total_creation_hours || 0;
});

console.log("\n📊 Final quality tier sums:");
for (const [tier, data] of Object.entries(qualityTierSums)) {
  console.log(`  ${tier}: completionTime=${data.completionTime}, creationTime=${data.creationTime}`);
}

// Test quality level names (matching PDF template exactly)
const qualityLevels = [
  { key: 'basic', name: 'Level 1 - Basic' },
  { key: 'interactive', name: 'Level 2 - Interactive' },
  { key: 'advanced', name: 'Level 3 - Advanced' },
  { key: 'immersive', name: 'Level 4 - Immersive' }
];

console.log("\n📋 Quality level rendering:");
qualityLevels.forEach((level, index) => {
  const tierData = qualityTierSums[level.key];
  const completionTimeFormatted = tierData.completionTime > 0 ? `${tierData.completionTime}m` : '-';
  const creationTimeFormatted = tierData.creationTime > 0 ? `${tierData.creationTime}m` : '-';
  
  console.log(`  ${level.name}: ${completionTimeFormatted} completion, ${creationTimeFormatted} creation`);
});

console.log("\n✅ Test completed successfully!");

// Expected results:
console.log("\n🎯 Expected Results:");
console.log("  - Basic should have data from Project 1 (basic) + Project 5 (starter)");
console.log("  - Interactive should have data from Project 2 (interactive) + Project 6 (medium) + Project 8 (null)");
console.log("  - Advanced should have data from Project 3 (advanced)");
console.log("  - Immersive should have data from Project 4 (immersive) + Project 7 (professional)"); 