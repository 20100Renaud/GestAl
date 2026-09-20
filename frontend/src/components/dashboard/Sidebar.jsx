import { NavLink } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Propriétaires",
    path: "/dashboard/proprietaires",
  },
  {
    label: "Animaux",
    path: "/dashboard/animaux",
  },
  {
    label: "Consultations",
    path: "/dashboard/consultations",
  },
  {
    label: "Tarifs",
    path: "/dashboard/tarifs",
  },
  {
    label: "Déplacements",
    path: "/dashboard/deplacements",
  },
];

export default function Sidebar() {
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>GestAL</h1>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button type="button" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
