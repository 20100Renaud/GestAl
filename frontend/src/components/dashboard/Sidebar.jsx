import NavLink from "../ui/NavLink.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { Settings } from "lucide-react";

const navigation = [
  {
    label: "Tableau de bord",
    path: "/dashboard",
    separator: true,
  },
  {
    label: "Prestations",
    path: "/dashboard/prestations",
  },
  {
    label: "Consultations",
    path: "/dashboard/consultations",
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
    label: "Paiements",
    path: "/dashboard/paiements",
    separator: true,
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
  {
    label: "Utilisateurs",
    path: "/dashboard/users",
    adminOnly: true,
  },
];

export default function Sidebar({ onNavigate, onOpenProfile }) {
  const { user, logout } = useAuth();

  const visibleNavigation = navigation.filter(
    (item) => !item.adminOnly || user?.role === "ADMIN",
  );
  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <aside className="sticky top-0 flex h-screen min-h-full w-[240px] flex-col bg-blue-950 text-white">
      <div className="border-b border-white/40 p-5 text-2xl">
        <h1>GestAL</h1>
      </div>

      <nav className="flex flex-col p-4">
        {visibleNavigation.map((item, index) => (
          <div key={item.path}>
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={() => onNavigate?.()}
            >
              {item.label}
            </NavLink>

            {item.separator && index < visibleNavigation.length - 1 && (
              <div className="border-b border-white/40 my-2 md:my-6" />
            )}
          </div>
        ))}
      </nav>

      <div className="mt-auto p-4 border-t border-white/10">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {user?.firstName} {user?.lastName}
            </p>

            {user?.role === "CLIENT" && user?.Pratique && (
              <p className="truncate text-xs text-blue-200">{user.Pratique}</p>
            )}
          </div>

          {user?.role === "CLIENT" && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="shrink-0 rounded-lg p-2 transition-colors hover:bg-white/10 cursor-pointer"
              aria-label="Modifier mon profil"
              title="Modifier mon profil"
            >
              <Settings size={20} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={async () => {
            await handleLogout();
            onNavigate?.();
          }}
          className="w-full p-2 rounded-lg bg-gray-700 text-white cursor-pointer hover:bg-gray-600"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
