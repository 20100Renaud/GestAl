import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import UsersModal from "../components/Modals/Users_Modal.jsx";

import Table, {
  Vide,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../components/ui/Table.jsx";

import { normalizeUpper, normalizeCamel } from "../utils/normalizeField.js";

import { getUsers, createUser, updateUser, deleteUser } from "../api/users.js";

const emptyForm = {
  Civilite_User: "",
  Nom_User: "",
  Prenom_User: "",
  Email_User: "",
  Pratique: "",
  Adresse_User: "",
  Ville_User: "",
  CP_User: "",
  Tel_User: "",
  Role_User: "CLIENT",
  password: "",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { notify, clearNotification } = useOutletContext();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getUsers();
      setUsers(data.users);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreateForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    clearNotification();
    setShowForm(true);
  }

  function openEditForm(user) {
    setEditingId(user.ID_User);

    setForm({
      ...emptyForm,
      Civilite_User: user.Civilite_User ?? "",
      Nom_User: user.Nom_User ?? "",
      Prenom_User: user.Prenom_User ?? "",
      Email_User: user.Email_User ?? "",
      Pratique: user.Pratique ?? "",
      Adresse_User: user.Adresse_User ?? "",
      Ville_User: user.Ville_User ?? "",
      CP_User: user.CP_User ?? "",
      Tel_User: user.Tel_User ?? "",
      Role_User: user.Role_User ?? "CLIENT",
      password: "",
    });

    clearNotification();
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleBlur(event) {
    const { name, value } = event.target;

    if (!value.trim()) {
      return;
    }

    const normalizers = {
      Prenom_User: normalizeCamel,
      Nom_User: normalizeUpper,
      Pratique: normalizeCamel,
      Ville_User: normalizeCamel,
      Email_User: (value) => value.trim().toLowerCase(),
    };

    const normalize = normalizers[name];

    if (!normalize) {
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: normalize(value),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      clearNotification();

      const payload = {
        Civilite_User: form.Civilite_User || null,
        Nom_User: normalizeUpper(form.Nom_User),
        Prenom_User: normalizeCamel(form.Prenom_User),
        Email_User: form.Email_User.trim().toLowerCase(),
        Pratique: form.Pratique.trim() ? normalizeCamel(form.Pratique) : null,
        Adresse_User: form.Adresse_User.trim() || null,
        Ville_User: form.Ville_User.trim()
          ? normalizeCamel(form.Ville_User)
          : null,
        CP_User: form.CP_User.trim() || null,
        Tel_User: form.Tel_User.trim() || null,
        Role_User: form.Role_User,
      };

      if (!editingId || form.password) {
        payload.Password_Hash_User = form.password;
      }

      const wasEditing = Boolean(editingId);

      if (wasEditing) {
        await updateUser(editingId, payload);
      } else {
        await createUser(payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      notify(
        wasEditing
          ? "Utilisateur modifié avec succès."
          : "Utilisateur créé avec succès.",
        "success",
      );

      await loadData();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    const name = `${user.Prenom_User} ${user.Nom_User}`.trim();

    if (
      !window.confirm(`Supprimer l'utilisateur ${name} (${user.Pratique}) ?`)
    ) {
      return;
    }

    try {
      clearNotification();

      await deleteUser(user.ID_User);

      notify("Utilisateur supprimé avec succès.", "success");

      if (editingId === user.ID_User) {
        closeForm();
      }

      await loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return users;

    return users.filter((user) =>
      [user.Nom_User, user.Prenom_User, user.Email_User, user.Pratique]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value)),
    );
  }, [users, search]);

  return (
    <div className="w-full">
      <PageHeader
        title={
          <>
            <span className="hidden md:inline">Gestion des Utilisateurs</span>
            <span className="md:hidden">Utilisateurs</span>
          </>
        }
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un utilisateur..."
        createLabel="Nouvel utilisateur"
        onAction={openCreateForm}
        className="mb-6"
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {filteredUsers.length} utilisateur
          {filteredUsers.length > 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-gray-500">
          Chargement des utilisateurs...
        </p>
      ) : filteredUsers.length === 0 ? (
        <Vide search={search} />
      ) : (
        <Table layout="fixed">
          <TableHead>
            <TableRow>
              <TableHeader className="w-[50%] md:w-auto">
                Utilisateur
              </TableHeader>
              <TableHeader className="hidden lg:table-cell">Email</TableHeader>
              <TableHeader>Pratique</TableHeader>
              <TableHeader className="hidden sm:table-cell">
                Date de création
              </TableHeader>
            </TableRow>
          </TableHead>

          <tbody>
            {filteredUsers.map((user) => (
              <TableRow key={user.ID_User} onClick={() => openEditForm(user)}>
                <TableCell className="w-[50%] md:w-auto min-w-0">
                  <div className="flex min-w-0 flex-col text-left">
                    <span className="truncate font-medium text-gray-900">
                      {user.Prenom_User} {user.Nom_User}
                    </span>

                    <span className="truncate text-xs text-gray-500">
                      {user.CP_User} - {user.Ville_User}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="hidden lg:table-cell truncate">
                  {user.Email_User}
                </TableCell>

                <TableCell>
                  <span className="block truncate">{user.Pratique || "-"}</span>
                </TableCell>

                <TableCell className="hidden sm:table-cell">
                  {user.Date_User
                    ? new Date(user.Date_User).toLocaleDateString("fr-FR")
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <UsersModal
        open={showForm}
        editingId={editingId}
        form={form}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onBlur={handleBlur}
        onDelete={handleDelete}
      />
    </div>
  );
}
