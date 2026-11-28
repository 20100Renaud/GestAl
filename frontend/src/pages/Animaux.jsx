import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getConsultations } from "../api/consultations.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import AnimauxModal from "../components/modals/Animaux_Modal.jsx";
import ErrorModal from "../components/alerts/ErrorModal.jsx";
import useConfirm from "../hooks/useConfirm.jsx";
import { normalizeUpper, normalizeCamel } from "../utils/normalizeField.js";
import Alert from "../components/alerts/Alert.jsx";
import { formatDate } from "../utils/formatDate";
import { calculateAge } from "../utils/calculateAge";

import Table, {
  Vide,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../components/ui/Table.jsx";
import {
  getAnimaux,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from "../api/animaux.js";

import { getProprietaires } from "../api/proprietaires.js";

const emptyForm = {
  ID_Proprietaire: "",
  Nom_Animal: "",
  Genre_Animal: "",
  Race_Animal: "",
  Date_Naissance_Animal: "",
  Memo_Animal: "",
  Sexe_Animal: "",
};

export default function Animaux() {
  const { confirm, ConfirmDialog } = useConfirm();

  const [animaux, setAnimaux] = useState([]);
  const navigate = useNavigate();
  const [proprietaires, setProprietaires] = useState([]);
  const [consultations, setConsultations] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [animalsData, proprietairesData, consultationsData] =
        await Promise.all([
          getAnimaux(),
          getProprietaires(),
          getConsultations(),
        ]);

      setAnimaux(animalsData);
      setProprietaires(proprietairesData);
      setConsultations(consultationsData);
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
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
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(animal) {
    setEditingId(animal.ID_Animal);

    setForm({
      ID_Proprietaire: animal.ID_Proprietaire ?? "",
      Nom_Animal: animal.Nom_Animal ?? "",
      Genre_Animal: animal.Genre_Animal ?? "",
      Race_Animal: animal.Race_Animal ?? "",
      Date_Naissance_Animal: animal.Date_Naissance_Animal
        ? animal.Date_Naissance_Animal.slice(0, 10)
        : "",
      Sexe_Animal: animal.Sexe_Animal ?? "",
      Memo_Animal: animal.Memo_Animal ?? "",
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

  const filteredAnimaux = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return animaux;
    }

    return animaux.filter((animal) => {
      const proprietaire = animal.Proprietaire_Animal;

      const proprietaireName = proprietaire
        ? `${proprietaire.Prenom_Proprietaire} ${proprietaire.Nom_Proprietaire}`
        : "";

      const date = formatDate(animal.Date_Naissance_Animal);

      return [
        animal.Nom_Animal,
        animal.Genre_Animal,
        animal.Race_Animal,
        animal.Sexe_Animal,
        date,
        proprietaireName,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [animaux, search]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const normalizedForm = {
        ...form,
        Nom_Animal: normalizeUpper(form.Nom_Animal),
        Genre_Animal: normalizeCamel(form.Genre_Animal),
        Race_Animal: form.Race_Animal ? normalizeCamel(form.Race_Animal) : "",
      };

      if (editingId) {
        await updateAnimal(editingId, normalizedForm);
      } else {
        await createAnimal(normalizedForm);
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
    const animal = animaux.find(
      (animal) => String(animal.ID_Animal) === String(id),
    );

    if (!animal) return;

    const proprietaire = animal.Proprietaire_Animal;

    const proprietaireName = proprietaire
      ? proprietaire.Etablissement
        ? `${proprietaire.Raison_sociale} ${proprietaire.Etablissement}`
        : `${proprietaire.Prenom_Proprietaire} ${proprietaire.Nom_Proprietaire}`
      : "Non renseigné";

    await confirm({
      title: "Supprimer cet animal",
      message: `${animal.Nom_Animal} (${animal.Genre_Animal || "-"}), appartenant à ${proprietaireName} va être déffinitivement supprimé.`,
      confirmLabel: "Supprimer",

      onConfirm: async () => {
        try {
          setSaving(true);
          setError("");

          await deleteAnimal(id);

          if (editingId === id) {
            closeForm();
          }

          await loadData();
        } catch (err) {
          setError(err.message);
          setShowErrorModal(true);
          throw err;
        } finally {
          setSaving(false);
        }
      },
    });
  }

  function getProprietaireLabel(animal) {
    const proprietaire = animal.Proprietaire_Animal;

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

  function handleOpenConsultation(consultation) {
    navigate("/consultations", {
      state: {
        openConsultationId: consultation.ID_Consultation,
      },
    });
  }

  function getConsultationCount(animalId) {
    return consultations.filter(
      (consultation) => String(consultation.ID_Animal) === String(animalId),
    ).length;
  }

  return (
    <div className="w-full">
      {error && <Alert variant="error">{error}</Alert>}

      <PageHeader
        title={
          <>
            <span className="hidden md:inline">Gestion des Animaux</span>
            <span className="md:hidden">Animaux</span>
          </>
        }
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un animal..."
        createLabel="Nouvel animal"
        onAction={openCreateForm}
        className="mb-6"
      />

      <div className="flex justify-center">
        <span className="rounded-t-lg bg-blue-200 px-3 text-xs font-medium text-blue-700">
          {filteredAnimaux.length}
          {filteredAnimaux.length > 1 ? " animaux" : " animal"}
        </span>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : filteredAnimaux.length === 0 ? (
        <Vide search={search} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Nom</TableHeader>
              <TableHeader>Propriétaire</TableHeader>
              <TableHeader>Genre</TableHeader>
              <TableHeader className="hidden lg:table-cell">Race</TableHeader>
              <TableHeader className="hidden xl:table-cell">âge</TableHeader>
              <TableHeader className="hidden md:table-cell">Sexe</TableHeader>
            </TableRow>
          </TableHead>

          <tbody>
            {filteredAnimaux.map((animal) => {
              const consultationCount = getConsultationCount(animal.ID_Animal);

              return (
                <TableRow
                  key={animal.ID_Animal}
                  onClick={() => openEditForm(animal)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{animal.Nom_Animal}</span>

                      <span className="inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-semibold text-blue-700">
                        {consultationCount}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>{getProprietaireLabel(animal)}</TableCell>

                  <TableCell>{animal.Genre_Animal}</TableCell>

                  <TableCell className="hidden lg:table-cell">
                    {animal.Race_Animal || "-"}
                  </TableCell>

                  <TableCell className="hidden xl:table-cell">
                    {calculateAge(animal.Date_Naissance_Animal)}
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    {animal.Sexe_Animal || "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      )}

      <AnimauxModal
        open={showForm}
        editingId={editingId}
        form={form}
        proprietaires={proprietaires}
        consultations={consultations}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onDelete={handleDelete}
        onOpenConsultation={handleOpenConsultation}
      />

      {ConfirmDialog}

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
