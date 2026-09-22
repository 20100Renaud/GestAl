import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Textarea from "../components/ui/Textarea.jsx";
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
  getAnimaux,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from "../api/animaux.js";

import { getProprietaires } from "../api/proprietaires.js";

const emptyForm = {
  ID_Proprietaire: "",
  Nom_Animal: "",
  Genre_Animal: "",
  Race_Animal: "",
  Date_Naissance_Animal: "",
  Memo_Animal: "",
  Sexe_Animal: "",
};

export default function Animaux() {
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

      const [animalsData, proprietairesData] = await Promise.all([
        getAnimaux(),
        getProprietaires(),
      ]);

      setAnimaux(animalsData);
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

  function openEditForm(animal) {
    setEditingId(animal.ID_Animal);

    setForm({
      ID_Proprietaire: animal.ID_Proprietaire ?? "",
      Nom_Animal: animal.Nom_Animal ?? "",
      Genre_Animal: animal.Genre_Animal ?? "",
      Race_Animal: animal.Race_Animal ?? "",
      Date_Naissance_Animal: animal.Date_Naissance_Animal ?? "",
      Sexe_Animal: animal.Sexe_Animal ?? "",
      Memo_Animal: animal.Memo_Animal ?? "",
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

  const filteredAnimaux = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return animaux;
    }

    return animaux.filter((animal) => {
      const proprietaire = animal.Proprietaire_Animal;

      const proprietaireName = proprietaire
        ? `${proprietaire.Prenom_Proprietaire} ${proprietaire.Nom_Proprietaire}`
        : "";

      return [
        animal.Nom_Animal,
        animal.Genre_Animal,
        animal.Race_Animal,
        animal.Sexe_Animal,
        proprietaireName,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [animaux, search]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await updateAnimal(editingId, form);
      } else {
        await createAnimal(form);
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
    if (!window.confirm("Supprimer cet animal ?")) {
      return;
    }

    try {
      setError("");

      await deleteAnimal(id);

      if (editingId === id) {
        closeForm();
      }

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function getProprietaireName(animal) {
    const proprietaire = animal.Proprietaire_Animal;

    if (!proprietaire) {
      return "—";
    }

    return `${proprietaire.Prenom_Proprietaire} ${proprietaire.Nom_Proprietaire}`;
  }

  return (
    <div className="w-full">
      {error && <Alert variant="error">{error}</Alert>}

      <PageHeader
        title="Gestion des Animaux"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un animal..."
        createLabel="Nouvel animal"
        onAction={openCreateForm}
      />

      {loading ? (
        <p>Chargement...</p>
      ) : filteredAnimaux.length === 0 ? (
        <Vide search={search} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Nom</TableHeader>
              <TableHeader>Genre</TableHeader>
              <TableHeader>Race</TableHeader>
              <TableHeader>Sexe</TableHeader>
              <TableHeader>Propriétaire</TableHeader>
            </TableRow>
          </TableHead>

          <tbody>
            {filteredAnimaux.map((animal) => (
              <TableRow
                key={animal.ID_Animal}
                onClick={() => openEditForm(animal)}
              >
                <TableCell>{animal.Nom_Animal}</TableCell>

                <TableCell>{animal.Genre_Animal}</TableCell>

                <TableCell>{animal.Race_Animal || "—"}</TableCell>

                <TableCell>{animal.Sexe_Animal || "—"}</TableCell>

                <TableCell>{getProprietaireName(animal)}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={showForm}
        title={editingId ? "Modifier l'animal" : "Ajouter un animal"}
        onClose={closeForm}
      >
        {proprietaires.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-600">
              Vous devez créer un propriétaire avant de pouvoir créer un animal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                id="Proprietaire"
                label="Propriétaire"
                name="ID_Proprietaire"
                value={form.ID_Proprietaire}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un propriétaire</option>

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

              <Input
                id="Nom_Animal"
                label="Nom"
                type="text"
                name="Nom_Animal"
                value={form.Nom_Animal}
                onChange={handleChange}
                required
              />

              <Input
                id="Genre_Animal"
                label="Genre"
                type="text"
                name="Genre_Animal"
                value={form.Genre_Animal}
                onChange={handleChange}
                required
              />

              <Input
                id="Race_Animal"
                label="Race"
                type="text"
                name="Race_Animal"
                value={form.Race_Animal}
                onChange={handleChange}
              />

              <Input
                id="Date_Naissance_Animal"
                label="Date de naissance"
                type="date"
                name="Date_Naissance_Animal"
                value={form.Date_Naissance_Animal}
                onChange={handleChange}
                required
              />

              <Select
                id="Sexe_Animal"
                label="Sexe"
                name="Sexe_Animal"
                value={form.Sexe_Animal}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner</option>
                <option value="Mâle">Mâle</option>
                <option value="Femelle">Femelle</option>
              </Select>

              <div className="md:col-span-2">
                <Textarea
                  label="Notes"
                  name="Memo_Animal"
                  value={form.Memo_Animal}
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
