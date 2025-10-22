import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track 401 errors and console errors
  const errors401 = [];
  const consoleErrors = [];
  
  page.on('response', response => {
    if (response.status() === 401) {
      errors401.push({ url: response.url(), status: 401 });
    }
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('====================================');
  console.log('   LOGIN FLOW TEST');
  console.log('====================================\n');

  console.log('Step 1: Navigate to login page...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'login-step1-initial.png', fullPage: true });
  console.log('✓ Login page loaded');
  console.log('  Current URL:', page.url());

  console.log('\nStep 2: Fill in credentials...');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.screenshot({ path: 'login-step2-filled.png', fullPage: true });
  console.log('✓ Credentials entered (admin / admin123)');

  console.log('\nStep 3: Submit login form...');
  await page.click('button[type="submit"]');
  console.log('✓ Login button clicked');

  // Wait for navigation or toast
  console.log('\nStep 4: Waiting for response...');
  try {
    await Promise.race([
      page.waitForURL('**/dashboard', { timeout: 15000 }),
      page.waitForSelector('.Toastify', { timeout: 15000 }),
      page.waitForTimeout(15000)
    ]);
  } catch (e) {
    console.log('  (Timeout reached, continuing...)');
  }

  await page.waitForTimeout(2000); // Wait for any animations/toasts
  await page.screenshot({ path: 'login-step3-after-submit.png', fullPage: true });

  const finalUrl = page.url();
  console.log('✓ Final URL:', finalUrl);

  // Check sessionStorage for token
  const token = await page.evaluate(() => {
    return {
      sessionStorage: sessionStorage.getItem('token'),
      localStorage: localStorage.getItem('token')
    };
  });

  console.log('\n====================================');
  console.log('   TEST RESULTS');
  console.log('====================================');
  console.log('Final URL:', finalUrl);
  console.log('Token in sessionStorage:', token.sessionStorage ? 'YES ✓' : 'NO ✗');
  console.log('Token in localStorage:', token.localStorage ? 'YES ✓' : 'NO ✗');
  console.log('401 errors:', errors401.length > 0 ? `${errors401.length} found ✗` : 'None ✓');
  
  if (errors401.length > 0) {
    console.log('\n401 Errors detected:');
    errors401.forEach(err => console.log(`  - ${err.url}`));
  }
  
  if (consoleErrors.length > 0) {
    console.log('\nConsole errors:', consoleErrors.length);
    consoleErrors.slice(0, 5).forEach(err => console.log(`  - ${err}`));
  } else {
    console.log('Console errors: None ✓');
  }

  console.log('\n====================================');
  const redirectedToDashboard = finalUrl.includes('/dashboard');
  const hasToken = token.sessionStorage || token.localStorage;
  const no401Errors = errors401.length === 0;

  if (redirectedToDashboard && hasToken && no401Errors) {
    console.log('   ✅ LOGIN TEST PASSED');
    console.log('====================================');
    console.log('✓ No 401 authentication errors');
    console.log('✓ Token stored successfully');
    console.log('✓ Redirected to dashboard');
  } else {
    console.log('   ❌ LOGIN TEST FAILED');
    console.log('====================================');
    if (!redirectedToDashboard) console.log('✗ Did not redirect to dashboard');
    if (!hasToken) console.log('✗ Token not stored');
    if (!no401Errors) console.log('✗ 401 errors detected');
  }
  console.log('====================================\n');

  await browser.close();
})();
