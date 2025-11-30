import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// --- Redux ---
import { fetchUser } from './store/userSlice';
import { fetchBookmarks } from './store/bookmarksSlice';

// --- Components ---
import Navbar from './components/Navbar';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import HelpBot from './components/HelpBot';

// --- Pages ---
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Places from './pages/Places';
import TripPlanner from './pages/TripPlanner';
import JourneysDashboard from './pages/JourneysDashboard';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/forgot-password';
import ActiveNavigation from './pages/ActiveNavigation';
import Discover from './pages/Discover';
import SearchResults from './pages/SearchResults';
import Bookmarks from './pages/Bookmarks';
import Dining from './pages/Dining';
import NearbySights from './pages/NearbySights';
import JoinTrip from './pages/JoinTrip';

const App = () => {
  const dispatch = useDispatch();
  // Get the *one* loading state from Redux
  const { isLoading } = useSelector((state) => state.user);

  // Get current location
  const location = useLocation();

  useEffect(() => {
    // Just dispatch the thunk. Redux handles the rest.
    dispatch(fetchUser());
    dispatch(fetchBookmarks());
  }, [dispatch]);

  // Show a global spinner ONLY on initial app load
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#000',
          color: '#fff'
        }}
      >
        <h2>Loading your session...</h2>
      </div>
    );
  }

  // --- Logic to hide Navbar on specific routes ---
  // Define routes where Navbar should be hidden
  const noNavRoutes = ['/signup', '/login', '/forgot-password'];
  // Check if the current path is NOT one of the no-nav routes
  const showNav = !noNavRoutes.includes(location.pathname);

  // Auth check is done. Show the app.
  return (
    <div>
      {/* Conditionally render the Navbar */}
      {showNav && <Navbar />}
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/places" element={<Places />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/nearby" element={<NearbySights />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/dining" element={<Dining />} />

        {/* --- Guest Routes (Only for logged-out users) --- */}
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* --- Protected Routes (Only for logged-in users) --- */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip-planner"
          element={
            <ProtectedRoute>
              <TripPlanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <JourneysDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <Bookmarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/navigate/:tripId"
          element={
            <ProtectedRoute>
              <ActiveNavigation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/navigate"
          element={
            <ProtectedRoute>
              <ActiveNavigation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/join/:token"
          element={
            <ProtectedRoute>
              <JoinTrip />
            </ProtectedRoute>
          }
        />
      </Routes>
      <HelpBot />
    </div>
  );
};

export default App;