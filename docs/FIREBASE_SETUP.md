# Firebase Setup & Deployment Guide

## ✅ Project Status
Το Academy Manager είναι ήδη deployed στο Firebase με project ID: `academy-manager-v114`
**Live URL**: https://academy-manager-v114.web.app

## 🔧 Initial Firebase Setup (Completed)

1. ✅ **Firebase Project Created**: `academy-manager-v114` στο https://console.firebase.google.com/
2. ✅ **Authentication Enabled**: Email/Password authentication
3. ✅ **Firestore Database**: Enabled με proper security rules
4. ✅ **Hosting Configured**: Firebase Hosting setup με custom domain

## 📁 Environment Configuration

Το project χρησιμοποιεί `.env` αρχείο για τα Firebase credentials (δεν είναι committed στο Git για ασφάλεια).

**Current `.env` file** (τοπικά μόνο):
```env
VITE_FIREBASE_API_KEY=AIzaSyAOSrSbIGRXGamonebfMS6h6UrLCDXl2Mg
VITE_FIREBASE_AUTH_DOMAIN=academy-app-3bf82.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=academy-app-3bf82
VITE_FIREBASE_STORAGE_BUCKET=academy-app-3bf82.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=284543685017
VITE_FIREBASE_APP_ID=1:284543685017:web:084325ff20cbc96a7c0308
VITE_FIREBASE_MEASUREMENT_ID=
```

## 🚀 Deployment Process

### Για νέο deployment:
```bash
# Build για production
npm run build

# Deploy στο Firebase Hosting
npx firebase deploy --only hosting
```

### Firebase Configuration Files:
- **`.firebaserc`**: Περιέχει το project ID (`academy-manager-v114`)
- **`firebase.json`**: Hosting configuration με public directory και SPA rewrites
- **`.env`**: Firebase credentials (προστατευμένο από Git)

## 🔒 Security Notes

- Τα Firebase credentials είναι μόνο τοπικά στο `.env` αρχείο
- Το `.env` είναι στο `.gitignore` για να μην ανέβει στο repository
- Χρησιμοποιήστε τα δικά σας credentials για local development αν χρειάζεται

## 🧪 Local Development με Firebase

1. Αντιγράψτε το `.env.example` σε `.env`
2. Συμπληρώστε τα Firebase credentials σας
3. `npm run dev -- --host` για development server

## 📊 Firebase Console Access

Για πρόσβαση στο Firebase Console:
1. Πηγαίνετε στο https://console.firebase.google.com/
2. Επιλέξτε project `academy-manager-v114`
3. Διαχειριστείτε Authentication, Firestore, και Hosting από εκεί

---

**Last Updated**: October 15, 2025
