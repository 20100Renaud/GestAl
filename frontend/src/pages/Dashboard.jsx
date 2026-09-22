import { useAuth } from "../context/AuthContext.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import {CardDashboard, DashboardCards} from "../components/ui/Card.jsx"
export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
      />

      <DashboardCards>
        <CardDashboard
          title="Propriétaires"
          value="42"
          subtitle="propriétaires actifs"
        />
        <CardDashboard
          title="Animaux"
          value="128"
          subtitle="animaux enregistrés"
        />
        <CardDashboard title="Consultations" value="89" subtitle="ce mois-ci" />
        <CardDashboard
          title="Paiements"
          value="2 450 €"
          subtitle="total facturé"
        />
      </DashboardCards>
    </div>
  );
}
