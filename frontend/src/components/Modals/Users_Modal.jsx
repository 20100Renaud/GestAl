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
            value={form.CP_User}
            onChange={onChange}
            disabled={saving}
          />

          {/* VILLE */}
          <Input
            id="Ville_User"
            name="Ville_User"
            label="Ville"
            value={form.Ville_User}
            onChange={onChange}
            onBlur={onBlur}
            disabled={saving}
          />

          {/* PASSWORD */}

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

            {editingId && (
              <p className="mt-1 text-xs text-blue-700">
                Laissez ce champ vide pour conserver le mot de passe actuel.
              </p>
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
