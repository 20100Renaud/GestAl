import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Input from "../components/ui/Input.jsx";
import Alert from "../components/ui/Alert.jsx";
import Modal from "../components/ui/Modal.jsx";
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
} from "../api/tarifs.js";

const emptyForm = {
  Annee_Tarif: "",
  Denomination_Tarif: "",
  Montant_Tarif: "",
};

export default function Tarifs() {
  const [tarifs, setTarifs] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTarifs() {
    try {
      setLoading(true);
      setError("");

      const data = await getTarifs();

      setTarifs(data);
    } catch (err) {
      setError(err.message);
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
  }

  const filteredTarifs = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return tarifs;
    }

    return tarifs.filter((tarif) => {
      return [tarif.Annee_Tarif, tarif.Denomination_Tarif, tarif.Montant_Tarif]
        .filter((field) => field !== null && field !== undefined)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [tarifs, search]);

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

  return (
    <div className="w-full">
      {error && <Alert variant="error">{error}</Alert>}

      <PageHeader
        title="Gestion des Tarifs"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un tarif..."
        createLabel="Nouveau tarif"
        onAction={openCreateForm}
      />

      {loading ? (
        <p>Chargement...</p>
      ) : filteredTarifs.length === 0 ? (
        <Vide search={search} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Année</TableHeader>
              <TableHeader>Désignation</TableHeader>
              <TableHeader>Montant</TableHeader>
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

                <TableCell>
                  {Number(tarif.Montant_Tarif).toFixed(2)} €
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={showForm}
        title={editingId ? "Modifier le tarif" : "Ajouter un tarif"}
        onClose={closeForm}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              id="Annee_Tarif"
              label="Année"
              type="text"
              name="Annee_Tarif"
              value={form.Annee_Tarif}
              onChange={handleChange}
              required
            />

            <Input
              id="Denomination_Tarif"
              label="Désignation"
              type="text"
              name="Denomination_Tarif"
              value={form.Denomination_Tarif}
              onChange={handleChange}
              required
            />

            <Input
              id="Montant_Tarif"
              label="Montant"
              type="number"
              name="Montant_Tarif"
              value={form.Montant_Tarif}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Modal Btns */}
          <div className="flex items-center justify-between gap-3 mt-6">
            <div>
              {editingId && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => handleDelete(editingId)}
                  disabled={saving}
                >
                  Supprimer
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={closeForm}
                variant="secondary"
                disabled={saving}
              >
                Annuler
              </Button>

              <Button type="submit" disabled={saving}>
                {saving
                  ? "Enregistrement..."
                  : editingId
                    ? "Modifier"
                    : "Ajouter"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
