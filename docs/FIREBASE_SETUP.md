Firebase setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password) and Firestore Database.
3. (Optional) Install and run the Firebase Emulator for local testing.
4. Copy the Firebase config and place values into `.env.local` in the project root using keys from `.env.example`.

Example `.env.local` (do NOT commit):

VITE_FIREBASE_API_KEY=yourKey
VITE_FIREBASE_AUTH_DOMAIN=yourDomain
VITE_FIREBASE_PROJECT_ID=yourProjectId
VITE_FIREBASE_STORAGE_BUCKET=yourBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=yourSenderId
VITE_FIREBASE_APP_ID=yourAppId
VITE_FIREBASE_MEASUREMENT_ID=yourMeasurementId

5. Restart the dev server after adding `.env.local`.
