// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import axiosInstance from "../axios.config";

interface User {
  email: string;
  role: "user" | "admin";
  id: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await axiosInstance.post("/auth/verify-session", {
            idToken
          });
          setUser(response.data.user);
        } catch (error) {
          console.error("Session verification failed:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};