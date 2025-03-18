import { useState } from "react";
import { auth } from "../../../config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { NavLink } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(" Password Reset Link has been sent!Check your  email.");
    } catch (err: any) {
      setError(err.message || "Transmission failed. Try again, operative.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 font-poppins">
      <div className="relative w-full max-w-md rounded-2xl border border-emerald-500/30 bg-gray-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-emerald-500/10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-emerald-400 font-orbitron drop-shadow-glow mb-2">
            PASSWORD RESET
          </h2>
          <p className="text-gray-400 tracking-wide">
            Change Password
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* Email Input */}
          <div className="relative group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-gray-800/70 border-2 border-gray-700 focus:border-emerald-500 outline-none text-gray-100 placeholder-gray-500 transition-all duration-300 focus:ring-4 focus:ring-emerald-500/20 group-hover:border-emerald-500/50"
            />
            <div className="absolute right-4 top-4 text-gray-500 group-focus-within:text-emerald-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Reset Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
          >
           SEND RECOVERY EMAIL
          </button>

          {/* Messages */}
          {message && (
            <div className="p-4 bg-emerald-900/30 text-emerald-400 rounded-xl border border-emerald-800 flex items-center space-x-3 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-900/30 text-red-400 rounded-xl border border-red-800 flex items-center space-x-3 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <NavLink
            to="/auth"
            className="inline-flex items-center text-sm text-gray-400 hover:text-emerald-400 transition-colors group"
          >
            <svg
              className="w-4 h-4 mr-2 group-hover:animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <span className="tracking-wide">Back to Login Page</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;