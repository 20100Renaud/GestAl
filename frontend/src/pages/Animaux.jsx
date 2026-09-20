import { useEffect, useState } from "react";

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
      <div className="page-header">
        <div>
          <h1>Animaux</h1>
          <p>Gestion des animaux</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="content-grid">
        <section className="card">
          <h2>{editingId ? "Modifier l'animal" : "Nouvel animal"}</h2>

          <form onSubmit={handleSubmit}>
            <label>
              Propriétaire
              <select
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
              </select>
            </label>

            <label>
              Nom
              <input
                type="text"
                name="Nom_Animal"
                value={form.Nom_Animal}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Genre
              <input
                type="text"
                name="Genre_Animal"
                value={form.Genre_Animal}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Race
              <input
                type="text"
                name="Race_Animal"
                value={form.Race_Animal}
                onChange={handleChange}
              />
            </label>

            <label>
              Date de naissance
              <input
                type="date"
                name="Date_Naissance_Animal"
                value={form.Date_Naissance_Animal}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Sexe
              <select
                name="Sexe_Animal"
                value={form.Sexe_Animal}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner</option>
                <option value="Mâle">Mâle</option>
                <option value="Femelle">Femelle</option>
              </select>
            </label>

            <label>
              Notes
              <textarea
                name="Memo_Animal"
                value={form.Memo_Animal}
                onChange={handleChange}
                rows="4"
              />
            </label>

            <div className="form-actions">
              <button type="submit" disabled={saving}>
                {saving
                  ? "Enregistrement..."
                  : editingId
                    ? "Modifier"
                    : "Créer"}
              </button>

              {editingId && (
                <button type="button" onClick={resetForm}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card">
          <h2>Liste des animaux</h2>

          {animaux.length === 0 ? (
            <p>Aucun animal.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Genre</th>
                    <th>Race</th>
                    <th>Sexe</th>
                    <th>Propriétaire</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {animaux.map((animal) => (
                    <tr key={animal.ID_Animal}>
                      <td>{animal.Nom_Animal}</td>
                      <td>{animal.Genre_Animal}</td>
                      <td>{animal.Race_Animal || "—"}</td>
                      <td>{animal.Sexe_Animal}</td>
                      <td>{getProprietaireName(animal)}</td>

                      <td>
                        <button type="button" onClick={() => startEdit(animal)}>
                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(animal.ID_Animal)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
