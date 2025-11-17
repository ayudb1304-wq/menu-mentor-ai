# Store Submission Action Plan - Quick Reference

## 🔴 CRITICAL BLOCKERS (Must Fix First)

### 1. Payment Gateway Migration
**Status:** ❌ **BLOCKER**  
**Impact:** App will be rejected by both stores  
**Effort:** 2-3 weeks

**Actions:**
1. Remove Razorpay from mobile apps
2. Implement Apple In-App Purchase (IAP)
3. Implement Google Play Billing
4. Update backend to validate receipts
5. Update Terms of Service (currently incorrect)
6. Test thoroughly with sandbox/test accounts

**Files to Modify:**
- `menurai-app/src/screens/PaywallScreen.tsx` - Replace Razorpay with IAP
- `menurai-app/src/utils/razorpayWeb.ts` - Remove or keep only for web
- `functions/src/index.ts` - Add IAP validation functions
- `menurai-app/src/screens/TermsScreen.tsx` - Fix payment processing section

---

### 2. Age Verification
**Status:** ❌ **MISSING**  
**Impact:** Legal compliance issue, potential rejection  
**Effort:** 2-3 days

**Actions:**
1. Add age verification screen in onboarding
2. Block users under 13
3. Add age confirmation in Terms acceptance
4. Update Privacy Policy with age requirements

**Files to Create/Modify:**
- Create: `menurai-app/src/screens/AgeVerificationScreen.tsx`
- Modify: `menurai-app/src/screens/AuthScreen.tsx` - Add age gate
- Modify: `menurai-app/src/screens/PrivacyPolicyScreen.tsx` - Clarify age requirements

---

### 3. Account Deletion
**Status:** ❌ **MISSING**  
**Impact:** GDPR/CCPA compliance, potential rejection  
**Effort:** 3-5 days

**Actions:**
1. Add "Delete Account" button in Profile/Settings
2. Implement data deletion (Firestore, Storage, Auth)
3. Add confirmation dialog with clear warnings
4. Update Privacy Policy with deletion instructions

**Files to Create/Modify:**
- Modify: `menurai-app/src/screens/ProfileScreen.tsx` - Add delete account option
- Create: `menurai-app/src/services/accountDeletionService.ts`
- Modify: `functions/src/index.ts` - Add account deletion function
- Modify: `menurai-app/src/screens/PrivacyPolicyScreen.tsx` - Add deletion instructions

---

## 🟠 HIGH PRIORITY (Required for Approval)

### 4. Legal Document Updates
**Status:** ⚠️ **NEEDS UPDATES**  
**Effort:** 2-3 days

**Issues Found:**
- Terms incorrectly states payments handled by stores (but uses Razorpay)
- Cancellation policy says "All sales are final" (must comply with store policies)
- Privacy Policy needs data deletion instructions

**Files to Modify:**
- `menurai-app/src/screens/TermsScreen.tsx` - Fix payment section, update refund policy
- `menurai-app/src/screens/CancellationPolicyScreen.tsx` - Update to comply with store policies
- `menurai-app/src/screens/PrivacyPolicyScreen.tsx` - Add data deletion, update payment processing

---

### 5. Accessibility Improvements
**Status:** ⚠️ **NEEDS WORK**  
**Effort:** 1-2 weeks

**Actions:**
1. Add accessibility labels to all interactive elements
2. Ensure color contrast meets WCAG 2.1 AA (4.5:1)
3. Test with screen readers (TalkBack/VoiceOver)
4. Add proper focus indicators
5. Support dynamic text sizing

**Files to Review:**
- All screen components
- All button components
- All form inputs

---

### 6. Error Handling & Loading States
**Status:** ⚠️ **NEEDS IMPROVEMENT**  
**Effort:** 1 week

**Actions:**
1. Add offline state handling
2. Improve error messages (user-friendly)
3. Add retry mechanisms
4. Add loading states for all async operations
5. Handle network errors gracefully

---

## 🟡 MEDIUM PRIORITY (Recommended)

### 7. App Store Assets
**Status:** ❌ **MISSING**  
**Effort:** 3-5 days

**Required Assets:**
- App icon (1024x1024 for iOS, 512x512 for Android)
- Screenshots for all required device sizes
- Feature graphic for Google Play (1024x500)
- App descriptions (short and full)
- Promotional text

---

### 8. Onboarding Flow
**Status:** ⚠️ **BASIC EXISTS**  
**Effort:** 3-5 days

**Improvements:**
1. Add proper tutorial/onboarding screens
2. Explain key features
3. Add tooltips for complex features
4. Improve first-time user experience

---

## 📋 IMPLEMENTATION ORDER

### Week 1-2: Critical Blockers
1. ✅ Payment gateway migration (IAP/Billing)
2. ✅ Age verification
3. ✅ Account deletion

### Week 3: Legal & Compliance
1. ✅ Update all legal documents
2. ✅ Fix Terms and Privacy Policy
3. ✅ Update Cancellation Policy

### Week 4: UI/UX Improvements
1. ✅ Accessibility improvements
2. ✅ Error handling improvements
3. ✅ Loading states

### Week 5: Store Setup
1. ✅ Create app store assets
2. ✅ Write app descriptions
3. ✅ Set up App Store Connect
4. ✅ Set up Google Play Console

### Week 6: Testing & Submission
1. ✅ Comprehensive testing
2. ✅ Fix any issues found
3. ✅ Submit to both stores

---

## 🛠️ TECHNICAL TASKS BREAKDOWN

### Payment System Migration

#### Step 1: Install Dependencies
```bash
cd menurai-app
npm install react-native-iap
# or
npx expo install expo-in-app-purchases
```

#### Step 2: Create IAP Service
Create: `menurai-app/src/services/iapService.ts`
- Product fetching
- Purchase flow
- Receipt validation
- Subscription restoration

#### Step 3: Update Backend
Modify: `functions/src/index.ts`
- Add Apple receipt validation function
- Add Google Play purchase token validation
- Update subscription management

#### Step 4: Update Paywall Screen
Modify: `menurai-app/src/screens/PaywallScreen.tsx`
- Replace Razorpay with IAP
- Update purchase flow
- Handle platform differences

#### Step 5: Configure Store Products
- Apple App Store Connect: Create subscription products
- Google Play Console: Create subscription products

---

### Age Verification Implementation

#### Step 1: Create Age Verification Screen
Create: `menurai-app/src/screens/AgeVerificationScreen.tsx`
- Date picker or age input
- Validation (must be 13+)
- Clear messaging

#### Step 2: Integrate into Auth Flow
Modify: `menurai-app/src/navigation/AppNavigator.tsx`
- Add age verification before account creation
- Block users under 13

#### Step 3: Update Privacy Policy
Modify: `menurai-app/src/screens/PrivacyPolicyScreen.tsx`
- Clarify age requirements
- Add parental consent information (if needed)

---

### Account Deletion Implementation

#### Step 1: Create Deletion Service
Create: `menurai-app/src/services/accountDeletionService.ts`
- Delete user data from Firestore
- Delete user images from Storage
- Delete user account from Auth
- Handle errors gracefully

#### Step 2: Create Backend Function
Modify: `functions/src/index.ts`
- Add `deleteUserAccount` Cloud Function
- Delete all user data
- Handle subscriptions (cancel if active)

#### Step 3: Add UI
Modify: `menurai-app/src/screens/ProfileScreen.tsx`
- Add "Delete Account" option
- Add confirmation dialog
- Show clear warnings

---

## 📝 QUICK WINS (Can Do Immediately)

1. **Update Terms Screen** - Fix payment processing section (5 minutes)
2. **Update Cancellation Policy** - Add store refund policy compliance (10 minutes)
3. **Add Support Email** - Ensure contact information is correct (2 minutes)
4. **Verify App Icons** - Check icon sizes meet requirements (5 minutes)
5. **Review Privacy Policy** - Add data deletion section (15 minutes)

---

## 🚨 COMMON REJECTION REASONS TO AVOID

1. **Payment Issues** - Using third-party payment for digital goods
2. **Missing Privacy Policy** - Not accessible or incomplete
3. **Age Verification** - No age gate for apps with user accounts
4. **Data Deletion** - No way for users to delete their data
5. **Misleading Content** - Terms don't match actual implementation
6. **Crash on Launch** - App crashes during review
7. **Missing Permissions** - Not explaining why permissions are needed
8. **Incomplete Functionality** - Features don't work as described

---

## 📞 SUPPORT RESOURCES

### Apple Developer Support
- [App Store Review](https://developer.apple.com/contact/app-store/)
- [Developer Forums](https://developer.apple.com/forums/)

### Google Play Support
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [Developer Policy Support](https://support.google.com/googleplay/android-developer/contact/policy)

### Technical Resources
- [react-native-iap Documentation](https://github.com/dooboolab/react-native-iap)
- [Apple IAP Guide](https://developer.apple.com/in-app-purchase/)
- [Google Play Billing](https://developer.android.com/google/play/billing)

---

## ✅ PRE-SUBMISSION CHECKLIST

### Technical
- [ ] App builds successfully
- [ ] No crashes in testing
- [ ] All features work
- [ ] Payment system uses IAP/Billing
- [ ] Age verification implemented
- [ ] Account deletion works
- [ ] Error handling is comprehensive

### Legal
- [ ] Privacy Policy complete and accessible
- [ ] Terms of Service accurate
- [ ] Cancellation Policy complies with stores
- [ ] All legal documents up to date

### Store Requirements
- [ ] App icons meet requirements
- [ ] Screenshots created
- [ ] App descriptions written
- [ ] In-app purchases configured
- [ ] Content rating completed

### Testing
- [ ] Tested on multiple devices
- [ ] Tested payment flows
- [ ] Tested error scenarios
- [ ] Tested accessibility

---

**Next Steps:**
1. Review this plan with the team
2. Prioritize tasks based on timeline
3. Start with critical blockers
4. Set up store accounts early
5. Begin testing as soon as possible
