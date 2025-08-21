// Test script to verify Block 2 complete rewrite
console.log('🧪 Testing Block 2 Complete Rewrite');

// Simulate the data structure that should be passed to PreviewModal
const testData = {
    clientName: 'Test Client',
    managerName: 'Test Manager',
    projects: [
        {
            id: 1,
            title: 'Test Project 1',
            total_completion_time: 120, // 2 hours in minutes
            total_creation_hours: 4, // 4 hours
            quality_tier: 'interactive',
            microproduct_content: {
                sections: [
                    {
                        quality_tier: 'interactive',
                        lessons: [
                            {
                                quality_tier: 'interactive',
                                completionTime: '30', // 30 minutes
                                hours: 1 // 1 hour
                            },
                            {
                                quality_tier: 'advanced',
                                completionTime: '45', // 45 minutes
                                hours: 2 // 2 hours
                            }
                        ]
                    }
                ]
            }
        },
        {
            id: 2,
            title: 'Test Project 2',
            total_completion_time: 180, // 3 hours in minutes
            total_creation_hours: 6, // 6 hours
            quality_tier: 'advanced',
            microproduct_content: {
                sections: [
                    {
                        quality_tier: 'advanced',
                        lessons: [
                            {
                                quality_tier: 'advanced',
                                completionTime: '60', // 60 minutes
                                hours: 3 // 3 hours
                            }
                        ]
                    }
                ]
            }
        },
        {
            id: 3,
            title: 'Test Project 3',
            total_completion_time: 90, // 1.5 hours in minutes
            total_creation_hours: 2, // 2 hours
            quality_tier: 'basic',
            microproduct_content: {
                sections: [
                    {
                        quality_tier: 'basic',
                        lessons: [
                            {
                                quality_tier: 'basic',
                                completionTime: '90', // 90 minutes
                                hours: 2 // 2 hours
                            }
                        ]
                    }
                ]
            }
        },
        {
            id: 4,
            title: 'Test Project 4',
            total_completion_time: 240, // 4 hours in minutes
            total_creation_hours: 8, // 8 hours
            quality_tier: 'immersive',
            microproduct_content: {
                sections: [
                    {
                        quality_tier: 'immersive',
                        lessons: [
                            {
                                quality_tier: 'immersive',
                                completionTime: '240', // 240 minutes
                                hours: 8 // 8 hours
                            }
                        ]
                    }
                ]
            }
        }
    ]
    // Note: quality_tier_sums is missing - this will trigger calculation
};

// Copy exact logic from the frontend rewrite
const getEffectiveQualityTier = (lessonQualityTier, sectionQualityTier, projectQualityTier, folderQualityTier = 'interactive') => {
    // Priority: lesson -> section -> project -> folder -> default
    const tier = (lessonQualityTier || sectionQualityTier || projectQualityTier || folderQualityTier || 'interactive').toLowerCase();
    
    // Support both old and new tier names (EXACTLY like backend)
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
};

// Calculate quality tier sums (EXACTLY like backend function)
const calculateQualityTierSums = (projects) => {
    const qualityTierData = {
        'basic': { completion_time: 0, creation_time: 0 },
        'interactive': { completion_time: 0, creation_time: 0 },
        'advanced': { completion_time: 0, creation_time: 0 },
        'immersive': { completion_time: 0, creation_time: 0 }
    };
    
    // Process all projects (EXACTLY like backend)
    projects.forEach((project) => {
        const projectQualityTier = project.quality_tier || null;
        
        // Process microproduct_content to get module-level quality tiers (EXACTLY like backend)
        const microproductContent = project.microproduct_content;
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
                                    const lessonQualityTier = lesson.quality_tier;
                                    const effectiveTier = getEffectiveQualityTier(
                                        lessonQualityTier, 
                                        sectionQualityTier, 
                                        projectQualityTier, 
                                        'interactive'  // Default for unassigned projects
                                    );
                                    
                                    // Get lesson completion time and creation hours (EXACTLY like backend)
                                    let lessonCompletionTimeRaw = lesson.completionTime || 0;
                                    const lessonCreationHours = lesson.hours || 0;
                                    
                                    // Convert completionTime from string (e.g., "6m") to integer minutes (EXACTLY like backend)
                                    let lessonCompletionTime;
                                    if (typeof lessonCompletionTimeRaw === 'string') {
                                        // Remove 'm' suffix and convert to int
                                        lessonCompletionTime = parseInt(lessonCompletionTimeRaw.replace('m', '')) || 0;
                                    } else {
                                        lessonCompletionTime = parseInt(lessonCompletionTimeRaw) || 0;
                                    }
                                    
                                    if (effectiveTier in qualityTierData) {
                                        qualityTierData[effectiveTier].completion_time += lessonCompletionTime;
                                        // Convert hours to minutes for consistency (EXACTLY like backend)
                                        qualityTierData[effectiveTier].creation_time += lessonCreationHours * 60;
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });
    
    return qualityTierData;
};

// Format time exactly like PDF template
const formatTimeLikePDF = (minutes) => {
    if (!minutes || minutes === 0) return '-';
    
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    
    if (h > 0 && m > 0) {
        return `${h}h ${m}m`;
    } else if (h > 0) {
        return `${h}h`;
    } else if (m > 0) {
        return `${m}m`;
    }
    return '-';
};

// Test the complete rewrite
console.log('\n📊 Test Data Structure:');
console.log('Client Name:', testData.clientName);
console.log('Manager Name:', testData.managerName);
console.log('Projects Count:', testData.projects.length);
console.log('Quality Tier Sums: NOT AVAILABLE (will be calculated)');

// Calculate quality tier sums using the new logic
console.log('\n🔧 Calculating quality_tier_sums from projects data (EXACTLY like backend)');
const calculatedQualityTierSums = calculateQualityTierSums(testData.projects);
console.log('🔧 Calculated quality_tier_sums:', calculatedQualityTierSums);

// Define tier names (EXACTLY like PDF template)
const tierNames = {
    'basic': 'Level 1 - Basic',
    'interactive': 'Level 2 - Interactive', 
    'advanced': 'Level 3 - Advanced',
    'immersive': 'Level 4 - Immersive'
};

console.log('\n🔍 Block 2 Results (Complete Rewrite):');
Object.entries(tierNames).forEach(([tierKey, tierName]) => {
    const tierData = calculatedQualityTierSums[tierKey];
    
    // Format completion time (EXACTLY like PDF template)
    let completionTimeFormatted = '-';
    if (tierData && tierData.completion_time && tierData.completion_time > 0) {
        const h = Math.floor(tierData.completion_time / 60);
        const m = tierData.completion_time % 60;
        if (h > 0 && m > 0) {
            completionTimeFormatted = `${h}h ${m}m`;
        } else if (h > 0) {
            completionTimeFormatted = `${h}h`;
        } else if (m > 0) {
            completionTimeFormatted = `${m}m`;
        }
    }
    
    // Format creation time (EXACTLY like PDF template)
    let creationTimeFormatted = '-';
    if (tierData && tierData.creation_time && tierData.creation_time > 0) {
        const h = Math.floor(tierData.creation_time / 60);
        const m = tierData.creation_time % 60;
        if (h > 0 && m > 0) {
            creationTimeFormatted = `${h}h ${m}m`;
        } else if (h > 0) {
            creationTimeFormatted = `${h}h`;
        } else if (m > 0) {
            creationTimeFormatted = `${m}m`;
        }
    }
    
    console.log(`${tierName}:`);
    console.log(`  - Learning Duration: ${completionTimeFormatted}`);
    console.log(`  - Production Hours: ${creationTimeFormatted}`);
    console.log(`  - Raw data: completion_time=${tierData?.completion_time || 0}, creation_time=${tierData?.creation_time || 0}`);
});

console.log('\n✅ Complete rewrite test completed. Each level should show different values.'); 