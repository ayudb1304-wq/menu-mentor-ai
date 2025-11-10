# History Features & Recent Scans Implementation Plan

## 📋 Current State Assessment

### ✅ Already Implemented
1. **History Service** (`src/services/historyService.ts`)
   - ✅ `saveScan()` - Saves scan results to Firestore
   - ✅ `getScanHistory()` - Retrieves user's scan history (ordered by date, limit 50)
   - ✅ `deleteScan()` - Deletes a scan from history
   - ✅ `getScanById()` - Gets a single scan by ID

2. **History Screen** (`src/screens/HistoryScreen.tsx`)
   - ✅ Displays list of scans
   - ✅ Shows scan statistics (compliant, modifiable, non-compliant)
   - ✅ Swipeable cards for delete/share actions
   - ✅ Empty state when no scans
   - ✅ Pull-to-refresh functionality
   - ✅ Loading states with skeletons

3. **Recent Scans Section** (`src/screens/ScanOptionsScreen.tsx`)
   - ✅ Loads recent scans (3 most recent)
   - ✅ Displays in ScanOptionsScreen

4. **Auto-Save on Analysis** (`src/screens/AnalysisScreen.tsx`)
   - ✅ Automatically saves scan to history after analysis completes

### ⚠️ Issues to Fix

1. **Firestore Security Rules** - Need to allow access to `scanHistory` subcollection
2. **Firestore Indexes** - May need composite index for efficient queries
3. **Image URL Handling** - Need to ensure imageUrl is properly saved (currently uses gs:// URL)
4. **Recent Scans Display** - May need UI improvements
5. **Error Handling** - Could be more robust

---

## 🎯 Implementation Tasks

### Phase 1: Firebase Configuration (REQUIRED)

#### Task 1.1: Update Firestore Security Rules
**File:** `firestore.rules`

**Current Issue:** Rules don't allow access to `scanHistory` subcollection

**Action Required:**
- Add rules for `users/{userId}/scanHistory/{scanId}` subcollection
- Ensure users can only access their own scan history

#### Task 1.2: Create Firestore Indexes
**File:** `firestore.indexes.json`

**Current Issue:** May need composite index for `orderBy('scanDate', 'desc')` query

**Action Required:**
- Add composite index for efficient history queries
- Deploy indexes to Firebase

#### Task 1.3: Verify Storage Rules
**File:** `storage.rules`

**Action Required:**
- Ensure users can read/write their own uploaded images
- Verify image URLs are accessible

---

### Phase 2: Code Enhancements

#### Task 2.1: Fix Image URL in History Service
**File:** `src/services/historyService.ts`

**Issue:** Currently saves `gs://` URL, but should save download URL for display

**Action Required:**
- Update `saveScan()` to get and save download URL from Storage
- Ensure images are accessible in HistoryScreen

#### Task 2.2: Enhance Recent Scans Display
**File:** `src/screens/ScanOptionsScreen.tsx`

**Current State:** Basic implementation exists

**Enhancements Needed:**
- Better UI/UX for recent scans section
- Add navigation to full history
- Add "View All" button
- Improve empty state

#### Task 2.3: Add Scan Details Screen (Optional)
**New File:** `src/screens/ScanDetailsScreen.tsx`

**Features:**
- View full scan details
- See all menu items with classifications
- Edit restaurant name/notes
- Share scan results
- Delete scan

#### Task 2.4: Improve Error Handling
**Files:** Multiple

**Enhancements:**
- Better error messages
- Retry mechanisms
- Offline support indicators
- Network error handling

---

### Phase 3: UI/UX Improvements

#### Task 3.1: Enhance History Screen
- Add filters (by date, classification)
- Add search functionality
- Add sorting options
- Improve card design
- Add animations

#### Task 3.2: Enhance Recent Scans
- Better card design
- Add quick actions
- Show preview thumbnails
- Add loading states

---

## 🔥 Firebase Console Setup Instructions

### Step 1: Update Firestore Security Rules

1. **Go to Firebase Console**
   - Navigate to: https://console.firebase.google.com
   - Select your project: `menu-mentor-prod`

2. **Open Firestore Database**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab

3. **Update Security Rules**
   - Replace the current rules with the updated rules (see below)
   - Click "Publish" to deploy

**Updated Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lock down everything by default
    match /{document=**} {
      allow read, write: if false;
    }

    // Allow users to read/write their OWN user document
    match /users/{userId} {
      allow read, update, create: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to read/write their OWN scan history
      match /scanHistory/{scanId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### Step 2: Create Firestore Indexes

1. **Go to Firestore Database**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Indexes" tab

2. **Create Composite Index**
   - Click "Create Index"
   - Collection ID: `scanHistory` (subcollection under `users/{userId}`)
   - Add fields:
     - Field: `scanDate`, Order: Descending
   - Query scope: Collection
   - Click "Create"

   **OR** use the CLI (recommended):
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Wait for Index to Build**
   - Index creation can take a few minutes
   - Status will show "Building" then "Enabled"

### Step 3: Verify Storage Rules

1. **Go to Storage**
   - Click on "Storage" in the left sidebar
   - Click on the "Rules" tab

2. **Verify/Update Rules**
   - Ensure rules allow users to read/write their own files
   - Example rules:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Allow users to read/write their own uploads
       match /uploads/{userId}/{fileName} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### Step 4: Test the Setup

1. **Create Test Data** (Optional)
   - Go to Firestore Database
   - Manually create a test document:
     - Path: `users/{your-user-id}/scanHistory/test_scan`
     - Add fields:
       - `userId`: your user ID
       - `imageUrl`: test URL
       - `scanDate`: Timestamp (current time)
       - `items`: array with test items
       - `createdAt`: Timestamp

2. **Verify Access**
   - Test that you can read/write to the subcollection
   - Check browser console for any permission errors

---

## 📝 Code Changes Required

### 1. Update Firestore Rules
**File:** `firestore.rules`
- Add subcollection rules (see Step 1 above)

### 2. Update Firestore Indexes
**File:** `firestore.indexes.json`
- Add composite index for scanHistory queries

### 3. Fix Image URL in History Service
**File:** `src/services/historyService.ts`
- Update `saveScan()` to get download URL

### 4. Enhance Recent Scans UI
**File:** `src/screens/ScanOptionsScreen.tsx`
- Improve UI/UX
- Add navigation to full history

---

## ❓ Questions for You

1. **Image Storage:**
   - Do you want to keep images in Firebase Storage permanently, or delete them after a certain period?
   - Should we store both `gs://` URL (for Cloud Functions) and download URL (for display)?

2. **Recent Scans:**
   - How many recent scans should be shown? (Currently 3)
   - Should recent scans be clickable to view details?
   - Do you want a "View All" button to navigate to full history?

3. **Scan Details:**
   - Do you want a dedicated screen to view full scan details?
   - Should users be able to edit restaurant name/notes after saving?
   - Do you want to add tags or categories to scans?

4. **History Features:**
   - Do you want filtering (by date, classification, restaurant)?
   - Do you want search functionality?
   - Should there be pagination or infinite scroll?
   - Do you want export/share functionality?

5. **Data Retention:**
   - Should there be a limit on how many scans to keep?
   - Should old scans be automatically deleted?
   - Do you want archive functionality?

6. **UI/UX:**
   - Any specific design requirements for the history screen?
   - Should we add animations/transitions?
   - Any accessibility requirements?

---

## ✅ Testing Checklist

- [ ] Firestore rules allow access to scanHistory subcollection
- [ ] Firestore indexes are created and enabled
- [ ] Storage rules allow image access
- [ ] Scan saves to history after analysis
- [ ] History screen displays scans correctly
- [ ] Recent scans show on ScanOptionsScreen
- [ ] Delete scan works
- [ ] Images display correctly in history
- [ ] Pull-to-refresh works
- [ ] Empty states display correctly
- [ ] Error handling works
- [ ] Offline behavior (if applicable)

---

## 🚀 Deployment Steps

1. **Update Firebase Rules & Indexes**
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage:rules
   ```

2. **Update Code**
   - Make code changes
   - Test locally
   - Commit changes

3. **Deploy**
   - Deploy to production
   - Test in production environment

---

## 📚 Additional Resources

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)

