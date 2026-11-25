import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  open,
  title = "Demande de confirmation",
  message = "Demande de confirmation",
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  onClose,
  type,
  loading,
  hideConfirm = false,
}) {
  if (type === "clearZonages") {
    title = "Désélectionner tous les zonages";
    message = `Attention :  tous les zonages vont être désélectionnés.`;
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start gap-2">
          <AlertTriangle size={40} className="-mt-2 shrink-0 text-orange-500" />

          <p className="text-blue-900 whitespace-pre-line">{message}</p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {!hideConfirm && (
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
          )}

          <Button
            type="button"
            variant={hideConfirm ? "secondary" : "danger"}
            onClick={hideConfirm ? onClose : onConfirm}
            disabled={loading}
          >
            {hideConfirm ? "Compris" : loading ? "Traitement..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
