# Menurai - React Native Expo App

## Overview
Menurai is a React Native Expo application that helps users with dietary restrictions dine with confidence by analyzing restaurant menus using AI. This app is a complete migration from the Flutter version while maintaining all functionality and improving the UI/UX.

## Features Implemented

### ✅ Core Infrastructure
- **React Native Expo** project with TypeScript
- **Firebase Integration** for authentication, database, storage, and cloud functions
- **Theme System** with light/dark mode support (shadcn-inspired)
- **Navigation** with React Navigation (Stack + Bottom Tabs)

### ✅ Authentication
- **Google Sign-In** (ready for both web and mobile platforms)
- Social auth buttons UI (Google, X, Facebook, GitHub - others coming soon)
- Auth state management with React hooks
- Session persistence with AsyncStorage

### ✅ User Management
- **User Profile Service** with Firestore integration
- **Profile Setup Screen** for dietary preferences
- **Profile Screen** with user info and settings
- 30-day edit lock for dietary preferences
- Custom restrictions management

### ✅ UI Components
- Custom **Button** component with variants
- **Card** component with filled/outlined variants
- **Chip** component for selections
- **LoadingOverlay** for async operations
- **DottedBorder** for premium placeholders
- **SocialAuthButtons** component

### 🚧 In Progress / Pending
- [ ] Custom animated tab bar (most complex component)
- [ ] ScanOptionsScreen for camera/gallery selection
- [ ] AnalysisScreen with Cloud Function integration
- [ ] Image upload to Firebase Storage
- [ ] Menu analysis results display
- [ ] App icons and splash screen configuration
- [ ] Cross-platform testing

## Tech Stack

### Frontend
- **React Native** with Expo SDK
- **TypeScript** for type safety
- **React Navigation v6** for routing
- **React Hooks** for state management
- **Zustand** (installed, ready for complex state if needed)

### Backend (Unchanged from Flutter app)
- **Firebase Authentication**
- **Cloud Firestore** for user profiles
- **Firebase Storage** for menu images
- **Cloud Functions** for AI analysis
- **Google Cloud Vision API** for OCR
- **Vertex AI** with Gemini model for analysis

### Styling
- Custom theme system with Colors constants
- Typography system with Inter font family
- 8px grid spacing system
- Consistent border radius and shadows

## Project Structure

```
menurai-app/
├── src/
│   ├── assets/
│   │   └── images/
│   │       └── menurai_logo.png
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Chip.tsx
│   │   ├── DottedBorder.tsx
│   │   ├── LoadingOverlay.tsx
│   │   └── SocialAuthButtons.tsx
│   ├── config/
│   │   └── firebase.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useUserProfile.ts
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── HomeNavigator.tsx
│   │   └── types.ts
│   ├── screens/
│   │   ├── AuthScreen.tsx
│   │   ├── AuthWrapper.tsx
│   │   ├── HomeScreen.tsx (placeholder)
│   │   ├── ProfileScreen.tsx
│   │   └── ProfileSetupScreen.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   └── userService.ts
│   └── theme/
│       ├── colors.ts
│       ├── styles.ts
│       └── ThemeContext.tsx
├── App.tsx
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android emulator
- Firebase project configured

### Installation

1. Install dependencies:
```bash
cd menurai-app
npm install
```

2. Configure Firebase:
   - Update the Firebase configuration in `src/config/firebase.ts` with your project credentials
   - Add Google OAuth client IDs for web, iOS, and Android platforms

3. Start the development server:
```bash
npm start
# or
expo start
```

4. Run on platforms:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

### Environment Setup

For Google Sign-In to work:
1. **Web**: Configure OAuth 2.0 client ID in Google Cloud Console
2. **iOS**: Add iOS client ID and configure URL scheme
3. **Android**: Add Android client ID and SHA-1 fingerprint

## Firebase Security Rules

The app uses the same Firebase security rules as the Flutter version:

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Next Steps

### High Priority
1. Implement custom animated tab bar
2. Create ScanOptionsScreen
3. Build AnalysisScreen with image upload
4. Integrate Cloud Function for menu analysis

### Medium Priority
1. Add Inter font files
2. Configure app icons and splash screen
3. Implement error boundaries
4. Add analytics tracking

### Low Priority
1. Implement other social auth providers
2. Add history feature
3. Add notification system
4. Implement premium features

## Migration Notes

### Key Differences from Flutter Version
- **Navigation**: React Navigation instead of Flutter Navigator
- **State Management**: React hooks instead of StatefulWidgets
- **Styling**: StyleSheet and theme context instead of Material Theme
- **Firebase**: Using Firebase JS SDK (may switch to React Native Firebase for better performance)
- **Animations**: Will use React Native Reanimated for the custom tab bar

### Complex Components to Recreate
1. **AnimatedTabBar**: The most complex component with sliding bubble animation
   - Requires React Native Reanimated
   - Custom SVG paths for wave effect
   - Smooth 300ms transitions

2. **Image Handling**: Different approach for web vs native platforms
   - Using expo-image-picker
   - Platform-specific upload logic

## Development Commands

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web

# Type checking
npx tsc --noEmit

# Linting (once configured)
npm run lint
```

## Testing

Testing setup is pending. Will include:
- Unit tests with Jest
- Component testing with React Native Testing Library
- E2E tests with Detox or Maestro

## Performance Considerations

- Lazy loading screens with React.lazy (when needed)
- Image optimization with expo-image
- Memoization for expensive computations
- Firestore query optimization
- Bundle size optimization with tree shaking

## Contributing

1. Follow the existing code structure and naming conventions
2. Maintain TypeScript type safety
3. Update the todo list when adding new features
4. Test on both iOS and Android before submitting

## License

This project maintains the same license as the original Flutter application.

## Contact

For questions or issues, please refer to the original Flutter app documentation or create an issue in the repository.