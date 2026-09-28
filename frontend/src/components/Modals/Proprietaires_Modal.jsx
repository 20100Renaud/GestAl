import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Modal from "../ui/Modal.jsx";
import {
  Warehouse,
  BuildingComplex,
  UserRound,
  UserRoundGroup,
  Mail,
  User,
  MapPin,
  MapPinned,
  Hash,
  Phone,
} from "lucide-react";

export default function ProprietairesModal({
  open,
  editingId,
  form,
  saving,
  onClose,
  onSubmit,
  onChange,
  onDelete,
}) {
  return (
    <Modal
      open={open}
      title={editingId ? "Modifier le propriétaire" : "Ajouter un propriétaire"}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            id="raisonSociale"
            label="Raison sociale"
            icon={BuildingComplex}
            name="raisonSociale"
            value={form.raisonSociale}
            onChange={onChange}
            required
          >
            <option value="Particulier">Particulier</option>
            <option value="Ecurie">Ecurie</option>
            <option value="Asso">Association</option>
          </Select>

          <Input
            id="etablissement"
            label="Établissement"
            icon={Warehouse}
            type="text"
            name="etablissement"
            value={form.etablissement}
            onChange={onChange}
          />

          <Select
            id="civilite"
            label="Civilité"
            icon={UserRoundGroup}
            name="civilite"
            value={form.civilite}
            onChange={onChange}
          >
            <option value="">Sélectionner</option>
            <option value="M.">M.</option>
            <option value="Mme.">Mme.</option>
          </Select>

          <Input
            id="nom"
            label="Nom"
            icon={UserRound}
            type="text"
            name="nom"
            value={form.nom}
            onChange={onChange}
            className="uppercase"
            required
          />

          <Input
            id="prenom"
            label="Prénom"
            icon={User}
            type="text"
            name="prenom"
            value={form.prenom}
            onChange={onChange}
            className="capitalize"
            required
          />

          <Input
            id="email"
            label="Email"
            icon={Mail}
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className="lowercase"
            required
          />

          <div className="md:col-span-2">
            <Input
              id="adresse"
              label="Adresse"
              icon={MapPin}
              type="text"
              name="adresse"
              value={form.adresse}
              onChange={onChange}
              required
            />
          </div>

          <Input
            id="ville"
            label="Ville"
            icon={MapPinned}
            type="text"
            name="ville"
            value={form.ville}
            onChange={onChange}
            className="capitalize"
            required
          />

          <Input
            id="cp"
            label="Code postal"
            icon={Hash}
            type="text"
            name="cp"
            value={form.cp}
            onChange={onChange}
            required
          />

          <Input
            id="tel"
            label="Téléphone"
            icon={Phone}
            type="tel"
            name="tel"
            value={form.tel}
            onChange={onChange}
            required
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div>
            {editingId && (
              <Button
                type="button"
                variant="danger"
                onClick={() => onDelete(editingId)}
                disabled={saving}
              >
                Supprimer
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
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
    </Modal>
  );
}
