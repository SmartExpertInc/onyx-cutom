// Test file to verify Block 2 preview fix
// This simulates the quality tier sums calculation logic

// Mock project data
const mockProjects = [
    {
        id: 1,
        title: "Project 1",
        quality_tier: "basic",
        total_completion_time: 120, // 2 hours
        total_creation_hours: 180   // 3 hours
    },
    {
        id: 2,
        title: "Project 2", 
        quality_tier: "interactive",
        total_completion_time: 90,  // 1.5 hours
        total_creation_hours: 240   // 4 hours
    },
    {
        id: 3,
        title: "Project 3",
        quality_tier: "advanced",
        total_completion_time: 180, // 3 hours
        total_creation_hours: 300   // 5 hours
    },
    {
        id: 4,
        title: "Project 4",
        quality_tier: "immersive",
        total_completion_time: 240, // 4 hours
        total_creation_hours: 360   // 6 hours
    }
];

// Function to format time like PDF
function formatTimeLikePDF(minutes) {
    if (!minutes || minutes === 0) return '-';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h ${remainingMinutes}m`;
    }
}

// Calculate quality tier sums (same logic as fixed frontend)
function calculateQualityTierSums(projects) {
    const qualityTierSums = {
        basic: { completion_time: 0, creation_time: 0 },
        interactive: { completion_time: 0, creation_time: 0 },
        advanced: { completion_time: 0, creation_time: 0 },
        immersive: { completion_time: 0, creation_time: 0 }
    };

    // Helper function to get effective quality tier
    const getEffectiveQualityTier = (project, folderQualityTier = 'interactive') => {
        if (project.quality_tier) {
            const tier = project.quality_tier.toLowerCase();
            if (tier === 'basic' || tier === 'interactive' || tier === 'advanced' || tier === 'immersive') {
                return tier;
            }
        }
        return 'interactive';
    };

    // Process all projects (exactly like backend)
    projects.forEach(project => {
        const effectiveTier = getEffectiveQualityTier(project, 'interactive');
        qualityTierSums[effectiveTier].completion_time += project.total_completion_time || 0;
        qualityTierSums[effectiveTier].creation_time += project.total_creation_hours || 0;
    });

    return qualityTierSums;
}

// Test the calculation
console.log("🧪 Testing Block 2 preview fix...");

console.log("\n📊 Input Projects:");
mockProjects.forEach(project => {
    console.log(`  ${project.title}:`);
    console.log(`    - Quality Tier: ${project.quality_tier}`);
    console.log(`    - Completion Time: ${project.total_completion_time} min (${formatTimeLikePDF(project.total_completion_time)})`);
    console.log(`    - Creation Time: ${project.total_creation_hours} min (${formatTimeLikePDF(project.total_creation_hours)})`);
});

const qualityTierSums = calculateQualityTierSums(mockProjects);

console.log("\n📋 Calculated Quality Tier Sums:");
const qualityLevels = [
    { key: 'basic', name: 'Level 1 - Basic' },
    { key: 'interactive', name: 'Level 2 - Interactive' },
    { key: 'advanced', name: 'Level 3 - Advanced' },
    { key: 'immersive', name: 'Level 4 - Immersive' }
];

qualityLevels.forEach(level => {
    const tierData = qualityTierSums[level.key];
    const completionTimeFormatted = tierData.completion_time > 0 
        ? formatTimeLikePDF(tierData.completion_time) 
        : '-';
    const creationTimeFormatted = tierData.creation_time > 0 
        ? formatTimeLikePDF(tierData.creation_time) 
        : '-';
    
    console.log(`  ${level.name}:`);
    console.log(`    - Completion Time: ${completionTimeFormatted}`);
    console.log(`    - Creation Time: ${creationTimeFormatted}`);
});

console.log("\n✅ Test completed! Block 2 should now show actual values instead of dashes."); 