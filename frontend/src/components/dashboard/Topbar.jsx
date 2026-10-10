import { Menu } from "lucide-react";
import { usePageTitle } from "../../context/PageTitleContext.jsx";

export default function Topbar({ onMenuClick }) {
  const { title } = usePageTitle();

  return (
    <header className="relative flex min-h-[72px] items-center justify-between gap-3 border-b border-blue-200 bg-blue-950 px-4 text-blue-300 md:bg-white md:px-8 md:text-blue-900">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="cursor-pointer rounded-lg p-2 hover:bg-blue-100 md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>

        <h2 className="m-0 truncate text-xl font-semibold md:text-2xl">
          {title || "Administration"}
        </h2>
      </div>
    </header>
  );
}
