import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { auth } from "../../../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import axiosInstance from "../../../axios.config";
import bgimage from "../../../assets/bgimage.jpg";
import kids1 from "../../../assets/kids1.jpg";
import Leona from "../../../assets/Leona.jpg";
import fifa from "../../../assets/fifa.jpg";


const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const gameImages = [
    bgimage, 
    kids1,
    Leona,
    fifa
    
  ];

  //slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % gameImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [gameImages.length]);

  // Handle Email/Password Authentication (direct to backend)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let firebaseUser;

      if (isSignUp) {
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
    <div className="min-h-screen flex bg-gray-900 overflow-hidden">
      {/* Left Side - Auth Form */}
      <div className="w-full md:w-2/5 xl:w-1/3 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-20" />
        <div className="max-w-md w-full space-y-8 z-10 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-emerald-400 font-orbitron drop-shadow-glow">
              SALOGAME
            </h1>
            <p className="text-gray-300 text-lg tracking-wide transform transition-all duration-500 hover:scale-105">
              {isSignUp ? "CREATE PROFILE" : "Wecome To SaloGame"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/40 text-red-300 rounded-xl border border-red-700/80 backdrop-blur-sm flex items-center space-x-3 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleAuth} className="space-y-6">
  <div className="space-y-5">
    <div className="relative group">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-5 py-4 rounded-xl bg-gray-800/70 border-2 border-gray-700 focus:border-emerald-500 outline-none text-gray-100 placeholder-gray-500 transition-all duration-300 focus:ring-4 focus:ring-emerald-500/20 group-hover:border-emerald-500/50"
        placeholder="gamer@salolounge.com"
      />
      <div className="absolute right-4 top-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <div className="relative group">
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-5 py-4 rounded-xl bg-gray-800/70 border-2 border-gray-700 focus:border-emerald-500 outline-none text-gray-100 placeholder-gray-500 transition-all duration-300 focus:ring-4 focus:ring-emerald-500/20 group-hover:border-emerald-500/50"
        placeholder="••••••••"
      />
      <div className="absolute right-4 top-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
    </div>
  </div>

  {/* Forgot Password Link */}
  <div className="text-right">
  <NavLink
    to="/forgot-password"
    className="text-sm text-emerald-400 hover:text-emerald-500 transition-colors"
  >
    Forgot Password?
  </NavLink>
  </div>

  <button
    type="submit"
    disabled={loading}
    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:opacity-50 flex items-center justify-center"
  >
    {loading ? (
      <div className="flex items-center justify-center space-x-3">
        <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
        <span className="animate-pulse">Initializing System...</span>
      </div>
    ) : isSignUp ? (
      <span className="tracking-wider">Sign Up</span>
    ) : (
      <span className="tracking-wider">Sign In</span>
    )}
  </button>
</form>

          {/* Social Auth */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gray-900 text-gray-500 text-sm tracking-wide">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            <button
  onClick={handleGoogleSignIn}
  disabled={loading}
  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-gray-800/50 border-2 border-gray-700/50 rounded-xl hover:border-emerald-500/30 hover:bg-gray-800/80 transition-all duration-300 group"
>
  <svg
    className="w-6 h-6 group-hover:scale-110 transition-transform"
    viewBox="0 0 48 48"
  >
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
  <span className="font-medium text-gray-300 tracking-wide group-hover:text-emerald-400 transition-colors">
    ?
  </span>
</button>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-5">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-gray-400 hover:text-emerald-400 transition-colors tracking-wide transform hover:scale-105"
            >
              {isSignUp
                ? "↺ Already have an account?"
                : "↑ SignUP?"}
            </button>
            
            <div>
              <NavLink
                to="/"
                className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-400 transition-colors group"
              >
                <svg
                  className="w-4 h-4 mr-2 group-hover:animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="tracking-wide">Back to Home </span>
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image Slideshow */}
      <div className="hidden md:block flex-1 relative bg-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          {gameImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
              style={{
                backgroundImage: `linear-gradient(to right, rgba(16,24,39,0.9) 30%, transparent), url(${img})`,
                zIndex: index === currentImageIndex ? 1 : 0
              }}
            />
          ))}
        </div>

        {/* Slideshow Controls */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {gameImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-100 ${index === currentImageIndex ? 'bg-emerald-500 scale-125' : 'bg-gray-400 hover:bg-emerald-400'}`}
            />
          ))}
        </div>

        {/* Explore Games Link */}
        <div className="absolute top-10 left-10 right-10 text-center z-10">
          <NavLink 
            to="/games"
            className="inline-flex items-center px-8 py-4 space-x-3 bg-black/50 backdrop-blur-sm border-2 border-emerald-500/30 text-emerald-400 hover:text-white rounded-2xl text-lg font-orbitron tracking-wide hover:border-emerald-400 hover:bg-emerald-500/10 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30"
          >
            <span>Explore Games</span>
            <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
