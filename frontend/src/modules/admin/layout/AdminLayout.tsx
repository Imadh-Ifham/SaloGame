import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../../../hooks/useAuth";
import LoadingScreen from "@/components/AuthorizeLoading";

const AdminLayout: React.FC = () => {
  const { user, loading } = useAuth(); // Get loading state as well

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !["manager", "owner"].includes(user.role)) {
    return <Navigate to="/admin/auth" replace />;
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-background-dark">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
