import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import Table, {
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

  const filteredProprietaires = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return proprietaires;
    }

    return proprietaires.filter((proprietaire) => {
      return [
        proprietaire.Nom_Proprietaire,
        proprietaire.Prenom_Proprietaire,
        proprietaire.Email_Proprietaire,
        proprietaire.Ville_Proprietaire,
        proprietaire.CP_Proprietaire,
        proprietaire.Tel_Proprietaire,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value));
    });
  }, [proprietaires, search]);

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

  async function handleDelete(proprietaire) {
    const confirmed = window.confirm(
      `Delete ${proprietaire.Prenom_Proprietaire} ${proprietaire.Nom_Proprietaire}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteProprietaire(proprietaire.ID_Proprietaire);
      await loadProprietaires();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Propriétaires"
        action={
          <Button onClick={openCreateForm}>+ Nouveau propriétaire</Button>
        }
      />

      {error && (
        <div className="mb-4 p-4 text-red-900 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-4  w-full max-w-[420px] ">
        <div className="relative">
          <Input
            type="search"
            placeholder="Recherche par nom, e-mail, ville..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search
            size={20}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
          Chargement...
        </div>
      ) : filteredProprietaires.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
          {search
            ? "Aucun propriétaire ne correspond à la recherche."
            : "Aucun propriétaire trouvé."}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
          <table className="w-full border-collapse">
            <TableHead>
              <TableRow className="bg-gray-50 text-gray-700 text-[0.85rem]">
                <TableHeader>Raison sociale</TableHeader>
                <TableHeader>Civilité</TableHeader>
                <TableHeader>Nom</TableHeader>
                <TableHeader>Prénom</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Ville</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>

            <tbody>
              {filteredProprietaires.map((proprietaire) => (
                <TableRow key={proprietaire.ID_Proprietaire}>
                  <TableCell>
                    {proprietaire.Raison_sociale} {proprietaire.Etablissement}
                  </TableCell>
                  <TableCell>{proprietaire.Civilite_Proprietaire}</TableCell>
                  <TableCell>{proprietaire.Nom_Proprietaire}</TableCell>
                  <TableCell>{proprietaire.Prenom_Proprietaire}</TableCell>
                  <TableCell>{proprietaire.Email_Proprietaire}</TableCell>
                  <TableCell>{proprietaire.Ville_Proprietaire}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button onClick={() => openEditForm(proprietaire)}>
                        Modifier
                      </Button>
                      <Button
                        onClick={() => handleDelete(proprietaire)}
                        variant="danger"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Backdrop */}
      <Modal
        open={showForm}
        title={
          editingId ? "Modifier le propriétaire" : "Ajouter un propriétaire"
        }
        onClose={closeForm}
      >
        <form onSubmit={handleSubmit} className="p-6">
          {/* Form Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="raisonSociale"
                className="text-sm font-semibold text-gray-700"
              >
                Raison sociale <span className="text-red-500">*</span>
              </label>
              <Select
                id="raisonSociale"
                name="raisonSociale"
                value={form.raisonSociale}
                onChange={handleChange}
              >
                <option value="Particulier">Particulier</option>
                <option value="Ecurie">Ecurie</option>
                <option value="Asso">Association</option>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="etablissement"
                className="text-sm font-semibold text-gray-700"
              >
                Établissement
              </label>
              <Input
                type="text"
                id="etablissement"
                name="etablissement"
                value={form.etablissement}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="civilite"
                className="text-sm font-semibold text-gray-700"
              >
                Civilité
              </label>
              <Select
                id="civilite"
                name="civilite"
                value={form.civilite}
                onChange={handleChange}
              >
                <option value="">Sélectionner</option>
                <option value="M">M.</option>
                <option value="Mme">Mme</option>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="nom"
                className="text-sm font-semibold text-gray-700"
              >
                Nom <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                id="nom"
                name="nom"
                value={form.nom}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="prenom"
                className="text-sm font-semibold text-gray-700"
              >
                Prénom <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                id="prenom"
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label
                htmlFor="adresse"
                className="text-sm font-semibold text-gray-700"
              >
                Adresse <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                id="adresse"
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="ville"
                className="text-sm font-semibold text-gray-700"
              >
                Ville <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                id="ville"
                name="ville"
                value={form.ville}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="cp"
                className="text-sm font-semibold text-gray-700"
              >
                Code postal <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                id="cp"
                name="cp"
                value={form.cp}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="tel"
                className="text-sm font-semibold text-gray-700"
              >
                Téléphone <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                id="tel"
                name="tel"
                value={form.tel}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 mt-6">
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
        </form>
      </Modal>
    </div>
  );
}
