import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Alert from "../ui/Alert.jsx";
import Modal from "../ui/Modal.jsx";
import { CalendarDays, CircleEuro, ClipboardPen } from "lucide-react";

export default function DeplacementsModal({
  open,
  editingId,
  form,
  saving,
  error,
  onClose,
  onSubmit,
  onChange,
  onDelete,
}) {
  return (
    <Modal
      open={open}
      title={editingId ? "Modifier le déplacement" : "Ajouter un déplacement"}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="p-6">
        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Input
            id="Annee_Deplacement"
            label="Année"
            icon={CalendarDays}
            type="number"
            name="Annee_Deplacement"
            value={form.Annee_Deplacement}
            onChange={onChange}
            required
          />

          <Input
            id="Montant_Deplacement"
            label="Montant"
            icon={CircleEuro}
            type="number"
            name="Montant_Deplacement"
            value={form.Montant_Deplacement}
            onChange={onChange}
            min="0"
            step="1"
            suffix="€"
            required
          />

          <Input
            id="Denomination_Deplacement"
            label="Désignation"
            icon={ClipboardPen}
            type="text"
            name="Denomination_Deplacement"
            value={form.Denomination_Deplacement}
            onChange={onChange}
            className="col-span-2 md:col-span-1"
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
