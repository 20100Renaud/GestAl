import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProprietairesModal from "../components/Modals/Proprietaires_Modal.jsx";
import { normalizeUpper, normalizeCamel } from "../utils/normalizeField.js";
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
  raisonSociale: "Particulier",
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

      const normalizedForm = {
        ...form,
        nom: normalizeUpper(form.nom),
        prenom: normalizeCamel(form.prenom),
        ville: normalizeCamel(form.ville),
      };

      if (editingId) {
        await updateProprietaire(editingId, normalizedForm);
      } else {
        await createProprietaire(normalizedForm);
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
        title={
          <>
            <span className="hidden md:inline">Gestion des Propriétaires</span>
            <span className="md:hidden">Propriétaires</span>
          </>
        }
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Recherche par nom, e-mail, ville..."
        createLabel="Nouveau propriétaire"
        onAction={openCreateForm}
        className="mb-6"
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
              <TableHeader>Nom</TableHeader>
              <TableHeader className="hidden md:table-cell">Email</TableHeader>
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
                    .join(" ") || "-"}
                </TableCell>

                <TableCell>
                  {[
                    proprietaire.Civilite_Proprietaire,
                    proprietaire.Prenom_Proprietaire,
                    proprietaire.Nom_Proprietaire,
                  ]
                    .filter(Boolean)
                    .join(" ") || "-"}
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  {proprietaire.Email_Proprietaire || "-"}
                </TableCell>

                <TableCell>{proprietaire.Ville_Proprietaire || "-"}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <ProprietairesModal
        open={showForm}
        editingId={editingId}
        form={form}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onDelete={handleDelete}
      />
    </div>
  );
}
