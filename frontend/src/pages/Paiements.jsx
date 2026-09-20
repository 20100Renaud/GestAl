import { useEffect, useState } from "react";

import {
  getPaiements,
  createPaiement,
  updatePaiement,
  deletePaiement,
} from "../api/paiements.js";

import { getConsultations } from "../api/consultations.js";
import { getTarifs } from "../api/tarifs.js";
import { getDeplacements } from "../api/deplacements.js";

const emptyForm = {
  ID_Consultation: "",
  ID_Tarif: "",
  ID_Deplacement: "",
  Date_Paiement: "",
  Montant_Paiement: "",
  Remise_Paiement: "0",
  Moyen_Paiement: "",
  Selection_Paiement: false,
};

export default function Paiements() {
  const [paiements, setPaiements] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [tarifs, setTarifs] = useState([]);
  const [deplacements, setDeplacements] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [paiementsData, consultationsData, tarifsData, deplacementsData] =
        await Promise.all([
          getPaiements(),
          getConsultations(),
          getTarifs(),
          getDeplacements(),
        ]);

      setPaiements(paiementsData);
      setConsultations(consultationsData);
      setTarifs(tarifsData);
      setDeplacements(deplacementsData);
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
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function startEdit(paiement) {
    setEditingId(paiement.ID_Paiement);

    setForm({
      ID_Consultation: paiement.ID_Consultation,
      ID_Tarif: paiement.ID_Tarif,
      ID_Deplacement: paiement.ID_Deplacement,
      Date_Paiement: paiement.Date_Paiement
        ? paiement.Date_Paiement.slice(0, 10)
        : "",
      Montant_Paiement: paiement.Montant_Paiement ?? "",
      Remise_Paiement: paiement.Remise_Paiement ?? "0",
      Moyen_Paiement: paiement.Moyen_Paiement || "",
      Selection_Paiement: paiement.Selection_Paiement ?? false,
    });

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await updatePaiement(editingId, form);
      } else {
        await createPaiement(form);
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
    if (!window.confirm("Supprimer ce paiement ?")) {
      return;
    }

    try {
      setError("");

      await deletePaiement(id);

      if (editingId === id) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function getConsultationLabel(consultation) {
    const date = consultation.Date_Consultation
      ? new Date(consultation.Date_Consultation).toLocaleDateString("fr-FR")
      : "";

    return `${date} — ${consultation.Motif_Consultation}`;
  }

  function getTarifLabel(tarif) {
    return `${tarif.Annee_Tarif} — ${tarif.Denomination_Tarif} (${tarif.Montant_Tarif} €)`;
  }

  function getDeplacementLabel(deplacement) {
    return `${deplacement.Annee_Deplacement} — ${deplacement.Denomination_Deplacement} (${deplacement.Montant_Deplacement} €)`;
  }

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Paiements</h1>
          <p>Gestion des paiements</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="content-grid">
        <section className="card">
          <h2>{editingId ? "Modifier le paiement" : "Nouveau paiement"}</h2>

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
                    {getConsultationLabel(consultation)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tarif
              <select
                name="ID_Tarif"
                value={form.ID_Tarif}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un tarif</option>

                {tarifs.map((tarif) => (
                  <option key={tarif.ID_Tarif} value={tarif.ID_Tarif}>
                    {getTarifLabel(tarif)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Déplacement
              <select
                name="ID_Deplacement"
                value={form.ID_Deplacement}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un déplacement</option>

                {deplacements.map((deplacement) => (
                  <option
                    key={deplacement.ID_Deplacement}
                    value={deplacement.ID_Deplacement}
                  >
                    {getDeplacementLabel(deplacement)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date
              <input
                type="date"
                name="Date_Paiement"
                value={form.Date_Paiement}
                onChange={handleChange}
              />
            </label>

            <label>
              Montant
              <input
                type="number"
                step="0.01"
                min="0"
                name="Montant_Paiement"
                value={form.Montant_Paiement}
                onChange={handleChange}
              />
            </label>

            <label>
              Remise
              <input
                type="number"
                step="0.01"
                min="0"
                name="Remise_Paiement"
                value={form.Remise_Paiement}
                onChange={handleChange}
              />
            </label>

            <label>
              Moyen de paiement
              <select
                name="Moyen_Paiement"
                value={form.Moyen_Paiement}
                onChange={handleChange}
              >
                <option value="">Sélectionner</option>
                <option value="Carte">Carte</option>
                <option value="Espèces">Espèces</option>
                <option value="Chèque">Chèque</option>
                <option value="Virement">Virement</option>
                <option value="Autre">Autre</option>
              </select>
            </label>

            <label>
              <input
                type="checkbox"
                name="Selection_Paiement"
                checked={form.Selection_Paiement}
                onChange={handleChange}
              />
              Sélectionné
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
          <h2>Liste des paiements</h2>

          {paiements.length === 0 ? (
            <p>Aucun paiement.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Consultation</th>
                    <th>Tarif</th>
                    <th>Déplacement</th>
                    <th>Montant</th>
                    <th>Remise</th>
                    <th>Moyen</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paiements.map((paiement) => (
                    <tr key={paiement.ID_Paiement}>
                      <td>
                        {paiement.Date_Paiement
                          ? new Date(paiement.Date_Paiement).toLocaleDateString(
                              "fr-FR",
                            )
                          : "—"}
                      </td>

                      <td>
                        {paiement.Consultation_Paiement
                          ? getConsultationLabel(paiement.Consultation_Paiement)
                          : "—"}
                      </td>

                      <td>
                        {paiement.Tarif_Paiements
                          ? paiement.Tarif_Paiements.Denomination_Tarif
                          : "—"}
                      </td>

                      <td>
                        {paiement.Deplacement_Paiements
                          ? paiement.Deplacement_Paiements
                              .Denomination_Deplacement
                          : "—"}
                      </td>

                      <td>{paiement.Montant_Paiement} €</td>

                      <td>{paiement.Remise_Paiement} €</td>

                      <td>{paiement.Moyen_Paiement || "—"}</td>

                      <td>
                        <button
                          type="button"
                          onClick={() => startEdit(paiement)}
                        >
                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(paiement.ID_Paiement)}
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
