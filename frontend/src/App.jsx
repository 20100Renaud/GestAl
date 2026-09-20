import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./components/dashboard/DashboardLayout.jsx";
import Consultations from "./pages/Consultations.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Proprietaires from "./pages/Proprietaires.jsx";
import Animaux from "./pages/Animaux.jsx";
import Paiements from "./pages/Paiements.jsx";
import Tarifs from "./pages/Tarifs.jsx";
import Deplacements from "./pages/Deplacements.jsx";
import Zonages from "./pages/Zonages.jsx";

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

          <Route path="/dashboard/proprietaires" element={<Proprietaires />} />

          <Route path="/dashboard/animaux" element={<Animaux />} />

          <Route path="/dashboard/consultations" element={<Consultations />} />

          <Route path="/dashboard/paiements" element={<Paiements />} />

          <Route path="/dashboard/tarifs" element={<Tarifs />} />

          <Route path="/dashboard/deplacements" element={<Deplacements />} />

          <Route path="/dashboard/zonages" element={<Zonages />} />
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
