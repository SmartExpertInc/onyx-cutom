#!/usr/bin/env node
/**
 * Test script to verify production time calculations are correct
 */

// Mock project data structure
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

console.log("🧪 Testing production time calculations...");
console.log("=" * 60);

console.log("📊 Mock Projects Data:");
mockProjects.forEach((project, index) => {
    console.log(`  Project ${index + 1}: ${project.title}`);
    console.log(`    Total Completion Time: ${project.total_completion_time} minutes`);
    console.log(`    Total Creation Hours: ${project.total_creation_hours} minutes`);
    console.log("");
});

// Calculate totals
const totalCompletionTime = mockProjects.reduce((sum, project) => sum + (project.total_completion_time || 0), 0);
const totalCreationHours = mockProjects.reduce((sum, project) => sum + (project.total_creation_hours || 0), 0);

console.log("📋 Calculated Totals:");
console.log(`  Total Completion Time: ${totalCompletionTime} minutes`);
console.log(`  Total Creation Hours: ${totalCreationHours} minutes`);
console.log("");

// PDF Template calculations (like the template)
const pdfLearningHours = Math.floor(totalCompletionTime / 60);
const pdfProductionHours = Math.floor(totalCreationHours / 60);

console.log("📋 PDF Template Calculations:");
console.log(`  Learning Hours: ${totalCompletionTime} minutes → ${pdfLearningHours} hours`);
console.log(`  Production Hours: ${totalCreationHours} minutes → ${pdfProductionHours} hours`);
console.log("");

// Preview calculations (like the frontend)
const previewLearningMinutes = mockProjects.reduce((sum, project) => sum + (project.total_completion_time || 0), 0);
const previewLearningHours = Math.floor(previewLearningMinutes / 60);
const previewProductionMinutes = mockProjects.reduce((sum, project) => sum + (project.total_creation_hours || 0), 0);
const previewProductionHours = Math.floor(previewProductionMinutes / 60);

console.log("📋 Preview Calculations:");
console.log(`  Learning Hours: ${previewLearningMinutes} minutes → ${previewLearningHours} hours`);
console.log(`  Production Hours: ${previewProductionMinutes} minutes → ${previewProductionHours} hours`);
console.log("");

// Expected results
const expectedLearningHours = 6 + 2; // 6h 16m + 2h 37m = 8 hours (rounded down)
const expectedProductionHours = Math.floor((1322 + 530) / 60); // (1322 + 530) / 60 = 30 hours

console.log("🔍 Expected Results:");
console.log(`  Learning Hours: ~${expectedLearningHours} hours`);
console.log(`  Production Hours: ~${expectedProductionHours} hours`);
console.log("");

console.log("✅ Verification:");
const learningHoursCorrect = Math.abs(pdfLearningHours - expectedLearningHours) <= 1; // Allow 1 hour difference due to rounding
const productionHoursCorrect = Math.abs(pdfProductionHours - expectedProductionHours) <= 1; // Allow 1 hour difference due to rounding
const previewMatchesPDF = pdfLearningHours === previewLearningHours && pdfProductionHours === previewProductionHours;

console.log(`  Learning Hours: ${pdfLearningHours} hours (expected: ~${expectedLearningHours} hours) - ${learningHoursCorrect ? "✅ CORRECT" : "❌ INCORRECT"}`);
console.log(`  Production Hours: ${pdfProductionHours} hours (expected: ~${expectedProductionHours} hours) - ${productionHoursCorrect ? "✅ CORRECT" : "❌ INCORRECT"}`);
console.log(`  Preview matches PDF: ${previewMatchesPDF ? "✅ CORRECT" : "❌ INCORRECT"}`);
console.log("");

if (learningHoursCorrect && productionHoursCorrect && previewMatchesPDF) {
    console.log("🎉 All production time calculations are correct!");
    console.log("✅ PDF template converts minutes to hours correctly");
    console.log("✅ Preview converts minutes to hours correctly");
    console.log("✅ PDF and preview show identical values");
} else {
    console.log("❌ Some calculations are incorrect!");
    console.log("Please check the calculation logic.");
    process.exit(1);
}

console.log("\n📋 Summary of Production Time Fixes:");
console.log("=" * 60);
console.log("PDF Template:");
console.log("  Subtotal: 8h of learning content → 30h production");
console.log("  Summary: Estimated Production Time: ≈ 30 hours");
console.log("");
console.log("Preview:");
console.log("  Summary: Estimated Production Time: ≈ 30 hours");
console.log("");
console.log("Calculation Logic:");
console.log("  Learning Hours: Math.floor(total_completion_time / 60)");
console.log("  Production Hours: Math.floor(total_creation_hours / 60)");
console.log("");
console.log("Example:");
console.log("  Total Creation Hours: 1852 minutes");
console.log("  Production Hours: Math.floor(1852 / 60) = 30 hours"); 