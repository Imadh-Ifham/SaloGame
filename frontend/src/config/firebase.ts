import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.replace(';', ''),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.replace(';', ''),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.replace(';', ''),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.replace(';', ''),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.replace(';', ''),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.replace(';', ''),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.replace(';', '')
};

const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { db, auth, provider, doc, setDoc };
