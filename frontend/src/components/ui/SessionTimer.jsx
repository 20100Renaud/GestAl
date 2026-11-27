import { Clock } from "lucide-react";
import { useSessionTimer } from "../../context/AuthContext.jsx";

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export default function SessionTimer() {
  const { sessionTimeLeft } = useSessionTimer();

  if (sessionTimeLeft === null) return null;

  const urgent = sessionTimeLeft <= 120;

  return (
    <div
      className={`flex items-center gap-2 rounded-md px-3 py-1.5 ${
        urgent ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-800"
      }`}
    >
      <Clock size={15} className="shrink-0" />

      <span className="text-xs font-medium whitespace-nowrap">
        Session :
      </span>

      <span className="text-sm font-bold tabular-nums">
        {formatTime(sessionTimeLeft)}
      </span>
    </div>
  );
}
