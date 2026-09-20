import { useEffect, useState } from "react";

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
      <div className="page-header">
        <div>
          <h1>Tarifs</h1>
          <p>Gestion des tarifs</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="content-grid">
        <section className="card">
          <h2>{editingId ? "Modifier le tarif" : "Nouveau tarif"}</h2>

          <form onSubmit={handleSubmit}>
            <label>
              Année
              <input
                type="text"
                name="Annee_Tarif"
                value={form.Annee_Tarif}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Désignation
              <input
                type="text"
                name="Denomination_Tarif"
                value={form.Denomination_Tarif}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Montant
              <input
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
              <button type="submit" disabled={saving}>
                {saving
                  ? "Enregistrement..."
                  : editingId
                    ? "Modifier"
                    : "Créer"}
              </button>

              {editingId && (
                <button type="button" onClick={resetForm}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card">
          <h2>Liste des tarifs</h2>

          {tarifs.length === 0 ? (
            <p>Aucun tarif.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Année</th>
                    <th>Désignation</th>
                    <th>Montant</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {tarifs.map((tarif) => (
                    <tr key={tarif.ID_Tarif}>
                      <td>{tarif.Annee_Tarif}</td>
                      <td>{tarif.Denomination_Tarif}</td>
                      <td>{Number(tarif.Montant_Tarif).toFixed(2)} €</td>

                      <td>
                        <button type="button" onClick={() => startEdit(tarif)}>
                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(tarif.ID_Tarif)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
