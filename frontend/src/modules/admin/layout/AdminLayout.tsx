import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../../../hooks/useAuth";
import LoadingScreen from "@/components/AuthorizeLoading";

const AdminLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Reset scroll position when route changes
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [location.pathname]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !["manager", "owner"].includes(user.role)) {
    return <Navigate to="/admin/auth" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <main id="main-content" className="flex-1 relative overflow-y-auto w-full h-full bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
