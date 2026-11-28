import { useEffect, useMemo, useRef, useState } from "react";
import { getConsultations } from "../api/consultations.js";
import { PawPrint, ClipboardList, AlertCircle } from "lucide-react";
import { getAnimaux } from "../api/animaux.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProprietairesModal from "../components/modals/Proprietaires_Modal.jsx";
import { normalizeUpper, normalizeCamel } from "../utils/normalizeField.js";
import Alert from "../components/alerts/Alert.jsx";
import ErrorModal from "../components/alerts/ErrorModal.jsx";
import useConfirm from "../hooks/useConfirm.jsx";
import Table, {
  Vide,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../components/ui/Table.jsx";
import {
  createProprietaire,
  deleteProprietaire,
  getProprietaires,
  updateProprietaire,
} from "../api/proprietaires.js";

const emptyForm = {
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
  commentaire: "",
};

export default function Proprietaires() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [proprietaires, setProprietaires] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [search, setSearch] = useState("");
  const [animaux, setAnimaux] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [scrollToComment, setScrollToComment] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const tooltipRef = useRef(null);

  async function loadProprietaires() {
    try {
      setLoading(true);
      setError("");

      const [proprietairesData, animauxData, consultationsData] =
        await Promise.all([
          getProprietaires(),
          getAnimaux(),
          getConsultations(),
        ]);

      setProprietaires(proprietairesData);
      setAnimaux(animauxData);
      setConsultations(consultationsData);
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProprietaires();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setActiveTooltip(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
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

  function openEditForm(proprietaire, scrollToComment = false) {
    setEditingId(proprietaire.ID_Proprietaire);

    setForm({
      raisonSociale: proprietaire.Raison_sociale ?? "",
      etablissement: proprietaire.Etablissement ?? "",
      civilite: proprietaire.Civilite_Proprietaire ?? "",
      nom: proprietaire.Nom_Proprietaire ?? "",
      prenom: proprietaire.Prenom_Proprietaire ?? "",
      email: proprietaire.Email_Proprietaire ?? "",
      adresse: proprietaire.Adresse_Proprietaire ?? "",
      ville: proprietaire.Ville_Proprietaire ?? "",
      cp: proprietaire.CP_Proprietaire ?? "",
      tel: proprietaire.Tel_Proprietaire ?? "",
      commentaire: proprietaire.Commentaire_Proprietaire ?? "",
    });

    setScrollToComment(scrollToComment);
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

  function getAnimalCount(proprietaireId) {
    return animaux.filter(
      (animal) => String(animal.ID_Proprietaire) === String(proprietaireId),
    ).length;
  }

  function getConsultationCount(proprietaireId) {
    return consultations.filter((consultation) => {
      const proprietaire =
        consultation.Prestation_Consultation?.Proprietaire_Prestation;

      return String(proprietaire?.ID_Proprietaire) === String(proprietaireId);
    }).length;
  }

  const filteredProprietaires = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return proprietaires;
    }

    return proprietaires.filter((proprietaire) => {
      return [
        proprietaire.Raison_sociale,
        proprietaire.Etablissement,
        proprietaire.Civilite_Proprietaire,
        proprietaire.Nom_Proprietaire,
        proprietaire.Prenom_Proprietaire,
        proprietaire.Email_Proprietaire,
        proprietaire.Adresse_Proprietaire,
        proprietaire.Ville_Proprietaire,
        proprietaire.CP_Proprietaire,
        proprietaire.Tel_Proprietaire,
      ]
        .filter((field) => field !== null && field !== undefined)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [proprietaires, search]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const normalizedForm = {
        ...form,
        nom: normalizeUpper(form.nom),
        prenom: normalizeCamel(form.prenom),
        ville: normalizeCamel(form.ville),
      };

      if (editingId) {
        await updateProprietaire(editingId, normalizedForm);
      } else {
        await createProprietaire(normalizedForm);
      }

      await loadProprietaires();
      closeForm();
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const proprietaire = proprietaires.find(
      (proprietaire) => String(proprietaire.ID_Proprietaire) === String(id),
    );

    if (!proprietaire) return;

    const proprietaireName = proprietaire.Etablissement
      ? `${proprietaire.Raison_sociale} ${proprietaire.Etablissement}`.trim()
      : `${proprietaire.Prenom_Proprietaire} ${proprietaire.Nom_Proprietaire}`.trim();

    await confirm({
      title: "Supprimer ce propriétaire",
      message: `${proprietaireName} va être définitivement supprimé.`,

      onConfirm: async () => {
        try {
          setSaving(true);
          setError("");

          await deleteProprietaire(id);

          if (editingId === id) {
            closeForm();
          }

          await loadProprietaires();
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

  return (
    <div className="w-full">
      {error && <Alert variant="error">{error}</Alert>}

      <PageHeader
        title={
          <>
            <span className="hidden md:inline">Gestion des Propriétaires</span>
            <span className="md:hidden">Propriétaires</span>
          </>
        }
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Recherche par nom, e-mail, ville..."
        createLabel="Nouveau propriétaire"
        onAction={openCreateForm}
        className="mb-6"
      />

      <div className="flex justify-center">
        <span className="rounded-t-lg bg-blue-200 px-3 text-xs font-medium text-blue-700">
          {filteredProprietaires.length} propriétaire
          {filteredProprietaires.length > 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : filteredProprietaires.length === 0 ? (
        <Vide search={search} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader></TableHeader>
              <TableHeader>Raison sociale</TableHeader>
              <TableHeader>Nom</TableHeader>
              <TableHeader className="hidden lg:table-cell">Email</TableHeader>
              <TableHeader className="hidden md:table-cell">Ville</TableHeader>
            </TableRow>
          </TableHead>

          <tbody>
            {filteredProprietaires.map((proprietaire) => (
              <TableRow
                key={proprietaire.ID_Proprietaire}
                onClick={() => openEditForm(proprietaire)}
              >
                <TableCell>
                  <div className="flex sm:flex-row flex-col items-center gap-x-6 gap-y-2 py-1 text-sm text-blue-700">
                    <span className="inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-semibold text-blue-700 gap-2">
                      <PawPrint size={16} />
                      {getAnimalCount(proprietaire.ID_Proprietaire)}
                    </span>

                    <span className="inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-semibold text-blue-700 gap-2">
                      <ClipboardList size={16} />
                      {getConsultationCount(proprietaire.ID_Proprietaire)}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  {[proprietaire.Raison_sociale, proprietaire.Etablissement]
                    .filter(Boolean)
                    .join(" ") || "-"}
                </TableCell>

                <TableCell>
                  <div className="relative flex items-center pr-5">
                    {[
                      proprietaire.Civilite_Proprietaire,
                      proprietaire.Prenom_Proprietaire,
                      proprietaire.Nom_Proprietaire,
                    ]
                      .filter(Boolean)
                      .join(" ") || "-"}

                    {proprietaire.Commentaire_Proprietaire?.trim() && (
                      <div
                        ref={
                          activeTooltip === proprietaire.ID_Proprietaire
                            ? tooltipRef
                            : null
                        }
                        className="absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 z-30"
                      >
                        <button
                          type="button"
                          title="Voir le commentaire"
                          onClick={(event) => {
                            event.stopPropagation();

                            setActiveTooltip((current) =>
                              current === proprietaire.ID_Proprietaire
                                ? null
                                : proprietaire.ID_Proprietaire,
                            );
                          }}
                          className="h-8 w-8 flex justify-center items-center text-red-600 text-center hover:text-red-800 cursor-pointer hover:bg-red-500/10 p-1 rounded-lg"
                        >
                          <AlertCircle size={16} />
                        </button>

                        {activeTooltip === proprietaire.ID_Proprietaire && (
                          <div
                            className="
                              absolute left-1/2 -translate-x-1/2
                              top-1/2 -translate-y-1/2 mr-2
                              z-50 w-64 sm:w-80 h-12
                              rounded-lg border border-red-200
                              bg-white px-3 py-1
                              text-sm text-red-700
                              shadow-lg
                              overflow-y-auto
                              whitespace-normal
                              break-words
                              animate-in fade-in duration-200
                              select-none
                            "
                            onClick={(event) => {
                              event.stopPropagation();
                              setActiveTooltip(null);
                            }}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {proprietaire.Commentaire_Proprietaire}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  {proprietaire.Email_Proprietaire || "-"}
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  {proprietaire.Ville_Proprietaire || "-"}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <ProprietairesModal
        open={showForm}
        editingId={editingId}
        form={form}
        proprietaires={proprietaires}
        animaux={animaux}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onDelete={handleDelete}
        onAnimalsChange={loadProprietaires}
        scrollToComment={scrollToComment}
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
