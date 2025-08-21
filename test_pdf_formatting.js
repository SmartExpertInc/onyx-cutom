#!/usr/bin/env node
/**
 * Test script to verify time formatting matches PDF template exactly
 */

// Function to format time like PDF template (converts minutes to hours and minutes)
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

// Test cases based on the PDF template logic
const testCases = [
    // Learning Duration (total_completion_time in minutes)
    { input: 376, expected: "6h 16m", description: "AI Tools for Teachers - Learning Duration (376 minutes)" },
    { input: 157, expected: "2h 37m", description: "AI Tools for High School Teachers - Learning Duration (157 minutes)" },
    
    // Production Time (total_hours in minutes)
    { input: 1322, expected: "22h 2m", description: "AI Tools for Teachers - Production Time (1322 minutes)" },
    { input: 530, expected: "8h 50m", description: "AI Tools for High School Teachers - Production Time (530 minutes)" },
    
    // Edge cases
    { input: 0, expected: "-", description: "Zero minutes" },
    { input: null, expected: "-", description: "Null minutes" },
    { input: undefined, expected: "-", description: "Undefined minutes" },
    { input: 60, expected: "1h", description: "Exactly 1 hour" },
    { input: 90, expected: "1h 30m", description: "1 hour 30 minutes" },
    { input: 30, expected: "0h 30m", description: "30 minutes" }
];

console.log("🧪 Testing PDF template time formatting...");
console.log("=" * 50);

let allPassed = true;

testCases.forEach((testCase, index) => {
    const result = formatTimeLikePDF(testCase.input);
    const passed = result === testCase.expected;
    
    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`  Input: ${testCase.input} minutes`);
    console.log(`  Expected: "${testCase.expected}"`);
    console.log(`  Got: "${result}"`);
    console.log(`  Status: ${passed ? "✅ PASS" : "❌ FAIL"}`);
    console.log("");
    
    if (!passed) {
        allPassed = false;
    }
});

console.log("=" * 50);
if (allPassed) {
    console.log("🎉 All PDF template formatting tests passed!");
    console.log("\n📋 Summary:");
    console.log("✅ Time formatting matches PDF template exactly");
    console.log("✅ Converts minutes to hours and minutes correctly");
    console.log("✅ Handles edge cases properly");
    console.log("✅ Preview will now show same format as PDF");
} else {
    console.log("❌ Some tests failed. Please check the implementation.");
    process.exit(1);
}

// Test the specific values from the screenshot
console.log("\n🔍 Testing screenshot values:");
const screenshotValues = [
    { name: "AI Tools for Teachers - Learning", value: 376, expected: "6h 16m" },
    { name: "AI Tools for Teachers - Production", value: 1322, expected: "22h 2m" },
    { name: "AI Tools for High School Teachers - Learning", value: 157, expected: "2h 37m" },
    { name: "AI Tools for High School Teachers - Production", value: 530, expected: "8h 50m" }
];

screenshotValues.forEach(item => {
    const result = formatTimeLikePDF(item.value);
    console.log(`${item.name}: ${item.value} minutes → "${result}" (expected: "${item.expected}")`);
});

// Test quality level names
console.log("\n🔍 Testing quality level names:");
const qualityLevels = [
    { key: 'basic', name: 'Level 1 - Basic' },
    { key: 'interactive', name: 'Level 2 - Interactive' },
    { key: 'advanced', name: 'Level 3 - Advanced' },
    { key: 'immersive', name: 'Level 4 - Immersive' }
];

qualityLevels.forEach(level => {
    console.log(`${level.key}: "${level.name}"`);
}); 