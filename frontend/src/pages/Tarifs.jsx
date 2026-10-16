import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/ui/PageHeader.jsx";
import TarifsModal from "../components/Modals/Tarifs_Modal.jsx";
import TarifsCopyModal from "../components/Modals/TarifsCopyModal.jsx";
import ErrorModal from "../components/Modals/ErrorModal.jsx"; // add
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
  getTarifs,
  createTarif,
  updateTarif,
  deleteTarif,
  copyTarifs,
} from "../api/tarifs.js";

const emptyForm = {
  Annee_Tarif: String(new Date().getFullYear()),
  Denomination_Tarif: "",
  Montant_Tarif: "",
};

export default function Tarifs() {
  const [tarifs, setTarifs] = useState([]);

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
  const [showErrorModal, setShowErrorModal] = useState(false); // add

  async function loadTarifs() {
    try {
      setLoading(true);
      setError("");

      const data = await getTarifs();

      setTarifs(data);
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true); // add
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTarifs();
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
    setSearch(String(new Date().getFullYear()));
  }

  function openEditForm(tarif) {
    setEditingId(tarif.ID_Tarif);

    setForm({
      Annee_Tarif: tarif.Annee_Tarif ?? "",
      Denomination_Tarif: tarif.Denomination_Tarif ?? "",
      Montant_Tarif: String(tarif.Montant_Tarif ?? ""),
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

  const filteredTarifs = useMemo(() => {
    const value = search.trim().toLowerCase();

    return tarifs.filter((tarif) => {
      const matchesYear =
        selectedYear === "all" ||
        Number(tarif.Annee_Tarif) === Number(selectedYear);

      const matchesSearch =
        !value ||
        [tarif.Annee_Tarif, tarif.Denomination_Tarif, tarif.Montant_Tarif]
          .filter((field) => field !== null && field !== undefined)
          .some((field) => String(field).toLowerCase().includes(value));

      return matchesYear && matchesSearch;
    });
  }, [tarifs, search, selectedYear]);

  const availableYears = useMemo(() => {
    return [...new Set(tarifs.map((tarif) => Number(tarif.Annee_Tarif)))].sort(
      (a, b) => b - a,
    );
  }, [tarifs]);

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
        await updateTarif(editingId, form);
      } else {
        await createTarif(form);
      }

      await loadTarifs();
      closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce tarif ?")) {
      return;
    }

    try {
      setError("");

      await deleteTarif(id);

      if (editingId === id) {
        closeForm();
      }

      await loadTarifs();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCopyTarifs(event) {
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
      setError("Des tarifs existent déjà pour cette année");
      return;
    }

    try {
      setCopying(true);
      setError("");

      const result = await copyTarifs(sourceYear, destinationYear);

      setShowCopyModal(false);
      setSelectedYear(String(destinationYear));
      setSearch(String(destinationYear));

      await loadTarifs();

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
  //  ---------- return ------------
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
            <span className="hidden md:inline">Gestion des Tarifs</span>
            <span className="md:hidden">Tarifs</span>
          </>
        }
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un tarif..."
        createLabel="Nouveau tarif"
        onAction={openCreateForm}
        secondaryActionLabel="Copier les tarifs"
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

      {loading ? (
        <p>Chargement...</p>
      ) : filteredTarifs.length === 0 ? (
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
            {filteredTarifs.map((tarif) => (
              <TableRow
                key={tarif.ID_Tarif}
                onClick={() => openEditForm(tarif)}
              >
                <TableCell>{tarif.Annee_Tarif}</TableCell>

                <TableCell>{tarif.Denomination_Tarif}</TableCell>

                <TableCell>{Number(tarif.Montant_Tarif)} €</TableCell>

                <TableCell className="text-right hidden sm:table-cell">
                  <Button
                    type="button"
                    variant="danger_clear"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(tarif.ID_Tarif);
                    }}
                    className="px-3 py-2"
                    aria-label={`Supprimer ${tarif.Denomination_Tarif}`}
                    title="Supprimer ce tarif"
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <TarifsModal
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

      <TarifsCopyModal
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
        onSubmit={handleCopyTarifs}
      />

      <ErrorModal // add
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
