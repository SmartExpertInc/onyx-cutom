// Test file for new slide templates
// This file can be used to test the new slide templates

const testTemplates = {
  'course-overview-slide': {
    title: 'Course',
    subtitle: 'Overview',
    imagePath: '',
    imageAlt: 'Course overview image'
  },
  
  'work-life-balance-slide': {
    title: 'Work-life balance',
    content: 'Maintaining a healthy work-life balance allows me to be more present and engaged both at work and in my personal life, resulting in increased productivity and overall satisfaction.',
    imagePath: '',
    imageAlt: 'Work-life balance image'
  },
  
  'thank-you-slide': {
    title: 'Thank you',
    email: 'hello@gmail.com',
    phone: '+1 (305) 212-4253',
    address: '374 Creekside Road Palmetto',
    postalCode: 'F134221',
    companyName: 'Company name',
    profileImagePath: '',
    profileImageAlt: 'Profile image'
  }
};

console.log('New slide templates created:');
console.log('- Course Overview Slide (course-overview-slide)');
console.log('- Work-Life Balance Slide (work-life-balance-slide)');
console.log('- Thank You Slide (thank-you-slide)');

console.log('\nTemplate IDs for use in the system:');
Object.keys(testTemplates).forEach(templateId => {
  console.log(`- ${templateId}`);
});

console.log('\nTest data structure:');
console.log(JSON.stringify(testTemplates, null, 2)); 