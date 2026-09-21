import { useEffect, useState } from "react";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Textarea from "../components/ui/Textarea.jsx";
import Table, {
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../components/ui/Table.jsx";
import {
  getConsultations,
  createConsultation,
  updateConsultation,
  deleteConsultation,
} from "../api/consultations.js";

import { getAnimaux } from "../api/animaux.js";
import { getProprietaires } from "../api/proprietaires.js";

const emptyForm = {
  ID_Lieu: "",
  ID_Animal: "",
  Date_Consultation: "",
  Quantite_Consultation: "1",
  Motif_Consultation: "",
  Description_Consultation: "",
  Commentaire_Consultation: "",
};

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [animaux, setAnimaux] = useState([]);
  const [proprietaires, setProprietaires] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [consultationsData, animauxData, proprietairesData] =
        await Promise.all([
          getConsultations(),
          getAnimaux(),
          getProprietaires(),
        ]);

      setConsultations(consultationsData);
      setAnimaux(animauxData);
      setProprietaires(proprietairesData);
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

  function startEdit(consultation) {
    setEditingId(consultation.ID_Consultation);

    setForm({
      ID_Lieu: consultation.ID_Lieu,
      ID_Animal: consultation.ID_Animal,
      Date_Consultation: consultation.Date_Consultation
        ? consultation.Date_Consultation.slice(0, 16)
        : "",
      Quantite_Consultation: String(consultation.Quantite_Consultation ?? "1"),
      Motif_Consultation: consultation.Motif_Consultation || "",
      Description_Consultation: consultation.Description_Consultation || "",
      Commentaire_Consultation: consultation.Commentaire_Consultation || "",
    });

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await updateConsultation(editingId, form);
      } else {
        await createConsultation(form);
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
    if (!window.confirm("Supprimer cette consultation ?")) {
      return;
    }

    try {
      setError("");

      await deleteConsultation(id);

      if (editingId === id) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function getAnimalName(consultation) {
    if (consultation.Animal_Consultation) {
      return consultation.Animal_Consultation.Nom_Animal;
    }

    const animal = animaux.find(
      (item) => item.ID_Animal === consultation.ID_Animal,
    );

    return animal ? animal.Nom_Animal : "—";
  }

  function getLieuName(consultation) {
    if (consultation.Lieu_Consultation) {
      return `${consultation.Lieu_Consultation.Prenom_Proprietaire} ${consultation.Lieu_Consultation.Nom_Proprietaire}`;
    }

    const proprietaire = proprietaires.find(
      (item) => item.ID_Proprietaire === consultation.ID_Lieu,
    );

    if (!proprietaire) {
      return "—";
    }

    return `${proprietaire.Prenom_Proprietaire} ${proprietaire.Nom_Proprietaire}`;
  }

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString("fr-FR");
  }

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="page">
      <PageHeader title="Gestion des consultations" />
      {error && <Alert variant="error">{error}</Alert>}

      <div className="content-grid">
        <Card
          title={
            editingId ? "Modifier la consultation" : "Nouvelle consultation"
          }
        >
          <form onSubmit={handleSubmit}>
            <label>
              Lieu
              <Select
                name="ID_Lieu"
                value={form.ID_Lieu}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un lieu</option>

                {proprietaires.map((proprietaire) => (
                  <option
                    key={proprietaire.ID_Proprietaire}
                    value={proprietaire.ID_Proprietaire}
                  >
                    {proprietaire.Prenom_Proprietaire}{" "}
                    {proprietaire.Nom_Proprietaire}
                  </option>
                ))}
              </Select>
            </label>

            <label>
              Animal
              <Select
                name="ID_Animal"
                value={form.ID_Animal}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un animal</option>

                {animaux.map((animal) => (
                  <option key={animal.ID_Animal} value={animal.ID_Animal}>
                    {animal.Nom_Animal}
                  </option>
                ))}
              </Select>
            </label>

            <label>
              Date de consultation
              <Input
                type="datetime-local"
                name="Date_Consultation"
                value={form.Date_Consultation}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Quantité
              <Input
                type="number"
                name="Quantite_Consultation"
                value={form.Quantite_Consultation}
                onChange={handleChange}
                min="1"
                step="1"
                required
              />
            </label>

            <label>
              Motif
              <Input
                type="text"
                name="Motif_Consultation"
                value={form.Motif_Consultation}
                onChange={handleChange}
                required={true}
              />
            </label>

            <Textarea
              label="Description"
              name="Description_Consultation"
              value={form.Description_Consultation}
              onChange={handleChange}
              rows="4"
              required={true}
            />

            <Textarea
              label="Commentaire"
              name="Commentaire_Consultation"
              value={form.Commentaire_Consultation}
              onChange={handleChange}
              rows="4"
            />

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

        <Card title="Liste des consultations">
          {consultations.length === 0 ? (
            <p>Aucune consultation.</p>
          ) : (
            <div className="table-container">
              <table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Animal</TableHeader>
                    <TableHeader>Lieu</TableHeader>
                    <TableHeader>Motif</TableHeader>
                    <TableHeader>Quantité</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>

                <tbody>
                  {consultations.map((consultation) => (
                    <TableRow key={consultation.ID_Consultation}>
                      <TableCell>
                        {formatDate(consultation.Date_Consultation)}
                      </TableCell>

                      <TableCell>{getAnimalName(consultation)}</TableCell>

                      <TableCell>{getLieuName(consultation)}</TableCell>

                      <TableCell>{consultation.Motif_Consultation}</TableCell>

                      <TableCell>
                        {String(consultation.Quantite_Consultation)}
                      </TableCell>

                      <TableCell>
                        <Button
                          type="button"
                          onClick={() => startEdit(consultation)}
                          className="cursor-pointer"
                        >
                          Modifier
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          onClick={() =>
                            handleDelete(consultation.ID_Consultation)
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
