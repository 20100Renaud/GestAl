import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
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
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="m-0">Propriétaires</h1>
          <p className="mt-1.5 text-gray-500">Gestion des propriétaires</p>
        </div>

        <button type="button" onClick={openCreateForm}>
          + Nouveau propriétaire
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-900 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-4  w-full max-w-[420px] ">
        <div className="relative">
          <input
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
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-[0.85rem]">
                <th className="p-[0.85rem_1rem] text-left border-b border-gray-200">
                  Raison sociale
                </th>
                <th className="p-[0.85rem_1rem] text-left border-b border-gray-200 hidden md:table-cell">
                  Civilité
                </th>
                <th className="p-[0.85rem_1rem] text-left border-b border-gray-200">
                  Nom
                </th>
                <th className="p-[0.85rem_1rem] text-left border-b border-gray-200 hidden md:table-cell">
                  Prénom
                </th>
                <th className="p-[0.85rem_1rem] text-left border-b border-gray-200">
                  Email
                </th>
                <th className="p-[0.85rem_1rem] text-left border-b border-gray-200">
                  Ville
                </th>
                <th className="p-[0.85rem_1rem] text-left border-b border-gray-200">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProprietaires.map((proprietaire) => (
                <tr
                  key={proprietaire.ID_Proprietaire}
                  className="hover:bg-gray-50"
                >
                  <td className="p-[0.85rem_1rem] border-b border-gray-200">
                    {proprietaire.Raison_sociale} {proprietaire.Etablissement}
                  </td>
                  <td className="p-[0.85rem_1rem] border-b border-gray-200 hidden md:table-cell">
                    {proprietaire.Civilite_Proprietaire}
                  </td>
                  <td className="p-[0.85rem_1rem] border-b border-gray-200">
                    {proprietaire.Nom_Proprietaire}
                  </td>
                  <td className="p-[0.85rem_1rem] border-b border-gray-200 hidden md:table-cell">
                    {proprietaire.Prenom_Proprietaire}
                  </td>
                  <td className="p-[0.85rem_1rem] border-b border-gray-200">
                    {proprietaire.Email_Proprietaire}
                  </td>
                  <td className="p-[0.85rem_1rem] border-b border-gray-200">
                    {proprietaire.Ville_Proprietaire}
                  </td>
                  <td className="p-[0.85rem_1rem] border-b border-gray-200">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(proprietaire)}
                        className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() =>
                          deleteProprietaire(proprietaire.ID_Proprietaire)
                        }
                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Backdrop */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-45">
          {/* Modal */}
          <div className="w-[min(720px,100%)] max-h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="m-0">
                {editingId
                  ? "Modifier un propriétaire"
                  : "Ajouter un propriétaire"}
              </h2>
              <button
                onClick={closeForm}
                className="px-2 py-0.5 text-gray-500 bg-transparent rounded-md hover:bg-gray-100 transition-colors text-[1.5rem]"
                disabled={saving}
              >
                ×
              </button>
            </div>

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
                  <select
                    id="raisonSociale"
                    name="raisonSociale"
                    value={form.raisonSociale}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Particulier">Particulier</option>
                    <option value="Ecurie">Ecurie</option>
                    <option value="Asso">Association</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="etablissement"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Établissement
                  </label>
                  <input
                    type="text"
                    id="etablissement"
                    name="etablissement"
                    value={form.etablissement}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="civilite"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Civilité
                  </label>
                  <select
                    id="civilite"
                    name="civilite"
                    value={form.civilite}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    <option value="M">M.</option>
                    <option value="Mme">Mme</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="nom"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="prenom"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label
                    htmlFor="adresse"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Adresse <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="adresse"
                    name="adresse"
                    value={form.adresse}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="ville"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="ville"
                    name="ville"
                    value={form.ville}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="cp"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Code postal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="cp"
                    name="cp"
                    value={form.cp}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="tel"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="tel"
                    name="tel"
                    value={form.tel}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  {saving
                    ? "Enregistrement..."
                    : editingId
                      ? "Modifier"
                      : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
