import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import Alert from "../components/ui/Alert.jsx";
import { formatDate } from "../utils/formatDate";
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

import { getAnimaux, createAnimal } from "../api/animaux.js";
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
  const navigate = useNavigate();
  const location = useLocation();

  const [consultations, setConsultations] = useState([]);
  const [animaux, setAnimaux] = useState([]);
  const [proprietaires, setProprietaires] = useState([]);
  const [zonages, setZonages] = useState([]);
  const [tarifs, setTarifs] = useState([]);
  const [consultationZonages, setConsultationZonages] = useState([]);
  const [prestations, setPrestations] = useState([]);
  const [selectedPrestation, setSelectedPrestation] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showTarifForm, setShowTarifForm] = useState(false);
  const [showAnimalForm, setShowAnimalForm] = useState(false);

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
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

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
    } finally {
      setSavingTarif(false);
    }
  }

  function openAnimalForm() {
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

  function closeAnimalForm() {
    if (savingAnimal) {
      return;
    }

    setShowAnimalForm(false);
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

      const newAnimal = await createAnimal(animalForm);

      setAnimaux((current) => [...current, newAnimal]);

      setForm((current) => ({
        ...current,
        ID_Animal: newAnimal.ID_Animal,
      }));

      setShowAnimalForm(false);
    } catch (err) {
      setError(err.message);
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

  const filteredConsultations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return consultations;
    }

    return consultations.filter((consultation) => {
      const searchableFields = [
        getAnimalName(consultation),
        getProprietaireName(consultation),
        getTarifName(consultation),
        formatDate(getPrestationDate(consultation)),
        consultation.Motif_Consultation,
      ];

      return searchableFields
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [consultations, animaux, tarifs, search]);

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
    }
  }

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
                  {formatDate(getPrestationDate(consultation))}
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
        consultationZonages={consultationZonages}
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
        editingId={null}
        form={animalForm}
        proprietaires={proprietaires}
        saving={savingAnimal}
        onClose={closeAnimalForm}
        onSubmit={handleAnimalSubmit}
        onChange={handleAnimalChange}
        onDelete={() => {}}
      />
    </div>
  );
}
