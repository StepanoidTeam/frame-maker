import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';

// Firebase configuration
// Values are injected from .env file (local) or GitHub Secrets (deployment)
// Run: npm run env:inject (for local development)
const firebaseConfig = {
  apiKey: 'AIzaSyDFIZh6Axauw3seJMPaTBrN_4PXTWxYIBw',
  authDomain: 'authentication-febe0.firebaseapp.com',
  projectId: 'authentication-febe0',
  storageBucket: 'authentication-febe0.firebasestorage.app',
  messagingSenderId: '166632796',
  appId: '1:166632796:web:0c85c04642d94f3804f599',
  measurementId: 'G-30K3Z513HC',
};

const app = initializeApp(firebaseConfig);

export { app };
