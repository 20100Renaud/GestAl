import { useEffect, useState } from "react";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Input from "../components/ui/Input.jsx";
import Table, {
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

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function startEdit(tarif) {
    setEditingId(tarif.ID_Tarif);

    setForm({
      Annee_Tarif: tarif.Annee_Tarif,
      Denomination_Tarif: tarif.Denomination_Tarif,
      Montant_Tarif: String(tarif.Montant_Tarif),
    });

    setError("");
  }

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
      resetForm();
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
        resetForm();
      }

      await loadTarifs();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="page">
      <PageHeader title="Gestion des tarifs" />

      {error && <Alert variant="error">{error}</Alert>}

      <div className="content-grid">
        <Card title={editingId ? "Modifier le tarif" : "Nouveau tarif"}>
          <form onSubmit={handleSubmit}>
            <label>
              Année
              <Input
                type="text"
                name="Annee_Tarif"
                value={form.Annee_Tarif}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Désignation
              <Input
                type="text"
                name="Denomination_Tarif"
                value={form.Denomination_Tarif}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Montant
              <Input
                type="number"
                name="Montant_Tarif"
                value={form.Montant_Tarif}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </label>

            <div className="form-actions">
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Enregistrement..."
                  : editingId
                    ? "Modifier"
                    : "Créer"}
              </Button>

              {editingId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card title="Liste des tarifs">
          {tarifs.length === 0 ? (
            <p>Aucun tarif.</p>
          ) : (
            <div className="table-container">
              <table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Année</TableHeader>
                    <TableHeader>Désignation</TableHeader>
                    <TableHeader>Montant</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>

                <tbody>
                  {tarifs.map((tarif) => (
                    <TableRow key={tarif.ID_Tarif}>
                      <TableCell>{tarif.Annee_Tarif}</TableCell>
                      <TableCell>{tarif.Denomination_Tarif}</TableCell>
                      <TableCell>
                        {Number(tarif.Montant_Tarif).toFixed(2)} €
                      </TableCell>

                      <TableCell>
                        <Button type="button" onClick={() => startEdit(tarif)}>
                          Modifier
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleDelete(tarif.ID_Tarif)}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
