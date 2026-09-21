import { useEffect, useState } from "react";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Table, {
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../components/ui/Table.jsx";
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
      <PageHeader title="Gestion des paiements" />

      {error && <Alert variant="error">{error}</Alert>}

      <div className="content-grid">
        <Card title={editingId ? "Modifier le paiement" : "Nouveau paiement"}>
          <form onSubmit={handleSubmit}>
            <label>
              Consultation
              <Select
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
              </Select>
            </label>

            <label>
              Tarif
              <Select
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
              </Select>
            </label>

            <label>
              Déplacement
              <Select
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
              </Select>
            </label>

            <label>
              Date
              <Input
                type="date"
                name="Date_Paiement"
                value={form.Date_Paiement}
                onChange={handleChange}
              />
            </label>

            <label>
              Montant
              <Input
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
              <Input
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
              <Select
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
              </Select>
            </label>

            <label>
              <Input
                type="checkbox"
                name="Selection_Paiement"
                checked={form.Selection_Paiement}
                onChange={handleChange}
              />
              Sélectionné
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

        <Card title="Liste des paiements">
          {paiements.length === 0 ? (
            <p>Aucun paiement.</p>
          ) : (
            <div className="table-container">
              <table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Consultation</TableHeader>
                    <TableHeader>Tarif</TableHeader>
                    <TableHeader>Déplacement</TableHeader>
                    <TableHeader>Montant</TableHeader>
                    <TableHeader>Remise</TableHeader>
                    <TableHeader>Moyen</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>

                <tbody>
                  {paiements.map((paiement) => (
                    <TableRow key={paiement.ID_Paiement}>
                      <TableCell>
                        {paiement.Date_Paiement
                          ? new Date(paiement.Date_Paiement).toLocaleDateString(
                              "fr-FR",
                            )
                          : "—"}
                      </TableCell>

                      <TableCell>
                        {paiement.Consultation_Paiement
                          ? getConsultationLabel(paiement.Consultation_Paiement)
                          : "—"}
                      </TableCell>

                      <TableCell>
                        {paiement.Tarif_Paiements
                          ? paiement.Tarif_Paiements.Denomination_Tarif
                          : "—"}
                      </TableCell>

                      <TableCell>
                        {paiement.Deplacement_Paiements
                          ? paiement.Deplacement_Paiements
                              .Denomination_Deplacement
                          : "—"}
                      </TableCell>

                      <TableCell>{paiement.Montant_Paiement} €</TableCell>

                      <TableCell>{paiement.Remise_Paiement} €</TableCell>

                      <TableCell>{paiement.Moyen_Paiement || "—"}</TableCell>

                      <TableCell>
                        <Button
                          type="button"
                          onClick={() => startEdit(paiement)}
                        >
                          Modifier
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleDelete(paiement.ID_Paiement)}
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
