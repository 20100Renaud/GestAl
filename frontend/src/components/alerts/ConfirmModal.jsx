import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Annuler",
  onConfirm,
  onClose,
  type,
  loading,
}) {
  if (type === "clearZonages") {
    title ??= "Désélectionner tous les zonages";
    message ??=
      `Attention : vous êtes sur le point de désélectionner tous les zonages.

      Cette action est irréversible.
      Voulez-vous continuer ?`;
    confirmLabel ??= "Oui, tout désélectionner";
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start gap-2">
          <AlertTriangle
            size={40}
            className="-mt-2 shrink-0 text-orange-500"
          />

          <p className="text-blue-900 whitespace-pre-line">{message}</p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Traitement..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
