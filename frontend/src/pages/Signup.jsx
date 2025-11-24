/* eslint-disable no-unused-vars */
import React, { useState, useReducer, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Hash } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/userSlice";
import api, { BASE_URL } from "../services/api";

// --- Google Icon SVG ---
const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M21.35 11.1h-9.3v2.7h5.3c-.2 1.1-.9 2-2.1 2.7v2.1h2.7c1.6-1.5 2.5-3.6 2.5-6.1 0-.6-.1-1.1-.2-1.7z" />
    <path d="M12.05 21.6c2.6 0 4.8-1.1 6.4-3l-2.7-2.1c-.8.6-1.9 1-3.1 1-2.4 0-4.4-1.6-5.1-3.8H4.2v2.2c1.4 2.8 4.3 4.7 7.8 4.7z" />
    <path d="M6.95 14.1c-.1-.6-.1-1.2-.1-1.8s0-1.2.1-1.8V8.4H4.2c-.4 1.1-.7 2.3-.7 3.6s.3 2.5.7 3.6l2.7-2.1z" />
    <path d="M12.05 6.4c1.4 0 2.6.5 3.6 1.4l2.4-2.4C16.8 3.6 14.6 2.5 12 2.5c-3.6 0-6.5 1.9-7.9 4.7l2.7 2.1c.8-2.2 2.8-3.9 5.2-3.9z" />
  </svg>
);

// --- Reducer for state management ---
const authReducer = (state, action) => {
  switch (action.type) {
    case "SIGNUP_START":
    case "VERIFY_START":
      return { ...state, isLoading: true, error: null };
    case "SIGNUP_SUCCESS":
    case "VERIFY_SUCCESS":
      return { ...state, isLoading: false, error: null };
    case "SIGNUP_FAILURE":
    case "VERIFY_FAILURE":
      return { ...state, isLoading: false, error: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const initialState = { isLoading: false, error: null };

// --- Carousel items ---
const carouselItems = [
  {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    fact: "Men who take regular vacations are 32% less likely to die from heart disease.",
  },
  {
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
    fact: "Studies show traveling improves your problem-solving skills and boosts creativity.",
  },
  {
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    fact: "Exploring a new culture increases your cognitive flexibility, making you more adaptable.",
  },
  {
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    fact: "The anticipation of a trip can boost your happiness for weeks before you even leave.",
  },
  {
    image: "https://images.unsplash.com/photo-1519681391924-f401f1011e3b?auto=format&fit=crop&w=1200&q=80",
    fact: "Couples who travel together report increased feelings of intimacy and connection.",
  },
];

export default function Signup() {
  const navigate = useNavigate();
  const reduxDispatch = useDispatch();
  
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [currentSlide, setCurrentSlide] = useState(0);

  // --- NEW STATE FOR OTP FLOW ---
  const [view, setView] = useState('signup'); // 'signup' or 'verify'
  const [otp, setOtp] = useState('');

  const { isLoading, error } = state;

  // --- Auto carousel ---
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (
      !formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/)
    ) {
      newErrors.password = "Password must be 8-16 chars, with 1 lowercase, 1 uppercase, 1 number & 1 special char.";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- REAL BACKEND CALL (MODIFIED) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch({ type: "SIGNUP_START" });

    try {
      await api.post("/api/auth/register", {
          email: formData.email,
          password: formData.password,
      });

      dispatch({ type: "SIGNUP_SUCCESS" });
      
      // --- CHANGE VIEW TO OTP FORM INSTEAD OF NAVIGATING ---
      setView('verify'); 

    } catch (err) {
      dispatch({ type: "SIGNUP_FAILURE", payload: err.response?.data?.message || err.message });
    }
  };

  // --- NEW: OTP VERIFICATION HANDLER ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    dispatch({ type: "VERIFY_START" });

    if (otp.length !== 6) {
        dispatch({ type: "SET_ERROR", payload: "OTP must be 6 digits." });
        return;
    }

    try {
        const response = await api.post("/api/auth/verify-email", {
            email: formData.email,
            otp: otp,
        });

        const data = response.data;

        dispatch({ type: "VERIFY_SUCCESS" });
        
        // --- ✅ LOGIN SUCCESS: DISPATCH TO REDUX & REDIRECT ---
        reduxDispatch(loginSuccess(data)); // data is { user: {...} }
        navigate("/"); // Redirect to home/dashboard

    } catch (err) {
        dispatch({ type: "VERIFY_FAILURE", payload: err.response?.data?.message || err.message });
    }
  };

  // --- NEW: RESEND OTP HANDLER ---
  const handleResendOtp = async () => {
    dispatch({ type: "VERIFY_START" }); // Show loading spinner
    try {
        await api.post("/api/auth/resend-verification", { email: formData.email });
        dispatch({ type: "SIGNUP_SUCCESS" }); // Re-use success to stop loading
    } catch (err) {
        dispatch({ type: "VERIFY_FAILURE", payload: err.response?.data?.message || err.message });
    }
  }

  const handleGoogleSignup = () => {
    window.location.href = `${BASE_URL}/api/auth/google`;
  };

  const backgroundImage =
    "https://res.cloudinary.com/dxif9sbfw/image/upload/v1762286308/mountain-with-cliff_1_izaugd.jpg";

  return (
    <div className="relative flex items-center justify-center min-h-screen font-inter p-4 overflow-hidden bg-gray-900">
      {/* background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-300 z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: "grayscale(50%) brightness(50%) blur(8px)",
          transform: "scale(1.05)",
        }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-20 w-full max-w-4xl bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left carousel */}
          <div className="relative h-64 md:h-full min-h-[500px] overflow-hidden">
             <div className="absolute top-0 left-0 p-8 z-10">
              <h1 className="text-4xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
               Quester
              </h1>
             </div>
           <AnimatePresence>
             <motion.div
               key={currentSlide}
               initial={{ opacity: 0, scale: 1.05 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               transition={{ duration: 2, ease: "easeInOut" }}
               className="absolute inset-0 bg-cover bg-center"
               style={{ backgroundImage: `url(${carouselItems[currentSlide].image})` }}
              />
           </AnimatePresence>
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
           <div className="absolute bottom-0 left-0 p-8 text-white">
             <AnimatePresence mode="wait">
               <motion.p
                 key={currentSlide}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                 className="text-xl font-medium mb-4"
               >
                 {carouselItems[currentSlide].fact}
               </motion.p>
             </AnimatePresence>
             <div className="flex space-x-2">
               {carouselItems.map((_, index) => (
                 <button
                   key={index}
                   onClick={() => setCurrentSlide(index)}
                   className={`w-2 h-2 rounded-full ${
                     index === currentSlide ? "bg-white scale-125" : "bg-white/50"
                   } transition-all duration-300`}
                  />
               ))}
             </div>
           </div>
          </div>

          {/* Right: Form Area */}
          <div className="p-8 md:p-10 space-y-6 min-h-[500px] flex flex-col justify-center">
            
            {/* --- VIEW 1: SIGNUP FORM --- */}
            {view === 'signup' && (
              <>
                <h2 className="text-3xl font-bold text-white text-center">Create Account</h2>
                <p className="text-center text-gray-300 pb-4">Start your quest today.</p>

                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300"
                >
                  <GoogleIcon />
                  Sign up with Google
                </button>

                <div className="flex items-center space-x-2">
                  <div className="flex-grow h-px bg-white/20"></div>
                  <span className="text-gray-400 text-sm">OR CONTINUE WITH EMAIL</span>
                  <div className="flex-grow h-px bg-white/20"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* email */}
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                          errors.email ? "border-red-500" : "border-white/20"
                        } text-white rounded-lg focus:ring-2 focus:ring-yellow-800/80 focus:outline-none transition-all duration-200 placeholder-gray-500`}
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}
                  </div>

                  {/* password */}
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${
                          errors.password ? "border-red-500" : "border-white/20"
                        } text-white rounded-lg focus:ring-2 focus:ring-yellow-800/80 focus:outline-none transition-all duration-200 placeholder-gray-500`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password}</p>}
                  </div>

                  {/* confirm password */}
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        required
                        className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${
                          errors.confirmPassword ? "border-red-500" : "border-white/20"
                        } text-white rounded-lg focus:ring-2 focus:ring-yellow-800/80 focus:outline-none transition-all duration-200 placeholder-gray-500`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1 ml-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm text-center animate-shake">
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{ height: "52px" }}
                    className="w-full bg-[#635348] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#52443a] transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-[#4a3e36] disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                <div className="text-center text-sm text-gray-400">
                  Already have an account?{" "}
                  <Link to="/login" className="text-yellow-600 font-medium hover:underline">
                    Log in
                  </Link>
                </div>
              </>
            )}

            {/* --- VIEW 2: VERIFY OTP FORM --- */}
            {view === 'verify' && (
               <div className="text-center flex flex-col justify-center">
                 <h2 className="text-3xl font-bold text-white mb-4">Check your email</h2>
                 <p className="text-gray-300 text-lg">
                   We've sent a 6-digit code to <strong className="text-white">{formData.email}</strong>.
                 </p>
                 <p className="text-gray-400 mt-2">
                   Please enter it below to verify your account.
                 </p>
 
                 <form onSubmit={handleVerifyOtp} className="space-y-5 mt-8">
                     {/* OTP Input */}
                     <div className="relative">
                         <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                         <input
                             type="text"
                             name="otp"
                             value={otp}
                             onChange={(e) => setOtp(e.target.value)}
                             placeholder="123456"
                             maxLength={6}
                             required
                             className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                                 error ? "border-red-500" : "border-white/20"
                             } text-white rounded-lg focus:ring-2 focus:ring-yellow-800/80 focus:outline-none transition-all duration-200 placeholder-gray-500 text-center tracking-[0.3em] text-lg`}
                         />
                     </div>
 
                     {error && (
                         <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm text-center animate-shake">
                             <p>{error}</p>
                         </div>
                     )}
 
                     <button
                         type="submit"
                         disabled={isLoading}
                         style={{ height: "52px" }}
                         className="w-full bg-[#635348] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#52443a] transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-[#4a3e36] disabled:cursor-not-allowed flex items-center justify-center"
                     >
                         {isLoading ? (
                             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                         ) : (
                             "Verify & Log In"
                         )}
                     </button>
                 </form>
 
                 <div className="text-center text-sm text-gray-400 mt-6">
                     Didn't get a code?{" "}
                     <button onClick={handleResendOtp} disabled={isLoading} className="text-yellow-600 font-medium hover:underline disabled:text-gray-500">
                         Resend Code
                     </button>
                 </div>
               </div>
            )}
            
          </div>
        </div>
      </motion.div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}