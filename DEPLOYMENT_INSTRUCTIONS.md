# Firebase Hosting Deployment Instructions

Since you only have access to Firebase Console and not CLI, here are the options to deploy your app:

## Option 1: Using CI Token (Recommended for Manual Deployment)

### Step 1: Get Firebase CI Token

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **menu-mentor-prod**
3. Click the gear icon ⚙️ next to "Project Overview"
4. Go to **Project Settings** > **Service Accounts**
5. Click **"Generate New Private Key"** - this downloads a JSON file
6. Save this file securely (you'll need it for authentication)

### Step 2: Deploy Using the Script

I've created a deployment script (`deploy.sh`) that you can use. However, since you don't have CLI access, you'll need to:

**Option A: Use GitHub Actions (Recommended)**
- The workflow file is already created at `.github/workflows/firebase-deploy.yml`
- You need to add the Firebase Service Account JSON as a GitHub Secret:
  1. Go to your GitHub repository
  2. Settings > Secrets and variables > Actions
  3. Click "New repository secret"
  4. Name: `FIREBASE_SERVICE_ACCOUNT`
  5. Value: Paste the entire contents of the JSON file you downloaded
  6. Save the secret
- Then push to main/master branch or manually trigger the workflow

**Option B: Use a CI/CD Service**
- Services like GitHub Actions, GitLab CI, or CircleCI can deploy automatically
- Use the service account JSON for authentication

## Option 2: Firebase Console Direct Deployment

Unfortunately, Firebase Console **does not support manual file uploads** for Hosting. You can only:
- View deployment history
- Rollback to previous versions
- Configure hosting settings

## Option 3: Temporary CLI Access

If you can temporarily get CLI access (even on a different machine):

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Build and deploy
cd menurai-app
npm install
npm run build:web
cd ..
firebase deploy --only hosting
```

## Current Build Status

✅ **Build completed successfully!**
- Build output is in: `menurai-app/dist/`
- Firebase hosting is configured to serve from: `menurai-app/dist`
- Project ID: `menu-mentor-prod`

## Next Steps

1. **For immediate deployment**: Set up GitHub Actions with the service account secret (Option 1A)
2. **For future deployments**: Push to main/master branch - GitHub Actions will deploy automatically
3. **For manual control**: Use the `deploy.sh` script with a CI token

## Files Created

- `.github/workflows/firebase-deploy.yml` - GitHub Actions workflow for automated deployment
- `deploy.sh` - Manual deployment script
- `DEPLOYMENT_INSTRUCTIONS.md` - This file

## Need Help?

If you need assistance setting up GitHub Actions or have questions about the deployment process, let me know!
