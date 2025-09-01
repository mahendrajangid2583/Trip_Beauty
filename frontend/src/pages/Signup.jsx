import { useState } from "react";
import AuthLayout from "../components/Authlayout";
import {
  User,
  AtSign,
  Mail,
  Lock,
  Image as ImageIcon,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    gender: "",
    dob: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [picerror, setPicerror] = useState(null);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    if (e.target.name == "handle") {
      //validate handle
      console.log("handle will be validated.");
    }

    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // i will Handle profile pic later
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPicerror("Only JPEG, PNG, or WebP allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPicerror("Max size allowed is 2MB");
      return;
    }

    setProfilePic(file); // keep original file for backend
    setPicerror(null);
  };

  // Basic validations
  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.handle.match(/^[a-zA-Z0-9_]{3,15}$/))
      newErrors.handle =
        "Handle must be 3–15 characters (letters, numbers, underscores)";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Enter a valid email";
    if (!formData.dob) newErrors.dob = "Date of birth is required";

    // Checking age >= 10
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 10) newErrors.dob = "You must be at least 10 years old";
    }

    if (
      !formData.password.match(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/
      )
    )
      newErrors.password =
        "Password must be 8+ chars, include 1 uppercase, 1 number & 1 special char";
    if (formData.password !== formData.confirmpassword)
      newErrors.confirmpassword = "Password didn't match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate() || picerror) return;

    // Here I’ll send data to backend (Mongo/Express)
    console.log("Registering user:", { ...formData, profilePic });
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          SignUp
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="flex sm:flex-row flex-col sm:gap-4">
            <div className="sm:w-basis-1/2 w-full">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

            {/* Handle */}
            <div className="sm:w-basis-1/2 w-full">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <AtSign className="w-4 h-4" /> Handle
              </label>
              <input
                type="text"
                name="handle"
                value={formData.handle}
                onChange={handleChange}
                required
                placeholder="@traveler123"
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              {errors.handle && (
                <p className="text-red-500 text-xs">{errors.handle}</p>
              )}
            </div>
          </div>
          {/* Gender + DOB */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 rounded-lg  border border-gray-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="" className="rounded-md bg-black/10">
                  Select
                </option>
                <option className="rounded-md bg-black/10">Male</option>
                <option className="rounded-md bg-black/10">Female</option>
                {/* <option>Other</option>
                <option>Prefer not to say</option> */}
              </select>
            </div>

            <div className="flex-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" /> Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              {errors.dob && (
                <p className="text-red-500 text-xs">{errors.dob}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex sm:flex-row flex-col sm:gap-4">
            <div className="sm:w-basis-1/2 w-full">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Profile Pic */}
            <div className="sm:w-basis-1/2 w-full ">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <ImageIcon className="w-4 h-4" /> Profile Picture
              </label>
              <div className="flex justify-evenly">
              <div className="mt-2 flex items-center gap-4">
                {/* Clickable preview */}
                <div
                  onClick={() =>
                    document.getElementById("profilePicInput").click()
                  }
                  className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border shadow cursor-pointer hover:ring-2 hover:ring-teal-400 transition"
                >
                  {profilePic ? (
                    <img
                      src={URL.createObjectURL(profilePic)}
                      alt="Preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </div>
              </div>
              {/* Hidden file input */}
              <input
                id="profilePicInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Custom button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() =>
                  document.getElementById("profilePicInput").click()
                }
                className="basis-1/2 self-center bg-black text-white py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                Choose File
              </motion.button>
              </div>
            </div>

            {picerror && (
              <p className="text-red-500 text-xs mt-2">{picerror}</p>
            )}
          </div>
          <div className="flex sm:flex-row flex-col sm:gap-4">
            <div className="sm:w-basis-1/2 w-full">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4" /> Password
              </label>
              <div className="relative">
                <input
                  minLength={8}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
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
              </div>
              </div>
              <div className="sm:w-basis-1/2 w-full">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Lock className="w-4 h-4" /> Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmpassword"
                    value={formData.confirmpassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmpassword && (
                  <p className="text-red-500 text-xs">
                    {errors.confirmpassword}
                  </p>
                )}
              </div>
            
          </div>
          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            Sign Up
          </motion.button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-teal-600 font-semibold hover:underline"
          >
            Log in
          </a>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
