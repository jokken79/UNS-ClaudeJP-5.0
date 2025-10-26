// Simple browser console test
// Run this in browser console to check for React key errors

const testPages = [
  '/dashboard',
  '/candidates',
  '/employees',
  '/factories',
  '/timercards',
  '/salary',
  '/requests'
];

console.clear();
console.log('🧪 Testing for React duplicate key errors...\n');

// Monitor console errors
const originalError = console.error;
let keyErrors = [];

console.error = function(...args) {
  const message = args.join(' ');
  if (message.includes('same key') || message.includes('duplicate key')) {
    keyErrors.push(message);
    console.log('❌ FOUND KEY ERROR:', message);
  }
  originalError.apply(console, args);
};

console.log('✅ Console monitor active. Navigate through the app and check for errors.\n');
console.log('Test these pages:', testPages.join(', '));
console.log('\nTo check results, run: keyErrors');

// Restore after 30 seconds
setTimeout(() => {
  console.error = originalError;
  console.log('\n📊 Test Results:');
  console.log(`Total key errors found: ${keyErrors.length}`);
  if (keyErrors.length === 0) {
    console.log('✅ No duplicate key errors detected!');
  } else {
    console.log('❌ Errors found:', keyErrors);
  }
}, 30000);
