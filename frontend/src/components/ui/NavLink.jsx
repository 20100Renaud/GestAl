import { NavLink as RouterNavLink } from "react-router-dom";

export default function NavLink({
  to,
  end,
  onClick,
  children,
  className = "",
}) {
  return (
    <RouterNavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `${
          isActive
            ? "block px-3 py-2 rounded-lg text-blue-300 bg-blue-600 text-white"
            : "block px-3 py-2 rounded-lg text-blue-300 hover:bg-blue-900 hover:text-white"
        } ${className}`
      }
    >
      {children}
    </RouterNavLink>
  );
}
