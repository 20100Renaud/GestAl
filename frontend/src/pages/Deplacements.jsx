import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import DeplacementsModal from "../components/modals/Deplacements_Modal.jsx";
import DeplacementsCopyModal from "../components/modals/DeplacementsCopyModal.jsx";
import ErrorModal from "../components/alerts/ErrorModal.jsx";
import useConfirm from "../hooks/useConfirm.jsx";
import { CardFilter } from "../components/ui/Card.jsx";
import { Trash2 } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Table, {
  Vide,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../components/ui/Table.jsx";

import {
  getDeplacements,
  createDeplacement,
  updateDeplacement,
  deleteDeplacement,
  copyDeplacements,
} from "../api/deplacements.js";

const emptyForm = {
  Annee_Deplacement: String(new Date().getFullYear()),
  Denomination_Deplacement: "",
  Montant_Deplacement: "",
};

export default function Deplacements() {
  const { notify, clearNotification } = useOutletContext();
  const { confirm, ConfirmDialog } = useConfirm();

  const [deplacements, setDeplacements] = useState([]);
  const [deplacementsToCopy, setDeplacementsToCopy] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const currentYear = new Date().getFullYear();

  const [search, setSearch] = useState(String(currentYear));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  const [showCopyModal, setShowCopyModal] = useState(false);
  const [sourceYear, setSourceYear] = useState(String(currentYear));
  const [targetYear, setTargetYear] = useState(String(currentYear + 1));

  const [copying, setCopying] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  async function loadDeplacements() {
    try {
      setLoading(true);

      const data = await getDeplacements();

      setDeplacements(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeplacements().catch((err) => {
      notify(err.message, "error");
    });
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function isDeplacementAssociated(deplacement) {
    return (deplacement?._count?.Prestations_Deplacement ?? 0) > 0;
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
    setSearch(String(currentYear));
  }

  function openEditForm(deplacement) {
    setEditingId(deplacement.ID_Deplacement);

    setForm({
      Annee_Deplacement: deplacement.Annee_Deplacement ?? "",
      Denomination_Deplacement: deplacement.Denomination_Deplacement ?? "",
      Montant_Deplacement: String(deplacement.Montant_Deplacement ?? ""),
    });

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  const filteredDeplacements = useMemo(() => {
    const value = search.trim().toLowerCase();

    return deplacements.filter((item) => {
      const matchesYear =
        selectedYear === "all" ||
        Number(item.Annee_Deplacement) === Number(selectedYear);

      const matchesSearch =
        !value ||
        [
          item.Annee_Deplacement,
          item.Denomination_Deplacement,
          item.Montant_Deplacement,
        ]
          .filter((field) => field !== null && field !== undefined)
          .some((field) => String(field).toLowerCase().includes(value));

      return matchesYear && matchesSearch;
    });
  }, [deplacements, search, selectedYear]);

  const availableYears = useMemo(() => {
    return [
      ...new Set(deplacements.map((item) => Number(item.Annee_Deplacement))),
    ].sort((a, b) => b - a);
  }, [deplacements]);

  useEffect(() => {
    if (availableYears.length === 0) return;

    setSelectedYear((current) => {
      if (availableYears.includes(Number(current))) {
        return current;
      }

      return String(
        availableYears.includes(currentYear) ? currentYear : availableYears[0],
      );
    });
  }, [availableYears, currentYear]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId && editingDeplacementAssociated) {
        form.Annee_Deplacement = editingDeplacement.Annee_Deplacement;
        form.Montant_Deplacement = String(
          editingDeplacement.Montant_Deplacement,
        );
      }
      
      if (editingId) {
        await updateDeplacement(editingId, form);
      } else {
        await createDeplacement(form);
      }

      await loadDeplacements();
      closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const deplacement = deplacements.find(
      (item) => String(item.ID_Deplacement) === String(id),
    );

    if (!deplacement) {
      setError("Déplacement introuvable.");
      setShowErrorModal(true);
      return;
    }

    if (isDeplacementAssociated(deplacement)) {
      setError(
        "Impossible de supprimer ce déplacement car il est utilisé par une ou plusieurs prestations.",
      );
      setShowErrorModal(true);
      return;
    }

    await confirm({
      title: "Supprimer ce déplacement",

      message: `Le déplacement "${deplacement.Denomination_Deplacement}"

    - Montant : ${deplacement.Montant_Deplacement} €
    - Année : ${deplacement.Annee_Deplacement}

    Va être définitivement supprimé.`,

      onConfirm: async () => {
        try {
          setSaving(true);
          setError("");

          await deleteDeplacement(id);

          if (String(editingId) === String(id)) {
            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);
          }

          await loadDeplacements();
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

  function openCopyModal() {
    setError("");

    const selectedDeplacements = deplacements.filter(
      (item) => Number(item.Annee_Deplacement) === Number(sourceYear),
    );

    setDeplacementsToCopy(selectedDeplacements);
    setShowCopyModal(true);
  }

  function handleSourceYearChange(year) {
    setSourceYear(year);

    const selectedDeplacements = deplacements.filter(
      (item) => Number(item.Annee_Deplacement) === Number(year),
    );

    setDeplacementsToCopy(selectedDeplacements);
  }

  async function handleCopyDeplacements(event) {
    event.preventDefault();

    const destinationYear = Number(targetYear);

    if (
      !Number.isInteger(destinationYear) ||
      destinationYear < 2000 ||
      destinationYear > 2100
    ) {
      notify("Année destination invalide.", "error");
      return;
    }

    if (availableYears.includes(destinationYear)) {
      notify("Des déplacements existent déjà pour cette année.", "error");
      return;
    }

    if (deplacementsToCopy.length === 0) {
      notify("Veuillez sélectionner au moins un déplacement.", "error");
      return;
    }

    try {
      setCopying(true);
      clearNotification();

      const deplacementIds = deplacementsToCopy.map(
        (item) => item.ID_Deplacement,
      );

      const result = await copyDeplacements(
        sourceYear,
        destinationYear,
        deplacementIds,
      );

      setShowCopyModal(false);
      setDeplacementsToCopy([]);

      setSelectedYear(String(destinationYear));
      setSearch(String(destinationYear));

      await loadDeplacements();

      notify(result.message, "success");
    } catch (err) {
      if (err.message) {
        notify(err.message, "error");
      }
    } finally {
      setCopying(false);
    }
  }

  function handleRemoveDeplacement(deplacementId) {
    setDeplacementsToCopy((prev) =>
      prev.filter((item) => item.ID_Deplacement !== deplacementId),
    );
  }

  const editingDeplacement = deplacements.find(
    (item) => String(item.ID_Deplacement) === String(editingId),
  );

  const editingDeplacementAssociated = isDeplacementAssociated(
    editingDeplacement || {},
  );

  const editingDeplacementPrestations =
    editingDeplacement?._count?.Prestations_Deplacement ?? 0;

  return (
    <div className="w-full">
      <PageHeader
        title={
          <>
            <span className="hidden md:inline">Gestion des Déplacements</span>
            <span className="md:hidden">Déplacements</span>
          </>
        }
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un déplacement..."
        createLabel="Nouveau déplacement"
        onAction={openCreateForm}
        secondaryActionLabel="Copier les déplacements"
        onSecondaryAction={openCopyModal}
        secondaryActionDisabled={availableYears.length === 0}
        className="mb-6"
      />

      <div className="mb-4 flex flex-wrap gap-3 justify-center">
        {availableYears.map((year) => (
          <CardFilter
            key={year}
            title="Année"
            value={year}
            active={selectedYear === String(year)}
            color="blue"
            onClick={() => {
              const yearValue = String(year);

              setSelectedYear(yearValue);
              setSearch(yearValue);
            }}
            className="w-18"
          />
        ))}
      </div>

      {/* Count */}
      {!loading && (
        <div className="flex justify-center">
          <span className="rounded-t-lg bg-blue-200 px-3 text-xs font-medium text-blue-700">
            {filteredDeplacements.length} déplacement
            {filteredDeplacements.length > 1 ? "s" : ""} disponible
            {filteredDeplacements.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : filteredDeplacements.length === 0 ? (
        <Vide search={search} />
      ) : (
        <Table maxWidth="500px">
          <TableHead>
            <TableRow>
              <TableHeader>Année</TableHeader>
              <TableHeader>Désignation</TableHeader>
              <TableHeader>Montant</TableHeader>
              <TableHeader></TableHeader>
            </TableRow>
          </TableHead>

          <tbody>
            {filteredDeplacements.map((deplacement) => (
              <TableRow
                key={deplacement.ID_Deplacement}
                onClick={() => openEditForm(deplacement)}
              >
                <TableCell>{deplacement.Annee_Deplacement}</TableCell>

                <TableCell>{deplacement.Denomination_Deplacement}</TableCell>

                <TableCell>
                  {Number(deplacement.Montant_Deplacement)} €
                </TableCell>

                <TableCell>
                  {isDeplacementAssociated(deplacement) ? (
                    <span
                      className="inline-flex items-center justify-center rounded-full bg-blue-100 w-5 h-5 text-xs font-medium text-blue-700"
                      title="Nombre de prestations associées"
                    >
                      {deplacement._count.Prestations_Deplacement}
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="danger_clear"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(deplacement.ID_Deplacement);
                      }}
                      disabled={saving}
                      className="px-3 py-2 shadow-none"
                      aria-label={`Supprimer ${deplacement.Denomination_Deplacement}`}
                      title="Supprimer ce déplacement"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <DeplacementsModal
        open={showForm}
        editingId={editingId}
        form={form}
        saving={saving}
        error={error}
        isAssociated={editingDeplacementAssociated}
        prestationsCount={editingDeplacementPrestations}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onDelete={handleDelete}
      />

      <DeplacementsCopyModal
        open={showCopyModal}
        deplacements={deplacementsToCopy}
        availableYears={availableYears}
        sourceYear={sourceYear}
        targetYear={targetYear}
        copying={copying}
        error={error}
        onSourceYearChange={handleSourceYearChange}
        onTargetYearChange={setTargetYear}
        onRemoveDeplacement={handleRemoveDeplacement}
        onClose={() => {
          if (!copying) {
            setShowCopyModal(false);
            setDeplacementsToCopy([]);
            setError("");
          }
        }}
        onSubmit={handleCopyDeplacements}
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
