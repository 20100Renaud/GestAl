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
  getDeplacements,
  createDeplacement,
  updateDeplacement,
  deleteDeplacement,
} from "../api/deplacements.js";

const emptyForm = {
  Annee_Deplacement: "",
  Denomination_Deplacement: "",
  Montant_Deplacement: "",
};

export default function Deplacements() {
  const [deplacements, setDeplacements] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadDeplacements() {
    try {
      setLoading(true);
      setError("");

      const data = await getDeplacements();
      setDeplacements(data);
    } catch (err) {
      setError(err.message);
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
  }

  const filteredDeplacements = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return deplacements;
    }

    return deplacements.filter((deplacement) => {
      return [
        deplacement.Annee_Deplacement,
        deplacement.Denomination_Deplacement,
        deplacement.Montant_Deplacement,
      ]
        .filter((field) => field !== null && field !== undefined)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [deplacements, search]);

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

  return (
    <div className="w-full">
      {error && <Alert variant="error">{error}</Alert>}

      <PageHeader
        title="Gestion des Déplacements"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un déplacement..."
        createLabel="Nouveau déplacement"
        onAction={openCreateForm}
      />

      {loading ? (
        <p>Chargement...</p>
      ) : filteredDeplacements.length === 0 ? (
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
            {filteredDeplacements.map((deplacement) => (
              <TableRow
                key={deplacement.ID_Deplacement}
                onClick={() => openEditForm(deplacement)}
              >
                <TableCell>{deplacement.Annee_Deplacement}</TableCell>

                <TableCell>{deplacement.Denomination_Deplacement}</TableCell>

                <TableCell>
                  {Number(deplacement.Montant_Deplacement).toFixed(2)} €
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={showForm}
        title={editingId ? "Modifier le déplacement" : "Ajouter un déplacement"}
        onClose={closeForm}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-4">
            <Input
              id="Annee_Deplacement"
              label="Année"
              type="text"
              name="Annee_Deplacement"
              value={form.Annee_Deplacement}
              onChange={handleChange}
              required
            />

            <Input
              id="Denomination_Deplacement"
              label="Désignation"
              type="text"
              name="Denomination_Deplacement"
              value={form.Denomination_Deplacement}
              onChange={handleChange}
              required
            />

            <Input
              id="Montant_Deplacement"
              label="Montant"
              type="number"
              name="Montant_Deplacement"
              value={form.Montant_Deplacement}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

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
