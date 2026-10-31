import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Alert from "../components/ui/Alert.jsx";
import {
  CardDashboard,
  CardProprietairesInactifs,
} from "../components/ui/Card.jsx";
import PrestationWorkflowModal from "../components/Wokflow_modals/PrestationWorkflow_Modal.jsx";
import { getConsultations } from "../api/consultations.js";
import { getPaiements } from "../api/paiements.js";
import { getPrestations } from "../api/prestations.js";
import { getStatutPaiement } from "../components/PrestationAmountHeader.jsx";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

const monthFormatter = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
});

function getCurrentMonthName() {
  const name = monthFormatter.format(new Date());

  return name.charAt(0).toLocaleUpperCase("fr-FR") + name.slice(1);
}

function parseAmount(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value).trim().replace(/\s/g, "").replace(",", ".");

  const amount = Number(normalized);

  return Number.isFinite(amount) ? amount : 0;
}

function getDateKey(value) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return "";
  }

  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    parsed.getFullYear() !== Number(year) ||
    parsed.getMonth() !== Number(month) - 1 ||
    parsed.getDate() !== Number(day)
  ) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

function getConsultationDate(consultation) {
  return getDateKey(
    consultation.Prestation_Consultation?.Date_Prestation ??
      consultation.Date_Prestation,
  );
}

function getEncashmentDate(paiement) {
  return getDateKey(paiement.Date_Encaissement);
}

function isInYear(dateKey, year) {
  return dateKey !== "" && dateKey.slice(0, 4) === String(year);
}

function isInMonth(dateKey, year, month) {
  if (!dateKey) {
    return false;
  }

  const yearMonth = `${year}-${String(month).padStart(2, "0")}`;

  return dateKey.startsWith(`${yearMonth}-`);
}

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count > 1 ? plural : singular}`;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [showWorkflow, setShowWorkflow] = useState(false);
  const [prestations, setPrestations] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthsWithoutPrestation, setMonthsWithoutPrestation] = useState(18);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [consultationsData, paiementsData, prestationsData] =
        await Promise.all([
          getConsultations(),
          getPaiements(),
          getPrestations(),
        ]);

      setConsultations(consultationsData);
      setPaiements(paiementsData);
      setPrestations(prestationsData);
    } catch (err) {
      setError(
        err.message || "Impossible de charger les données du tableau de bord.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentMonthName = getCurrentMonthName();

  const consultationsThisYear = consultations.filter((consultation) =>
    isInYear(getConsultationDate(consultation), currentYear),
  );

  const consultationsThisMonth = consultations.filter((consultation) =>
    isInMonth(getConsultationDate(consultation), currentYear, currentMonth),
  );

  const prestationsAvecCreances = prestations
    .map((prestation) => ({
      prestation,
      statut: getStatutPaiement(prestation),
    }))
    .filter(
      ({ statut }) =>
        statut.type === "reste" || statut.type === "aucun-paiement",
    );

  const montantCreances = prestationsAvecCreances.reduce(
    (total, { statut }) =>
      total +
      (statut.type === "reste"
        ? Number(statut.montant) || 0
        : Number(statut.montantPrestation) || 0),
    0,
  );

  const paiementsEnAttenteEncaissement = paiements.filter(
    (paiement) => !getEncashmentDate(paiement),
  );

  const montantEnAttenteEncaissement = paiementsEnAttenteEncaissement.reduce(
    (total, paiement) => total + parseAmount(paiement.Montant_Paiement),
    0,
  );

  const encaissementsThisYear = paiements.filter((paiement) =>
    isInYear(getEncashmentDate(paiement), currentYear),
  );

  const encaissementsThisMonth = paiements.filter((paiement) =>
    isInMonth(getEncashmentDate(paiement), currentYear, currentMonth),
  );

  const montantEncaisseThisYear = encaissementsThisYear.reduce(
    (total, paiement) => total + parseAmount(paiement.Montant_Paiement),
    0,
  );

  const montantEncaisseThisMonth = encaissementsThisMonth.reduce(
    (total, paiement) => total + parseAmount(paiement.Montant_Paiement),
    0,
  );

  return (
    <div className="w-full">
      <PageHeader
        title="Tableau de bord"
        createLabel="Nouvelle prestation"
        onAction={() => setShowWorkflow(true)}
        className="mb-6"
      />

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
          <Button onClick={loadData}>Réessayer</Button>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 sm:gap-8">
        <CardProprietairesInactifs
          months={monthsWithoutPrestation}
          onMonthsChange={setMonthsWithoutPrestation}
          onClick={() =>
            navigate(
              `/prestations?statut=sans-prestation&mois=${monthsWithoutPrestation}`,
            )
          }
        />

        <CardDashboard
          title="CONSULTATIONS"
          value={loading ? "…" : consultationsThisYear.length}
          subtitle={`en ${currentYear}`}
          secondaryValue={loading ? "…" : consultationsThisMonth.length}
          secondarySubtitle={`en ${currentMonthName}`}
          onValueClick={() =>
            navigate("/consultations?statut=consultations-annee")
          }
          onSecondaryValueClick={() =>
            navigate("/consultations?statut=consultations-mois")
          }
        />

        <CardDashboard
          title="CHIFFRE D'AFFAIRES"
          value={loading ? "…" : formatCurrency(montantEncaisseThisYear)}
          subtitle={`en ${currentYear}`}
          secondaryValue={
            loading ? "…" : formatCurrency(montantEncaisseThisMonth)
          }
          secondarySubtitle={`en ${currentMonthName}`}
          onValueClick={() => navigate("/paiements?statut=encaissements")}
          onSecondaryValueClick={() =>
            navigate("/paiements?statut=encaissements-mois")
          }
          borderColor="border-t-green-600"
          titleColor="text-green-700"
          valueColor="text-green-900"
          subtitleColor="text-green-500"
          secondaryValueColor="text-green-700"
          secondarySubtitleColor="text-green-400"
          HoverColor="hover:bg-green-50"
        />

        <CardDashboard
          title="CRÉANCES"
          value={loading ? "…" : prestationsAvecCreances.length}
          subtitle={`en ${currentYear}`}
          secondaryValue={loading ? "…" : formatCurrency(montantCreances)}
          secondarySubtitle="reste à payer"
          onCardClick={() => navigate("/prestations?statut=creances")}
          borderColor="border-t-red-600"
          titleColor="text-red-700"
          valueColor="text-red-900"
          subtitleColor="text-red-500"
          secondaryValueColor="text-red-700"
          secondarySubtitleColor="text-red-400"
        />

        <CardDashboard
          title="À ENCAISSER"
          value={loading ? "…" : paiementsEnAttenteEncaissement.length}
          subtitle={
            loading
              ? "paiement"
              : pluralize(paiementsEnAttenteEncaissement.length, "paiement")
          }
          secondaryValue={
            loading ? "…" : formatCurrency(montantEnAttenteEncaissement)
          }
          secondarySubtitle="à encaisser"
          onCardClick={() => navigate("/paiements?statut=a-encaisser")}
          borderColor="border-t-purple-600"
          titleColor="text-purple-700"
          valueColor="text-purple-900"
          subtitleColor="text-purple-500"
          secondaryValueColor="text-purple-700"
          secondarySubtitleColor="text-purple-400"
        />
      </div>

      <PrestationWorkflowModal
        open={showWorkflow}
        onClose={() => setShowWorkflow(false)}
      />
    </div>
  );
}
