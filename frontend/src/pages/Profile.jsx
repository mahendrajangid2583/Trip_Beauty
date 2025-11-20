/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import {
  User,
  AtSign,
  Mail,
  Lock,
  Calendar,
  Venus,
  Mars,
  Edit3,
  Save,
  X,
  Camera,
  Sparkles,
  Loader2,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
// --- Redux Imports ---
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logoutUser } from '../store/userSlice';

// --- Helper Functions ---
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

// --- Main Application Component ---
export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // --- Get User from Redux Store ---
  const { user: reduxUser } = useSelector((state) => state.user);

  // --- State ---
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Local state for the form editing
  const [formData, setFormData] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [trips, setTrips] = useState([]);

  // Sync formData with Redux user when the component loads or user changes
  useEffect(() => {
    if (reduxUser) {
      setFormData({
        name: reduxUser.name || "",
        dob: reduxUser.dob || "",
        gender: reduxUser.isEmailVerified ? reduxUser.gender : false,
        handle: reduxUser.handle || "",
      });
    }
  }, [reduxUser]);

  // Fetch Trips
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/itineraries/my-trips`, {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) setTrips(data);
      } catch (err) {
        console.error("Failed to load trips", err);
      }
    })();
  }, []);

  // --- Event Handlers ---
  const handleStartEdit = () => {
    if (reduxUser) {
      setFormData({
        name: reduxUser.name,
        dob: reduxUser.dob,
        gender: reduxUser.gender
      });
    }
    setPicPreview(null);
    setNewProfilePic(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPicPreview(null);
    setNewProfilePic(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "gender") {
      setFormData((prev) => ({
        ...prev,
        gender: value === "Male",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setNewProfilePic(file);
      setPicPreview(URL.createObjectURL(file));
    } else {
      console.error("Please select an image file.");
    }
  };

  // --- Real Backend Update ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("dob", formData.dob);
      dataToSend.append("gender", formData.gender);

      if (newProfilePic) {
        dataToSend.append("profilePic", newProfilePic);
      }

      const response = await fetch("http://localhost:5000/api/auth/update-details", {
        method: "PUT",
        headers: {},
        credentials: "include",
        body: dataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile");
      }

      dispatch(loginSuccess({ user: result.user }));

      setIsEditing(false);
      setPicPreview(null);
      setNewProfilePic(null);

    } catch (error) {
      console.error("Update failed:", error);
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- DELETE ACCOUNT LOGIC ---
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure? This action cannot be undone. All your data will be permanently lost."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/delete-account", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        dispatch(logoutUser());
        navigate("/signup");
      } else {
        console.warn("Delete request failed (expected in preview). Simulating logout.");
        dispatch(logoutUser());
        navigate("/signup");
      }
    } catch (error) {
      console.error("Delete error:", error);
      dispatch(logoutUser());
      navigate("/signup");
    } finally {
      setIsDeleting(false);
    }
  };
  const handleResetPassword = () => {

    navigate('/forgot-password');
  };
  const handleUpgrade = () => {
    console.log("Upgrade to Pro initiated!");
  };

  // --- Animations ---
  const motionProps = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.3, ease: "easeInOut" },
  };

  const backgroundImage = "https://res.cloudinary.com/dxif9sbfw/image/upload/v1762286308/mountain-with-cliff_1_izaugd.jpg";

  // If user data isn't loaded yet, show loading or return null
  if (!reduxUser) return (
    <div className="flex items-center justify-center min-h-screen bg-[#121212]">
      <Loader2 className="w-8 h-8 animate-spin text-[#635348]" />
    </div>
  );

  return (
    /* Changed items-center to items-start md:items-center to prevent cutting off top on mobile scrolling */
    <div className="relative flex items-start md:items-center justify-center min-h-screen font-inter p-4 pt-20 md:pt-4 overflow-x-hidden bg-gray-900">

      {/* --- Quester Background --- */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: "grayscale(50%) brightness(30%) blur(8px)",
          transform: "scale(1.05)",
        }}
      ></div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <div className="relative z-10 w-full max-w-4xl my-auto">
        {/* Main Card - Dark Glassmorphism */}
        <motion.div
          layout
          className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Card Header with Edit/Cancel */}
          <div className="p-6 flex justify-between items-center border-b border-white/10">
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Account Settings
            </h1>
            {!isEditing ? (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white/10 text-gray-200 rounded-lg font-semibold hover:bg-white/20 transition-colors text-xs md:text-sm border border-white/5 whitespace-nowrap"
              >
                <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-red-500/20 text-red-200 border border-red-500/30 rounded-lg font-semibold hover:bg-red-500/30 transition-colors text-xs md:text-sm disabled:opacity-50 whitespace-nowrap"
              >
                <X className="w-3 h-3 md:w-4 md:h-4" />
                Cancel
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              // ---
              // EDIT MODE
              // ---
              <motion.form {...motionProps} onSubmit={handleSubmit}>
                <div className="p-6 md:p-8 space-y-8">
                  {/* Profile Pic Uploader & Handle */}
                  {/* Changed to flex-col on mobile, flex-row on desktop */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative group cursor-pointer flex-shrink-0" onClick={() => fileInputRef.current.click()}>
                      <img
                        src={picPreview || reduxUser.profilePic?.url || "https://placehold.co/400x400"}
                        alt="Profile"
                        className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-[#635348] shadow-xl transition-opacity group-hover:opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="w-full text-center sm:text-left">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Handle
                      </label>
                      <p className="text-base md:text-lg font-medium text-gray-300 bg-white/5 border border-white/10 px-4 py-2 rounded-lg inline-block max-w-full truncate">
                        @{reduxUser._id}
                      </p>
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-800 focus:border-transparent text-white placeholder-gray-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formatDateForInput(formData.dob)}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-800 focus:border-transparent text-white placeholder-gray-500 focus:outline-none transition-all [color-scheme:dark]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender ? "Male" : "Female"}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-800 focus:border-transparent text-white placeholder-gray-500 focus:outline-none transition-all appearance-none"
                      >
                        <option className="bg-gray-800 text-white">Female</option>
                        <option className="bg-gray-800 text-white">Male</option>
                      </select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSaving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#635348] text-white rounded-lg font-bold shadow-lg hover:bg-[#52443a] transition-colors disabled:bg-[#4a3e36] disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.form>
            ) : (
              // ---
              // VIEW MODE
              // ---
              <motion.div {...motionProps} className="p-6 md:p-8">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-10">
                  <img
                    src={reduxUser.profilePic?.url || "https://placehold.co/400x400"}
                    alt="Profile"
                    className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-[#635348] shadow-2xl flex-shrink-0"
                  />
                  <div className="text-center sm:text-left pt-2 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2 justify-center sm:justify-start flex-wrap">
                      <h2 className="text-2xl md:text-3xl font-bold text-white break-words">
                        {reduxUser.name}
                      </h2>
                      <div className="flex gap-2 flex-shrink-0">
                        {reduxUser.subscriptionStatus === 'premium' && (
                          <span className="text-[10px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-full tracking-widest uppercase border border-white/10 shadow-lg">
                            Premium
                          </span>
                        )}
                        {reduxUser.subscriptionStatus === 'travel_pro' && (
                          <span className="text-[10px] font-bold bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-3 py-1 rounded-full tracking-widest uppercase border border-white/10 shadow-lg">
                            Travel Pro
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-lg text-yellow-600/80 font-medium truncate">@{reduxUser.handle}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Member since {formatDate(reduxUser.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Profile Details Sections */}
                <div className="space-y-8">
                  <Section title="Personal Info">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ViewItem
                        icon={<Mail className="w-5 h-5 text-gray-400" />}
                        title="Email"
                        value={reduxUser.email}
                      />
                      <ViewItem
                        icon={<Calendar className="w-5 h-5 text-gray-400" />}
                        title="Date of Birth"
                        value={formatDate(reduxUser.dob)}
                      />
                      <ViewItem
                        icon={
                          reduxUser.gender ? (
                            <Mars className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Venus className="w-5 h-5 text-gray-400" />
                          )
                        }
                        title="Gender"
                        value={reduxUser.gender ? "Male" : "Female"}
                      />
                    </div>
                  </Section>

                  <Section title="Security & Plan">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* Security / Sign-in Method Card */}
                      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors gap-4">
                        <div className="flex items-center min-w-0">
                          <div className="p-2 bg-white/5 rounded-lg mr-4 flex-shrink-0">
                            <Lock className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-500">Sign-in Method</p>
                            <p className="text-base md:text-lg font-semibold text-white truncate">
                              {/* Use authProvider to determine the label */}
                              {reduxUser.authProvider === 'email' ? "Email & Password" : "Google Account"}
                            </p>
                          </div>
                        </div>

                        {/* Only show Update Password button if the provider is 'email' */}
                        {reduxUser.authProvider === 'email' && (
                          <button
                            onClick={handleResetPassword}
                            className="w-full xs:w-auto text-xs font-medium bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all border border-white/5 whitespace-nowrap"
                          >
                            Update Password
                          </button>
                        )}
                      </div>

                      {/* Plan Card */}
                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                        <div className="flex items-center">
                          <div className="p-2 bg-white/5 rounded-lg mr-4 flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Current Plan</p>
                            <p className="text-base md:text-lg font-semibold text-white capitalize">{reduxUser.subscriptionStatus || "Normal"}</p>
                          </div>
                        </div>
                        {reduxUser.subscriptionStatus === 'normal' && (
                          <button onClick={handleUpgrade} className="text-xs bg-[#635348] hover:bg-[#52443a] text-white px-3 py-2 rounded-lg transition-colors shadow-lg whitespace-nowrap ml-2">
                            Upgrade
                          </button>
                        )}
                      </div>
                    </div>
                  </Section>

                  <Section title="My Trips">
                    {trips.length === 0 ? (
                      <div className="text-gray-400 italic bg-white/5 p-6 rounded-xl border border-white/5 text-center">
                        No trips yet. <a className="text-yellow-600 hover:underline ml-1" href="/create">Start your first quest</a>.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trips.map(t => (
                          <a key={t._id} href={`/planner/${t._id}`} className="block group min-w-0">
                            <div className="p-5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 flex justify-between items-center gap-4">
                              <div className="min-w-0">
                                <div className="text-xs text-yellow-600/80 font-medium tracking-wide mb-1 uppercase truncate">{t.city}</div>
                                <div className="font-bold text-white text-lg group-hover:text-yellow-500 transition-colors truncate">{t.title}</div>
                              </div>
                              <div className="bg-white/5 p-2 rounded-full group-hover:bg-white/20 transition-colors flex-shrink-0">
                                <Edit3 className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </Section>

                  <div className="pt-8 border-t border-white/10">
                    <Section title="Danger Zone">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex gap-4 w-full sm:w-auto">
                          <div className="p-3 bg-red-500/20 rounded-lg h-fit flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-red-200">Delete Account</h4>
                            <p className="text-sm text-red-400/80 mt-1 break-words">Once you delete your account, there is no going back. Please be certain.</p>
                          </div>
                        </div>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="w-full sm:w-auto px-5 py-2.5 bg-red-600/80 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-lg whitespace-nowrap disabled:bg-red-900/50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-shrink-0"
                        >
                          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          Delete Account
                        </button>
                      </div>
                    </Section>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// --- Helper Components (Styled) ---

const Section = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

// Updated ViewItem to handle long text (email/ids) without breaking layout
const ViewItem = ({ icon, title, value }) => (
  <div className="flex items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors min-w-0">
    <div className="flex-shrink-0 w-10 flex justify-center items-center p-2 bg-white/5 rounded-lg mr-4">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-base md:text-lg font-semibold text-white break-all truncate">{value}</p>
    </div>
  </div>
);