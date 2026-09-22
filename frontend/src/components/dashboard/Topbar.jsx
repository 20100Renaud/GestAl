import { useAuth } from "../../context/AuthContext.jsx";
import { usePageTitle } from "../../context/PageTitleContext.jsx";

export default function Topbar() {
  const { user } = useAuth();
  const { title } = usePageTitle();

  return (
    <header className="h-18 flex items-center justify-between px-8 py-0 bg-white border-b border-blue-200">
      <div>
        <h2 className="m-0 text-2xl font-semibold text-blue-900">
          {title || "Administration"}
        </h2>
      </div>

      <div className="flex items-center gap-3 text-blue-900">
        <span>
          {user?.firstName} {user?.lastName}
        </span>

        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
          {user?.Pratique}
        </span>
      </div>
    </header>
  );
}
