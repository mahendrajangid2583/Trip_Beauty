/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  ArrowRight, 
  Loader2, 
  KeyRound, 
  CheckCircle2, 
  ChevronLeft, 
  Lock, 
  Eye, 
  EyeOff, 
  Hash 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

// --- Helper: Password Validator (Same as Signup) ---
const validatePassword = (password) => {
  // Min 8 chars, 1 upper, 1 lower, 1 number, 1 special
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/;
  return regex.test(password);
};

function ForgotPasswordContent() {
  const navigate = useNavigate();
  
  // --- State Machine ---
  // Steps: 1=Email, 2=OTP, 3=NewPassword, 4=Success
  const [step, setStep] = useState(1);
  
  // --- Data State ---
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // --- UI State ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0); // For resend cooldown

  // --- Timer Logic for OTP Resend ---
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- Handlers ---

  // STEP 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await api.post("/api/auth/forgot-password", { email });

      // Success
      setStep(2);
      setTimer(60); // Start 60s cooldown
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/api/auth/verify-pass-otp", { email, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validatePassword(password)) {
      setError("Password must be 8-16 chars, with Uppercase, Lowercase, Number & Symbol.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/api/auth/reset-password", { 
          email, 
          otp, 
          newPassword: password 
      });

      setStep(4); // Show success
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to resend OTP
  const handleResend = async () => {
    if (timer > 0) return;
    setIsLoading(true);
    setError(null);
    try {
       await api.post("/api/auth/forgot-password", { email });
       setTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Visual Assets ---
  const backgroundImage = "https://res.cloudinary.com/dxif9sbfw/image/upload/v1762286308/mountain-with-cliff_1_izaugd.jpg";

  return (
    <div className="relative flex items-center justify-center min-h-screen font-inter p-4 overflow-hidden bg-gray-900">
      
      {/* --- Quester Immersive Background --- */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: "grayscale(50%) brightness(30%) blur(8px)",
          transform: "scale(1.05)",
        }}
      ></div>

      {/* --- Main Glass Card --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Progress Bar (Optional Visual Indicator) */}
        <div className="h-1 w-full bg-white/5">
            <motion.div 
                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-800"
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            
            {/* --- STEP 1: EMAIL INPUT --- */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                        <KeyRound className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                    <p className="text-gray-400 text-sm">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 pl-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-yellow-800/80 focus:border-transparent text-white placeholder-gray-500 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[52px] bg-[#635348] text-white rounded-lg font-semibold text-lg hover:bg-[#52443a] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                            <>
                                Send Code <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
              </motion.div>
            )}

            {/* --- STEP 2: OTP VERIFICATION --- */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                 <button 
                    onClick={() => setStep(1)} 
                    className="flex items-center text-gray-400 hover:text-white text-sm mb-6 transition-colors"
                 >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                 </button>

                 <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                    <p className="text-gray-400 text-sm">
                        We sent a code to <span className="text-yellow-500 font-medium">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div>
                         <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-yellow-800/80 focus:border-transparent text-white placeholder-gray-600 focus:outline-none transition-all text-center tracking-[0.5em] text-xl font-mono"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || otp.length !== 6}
                        className="w-full h-[52px] bg-[#635348] text-white rounded-lg font-semibold text-lg hover:bg-[#52443a] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:bg-[#4a3e36] disabled:cursor-not-allowed"
                    >
                         {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify Code"}
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-400">
                            Didn't receive email?{" "}
                            {timer > 0 ? (
                                <span className="text-gray-500">Resend in {timer}s</span>
                            ) : (
                                <button type="button" onClick={handleResend} className="text-yellow-600 hover:text-yellow-500 font-medium transition-colors">
                                    Click to resend
                                </button>
                            )}
                        </p>
                    </div>
                </form>
              </motion.div>
            )}

            {/* --- STEP 3: NEW PASSWORD --- */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                    <p className="text-gray-400 text-sm">
                        Choose a strong password to secure your account.
                    </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                    {/* New Password */}
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New password"
                                required
                                className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-yellow-800/80 focus:border-transparent text-white placeholder-gray-500 focus:outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-yellow-800/80 focus:border-transparent text-white placeholder-gray-500 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[52px] bg-[#635348] text-white rounded-lg font-semibold text-lg hover:bg-[#52443a] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:bg-[#4a3e36] disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Reset Password"}
                    </button>
                </form>
              </motion.div>
            )}

             {/* --- STEP 4: SUCCESS --- */}
             {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Password Reset</h2>
                <p className="text-gray-300 mb-8">
                    Your password has been successfully updated. You can now log in with your new credentials.
                </p>
                
                <Link
                    to="/login"
                    className="w-full h-[52px] bg-[#635348] text-white rounded-lg font-semibold text-lg hover:bg-[#52443a] transition-all duration-300 shadow-lg flex items-center justify-center"
                >
                    Back to Login
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
        
        {/* Footer Link */}
        {step === 1 && (
             <div className="bg-black/20 p-4 text-center border-t border-white/5">
                <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1">
                    <ChevronLeft className="w-3 h-3" /> Back to Login
                </Link>
             </div>
        )}
      </motion.div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default function ForgotPassword() {
    return (
        
            <ForgotPasswordContent />
        
    )
}