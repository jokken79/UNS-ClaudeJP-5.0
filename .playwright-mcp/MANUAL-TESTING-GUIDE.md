# Manual Browser Testing Guide - Login Flow

## Prerequisites
- ✅ Backend running: http://localhost:8000 (healthy)
- ✅ Frontend running: http://localhost:3000 (accessible)
- ✅ Database running: PostgreSQL on port 5432
- ✅ API authentication verified via curl

---

## Test Scenario: Complete Login Flow

### Step 1: Navigate to Login Page
**URL:** http://localhost:3000/login

**Expected:**
- ✅ Login page loads without errors
- ✅ UNS-kikaku logo visible
- ✅ Premium design with animated background
- ✅ Username and password fields visible
- ✅ Demo credentials card shows: admin / admin123

**Screenshot:** Capture full login page

---

### Step 2: Open Browser DevTools
**Chrome:** Press F12 or Right-click → Inspect  
**Firefox:** Press F12 or Right-click → Inspect Element

**Navigate to:**
1. **Console Tab** - Watch for errors
2. **Network Tab** - Monitor API requests
3. **Application Tab** → Storage → Session Storage

**Expected:**
- ✅ No console errors
- ✅ Network tab ready to record
- ✅ Session storage visible

---

### Step 3: Fill Login Credentials
**Username:** `admin`  
**Password:** `admin123`

**Expected:**
- ✅ Fields accept input
- ✅ Password is masked (dots)
- ✅ Eye icon toggles password visibility

**Screenshot:** Capture filled form

---

### Step 4: Submit Login Form
**Action:** Click "ログイン" (Login) button

**Monitor Network Tab:**
1. **Request 1:** `POST /api/auth/login`
   - Status: 200 OK
   - Response: `{ "access_token": "...", "token_type": "bearer" }`

2. **Request 2:** `GET /api/auth/me`
   - Status: **200 OK** (NOT 401!)
   - Headers: `Authorization: Bearer <token>`
   - Response: `{ "id": 1, "username": "admin", ... }`

**Expected:**
- ✅ Green success toast: "ログインに成功しました"
- ✅ NO 401 errors in Network tab
- ✅ NO red errors in Console

**Screenshot:** Capture Network tab showing both requests with 200 status

---

### Step 5: Verify Token Storage
**Navigate to:** Application Tab → Storage → Session Storage → http://localhost:3000

**Look for key:** `auth-storage`

**Expected value (JSON):**
```json
{
  "state": {
    "token": "eyJhbGci...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@uns-kikaku.com",
      "role": "SUPER_ADMIN",
      "is_active": true
    },
    "isAuthenticated": true
  },
  "version": 0
}
```

**Screenshot:** Capture Session Storage with auth-storage expanded

---

### Step 6: Verify Redirect to Dashboard
**Expected URL:** http://localhost:3000/dashboard

**Expected:**
- ✅ Redirects automatically after login
- ✅ Dashboard page loads
- ✅ No redirect back to /login (would indicate auth failure)

**Note:** Dashboard may show errors due to database schema issue (separate problem), but the fact that it loads proves authentication is working.

**Screenshot:** Capture dashboard page after login

---

### Step 7: Verify Console Logs
**Check Console Tab for:**

**Should SEE:**
- ✅ "Login successful" or similar success message
- ✅ API responses with 200 status

**Should NOT SEE:**
- ❌ "401 Unauthorized"
- ❌ "Could not validate credentials"
- ❌ Red error messages about authentication

**Screenshot:** Capture clean console (no errors)

---

## Success Criteria Checklist

```
Authentication Flow:
□ Login page loads without errors
□ Form accepts username and password
□ Submit triggers POST /api/auth/login (200 OK)
□ Response contains access_token
□ GET /api/auth/me called with Bearer token (200 OK - NOT 401!)
□ User data returned successfully
□ Success toast appears
□ No 401 errors in Network tab
□ No console errors
□ Token stored in sessionStorage under 'auth-storage' key
□ Redirect to /dashboard occurs
□ Dashboard page loads (no auth redirect)
```

---

## Troubleshooting

### If you see 401 errors:
1. Check Network tab - which endpoint returns 401?
2. Check if token is in request headers
3. Check sessionStorage has auth-storage key
4. Clear browser cache and sessionStorage
5. Hard reload page (Ctrl+Shift+R)

### If redirect doesn't work:
1. Check console for JavaScript errors
2. Verify router.push('/dashboard') is called
3. Check middleware.ts isn't blocking

### If token not in sessionStorage:
1. Check Zustand store configuration
2. Verify persist middleware is working
3. Check browser allows sessionStorage

---

## Expected vs Actual

### BEFORE Fix (Old Behavior):
```
Login → POST /api/auth/login (200)
     → Store token in Zustand
     → GET /api/auth/me (401 ❌) <- Token not in store yet!
     → Error: "Could not validate credentials"
```

### AFTER Fix (Current Behavior):
```
Login → POST /api/auth/login (200)
     → GET /api/auth/me with token parameter (200 ✅)
     → Store both token + user in Zustand
     → Redirect to dashboard
     → Success! ✅
```

---

## Files to Review

If you need to verify the implementation:

1. **D:\JPUNS-CLAUDE4.2\UNS-ClaudeJP-4.2\frontend-nextjs\lib\api.ts**
   - Line 79-87: `getCurrentUser(token?: string)`

2. **D:\JPUNS-CLAUDE4.2\UNS-ClaudeJP-4.2\frontend-nextjs\app\login\page.tsx**
   - Line 40-54: Login flow implementation

3. **D:\JPUNS-CLAUDE4.2\UNS-ClaudeJP-4.2\frontend-nextjs\stores\auth-store.ts**
   - Line 34: sessionStorage configuration
   - Line 44-46: login() function

---

## Test Reports

Full test results available at:
- **Detailed Report:** `.playwright-mcp/LOGIN-TEST-REPORT.md`
- **Summary:** `.playwright-mcp/TEST-SUMMARY.md`
- **This Guide:** `.playwright-mcp/MANUAL-TESTING-GUIDE.md`

---

**Happy Testing!** ✅

If you encounter any issues, refer to the test reports or check the backend logs:
```bash
docker logs uns-claudejp-backend --tail 50
```
