/**
 * Script to inject .env variables directly into firebase-config.js
 * Run: npm run env:inject
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load .env file
dotenv.config({ path: join(rootDir, '.env') });

// Get environment variables
const envVars = {
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '',
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || '',
};

// Read firebase-config.js
const configPath = join(rootDir, 'firebase-config.js');
let configContent = readFileSync(configPath, 'utf8');

// Replace placeholders with actual values from .env
configContent = configContent.replace(/\{\{FIREBASE_API_KEY\}\}/g, envVars.FIREBASE_API_KEY);
configContent = configContent.replace(/\{\{FIREBASE_AUTH_DOMAIN\}\}/g, envVars.FIREBASE_AUTH_DOMAIN);
configContent = configContent.replace(/\{\{FIREBASE_PROJECT_ID\}\}/g, envVars.FIREBASE_PROJECT_ID);
configContent = configContent.replace(/\{\{FIREBASE_STORAGE_BUCKET\}\}/g, envVars.FIREBASE_STORAGE_BUCKET);
configContent = configContent.replace(/\{\{FIREBASE_MESSAGING_SENDER_ID\}\}/g, envVars.FIREBASE_MESSAGING_SENDER_ID);
configContent = configContent.replace(/\{\{FIREBASE_APP_ID\}\}/g, envVars.FIREBASE_APP_ID);
configContent = configContent.replace(/\{\{FIREBASE_MEASUREMENT_ID\}\}/g, envVars.FIREBASE_MEASUREMENT_ID);

// Write updated firebase-config.js
writeFileSync(configPath, configContent, 'utf8');

console.log('✓ Firebase config updated from .env file');
console.log(`✓ File updated: ${configPath}`);

