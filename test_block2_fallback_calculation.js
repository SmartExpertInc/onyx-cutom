// Test script to verify Block 2 fallback calculation
console.log('🧪 Testing Block 2 Fallback Calculation');

// Simulate the data structure WITHOUT quality_tier_sums (fallback scenario)
const testDataWithoutQualityTierSums = {
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
        }
    ]
    // Note: quality_tier_sums is missing - this simulates fallback scenario
};

// Simulate the fallback calculation logic from the frontend
const calculateQualityTierSumsFromProjects = (projects) => {
    const qualityTierSums = {
        'basic': { completion_time: 0, creation_time: 0 },
        'interactive': { completion_time: 0, creation_time: 0 },
        'advanced': { completion_time: 0, creation_time: 0 },
        'immersive': { completion_time: 0, creation_time: 0 }
    };
    
    projects.forEach((project) => {
        const projectQualityTier = project.quality_tier || 'interactive';
        
        // Check if we have microproduct_content for module-level calculation
        const microproductContent = project.microproduct_content;
        if (microproductContent && typeof microproductContent === 'object' && microproductContent.sections) {
            // Use module-level calculation (EXACTLY like backend)
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
                                    const effectiveTier = lessonQualityTier || sectionQualityTier || projectQualityTier || 'interactive';
                                    
                                    // Get lesson completion time and creation hours
                                    let lessonCompletionTimeRaw = lesson.completionTime || 0;
                                    const lessonCreationHours = lesson.hours || 0;
                                    
                                    // Convert completionTime from string (e.g., "6m") to integer minutes
                                    let lessonCompletionTime;
                                    if (typeof lessonCompletionTimeRaw === 'string') {
                                        lessonCompletionTime = parseInt(lessonCompletionTimeRaw.replace('m', '')) || 0;
                                    } else {
                                        lessonCompletionTime = parseInt(lessonCompletionTimeRaw) || 0;
                                    }
                                    
                                    if (qualityTierSums[effectiveTier]) {
                                        qualityTierSums[effectiveTier].completion_time += lessonCompletionTime;
                                        qualityTierSums[effectiveTier].creation_time += lessonCreationHours * 60;
                                    }
                                }
                            });
                        }
                    }
                });
            }
        } else {
            // Fallback to project-level calculation
            const effectiveTier = projectQualityTier;
            if (qualityTierSums[effectiveTier]) {
                qualityTierSums[effectiveTier].completion_time += project.total_completion_time || 0;
                qualityTierSums[effectiveTier].creation_time += (project.total_creation_hours || 0) * 60;
            }
        }
    });
    
    return qualityTierSums;
};

// Test the formatTimeLikePDF function (simplified version)
const formatTimeLikePDF = (minutes) => {
    if (!minutes || minutes === 0) return '-';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h ${remainingMinutes}m`;
    }
};

// Test fallback calculation
console.log('\n📊 Test Data Structure (without quality_tier_sums):');
console.log('Client Name:', testDataWithoutQualityTierSums.clientName);
console.log('Manager Name:', testDataWithoutQualityTierSums.managerName);
console.log('Projects Count:', testDataWithoutQualityTierSums.projects.length);
console.log('Quality Tier Sums: NOT AVAILABLE (will be calculated)');

// Calculate quality tier sums using fallback logic
const calculatedQualityTierSums = calculateQualityTierSumsFromProjects(testDataWithoutQualityTierSums.projects);

console.log('\n🔧 Calculated Quality Tier Sums:');
console.log(calculatedQualityTierSums);

console.log('\n🔍 Block 2 Results (Fallback Calculation):');
const qualityLevels = [
    { key: 'basic', name: 'Level 1 - Basic' },
    { key: 'interactive', name: 'Level 2 - Interactive' },
    { key: 'advanced', name: 'Level 3 - Advanced' },
    { key: 'immersive', name: 'Level 4 - Immersive' }
];

qualityLevels.forEach((level) => {
    const tierData = calculatedQualityTierSums[level.key];
    const completionTime = tierData?.completion_time || 0;
    const creationTime = tierData?.creation_time || 0;
    
    const completionTimeFormatted = completionTime > 0 
        ? formatTimeLikePDF(completionTime) 
        : '-';
    const creationTimeFormatted = creationTime > 0 
        ? formatTimeLikePDF(creationTime) 
        : '-';
    
    console.log(`${level.name}:`);
    console.log(`  - Learning Duration: ${completionTimeFormatted}`);
    console.log(`  - Production Hours: ${creationTimeFormatted}`);
});

console.log('\n✅ Fallback calculation test completed. Each level should show different values.'); 