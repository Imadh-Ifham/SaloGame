import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import https from 'https';  // Add this import

dotenv.config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
  throw new Error('Firebase configuration is incomplete. Check your environment variables.');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  httpAgent: new https.Agent({
    timeout: 30000 // Increase timeout to 30 seconds
  })
});

export default admin;