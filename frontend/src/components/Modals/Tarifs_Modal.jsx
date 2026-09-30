import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Alert from "../ui/Alert.jsx";
import Modal from "../ui/Modal.jsx";
import { CalendarDays, CircleEuro, ClipboardPen } from "lucide-react";

export default function TarifsModal({
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
      title={editingId ? "Modifier le tarif" : "Ajouter un tarif"}
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
            id="Annee_Tarif"
            label="Année"
            icon={CalendarDays}
            type="number"
            name="Annee_Tarif"
            value={form.Annee_Tarif}
            onChange={onChange}
            min="2000"
            max="2100"
            step="1"
            required
          />

          <Input
            id="Denomination_Tarif"
            label="Désignation"
            icon={ClipboardPen}
            type="text"
            name="Denomination_Tarif"
            value={form.Denomination_Tarif}
            onChange={onChange}
            className="col-span-2 md:col-span-1"
            required
          />

          <Input
            id="Montant_Tarif"
            label="Montant"
            icon={CircleEuro}
            type="number"
            name="Montant_Tarif"
            value={form.Montant_Tarif}
            onChange={onChange}
            min="0"
            step="1"
            suffix="€"
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
