import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/ui/PageHeader.jsx";
import DeplacementsModal from "../components/modals/Deplacements_Modal.jsx";
import ErrorModal from "../components/modals/ErrorModal.jsx";
import DeplacementsCopyModal from "../components/modals/DeplacementsCopyModal.jsx";
import Alert from "../components/ui/Alert.jsx";
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
  const [deplacements, setDeplacements] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const currentYear = new Date().getFullYear();
  const [search, setSearch] = useState(String(new Date().getFullYear()));
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear()),
  );
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
      setError("");

      const data = await getDeplacements();
      setDeplacements(data);
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeplacements();
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
    if (saving) {
      return;
    }

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
    if (availableYears.length === 0) {
      return;
    }

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
    if (!window.confirm("Supprimer ce déplacement ?")) {
      return;
    }

    try {
      setError("");

      await deleteDeplacement(id);

      if (editingId === id) {
        closeForm();
      }

      await loadDeplacements();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCopyDeplacements(event) {
    event.preventDefault();

    const destinationYear = Number(targetYear);

    if (
      !Number.isInteger(destinationYear) ||
      destinationYear < 2000 ||
      destinationYear > 2100
    ) {
      setError("Année destination invalide");
      return;
    }

    if (availableYears.includes(destinationYear)) {
      setError("Des déplacements existent déjà pour cette année");
      return;
    }

    try {
      setCopying(true);
      setError("");

      const result = await copyDeplacements(sourceYear, destinationYear);

      setShowCopyModal(false);
      setSelectedYear(String(destinationYear));
      setSearch(String(destinationYear));

      await loadDeplacements();

      window.alert(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setCopying(false);
    }
  }

  //
  //
  //
  //
  //
  // -------Return --------
  //
  //
  //
  //
  //

  return (
    <div className="w-full">
      {error && <Alert variant="error">{error}</Alert>}

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
        onSecondaryAction={() => {
          setError("");
          setShowCopyModal(true);
        }}
        secondaryActionDisabled={availableYears.length === 0}
        className="mb-6"
      />

      <div className="mb-6 flex flex-wrap gap-3 justify-center">
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

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-blue-900">
          {filteredDeplacements.length} déplacement
          {filteredDeplacements.length > 1 ? "s" : ""}
        </p>
      </div>

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
              <TableHeader className="text-right hidden sm:table-cell">
                Action
              </TableHeader>
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
                <TableCell className="text-right hidden sm:table-cell">
                  <Button
                    type="button"
                    variant="danger_clear"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(deplacement.ID_Deplacement);
                    }}
                    className="px-3 py-2"
                    aria-label={`Supprimer ${deplacement.Denomination_Deplacement}`}
                    title="Supprimer ce déplacement"
                  >
                    <Trash2 size={16} />
                  </Button>
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
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onDelete={handleDelete}
      />

      <DeplacementsCopyModal
        open={showCopyModal}
        availableYears={availableYears}
        sourceYear={sourceYear}
        targetYear={targetYear}
        copying={copying}
        error={error}
        onSourceYearChange={setSourceYear}
        onTargetYearChange={setTargetYear}
        onClose={() => {
          if (!copying) {
            setShowCopyModal(false);
            setError("");
          }
        }}
        onSubmit={handleCopyDeplacements}
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
