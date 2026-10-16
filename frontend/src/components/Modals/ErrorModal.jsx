import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { CircleAlert } from "lucide-react";

export default function ErrorModal({
  open,
  message,
  onClose,
  title = "Une erreur est survenue",
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-5 p-6">
        <div className="flex items-start gap-3">
          <CircleAlert
            size={24}
            className="shrink-0 text-red-600"
            aria-hidden="true"
          />

          <p className="text-sm text-blue-900">
            {message || "Une erreur inattendue est survenue."}
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </Modal>
  );
}
