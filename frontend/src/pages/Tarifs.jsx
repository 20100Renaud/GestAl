import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import TarifsModal from "../components/modals/Tarifs_Modal.jsx";
import TarifsCopyModal from "../components/modals/TarifsCopyModal.jsx";
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
  const { notify, clearNotification } = useOutletContext();
  const { confirm, ConfirmDialog } = useConfirm();

  const [tarifs, setTarifs] = useState([]);
  const [tarifsToCopy, setTarifsToCopy] = useState([]);

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

  async function loadTarifs() {
    try {
      setLoading(true);

      const data = await getTarifs();

      setTarifs(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTarifs().catch((err) => {
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

  function isTarifAssociated(tarif) {
    return (tarif?._count?.Consultations_Tarif ?? 0) > 0;
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

      if (editingId && editingTarifAssociated) {
        form.Annee_Tarif = editingTarif.Annee_Tarif;
        form.Montant_Tarif = String(editingTarif.Montant_Tarif);
      }
      
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
    const tarif = tarifs.find((item) => String(item.ID_Tarif) === String(id));

    if (!tarif) {
      setError("Tarif introuvable.");
      setShowErrorModal(true);
      return;
    }

    await confirm({
      title: "Supprimer ce tarif",
      message: `Le tarif "${tarif.Denomination_Tarif}"

    - Montant : ${tarif.Montant_Tarif} €
    - Année : ${tarif.Annee_Tarif}

    Va être définitivement supprimé.`,

      onConfirm: async () => {
        try {
          setSaving(true);
          setError("");

          await deleteTarif(id);

          if (String(editingId) === String(id)) {
            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);
          }

          await loadTarifs();
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

    const selectedTarifs = tarifs.filter(
      (tarif) => Number(tarif.Annee_Tarif) === Number(sourceYear),
    );

    setTarifsToCopy(selectedTarifs);
    setShowCopyModal(true);
  }

  function handleSourceYearChange(year) {
    setSourceYear(year);

    const selectedTarifs = tarifs.filter(
      (tarif) => Number(tarif.Annee_Tarif) === Number(year),
    );

    setTarifsToCopy(selectedTarifs);
  }

  async function handleCopyTarifs(event) {
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
      notify("Des tarifs existent déjà pour cette année.", "error");
      return;
    }

    if (tarifsToCopy.length === 0) {
      notify("Veuillez sélectionner au moins un tarif.", "error");
      return;
    }

    try {
      setCopying(true);
      clearNotification();

      const tarifIds = tarifsToCopy.map((tarif) => tarif.ID_Tarif);

      const result = await copyTarifs(sourceYear, destinationYear, tarifIds);

      setShowCopyModal(false);
      setTarifsToCopy([]);

      setSelectedYear(String(destinationYear));
      setSearch(String(destinationYear));

      await loadTarifs();

      notify(result.message, "success");
    } catch (err) {
      if (err.message) {
        notify(err.message, "error");
      }
    } finally {
      setCopying(false);
    }
  }

  const handleRemoveTarif = (tarifId) => {
    setTarifsToCopy((prev) =>
      prev.filter((tarif) => tarif.ID_Tarif !== tarifId),
    );
  };

  const editingTarif = tarifs.find(
    (tarif) => String(tarif.ID_Tarif) === String(editingId),
  );

  const editingTarifAssociated = isTarifAssociated(editingTarif || {});

  const editingTarifConsultations =
    editingTarif?._count?.Consultations_Tarif ?? 0;

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

      {!loading && (
        <div className="flex justify-center">
          <span className="rounded-t-lg bg-blue-200 px-3 text-xs font-medium text-blue-700">
            {filteredTarifs.length} tarif
            {filteredTarifs.length > 1 ? "s" : ""} displonible
            {filteredTarifs.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

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
              <TableHeader></TableHeader>
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

                <TableCell>
                  {isTarifAssociated(tarif) ? (
                    <span
                      className="inline-flex items-center justify-center rounded-full bg-blue-100 w-5 h-5 text-xs font-medium text-blue-700"
                      title="Nombre de consultations associées"
                    >
                      {tarif._count.Consultations_Tarif}
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="danger_clear"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(tarif.ID_Tarif);
                      }}
                      disabled={saving}
                      className="px-3 py-2 shadow-none"
                      aria-label={`Supprimer ${tarif.Denomination_Tarif}`}
                      title="Supprimer ce tarif"
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

      <TarifsModal
        open={showForm}
        editingId={editingId}
        form={form}
        saving={saving}
        error={error}
        isAssociated={editingTarifAssociated}
        consultationsCount={editingTarifConsultations}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onDelete={handleDelete}
      />

      <TarifsCopyModal
        open={showCopyModal}
        tarifs={tarifsToCopy}
        availableYears={availableYears}
        sourceYear={sourceYear}
        targetYear={targetYear}
        copying={copying}
        error={error}
        onSourceYearChange={handleSourceYearChange}
        onTargetYearChange={setTargetYear}
        onRemoveTarif={handleRemoveTarif}
        onClose={() => {
          if (!copying) {
            setShowCopyModal(false);
            setTarifsToCopy([]);
            setError("");
          }
        }}
        onSubmit={handleCopyTarifs}
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
