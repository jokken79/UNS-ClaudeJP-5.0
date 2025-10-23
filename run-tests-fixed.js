const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '.playwright-mcp');

async function testFrontendPages() {
  console.log('=== UNS-ClaudeJP 4.2 Frontend Testing ===');
  console.log('NOTE: First-time page compilation may take 2-3 minutes each\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  const results = { passed: [], failed: [], screenshots: [], loadTimes: {} };
  
  try {
    console.log('Test 1: Homepage (/)');
    const t1 = Date.now();
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 180000 });
      results.loadTimes['homepage'] = Date.now() - t1;
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-01-homepage.png'), fullPage: true });
      results.screenshots.push('test-01-homepage.png');
      console.log('  PASS (' + results.loadTimes['homepage'] + 'ms)\n');
      results.passed.push('Homepage');
    } catch (e) {
      console.log('  FAIL: ' + e.message + '\n');
      results.failed.push({ page: 'Homepage', error: e.message });
    }
    
    console.log('Test 2: Login Page (/login)');
    const t2 = Date.now();
    try {
      await page.goto(BASE_URL + '/login', { waitUntil: 'domcontentloaded', timeout: 180000 });
      results.loadTimes['login'] = Date.now() - t2;
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-02-login.png'), fullPage: true });
      results.screenshots.push('test-02-login.png');
      console.log('  PASS (' + results.loadTimes['login'] + 'ms)');
      
      console.log('  Attempting login...');
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'admin123');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-02b-filled.png'), fullPage: true });
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**', { timeout: 180000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-02c-success.png'), fullPage: true });
      console.log('  Login successful\n');
      results.passed.push('Login');
    } catch (e) {
      console.log('  FAIL: ' + e.message + '\n');
      results.failed.push({ page: 'Login', error: e.message });
    }
    
    console.log('Test 3: Dashboard (/dashboard)');
    try {
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-03-dashboard.png'), fullPage: true });
      console.log('  PASS\n');
      results.passed.push('Dashboard');
    } catch (e) {
      console.log('  FAIL: ' + e.message + '\n');
      results.failed.push({ page: 'Dashboard', error: e.message });
    }
    
    console.log('Test 4: Candidates (/candidates)');
    const t4 = Date.now();
    try {
      await page.goto(BASE_URL + '/candidates', { waitUntil: 'domcontentloaded', timeout: 180000 });
      results.loadTimes['candidates'] = Date.now() - t4;
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-04-candidates.png'), fullPage: true });
      console.log('  PASS (' + results.loadTimes['candidates'] + 'ms)\n');
      results.passed.push('Candidates');
    } catch (e) {
      console.log('  FAIL: ' + e.message + '\n');
      results.failed.push({ page: 'Candidates', error: e.message });
    }
    
    console.log('Test 5: Employees (/employees)');
    const t5 = Date.now();
    try {
      await page.goto(BASE_URL + '/employees', { waitUntil: 'domcontentloaded', timeout: 180000 });
      results.loadTimes['employees'] = Date.now() - t5;
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-05-employees.png'), fullPage: true });
      console.log('  PASS (' + results.loadTimes['employees'] + 'ms)\n');
      results.passed.push('Employees');
    } catch (e) {
      console.log('  FAIL: ' + e.message + '\n');
      results.failed.push({ page: 'Employees', error: e.message });
    }
    
    console.log('Test 6: Factories (/factories)');
    try {
      await page.goto(BASE_URL + '/factories', { waitUntil: 'domcontentloaded', timeout: 180000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-06a-factories.png'), fullPage: true });
      console.log('  PASS\n');
      results.passed.push('Factories');
    } catch (e) {
      console.log('  FAIL: ' + e.message + '\n');
      results.failed.push({ page: 'Factories', error: e.message });
    }
    
    console.log('Test 7: Timercards (/timercards)');
    try {
      await page.goto(BASE_URL + '/timercards', { waitUntil: 'domcontentloaded', timeout: 180000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-06b-timercards.png'), fullPage: true });
      console.log('  PASS\n');
      results.passed.push('Timercards');
    } catch (e) {
      console.log('  FAIL: ' + e.message + '\n');
      results.failed.push({ page: 'Timercards', error: e.message });
    }
    
    console.log('Test 8: Salary (/salary)');
    try {
      await page.goto(BASE_URL + '/salary', { waitUntil: 'domcontentloaded', timeout: 180000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-06c-salary.png'), fullPage: true });
      console.log('  PASS\n');
      results.passed.push('Salary');
    } catch (e) {
      console.log('  FAIL: ' + e.message + '\n');
      results.failed.push({ page: 'Salary', error: e.message });
    }
    
  } finally {
    await browser.close();
  }
  
  console.log('='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('PASSED: ' + results.passed.length + ' tests');
  results.passed.forEach(function(p) { console.log('  - ' + p); });
  if (results.failed.length > 0) {
    console.log('FAILED: ' + results.failed.length + ' tests');
    results.failed.forEach(function(f) { console.log('  - ' + f.page + ': ' + f.error); });
  }
  console.log('Screenshots: ' + results.screenshots.length + ' captured in .playwright-mcp/');
  console.log('Load Times:');
  Object.keys(results.loadTimes).forEach(function(k) {
    console.log('  ' + k + ': ' + results.loadTimes[k] + 'ms');
  });
  console.log('='.repeat(60));
  
  return results.failed.length === 0 ? 0 : 1;
}

testFrontendPages().then(function(code) { process.exit(code); }).catch(function(err) { console.error(err); process.exit(1); });
