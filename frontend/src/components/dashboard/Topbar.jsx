import { useAuth } from "../../context/AuthContext.jsx";
import { usePageTitle } from "../../context/PageTitleContext.jsx";
import { Menu } from "lucide-react";

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const { title } = usePageTitle();

  return (
    <header className="h-18 flex items-center justify-between px-4 md:px-8 py-0 border-b border-blue-200 bg-blue-950 md:bg-white text-blue-300 md:text-blue-900">
      <div className="flex items-center gap-3 ">
        {/* Hamburger - mobile only */}
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg  hover:bg-blue-100 cursor-pointer"
          aria-label="Ouvrir le menu"
        >
          <Menu />
        </button>

        <h2 className="m-0 text-2xl md:text-2xl font-semibold ">
          {title || "Administration"}
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-3  sm:flex-row flex-col">
        <span className="text-nowrap">
          {user?.firstName} {user?.lastName}
        </span>

        {user.Pratique && (
          <span className="px-2 py-1 rounded-full bg-blue-100 text-xs font-semibold">
            {user?.Pratique}
          </span>
        )}
      </div>
    </header>
  );
}
