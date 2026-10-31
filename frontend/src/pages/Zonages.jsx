import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/ui/PageHeader.jsx";
import ZonageModal from "../components/modals/Zonages_Modal.jsx";
import ErrorModal from "../components/modals/ErrorModal.jsx";
import { CardZonage } from "../components/ui/Card.jsx";
import {
  getZonages,
  createZonage,
  updateZonage,
  deleteZonage,
} from "../api/zonages.js";

const emptyForm = {
  Nom_Zonage: "",
  Position_Zonage: "",
  Orientation_Zonage: "",
  Technique_Zonage: "",
};

const techniqueColors = {
  Articulaire: "bg-green-600",
  Tissulaire: "bg-blue-600",
  Viscérale: "bg-purple-600",
};

export default function Zonages() {
  const [zonages, setZonages] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  async function loadZonages() {
    try {
      setLoading(true);
      setError("");

      const data = await getZonages();

      setZonages(data);
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadZonages();
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
      Nom_Zonage: zonage.Nom_Zonage ?? "",
      Position_Zonage: zonage.Position_Zonage ?? "",
      Orientation_Zonage: zonage.Orientation_Zonage ?? "",
      Technique_Zonage: zonage.Technique_Zonage ?? "",
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

  function getZonageLabel(zonage) {
    return `${zonage.Nom_Zonage ?? ""}${
      zonage.Position_Zonage ? `${zonage.Position_Zonage}` : ""
    }${zonage.Orientation_Zonage ? `-${zonage.Orientation_Zonage}` : ""}`;
  }

  const filteredZonages = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return zonages;
    }

    return zonages.filter((zonage) => {
      return [
        getZonageLabel(zonage),
        zonage.Nom_Zonage,
        zonage.Position_Zonage,
        zonage.Orientation_Zonage,
        zonage.Technique_Zonage,
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

      await loadZonages();
      closeForm();
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
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

      await loadZonages();
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
    }
  }

  return (
    <div className="w-full">
      <PageHeader
        title={
          <>
            <span className="hidden md:inline">Gestion des Zonages</span>
            <span className="md:hidden">Zonages</span>
          </>
        }
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un zonage..."
        createLabel="Nouveau zonage"
        onAction={openCreateForm}
        className="mb-6"
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-blue-900">
          {filteredZonages.length} résultat
          {filteredZonages.length > 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <p className="py-8 text-center text-blue-700">
          Chargement des zonages...
        </p>
      ) : filteredZonages.length === 0 ? (
        <Vide search={search} />
      ) : (
        <div
          className="flex
            flex-wrap w-full justify-center
            gap-1
          "
        >
          {filteredZonages.map((zonage) => (
            <CardZonage
              key={zonage.ID_Zonage}
              title={getZonageLabel(zonage)}
              technique={zonage.Technique_Zonage}
              onClick={() => openEditForm(zonage)}
            />
          ))}
        </div>
      )}

      <ZonageModal
        open={showForm}
        editingId={editingId}
        form={form}
        saving={saving}
        error={error}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={closeForm}
        onDelete={handleDelete}
      />

      <ErrorModal
        open={showErrorModal}
        message={error}
        onClose={() => {
          setShowErrorModal(false);
          setError("");
        }}
      />
    </div>
  );
}
