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
  Sparkles, // New icon for Pro features
  Loader2, // New icon for saving spinner
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Navbar from '../components/Navbar'
// --- Mock User Data (based on your Mongoose Schema) ---
const mockUser = {
  _id: "user123",
  name: "Priya Sharma",
  handle: "priya_sharma",
  gender: false, // 0:female (false), 1:male (true)
  dob: "1995-08-20T00:00:00.000Z",
  email: "priya.sharma@example.com",
  profilePic: {
    url: "https://placehold.co/400x400/EAD9FF/5B21B6?text=PS",
    public_id: "cloudinary_placeholder_id_123",
  },
  proAccount: false, // Added per your new schema
  createdAt: "2024-01-10T09:00:00.000Z",
};

// --- Helper Functions ---
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateForInput = (dateString) => {
  return new Date(dateString).toISOString().split("T")[0];
};

// --- Main Application Component ---
export default function Profile() {
  // --- State ---
  const [user, setUser] = useState(mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // For save button state
  const [formData, setFormData] = useState(mockUser);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [trips, setTrips] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/itineraries`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (res.ok) setTrips(data)
      } catch(err){console.error(err)}
    })()
  }, [])

  // --- Event Handlers ---

  const handleStartEdit = () => {
    setFormData(user);
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

  // "Saves" the changes with simulated delay
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true); // Disable button and show spinner

    // *** Simulate API Call (1.5 seconds) ***
    setTimeout(() => {
      // *** This is where you would call your backend API ***
      console.log("Simulating API update:");
      console.log("Data to send:", {
        name: formData.name, // Name is now editable
        dob: formData.dob,
        gender: formData.gender,
      });
      if (newProfilePic) {
        console.log("New profile picture to upload:", newProfilePic);
      }

      // --- Optimistic UI Update (simulating success) ---
      setUser((prevUser) => ({
        ...prevUser,
        name: formData.name, // Update the name
        dob: formData.dob,
        gender: formData.gender,
        profilePic: {
          ...prevUser.profilePic,
          url: picPreview || prevUser.profilePic.url,
        },
      }));

      // Reset states
      setIsSaving(false);
      setIsEditing(false);
      setPicPreview(null);
      setNewProfilePic(null);
    }, 1500); // 1.5-second delay
  };

  // Placeholder for upgrade logic
  const handleUpgrade = () => {
    console.log("Upgrade to Pro initiated!");
    // Here you would trigger a payment modal or redirect to a pricing page
  };

  // --- Animations ---
  const motionProps = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.3, ease: "easeInOut" },
  };

  // --- Background Style ---
  const backgroundStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cpath fill='%23e5e7eb' fill-opacity='0.4' d='M118 108H120V120H108V118H118V108ZM118 0H120V12H108V0H118ZM0 108H12V120H0V108ZM0 0H12V12H0V0Z M106 108H108V120H96V108H106ZM106 0H108V12H96V0H106ZM12 108H14V120H2V108H12ZM12 0H14V12H2V0H12Z M104 106H106V118H94V106H104ZM104 2H106V14H94V2H104ZM14 106H16V118H4V106H14ZM14 2H16V14H4V2H14Z M106 104H108V116H96V104H106ZM106 4H108V16H96V4H106ZM12 104H14V116H2V104H12ZM12 4H14V16H2V4H12Z M104 102H106V114H94V102H104ZM104 6H106V18H94V6H104ZM14 102H16V114H4V102H14ZM14 6H16V18H4V6H14Z M106 100H108V112H96V100H106ZM106 8H108V20H96V8H106ZM12 100H14V112H2V100H12ZM12 8H14V20H2V8H12Z M104 98H106V110H94V98H104ZM104 10H106V22H94V10H104ZM14 98H16V110H4V98H14ZM14 10H16V22H4V10H14Z M106 96H108V108H96V96H106ZM106 12H108V24H96V12H106ZM12 96H14V108H2V96H12ZM12 12H14V24H2V12H12Z M104 94H106V106H94V94H104ZM104 14H106V26H94V14H104ZM14 94H16V106H4V94H14ZM14 14H16V26H4V14H14Z M106 92H108V104H96V92H106ZM106 16H108V28H96V16H106ZM12 92H14V104H2V92H12ZM12 16H14V28H2V16H12Z M104 90H106V102H94V90H104ZM104 18H106V30H94V18H104ZM14 90H16V102H4V90H14ZM14 18H16V30H4V18H14Z M106 88H108V100H96V88H106ZM106 20H108V32H96V20H106ZM12 88H14V100H2V88H12ZM12 20H14V32H2V20H12Z M104 86H106V98H94V86H104ZM104 22H106V34H94V22H104ZM14 86H16V98H4V86H14ZM14 22H16V34H4V22H14Z M106 84H108V96H96V84H106ZM106 24H108V36H96V24H106ZM12 84H14V96H2V84H12ZM12 24H14V36H2V24H12Z M104 82H106V94H94V82H104ZM104 26H106V38H94V26H104ZM14 82H16V94H4V82H14ZM14 26H16V38H4V26H14Z M106 80H108V92H96V80H106ZM106 28H108V40H96V28H106ZM12 80H14V92H2V80H12ZM12 28H14V40H2V28H12Z M104 78H106V90H94V78H104ZM104 30H106V42H94V30H104ZM14 78H16V90H4V78H14ZM14 30H16V42H4V30H14Z M106 76H108V88H96V76H106ZM106 32H108V44H96V32H106ZM12 76H14V88H2V76H12ZM12 32H14V44H2V32H12Z M104 74H106V86H94V74H104ZM104 34H106V46H94V34H104ZM14 74H16V86H4V74H14ZM14 34H16V46H4V34H14Z M106 72H108V84H96V72H106ZM106 36H108V48H96V36H106ZM12 72H14V84H2V72H12ZM12 36H14V48H2V36H12Z M104 70H106V82H94V70H104ZM104 38H106V50H94V38H104ZM14 70H16V82H4V70H14ZM14 38H16V50H4V38H14Z M106 68H108V80H96V68H1Game106Z M106 40H108V52H96V40H106Z M12 68H14V80H2V68H12Z M12 40H14V52H2V40H12Z M104 66H106V78H94V66H104Z M104 42H106V54H94V42H104Z M14 66H16V78H4V66H14Z M14 42H16V54H4V42H14Z M106 64H108V76H96V64H106Z M106 44H108V56H96V44H106Z M12 64H14V76H2V64H12Z M12 44H14V56H2V44H12Z M104 62H106V74H94V62H104Z M104 46H106V58H94V46H104Z M14 62H16V74H4V62H14Z M14 46H16V58H4V46H14Z M106 60H108V72H96V60H106Z M106 48H108V60H96V48H106Z M12 60H14V72H2V60H12Z M12 48H14V60H2V48H12Z M104 58H106V70H94V58H104Z M104 50H106V62H94V50H104Z M14 58H16V70H4V58H14Z M14 50H16V62H4V50H14Z M106 56H108V68H96V56H106Z M106 52H108V64H96V52H106Z M12 56H14V68H2V56H12Z M12 52H14V64H2V52H12Z M104 54H106V66H94V54H104Z M104 54H106V66H94V54H104Z M14 54H16V66H4V54H14Z M14 54H16V66H4V54H14Z M118 108H120V120H108V118H118V108Z M118 0H120V12H108V0H118Z M0 108H12V120H0V108Z M0 0H12V12H0V0Z M106 108H108V120H96V108H106Z M106 0H108V12H96V0H106Z M12 108H14V120H2V108H12Z M12 0H14V12H2V0H12Z M104 106H106V118H94V106H104Z M104 2H106V14H94V2H104Z M14 106H16V118H4V106H14Z M14 2H16V14H4V2H14Z M106 104H108V116H96V104H106Z M106 4H108V16H96V4H106Z M12 104H14V116H2V104H12Z M12 4H14V16H2V4H12Z M104 102H106V114H94V102H104Z M104 6H106V18H94V6H104Z M14 102H16V114H4V102H14Z M14 6H16V18H4V6H14Z M106 100H108V112H96V100H106Z M106 8H108V20H96V8H106Z M12 100H14V112H2V100H12Z M12 8H14V20H2V8H12Z M104 98H106V110H94V98H104Z M104 10H106V22H94V10H104Z M14 98H16V110H4V98H14Z M14 10H16V22H4V10H14Z M106 96H108V108H96V96H106Z M106 12H108V24H96V12H106Z M12 96H14V108H2V96H12Z M12 12H14V24H2V12H12Z M104 94H106V106H94V94H104Z M104 14H106V26H94V14H104Z M14 94H16V106H4V94H14Z M14 14H16V26H4V14H14Z M106 92H108V104H96V92H106Z M106 16H108V28H96V16H106Z M12 92H14V104H2V92H12Z M12 16H14V28H2V16H12Z M104 90H106V102H94V90H104Z M104 18H106V30H94V18H104Z M14 90H16V102H4V90H14Z M14 18H16V30H4V18H14Z M106 88H108V100H96V88H106Z M106 20H108V32H96V20H106Z M12 88H14V100H2V88H12Z M12 20H14V32H2V20H12Z M104 86H106V98H94V86H104Z M104 22H106V34H94V22H104Z M14 86H16V98H4V86H14Z M14 22H16V34H4V22H14Z M106 84H108V96H96V84H106Z M106 24H108V36H96V24H106Z M12 84H14V96H2V84H12Z M12 24H14V36H2V24H12Z M104 82H106V94H94V82H104Z M104 26H106V38H94V26H104Z M14 82H16V94H4V82H14Z M14 26H16V38H4V26H14Z M106 80H108V92H96V80H106Z M106 28H108V40H96V28H106Z M12 80H14V92H2V80H12Z M12 28H14V40H2V28H12Z M1Section04 78H106V90H94V78H104Z M104 30H106V42H94V30H104Z M14 78H16V90H4V78H14Z M14 30H16V42H4V30H14Z M106 76H108V88H96V76H106Z M106 32H108V44H96V32H106Z M12 76H14V88H2V76H12Z M12 32H14V44H2V32H12Z M104 74H106V86H94V74H104Z M104 34H106V46H94V34H104Z M14 74H16V86H4V74H14Z M14 34H16V46H4V34H14Z M106 72H108V84H96V72H106Z M106 36H108V48H96V36H106Z M12 72H14V84H2V72H12Z M12 36H14V48H2V36H12Z M104 70H106V82H94V70H104Z M104 38H106V50H94V38H104Z M14 70H16V82H4V70H14Z M14 38H16V50H4V38H14Z M106 68H108V80H96V68H1Game106Z M106 40H108V52H96V40H106Z M12 68H14V80H2V68H12Z M12 40H14V52H2V40H12Z M104 66H106V78H94V66H104Z M104 42H106V54H94V42H104Z M14 66H16V78H4V66H14Z M14 42H16V54H4V42H14Z M106 64H108V76H96V64H106Z M106 44H108V56H96V44H106Z M12 64H14V76H2V64H12Z M12 44H14V56H2V44H12Z M104 62H106V74H94V62H104Z M104 46H106V58H94V46H104Z M14 62H16V74H4V62H14Z M14 46H16V58H4V46H14Z M106 60H108V72H96V60H106Z M106 48H108V60H96V48H106Z M12 60H14V72H2V60H12Z M12 48H14V60H2V48H12Z M104 58H106V70H94V58H104Z M104 50H106V62H94V50H104Z M14 58H16V70H4V58H14Z M14 50H16V62H4V50H14Z M106 56H108V68H96V56H106Z M106 52H108V64H96V52H106Z M12 56H14V68H2V56H12Z M12 52H14V64H2V52H12Z M104 54H106V66H94V54H104Z M104 54H106V66H94V54H104Z M14 54H16V66H4V54H14Z M14 54H16V66H4V54H14Z%3C/svg%3E")`,
    backgroundPosition: "center",
    backgroundColor: "#f9fafb",
  };

  return (
   <div>
     <Navbar />
   
    <div
      style={backgroundStyle}
      className="min-h-screen w-full p-4 md:p-8 flex items-center justify-center font-sans"
    >
        
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <div className="w-full max-w-3xl">
        {/* Main Card */}
        <motion.div
          layout
          className="w-full bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Card Header with Edit/Cancel */}
          <div className="p-6 flex justify-between items-center border-b border-gray-200/50">
            <h1 className="text-2xl font-bold text-gray-800">
              Account Settings
            </h1>
            {!isEditing ? (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                disabled={isSaving} // Disable cancel while saving
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
              >
                <X className="w-4 h-4" />
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
                <div className="p-6 md:p-8 space-y-6">
                  {/* Profile Pic Uploader & Handle */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={picPreview || user.profilePic.url}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Handle is now read-only here */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Handle
                      </label>
                      <p className="text-lg font-semibold text-gray-500 bg-gray-100 px-3 py-2 rounded-md">
                        @{user.handle}
                      </p>
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name is now editable */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formatDateForInput(formData.dob)}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender ? "Male" : "Female"}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option>Female</option>
                        <option>Male</option>
                      </select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSaving} // Disable button when saving
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
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
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <img
                    src={user.profilePic.url}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="text-center sm:text-left pt-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-bold text-gray-900">
                        {user.name}
                      </h2>
                      {/* Conditional PRO badge */}
                      {user.proAccount && (
                        <span className="text-xs font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2.5 py-1 rounded-full tracking-wider">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-gray-500">@{user.handle}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Member since {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Profile Details Sections */}
                <div className="mt-8 space-y-8">
                  <Section title="Profile">
                    <ViewItem
                      icon={<Mail className="w-5 h-5 text-gray-500" />}
                      title="Email"
                      value={user.email}
                    />
                    <ViewItem
                      icon={<Calendar className="w-5 h-5 text-gray-500" />}
                      title="Date of Birth"
                      value={formatDate(user.dob)}
                    />
                    <ViewItem
                      icon={
                        user.gender ? (
                          <Mars className="w-5 h-5 text-gray-500" />
                        ) : (
                          <Venus className="w-5 h-5 text-gray-500" />
                        )
                      }
                      title="Gender"
                      value={user.gender ? "Male" : "Female"}
                    />
                  </Section>

                  <Section title="Security">
                    <div className="flex w-full items-center justify-between">
                        <ViewItem
                      icon={<Lock className="w-5 h-5 text-gray-500" />}
                      title="Password"
                      value="••••••••••••"
                    />
                    <button
                          onClick={handleUpgrade}
                          className="mt-2 mr-4 sm:mt-0 h-1/1 flex items-center px-4 py-1 bg-gray-900 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-gray-700 transition-all"
                        >
                          
                          Change Password
                        </button>
                    </div>
                    
                  </Section>

                  {/* Account Plan Section */}
                  <Section title="Account Plan">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Current Plan
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {user.proAccount ? "Pro" : "Standard"}
                        </p>
                      </div>
                      {!user.proAccount && (
                        <button
                          onClick={handleUpgrade}
                          className="mt-4 sm:mt-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          <Sparkles className="w-4 h-4" />
                          Upgrade to Pro
                        </button>
                      )}
                    </div>
                  </Section>

                  <Section title="My Trips">
                    {trips.length === 0 ? (
                      <div className="text-gray-500">No trips yet. <a className="underline" href="/create">Create one</a>.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trips.map(t => (
                          <a key={t._id} href={`/planner/${t._id}`} className="p-4 rounded-lg border bg-white hover:shadow">
                            <div className="text-sm text-gray-500">{t.city}</div>
                            <div className="font-semibold">{t.title}</div>
                          </a>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
    </div>
  );
}

// --- Helper Components ---

// New Section component for better organization
const Section = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

// Renamed from InfoItem to ViewItem
const ViewItem = ({ icon, title, value }) => (
  <div className="flex items-center p-4 bg-white/50 rounded-lg">
    <div className="flex-shrink-0 w-10 text-gray-500">{icon}</div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

