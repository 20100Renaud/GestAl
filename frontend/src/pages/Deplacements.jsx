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

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function startEdit(deplacement) {
    setEditingId(deplacement.ID_Deplacement);

    setForm({
      Annee_Deplacement: deplacement.Annee_Deplacement,
      Denomination_Deplacement: deplacement.Denomination_Deplacement,
      Montant_Deplacement: String(deplacement.Montant_Deplacement),
    });

    setError("");
  }

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
      resetForm();
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
        resetForm();
      }

      await loadDeplacements();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="page">
      <PageHeader title="Déplacements" />

      {error && <Alert variant="error">{error}</Alert>}

      <div className="content-grid">
        <Card
          title={editingId ? "Modifier le déplacement" : "Nouveau déplacement"}
        >
          <form onSubmit={handleSubmit}>
            <label>
              Année
              <Input
                type="text"
                name="Annee_Deplacement"
                value={form.Annee_Deplacement}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Désignation
              <Input
                type="text"
                name="Denomination_Deplacement"
                value={form.Denomination_Deplacement}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Montant
              <Input
                type="number"
                name="Montant_Deplacement"
                value={form.Montant_Deplacement}
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

        <Card title="Liste des déplacements">
          {deplacements.length === 0 ? (
            <p>Aucun déplacement.</p>
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
                  {deplacements.map((deplacement) => (
                    <TableRow key={deplacement.ID_Deplacement}>
                      <TableCell>{deplacement.Annee_Deplacement}</TableCell>

                      <TableCell>
                        {deplacement.Denomination_Deplacement}
                      </TableCell>

                      <TableCell>
                        {Number(deplacement.Montant_Deplacement).toFixed(2)} €
                      </TableCell>

                      <TableCell>
                        <Button
                          type="button"
                          onClick={() => startEdit(deplacement)}
                        >
                          Modifier
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          onClick={() =>
                            handleDelete(deplacement.ID_Deplacement)
                          }
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
