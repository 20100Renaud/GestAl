import NavLink from "../ui/NavLink.jsx";
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
    label: "Paiements",
    path: "/dashboard/paiements",
  },
  {
    label: "Tarifs",
    path: "/dashboard/tarifs",
  },
  {
    label: "Déplacements",
    path: "/dashboard/deplacements",
  },
  {
    label: "Zonage",
    path: "/dashboard/zonages",
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
    <aside className="w-[240px] min-h-full flex flex-col bg-blue-950 text-white  sticky top-0 h-screen">
      <div className="p-5 border-b border-white/40 text-2xl">
        <h1>GestAL</h1>
      </div>

      <nav className="flex flex-col p-4 gap-1">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full p-2.5 rounded-lg bg-gray-700 text-white cursor-pointer hover:bg-gray-600"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
