import { useEffect, useMemo, useState } from "react";

import Button from "../components/ui/Button.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Textarea from "../components/ui/Textarea.jsx";
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

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");

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

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(consultation) {
    setEditingId(consultation.ID_Consultation);

    setForm({
      ID_Lieu: consultation.ID_Lieu ?? "",
      ID_Animal: consultation.ID_Animal ?? "",
      Date_Consultation: consultation.Date_Consultation
        ? consultation.Date_Consultation.slice(0, 16)
        : "",
      Quantite_Consultation: String(consultation.Quantite_Consultation ?? "1"),
      Motif_Consultation: consultation.Motif_Consultation || "",
      Description_Consultation: consultation.Description_Consultation || "",
      Commentaire_Consultation: consultation.Commentaire_Consultation || "",
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

  const filteredConsultations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return consultations;
    }

    return consultations.filter((consultation) => {
      const animalName = getAnimalName(consultation);
      const lieuName = getLieuName(consultation);
      const date = formatDate(consultation.Date_Consultation);

      return [
        animalName,
        lieuName,
        consultation.Motif_Consultation,
        consultation.Description_Consultation,
        consultation.Commentaire_Consultation,
        consultation.Quantite_Consultation,
        date,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [consultations, animaux, proprietaires, search]);

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
      closeForm();
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
        closeForm();
      }

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="w-full">
      {error && <Alert variant="error">{error}</Alert>}

      <PageHeader
        title="Gestion des Consultations"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une consultation..."
        createLabel="Nouvelle consultation"
        onAction={openCreateForm}
      />

      {loading ? (
        <p>Chargement...</p>
      ) : filteredConsultations.length === 0 ? (
        <Vide search={search} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Date</TableHeader>
              <TableHeader>Animal</TableHeader>
              <TableHeader>Lieu</TableHeader>
              <TableHeader>Motif</TableHeader>
              <TableHeader>Quantité</TableHeader>
            </TableRow>
          </TableHead>

          <tbody>
            {filteredConsultations.map((consultation) => (
              <TableRow
                key={consultation.ID_Consultation}
                onClick={() => openEditForm(consultation)}
              >
                <TableCell>
                  {formatDate(consultation.Date_Consultation)}
                </TableCell>

                <TableCell>{getAnimalName(consultation)}</TableCell>

                <TableCell>{getLieuName(consultation)}</TableCell>

                <TableCell>{consultation.Motif_Consultation || "—"}</TableCell>

                <TableCell>
                  {String(consultation.Quantite_Consultation ?? "—")}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={showForm}
        title={
          editingId ? "Modifier la consultation" : "Ajouter une consultation"
        }
        onClose={closeForm}
      >
        {animaux.length === 0 || proprietaires.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-600">
              Vous devez créer au moins un propriétaire et un animal avant de
              pouvoir créer une consultation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                id="Lieu"
                label="Lieu de consultation"
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

              <Select
                id="Animal"
                label="Animal"
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

              <Input
                id="Date_Consultation"
                label="Date de consultation"
                type="datetime-local"
                name="Date_Consultation"
                value={form.Date_Consultation}
                onChange={handleChange}
                required
              />

              <Input
                id="Quantite_Consultation"
                label="Quantité"
                type="number"
                name="Quantite_Consultation"
                value={form.Quantite_Consultation}
                onChange={handleChange}
                min="1"
                step="1"
                required
              />

              <Input
                id="Motif_Consultation"
                label="Motif"
                type="text"
                name="Motif_Consultation"
                value={form.Motif_Consultation}
                onChange={handleChange}
                required
              />

              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  name="Description_Consultation"
                  value={form.Description_Consultation}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Commentaire personnel"
                  name="Commentaire_Consultation"
                  value={form.Commentaire_Consultation}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
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
        )}
      </Modal>
    </div>
  );
}
