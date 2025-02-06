import { Navigate, Outlet } from "react-router-dom";

interface User {
  role: string;
}

interface ProtectedRouteProps {
  user: User | null;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  user,
  allowedRoles,
}) => {
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/auth" />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
