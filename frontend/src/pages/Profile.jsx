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
  AlertTriangle,
  MapPin,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logoutUser } from '../store/userSlice';
import api from '../services/api';

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

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: reduxUser } = useSelector((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [trips, setTrips] = useState([]);

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

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get("/api/trips");
        setTrips(response.data);
      } catch (err) {
        console.error("Failed to load trips", err);
      }
    })();
  }, []);

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

      const response = await api.put("/api/auth/update-details", dataToSend, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });

      const result = response.data;

      dispatch(loginSuccess({ user: result.user }));
      setIsEditing(false);
      setPicPreview(null);
      setNewProfilePic(null);

    } catch (error) {
      console.error("Update failed:", error);
      alert(error.response?.data?.message || error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure? This action cannot be undone. All your data will be permanently lost."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await api.delete("/api/auth/delete-account");

      dispatch(logoutUser());
      navigate("/signup");
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

  if (!reduxUser) return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617]">
      <Loader2 className="w-8 h-8 animate-spin text-[#fcd34d]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pt-28 px-4 sm:px-6 lg:px-8 font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <div className="max-w-2xl mx-auto">
        {/* Main Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
        >
            {/* Decorative Gradient Blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#fcd34d]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {/* Header / Avatar Section */}
          <div className="p-8 flex flex-col items-center text-center border-b border-white/5 relative z-10">
            <div className="relative group cursor-pointer mb-4" onClick={isEditing ? () => fileInputRef.current.click() : undefined}>
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-[#fcd34d] to-[#b45309] shadow-lg">
                 <img
                    src={picPreview || reduxUser.profilePic?.url || "https://placehold.co/400x400"}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-[#020617]"
                  />
              </div>
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            <h1 className="text-3xl font-serif font-bold text-white mb-1">{reduxUser.name}</h1>
            <p className="text-[#fcd34d] font-medium mb-4">@{reduxUser.handle}</p>

            {/* Stats Row */}
            <div className="flex items-center gap-8 text-sm text-slate-400 mb-6">
                <div className="flex flex-col items-center">
                    <span className="text-xl font-serif font-bold text-white">{trips.length}</span>
                    <span className="text-xs uppercase tracking-wider">Journeys</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-center">
                    <span className="text-xl font-serif font-bold text-white">{formatDate(reduxUser.createdAt).split(',')[1]}</span>
                    <span className="text-xs uppercase tracking-wider">Joined</span>
                </div>
            </div>

            {!isEditing ? (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-full font-medium transition-colors border border-white/10 text-sm"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
               <div className="flex gap-3">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full font-medium transition-colors border border-white/10 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-[#fcd34d] hover:bg-[#fcd34d]/90 text-[#020617] rounded-full font-bold transition-colors shadow-lg shadow-[#fcd34d]/20 text-sm"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
               </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-8 bg-[#020617]/30">
             <AnimatePresence mode="wait">
                {isEditing ? (
                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                            <InputGroup label="Date of Birth" name="dob" type="date" value={formatDateForInput(formData.dob)} onChange={handleChange} />
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender ? "Male" : "Female"}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-[#020617]/50 border border-white/10 rounded-xl focus:border-[#fcd34d] text-slate-200 focus:outline-none transition-colors appearance-none"
                                >
                                    <option className="bg-[#020617]">Female</option>
                                    <option className="bg-[#020617]">Male</option>
                                </select>
                            </div>
                        </div>
                    </motion.form>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                    >
                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-[#fcd34d] uppercase tracking-widest">Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoCard icon={<Mail className="w-4 h-4" />} label="Email" value={reduxUser.email} />
                                <InfoCard icon={<Calendar className="w-4 h-4" />} label="Born" value={formatDate(reduxUser.dob)} />
                                <InfoCard 
                                    icon={reduxUser.gender ? <Mars className="w-4 h-4" /> : <Venus className="w-4 h-4" />} 
                                    label="Gender" 
                                    value={reduxUser.gender ? "Male" : "Female"} 
                                />
                                <InfoCard 
                                    icon={<Lock className="w-4 h-4" />} 
                                    label="Auth Method" 
                                    value={reduxUser.authProvider === 'email' ? "Email" : "Google"} 
                                />
                            </div>
                        </div>

                        {/* Account Actions */}
                        <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                             {reduxUser.authProvider === 'email' && (
                                <button onClick={handleResetPassword} className="text-sm text-slate-400 hover:text-[#fcd34d] transition-colors">
                                    Reset Password
                                </button>
                             )}
                             <button onClick={handleDeleteAccount} className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 ml-auto">
                                <Trash2 className="w-4 h-4" />
                                Delete Account
                             </button>
                        </div>
                    </motion.div>
                )}
             </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const InputGroup = ({ label, type = "text", ...props }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
        <input
            type={type}
            className="w-full px-4 py-3 bg-[#020617]/50 border border-white/10 rounded-xl focus:border-[#fcd34d] text-slate-200 placeholder-slate-600 focus:outline-none transition-colors [color-scheme:dark]"
            {...props}
        />
    </div>
);

const InfoCard = ({ icon, label, value }) => (
    <div className="flex items-center p-4 bg-white/5 border border-white/5 rounded-xl">
        <div className="p-2 bg-white/5 rounded-lg mr-3 text-slate-400">
            {icon}
        </div>
        <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-medium text-slate-200 truncate max-w-[150px]">{value}</p>
        </div>
    </div>
);