import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/ui/PageHeader.jsx";
import ZonageModal from "../components/Modals/Zonages_Modal.jsx";
import Alert from "../components/ui/Alert.jsx";
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

const getTechniqueColor = (technique) =>
  techniqueColors[technique] ?? "bg-gray-500";

export default function Zonages() {
  const [zonages, setZonages] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadZonages() {
    try {
      setLoading(true);
      setError("");

      const data = await getZonages();

      setZonages(data);
    } catch (err) {
      setError(err.message);
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
        <p className="text-sm text-gray-500">
          {filteredZonages.length} résultat
          {filteredZonages.length > 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : filteredZonages.length === 0 ? (
        <Vide search={search} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Intitulé</TableHeader>
            </TableRow>
          </TableHead>

          <tbody>
            {filteredZonages.map((zonage) => (
              <TableRow
                key={zonage.ID_Zonage}
                onClick={() => openEditForm(zonage)}
              >
                <TableCell className="">
                  <div className="grid grid-cols-[7.5rem_5rem_5rem] md:grid-cols-[7.5rem_5rem_5rem_5rem] items-center text-md font-medium text-blue-900 ">
                    <div className="text-left">{getZonageLabel(zonage)}</div>

                    <div>
                      {zonage.Technique_Zonage && (
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs text-white w-20 text-center ${getTechniqueColor(
                            zonage.Technique_Zonage,
                          )}`}
                        >
                          {zonage.Technique_Zonage}
                        </span>
                      )}
                    </div>

                    <div />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
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
    </div>
  );
}
