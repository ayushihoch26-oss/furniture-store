// src/components/ProtectedRoute.jsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken, getCurrentUser } from "../service/login.service";

// Usage:
//   <Route element={<ProtectedRoute />}>                     -> any logged-in user
//   <Route element={<ProtectedRoute roles={["admin"]} />}>   -> admin only
export default function ProtectedRoute({ roles }) {
  const location = useLocation();
  const token = getToken();
  const user = getCurrentUser();

  // Not logged in -> go to login, remember where they were going
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role -> send to their own home
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }

  return <Outlet />;
}
