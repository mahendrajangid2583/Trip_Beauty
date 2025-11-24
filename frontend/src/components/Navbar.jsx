/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  User,
  ChevronDown,
  BookOpen,
  Plane,
  Menu,
  X,
  LogOut,
  Settings,
  Map,
  Bookmark,
  Utensils
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

export default function Navbar() {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // Refs for click-outside detection
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { user } = useSelector((state) => state.user);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('button')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    setIsMobileSearchOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      dispatch(logoutUser());
      setIsUserDropdownOpen(false);
      setIsMobileMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(`/search?q=${encodeURIComponent(e.target.value)}`);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <>
      {/* NAVBAR CONTAINER */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-[#0f172a]/80 backdrop-blur-md border border-white/10 rounded-full z-50 px-6 py-3 shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between h-full">
            
            {/* --- LEFT: Logo --- */}
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0 z-50">
              <div className="bg-white/5 p-2 rounded-full shadow-lg group-hover:bg-white/10 transition-all duration-300 border border-white/5">
                <Plane className="h-5 w-5 text-[#fcd34d]" />
              </div>
              <span className="text-xl font-serif font-bold text-slate-200 tracking-wide group-hover:text-[#fcd34d] transition-colors">
                Quester
              </span>
            </Link>

            {/* --- CENTER: Search Bar (Desktop Only) --- */}
            <div className="hidden md:block flex-1 max-w-sm mx-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-500 group-focus-within:text-[#fcd34d] transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search destinations..."
                  className="block w-full pl-10 pr-3 py-1.5 border-b border-white/10 bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#fcd34d] sm:text-sm transition-all duration-300 font-light tracking-wide"
                  onKeyDown={handleSearch}
                />
              </div>
            </div>

            {/* --- RIGHT: Actions & Navigation --- */}
            <div className="flex items-center space-x-2 md:space-x-6">
              
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <NavLink to="/discover" label="Discover" />
                <NavLink to="/trips" label="My Trips" />
                <NavLink to="/dining" label="Dining" />
                <NavLink to="/nearby" label="Nearby" />

              </div>

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-[#fcd34d] transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* User Dropdown */}
              {user ? (
                <div className="hidden md:block relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 pl-1 py-1 pr-2 text-slate-300 hover:text-[#fcd34d] transition-colors rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
                  >
                    {user.profilePic?.url ? (
                      <img
                        src={user.profilePic.url}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center text-[#fcd34d] text-xs font-bold border border-white/10">
                        {user.name?.charAt(0)}
                      </div>
                    )}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Desktop Dropdown Menu */}
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-4 w-60 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-sm font-serif font-semibold text-slate-200 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <DropdownItem to="/profile" icon={<User className="w-4 h-4" />} label="My Profile" />
                          <DropdownItem to="/bookmarks" icon={<Bookmark className="w-4 h-4" />} label="Bookmarks" />
                        </div>
                        <div className="border-t border-white/5 mt-1 pt-1">
                          <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors">
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Logged Out Buttons */
                <div className="hidden md:flex items-center space-x-4">
                  <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-[#fcd34d] tracking-wide transition-colors">Log In</Link>
                  <Link to="/signup" className="px-5 py-2 text-sm font-semibold text-[#0f172a] bg-[#fcd34d] rounded-full hover:bg-[#fcd34d]/90 transition-colors shadow-lg shadow-[#fcd34d]/20">Sign Up</Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:text-[#fcd34d] transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
        </div>

        {/* --- MOBILE SEARCH BAR (Dropdown) --- */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden absolute top-full left-0 right-0 mt-2 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl mx-4"
            >
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#fcd34d]/50 transition-colors"
                    onKeyDown={handleSearch}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MOBILE MENU DRAWER --- */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute top-full left-0 right-0 mt-2 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl mx-4"
            >
              <div className="px-4 pt-4 pb-6 space-y-4">
                
                {/* 1. User Profile Section */}
                {user ? (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-4">
                    <div className="flex items-center gap-4">
                      {user.profilePic?.url ? (
                        <img src={user.profilePic.url} alt="Profile" className="h-12 w-12 rounded-full border border-white/10" />
                      ) : (
                        <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center text-[#fcd34d] font-bold border border-white/10">
                          {user.name?.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-serif font-bold text-slate-200 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                       <Link to="/profile" className="text-center py-2 text-xs font-medium bg-black/50 text-slate-300 rounded-xl hover:bg-black/80 hover:text-[#fcd34d] transition-colors border border-white/5">
                          Profile
                       </Link>
                       <button onClick={handleLogout} className="text-center py-2 text-xs font-medium bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/10">
                          Sign Out
                       </button>
                    </div>
                  </div>
                ) : (
                   /* Logged out Header */
                   <div className="grid grid-cols-2 gap-3 mb-4">
                      <Link to="/login" className="text-center py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 hover:text-[#fcd34d]">Log In</Link>
                      <Link to="/signup" className="text-center py-2.5 rounded-xl bg-[#fcd34d] text-[#0f172a] font-semibold hover:bg-[#fcd34d]/90">Sign Up</Link>
                   </div>
                )}

                {/* Mobile Navigation Links */}
                <div className="space-y-1 border-t border-white/5 pt-4">
                  <MobileNavLink to="/" icon={<Plane className="w-5 h-5" />} label="Home" />
                  <MobileNavLink to="/discover" icon={<Map className="w-5 h-5" />} label="Discover" />
                  <MobileNavLink to="/nearby" icon={<Map className="w-5 h-5" />} label="Nearby Sights" />
                  <MobileNavLink to="/dining" icon={<Utensils className="w-5 h-5" />} label="Dining" />
                  <MobileNavLink to="/trip-planner" icon={<BookOpen className="w-5 h-5" />} label="Trip Planner" />
                  <MobileNavLink to="/trips" icon={<Plane className="w-5 h-5" />} label="My Trips" />
                  <MobileNavLink to="/bookmarks" icon={<Bookmark className="w-5 h-5" />} label="Bookmarks" />
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>
    </>
  );
}

// --- Helper Components ---

const NavLink = ({ to, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        className={`text-sm font-medium tracking-widest uppercase transition-colors duration-300 ${isActive ? 'text-[#fcd34d]' : 'text-slate-400 hover:text-[#fcd34d]'}`}
      >
        {label}
      </Link>
    );
};

const MobileNavLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-[#fcd34d] hover:bg-white/5 rounded-xl transition-colors border border-transparent active:bg-white/10"
  >
    <span className="text-slate-400 group-hover:text-[#fcd34d]">{icon}</span>
    <span>{label}</span>
  </Link>
);

const DropdownItem = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-[#fcd34d] transition-colors"
  >
    <span className="mr-3 text-slate-500">{icon}</span>
    {label}
  </Link>
);
