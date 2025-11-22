import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.user);

  if (isLoading) {
    return null; // Wait for auth check to complete
  }

  // If user IS authenticated, redirect them away from login/signup
  if (isAuthenticated) {
    return <Navigate to="/profile" replace />; // Send them to their profile
  }

  // If not authenticated, show the login/signup page
  return children;
};

export default GuestRoute;
