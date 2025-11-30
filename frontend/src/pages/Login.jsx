import React, { useState, useReducer, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/userSlice";
import api, { BASE_URL } from "../services/api";

// --- ICONS ---
const Eye = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const GoogleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
    {...props}
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.625,44,30.825,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

// --- State Management ---
const loginReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };
    case "LOGIN_SUCCESS":
      return { ...state, isLoading: false, error: null };
    case "LOGIN_FAILURE":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

const initialState = { isLoading: false, error: null };

const Login = () => {
  const navigate = useNavigate();
  const reduxDispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [state, localDispatch] = useReducer(loginReducer, initialState);
  const { isLoading, error } = state;
  const emailInputRef = useRef(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    localDispatch({ type: "LOGIN_START" });

    try {
      const response = await api.post("/api/auth/login", form);
      const data = response.data;

      if (data?.user) {
        reduxDispatch(loginSuccess({ user: data.user }));
      } else {
        try {
          const meRes = await api.get("/api/auth/me");
          const meData = meRes.data;
          if (meData?.user) reduxDispatch(loginSuccess({ user: meData.user }));
        } catch (err) {
          console.warn("Failed to fetch current user after login", err);
        }
      }

      localDispatch({ type: "LOGIN_SUCCESS" });
      navigate("/profile", { replace: true });

    } catch (err) {
      localDispatch({ type: "LOGIN_FAILURE", payload: err.response?.data?.message || err.message });
    }
  };

  const backgroundImage = "https://res.cloudinary.com/dxif9sbfw/image/upload/v1762286308/mountain-with-cliff_1_izaugd.jpg";

  return (
    <div className="relative flex items-center justify-center min-h-screen font-inter p-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-300"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: 'grayscale(50%) brightness(30%) blur(8px)',
          transform: 'scale(1.05)'
        }}
      ></div>

      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm dark:backdrop-blur-none">
        
        <div className="md:w-1/2 w-full relative min-h-[300px] md:min-h-auto">
          <img
            src={backgroundImage}
            alt="Abstract adventure landscape"
            className="absolute inset-0 w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-10 md:p-16 flex flex-col justify-between text-white">
            <h1 className="text-4xl font-extrabold tracking-tight text-white z-10">
              Quester.
            </h1>
            <div>
              <div className="relative z-10 mb-6">
                <p className="font-serif text-2xl md:text-3xl font-light italic leading-snug tracking-wide opacity-90 drop-shadow-md">
                  Continue your quest...
                </p>
              </div>
              <div className="text-gray-300 text-sm z-10">
                &copy; {new Date().getFullYear()} Quester. All rights reserved.
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 w-full p-10 md:p-16 flex flex-col justify-center bg-white dark:bg-[#1A1A1D]">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Please enter your credentials to log in.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 font-medium block mb-2">Email</label>
              <input
                ref={emailInputRef}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-800 focus:outline-none transition-all duration-200 dark:text-white"
              />
            </div>

            <div className="relative">
              <label className="text-sm text-gray-600 dark:text-gray-400 font-medium block mb-2">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-800 focus:outline-none transition-all duration-200 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <div className="flex justify-end items-center text-sm">
              <Link to={"/forgot-password"} className="text-yellow-800 dark:text-yellow-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-none text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm animate-shake">
                <p className="truncate">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] bg-[#635348] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#52443a] transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-[#635348]/50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-[#1A1A1D] px-2 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <a
            href={`${BASE_URL}/api/auth/google`}
            className="w-full h-[52px] bg-white dark:bg-gray-700 text-gray-700 dark:text-white py-3 rounded-lg font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center gap-3"
            aria-label="Log in with Google"
          >
            <GoogleIcon className="w-5 h-5" />
            Log in with Google
          </a>

          <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            Don’t have an account?{" "}
            <Link to={"/signup"} className="text-yellow-800 dark:text-yellow-600 font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      
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
};

export default Login;