import { useEffect, useState } from "react";

import {
  getZonages,
  createZonage,
  updateZonage,
  deleteZonage,
} from "../api/zonages.js";

import { getConsultations } from "../api/consultations.js";

const emptyForm = {
  ID_Consultation: "",
  Nom_Zonage: "",
  Position_Zonage: "",
  Orientation_Zonage: "",
  Commentaire_Zonage: "",
};

export default function Zonages() {
  const [zonages, setZonages] = useState([]);
  const [consultations, setConsultations] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [zonagesData, consultationsData] = await Promise.all([
        getZonages(),
        getConsultations(),
      ]);

      setZonages(zonagesData);
      setConsultations(consultationsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
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

  function startEdit(zonage) {
    setEditingId(zonage.ID_Zonage);

    setForm({
      ID_Consultation: zonage.ID_Consultation,
      Nom_Zonage: zonage.Nom_Zonage,
      Position_Zonage: zonage.Position_Zonage || "",
      Orientation_Zonage: zonage.Orientation_Zonage || "",
      Commentaire_Zonage: zonage.Commentaire_Zonage || "",
    });

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await updateZonage(editingId, form);
      } else {
        await createZonage(form);
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce zonage ?")) {
      return;
    }

    try {
      setError("");

      await deleteZonage(id);

      if (editingId === id) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function getConsultationLabel(zonage) {
    const consultation = zonage.Consultation_Zonage;

    if (!consultation) {
      return zonage.ID_Consultation;
    }

    const date = consultation.Date_Consultation
      ? new Date(consultation.Date_Consultation).toLocaleDateString("fr-FR")
      : "";

    return `${date} — ${consultation.Motif_Consultation}`;
  }

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Zonages</h1>
          <p>Gestion des zonages des consultations</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="content-grid">
        <section className="card">
          <h2>{editingId ? "Modifier le zonage" : "Nouveau zonage"}</h2>

          {consultations.length === 0 ? (
            <p>
              Vous devez créer une consultation avant de pouvoir créer un
              zonage.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label>
                Consultation
                <select
                  name="ID_Consultation"
                  value={form.ID_Consultation}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner une consultation</option>

                  {consultations.map((consultation) => (
                    <option
                      key={consultation.ID_Consultation}
                      value={consultation.ID_Consultation}
                    >
                      {new Date(
                        consultation.Date_Consultation,
                      ).toLocaleDateString("fr-FR")}{" "}
                      — {consultation.Motif_Consultation}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Nom
                <input
                  type="text"
                  name="Nom_Zonage"
                  value={form.Nom_Zonage}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Position
                <input
                  type="text"
                  name="Position_Zonage"
                  value={form.Position_Zonage}
                  onChange={handleChange}
                />
              </label>

              <label>
                Orientation
                <input
                  type="text"
                  name="Orientation_Zonage"
                  value={form.Orientation_Zonage}
                  onChange={handleChange}
                />
              </label>

              <label>
                Commentaire
                <textarea
                  name="Commentaire_Zonage"
                  value={form.Commentaire_Zonage}
                  onChange={handleChange}
                  rows="4"
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
          )}
        </section>

        <section className="card">
          <h2>Liste des zonages</h2>

          {zonages.length === 0 ? (
            <p>Aucun zonage.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Position</th>
                    <th>Orientation</th>
                    <th>Consultation</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {zonages.map((zonage) => (
                    <tr key={zonage.ID_Zonage}>
                      <td>{zonage.Nom_Zonage}</td>
                      <td>{zonage.Position_Zonage || "—"}</td>
                      <td>{zonage.Orientation_Zonage || "—"}</td>
                      <td>{getConsultationLabel(zonage)}</td>

                      <td>
                        <button type="button" onClick={() => startEdit(zonage)}>
                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(zonage.ID_Zonage)}
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
