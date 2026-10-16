import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import DeplacementsModal from "../components/Modals/Deplacements_Modal.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import PrestationsModal from "../components/Modals/Prestations_Modal.jsx";
import ProprietairesModal from "../components/Modals/Proprietaires_Modal.jsx";
import PrestationWorkflowModal from "../components/Modals/PrestationWorkflow_Modal.jsx";
import Alert from "../components/ui/Alert.jsx";
import ErrorModal from "../components/Modals/ErrorModal.jsx";
import { CardFilter } from "../components/ui/Card.jsx";
import { House } from "lucide-react";
import { formatDateShort } from "../utils/formatDate";
import {
  getStatutPaiement,
  formatAmountShort,
} from "../components/PrestationAmountHeader.jsx";

import Table, {
  Vide,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../components/ui/Table.jsx";

import {
  getPrestations,
  createPrestation,
  updatePrestation,
  deletePrestation,
} from "../api/prestations.js";

import { getProprietaires, createProprietaire } from "../api/proprietaires.js";

import { getDeplacements, createDeplacement } from "../api/deplacements.js";

const emptyForm = {
  ID_Proprietaire: "",
  ID_Lieu: "",
  ID_Deplacement: "",
  Date_Prestation: "",
  Remise_Prestation: "0",
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

export default function Prestations() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [prestations, setPrestations] = useState([]);
  const [proprietaires, setProprietaires] = useState([]);
  const [deplacements, setDeplacements] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [workflowPrestation, setWorkflowPrestation] = useState(null);
  const [showProprietaireForm, setShowProprietaireForm] = useState(false);

  const [proprietaireForm, setProprietaireForm] = useState({
    raisonSociale: "Particulier",
    etablissement: "",
    civilite: "",
    nom: "",
    prenom: "",
    email: "",
    adresse: "",
    ville: "",
    cp: "",
    tel: "",
  });

  const [savingProprietaire, setSavingProprietaire] = useState(false);

  const [showDeplacementForm, setShowDeplacementForm] = useState(false);
  const [deplacementForm, setDeplacementForm] = useState({
    Annee_Deplacement: String(new Date().getFullYear()),
    Denomination_Deplacement: "",
    Montant_Deplacement: "",
  });

  const [savingDeplacement, setSavingDeplacement] = useState(false);

  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState(null);
  const [filterCreances, setFilterCreances] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  async function loadData({ showLoading = true } = {}) {
    try {
      if (showLoading) setLoading(true);
      setError("");

      const [prestationsData, proprietairesData, deplacementsData] =
        await Promise.all([
          getPrestations(),
          getProprietaires(),
          getDeplacements(),
        ]);

      setPrestations(prestationsData);
      setProprietaires(proprietairesData);
      setDeplacements(deplacementsData);
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const statut = searchParams.get("statut");

    const filters = {
      reste: "Reste",
      "trop-percu": "Trop perçu",
      "aucun-paiement": "Aucun paiement",
    };

    if (statut === "creances") {
      setFilterStatut(null);
      setFilterCreances(true);
      setSearch("Créances");
      return;
    }

    if (statut && filters[statut]) {
      setFilterStatut(statut);
      setSearch(filters[statut]);
      setFilterCreances(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const prestationId = location.state?.openPrestationId;

    if (!prestationId || prestations.length === 0) {
      return;
    }

    const prestation = prestations.find(
      (item) => String(item.ID_Prestation) === String(prestationId),
    );

    if (!prestation) {
      return;
    }

    setWorkflowPrestation(prestation);
    setShowWorkflow(true);

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.state, location.pathname, prestations, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openCreateForm() {
    setWorkflowPrestation(null);
    setError("");
    setShowWorkflow(true);
  }

  function openEditForm(prestation) {
    setWorkflowPrestation(prestation);
    setError("");
    setShowWorkflow(true);
  }

  async function closeWorkflow() {
    setShowWorkflow(false);
    setWorkflowPrestation(null);
    setError("");

    await loadData({ showLoading: false });
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function getProprietaireLabel(prestation) {
    const proprietaire =
      prestation.Proprietaire_Prestation ??
      proprietaires.find(
        (item) =>
          String(item.ID_Proprietaire) === String(prestation.ID_Proprietaire),
      );

    if (!proprietaire) {
      return "-";
    }

    if (proprietaire.Etablissement) {
      return (
        <span className="text-left ml-4 sm:ml-0">
          {proprietaire.Raison_sociale} {proprietaire.Etablissement}
        </span>
      );
    }

    return (
      <span className="text-left ml-4 sm:ml-0">
        {proprietaire.Prenom_Proprietaire} {proprietaire.Nom_Proprietaire}
      </span>
    );
  }

  function openDeplacementForm() {
    setDeplacementForm({
      Annee_Deplacement: String(new Date().getFullYear()),
      Denomination_Deplacement: "",
      Montant_Deplacement: "",
    });

    setShowDeplacementForm(true);
  }

  function closeDeplacementForm() {
    if (savingDeplacement) {
      return;
    }

    setShowDeplacementForm(false);
  }

  function handleDeplacementChange(event) {
    const { name, value } = event.target;

    setDeplacementForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleDeplacementSubmit(event) {
    event.preventDefault();

    try {
      setSavingDeplacement(true);
      setError("");

      const newDeplacement = await createDeplacement(deplacementForm);

      const deplacementsData = await getDeplacements();

      setDeplacements(deplacementsData);

      setForm((current) => ({
        ...current,
        ID_Deplacement: newDeplacement.ID_Deplacement,
      }));

      setShowDeplacementForm(false);
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
    } finally {
      setSavingDeplacement(false);
    }
  }

  function openProprietaireForm() {
    setProprietaireForm({
      raisonSociale: "Particulier",
      etablissement: "",
      civilite: "",
      nom: "",
      prenom: "",
      email: "",
      adresse: "",
      ville: "",
      cp: "",
      tel: "",
    });

    setShowProprietaireForm(true);
  }

  function closeProprietaireForm() {
    if (savingProprietaire) {
      return;
    }

    setShowProprietaireForm(false);
  }

  function handleProprietaireChange(event) {
    const { name, value } = event.target;

    setProprietaireForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleProprietaireSubmit(event) {
    event.preventDefault();

    try {
      setSavingProprietaire(true);
      setError("");

      const newProprietaire = await createProprietaire(proprietaireForm);

      const proprietairesData = await getProprietaires();

      setProprietaires(proprietairesData);
      setForm((current) => ({
        ...current,
        ID_Proprietaire: newProprietaire.ID_Proprietaire,
        ID_Lieu: newProprietaire.ID_Proprietaire,
      }));

      setShowProprietaireForm(false);
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
    } finally {
      setSavingProprietaire(false);
    }
  }

  function getProprietaireName(prestation) {
    const proprietaire =
      prestation.Proprietaire_Prestation ??
      proprietaires.find(
        (item) =>
          String(item.ID_Proprietaire) === String(prestation.ID_Proprietaire),
      );

    if (!proprietaire) {
      return "";
    }

    if (proprietaire.Etablissement) {
      return `${proprietaire.Raison_sociale ?? ""} ${proprietaire.Etablissement}`;
    }

    return `${proprietaire.Prenom_Proprietaire ?? ""} ${
      proprietaire.Nom_Proprietaire ?? ""
    }`;
  }

  function getLieuName(prestation) {
    const lieu =
      prestation.Lieu_Prestation ??
      proprietaires.find((item) => item.ID_Proprietaire === prestation.ID_Lieu);

    if (!lieu) {
      return "";
    }

    if (lieu.Etablissement) {
      return `${lieu.Raison_sociale ?? ""} ${lieu.Etablissement}`;
    }

    return `${lieu.Prenom_Proprietaire ?? ""} ${lieu.Nom_Proprietaire ?? ""}`;
  }

  function getLieuLabel(prestation) {
    const lieu =
      prestation.Lieu_Prestation ??
      proprietaires.find((item) => item.ID_Proprietaire === prestation.ID_Lieu);

    if (!lieu) {
      return "-";
    }

    const isSameAsProprietaire =
      prestation.ID_Lieu === prestation.ID_Proprietaire;

    const label = lieu.Etablissement
      ? `${lieu.Raison_sociale} ${lieu.Etablissement}`
      : `${lieu.Prenom_Proprietaire} ${lieu.Nom_Proprietaire}`;

    return (
      <span className="flex justify-center ml-4 sm:ml-0">
        {isSameAsProprietaire ? <House size={16} strokeWidth={1.25} /> : label}
      </span>
    );
  }

  function getConsultationSummary(prestation) {
    const consultations = prestation.Consultations_Prestation ?? [];

    if (consultations.length === 0) {
      return "-";
    }
    const total = consultations.reduce(
      (sum, consultation) =>
        sum + Number(consultation.Tarif_Consultation?.Montant_Tarif ?? 0),
      0,
    );

    return `${total} € (${consultations.length})`;
  }

  const filteredPrestations = useMemo(() => {
    const value = search.trim().toLowerCase();

    return prestations.filter((prestation) => {
      const statut = getStatutPaiement(prestation);

      if (filterCreances) {
        if (statut.type !== "reste" && statut.type !== "aucun-paiement") {
          return false;
        }
      } else if (filterStatut && statut.type !== filterStatut) {
        return false;
      }

      if (!value || value === "créances") {
        return true;
      }

      const proprietaire = getProprietaireName(prestation);
      const lieu = getLieuName(prestation);
      const date = formatDateShort(prestation.Date_Prestation);
      const deplacement =
        prestation.Deplacement_Prestation?.Denomination_Deplacement ?? "";

      return [
        proprietaire,
        lieu,
        date,
        deplacement,
        statut.label,
        prestation.Remise_Prestation,
        prestation.Montant_Prestation,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [prestations, proprietaires, search, filterStatut, filterCreances]);

  const totalsPrestations = useMemo(() => {
    return filteredPrestations.reduce(
      (totals, prestation) => {
        const statut = getStatutPaiement(prestation);

        if (statut.type === "reste") {
          totals.reste += Number(statut.montant) || 0;
        } else if (statut.type === "trop-percu") {
          totals.tropPercu += Number(statut.montant) || 0;
        } else if (statut.type === "aucun-paiement") {
          totals.aucunPaiement += Number(statut.montantPrestation) || 0;
        }

        totals.creances = totals.reste + totals.aucunPaiement;

        return totals;
      },
      {
        soldee: 0,
        reste: 0,
        tropPercu: 0,
        aucunPaiement: 0,
        creances: 0,
      },
    );
  }, [filteredPrestations]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await updatePrestation(editingId, form);
      } else {
        await createPrestation(form);
      }

      await loadData();
      closeForm();
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cette prestation ?")) {
      return;
    }

    try {
      setError("");

      await deletePrestation(id);

      if (editingId === id) {
        closeForm();
      }

      await loadData();
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
    }
  }

  return (
    <div className="w-full">
      {error && <Alert variant="error">{error}</Alert>}

      <PageHeader
        title={
          <>
            <span className="hidden md:inline">Gestion des Prestations</span>
            <span className="md:hidden">Prestations</span>
          </>
        }
        search={search}
        onSearchChange={(value) => {
          setSearch(value);

          if (!value.trim()) {
            setFilterStatut(null);
            setFilterCreances(false);
          } else {
            setFilterCreances(false);
            setFilterStatut(null);
          }
        }}
        searchPlaceholder="Rechercher une prestation..."
        createLabel="Nouvelle prestation"
        onAction={openCreateForm}
        className="mb-6"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <CardFilter
          title="Créances"
          value={formatCurrency(totalsPrestations.creances)}
          color="red"
          active={filterCreances}
          onClick={() => {
            const next = !filterCreances;
            setFilterCreances(next);
            setFilterStatut(null);
            setSearch(next ? "Créances" : "");
          }}
        />

        <CardFilter
          title="Aucun paiement"
          value={formatCurrency(totalsPrestations.aucunPaiement)}
          color="blue"
          active={filterStatut === "aucun-paiement"}
          onClick={() => {
            const next =
              filterStatut === "aucun-paiement" ? null : "aucun-paiement";
            setFilterCreances(false);
            setFilterStatut(next);
            setSearch(next === "aucun-paiement" ? "Aucun paiement" : "");
          }}
        />

        <CardFilter
          title="Reste à payer"
          value={formatCurrency(totalsPrestations.reste)}
          color="blue"
          active={filterStatut === "reste"}
          onClick={() => {
            const next = filterStatut === "reste" ? null : "reste";
            setFilterCreances(false);
            setFilterStatut(next);
            setSearch(next === "reste" ? "Reste" : "");
          }}
        />

        <CardFilter
          title="Trop-perçu"
          value={formatCurrency(totalsPrestations.tropPercu)}
          color="blue"
          active={filterStatut === "trop-percu"}
          onClick={() => {
            const next = filterStatut === "trop-percu" ? null : "trop-percu";
            setFilterCreances(false);
            setFilterStatut(next);
            setSearch(next ? "Trop perçu" : "");
          }}
        />
      </div>

      {/* Count */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-blue-900">
          {filteredPrestations.length} prestation
          {filteredPrestations.length > 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : filteredPrestations.length === 0 ? (
        <Vide search={search} />
      ) : (
        <div>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Date</TableHeader>
                <TableHeader>Propriétaire</TableHeader>

                <TableHeader className="hidden lg:table-cell">Lieu</TableHeader>

                <TableHeader className="hidden lg:table-cell">
                  Déplacement
                </TableHeader>

                <TableHeader className="hidden lg:table-cell">
                  Consultations
                </TableHeader>

                <TableHeader className="hidden lg:table-cell">
                  Remise
                </TableHeader>

                <TableHeader>Montant</TableHeader>
              </TableRow>
            </TableHead>

            <tbody>
              {filteredPrestations.map((prestation) => (
                <TableRow
                  key={prestation.ID_Prestation}
                  onClick={() => openEditForm(prestation)}
                >
                  <TableCell>
                    {formatDateShort(prestation.Date_Prestation)}
                  </TableCell>

                  <TableCell>{getProprietaireLabel(prestation)}</TableCell>

                  <TableCell className="hidden lg:table-cell">
                    {getLieuLabel(prestation)}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    {Number(
                      prestation.Deplacement_Prestation?.Montant_Deplacement,
                    ) > 0
                      ? `${prestation.Deplacement_Prestation.Montant_Deplacement} €`
                      : "-"}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    {getConsultationSummary(prestation)}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    {Number(prestation.Remise_Prestation) > 0
                      ? `${prestation.Remise_Prestation} €`
                      : "-"}
                  </TableCell>

                  <TableCell>
                    {(() => {
                      const statut = getStatutPaiement(prestation);

                      const statusColor = {
                        reste: "text-red-600",
                        "trop-percu": "text-blue-600",
                        soldee: "text-green-600",
                        "aucun-paiement": "text-red-500",
                      }[statut.type];

                      return (
                        <div className="flex flex-col">
                          <span>
                            {formatAmountShort(statut.montantPrestation)}
                          </span>

                          <span className={`text-xs ${statusColor}`}>
                            {statut.type === "reste" ||
                            statut.type === "trop-percu"
                              ? `${statut.label} : ${formatAmountShort(statut.montant)}`
                              : statut.label}
                          </span>
                        </div>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <PrestationWorkflowModal
        open={showWorkflow}
        prestation={workflowPrestation}
        onClose={closeWorkflow}
      />

      <PrestationsModal
        open={showForm}
        editingId={editingId}
        form={form}
        proprietaires={proprietaires}
        deplacements={deplacements}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onDelete={handleDelete}
        onAddDeplacement={openDeplacementForm}
        onAddProprietaire={openProprietaireForm}
      />

      <DeplacementsModal
        open={showDeplacementForm}
        editingId={null}
        form={deplacementForm}
        saving={savingDeplacement}
        error={error}
        onClose={closeDeplacementForm}
        onSubmit={handleDeplacementSubmit}
        onChange={handleDeplacementChange}
        onDelete={() => {}}
      />

      <ProprietairesModal
        open={showProprietaireForm}
        editingId={null}
        form={proprietaireForm}
        saving={savingProprietaire}
        onClose={closeProprietaireForm}
        onSubmit={handleProprietaireSubmit}
        onChange={handleProprietaireChange}
        onDelete={() => {}}
      />

      <ErrorModal
        open={showErrorModal}
        message={error}
        onClose={() => {
          setShowErrorModal(false);
          setError("");
        }}
      />
    </div>
  );
}
