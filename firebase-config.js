import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';

// Firebase configuration
// Values are injected from .env file (local) or GitHub Secrets (deployment)
// Run: npm run env:inject (for local development)
const firebaseConfig = {
  apiKey: '{{FIREBASE_API_KEY}}',
  authDomain: '{{FIREBASE_AUTH_DOMAIN}}',
  projectId: '{{FIREBASE_PROJECT_ID}}',
  storageBucket: '{{FIREBASE_STORAGE_BUCKET}}',
  messagingSenderId: '{{FIREBASE_MESSAGING_SENDER_ID}}',
  appId: '{{FIREBASE_APP_ID}}',
  measurementId: '{{FIREBASE_MEASUREMENT_ID}}',
};

const app = initializeApp(firebaseConfig);

export { app };
