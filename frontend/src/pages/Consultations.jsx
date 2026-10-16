import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { createConsultationPdfHandler } from "../utils/consultationPdfHandler.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import Alert from "../components/ui/Alert.jsx";
import ErrorModal from "../components/Modals/ErrorModal.jsx";
import { CardFilter } from "../components/ui/Card.jsx";
import { formatDateShort } from "../utils/formatDate";
import PrestationWorkflowZonages from "../components/Modals/PrestationWorkflow_Zonages.jsx";
import Table, {
  Vide,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../components/ui/Table.jsx";
import ConsultationsModal from "../components/Modals/Consultations_Modal.jsx";
import TarifsModal from "../components/Modals/Tarifs_Modal.jsx";
import AnimauxModal from "../components/Modals/Animaux_Modal.jsx";
import {
  getConsultations,
  createConsultation,
  updateConsultation,
  deleteConsultation,
} from "../api/consultations.js";

import { getAnimaux, createAnimal, updateAnimal } from "../api/animaux.js";
import { getProprietaires } from "../api/proprietaires.js";
import { getZonages } from "../api/zonages.js";
import { getTarifs, createTarif } from "../api/tarifs.js";

import {
  getConsultationZonages,
  createConsultationZonage,
  updateConsultationZonage,
  deleteConsultationZonage,
} from "../api/consultation-zonages.js";

import { getPrestations } from "../api/prestations.js";

const emptyForm = {
  ID_Prestation: "",
  ID_Animal: "",
  ID_Tarif: "",
  Quantite_Consultation: "1",
  Motif_Consultation: "",
  Description_Consultation: "",
  Commentaire_Consultation: "",
};

export default function Consultations() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [consultations, setConsultations] = useState([]);
  const [animaux, setAnimaux] = useState([]);
  const [proprietaires, setProprietaires] = useState([]);
  const [zonages, setZonages] = useState([]);
  const [showZonages, setShowZonages] = useState(false);
  const [zonageConsultationId, setZonageConsultationId] = useState(null);
  const [tarifs, setTarifs] = useState([]);
  const [consultationZonages, setConsultationZonages] = useState([]);
  const [prestations, setPrestations] = useState([]);
  const [selectedPrestation, setSelectedPrestation] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showTarifForm, setShowTarifForm] = useState(false);
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [editingAnimalId, setEditingAnimalId] = useState(null);
  const [animalForm, setAnimalForm] = useState({
    ID_Proprietaire: "",
    Nom_Animal: "",
    Genre_Animal: "",
    Race_Animal: "",
    Date_Naissance_Animal: "",
    Sexe_Animal: "",
    Memo_Animal: "",
  });

  const [savingAnimal, setSavingAnimal] = useState(false);

  const [tarifForm, setTarifForm] = useState({
    Annee_Tarif: String(new Date().getFullYear()),
    Denomination_Tarif: "",
    Montant_Tarif: "",
  });

  const [savingTarif, setSavingTarif] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [filterCurrentYear, setFilterCurrentYear] = useState(false);
  const [filterCurrentMonth, setFilterCurrentMonth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        consultationsData,
        prestationsData,
        animauxData,
        proprietairesData,
        zonagesData,
        tarifsData,
      ] = await Promise.all([
        getConsultations(),
        getPrestations(),
        getAnimaux(),
        getProprietaires(),
        getZonages(),
        getTarifs(),
      ]);

      setConsultations(consultationsData);
      setPrestations(prestationsData);
      setAnimaux(animauxData);
      setProprietaires(proprietairesData);
      setZonages(zonagesData);
      setTarifs(tarifsData);
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchParams.has("statut")) return;

    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const statut = searchParams.get("statut");
    const currentYear = new Date().getFullYear();

    if (statut === "consultations-annee") {
      setFilterCurrentYear(true);
      setFilterCurrentMonth(false);
      setSearch(String(currentYear));
    } else if (statut === "consultations-mois") {
      setFilterCurrentYear(false);
      setFilterCurrentMonth(true);
      setSearch(getCurrentMonthSearch());
    }
  }, [searchParams]);

  useEffect(() => {
    const state = location.state;

    if (!state?.openPrestationId) {
      return;
    }

    const prestation = prestations.find(
      (item) => String(item.ID_Prestation) === String(state.openPrestationId),
    );

    if (!prestation) {
      return;
    }

    setWorkflowPrestation(prestation);
    setInitialConsultationId(state.consultationId ?? null);
    setError("");
    setShowWorkflow(true);

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.state, prestations, navigate, location.pathname]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openZonages(consultationId) {
    setZonageConsultationId(consultationId);
    setShowZonages(true);
  }

  function closeZonages() {
    setShowZonages(false);
    setZonageConsultationId(null);
  }

  async function refreshConsultationZonages() {
    if (!editingId) return;

    const data = await getConsultationZonages(editingId);
    setConsultationZonages(data);
  }

  function openPrestation(prestation) {
    if (!prestation?.ID_Prestation) {
      return;
    }

    navigate("/dashboard/prestations", {
      state: {
        openPrestationId: prestation.ID_Prestation,
        consultationId: editingId,
      },
    });

    setShowForm(false);
  }

  function handleZonageToggle(zonageId) {
    const existing = consultationZonages.find(
      (item) => item.ID_Zonage === zonageId,
    );

    if (existing) {
      setConsultationZonages((current) =>
        current.filter((item) => item.ID_Zonage !== zonageId),
      );

      return;
    }

    const zonage = zonages.find((item) => item.ID_Zonage === zonageId);

    if (!zonage) {
      return;
    }

    setConsultationZonages((current) => [
      ...current,
      {
        ID_Consultation_Zonage: `new-${zonageId}`,
        ID_Consultation: editingId,
        ID_Zonage: zonageId,
        Commentaire_Zonage: "",
        Zonage: zonage,
      },
    ]);
  }

  function handleZonageCommentChange(zonageId, value) {
    setConsultationZonages((current) =>
      current.map((item) =>
        item.ID_Zonage === zonageId
          ? {
              ...item,
              Commentaire_Zonage: value,
            }
          : item,
      ),
    );
  }

  async function openEditForm(consultation) {
    setEditingId(consultation.ID_Consultation);

    setSelectedPrestation(
      consultation.Prestation_Consultation ??
        prestations.find(
          (item) =>
            String(item.ID_Prestation) === String(consultation.ID_Prestation),
        ) ??
        null,
    );

    setForm({
      ID_Prestation: consultation.ID_Prestation ?? "",
      ID_Animal: consultation.ID_Animal ?? "",
      ID_Tarif: consultation.ID_Tarif ?? "",
      Quantite_Consultation: String(consultation.Quantite_Consultation ?? "1"),
      Motif_Consultation: consultation.Motif_Consultation || "",
      Description_Consultation: consultation.Description_Consultation || "",
      Commentaire_Consultation: consultation.Commentaire_Consultation || "",
    });

    setConsultationZonages([]);
    setError("");
    setShowForm(true);

    try {
      const data = await getConsultationZonages(consultation.ID_Consultation);

      setConsultationZonages(data);
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
      setShowErrorModal(true);
    }
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setSelectedPrestation(null);
    setForm(emptyForm);
    setConsultationZonages([]);
  }

  function openTarifForm() {
    setTarifForm({
      Annee_Tarif: String(new Date().getFullYear()),
      Denomination_Tarif: "",
      Montant_Tarif: "",
    });

    setShowTarifForm(true);
  }

  function closeTarifForm() {
    if (savingTarif) {
      return;
    }

    setShowTarifForm(false);
  }

  function handleTarifChange(event) {
    const { name, value } = event.target;

    setTarifForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleTarifSubmit(event) {
    event.preventDefault();

    try {
      setSavingTarif(true);
      setError("");

      const newTarif = await createTarif(tarifForm);

      const tarifsData = await getTarifs();
      setTarifs(tarifsData);

      setForm((current) => ({
        ...current,
        ID_Tarif: newTarif.ID_Tarif,
      }));

      setShowTarifForm(false);
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
      setShowErrorModal(true);
    } finally {
      setSavingTarif(false);
    }
  }

  function openAnimalForm() {
    setEditingAnimalId(null);
    const selectedPrestation = prestations.find(
      (prestation) =>
        String(prestation.ID_Prestation) === String(form.ID_Prestation),
    );

    setAnimalForm({
      ID_Proprietaire: selectedPrestation?.ID_Proprietaire ?? "",
      Nom_Animal: "",
      Genre_Animal: "",
      Race_Animal: "",
      Date_Naissance_Animal: "",
      Sexe_Animal: "",
      Memo_Animal: "",
    });

    setShowAnimalForm(true);
  }

  function openEditAnimal(animalId) {
    const animal = animaux.find(
      (item) => String(item.ID_Animal) === String(animalId),
    );

    if (!animal) {
      setError("Animal introuvable.");
      return;
    }

    setEditingAnimalId(animal.ID_Animal);

    setAnimalForm({
      ID_Proprietaire: animal.ID_Proprietaire ?? "",
      Nom_Animal: animal.Nom_Animal ?? "",
      Genre_Animal: animal.Genre_Animal ?? "",
      Race_Animal: animal.Race_Animal ?? "",
      Date_Naissance_Animal: animal.Date_Naissance_Animal
        ? String(animal.Date_Naissance_Animal).slice(0, 10)
        : "",
      Sexe_Animal: animal.Sexe_Animal ?? "",
      Memo_Animal: animal.Memo_Animal ?? "",
    });

    setError("");
    setShowAnimalForm(true);
  }

  function closeAnimalForm() {
    if (savingAnimal) {
      return;
    }

    setShowAnimalForm(false);
    setEditingAnimalId(null);
  }

  function handleAnimalChange(event) {
    const { name, value } = event.target;

    setAnimalForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleAnimalSubmit(event) {
    event.preventDefault();

    try {
      setSavingAnimal(true);
      setError("");

      if (editingAnimalId != null) {
        const updatedAnimal = await updateAnimal(editingAnimalId, animalForm);

        setAnimaux((current) =>
          current.map((animal) =>
            String(animal.ID_Animal) === String(editingAnimalId)
              ? { ...animal, ...updatedAnimal }
              : animal,
          ),
        );

        setShowAnimalForm(false);
        setEditingAnimalId(null);
        return;
      }

      const newAnimal = await createAnimal(animalForm);

      setAnimaux((current) => [...current, newAnimal]);

      setForm((current) => ({
        ...current,
        ID_Animal: newAnimal.ID_Animal,
      }));

      setShowAnimalForm(false);
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
      setShowErrorModal(true);
    } finally {
      setSavingAnimal(false);
    }
  }

  function getAnimalName(consultation) {
    if (consultation.Animal_Consultation) {
      return consultation.Animal_Consultation.Nom_Animal;
    }

    const animal = animaux.find(
      (item) => item.ID_Animal === consultation.ID_Animal,
    );

    return animal ? animal.Nom_Animal : "-";
  }

  function getProprietaireLabel(consultation) {
    const proprietaire =
      consultation.Prestation_Consultation?.Proprietaire_Prestation;

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

  function getProprietaireName(consultation) {
    const proprietaire =
      consultation.Prestation_Consultation?.Proprietaire_Prestation;

    if (!proprietaire) {
      return "";
    }

    if (proprietaire.Etablissement) {
      return `${proprietaire.Raison_sociale ?? ""} ${
        proprietaire.Etablissement ?? ""
      }`.trim();
    }

    return `${proprietaire.Prenom_Proprietaire ?? ""} ${
      proprietaire.Nom_Proprietaire ?? ""
    }`.trim();
  }

  function getTarifName(consultation) {
    const tarif =
      consultation.Tarif_Consultation ??
      tarifs.find((item) => item.ID_Tarif === consultation.ID_Tarif);

    if (!tarif) {
      return "-";
    }

    return `${tarif.Denomination_Tarif} (${tarif.Montant_Tarif} €)`;
  }

  function getPrestationDate(consultation) {
    return consultation.Prestation_Consultation?.Date_Prestation ?? null;
  }

  function isInCurrentYear(dateValue) {
    if (!dateValue) return false;

    const date = new Date(dateValue);
    const now = new Date();

    return (
      !Number.isNaN(date.getTime()) && date.getFullYear() === now.getFullYear()
    );
  }

  function isInCurrentMonth(dateValue) {
    if (!dateValue) return false;

    const date = new Date(dateValue);
    const now = new Date();

    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  function getCurrentMonthSearch() {
    return new Date().toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  }

  const filteredConsultations = useMemo(() => {
    const value = search.trim().toLowerCase();
    const currentYear = new Date().getFullYear();

    return consultations.filter((consultation) => {
      const prestationDate = getPrestationDate(consultation);

      if (filterCurrentYear && !isInCurrentYear(prestationDate)) {
        return false;
      }

      if (filterCurrentMonth && !isInCurrentMonth(prestationDate)) {
        return false;
      }

      const searchableFields = [
        getAnimalName(consultation),
        getProprietaireName(consultation),
        getTarifName(consultation),
        prestationDate ? String(prestationDate).slice(0, 10) : "",
        prestationDate ? new Date(prestationDate).getFullYear().toString() : "",
        prestationDate
          ? new Date(prestationDate).toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })
          : "",
        consultation.Motif_Consultation,
      ];

      return (
        !value ||
        searchableFields
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(value))
      );
    });
  }, [
    consultations,
    animaux,
    tarifs,
    search,
    filterCurrentYear,
    filterCurrentMonth,
  ]);

  async function saveConsultationZonages(consultationId) {
    const existing = await getConsultationZonages(consultationId);

    const existingIds = existing.map((item) => item.ID_Zonage);

    const selectedIds = consultationZonages.map((item) => item.ID_Zonage);

    const toDelete = existing.filter(
      (item) => !selectedIds.includes(item.ID_Zonage),
    );

    const toCreate = consultationZonages.filter(
      (item) => !existingIds.includes(item.ID_Zonage),
    );

    const toUpdate = consultationZonages.filter((item) => {
      if (!existingIds.includes(item.ID_Zonage)) {
        return false;
      }

      const existingItem = existing.find(
        (existingZonage) => existingZonage.ID_Zonage === item.ID_Zonage,
      );

      return (
        (existingItem?.Commentaire_Zonage ?? "") !==
        (item.Commentaire_Zonage ?? "")
      );
    });

    await Promise.all([
      ...toDelete.map((item) =>
        deleteConsultationZonage(consultationId, item.ID_Zonage),
      ),

      ...toCreate.map((item) =>
        createConsultationZonage(consultationId, {
          ID_Zonage: item.ID_Zonage,
          Commentaire_Zonage: item.Commentaire_Zonage || "",
        }),
      ),

      ...toUpdate.map((item) =>
        updateConsultationZonage(consultationId, item.ID_Zonage, {
          Commentaire_Zonage: item.Commentaire_Zonage || "",
        }),
      ),
    ]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      let consultationId = editingId;

      if (editingId) {
        await updateConsultation(editingId, form);
      } else {
        const consultation = await createConsultation(form);
        consultationId = consultation.ID_Consultation;
      }

      await saveConsultationZonages(consultationId);

      await loadData();
      closeForm();
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cette consultation ?")) {
      return;
    }

    try {
      setError("");

      await deleteConsultation(id);

      if (editingId === id) {
        closeForm();
      }

      await loadData();
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
      setShowErrorModal(true);
    }
  }

  const zonagesByConsultation = useMemo(
    () =>
      editingId
        ? {
            [editingId]: consultationZonages.map((item) => ({
              ...(item.Zonage ?? {}),
              ...item,
            })),
          }
        : {},
    [editingId, consultationZonages],
  );

  const handleOpenPdf = createConsultationPdfHandler({
    consultations,
    animaux,
    tarifs,
    zonagesByConsultation,
    prestations,
    proprietaires,
    currentUser,
    onError: setError,
  });

  return (
    <div className="w-full">
      {error && <Alert variant="error">{error}</Alert>}

      <PageHeader
        title={
          <>
            <span className="hidden md:inline">Gestion des Consultations</span>
            <span className="md:hidden">Consultations</span>
          </>
        }
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une consultation..."
        className="mb-6"
      />

      {/* Filter cards */}
      <div className="mb-5 flex flex-wrap justify-center gap-2">
        <CardFilter
          title={String(new Date().getFullYear())}
          value={
            consultations.filter((c) => isInCurrentYear(getPrestationDate(c)))
              .length
          }
          color="blue"
          active={filterCurrentYear}
          onClick={() => {
            const next = !filterCurrentYear;

            setFilterCurrentYear(next);
            setFilterCurrentMonth(false);

            const params = new URLSearchParams(searchParams);

            if (next) {
              params.set("statut", "consultations-annee");
              setSearch(String(new Date().getFullYear()));
            } else {
              params.delete("statut");
              setSearch("");
            }

            setSearchParams(params, { replace: true });
          }}
          className="min-w-24"
        />

        <CardFilter
          title={new Date()
            .toLocaleDateString("fr-FR", { month: "long" })
            .replace(/^./, (char) => char.toUpperCase())}
          value={
            consultations.filter((c) => isInCurrentMonth(getPrestationDate(c)))
              .length
          }
          color="blue"
          active={filterCurrentMonth}
          onClick={() => {
            const next = !filterCurrentMonth;

            setFilterCurrentMonth(next);
            setFilterCurrentYear(false);

            const params = new URLSearchParams(searchParams);

            if (next) {
              params.set("statut", "consultations-mois");
              setSearch(getCurrentMonthSearch());
            } else {
              params.delete("statut");
              setSearch("");
            }

            setSearchParams(params, { replace: true });
          }}
          className="min-w-24"
        />
      </div>

      {/* Count */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-blue-900">
          {filteredConsultations.length} consultation
          {filteredConsultations.length > 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : filteredConsultations.length === 0 ? (
        <Vide search={search} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Date</TableHeader>
              <TableHeader>Animal</TableHeader>
              <TableHeader>Propriétaire</TableHeader>
              <TableHeader className="hidden md:table-cell">Tarif</TableHeader>
              <TableHeader className="hidden md:table-cell">Motif</TableHeader>
            </TableRow>
          </TableHead>

          <tbody>
            {filteredConsultations.map((consultation) => (
              <TableRow
                key={consultation.ID_Consultation}
                onClick={() => openEditForm(consultation)}
              >
                <TableCell>
                  {formatDateShort(getPrestationDate(consultation))}
                </TableCell>

                <TableCell>{getAnimalName(consultation)}</TableCell>

                <TableCell>{getProprietaireLabel(consultation)}</TableCell>

                <TableCell className="hidden md:table-cell">
                  {getTarifName(consultation)}
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  {consultation.Motif_Consultation || "-"}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <ConsultationsModal
        open={showForm}
        editingId={editingId}
        form={form}
        prestation={selectedPrestation}
        prestations={prestations}
        animaux={animaux}
        proprietaires={proprietaires}
        tarifs={tarifs}
        zonages={zonages}
        selectedZonages={consultationZonages}
        onOpenZonages={openZonages}
        onZonagesUpdated={refreshConsultationZonages}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onDelete={handleDelete}
        onZonageToggle={handleZonageToggle}
        onZonageCommentChange={handleZonageCommentChange}
        onOpenPrestation={() => openPrestation(selectedPrestation)}
        onAddTarif={openTarifForm}
        onAddAnimal={openAnimalForm}
        onEditAnimal={openEditAnimal}
        onOpenPdf={(mode) => handleOpenPdf(mode, editingId)}
      />

      <PrestationWorkflowZonages
        consultationId={zonageConsultationId}
        open={showZonages}
        onClose={closeZonages}
        onSaved={refreshConsultationZonages}
        onError={setError}
      />

      <TarifsModal
        open={showTarifForm}
        editingId={null}
        form={tarifForm}
        saving={savingTarif}
        error={error}
        onClose={closeTarifForm}
        onSubmit={handleTarifSubmit}
        onChange={handleTarifChange}
        onDelete={() => {}}
      />

      <AnimauxModal
        open={showAnimalForm}
        editingId={editingAnimalId}
        form={animalForm}
        proprietaires={proprietaires}
        saving={savingAnimal}
        onClose={closeAnimalForm}
        onSubmit={handleAnimalSubmit}
        onChange={handleAnimalChange}
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
