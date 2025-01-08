// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEHH16zcYFfC45vpNTTZMNO-61uDNrOCQ",
  authDomain: "salobook.firebaseapp.com",
  projectId: "salobook",
  storageBucket: "salobook.firebasestorage.app",
  messagingSenderId: "381633825277",
  appId: "1:381633825277:web:8add9d4d9243c674167194",
  measurementId: "G-DY93PLLMRN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
