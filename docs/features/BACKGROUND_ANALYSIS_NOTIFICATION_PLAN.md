# Background Analysis Notification Plan

**Status:** ❌ **NOT STARTED** - Implementation plan ready, awaiting implementation

## Problem Statement
When a user uploads or scans a menu and navigates away from the AnalysisScreen (to History or Home) while the analysis is in progress, the background process completes without notifying the user. This creates a poor user experience as:
1. Users have no visibility into ongoing analysis when they navigate away
2. No notification when analysis completes in the background
3. Users might start another analysis not knowing the previous one is still processing
4. Completed results are not immediately accessible

## Current Architecture Analysis

### Current Flow
1. User uploads image → navigates to `AnalysisScreen`
2. `AnalysisScreen.startAnalysis()` calls `menuAnalysisService.processMenuImage()`
3. Local state (`isAnalyzing`, `analysisResult`) manages loading/results
4. User can navigate away during analysis
5. Promise continues but state updates are lost
6. Result saved to Firestore history but user isn't notified

### Affected Files
- `/menurai-app/src/screens/AnalysisScreen.tsx` - Local state management
- `/menurai-app/src/services/menuAnalysisService.ts` - Analysis logic
- `/menurai-app/src/services/historyService.ts` - Saves completed scans
- `/menurai-app/src/screens/HistoryScreen.tsx` - Should show pending analyses
- `/menurai-app/src/screens/HomeScreen.tsx` - Could show analysis status

## Proposed Solution

### Phase 1: Global Analysis State Management

#### 1.1 Create Analysis Context
**New File**: `/menurai-app/src/contexts/AnalysisContext.tsx`

**Purpose**: Manage global state for ongoing and completed analyses

**Features**:
- Track multiple ongoing analyses (queue support)
- Store analysis metadata (imageUri, timestamp, status)
- Provide status updates across all screens
- Handle analysis lifecycle (pending → processing → completed → error)

**State Structure**:
```typescript
interface AnalysisState {
  id: string;
  imageUri: string;
  status: 'pending' | 'uploading' | 'analyzing' | 'completed' | 'error';
  progress?: number; // Optional: for progress tracking
  result?: AnalysisResult;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

interface AnalysisContextType {
  analyses: Map<string, AnalysisState>;
  startAnalysis: (imageUri: string) => Promise<string>; // Returns analysis ID
  getAnalysisStatus: (analysisId: string) => AnalysisState | null;
  hasActiveAnalysis: () => boolean;
  latestCompletedAnalysis: AnalysisState | null;
  clearCompletedAnalysis: (analysisId: string) => void;
}
```

**Implementation Details**:
- Use React Context + useReducer for state management
- Persist pending analyses to AsyncStorage for app restart recovery
- Emit events when analysis completes (for notifications)
- Auto-cleanup completed analyses after certain time

#### 1.2 Update App.tsx
**File**: `/menurai-app/App.tsx`

**Changes**:
- Wrap app with `AnalysisProvider`
- Place it above `NavigationContainer` but inside `ThemeProvider`

```typescript
<ThemeProvider>
  <AnalysisProvider>
    <StatusBar style="auto" />
    <AppNavigator />
  </AnalysisProvider>
</ThemeProvider>
```

### Phase 2: In-App Notification System

#### 2.1 Create Notification Component
**New File**: `/menurai-app/src/components/AnalysisNotification.tsx`

**Purpose**: Display toast/banner notifications when analysis completes

**Features**:
- Non-intrusive banner at top/bottom of screen
- Shows: "Analysis Complete! Tap to view results"
- Auto-dismiss after 5 seconds or on tap
- Action button to navigate to results
- Different styles for success/error states
- Animation: slide-in from top/bottom

**Visual Design**:
- Success: Green background with checkmark icon
- Error: Red background with error icon
- Tap action: Navigate to AnalysisResult screen
- Swipe to dismiss gesture

#### 2.2 Create Global Notification Manager
**New File**: `/menurai-app/src/components/NotificationManager.tsx`

**Purpose**: Manage queue of notifications across the app

**Features**:
- Stack notifications if multiple analyses complete
- Queue system (show one at a time)
- Portal-based rendering (appears above navigation)
- Context-aware positioning (avoid overlapping with nav bars)

**Implementation**:
- Use React Native's `Modal` or custom portal
- Position above all other components
- Handle z-index properly

#### 2.3 Integrate Notification Manager
**File**: `/menurai-app/src/navigation/AppNavigator.tsx`

**Changes**:
- Add `<NotificationManager />` component at root level
- Listen to AnalysisContext for completed analyses
- Show notification when analysis completes in background

### Phase 3: Visual Indicators

#### 3.1 Update HistoryScreen
**File**: `/menurai-app/src/screens/HistoryScreen.tsx`

**Changes**:
1. Add "Analyzing..." header section when analysis is in progress
   - Show thumbnail of image being analyzed
   - Progress indicator with animated loading state
   - ETA timer (based on average analysis time)
   - Tap to view progress details

2. Add pending analysis cards to history list
   - Show as first item(s) in list
   - Different visual style (pulsing border, loading skeleton)
   - Status badge: "Analyzing..."
   - Cancel button for pending analyses

3. Real-time status updates
   - Listen to AnalysisContext state changes
   - Update UI when analysis completes
   - Smooth transition from "analyzing" to "completed" state

**UI Mock**:
```
┌─────────────────────────────────────┐
│ 🔄 Analysis in Progress             │
│ ┌─────────────────────────────────┐ │
│ │ [Thumbnail] Analyzing menu...   │ │
│ │ ████████░░░░░░ 60%              │ │
│ │ Est. 15 seconds remaining       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Scan History                         │
│ 12 total scans                       │
└─────────────────────────────────────┘

[Recent scans list...]
```

#### 3.2 Update HomeScreen (Optional)
**File**: `/menurai-app/src/screens/HomeScreen.tsx`

**Changes**:
1. Add status banner at top
   - "Analysis in progress..." with spinner
   - Tap to view progress
   - Dismiss option

2. Badge on Scan button
   - Small dot indicator when analysis is running
   - Prevents starting new analysis until current completes

#### 3.3 Create Status Badge Component
**New File**: `/menurai-app/src/components/AnalysisStatusBadge.tsx`

**Purpose**: Reusable component showing analysis status

**Features**:
- Compact badge with icon + text
- Different states: analyzing, completed, error
- Optional progress bar
- Pulsing animation for "analyzing" state

### Phase 4: Update AnalysisScreen

#### 4.1 Integrate with AnalysisContext
**File**: `/menurai-app/src/screens/AnalysisScreen.tsx`

**Changes**:
1. Replace local state with context
   - Remove `useState` for `isAnalyzing`, `analysisResult`
   - Use `AnalysisContext` instead

2. Handle navigation-away scenario
   - When component unmounts during analysis, analysis continues
   - Store analysis ID in navigation params
   - Show "Analysis running in background" message if user returns

3. Add background mode UI
   - If user navigates back to screen with active analysis
   - Show "Continue in background" option
   - "View in History" button

**Updated Flow**:
```typescript
useEffect(() => {
  if (imageUri) {
    const analysisId = await startAnalysis(imageUri);
    // Analysis continues even if component unmounts
  }
}, [imageUri]);

// Listen for completion
useEffect(() => {
  const status = getAnalysisStatus(analysisId);
  if (status?.status === 'completed') {
    // Navigate to results or show success
  }
}, [analyses]);
```

### Phase 5: Enhanced menuAnalysisService

#### 5.1 Add Progress Tracking
**File**: `/menurai-app/src/services/menuAnalysisService.ts`

**Changes**:
1. Add progress callback support
   ```typescript
   processMenuImage(
     imageUri: string,
     onProgress?: (stage: string, percent: number) => void
   ): Promise<AnalysisResult>
   ```

2. Report progress stages:
   - "uploading" (0-30%)
   - "analyzing" (30-90%)
   - "saving" (90-100%)

3. Add timeout handling
   - Set maximum analysis time (60 seconds)
   - Show helpful error message if timeout

4. Add retry mechanism
   - Automatic retry on transient failures
   - Exponential backoff

#### 5.2 Update historyService Integration
**File**: `/menurai-app/src/services/historyService.ts`

**Changes**:
1. Add "pending" scan support
   - Save scan with "pending" status before analysis starts
   - Update to "completed" when analysis finishes
   - Allows showing pending scans in history

2. Add method to update scan status
   ```typescript
   async updateScanStatus(
     scanId: string,
     status: 'pending' | 'completed' | 'error',
     result?: AnalysisResult
   ): Promise<void>
   ```

### Phase 6: Navigation Enhancements

#### 6.1 Deep Linking to Results
**Changes**:
- When notification tapped, navigate to specific scan result
- Use `navigation.navigate()` with nested params
- Handle navigation from any screen

**Implementation**:
```typescript
// In NotificationManager
const handleNotificationTap = (analysisId: string) => {
  navigation.navigate('History');
  // Or navigate directly to result:
  navigation.navigate('Scan', {
    screen: 'AnalysisResult',
    params: { scanId: analysisId }
  });
};
```

#### 6.2 Prevent Duplicate Analyses
**File**: Multiple screens

**Changes**:
- Check `hasActiveAnalysis()` before starting new scan
- Show alert: "Analysis already in progress. Please wait."
- Option to cancel current analysis and start new one

### Phase 7: Error Handling

#### 7.1 Background Error Notifications
- Show notification when analysis fails in background
- Error details in notification
- Retry button in notification
- Save failed analyses to retry later

#### 7.2 Network Resilience
- Detect network disconnection during analysis
- Queue analysis for retry when network returns
- Show "Waiting for network" status

### Phase 8: Optional Enhancements

#### 8.1 Push Notifications (Future)
- Use Expo Notifications for background notifications
- Send push notification when analysis completes
- Requires notification permissions

#### 8.2 Analysis Queue
- Allow multiple concurrent analyses
- Show queue position: "Position 2 in queue"
- Fair scheduling algorithm

#### 8.3 Offline Support
- Save images locally if network unavailable
- Auto-start analysis when network returns
- Sync with Firestore when ready

#### 8.4 Analytics & Metrics
- Track analysis success rate
- Average analysis duration
- Background completion rate
- User engagement with notifications

## Implementation Priority

### High Priority (MVP)
1. ✅ **Phase 1**: Global Analysis State Management (AnalysisContext)
2. ✅ **Phase 2**: In-App Notification System
3. ✅ **Phase 3.1**: Update HistoryScreen with pending analyses
4. ✅ **Phase 4**: Integrate AnalysisScreen with context
5. ✅ **Phase 6.1**: Deep linking to results

### Medium Priority
6. ⚠️ **Phase 3.2**: Update HomeScreen indicators
7. ⚠️ **Phase 5.1**: Progress tracking
8. ⚠️ **Phase 6.2**: Prevent duplicate analyses
9. ⚠️ **Phase 7**: Error handling

### Low Priority (Nice-to-have)
10. 💡 **Phase 8.1**: Push notifications
11. 💡 **Phase 8.2**: Analysis queue
12. 💡 **Phase 8.3**: Offline support
13. 💡 **Phase 8.4**: Analytics

## Testing Strategy

### Manual Testing
1. **Basic Flow**
   - Start analysis, navigate away, verify notification appears
   - Tap notification, verify navigation to results
   - Verify history shows pending analysis

2. **Error Cases**
   - Simulate network failure during analysis
   - Kill app during analysis, reopen
   - Start multiple analyses

3. **Edge Cases**
   - Analysis completes while on AnalysisScreen
   - Analysis completes while on HistoryScreen
   - Analysis completes while app is in background
   - Multiple analyses complete simultaneously

### Automated Testing (Future)
- Unit tests for AnalysisContext reducer
- Integration tests for notification flow
- E2E tests with Detox

## Technical Considerations

### Performance
- Limit number of concurrent analyses (1-2 max)
- Clean up completed analyses after 24 hours
- Optimize notification rendering (avoid re-renders)

### Memory Management
- Clear analysis state on logout
- Remove old AsyncStorage entries
- Limit history size (50 recent scans)

### Security
- Validate analysis results before saving
- Sanitize error messages (don't expose internal details)
- Ensure user can only access their own analyses

### Accessibility
- Screen reader support for notifications
- High contrast mode for status indicators
- Haptic feedback on completion

## Success Metrics

### User Experience
- **Primary**: Users are notified within 2 seconds of analysis completion
- **Secondary**: 90% of users successfully navigate to results from notification
- **Tertiary**: Reduced duplicate analysis attempts by 80%

### Technical
- **Reliability**: 99% of analyses show correct status
- **Performance**: Notifications render within 100ms
- **Stability**: Zero crashes related to background analysis

## Rollout Plan

### Phase 1 (Week 1)
- Implement AnalysisContext
- Basic notification system
- Update AnalysisScreen integration

### Phase 2 (Week 2)
- Update HistoryScreen with pending analyses
- Add deep linking
- Error handling

### Phase 3 (Week 3)
- Polish UI/UX
- Add progress tracking
- Testing & bug fixes

### Phase 4 (Week 4)
- Beta testing with select users
- Gather feedback
- Final adjustments

## Alternatives Considered

### Alternative 1: Firebase Cloud Messaging (FCM)
**Pros**: 
- Works when app is fully closed
- Native notification UI
- Reliable delivery

**Cons**: 
- Requires backend changes
- More complex setup
- Overkill for in-app notifications
- Permission requirements

**Decision**: Use in-app notifications for MVP, consider FCM for future

### Alternative 2: React Query / SWR
**Pros**: 
- Built-in cache management
- Automatic refetching
- Optimistic updates

**Cons**: 
- Additional dependency
- Learning curve
- May be overkill for this use case

**Decision**: Stick with Context API for simplicity

### Alternative 3: Redux / Zustand
**Pros**: 
- More powerful state management
- Better DevTools
- Scalable

**Cons**: 
- Added complexity
- More boilerplate (Redux)
- Current app doesn't use it

**Decision**: Context API is sufficient for current needs

## Risk Mitigation

### Risk 1: Analysis fails silently in background
**Mitigation**: 
- Comprehensive error handling
- Error notifications
- Retry mechanism
- Logging for debugging

### Risk 2: User confusion about notification origin
**Mitigation**: 
- Clear messaging: "Menu analysis complete"
- Include thumbnail of analyzed image
- Timestamp in notification

### Risk 3: Memory leaks from uncleaned analyses
**Mitigation**: 
- Automatic cleanup after 24 hours
- Clear on logout
- Limit concurrent analyses

### Risk 4: Race conditions with multiple analyses
**Mitigation**: 
- Use unique IDs for each analysis
- Proper async handling
- Sequential processing if needed

## Open Questions

1. **Should we allow cancelling an in-progress analysis?**
   - **Answer**: Yes, add cancel button in pending analysis card

2. **How long should notifications stay visible?**
   - **Answer**: 5 seconds auto-dismiss, but allow manual dismiss

3. **Should we show analysis history beyond current session?**
   - **Answer**: Yes, persist to AsyncStorage for app restarts

4. **What happens if user starts new analysis while one is pending?**
   - **Answer**: Show warning, require confirmation or cancel previous

5. **Should we support offline analysis queuing?**
   - **Answer**: Future enhancement, not MVP

## Dependencies

### New NPM Packages
- None required (use existing React Native libraries)

### Existing Dependencies
- React Navigation (navigation)
- React Native (core components)
- Firebase (backend)
- AsyncStorage (persistence)

## Documentation

### Developer Documentation
- Update README with AnalysisContext usage
- Add JSDoc comments to all new functions
- Create architecture diagram

### User Documentation
- Update user guide with notification behavior
- Add FAQ about background analysis
- Create video tutorial

## Conclusion

This plan addresses the core issue of background analysis visibility by:
1. ✅ Creating global state management for analyses
2. ✅ Implementing in-app notifications
3. ✅ Adding visual indicators in History screen
4. ✅ Providing deep linking to results
5. ✅ Handling errors gracefully

The phased approach allows for incremental development and testing, with the MVP focusing on the most critical user experience improvements.

**Estimated Development Time**: 2-3 weeks for MVP (Phases 1-4)
**Estimated Testing Time**: 1 week
**Total**: 3-4 weeks to production-ready

---

*Plan created: 2025-11-17*
*Last updated: 2025-11-17*
