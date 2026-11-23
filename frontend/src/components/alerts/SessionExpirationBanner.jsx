import { Clock, LogOut } from "lucide-react";
import Button from "../ui/Button.jsx";

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export default function SessionExpirationBanner({
  timeLeft,
  onLogout,
  onClose,
}) {
  const urgent = timeLeft <= 30;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-0 bottom-0 z-[100] border-b shadow-md ${
        urgent ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
      }`}
    >
      <div className="flex flex-col px-4 py-1 sm:flex-row sm:items-center sm:justify-between">
        {/* Message et compteur */}
        <div className="flex items-center justify-center gap-2 min-w-0">
          <Clock
            size={18}
            className={`shrink-0 ${urgent ? "text-red-600" : "text-blue-600"}`}
          />

          <p
            className={`text-xs sm:text-sm font-medium ${
              urgent ? "text-red-800" : "text-blue-900"
            }`}
          >
            Cette session va expirer dans
          </p>

          <span
            className={`text-lg font-bold tabular-nums ${
              urgent ? "text-red-600" : "text-blue-700"
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={urgent ? "danger" : "primary"}
            onClick={onLogout}
            className="gap-2 whitespace-nowrap !px-3 !py-1.5 text-xs"
          >
            <LogOut size={15} />
            Se reconnecter
          </Button>

          <Button
            variant="danger_clear"
            onClick={onClose}
            className="whitespace-nowrap !px-3 !py-1.5 text-xs"
          >
            Masquer
          </Button>
        </div>
      </div>
    </div>
  );
}
