import { useEffect, useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import UsersModal from "../Modals/Users_Modal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyProfile, updateMyProfile } from "../../api/users.js";
import { normalizeUpper, normalizeCamel } from "../../utils/normalizeField.js";
import Alert from "../ui/Alert.jsx";

const emptyProfile = {
  ID_User: "",
  Civilite_User: "",
  Nom_User: "",
  Prenom_User: "",
  Email_User: "",
  Pratique: "",
  Adresse_User: "",
  Ville_User: "",
  CP_User: "",
  Tel_User: "",
  password: "",
};

export default function DashboardLayout() {
  const { user } = useAuth();

  const [showProfile, setShowProfile] = useState(false);
  const [form, setForm] = useState(emptyProfile);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const notify = useCallback((message, variant = "success") => {
    setNotification({ message, variant });
  }, []);

  function clearNotification() {
    setNotification(null);
  }

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [notification]);

  async function openProfile() {
    setShowProfile(true);
    setLoadingProfile(true);
    setProfileError("");

    try {
      const data = await getMyProfile();
      const profile = data.user;

      setForm({
        ID_User: profile.ID_User,
        Civilite_User: profile.Civilite_User ?? "",
        Nom_User: profile.Nom_User ?? "",
        Prenom_User: profile.Prenom_User ?? "",
        Email_User: profile.Email_User ?? "",
        Pratique: profile.Pratique ?? "",
        Adresse_User: profile.Adresse_User ?? "",
        Ville_User: profile.Ville_User ?? "",
        CP_User: profile.CP_User ?? "",
        Tel_User: profile.Tel_User ?? "",
        password: "",
      });
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoadingProfile(false);
    }
  }

  function closeProfile() {
    if (saving) return;

    setShowProfile(false);
    setProfileError("");
  }

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleProfileBlur(event) {
    const { name, value } = event.target;

    if (!value.trim()) return;

    const normalizers = {
      Prenom_User: normalizeCamel,
      Nom_User: normalizeUpper,
      Pratique: normalizeCamel,
      Ville_User: normalizeCamel,
      Email_User: (value) => value.trim().toLowerCase(),
    };

    const normalize = normalizers[name];

    if (normalize) {
      setForm((current) => ({
        ...current,
        [name]: normalize(value),
      }));
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setProfileError("");

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
      };

      if (form.password) {
        payload.Password_Hash_User = form.password;
      }

      await updateMyProfile(payload);

      setShowProfile(false);
      notify("Votre profil a été mis à jour.", "success");
      setSidebarOpen(false);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar onOpenProfile={openProfile} />
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`relative z-10 h-full w-[240px] transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            onNavigate={() => setSidebarOpen(false)}
            onOpenProfile={openProfile}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <Topbar onMenuClick={() => setSidebarOpen((open) => !open)} />

        <main className="p-8">
          <Outlet
            context={{
              notify,
              clearNotification,
            }}
          />
        </main>
      </div>

      {notification && (
        <div className="fixed bottom-0 left-0 right-0 z-[70] bg-gray-900/10 px-4 py-5 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] md:left-[240px]">
          <div className="mx-auto w-[min(90vw,600px)]">
            <Alert variant={notification.variant}>{notification.message}</Alert>
          </div>
        </div>
      )}

      {showProfile && (
        <>
          {loadingProfile ? (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
              <p className="rounded-lg bg-white p-6">
                Chargement de votre profil...
              </p>
            </div>
          ) : (
            <UsersModal
              open={showProfile}
              editingId={form.ID_User}
              form={form}
              saving={saving}
              profileMode
              onClose={closeProfile}
              onSubmit={handleProfileSubmit}
              onChange={handleProfileChange}
              onBlur={handleProfileBlur}
              onDelete={() => {}}
            />
          )}
        </>
      )}
    </div>
  );
}
