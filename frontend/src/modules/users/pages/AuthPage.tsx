import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { auth } from "../../../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import axiosInstance from "../../../axios.config";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Email/Password Authentication (direct to backend)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let firebaseUser;

      if (isSignUp) {
        // Only allow registration for normal users
        firebaseUser = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        firebaseUser = await signInWithEmailAndPassword(auth, email, password);
      }

      // Get Firebase token
      const token = await firebaseUser.user.getIdToken();

      // Send both user data and token to backend
      const response = await axiosInstance.post("/users/auth/firebase", {
        firebaseUser: {
          uid: firebaseUser.user.uid,
          email: firebaseUser.user.email,
        },
        token,
      });

      // Store token
      localStorage.setItem("token", token);
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      // Redirect based on role
      const userData = response.data as { user: { role: string } };
      if (userData.user.role === "user") {
        navigate("/");
      } else {
        navigate("/admin/auth");
      }
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else if (isSignUp) {
        setError("Registration failed. Please contact an admin.");
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Authentication (via Firebase)
  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);

      const provider = new GoogleAuthProvider();
      const firebaseUser = await signInWithPopup(auth, provider);

      // Get Firebase token
      const token = await firebaseUser.user.getIdToken();

      // Send both user data and token to backend
      const response = await axiosInstance.post("/users/auth/firebase", {
        firebaseUser: {
          uid: firebaseUser.user.uid,
          email: firebaseUser.user.email,
        },
        token,
      });

      // Store token
      localStorage.setItem("token", token);
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      // Redirect based on role
      const userData = response.data as { user: { role: string } };
      if (userData.user.role === "user") {
        navigate("/");
      } else {
        navigate("/admin/auth");
      }
    } catch (err: any) {
      console.error("Google Sign In Error:", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to SaloGame
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {isSignUp ? "Create a new account" : "Sign in to your account"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                  OR
                </span>
              </div>
            </div>
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center px-4 py-2.5 
    border border-gray-300 dark:border-gray-600 rounded-md 
    bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Continue with Google
              </span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <NavLink
              to="/"
              className="inline-block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
            >
              ← Back to Home
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};
export default AuthPage;
