/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  User,
  ChevronDown,
  Calendar,
  BookOpen,
  Plane,
  Menu,
  X,
  LogOut,
  LogIn,
  UserPlus,
  Settings,
  Map,
  Bookmark
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/userSlice";
import { motion, AnimatePresence } from "framer-motion";

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
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      dispatch(logoutUser());
      setIsUserDropdownOpen(false);
      setIsMobileMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      {/* NAVBAR CONTAINER
         - Strictly Black Background (bg-black/95)
         - Glass effect (backdrop-blur-md)
         - Neutral borders
      */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* --- LEFT: Logo --- */}
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0 z-50">
              <div className="bg-white/10 p-2 rounded-lg shadow-lg group-hover:bg-white/20 transition-all duration-300 border border-white/5">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide group-hover:text-gray-300 transition-colors">
                TripPlanner
              </span>
            </Link>

            {/* --- CENTER: Search Bar (Desktop Only) --- */}
            {/* Visible on MD screens and up. Hidden on mobile to save space. */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search destinations..."
                  className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-full leading-5 bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-white/30 focus:text-white sm:text-sm transition-all duration-300"
                />
              </div>
            </div>

            {/* --- RIGHT: Actions & Navigation --- */}
            <div className="flex items-center space-x-2 md:space-x-4">
              
              {/* Mobile Search Toggle (Visible ONLY on Mobile) */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                {isMobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </button>

              {/* Desktop Links (Hidden on Mobile) */}
              <div className="hidden md:flex items-center space-x-1">
                <NavLink to="/discover" icon={<BookOpen className="w-4 h-4" />} label="Discover" />
                {user && <NavLink to="/create" icon={<Calendar className="w-4 h-4" />} label="Create" />}
              </div>

              {/* Auth Section */}
              {user ? (
                <>
                  {/* Notifications (Desktop) */}
                  <button className="hidden md:block relative p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-black" />
                  </button>

                  {/* User Dropdown (Desktop Only) */}
                  <div className="hidden md:block relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center space-x-2 pl-1 py-1 pr-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
                    >
                      {user.profilePic?.url ? (
                        <img
                          src={user.profilePic.url}
                          alt="Profile"
                          className="h-8 w-8 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white/10">
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
                          className="absolute right-0 mt-2 w-60 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden z-50"
                        >
                          <div className="px-4 py-3 border-b border-white/5">
                            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                          <div className="py-1">
                            <DropdownItem to="/profile" icon={<User className="w-4 h-4" />} label="My Profile" />
                            <DropdownItem to="/trips" icon={<Map className="w-4 h-4" />} label="My Trips" />
                            <DropdownItem to="/bookmarks" icon={<Bookmark className="w-4 h-4" />} label="Bookmarks" />
                            <DropdownItem to="/settings" icon={<Settings className="w-4 h-4" />} label="Settings" />
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
                </>
              ) : (
                /* Logged Out Buttons (Desktop) */
                <div className="hidden md:flex items-center space-x-4">
                  <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white">Log In</Link>
                  <Link to="/signup" className="px-4 py-2 text-sm font-semibold text-black bg-white rounded-lg hover:bg-gray-200 transition-colors">Sign Up</Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* --- MOBILE SEARCH BAR (Dropdown) --- */}
        {/* Pops up/down when the search icon is clicked on mobile */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-black/95 border-b border-white/10 overflow-hidden"
            >
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-black border-b border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="px-4 pt-4 pb-6 space-y-4">
                
                {/* 1. User Profile Section (TOP OF LIST) */}
                {user ? (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-4">
                    <div className="flex items-center gap-4">
                      {user.profilePic?.url ? (
                        <img src={user.profilePic.url} alt="Profile" className="h-12 w-12 rounded-full border border-white/10" />
                      ) : (
                        <div className="h-12 w-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold border border-white/10">
                          {user.name?.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                       <Link to="/profile" className="text-center py-2 text-xs font-medium bg-black/50 text-gray-300 rounded-lg hover:bg-black/80 hover:text-white transition-colors border border-white/5">
                          Profile
                       </Link>
                       <button onClick={handleLogout} className="text-center py-2 text-xs font-medium bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/10">
                          Sign Out
                       </button>
                    </div>
                  </div>
                ) : (
                   /* Logged out Header */
                   <div className="grid grid-cols-2 gap-3 mb-4">
                      <Link to="/login" className="text-center py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5">Log In</Link>
                      <Link to="/signup" className="text-center py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-gray-200">Sign Up</Link>
                   </div>
                )}

                {/* 2. Navigation Links */}
                <div className="space-y-1">
                  <MobileNavLink to="/discover" icon={<BookOpen className="w-4 h-4" />} label="Discover" />
                  {user && (
                    <>
                      <MobileNavLink to="/create" icon={<Calendar className="w-4 h-4" />} label="Create Trip" />
                      <MobileNavLink to="/trips" icon={<Map className="w-4 h-4" />} label="My Trips" />
                      <MobileNavLink to="/bookmarks" icon={<Bookmark className="w-4 h-4" />} label="Bookmarks" />
                      <MobileNavLink to="/upgrade" icon={<Settings className="w-4 h-4" />} label="Upgrade Plan" />
                    </>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>
      
      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}

// --- Helper Components ---

const NavLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
  >
    <span>{icon}</span>
    <span>{label}</span>
  </Link>
);

const MobileNavLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent active:bg-white/10"
  >
    <span className="text-gray-400">{icon}</span>
    <span>{label}</span>
  </Link>
);

const DropdownItem = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
  >
    <span className="mr-3 text-gray-500">{icon}</span>
    {label}
  </Link>
);