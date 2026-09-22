import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
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

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");

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

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(paiement) {
    setEditingId(paiement.ID_Paiement);

    setForm({
      ID_Consultation: paiement.ID_Consultation ?? "",
      ID_Tarif: paiement.ID_Tarif ?? "",
      ID_Deplacement: paiement.ID_Deplacement ?? "",
      Date_Paiement: paiement.Date_Paiement
        ? paiement.Date_Paiement.slice(0, 10)
        : "",
      Montant_Paiement: paiement.Montant_Paiement ?? "",
      Remise_Paiement: paiement.Remise_Paiement ?? "0",
      Moyen_Paiement: paiement.Moyen_Paiement || "",
      Selection_Paiement: paiement.Selection_Paiement ?? false,
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

  const filteredPaiements = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return paiements;
    }

    return paiements.filter((paiement) => {
      const consultation = paiement.Consultation_Paiement;
      const tarif = paiement.Tarif_Paiements;
      const deplacement = paiement.Deplacement_Paiements;

      const fields = [
        paiement.Date_Paiement
          ? new Date(paiement.Date_Paiement).toLocaleDateString("fr-FR")
          : "",
        consultation ? getConsultationLabel(consultation) : "",
        tarif?.Denomination_Tarif,
        deplacement?.Denomination_Deplacement,
        paiement.Montant_Paiement,
        paiement.Remise_Paiement,
        paiement.Moyen_Paiement,
      ];

      return fields
        .filter((field) => field !== null && field !== undefined)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [paiements, search]);

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
      closeForm();
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
        title="Gestion des Paiements"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un paiement..."
        createLabel="Nouveau paiement"
        onAction={openCreateForm}
      />

      {loading ? (
        <p>Chargement...</p>
      ) : filteredPaiements.length === 0 ? (
        <Vide search={search} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Date</TableHeader>
              <TableHeader>Consultation</TableHeader>
              <TableHeader>Tarif</TableHeader>
              <TableHeader>Déplacement</TableHeader>
              <TableHeader>Montant</TableHeader>
              <TableHeader>Remise</TableHeader>
              <TableHeader>Moyen</TableHeader>
            </TableRow>
          </TableHead>

          <tbody>
            {filteredPaiements.map((paiement) => (
              <TableRow
                key={paiement.ID_Paiement}
                onClick={() => openEditForm(paiement)}
              >
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
                    ? paiement.Deplacement_Paiements.Denomination_Deplacement
                    : "—"}
                </TableCell>

                <TableCell>{paiement.Montant_Paiement ?? "—"} €</TableCell>

                <TableCell>{paiement.Remise_Paiement ?? "0"} €</TableCell>

                <TableCell>{paiement.Moyen_Paiement || "—"}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={showForm}
        title={editingId ? "Modifier le paiement" : "Ajouter un paiement"}
        onClose={closeForm}
      >
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
                  {getConsultationLabel(consultation)}
                </option>
              ))}
            </Select>

            <Select
              id="Tarif"
              label="Tarif"
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

            <Select
              id="Deplacement"
              label="Déplacement"
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

            <Input
              id="Date_Paiement"
              label="Date"
              type="date"
              name="Date_Paiement"
              value={form.Date_Paiement}
              onChange={handleChange}
            />

            <Input
              id="Montant_Paiement"
              label="Montant"
              type="number"
              step="0.01"
              min="0"
              name="Montant_Paiement"
              value={form.Montant_Paiement}
              onChange={handleChange}
            />

            <Input
              id="Remise_Paiement"
              label="Remise"
              type="number"
              step="0.01"
              min="0"
              name="Remise_Paiement"
              value={form.Remise_Paiement}
              onChange={handleChange}
            />

            <Select
              id="Moyen_Paiement"
              label="Moyen de paiement"
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

            <Input
              id="Selection"
              label="Selection"
              type="checkbox"
              name="Selection_Paiement"
              checked={form.Selection_Paiement}
              onChange={handleChange}
            />
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
      </Modal>
    </div>
  );
}
