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

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function startEdit(animal) {
    setEditingId(animal.ID_Animal);

    setForm({
      ID_Proprietaire: animal.ID_Proprietaire,
      Nom_Animal: animal.Nom_Animal,
      Genre_Animal: animal.Genre_Animal,
      Race_Animal: animal.Race_Animal || "",
      Date_Naissance_Animal: animal.Date_Naissance_Animal
        ? animal.Date_Naissance_Animal.slice(0, 10)
        : "",
      Memo_Animal: animal.Memo_Animal || "",
      Sexe_Animal: animal.Sexe_Animal,
    });

    setError("");
  }

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
      resetForm();
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
        resetForm();
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

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="page">
      <PageHeader title="Animaux" />

      {error && <Alert variant="error">{error}</Alert>}

      <div className="content-grid">
        <Card title={editingId ? "Modifier l'animal" : "Nouvel animal"}>
          <form onSubmit={handleSubmit}>
            <label>
              Propriétaire
              <Select
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
            </label>

            <label>
              Nom
              <Input
                type="text"
                name="Nom_Animal"
                value={form.Nom_Animal}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Genre
              <Input
                type="text"
                name="Genre_Animal"
                value={form.Genre_Animal}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Race
              <Input
                type="text"
                name="Race_Animal"
                value={form.Race_Animal}
                onChange={handleChange}
              />
            </label>

            <label>
              Date de naissance
              <Input
                type="date"
                name="Date_Naissance_Animal"
                value={form.Date_Naissance_Animal}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Sexe
              <Select
                name="Sexe_Animal"
                value={form.Sexe_Animal}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner</option>
                <option value="Mâle">Mâle</option>
                <option value="Femelle">Femelle</option>
              </Select>
            </label>

            <Textarea
              label="Notes"
              name="Memo_Animal"
              value={form.Memo_Animal}
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

        <Card title="Liste des animaux">
          {animaux.length === 0 ? (
            <p>Aucun animal.</p>
          ) : (
            <div className="table-container">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Nom</TableHeader>
                    <TableHeader>Genre</TableHeader>
                    <TableHeader>Race</TableHeader>
                    <TableHeader>Sexe</TableHeader>
                    <TableHeader>Propriétaire</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>

                <tbody>
                  {animaux.map((animal) => (
                    <TableRow key={animal.ID_Animal}>
                      <TableCell>{animal.Nom_Animal}</TableCell>
                      <TableCell>{animal.Genre_Animal}</TableCell>
                      <TableCell>{animal.Race_Animal || "-"}</TableCell>
                      <TableCell>{animal.Sexe_Animal}</TableCell>
                      <TableCell>{getProprietaireName(animal)}</TableCell>

                      <TableCell>
                        <Button type="button" onClick={() => startEdit(animal)}>
                          Modifier
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleDelete(animal.ID_Animal)}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
