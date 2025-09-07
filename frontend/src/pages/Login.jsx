import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
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
      
      <div className="flex w-[80%] h-[90%] rounded-2xl shadow-xl border border-5 border-white">
        
        {/* Left Section */}
        <div className="hidden md:flex md:w-1/2 bg-cover bg-center relative">
          <div className="absolute inset-0 opacity-0 bg-opacity-30 flex flex-col items-center justify-center text-white text-center p-6">
            
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-white">
          <h2 className="text-3xl font-bold text-center text-gray-800">Log In</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Log In
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <span className="text-gray-600">Or continue with</span>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button className="bg-gray-200 p-2 rounded-full hover:bg-gray-300">G</button>
            <button className="bg-gray-200 p-2 rounded-full hover:bg-gray-300">F</button>
            <button className="bg-gray-200 p-2 rounded-full hover:bg-gray-300">A</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
