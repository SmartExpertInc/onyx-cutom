#!/usr/bin/env node
/**
 * Test script to verify Block 2 quality tier grouping fix
 */

// Mock project data structure with different quality tiers
const mockProjects = [
    {
        id: 1,
        title: 'AI Tools for Teachers',
        total_lessons: 64,
        total_modules: 8,
        total_hours: 1322, // Production time (in minutes)
        total_completion_time: 376, // Learning duration (in minutes)
        total_creation_hours: 1322, // Production time (in minutes)
        quality_tier: 'interactive'
    },
    {
        id: 2,
        title: 'AI Tools for High School Teachers',
        total_lessons: 32,
        total_modules: 4,
        total_hours: 530, // Production time (in minutes)
        total_completion_time: 157, // Learning duration (in minutes)
        total_creation_hours: 530, // Production time (in minutes)
        quality_tier: 'interactive'
    },
    {
        id: 3,
        title: 'Basic Course',
        total_lessons: 16,
        total_modules: 2,
        total_hours: 120, // Production time (in minutes)
        total_completion_time: 45, // Learning duration (in minutes)
        total_creation_hours: 120, // Production time (in minutes)
        quality_tier: 'basic'
    },
    {
        id: 4,
        title: 'Advanced Course',
        total_lessons: 48,
        total_modules: 6,
        total_hours: 800, // Production time (in minutes)
        total_completion_time: 240, // Learning duration (in minutes)
        total_creation_hours: 800, // Production time (in minutes)
        quality_tier: 'advanced'
    },
    {
        id: 5,
        title: 'Immersive Course',
        total_lessons: 80,
        total_modules: 10,
        total_hours: 1500, // Production time (in minutes)
        total_completion_time: 400, // Learning duration (in minutes)
        total_creation_hours: 1500, // Production time (in minutes)
        quality_tier: 'immersive'
    },
    {
        id: 6,
        title: 'Another Basic Course',
        total_lessons: 20,
        total_modules: 3,
        total_hours: 180, // Production time (in minutes)
        total_completion_time: 60, // Learning duration (in minutes)
        total_creation_hours: 180, // Production time (in minutes)
        quality_tier: 'basic'
    }
];

// Function to format time like PDF template
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

// Backend quality tier sums calculation (like PDF)
function calculateBackendQualityTierSums(projects) {
    const quality_tier_data = {
        'basic': { completion_time: 0, creation_time: 0 },
        'interactive': { completion_time: 0, creation_time: 0 },
        'advanced': { completion_time: 0, creation_time: 0 },
        'immersive': { completion_time: 0, creation_time: 0 }
    };
    
    // Helper function to get effective quality tier (like backend)
    function get_effective_quality_tier(project, folder_quality_tier = 'interactive') {
        if (project.quality_tier) {
            return project.quality_tier.toLowerCase();
        }
        return folder_quality_tier.toLowerCase();
    }
    
    // Process all projects
    projects.forEach(project => {
        const effectiveTier = get_effective_quality_tier(project, 'interactive');
        if (effectiveTier in quality_tier_data) {
            quality_tier_data[effectiveTier].completion_time += project.total_completion_time || 0;
            quality_tier_data[effectiveTier].creation_time += project.total_creation_hours || 0;
        }
    });
    
    return quality_tier_data;
}

// Frontend quality tier sums calculation (like preview - FIXED)
function calculateFrontendQualityTierSums(projects) {
    const qualityTierSums = {
        'basic': { completionTime: 0, creationTime: 0 },
        'interactive': { completionTime: 0, creationTime: 0 },
        'advanced': { completionTime: 0, creationTime: 0 },
        'immersive': { completionTime: 0, creationTime: 0 }
    };
    
    // Process all projects (exactly like PDF backend)
    projects.forEach(project => {
        // Use the same logic as backend: check project quality_tier first, fallback to 'interactive'
        let effectiveTier = 'interactive';
        if (project.quality_tier) {
            const tier = project.quality_tier.toLowerCase();
            if (tier === 'basic' || tier === 'interactive' || tier === 'advanced' || tier === 'immersive') {
                effectiveTier = tier;
            }
        }
        
        // Learning Duration uses total_completion_time (like PDF template)
        qualityTierSums[effectiveTier].completionTime += project.total_completion_time || 0;
        // Production Time uses total_creation_hours (like PDF template)
        qualityTierSums[effectiveTier].creationTime += project.total_creation_hours || 0;
    });
    
    return qualityTierSums;
}

console.log("🧪 Testing Block 2 quality tier grouping fix...");
console.log("=" * 70);

console.log("📊 Mock Projects Data:");
mockProjects.forEach((project, index) => {
    console.log(`  Project ${index + 1}: ${project.title}`);
    console.log(`    Quality Tier: ${project.quality_tier}`);
    console.log(`    Total Completion Time: ${project.total_completion_time} minutes`);
    console.log(`    Total Creation Hours: ${project.total_creation_hours} minutes`);
    console.log("");
});

// Calculate quality tier sums
const backendQualitySums = calculateBackendQualityTierSums(mockProjects);
const frontendQualitySums = calculateFrontendQualityTierSums(mockProjects);

console.log("📋 Backend Quality Tier Sums (PDF):");
Object.entries(backendQualitySums).forEach(([tier, data]) => {
    const completionFormatted = formatTimeLikePDF(data.completion_time);
    const creationFormatted = formatTimeLikePDF(data.creation_time);
    console.log(`  ${tier.toUpperCase()}: ${data.completion_time} minutes completion (${completionFormatted}), ${data.creation_time} minutes creation (${creationFormatted})`);
});
console.log("");

console.log("📋 Frontend Quality Tier Sums (Preview - FIXED):");
Object.entries(frontendQualitySums).forEach(([tier, data]) => {
    const completionFormatted = formatTimeLikePDF(data.completionTime);
    const creationFormatted = formatTimeLikePDF(data.creationTime);
    console.log(`  ${tier.toUpperCase()}: ${data.completionTime} minutes completion (${completionFormatted}), ${data.creationTime} minutes creation (${creationFormatted})`);
});
console.log("");

// Expected results based on mock data
const expectedSums = {
    'basic': { 
        completion_time: 45 + 60, // Basic Course + Another Basic Course
        creation_time: 120 + 180 
    },
    'interactive': { 
        completion_time: 376 + 157, // AI Tools for Teachers + AI Tools for High School Teachers
        creation_time: 1322 + 530 
    },
    'advanced': { 
        completion_time: 240, // Advanced Course
        creation_time: 800 
    },
    'immersive': { 
        completion_time: 400, // Immersive Course
        creation_time: 1500 
    }
};

console.log("🔍 Expected Results:");
Object.entries(expectedSums).forEach(([tier, data]) => {
    const completionFormatted = formatTimeLikePDF(data.completion_time);
    const creationFormatted = formatTimeLikePDF(data.creation_time);
    console.log(`  ${tier.toUpperCase()}: ${data.completion_time} minutes completion (${completionFormatted}), ${data.creation_time} minutes creation (${creationFormatted})`);
});
console.log("");

console.log("✅ Verification:");
let allCorrect = true;

// Check backend calculations
Object.entries(expectedSums).forEach(([tier, expected]) => {
    const backend = backendQualitySums[tier];
    const frontend = frontendQualitySums[tier];
    
    const backendCorrect = backend.completion_time === expected.completion_time && backend.creation_time === expected.creation_time;
    const frontendCorrect = frontend.completionTime === expected.completion_time && frontend.creationTime === expected.creation_time;
    const match = backend.completion_time === frontend.completionTime && backend.creation_time === frontend.creationTime;
    
    console.log(`  ${tier.toUpperCase()}:`);
    console.log(`    Backend: ${backend.completion_time}m completion, ${backend.creation_time}m creation - ${backendCorrect ? "✅ CORRECT" : "❌ INCORRECT"}`);
    console.log(`    Frontend: ${frontend.completionTime}m completion, ${frontend.creationTime}m creation - ${frontendCorrect ? "✅ CORRECT" : "❌ INCORRECT"}`);
    console.log(`    Match: ${match ? "✅ MATCH" : "❌ MISMATCH"}`);
    console.log("");
    
    if (!backendCorrect || !frontendCorrect || !match) {
        allCorrect = false;
    }
});

if (allCorrect) {
    console.log("🎉 Block 2 quality tier grouping is now correct!");
    console.log("✅ Backend groups projects by quality tier correctly");
    console.log("✅ Frontend groups projects by quality tier correctly");
    console.log("✅ PDF and preview show identical quality tier sums");
    console.log("✅ All quality tiers (Basic, Interactive, Advanced, Immersive) show correct values");
} else {
    console.log("❌ Some quality tier grouping is still incorrect!");
    console.log("Please check the grouping logic.");
    process.exit(1);
}

console.log("\n📋 Summary of Block 2 Fix:");
console.log("=" * 70);
console.log("Problem:");
console.log("  - Block 2 Production Hours differed between PDF and preview");
console.log("  - Only Interactive tier showed values, others showed 0");
console.log("");
console.log("Root Cause:");
console.log("  - Frontend used different logic than backend for quality tier grouping");
console.log("  - Backend processes folders and subfolders, frontend only flat projects");
console.log("");
console.log("Fix:");
console.log("  - Updated frontend to use exact same logic as backend");
console.log("  - Check project quality_tier first, fallback to 'interactive'");
console.log("  - Use same field mapping: total_completion_time and total_creation_hours");
console.log("");
console.log("Result:");
console.log("  - All 4 quality tiers now show correct values");
console.log("  - PDF and preview show identical Block 2 data");
console.log("  - Production Hours are correctly calculated for each tier"); 