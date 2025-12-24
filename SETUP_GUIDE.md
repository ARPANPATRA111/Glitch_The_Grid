# IIPS Smart Placement Portal - Setup Guide

This guide explains how to obtain all the credentials required in the `.env.example` file.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
   - [Client Configuration](#firebase-client-configuration)
   - [Admin SDK Configuration](#firebase-admin-sdk-configuration)
3. [Google Gemini API Key](#google-gemini-api-key)
4. [Session Secret Key](#session-secret-key)
5. [Quick Start Commands](#quick-start-commands)

---

## Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** (Package Manager) - Install with `npm install -g pnpm`
- **Google Account** for Firebase and Gemini API access

---

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (or "Add project")
3. Enter a project name (e.g., `iips-placement-portal`)
4. Enable/disable Google Analytics as per your preference
5. Click **"Create project"** and wait for setup to complete

### Step 2: Enable Authentication

1. In your Firebase project, go to **Build → Authentication**
2. Click **"Get started"**
3. Go to **Sign-in method** tab
4. Click on **Google** provider
5. Toggle **Enable**
6. Add a **Support email** (your email)
7. Click **Save**

### Step 3: Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (recommended) or test mode
4. Select a location closest to your users (e.g., `asia-south1` for India)
5. Click **Enable**

### Step 4: Enable Firebase Storage

1. Go to **Build → Storage**
2. Click **"Get started"**
3. Review security rules and click **Next**
4. Select the same location as Firestore
5. Click **Done**

---

## Firebase Client Configuration

These credentials are safe to expose in the browser (prefixed with `NEXT_PUBLIC_`).

### How to Get Client Credentials:

1. In Firebase Console, go to **Project Settings** (gear icon ⚙️)
2. Scroll down to **"Your apps"** section
3. Click on **Web** icon (</>) to add a web app
4. Enter an app nickname (e.g., `iips-portal-web`)
5. Optionally enable Firebase Hosting
6. Click **"Register app"**
7. You'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### Map to `.env.local`:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

---

## Firebase Admin SDK Configuration

These credentials are **SECRET** and should never be exposed to the client.

### How to Generate Service Account Key:

1. In Firebase Console, go to **Project Settings** (gear icon ⚙️)
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** to download the JSON file
5. **⚠️ Keep this file secure! Never commit it to Git.**

### The downloaded JSON looks like:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  ...
}
```

### Map to `.env.local`:

```dotenv
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBA...(entire key)...\n-----END PRIVATE KEY-----\n"
```

> **Important:** The private key should be wrapped in double quotes and keep the `\n` characters.

---

## Google Gemini API Key

We use Google's Gemini AI for resume parsing and skill extraction.

### How to Get Gemini API Key:

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **"Get API key"** in the left sidebar
4. Click **"Create API key"**
5. Choose an existing Google Cloud project or create a new one
6. Copy the generated API key

### Alternative: Via Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services → Library**
4. Search for **"Generative Language API"** or **"Gemini API"**
5. Click **Enable**
6. Go to **APIs & Services → Credentials**
7. Click **"+ CREATE CREDENTIALS"** → **API key**
8. Copy the API key

### Add to `.env.local`:

```dotenv
GOOGLE_GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Pricing Note:
- Gemini API offers a **free tier** with generous limits
- Free tier: 60 requests per minute, 1 million tokens per month
- Check [Gemini API Pricing](https://ai.google.dev/pricing) for details

---

## Session Secret Key

This is used for encrypting session cookies.

### How to Generate:

#### Option 1: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Option 2: Using OpenSSL
```bash
openssl rand -hex 32
```

#### Option 3: Online Generator
Use a secure random string generator to create a 32+ character string.

### Add to `.env.local`:

```dotenv
SESSION_SECRET_KEY=your_generated_64_character_hex_string_here
```

---

## Complete `.env.local` Example

```dotenv
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=iips-portal.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=iips-portal
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=iips-portal.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# Firebase Admin (Server-side only)
FIREBASE_ADMIN_PROJECT_ID=iips-portal
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@iips-portal.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBA...\n-----END PRIVATE KEY-----\n"

# Google Gemini API for Resume Parsing
GOOGLE_GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx

# Session Configuration
SESSION_SECRET_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456

# Environment
NODE_ENV=development

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Quick Start Commands

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment file and add your credentials
cp .env.example .env.local

# 3. Run development server
pnpm dev

# 4. Open in browser
# http://localhost:3000
```

### Admin Scripts

```bash
# Set user as admin (replace USER_ID with actual Firebase UID)
pnpm set-claims -- --uid=USER_ID --role=admin

# Generate 50 mock students
pnpm seed:students -- --generate=50

# Generate 15 sample placement drives
pnpm seed:drives -- --count=15

# Dry run (preview without writing)
pnpm seed:students -- --generate=50 --dry-run
```

---

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Ensure Google Sign-in is enabled in Firebase Authentication
- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are correct

### "Permission denied" in Firestore
- Check Firestore security rules allow authenticated users
- Verify the service account has correct permissions

### "Gemini API key not valid"
- Ensure the Generative Language API is enabled in Google Cloud
- Check the API key doesn't have IP restrictions blocking your server

### "Session cookie not working"
- Verify `SESSION_SECRET_KEY` is at least 32 characters
- Check browser cookies are enabled

---

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Rotate API keys** periodically
3. **Use environment-specific keys** for dev/staging/production
4. **Enable Firebase App Check** for production
5. **Set up Firestore security rules** to restrict access

---

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [Next.js Documentation](https://nextjs.org/docs)
