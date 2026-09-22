import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import Alert from "../components/ui/Alert.jsx";
import Table, {
  Vide,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../components/ui/Table.jsx";
import {
  createProprietaire,
  deleteProprietaire,
  getProprietaires,
  updateProprietaire,
} from "../api/proprietaires.js";

const emptyForm = {
  raisonSociale: "",
  etablissement: "",
  civilite: "",
  nom: "",
  prenom: "",
  email: "",
  adresse: "",
  ville: "",
  cp: "",
  tel: "",
};

export default function Proprietaires() {
  const [proprietaires, setProprietaires] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function loadProprietaires() {
    try {
      setLoading(true);
      setError("");

      const data = await getProprietaires();

      setProprietaires(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProprietaires();
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

  function openEditForm(proprietaire) {
    setEditingId(proprietaire.ID_Proprietaire);

    setForm({
      raisonSociale: proprietaire.Raison_sociale ?? "",
      etablissement: proprietaire.Etablissement ?? "",
      civilite: proprietaire.Civilite_Proprietaire ?? "",
      nom: proprietaire.Nom_Proprietaire ?? "",
      prenom: proprietaire.Prenom_Proprietaire ?? "",
      email: proprietaire.Email_Proprietaire ?? "",
      adresse: proprietaire.Adresse_Proprietaire ?? "",
      ville: proprietaire.Ville_Proprietaire ?? "",
      cp: proprietaire.CP_Proprietaire ?? "",
      tel: proprietaire.Tel_Proprietaire ?? "",
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

  const filteredProprietaires = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return proprietaires;
    }

    return proprietaires.filter((proprietaire) => {
      return [
        proprietaire.Raison_sociale,
        proprietaire.Etablissement,
        proprietaire.Civilite_Proprietaire,
        proprietaire.Nom_Proprietaire,
        proprietaire.Prenom_Proprietaire,
        proprietaire.Email_Proprietaire,
        proprietaire.Adresse_Proprietaire,
        proprietaire.Ville_Proprietaire,
        proprietaire.CP_Proprietaire,
        proprietaire.Tel_Proprietaire,
      ]
        .filter((field) => field !== null && field !== undefined)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [proprietaires, search]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await updateProprietaire(editingId, form);
      } else {
        await createProprietaire(form);
      }

      await loadProprietaires();
      closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce propriétaire ?")) {
      return;
    }

    try {
      setError("");

      await deleteProprietaire(id);

      if (editingId === id) {
        closeForm();
      }

      await loadProprietaires();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="w-full">
      {error && <Alert variant="error">{error}</Alert>}

      <PageHeader
        title="Gestion des Propriétaires"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Recherche par nom, e-mail, ville..."
        createLabel="Nouveau propriétaire"
        onAction={openCreateForm}
      />

      {loading ? (
        <p>Chargement...</p>
      ) : filteredProprietaires.length === 0 ? (
        <Vide search={search} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Raison sociale</TableHeader>
              <TableHeader>Civilité</TableHeader>
              <TableHeader>Nom</TableHeader>
              <TableHeader>Prénom</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Ville</TableHeader>
            </TableRow>
          </TableHead>

          <tbody>
            {filteredProprietaires.map((proprietaire) => (
              <TableRow
                key={proprietaire.ID_Proprietaire}
                onClick={() => openEditForm(proprietaire)}
              >
                <TableCell>
                  {[proprietaire.Raison_sociale, proprietaire.Etablissement]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </TableCell>

                <TableCell>
                  {proprietaire.Civilite_Proprietaire || "—"}
                </TableCell>

                <TableCell>{proprietaire.Nom_Proprietaire || "—"}</TableCell>

                <TableCell>{proprietaire.Prenom_Proprietaire || "—"}</TableCell>

                <TableCell>{proprietaire.Email_Proprietaire || "—"}</TableCell>

                <TableCell>{proprietaire.Ville_Proprietaire || "—"}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={showForm}
        title={
          editingId ? "Modifier le propriétaire" : "Ajouter un propriétaire"
        }
        onClose={closeForm}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              id="raisonSociale"
              label="Raison sociale"
              name="raisonSociale"
              value={form.raisonSociale}
              onChange={handleChange}
              required
            >
              <option value="Particulier">Particulier</option>
              <option value="Ecurie">Ecurie</option>
              <option value="Asso">Association</option>
            </Select>

            <Input
              id="etablissement"
              label="Établissement"
              type="text"
              name="etablissement"
              value={form.etablissement}
              onChange={handleChange}
            />

            <Select
              id="civilite"
              label="Civilité"
              name="civilite"
              value={form.civilite}
              onChange={handleChange}
            >
              <option value="">Sélectionner</option>
              <option value="M">M.</option>
              <option value="Mme">Mme</option>
            </Select>

            <Input
              id="nom"
              label="Nom"
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
            />

            <Input
              id="prenom"
              label="Prénom"
              type="text"
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              required
            />

            <Input
              id="email"
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <div className="md:col-span-2">
              <Input
                id="adresse"
                label="Adresse"
                type="text"
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              id="ville"
              label="Ville"
              type="text"
              name="ville"
              value={form.ville}
              onChange={handleChange}
              required
            />

            <Input
              id="cp"
              label="Code postal"
              type="text"
              name="cp"
              value={form.cp}
              onChange={handleChange}
              required
            />

            <Input
              id="tel"
              label="Téléphone"
              type="tel"
              name="tel"
              value={form.tel}
              onChange={handleChange}
              required
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
