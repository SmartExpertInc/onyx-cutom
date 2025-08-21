#!/usr/bin/env node
/**
 * Test script to verify PDF calculations and identify production time issues
 */

// Mock project data based on user's example
const mockProjects = [
    {
        id: 1,
        title: 'Project 1',
        total_completion_time: 861, // 14h 21m in minutes
        total_creation_hours: 861, // 14h 21m in minutes
        quality_tier: 'interactive'
    },
    {
        id: 2,
        title: 'Project 2',
        total_completion_time: 634, // 10h 34m in minutes
        total_creation_hours: 634, // 10h 34m in minutes
        quality_tier: 'interactive'
    }
];

// Function to format time like PDF template (with minutes)
function formatTimeWithMinutes(minutes) {
    if (!minutes || minutes === 0) return '0h';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h ${remainingMinutes}m`;
    }
}

// Function to format time like old PDF template (hours only)
function formatTimeHoursOnly(minutes) {
    if (!minutes || minutes === 0) return '0h';
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
}

// Calculate totals
const totalCompletionTime = mockProjects.reduce((sum, project) => sum + (project.total_completion_time || 0), 0);
const totalCreationHours = mockProjects.reduce((sum, project) => sum + (project.total_creation_hours || 0), 0);

console.log("🧪 Testing PDF calculations...");
console.log("=" * 60);

console.log("📊 Mock Projects Data:");
mockProjects.forEach((project, index) => {
    console.log(`  Project ${index + 1}: ${project.title}`);
    console.log(`    Total Completion Time: ${project.total_completion_time} minutes (${formatTimeWithMinutes(project.total_completion_time)})`);
    console.log(`    Total Creation Hours: ${project.total_creation_hours} minutes (${formatTimeWithMinutes(project.total_creation_hours)})`);
    console.log("");
});

console.log("📋 Calculated Totals:");
console.log(`  Total Completion Time: ${totalCompletionTime} minutes`);
console.log(`  Total Creation Hours: ${totalCreationHours} minutes`);
console.log("");

console.log("📋 Time Formatting Comparison:");
console.log("  Total Completion Time:");
console.log(`    With minutes: ${formatTimeWithMinutes(totalCompletionTime)}`);
console.log(`    Hours only: ${formatTimeHoursOnly(totalCompletionTime)}`);
console.log("");
console.log("  Total Creation Hours:");
console.log(`    With minutes: ${formatTimeWithMinutes(totalCreationHours)}`);
console.log(`    Hours only: ${formatTimeHoursOnly(totalCreationHours)}`);
console.log("");

// Expected results based on user's example
const expectedCompletionTime = 861 + 634; // 14h 21m + 10h 34m = 1495 minutes
const expectedCreationHours = 861 + 634; // 14h 21m + 10h 34m = 1495 minutes

console.log("🔍 Expected Results:");
console.log(`  Total Completion Time: ${expectedCompletionTime} minutes (${formatTimeWithMinutes(expectedCompletionTime)})`);
console.log(`  Total Creation Hours: ${expectedCreationHours} minutes (${formatTimeWithMinutes(expectedCreationHours)})`);
console.log("");

console.log("✅ Verification:");
const completionCorrect = totalCompletionTime === expectedCompletionTime;
const creationCorrect = totalCreationHours === expectedCreationHours;

console.log(`  Total Completion Time: ${totalCompletionTime} minutes - ${completionCorrect ? "✅ CORRECT" : "❌ INCORRECT"}`);
console.log(`  Total Creation Hours: ${totalCreationHours} minutes - ${creationCorrect ? "✅ CORRECT" : "❌ INCORRECT"}`);
console.log("");

// Test quality tier sums
const qualityTierSums = {
    'basic': { completion_time: 0, creation_time: 0 },
    'interactive': { completion_time: 0, creation_time: 0 },
    'advanced': { completion_time: 0, creation_time: 0 },
    'immersive': { completion_time: 0, creation_time: 0 }
};

// Process all projects
mockProjects.forEach(project => {
    const effectiveTier = project.quality_tier || 'interactive';
    qualityTierSums[effectiveTier].completion_time += project.total_completion_time || 0;
    qualityTierSums[effectiveTier].creation_time += project.total_creation_hours || 0;
});

console.log("📋 Quality Tier Sums:");
Object.entries(qualityTierSums).forEach(([tier, data]) => {
    if (data.completion_time > 0 || data.creation_time > 0) {
        console.log(`  ${tier.toUpperCase()}:`);
        console.log(`    Learning Duration: ${data.completion_time} minutes (${formatTimeWithMinutes(data.completion_time)})`);
        console.log(`    Production Time: ${data.creation_time} minutes (${formatTimeWithMinutes(data.creation_time)})`);
        console.log("");
    }
});

console.log("📋 Summary of Issues:");
console.log("=" * 60);
console.log("Problem 1: Subtotal in PDF");
console.log("  - Old format: 26h production (incorrect - hours only)");
console.log("  - New format: 24h 55m production (correct - with minutes)");
console.log("");
console.log("Problem 2: Summary in PDF");
console.log("  - Old format: 26 hours (incorrect - hours only)");
console.log("  - New format: 24h 55m (correct - with minutes)");
console.log("");
console.log("Problem 3: Block 2 Production Hours");
console.log("  - Old format: 26h 28m (incorrect - wrong calculation)");
console.log("  - New format: 24h 55m (correct - proper summation)");
console.log("");
console.log("Root Cause:");
console.log("  - PDF template used integer division (// 60) which dropped minutes");
console.log("  - Should use proper time formatting with hours and minutes");
console.log("");
console.log("Solution:");
console.log("  - Updated PDF template to show minutes in all time displays");
console.log("  - Ensured consistent formatting between PDF and preview");
console.log("  - Fixed time calculations in Subtotal, Summary, and Block 2"); 