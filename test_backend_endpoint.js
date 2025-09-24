// Simple test script to check backend endpoint
const fetch = require('node-fetch');

async function testEndpoint() {
  try {
    console.log('Testing backend endpoint...');
    
    // Test basic connectivity
    const basicTest = await fetch('http://localhost:3000/api/custom/projects');
    console.log('Basic connectivity test:', basicTest.status);
    
    // Test the effective-rates endpoint
    const effectiveRatesTest = await fetch('http://localhost:3000/api/custom/projects/1/effective-rates');
    console.log('Effective rates test:', effectiveRatesTest.status);
    
    if (effectiveRatesTest.ok) {
      const data = await effectiveRatesTest.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      console.log('Error response:', await effectiveRatesTest.text());
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEndpoint(); 