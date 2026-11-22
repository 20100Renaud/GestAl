import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { loading, isAuthenticated, sessionExpired } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ sessionExpired: sessionExpired }}
      />
    );
  }

  return <Outlet />;
}
