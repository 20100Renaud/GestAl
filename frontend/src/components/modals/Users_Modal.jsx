import { useState } from "react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Modal from "../ui/Modal.jsx";

import {
  UserRound,
  Mail,
  BriefcaseBusiness,
  MapPin,
  Phone,
  LockKeyhole,
  Contact,
  MapPinned,
  Hash,
  Building2,
  ArrowLeftRight,
} from "lucide-react";

export default function UsersModal({
  open,
  editingId,
  form,
  saving,
  onClose,
  onSubmit,
  onChange,
  onBlur,
  onDelete,
  profileMode = false,
}) {
  const [siretMode, setSiretMode] = useState("siret");
  const [siretFocused, setSiretFocused] = useState(false);
  const [siretTouched, setSiretTouched] = useState(false);
  const siretDigits = (form.Siret_User || "").replace(/\D/g, "");
  const siretInvalid = siretDigits.length > 0 && siretDigits.length !== 14;

  const formatSiret = (value, mode = "siret") => {
    const digits = value.replace(/\D/g, "").slice(0, 14);

    if (mode === "siren") {
      return digits.slice(0, 9).replace(/(\d{3})(?=\d)/g, "$1 ");
    }

    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,5})$/, (_, a, b, c, d) =>
      [a, b, c, d].filter(Boolean).join(" "),
    );
  };

  return (
    <Modal
      open={open}
      title={
        profileMode
          ? "Mon profil"
          : editingId
            ? "Modifier l'utilisateur"
            : "Ajouter un utilisateur"
      }
      onClose={onClose}
      showSessionTimer={profileMode}
    >
      <form onSubmit={onSubmit} className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* CIVILITE */}
          <Select
            id="Civilite_User"
            name="Civilite_User"
            label="Civilité"
            icon={Contact}
            value={form.Civilite_User}
            onChange={onChange}
            disabled={saving}
          >
            <option value="">Sélectionner</option>
            <option value="M.">M.</option>
            <option value="Mme.">Mme.</option>
          </Select>

          {/* NOM */}
          <Input
            id="Nom_User"
            name="Nom_User"
            label="Nom"
            icon={UserRound}
            value={form.Nom_User}
            onChange={onChange}
            onBlur={onBlur}
            required
            disabled={saving}
          />

          {/* PRENOM */}
          <Input
            id="Prenom_User"
            name="Prenom_User"
            label="Prénom"
            icon={UserRound}
            value={form.Prenom_User}
            onChange={onChange}
            onBlur={onBlur}
            required
            disabled={saving}
          />

          {/* EMAIL */}
          <Input
            id="Email_User"
            name="Email_User"
            label="Adresse email"
            icon={Mail}
            type="email"
            value={form.Email_User}
            onChange={onChange}
            onBlur={onBlur}
            required
            disabled={saving}
          />

          {/* PRATIQUE */}
          <Input
            id="Pratique"
            name="Pratique"
            label="Pratique"
            icon={BriefcaseBusiness}
            value={form.Pratique}
            onChange={onChange}
            onBlur={onBlur}
            disabled={saving}
          />

          {/* TELEPHONE */}
          <Input
            id="Tel_User"
            name="Tel_User"
            label="Téléphone"
            icon={Phone}
            type="tel"
            value={form.Tel_User}
            onChange={onChange}
            disabled={saving}
          />

          {/* ADRESSE */}
          <Input
            id="Adresse_User"
            name="Adresse_User"
            label="Adresse"
            icon={MapPin}
            value={form.Adresse_User}
            onChange={onChange}
            disabled={saving}
          />

          {/* CODE POSTAL */}
          <Input
            id="CP_User"
            name="CP_User"
            label="Code postal"
            icon={Hash}
            value={form.CP_User}
            onChange={onChange}
            disabled={saving}
          />

          {/* VILLE */}
          <Input
            id="Ville_User"
            name="Ville_User"
            label="Ville"
            icon={MapPinned}
            value={form.Ville_User}
            onChange={onChange}
            onBlur={onBlur}
            disabled={saving}
          />

          {/* SIRET / SIREN */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="Siret_User"
                className="flex items-center gap-2 text-sm font-semibold text-blue-700"
              >
                <Building2 size={18} />
                {siretMode === "siret" ? "SIRET" : "SIREN"}
              </label>

              <Button
                variant="badge_Mini_blue"
                onClick={() =>
                  setSiretMode((prev) => (prev === "siret" ? "siren" : "siret"))
                }
                disabled={saving}
                className="w-16 !px-1 !py-0 flex justify-start gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                title={
                  siretMode === "siret"
                    ? "Afficher uniquement le SIREN"
                    : "Revenir au SIRET complet"
                }
              >
                <ArrowLeftRight size={14} />
                {siretMode === "siret" ? <>SIREN</> : <>SIRET</>}
              </Button>
            </div>

            <Input
              id="Siret_User"
              name="Siret_User"
              type="text"
              value={formatSiret(form.Siret_User || "", siretMode)}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");

                onChange({
                  target: {
                    name: "Siret_User",
                    value: digits.slice(0, 14),
                  },
                });
              }}
              onFocus={() => setSiretFocused(true)}
              onBlur={() => {
                setSiretFocused(false);
                setSiretTouched(true);
              }}
              placeholder={
                siretFocused
                  ? ""
                  : siretMode === "siret"
                    ? "123 456 789 00012"
                    : "123 456 789"
              }
              maxLength={siretMode === "siret" ? 17 : 11}
              disabled={saving}
              className="placeholder:text-gray-400"
            />

            {siretInvalid && siretTouched && !siretFocused && (
              <p className="absolute left-0 top-full mt-1 text-xs text-red-600">
                Le SIRET doit contenir exactement 14 chiffres.
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="space-y-1">
            <Input
              id="password"
              name="password"
              label={
                editingId ? "Nouveau mot de passe (facultatif)" : "Mot de passe"
              }
              icon={LockKeyhole}
              type="password"
              value={form.password}
              onChange={onChange}
              required={!editingId}
              disabled={saving}
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          {editingId && (
            <div className="flex items-end">
              <p className="text-xs text-blue-700">
                Laissez ce champ vide pour conserver le mot de passe actuel.
              </p>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <div>
            {editingId && !profileMode && (
              <Button
                type="button"
                variant="danger"
                onClick={() =>
                  onDelete(
                    form.ID_User ? form : { ...form, ID_User: editingId },
                  )
                }
                disabled={saving}
              >
                Supprimer
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
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
    </Modal>
  );
}
