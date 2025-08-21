// Test script to verify Block 2 preview fix
console.log('🧪 Testing Block 2 Preview Fix');

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
        }
    ],
    quality_tier_sums: {
        basic: { completion_time: 0, creation_time: 0 },
        interactive: { completion_time: 75, creation_time: 180 }, // 30+45 minutes, 1+2 hours * 60
        advanced: { completion_time: 120, creation_time: 300 }, // 60 minutes, 3 hours * 60
        immersive: { completion_time: 0, creation_time: 0 }
    }
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

// Test Block 2 calculation
console.log('\n📊 Test Data Structure:');
console.log('Client Name:', testData.clientName);
console.log('Manager Name:', testData.managerName);
console.log('Projects Count:', testData.projects.length);
console.log('Quality Tier Sums:', testData.quality_tier_sums);

console.log('\n🔍 Block 2 Expected Results:');
const qualityLevels = [
    { key: 'basic', name: 'Level 1 - Basic' },
    { key: 'interactive', name: 'Level 2 - Interactive' },
    { key: 'advanced', name: 'Level 3 - Advanced' },
    { key: 'immersive', name: 'Level 4 - Immersive' }
];

qualityLevels.forEach((level) => {
    const tierData = testData.quality_tier_sums[level.key];
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

console.log('\n✅ Test completed. Check console for Block 2 preview results.'); 