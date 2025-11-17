#!/bin/bash

# Firebase Hosting Deployment Script
# This script uses a CI token for authentication

set -e

echo "🚀 Starting Firebase Hosting Deployment..."

# Check if FIREBASE_TOKEN is set
if [ -z "$FIREBASE_TOKEN" ]; then
    echo "❌ Error: FIREBASE_TOKEN environment variable is not set"
    echo ""
    echo "To get your Firebase CI token:"
    echo "1. Go to Firebase Console: https://console.firebase.google.com/"
    echo "2. Select your project: menu-mentor-prod"
    echo "3. Click on the gear icon ⚙️ next to 'Project Overview'"
    echo "4. Go to 'Project Settings' > 'Service Accounts'"
    echo "5. Click 'Generate New Private Key' to download a service account JSON"
    echo "   OR"
    echo "   Use: firebase login:ci (if you have CLI access)"
    echo ""
    echo "Then run:"
    echo "export FIREBASE_TOKEN='your-token-here'"
    echo "./deploy.sh"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"

# Build the web app
echo "📦 Building web app..."
cd menurai-app
npm install
npm run build:web
cd ..

# Deploy to Firebase Hosting
echo "🔥 Deploying to Firebase Hosting..."
firebase deploy --only hosting --token "$FIREBASE_TOKEN"

echo "✅ Deployment completed successfully!"
echo "🌐 Your app should be live at: https://menu-mentor-prod.web.app"
