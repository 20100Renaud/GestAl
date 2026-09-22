import { NavLink as RouterNavLink } from "react-router-dom";

export default function NavLink({ to, end, children }) {
  return (
    <RouterNavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        isActive
          ? "block w-full px-3 py-2 rounded-lg text-blue-300 bg-blue-600 text-white "
          : "block w-full px-3 py-2 rounded-lg text-blue-300 hover:bg-blue-900 hover:text-white"
      }
    >
      {children}
    </RouterNavLink>
  );
}
