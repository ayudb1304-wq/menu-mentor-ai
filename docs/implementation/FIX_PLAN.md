# Fix Plan for Current Issues

**Status:** ✅ **PARTIALLY COMPLETE** 
- ✅ Duplicate import fixed
- ⏳ Firestore permission error - needs verification

## Issues Identified

### 1. Duplicate Import Error
**Status:** ✅ **FIXED**

**Error:** `Identifier 'ScanStackParamList' has already been declared. (34:9)`

**Location:** `menurai-app/src/screens/ScanOptionsScreen.tsx`

**Problem:**
- Line 17: `import { ScanStackParamList } from '../navigation/types';`
- Line 34: `import { ScanStackParamList } from '../navigation/types';` (DUPLICATE)

**Fix:**
- ✅ Removed the duplicate import on line 34

---

### 2. Firestore Permission Error
**Status:** ⏳ **PENDING VERIFICATION** - Needs testing to confirm fix

**Error:** `Missing or insufficient permissions` when fetching scan history

**Location:** `menurai-app/src/services/historyService.ts:91`

**Possible Causes:**
1. Firestore rules not deployed correctly
2. User not authenticated when query runs
3. Rules need to allow reading parent user document first
4. Query running before authentication completes

**Current Rules:**
```javascript
match /users/{userId} {
  allow read, update, create: if request.auth != null && request.auth.uid == userId;
  
  match /scanHistory/{scanId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
}
```

**Potential Issues:**
- The rules look correct, but Firestore might need the parent document to be readable
- The query might be running before auth is ready
- Need better error handling

**Fixes Needed:**
1. Verify Firestore rules are deployed
2. Add authentication check before query
3. Add better error handling
4. Ensure user document exists before querying subcollection
5. Add retry logic or wait for auth

---

## Fix Implementation Plan

### Step 1: Fix Duplicate Import
- Remove duplicate `ScanStackParamList` import from ScanOptionsScreen.tsx

### Step 2: Fix Firestore Permission Error
- Add authentication check in `getScanHistory()`
- Add better error handling
- Verify rules are correct
- Add wait for auth if needed
- Add user document existence check

### Step 3: Verify Rules Deployment
- Check if rules are actually deployed
- Re-deploy if needed
- Test with authenticated user

---

## Implementation Steps

1. **Fix Duplicate Import** (Quick Fix)
   - Remove line 34 in ScanOptionsScreen.tsx

2. **Fix Permission Error** (Critical)
   - Add auth check in historyService
   - Add better error messages
   - Verify rules deployment
   - Add retry logic

3. **Test**
   - Test with authenticated user
   - Verify rules work
   - Check error messages

