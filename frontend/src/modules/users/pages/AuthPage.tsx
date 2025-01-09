import React, { useState } from "react";
import { auth } from "../";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{isSignUp ? "Sign Up" : "Sign In"}</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button onClick={handleAuth} className="w-full p-2 bg-blue-500 text-white rounded">
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
        <p className="mt-4 text-center">
          {isSignUp ? (
            <span>
              Already have an account?{" "}
              <button onClick={() => setIsSignUp(false)} className="text-blue-500 underline">
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don’t have an account?{" "}
              <button onClick={() => setIsSignUp(true)} className="text-blue-500 underline">
                Sign Up
              </button>
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;