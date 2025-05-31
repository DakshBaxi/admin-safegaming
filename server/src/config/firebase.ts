import { config } from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

config();

function initializeFirebaseAdmin() {
  try {
    // Check if environment variable exists
    const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    
    if (!base64ServiceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is required');
    }

    // Decode base64 string to JSON
    const serviceAccountBuffer = Buffer.from(base64ServiceAccount, 'base64');
    const serviceAccount = JSON.parse(serviceAccountBuffer.toString()) as ServiceAccount;



    // Initialize Firebase Admin
    const app = initializeApp({
      credential: cert(serviceAccount)
    });

    console.log('Firebase Admin initialized successfully');
    return getAuth(app);

  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    process.exit(1);
  }
}

export const auth = initializeFirebaseAdmin();
