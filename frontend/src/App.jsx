import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./components/dashboard/DashboardLayout.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/dashboard/proprietaires"
            element={<div>Propriétaires</div>}
          />

          <Route path="/dashboard/animaux" element={<div>Animaux</div>} />

          <Route
            path="/dashboard/consultations"
            element={<div>Consultations</div>}
          />

          <Route path="/dashboard/tarifs" element={<div>Tarifs</div>} />

          <Route
            path="/dashboard/deplacements"
            element={<div>Déplacements</div>}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}
