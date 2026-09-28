import { useEffect, useMemo, useState } from "react";
import DeplacementsModal from "../components/Modals/Deplacements_Modal.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import PrestationsModal from "../components/Modals/Prestations_Modal.jsx";
import ProprietairesModal from "../components/Modals/Proprietaires_Modal.jsx";
import PrestationWorkflowModal from "../components/Modals/PrestationWorkflow_Modal.jsx";
import Alert from "../components/ui/Alert.jsx";
import { MapPin } from "lucide-react";
import { formatDate } from "../utils/formatDate";

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

export default function Prestations() {
  const [prestations, setPrestations] = useState([]);
  const [proprietaires, setProprietaires] = useState([]);
  const [deplacements, setDeplacements] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openCreateForm() {
    setError("");
    setShowWorkflow(true);
  }

  async function handleWorkflowClose() {
    setShowWorkflow(false);
    setError("");
    await loadData();
  }


  function openEditForm(prestation) {
    setEditingId(prestation.ID_Prestation);

    setForm({
      ID_Proprietaire: prestation.ID_Proprietaire ?? "",

      ID_Lieu: prestation.ID_Lieu ?? "",

      ID_Deplacement: prestation.ID_Deplacement ?? "",

      Date_Prestation: prestation.Date_Prestation
        ? prestation.Date_Prestation.slice(0, 10)
        : "",

      Remise_Prestation: String(prestation.Remise_Prestation ?? "0"),
    });

    setError("");
    setShowForm(true);
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
        (item) => item.ID_Proprietaire === prestation.ID_Proprietaire,
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
    } finally {
      setSavingProprietaire(false);
    }
  }

  function getProprietaireName(prestation) {
    const proprietaire =
      prestation.Proprietaire_Prestation ??
      proprietaires.find(
        (item) => item.ID_Proprietaire === prestation.ID_Proprietaire,
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
        {isSameAsProprietaire ? <MapPin size={16} strokeWidth={1.25} /> : label}
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

    if (!value) {
      return prestations;
    }

    return prestations.filter((prestation) => {
      const proprietaire = getProprietaireName(prestation);

      const lieu = getLieuName(prestation);

      const date = formatDate(prestation.Date_Prestation);

      const deplacement =
        prestation.Deplacement_Prestation?.Denomination_Deplacement ?? "";

      return [
        proprietaire,
        lieu,
        date,
        deplacement,
        prestation.Remise_Prestation,
        prestation.Montant_Prestation,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [prestations, proprietaires, search]);

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
    }
  }

  return (
    <div className="w-full">
      {error && <Alert variant="error">{error}</Alert>}

      <PageHeader
        title="Prestations"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une prestation..."
        createLabel="Nouvelle prestation"
        onAction={openCreateForm}
      />

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
                    {formatDate(prestation.Date_Prestation)}
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
                    {String(prestation.Montant_Prestation ?? "0")} €
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <PrestationWorkflowModal
        open={showWorkflow}
        onClose={handleWorkflowClose}
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
    </div>
  );
}
