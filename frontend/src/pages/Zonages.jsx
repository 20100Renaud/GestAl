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

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");

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

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(zonage) {
    setEditingId(zonage.ID_Zonage);

    setForm({
      ID_Consultation: zonage.ID_Consultation ?? "",
      Nom_Zonage: zonage.Nom_Zonage ?? "",
      Position_Zonage: zonage.Position_Zonage ?? "",
      Orientation_Zonage: zonage.Orientation_Zonage ?? "",
      Commentaire_Zonage: zonage.Commentaire_Zonage ?? "",
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

  const filteredZonages = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return zonages;
    }

    return zonages.filter((zonage) => {
      const consultation = zonage.Consultation_Zonage;

      const consultationLabel = consultation
        ? `${consultation.Date_Consultation || ""} ${
            consultation.Motif_Consultation || ""
          }`
        : String(zonage.ID_Consultation || "");

      return [
        zonage.Nom_Zonage,
        zonage.Position_Zonage,
        zonage.Orientation_Zonage,
        zonage.Commentaire_Zonage,
        consultationLabel,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [zonages, search]);

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
      closeForm();
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
        closeForm();
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

  return (
    <div className="w-full">
      {error && <Alert variant="error">{error}</Alert>}

      <PageHeader
        title="Gestion des Zonages"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Recherche par nom, position, orientation..."
        createLabel="Nouveau zonage"
        onAction={openCreateForm}
      />

      {loading ? (
        <p>Chargement...</p>
      ) : filteredZonages.length === 0 ? (
        <Vide search={search} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Nom</TableHeader>
              <TableHeader>Position</TableHeader>
              <TableHeader>Orientation</TableHeader>
              <TableHeader>Consultation</TableHeader>
            </TableRow>
          </TableHead>

          <tbody>
            {filteredZonages.map((zonage) => (
              <TableRow
                key={zonage.ID_Zonage}
                onClick={() => openEditForm(zonage)}
              >
                <TableCell>{zonage.Nom_Zonage}</TableCell>

                <TableCell>{zonage.Position_Zonage || "—"}</TableCell>

                <TableCell>{zonage.Orientation_Zonage || "—"}</TableCell>

                <TableCell>{getConsultationLabel(zonage)}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={showForm}
        title={editingId ? "Modifier le zonage" : "Ajouter un zonage"}
        onClose={closeForm}
      >
        {consultations.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-600">
              Vous devez créer une consultation avant de pouvoir créer un
              zonage.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                id="Consultation"
                label="Consultation"
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
              </Select>

              <Input
                id="Nom_Zonage"
                label="Nom"
                type="text"
                name="Nom_Zonage"
                value={form.Nom_Zonage}
                onChange={handleChange}
                required
              />

              <Input
                id="Position"
                label="Position"
                type="text"
                name="Position_Zonage"
                value={form.Position_Zonage}
                onChange={handleChange}
              />

              <Input
                id="Orientation"
                label="Orientation"
                type="text"
                name="Orientation_Zonage"
                value={form.Orientation_Zonage}
                onChange={handleChange}
              />

              <div className="md:col-span-2">
                <Textarea
                  label="Commentaire"
                  name="Commentaire_Zonage"
                  value={form.Commentaire_Zonage}
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
