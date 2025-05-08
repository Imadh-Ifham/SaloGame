// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import axiosInstance from "../axios.config";

interface User {
  email: string;
  role: "user" | "manager" | "owner";
  id: string;
  googlePhotoUrl?: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          const response = await axiosInstance.get("/users/profile");
          // Check if the user has a profile image
          setUser({
            ...response.data,
            googlePhotoUrl: firebaseUser.photoURL || undefined
          } as User);
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