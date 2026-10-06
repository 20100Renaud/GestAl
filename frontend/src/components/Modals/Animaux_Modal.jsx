import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Textarea from "../ui/Textarea.jsx";
import Modal from "../ui/Modal.jsx";
import ProprietaireOptions from "../ProprietaireOptions.jsx";
import {
  PawPrint,
  UserRound,
  CalendarDays,
  Ghost,
  VenusAndMars,
  Cat,
  ClipboardPen,
} from "lucide-react";

export default function AnimauxModal({
  open,
  editingId,
  form,
  proprietaires,
  saving,
  onClose,
  onSubmit,
  onChange,
  onDelete,
}) {
  return (
    <Modal
      open={open}
      title={editingId ? `Modifier ${form.Nom_Animal}` : `Ajouter un animal`}
      onClose={onClose}
    >
      {proprietaires.length === 0 ? (
        <div className="p-6">
          <p className="text-blue-900">
            Un propriétaire doit exister avant de pouvoir créer un animal.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              id="Proprietaire"
              label="Propriétaire"
              icon={UserRound}
              name="ID_Proprietaire"
              value={form.ID_Proprietaire}
              onChange={onChange}
              required
            >
              <option value="">Sélectionner</option>
              <ProprietaireOptions proprietaires={proprietaires} />
            </Select>

            <Input
              id="Nom_Animal"
              label="Nom"
              icon={PawPrint}
              type="text"
              name="Nom_Animal"
              value={form.Nom_Animal}
              onChange={onChange}
              required
            />

            <Select
              id="Genre_Animal"
              label="Genre"
              icon={Cat}
              name="Genre_Animal"
              value={form.Genre_Animal}
              onChange={onChange}
              required
            >
              <option value="">Sélectionner</option>
              <option value="Chien">Chien</option>
              <option value="Chat">Chat</option>
              <option value="Cheval">Cheval</option>
              <option value="Mouton">Mouton</option>
              <option value="Chèvre">Chèvre</option>
              <option value="Oiseaux">Oiseaux</option>
              <option value="NAC">NAC</option>
              <option value="Autre">Autre</option>
            </Select>

            <Input
              id="Race_Animal"
              label="Race"
              icon={Ghost}
              type="text"
              name="Race_Animal"
              value={form.Race_Animal}
              onChange={onChange}
            />

            <Input
              id="Date_Naissance_Animal"
              label="Date de naissance"
              icon={CalendarDays}
              type="date"
              name="Date_Naissance_Animal"
              value={form.Date_Naissance_Animal}
              onChange={onChange}
              required
            />

            <Select
              id="Sexe_Animal"
              label="Sexe"
              icon={VenusAndMars}
              name="Sexe_Animal"
              value={form.Sexe_Animal}
              onChange={onChange}
              required
            >
              <option value="">Sélectionner</option>
              <option value="Mâle">Mâle</option>
              <option value="Femelle">Femelle</option>
            </Select>

            <div className="md:col-span-2">
              <Textarea
                label="Notes"
                icon={ClipboardPen}
                name="Memo_Animal"
                value={form.Memo_Animal}
                onChange={onChange}
                rows="4"
              />
            </div>
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
      )}
    </Modal>
  );
}
