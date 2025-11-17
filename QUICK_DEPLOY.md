# Quick Deployment Guide

## ✅ Your app is built and ready to deploy!

The web build is complete and located in `menurai-app/dist/`

## 🚀 Fastest Way to Deploy (Using GitHub Actions)

Since you only have Firebase Console access, here's the easiest way:

### Step 1: Get Service Account Key from Firebase Console

1. Go to: https://console.firebase.google.com/project/menu-mentor-prod/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"**
3. Download the JSON file (keep it secure!)

### Step 2: Add Secret to GitHub

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `FIREBASE_SERVICE_ACCOUNT`
5. Value: Open the downloaded JSON file and copy **ALL** its contents, paste it here
6. Click **"Add secret"**

### Step 3: Deploy

**Option A: Automatic (Recommended)**
- Push any commit to `main` or `master` branch
- GitHub Actions will automatically build and deploy

**Option B: Manual Trigger**
- Go to **Actions** tab in GitHub
- Select **"Deploy to Firebase Hosting"** workflow
- Click **"Run workflow"** → **"Run workflow"**

## 📋 What I've Set Up For You

✅ Built web app (`menurai-app/dist/`)
✅ Created GitHub Actions workflow (`.github/workflows/firebase-deploy.yml`)
✅ Created deployment script (`deploy.sh`)
✅ Configured Firebase hosting settings

## 🎯 Your App Will Be Live At

After deployment, your app will be available at:
- https://menu-mentor-prod.web.app
- https://menu-mentor-prod.firebaseapp.com

## ⚠️ Important Notes

- Firebase Console **cannot** upload files directly - you need CI/CD or CLI
- The GitHub Actions workflow I created will handle everything automatically
- Once set up, future deployments happen automatically on push to main/master

## 🆘 Need Help?

If you encounter any issues:
1. Check GitHub Actions logs for error messages
2. Verify the service account JSON is correctly added as a secret
3. Ensure your Firebase project has Hosting enabled
