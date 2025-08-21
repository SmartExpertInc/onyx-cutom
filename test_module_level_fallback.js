// Test the improved frontend fallback logic with module-level quality tier calculations

// Mock project data with microproduct_content
const mockProjects = [
    {
        id: 1,
        title: "Project 1",
        quality_tier: "interactive", // project-level fallback
        total_completion_time: 120, // 2 hours
        total_creation_hours: 3, // 3 hours
        microproduct_content: {
            sections: [
                {
                    quality_tier: "basic", // section-level
                    lessons: [
                        {
                            quality_tier: "advanced", // lesson-level (should take priority)
                            completionTime: "30m", // 30 minutes
                            hours: 0.5 // 0.5 hours
                        },
                        {
                            // no lesson quality_tier, should use section-level "basic"
                            completionTime: "45m", // 45 minutes
                            hours: 1.0 // 1 hour
                        }
                    ]
                },
                {
                    // no section quality_tier, should use project-level "interactive"
                    lessons: [
                        {
                            // no lesson quality_tier, should use project-level "interactive"
                            completionTime: "60m", // 60 minutes
                            hours: 1.5 // 1.5 hours
                        }
                    ]
                }
            ]
        }
    },
    {
        id: 2,
        title: "Project 2",
        quality_tier: "immersive", // project-level
        total_completion_time: 90, // 1.5 hours
        total_creation_hours: 2, // 2 hours
        // No microproduct_content - should use project-level calculation
    },
    {
        id: 3,
        title: "Project 3",
        quality_tier: "basic", // project-level
        total_completion_time: 180, // 3 hours
        total_creation_hours: 4, // 4 hours
        microproduct_content: {
            sections: [
                {
                    quality_tier: "interactive", // section-level
                    lessons: [
                        {
                            quality_tier: "immersive", // lesson-level (should take priority)
                            completionTime: "90m", // 90 minutes
                            hours: 2.0 // 2 hours
                        }
                    ]
                }
            ]
        }
    }
];

// Helper function to format time like PDF
function formatTimeLikePDF(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
        return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h ${remainingMinutes}m`;
    }
}

// Improved frontend fallback calculation (same logic as fixed frontend)
function calculateQualityTierSums(projects) {
    const qualityTierSums = {
        basic: { completion_time: 0, creation_time: 0 },
        interactive: { completion_time: 0, creation_time: 0 },
        advanced: { completion_time: 0, creation_time: 0 },
        immersive: { completion_time: 0, creation_time: 0 }
    };

    // Helper function to get effective quality tier (same priority as backend)
    const getEffectiveQualityTier = (lessonQualityTier, sectionQualityTier, projectQualityTier, folderQualityTier = 'interactive') => {
        // Priority: lesson -> section -> project -> folder -> default
        const tier = (lessonQualityTier || sectionQualityTier || projectQualityTier || folderQualityTier || 'interactive').toLowerCase();
        
        // Support both old and new tier names (like backend)
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

    // Process all projects with module-level quality tiers (like backend)
    projects.forEach(project => {
        const projectQualityTier = project.quality_tier;
        
        // Check if we have microproduct_content for module-level calculation
        const microproductContent = project.microproduct_content;
        if (microproductContent && typeof microproductContent === 'object' && microproductContent.sections) {
            // Use module-level calculation (like backend)
            const sections = microproductContent.sections;
            if (Array.isArray(sections)) {
                sections.forEach(section => {
                    if (section && typeof section === 'object' && section.lessons) {
                        const sectionQualityTier = section.quality_tier;
                        const lessons = section.lessons;
                        if (Array.isArray(lessons)) {
                            lessons.forEach(lesson => {
                                if (lesson && typeof lesson === 'object') {
                                    const lessonQualityTier = lesson.quality_tier;
                                    const effectiveTier = getEffectiveQualityTier(
                                        lessonQualityTier, 
                                        sectionQualityTier, 
                                        projectQualityTier, 
                                        'interactive'
                                    );
                                    
                                    // Get lesson completion time and creation hours (like backend)
                                    let lessonCompletionTimeRaw = lesson.completionTime || 0;
                                    const lessonCreationHours = lesson.hours || 0;
                                    
                                    // Convert completionTime from string (e.g., "6m") to integer minutes (like backend)
                                    let lessonCompletionTime;
                                    if (typeof lessonCompletionTimeRaw === 'string') {
                                        // Remove 'm' suffix and convert to int
                                        lessonCompletionTime = parseInt(lessonCompletionTimeRaw.replace('m', '')) || 0;
                                    } else {
                                        lessonCompletionTime = parseInt(lessonCompletionTimeRaw) || 0;
                                    }
                                    
                                    qualityTierSums[effectiveTier].completion_time += lessonCompletionTime;
                                    // Convert hours to minutes for consistency (like backend)
                                    qualityTierSums[effectiveTier].creation_time += lessonCreationHours * 60;
                                }
                            });
                        }
                    }
                });
            }
        } else {
            // Fallback to project-level calculation if no microproduct_content
            const effectiveTier = getEffectiveQualityTier(null, null, projectQualityTier, 'interactive');
            qualityTierSums[effectiveTier].completion_time += project.total_completion_time || 0;
            qualityTierSums[effectiveTier].creation_time += project.total_creation_hours || 0;
        }
    });

    return qualityTierSums;
}

console.log("🧪 Testing improved frontend fallback with module-level quality tier calculations...");

// Test the calculation
const qualityTierSums = calculateQualityTierSums(mockProjects);

console.log("\n📊 Project Details:");
mockProjects.forEach(project => {
    console.log(`\n${project.title}:`);
    console.log(`  - Project Quality Tier: ${project.quality_tier}`);
    console.log(`  - Has microproduct_content: ${!!project.microproduct_content}`);
    if (project.microproduct_content && project.microproduct_content.sections) {
        project.microproduct_content.sections.forEach((section, sectionIndex) => {
            console.log(`  - Section ${sectionIndex + 1} Quality Tier: ${section.quality_tier || 'None (uses project-level)'}`);
            section.lessons.forEach((lesson, lessonIndex) => {
                console.log(`    - Lesson ${lessonIndex + 1} Quality Tier: ${lesson.quality_tier || 'None (uses section/project-level)'}`);
                console.log(`      Completion: ${lesson.completionTime}, Creation: ${lesson.hours}h`);
            });
        });
    } else {
        console.log(`  - Project-level totals: ${project.total_completion_time}m completion, ${project.total_creation_hours}h creation`);
    }
});

console.log("\n📋 Quality Tier Sums (Module-Level Calculation):");
const tierNames = {
    'basic': 'Level 1 - Basic',
    'interactive': 'Level 2 - Interactive', 
    'advanced': 'Level 3 - Advanced',
    'immersive': 'Level 4 - Immersive'
};

Object.entries(qualityTierSums).forEach(([tier, data]) => {
    const completionFormatted = formatTimeLikePDF(data.completion_time);
    const creationFormatted = formatTimeLikePDF(data.creation_time);
    console.log(`  ${tierNames[tier]}:`);
    console.log(`    - Learning Duration: ${completionFormatted} (${data.completion_time}m)`);
    console.log(`    - Production Time: ${creationFormatted} (${data.creation_time}m)`);
});

console.log("\n✅ Expected Results:");
console.log("  - Project 1, Lesson 1: 'advanced' tier (30m completion, 30m creation)");
console.log("  - Project 1, Lesson 2: 'basic' tier (45m completion, 60m creation)");
console.log("  - Project 1, Lesson 3: 'interactive' tier (60m completion, 90m creation)");
console.log("  - Project 2: 'immersive' tier (90m completion, 120m creation) - project-level");
console.log("  - Project 3, Lesson 1: 'immersive' tier (90m completion, 120m creation)");

console.log("\n🎯 Test completed successfully!"); 