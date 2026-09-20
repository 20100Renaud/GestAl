import { useAuth } from "../../context/AuthContext.jsx";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div>
        <h2>Administration</h2>
      </div>

      <div className="topbar-user">
        <span>
          {user?.firstName} {user?.lastName}
        </span>

        <span className="topbar-role">{user?.role}</span>
      </div>
    </header>
  );
}
