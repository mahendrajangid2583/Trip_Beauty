import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
} from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      navigate("/dashboard"); // redirect after login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative flex items-center min-w-screen justify-center h-screen ">
      <img src="https://res.cloudinary.com/dmsouugvs/image/upload/v1757189140/Loginpic_jvlfr3.jpg" alt="Login" className="absolute top-0 left-0 w-full h-full object-cover -z-1" />

      <div className="flex w-[80%] h-[90%] rounded-2xl shadow-xl border border-5 border-white/90 bg-transparent">

        {/* Left Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative">
          <div className="absolute inset-0 opacity-0 bg-opacity-30 flex flex-col items-center justify-center text-white text-center p-6">

          </div>
        </div>

        {/* Right Section */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center bg-white/90">
           {/* <h1 
        className="
            
            flex items-start justify-center 
            text-[8rem] font-extrabold uppercase leading-none 
            text-transparent 
        "
        style={{
            
            WebkitTextStroke: '2px green',
            fontSize: '6rem', 
           
        }}
    >
        WELCOME
    </h1> */}
          <h2 className="text-3xl font-bold text-center text-gray-800">Welcome Back!</h2>
          <form onSubmit={handleSubmit} className="my-6 space-y-4">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Password"
                    minLength={8}
                    className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>{error && <p className="text-red-500 text-sm">{error}</p>}
            <Link to="/forgot-password" className="text-blue-500 hover:underline"> Forgot password</Link>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Log In
            </button>
          </form>
         
          <div className="flex flex-col items-center">
            <h8 className="text-sm py-2">Don't have an account</h8>
            <Link to="/signup" className="w-full"> <button className="w-full bg-gray-100 p-2 rounded-full hover:bg-gray-200 ">Create Account</button></Link>
          </div>            


          

          {/* <div className="mt-6 flex items-center justify-center">
            <span className="text-gray-600">Or continue with</span>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button className="bg-gray-200 p-2 rounded-full hover:bg-gray-300">G</button>
            <button className="bg-gray-200 p-2 rounded-full hover:bg-gray-300">F</button>
            <button className="bg-gray-200 p-2 rounded-full hover:bg-gray-300">A</button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
