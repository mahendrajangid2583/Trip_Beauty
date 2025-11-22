import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Get auth status from Redux
  const { isAuthenticated, isLoading } = useSelector((state) => state.user); // Adjust 'auth' to your reducer name
  const location = useLocation();

  // 1. If we are still loading, don't render anything yet
  //    (App.js already shows a global spinner, so this is just a safety net)
  if (isLoading) {
    return null;
  }

  // 2. If NOT authenticated, redirect to login
  if (!isAuthenticated) {
    // 'replace' stops the user from using the back button to go to the protected page
    // 'state' remembers where they were trying to go, so you can redirect them back
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. If authenticated, show the page!
  return children;
};

export default ProtectedRoute;
