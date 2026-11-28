import { useEffect, useState } from "react";
import { useSessionTimer } from "../../context/AuthContext.jsx";
import SessionExpirationBanner from "./SessionExpirationBanner.jsx";

const SESSION_WARNING_TIME = 120;
const SESSION_URGENT_TIME = 30;

export default function SessionExpirationNotice({ onLogout }) {
  const { sessionTimeLeft } = useSessionTimer();
  const [warningDismissed, setWarningDismissed] = useState(false);

  const showSessionWarning =
    sessionTimeLeft !== null &&
    sessionTimeLeft > 0 &&
    ((!warningDismissed && sessionTimeLeft <= SESSION_WARNING_TIME) ||
      sessionTimeLeft <= SESSION_URGENT_TIME);

  useEffect(() => {
    if (sessionTimeLeft === null || sessionTimeLeft > SESSION_WARNING_TIME) {
      setWarningDismissed(false);
    }
  }, [sessionTimeLeft]);

  if (!showSessionWarning) return null;

  return (
    <SessionExpirationBanner
      timeLeft={sessionTimeLeft}
      onLogout={onLogout}
      onClose={() => setWarningDismissed(true)}
    />
  );
}
