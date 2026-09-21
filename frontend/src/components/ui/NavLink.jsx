import { NavLink as RouterNavLink } from "react-router-dom";

export default function NavLink({ to, end, children }) {
  return (
    <RouterNavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        isActive
          ? "px-3 py-3 rounded-lg text-gray-300 bg-blue-600 text-white"
          : "px-3 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
      }
    >
      {children}
    </RouterNavLink>
  );
}
