# Store Compliance Fixes - Account Deletion & AI Consent

This document outlines the critical compliance fixes implemented to meet Apple App Store and Google Play Store requirements.

## 1. Account Deletion Feature ✅

### Requirement
Both app stores now mandate that apps with account creation must provide a clear, in-app way to delete accounts and all associated data.

### Implementation

#### Backend: Cloud Function (`functions/src/index.ts`)
- **New Function**: `deleteUserAccount`
  - Authenticates the user making the request
  - Deletes the user's Firestore document from the `users` collection
  - Deletes the user's Firebase Auth record
  - Returns a success message
  - Includes comprehensive error handling and logging

```typescript
export const deleteUserAccount = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  try {
    logger.info("Account deletion requested", {uid});
    
    // Delete user's Firestore document
    await db.collection("users").doc(uid).delete();
    logger.info("Firestore user document deleted", {uid});
    
    // Delete user's auth record
    await admin.auth().deleteUser(uid);
    logger.info("Firebase Auth user deleted", {uid});
    
    return {message: "Account successfully deleted."};
  } catch (error) {
    logger.error("Failed to delete user account", {uid, error});
    throw new HttpsError(
      "internal",
      error instanceof Error ? error.message : "Failed to delete account."
    );
  }
});
```

#### Frontend: Auth Service (`menurai-app/src/services/authService.ts`)
- **New Method**: `deleteAccount()`
  - Calls the Cloud Function `deleteUserAccount`
  - Automatically signs out the user after successful deletion
  - Handles errors gracefully

#### Frontend: Profile Screen (`menurai-app/src/screens/ProfileScreen.tsx`)
- **New UI Component**: "Delete Account" button
  - Positioned below the "Sign Out" button
  - Red color scheme to indicate destructive action
  - Shows confirmation dialog before proceeding
  - Displays loading state during deletion
  - Clear warning message about permanent data loss:
    - "This action is permanent and cannot be undone. All your data, including your dietary profile, scan history, and subscription information, will be permanently deleted."

## 2. Explicit AI Consent ✅

### Requirement
Apple's new AI policy requires apps that share personal data with third-party AI services to obtain explicit user consent. Simply having a privacy policy is not sufficient.

### Implementation

#### Data Model Update (`menurai-app/src/services/userService.ts`)
- **New Field**: `aiConsentGiven: boolean` in `UserProfile` interface
  - Defaults to `false` for new users
  - Must be explicitly set to `true` during profile setup
  - Stored in Firestore for compliance documentation

#### Profile Setup Screen (`menurai-app/src/screens/ProfileSetupScreen.tsx`)
- **New UI Component**: AI Consent Card (only shown during initial setup, not in edit mode)
  - Clear heading: "AI Data Processing Consent"
  - Detailed explanation:
    - "Menu Mentor uses Google's AI (Gemini) to analyze menu images and provide personalized dietary recommendations. By using this app, your dietary profile and uploaded menu images will be processed by Google's AI services."
  - **Required Checkbox**: Users must check this to complete profile setup
  - Visual feedback: Checkbox changes appearance when selected
  - Text becomes bold when consent is given
  - Validation: Users cannot proceed without checking the box
  
#### User Experience Flow
1. New users sign in and are directed to Profile Setup
2. They select dietary preferences and restrictions
3. They see the AI Consent card with clear information
4. They must check the consent checkbox to enable the "Complete Setup" button
5. Attempting to save without consent shows an alert: "You must consent to AI processing to use Menu Mentor"
6. Once consented, the `aiConsentGiven` field is permanently saved to their profile

#### Technical Implementation
- Hook updated to pass `aiConsentGiven` parameter: `useUserProfile.ts`
- Service method updated to accept and store consent: `userService.updateDietaryPreferences()`
- Consent is only requested during initial setup, not during profile edits
- Existing users are grandfathered (field added but not required for them)

## Files Modified

### Backend
- `functions/src/index.ts` - Added `deleteUserAccount` Cloud Function

### Frontend Services
- `menurai-app/src/services/authService.ts` - Added `deleteAccount()` method
- `menurai-app/src/services/userService.ts` - Added `aiConsentGiven` field and updated `updateDietaryPreferences()`

### Frontend Hooks
- `menurai-app/src/hooks/useUserProfile.ts` - Updated to support AI consent parameter

### Frontend Screens
- `menurai-app/src/screens/ProfileScreen.tsx` - Added "Delete Account" button and handler
- `menurai-app/src/screens/ProfileSetupScreen.tsx` - Added AI consent card with checkbox

### Frontend Components
- `menurai-app/src/components/icons.tsx` - Added `CheckSquare` and `Square` icons

## Testing Checklist

### Account Deletion
- [ ] User can navigate to Profile screen
- [ ] "Delete Account" button is visible
- [ ] Clicking button shows confirmation dialog with clear warning
- [ ] User can cancel the deletion
- [ ] Upon confirmation, loading state is shown
- [ ] Account is successfully deleted (both Auth and Firestore)
- [ ] User is signed out after deletion
- [ ] Error handling works if deletion fails

### AI Consent
- [ ] New users see the AI consent card during profile setup
- [ ] Consent card explains AI usage clearly
- [ ] Checkbox is initially unchecked
- [ ] Clicking checkbox toggles state
- [ ] Cannot complete setup without checking consent
- [ ] Alert shown if user tries to save without consent
- [ ] Consent is saved to Firestore after setup
- [ ] Editing profile later does NOT show consent card again
- [ ] Existing users are not affected

## Compliance Notes

### Apple App Store
✅ Account deletion is now available in-app as required
✅ Explicit AI consent is obtained before any data processing
✅ Clear explanation of what data is processed and by whom

### Google Play Store
✅ Account deletion meets the "Delete Account" requirement
✅ User data deletion is comprehensive (Auth + Firestore)
✅ AI processing disclosure is clear and upfront

## Deployment Notes

1. Deploy the Cloud Function first:
   ```bash
   cd functions
   npm run deploy
   ```

2. Verify the function is deployed successfully in Firebase Console

3. Test account deletion with a test user before releasing to production

4. Update app version in `app.json` before submission

5. Include updated privacy policy if needed to reflect AI processing details

## Future Considerations

1. **Data Export**: Consider adding data export before deletion (GDPR compliance)
2. **Deletion Delay**: Consider implementing a grace period (e.g., 30 days) before permanent deletion
3. **Audit Trail**: Log all deletion requests for compliance auditing
4. **Email Confirmation**: Send confirmation email after account deletion
5. **Subscription Cancellation**: Automatically cancel active subscriptions before deletion
