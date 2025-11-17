# Firebase Console Setup Instructions

## 🔥 Quick Setup Guide for History Features

### Step 1: Update Firestore Security Rules

1. **Navigate to Firebase Console**
   - Go to: https://console.firebase.google.com
   - Select your project: **menu-mentor-prod**

2. **Open Firestore Database**
   - Click **"Firestore Database"** in the left sidebar
   - Click the **"Rules"** tab at the top

3. **Update the Rules**
   - Replace the entire rules section with the following:

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
      
      // Allow users to read/write their OWN scan history subcollection
      match /scanHistory/{scanId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

4. **Publish the Rules**
   - Click **"Publish"** button
   - Wait for confirmation that rules are published

---

### Step 2: Create Firestore Index

1. **Stay in Firestore Database**
   - Click the **"Indexes"** tab (next to Rules)

2. **Create New Index**
   - Click **"Create Index"** button
   - Fill in the following:
     - **Collection ID:** `scanHistory`
     - **Query scope:** Select **"Collection group"** (important!)
     - **Fields to index:**
       - Field: `scanDate`
       - Order: **Descending** ⬇️
     - Click **"Create"**

3. **Wait for Index to Build**
   - Status will show **"Building"** (may take 1-5 minutes)
   - Once complete, status will show **"Enabled"** ✅

**Note:** If you get an error about needing an index when testing, Firebase will provide a link to create it automatically. Click that link and follow the prompts.

---

### Step 3: Verify Storage Rules

1. **Navigate to Storage**
   - Click **"Storage"** in the left sidebar
   - Click the **"Rules"** tab

2. **Verify/Update Rules**
   - Ensure rules allow users to read/write their own uploads
   - Should look like this:

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

3. **Publish if Changed**
   - If you made changes, click **"Publish"**

---

### Step 4: Test the Setup (Optional)

1. **Create Test Document** (to verify rules work)
   - Go to **Firestore Database** → **Data** tab
   - Navigate to: `users` → `{your-user-id}` → `scanHistory`
   - Click **"Add document"**
   - Document ID: `test_scan_123`
   - Add these fields:
     ```
     userId: string → "your-user-id"
     imageUrl: string → "https://example.com/test.jpg"
     scanDate: timestamp → (current time)
     items: array → [{"name": "Test Item", "classification": "compliant", "reason": "Test"}]
     createdAt: timestamp → (current time)
     ```
   - Click **"Save"**

2. **Verify You Can Read It**
   - The document should appear in the list
   - Try editing it to verify write access

3. **Delete Test Document**
   - Click on the test document
   - Click **"Delete"** to clean up

---

## ✅ Verification Checklist

After completing the setup, verify:

- [ ] Firestore rules are published and active
- [ ] Firestore index is created and enabled (status: "Enabled")
- [ ] Storage rules allow user access to their uploads
- [ ] Test document can be created/read/deleted (if tested)

---

## 🚨 Common Issues & Solutions

### Issue: "Missing or insufficient permissions"
**Solution:** 
- Verify Firestore rules are published
- Check that the user is authenticated
- Ensure the rule path matches: `users/{userId}/scanHistory/{scanId}`

### Issue: "The query requires an index"
**Solution:**
- Go to Firestore → Indexes tab
- Check if index is still building (wait for it to complete)
- Or click the link in the error message to create the index automatically

### Issue: "Permission denied" when accessing images
**Solution:**
- Check Storage rules are published
- Verify the storage path matches: `uploads/{userId}/{fileName}`
- Ensure user is authenticated

---

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all rules are published (not just saved)
3. Ensure indexes are enabled (not just building)
4. Check that you're authenticated in the app

---

## 🎯 Next Steps

After completing Firebase setup:
1. The app should automatically save scans to history
2. History screen should display scans
3. Recent scans should appear on ScanOptionsScreen
4. You can test by performing a menu scan

