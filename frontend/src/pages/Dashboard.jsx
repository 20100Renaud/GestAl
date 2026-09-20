import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>

      <p>
        Bienvenue {user?.firstName} {user?.lastName}.
      </p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <span>Propriétaires</span>
          <strong>—</strong>
        </div>

        <div className="dashboard-card">
          <span>Animaux</span>
          <strong>—</strong>
        </div>

        <div className="dashboard-card">
          <span>Consultations</span>
          <strong>—</strong>
        </div>

        <div className="dashboard-card">
          <span>Paiements</span>
          <strong>—</strong>
        </div>
      </div>
    </div>
  );
}
