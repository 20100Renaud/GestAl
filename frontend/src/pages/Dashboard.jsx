import { useState } from "react";

import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import { CardDashboard, DashboardCards } from "../components/ui/Card.jsx";

import PrestationWorkflowModal from "../components/Modals/PrestationWorkflow_Modal.jsx";

export default function Dashboard() {
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <div>
      <PageHeader title="Tableau de bord"/>

      <div className="mb-6 flex justify-center">
        <Button onClick={() => setShowWorkflow(true)}>
          Nouvelle prestation
        </Button>
      </div>

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

      <PrestationWorkflowModal
        open={showWorkflow}
        onClose={() => setShowWorkflow(false)}
      />
    </div>
  );
}
