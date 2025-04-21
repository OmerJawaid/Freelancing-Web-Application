// Frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/Authcontext';

const ProtectedRoute = ({ children, userType }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.User_Type !== userType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;