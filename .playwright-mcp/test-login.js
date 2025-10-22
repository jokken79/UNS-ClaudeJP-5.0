const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000';

async function testLogin() {
  console.log('=== Testing Login Flow ===\n');
  
  try {
    // Step 1: Login
    console.log('Step 1: Attempting login...');
    const formData = new URLSearchParams();
    formData.append('username', 'admin');
    formData.append('password', 'admin123');
    
    const loginResponse = await axios.post(
      `${API_BASE_URL}/api/auth/login`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    console.log('✓ Login successful!');
    console.log('  Token received:', loginResponse.data.access_token.substring(0, 20) + '...');
    
    const token = loginResponse.data.access_token;
    
    // Step 2: Get current user with token
    console.log('\nStep 2: Fetching current user with token...');
    const userResponse = await axios.get(
      `${API_BASE_URL}/api/auth/me`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✓ User data retrieved successfully!');
    console.log('  User ID:', userResponse.data.id);
    console.log('  Username:', userResponse.data.username);
    console.log('  Role:', userResponse.data.role);
    
    // Step 3: Verify token works for protected endpoints
    console.log('\nStep 3: Testing protected endpoint access...');
    const dashboardResponse = await axios.get(
      `${API_BASE_URL}/api/dashboard/stats`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✓ Dashboard stats retrieved successfully!');
    console.log('  Stats:', JSON.stringify(dashboardResponse.data, null, 2));
    
    console.log('\n=== ALL TESTS PASSED ===');
    console.log('✅ No 401 errors occurred');
    console.log('✅ Token authentication working correctly');
    console.log('✅ User can access protected routes');
    
    return true;
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Error:', error.response.data);
      if (error.response.status === 401) {
        console.error('\n  🚨 401 UNAUTHORIZED ERROR DETECTED!');
      }
    } else {
      console.error('  Error:', error.message);
    }
    return false;
  }
}

testLogin();
