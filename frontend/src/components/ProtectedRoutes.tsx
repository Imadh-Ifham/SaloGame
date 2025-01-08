// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  requireAuth: boolean;
  requiredRole?: "admin" | "user";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requireAuth,
  requiredRole,
}) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a spinner or skeleton
  }

  if (requireAuth && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userData?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
