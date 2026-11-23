import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { CircleAlert } from "lucide-react";

export default function ErrorModal({
  open,
  message,
  onClose,
  title = "Une erreur est survenue",
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const requiresAuthentication = message
    ?.toLowerCase()
    .includes("authentication required");

  async function handleAction() {
    if (requiresAuthentication) {
      onClose();

      try {
        await logout();
      } catch (error) {
      }

      navigate("/login", { replace: true });
      return;
    }

    onClose();
  }

  return (
    <Modal
      open={open}
      title={requiresAuthentication ? "Connexion requise" : title}
      onClose={handleAction}
    >
      <div className="space-y-5 p-6">
        <div className="flex items-start gap-3">
          <CircleAlert
            size={24}
            className="shrink-0 text-red-600"
            aria-hidden="true"
          />

          <p className="text-sm text-blue-900">
            {requiresAuthentication
              ? "Pour des raisons de sécurité, une session de connexion n'est valable qu'une heure. Celle-ci a expiré."
              : message || "Une erreur inattendue est survenue."}
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleAction}>
            {requiresAuthentication ? "Se connecter" : "Fermer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
