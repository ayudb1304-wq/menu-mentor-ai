# Menu Mentor AI

An AI-powered menu analyzer that helps users make safe dietary choices by analyzing restaurant menus against their dietary preferences and restrictions.

## Features

- 🤖 **AI-Powered Analysis**: Uses Google's Gemini AI to intelligently analyze menu items
- 🔍 **OCR Text Extraction**: Extracts text from menu images using Google Cloud Vision API
- 🛡️ **Safety-First Approach**: Prioritizes user safety by flagging ambiguous items
- 📊 **Classification System**:
  - **Compliant**: 100% safe for the user's dietary profile
  - **Non-Compliant**: Contains restricted ingredients
  - **Modifiable**: Can be made safe with modifications

## Tech Stack

- **Backend**: Firebase Cloud Functions (Node.js 22)
- **AI/ML**: Google Gemini AI, Google Cloud Vision API
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Frontend**: HTML/JavaScript with Firebase SDK

## Setup Instructions

### Prerequisites

- Node.js 22 or higher
- Firebase CLI installed (`npm install -g firebase-tools`)
- Google Cloud Project with Firebase enabled
- Vertex AI API enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ayudb1304-wq/menu-mentor-ai.git
   cd menu-mentor-ai
   ```

2. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Cloud Functions, Firestore, and Storage
   - Enable Vertex AI API in Google Cloud Console
   - Update `.firebaserc` with your project ID

4. Deploy Firebase Functions:
   ```bash
   firebase deploy --only functions
   ```

### Local Development

1. Set up Firebase emulators:
   ```bash
   firebase emulators:start
   ```

2. For testing, create a local copy of `test-phase2.html` with your Firebase config:
   ```bash
   cp test-phase2.html test-phase2.local.html
   ```
   Then update the Firebase config in `test-phase2.local.html` with your actual credentials.

3. Add `test-phase2.local.html` to `.gitignore` (already configured)

## Project Structure

```
menu-mentor-ai/
├── functions/
│   ├── src/
│   │   └── index.ts          # Cloud Functions with Gemini AI integration
│   ├── package.json           # Dependencies
│   └── tsconfig.json          # TypeScript configuration
├── firebase.json              # Firebase project configuration
├── firestore.rules            # Firestore security rules
├── storage.rules              # Storage security rules
├── test-phase2.html           # Test interface (template)
└── README.md                  # This file
```

## Firebase Configuration

**IMPORTANT**: Never commit your actual Firebase configuration to version control.

To use the test interface:
1. Get your Firebase config from: Firebase Console > Project Settings > General > Your apps
2. Create a local copy of `test-phase2.html`
3. Replace the placeholder values with your actual Firebase configuration
4. Keep this local file out of version control

## Security Notes

- Firebase API keys in client-side code are safe for public exposure when properly configured
- However, ensure you have proper Firebase Security Rules configured
- Never commit service account keys or admin SDK credentials
- The `.gitignore` file is configured to exclude sensitive files

## API Usage

### analyzeMenu Function

**Endpoint**: `https://<region>-<project-id>.cloudfunctions.net/analyzeMenu`

**Input**:
```javascript
{
  imageUrl: "gs://your-bucket/path/to/menu.jpg",
  userProfile: {
    diets: ["vegan", "gluten-free"],
    restrictions: ["peanuts", "shellfish"]
  }
}
```

**Output**:
```javascript
{
  items: [
    {
      name: "Dish Name",
      classification: "compliant" | "non_compliant" | "modifiable",
      reason: "Explanation for classification"
    }
  ]
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

Ayush ([@ayudb1304-wq](https://github.com/ayudb1304-wq))
