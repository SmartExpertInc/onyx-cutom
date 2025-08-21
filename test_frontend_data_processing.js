#!/usr/bin/env node
/**
 * Test script to simulate frontend data processing
 */

// Simulate the formatTimeLikePDF function
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

// Test data that should match what the backend returns
const testQualityTierSums = {
    basic: { completion_time: 2880, creation_time: 5760 }, // 48h completion, 96h creation
    interactive: { completion_time: 10500, creation_time: 49440 }, // 175h completion, 824h creation
    advanced: { completion_time: 8700, creation_time: 8700 }, // 145h completion, 145h creation
    immersive: { completion_time: 27240, creation_time: 27240 } // 454h completion, 454h creation
};

console.log("🧪 Testing Frontend Data Processing");
console.log("=" * 60);

console.log("📊 Test quality_tier_sums data:");
console.log(JSON.stringify(testQualityTierSums, null, 2));

console.log("\n🔍 Processing each tier:");
Object.entries(testQualityTierSums).forEach(([tier, data]) => {
    console.log(`\n${tier}:`);
    console.log(`  completion_time: ${data.completion_time} (type: ${typeof data.completion_time})`);
    console.log(`  creation_time: ${data.creation_time} (type: ${typeof data.creation_time})`);
    console.log(`  completion_time > 0: ${data.completion_time > 0}`);
    console.log(`  creation_time > 0: ${data.creation_time > 0}`);
    console.log(`  formatted completion: ${formatTimeLikePDF(data.completion_time)}`);
    console.log(`  formatted creation: ${formatTimeLikePDF(data.creation_time)}`);
});

console.log("\n🎯 Simulating frontend rendering logic:");
const qualityLevels = [
    { key: 'basic', name: 'Level 1 - Basic' },
    { key: 'interactive', name: 'Level 2 - Interactive' },
    { key: 'advanced', name: 'Level 3 - Advanced' },
    { key: 'immersive', name: 'Level 4 - Immersive' }
];

qualityLevels.forEach((level, index) => {
    const tierData = testQualityTierSums[level.key];
    const completionTimeFormatted = tierData.completion_time > 0 
        ? formatTimeLikePDF(tierData.completion_time) 
        : '-';
    const creationTimeFormatted = tierData.creation_time > 0 
        ? formatTimeLikePDF(tierData.creation_time) 
        : '-';
    
    console.log(`\n${level.name}:`);
    console.log(`  Learning Duration (H): ${completionTimeFormatted}`);
    console.log(`  Production Hours: ${creationTimeFormatted}`);
});

console.log("\n✅ Test completed!"); 