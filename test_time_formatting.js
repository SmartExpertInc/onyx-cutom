#!/usr/bin/env node
/**
 * Test script to verify time formatting consistency between PDF and preview
 */

// Function to format time for preview to match PDF format exactly
function formatTimeForPreview(time) {
    if (!time || time === 0) return '-';
    
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    
    if (minutes === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h ${minutes}m`;
    }
}

// Test cases based on the screenshot data
const testCases = [
    { input: 6.27, expected: "6h 16m", description: "AI Tools for Teachers - Learning Duration" },
    { input: 22.03, expected: "22h 2m", description: "AI Tools for Teachers - Production Time" },
    { input: 2.62, expected: "2h 37m", description: "AI Tools for High School Teachers - Learning Duration" },
    { input: 8.83, expected: "8h 50m", description: "AI Tools for High School Teachers - Production Time" },
    { input: 0, expected: "-", description: "Zero time" },
    { input: null, expected: "-", description: "Null time" },
    { input: undefined, expected: "-", description: "Undefined time" },
    { input: 1, expected: "1h", description: "Whole hour" },
    { input: 1.5, expected: "1h 30m", description: "Half hour" },
    { input: 0.5, expected: "0h 30m", description: "Half hour from zero" }
];

console.log("🧪 Testing time formatting consistency...");
console.log("=" * 50);

let allPassed = true;

testCases.forEach((testCase, index) => {
    const result = formatTimeForPreview(testCase.input);
    const passed = result === testCase.expected;
    
    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`  Input: ${testCase.input}`);
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
    console.log("🎉 All time formatting tests passed!");
    console.log("\n📋 Summary:");
    console.log("✅ Time formatting function works correctly");
    console.log("✅ Matches PDF format exactly");
    console.log("✅ Handles edge cases properly");
    console.log("✅ Preview will now show same format as PDF");
} else {
    console.log("❌ Some tests failed. Please check the implementation.");
    process.exit(1);
}

// Test the specific values from the screenshot
console.log("\n🔍 Testing screenshot values:");
const screenshotValues = [
    { name: "AI Tools for Teachers - Learning", value: 6.27, expected: "6h 16m" },
    { name: "AI Tools for Teachers - Production", value: 22.03, expected: "22h 2m" },
    { name: "AI Tools for High School Teachers - Learning", value: 2.62, expected: "2h 37m" },
    { name: "AI Tools for High School Teachers - Production", value: 8.83, expected: "8h 50m" }
];

screenshotValues.forEach(item => {
    const result = formatTimeForPreview(item.value);
    console.log(`${item.name}: ${item.value} → "${result}" (expected: "${item.expected}")`);
}); 