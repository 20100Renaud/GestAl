import { useEffect, useState } from "react";

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
      <div className="page-header">
        <div>
          <h1>Déplacements</h1>
          <p>Gestion des frais de déplacement</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="content-grid">
        <section className="card">
          <h2>
            {editingId ? "Modifier le déplacement" : "Nouveau déplacement"}
          </h2>

          <form onSubmit={handleSubmit}>
            <label>
              Année
              <input
                type="text"
                name="Annee_Deplacement"
                value={form.Annee_Deplacement}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Désignation
              <input
                type="text"
                name="Denomination_Deplacement"
                value={form.Denomination_Deplacement}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Montant
              <input
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
          <h2>Liste des déplacements</h2>

          {deplacements.length === 0 ? (
            <p>Aucun déplacement.</p>
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
                  {deplacements.map((deplacement) => (
                    <tr key={deplacement.ID_Deplacement}>
                      <td>{deplacement.Annee_Deplacement}</td>

                      <td>{deplacement.Denomination_Deplacement}</td>

                      <td>
                        {Number(deplacement.Montant_Deplacement).toFixed(2)} €
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => startEdit(deplacement)}
                        >
                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(deplacement.ID_Deplacement)
                          }
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
