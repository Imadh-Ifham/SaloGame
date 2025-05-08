import * as admin from "firebase-admin";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Ensure FIREBASE_ADMIN_CREDENTIALS is defined
if (!process.env.FIREBASE_ADMIN_CREDENTIALS) {
  throw new Error(
    "FIREBASE_ADMIN_CREDENTIALS environment variable is not set."
  );
}

// Parse service account credentials
const serviceAccount: admin.ServiceAccount = JSON.parse(
  process.env.FIREBASE_ADMIN_CREDENTIALS
);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Configure custom token duration
admin.auth().createCustomToken = () => {
  return Promise.resolve('customToken');
};

export default admin;
