#!/usr/bin/env node
/**
 * Debug script to test PDF template data and ensure it matches preview
 */

// Mock project data based on user's example
const mockProjects = [
    {
        id: 1,
        title: 'Project 1',
        total_completion_time: 533, // 8h 53m in minutes (learning duration)
        total_creation_hours: 861, // 14h 21m in minutes (production time)
        quality_tier: 'interactive'
    },
    {
        id: 2,
        title: 'Project 2',
        total_completion_time: 634, // 10h 34m in minutes (learning duration)
        total_creation_hours: 634, // 10h 34m in minutes (production time)
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

// Simulate backend calculation (like calculate_table_sums_for_template)
function calculateBackendSums(projects) {
    let total_completion_time = 0;
    let total_creation_hours = 0;
    
    // Calculate from projects (like backend)
    for (const project of projects) {
        total_completion_time += project.total_completion_time || 0;
        total_creation_hours += project.total_creation_hours || 0;
    }
    
    return {
        total_completion_time,
        total_creation_hours
    };
}

// Simulate preview calculation
function calculatePreviewSums(projects) {
    const totalLearningMinutes = projects.reduce((sum, project) => sum + (project.total_completion_time || 0), 0);
    const totalProductionMinutes = projects.reduce((sum, project) => sum + (project.total_creation_hours || 0), 0);
    
    return {
        totalLearningMinutes,
        totalProductionMinutes
    };
}

// Simulate PDF template calculation (what should happen)
function simulatePDFTemplate(backendSums) {
    // PDF template should use backend values directly
    const total_completion_time = backendSums.total_completion_time;
    const total_creation_hours = backendSums.total_creation_hours;
    
    return {
        total_completion_time,
        total_creation_hours
    };
}

console.log("🔍 Debug: Testing PDF vs Preview calculations...");
console.log("=" * 70);

console.log("📊 Mock Projects Data:");
mockProjects.forEach((project, index) => {
    console.log(`  Project ${index + 1}: ${project.title}`);
    console.log(`    Learning Duration: ${project.total_completion_time} minutes (${formatTimeWithMinutes(project.total_completion_time)})`);
    console.log(`    Production Time: ${project.total_creation_hours} minutes (${formatTimeWithMinutes(project.total_creation_hours)})`);
    console.log("");
});

// Calculate using different methods
const backendSums = calculateBackendSums(mockProjects);
const previewSums = calculatePreviewSums(mockProjects);
const pdfSums = simulatePDFTemplate(backendSums);

console.log("📋 Backend Calculation (PDF source):");
console.log(`  Total Completion Time: ${backendSums.total_completion_time} minutes (${formatTimeWithMinutes(backendSums.total_completion_time)})`);
console.log(`  Total Creation Hours: ${backendSums.total_creation_hours} minutes (${formatTimeWithMinutes(backendSums.total_creation_hours)})`);
console.log("");

console.log("📋 Preview Calculation:");
console.log(`  Total Learning: ${previewSums.totalLearningMinutes} minutes (${formatTimeWithMinutes(previewSums.totalLearningMinutes)})`);
console.log(`  Total Production: ${previewSums.totalProductionMinutes} minutes (${formatTimeWithMinutes(previewSums.totalProductionMinutes)})`);
console.log("");

console.log("📋 PDF Template (should match backend):");
console.log(`  Total Completion Time: ${pdfSums.total_completion_time} minutes (${formatTimeWithMinutes(pdfSums.total_completion_time)})`);
console.log(`  Total Creation Hours: ${pdfSums.total_creation_hours} minutes (${formatTimeWithMinutes(pdfSums.total_creation_hours)})`);
console.log("");

// Expected results
const expectedCompletionTime = 533 + 634; // 8h 53m + 10h 34m = 1167 minutes = 19h 27m
const expectedProductionTime = 861 + 634; // 14h 21m + 10h 34m = 1495 minutes = 24h 55m

console.log("🔍 Expected Results:");
console.log(`  Learning Duration: ${expectedCompletionTime} minutes (${formatTimeWithMinutes(expectedCompletionTime)})`);
console.log(`  Production Time: ${expectedProductionTime} minutes (${formatTimeWithMinutes(expectedProductionTime)})`);
console.log("");

console.log("✅ Verification:");
const backendCorrect = backendSums.total_completion_time === expectedCompletionTime && backendSums.total_creation_hours === expectedProductionTime;
const previewCorrect = previewSums.totalLearningMinutes === expectedCompletionTime && previewSums.totalProductionMinutes === expectedProductionTime;
const pdfCorrect = pdfSums.total_completion_time === expectedCompletionTime && pdfSums.total_creation_hours === expectedProductionTime;

console.log(`  Backend: ${backendCorrect ? "✅ CORRECT" : "❌ INCORRECT"}`);
console.log(`  Preview: ${previewCorrect ? "✅ CORRECT" : "❌ INCORRECT"}`);
console.log(`  PDF Template: ${pdfCorrect ? "✅ CORRECT" : "❌ INCORRECT"}`);
console.log("");

console.log("🔍 Comparison:");
console.log(`  Backend vs Preview: ${backendSums.total_completion_time === previewSums.totalLearningMinutes && backendSums.total_creation_hours === previewSums.totalProductionMinutes ? "✅ MATCH" : "❌ MISMATCH"}`);
console.log(`  Backend vs PDF: ${backendSums.total_completion_time === pdfSums.total_completion_time && backendSums.total_creation_hours === pdfSums.total_creation_hours ? "✅ MATCH" : "❌ MISMATCH"}`);
console.log(`  Preview vs PDF: ${previewSums.totalLearningMinutes === pdfSums.total_completion_time && previewSums.totalProductionMinutes === pdfSums.total_creation_hours ? "✅ MATCH" : "❌ MISMATCH"}`);
console.log("");

console.log("📋 Summary:");
console.log("=" * 70);
console.log("If PDF and Preview don't match, the issue is in:");
console.log("  1. PDF template using wrong variables");
console.log("  2. PDF template doing local accumulation");
console.log("  3. PDF template using wrong field names");
console.log("");
console.log("Expected PDF template behavior:");
console.log("  - Use total_completion_time from backend for Learning Duration");
console.log("  - Use total_creation_hours from backend for Production Time");
console.log("  - Don't accumulate locally");
console.log("  - Don't use project.total_hours for Production Time");
console.log("");
console.log("Current status:");
console.log(`  - Backend provides: ${formatTimeWithMinutes(backendSums.total_completion_time)} learning, ${formatTimeWithMinutes(backendSums.total_creation_hours)} production`);
console.log(`  - Preview shows: ${formatTimeWithMinutes(previewSums.totalLearningMinutes)} learning, ${formatTimeWithMinutes(previewSums.totalProductionMinutes)} production`);
console.log(`  - PDF should show: ${formatTimeWithMinutes(pdfSums.total_completion_time)} learning, ${formatTimeWithMinutes(pdfSums.total_creation_hours)} production`); 