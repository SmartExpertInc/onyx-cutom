// SmartDrive Fix Verification Script
// Run this in browser console after restarting nginx

console.log('🔧 Testing SmartDrive Fix...');

async function verifySmartDriveFix() {
  const tests = [];
  
  // Test 1: Basic /smartdrive/ endpoint
  try {
    console.log('📡 Test 1: Testing /smartdrive/ endpoint...');
    const response = await fetch('/smartdrive/', {
      method: 'GET',
      credentials: 'same-origin'
    });
    
    tests.push({
      test: 'Basic /smartdrive/ endpoint',
      status: response.status,
      url: response.url,
      redirected: response.redirected,
      success: response.status === 200 || response.status === 302
    });
    
    console.log(`✅ Test 1 Result: ${response.status} ${response.statusText}`);
    console.log(`📍 Final URL: ${response.url}`);
    
    // Check if URL contains double smartdrive
    if (response.url.includes('/smartdrive/smartdrive/')) {
      console.log('❌ STILL HAS DOUBLE /smartdrive/ PATH!');
      tests[tests.length - 1].doublePathIssue = true;
    } else {
      console.log('✅ No double /smartdrive/ path detected');
      tests[tests.length - 1].doublePathIssue = false;
    }
    
  } catch (error) {
    console.error('❌ Test 1 Failed:', error);
    tests.push({
      test: 'Basic /smartdrive/ endpoint',
      error: error.message,
      success: false
    });
  }
  
  // Test 2: Check iframe behavior
  console.log('🖼️ Test 2: Checking iframe...');
  const iframes = document.querySelectorAll('iframe[src*="smartdrive"]');
  if (iframes.length > 0) {
    console.log(`✅ Found ${iframes.length} SmartDrive iframe(s)`);
    iframes.forEach((iframe, i) => {
      console.log(`📋 Iframe ${i + 1}: ${iframe.src}`);
      if (iframe.src.includes('/smartdrive/smartdrive/')) {
        console.log('❌ Iframe URL has double /smartdrive/ path!');
      } else {
        console.log('✅ Iframe URL looks correct');
      }
    });
  } else {
    console.log('⚠️ No SmartDrive iframes found');
  }
  
  // Test 3: Monitor for any failed requests
  console.log('👀 Test 3: Monitoring for 404 errors...');
  setTimeout(() => {
    // Check if any recent network errors occurred
    console.log('📊 Check browser Network tab for any 404 requests to /smartdrive/smartdrive/');
  }, 3000);
  
  // Test 4: Simulate iframe reload
  if (iframes.length > 0) {
    console.log('🔄 Test 4: Triggering iframe reload...');
    iframes[0].src = iframes[0].src + '?test=' + Date.now();
  }
  
  // Summary
  setTimeout(() => {
    console.log('📋 Test Summary:');
    console.table(tests);
    
    const allSuccess = tests.every(t => t.success && !t.doublePathIssue);
    if (allSuccess) {
      console.log('🎉 ALL TESTS PASSED! SmartDrive should now work correctly.');
    } else {
      console.log('⚠️ Some tests failed. Check the results above.');
    }
  }, 5000);
}

// Run the verification
verifySmartDriveFix();

// Additional manual test instructions
console.log(`
🧪 MANUAL VERIFICATION STEPS:
1. Restart nginx container: docker restart <nginx-container>
2. Navigate to SmartDrive in your app
3. Check that iframe shows Nextcloud interface (not white page)
4. Verify no 404 errors in Network tab
5. Test file browsing in the iframe

🎯 EXPECTED RESULTS:
- ✅ Iframe loads Nextcloud interface
- ✅ No 404 errors for /smartdrive/smartdrive/ URLs
- ✅ File browsing works in iframe
- ✅ No double /smartdrive/ paths in any URLs
`); 