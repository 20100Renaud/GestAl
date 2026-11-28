import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from "../api/auth.js";

const AuthContext = createContext(null);
const SessionTimerContext = createContext(null);

// --------------------------------------------------
// SESSION TIMER PROVIDER
// --------------------------------------------------

function SessionClockProvider({
  active,
  sessionExpiresAt,
  onExpire,
  children,
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!active || !sessionExpiresAt) return;

    setNow(Date.now());

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [active, sessionExpiresAt]);

  const sessionTimeLeft = sessionExpiresAt
    ? Math.max(0, Math.ceil((sessionExpiresAt - now) / 1000))
    : null;

  useEffect(() => {
    if (active && sessionTimeLeft === 0) {
      onExpire();
    }
  }, [active, sessionTimeLeft, onExpire]);

  const timerValue = useMemo(() => ({ sessionTimeLeft }), [sessionTimeLeft]);

  return (
    <SessionTimerContext.Provider value={timerValue}>
      {children}
    </SessionTimerContext.Provider>
  );
}

// --------------------------------------------------
// AUTH PROVIDER
// --------------------------------------------------

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const expirationHandled = useRef(false);

  // Vérification de l'authentification
  useEffect(() => {
    async function checkAuthentication() {
      // Temporaire
      try {
        const data = await getCurrentUser();
        console.log("Expiration session :", {
          expiresAt: data?.expiresAt,
          type: typeof data?.expiresAt,
          dateInterpreted: new Date(data?.expiresAt),
        });

        setUser(data?.user ?? null);
        setSessionExpiresAt(data?.user ? (data.expiresAt ?? null) : null);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
        setSessionExpiresAt(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuthentication();
  }, []);

  // Déconnexion automatique
  const expireSession = useCallback(async () => {
    if (expirationHandled.current) return;

    expirationHandled.current = true;

    try {
      await logoutRequest();
    } catch (error) {
      console.error("Automatic logout failed:", error);
    } finally {
      setUser(null);
      setSessionExpiresAt(null);
      setSessionExpired(true);
    }
  }, []);

  // Connexion
  const login = useCallback(async (email, password) => {
    expirationHandled.current = false;
    setSessionExpired(false);

    await loginRequest(email, password);

    const data = await getCurrentUser();
    const currentUser = data?.user ?? null;

    setUser(currentUser);
    setSessionExpiresAt(data?.expiresAt ?? null);

    return currentUser;
  }, []);

  // Déconnexion manuelle
  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      expirationHandled.current = false;
      setUser(null);
      setSessionExpiresAt(null);
      setSessionExpired(false);
    }
  }, []);

  // Valeur stable du contexte d'authentification
  const authValue = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      login,
      logout,
      sessionExpiresAt,
      sessionExpired,
      setSessionExpired,
    }),
    [user, loading, login, logout, sessionExpiresAt, sessionExpired],
  );

  return (
    <AuthContext.Provider value={authValue}>
      <SessionClockProvider
        active={user !== null}
        sessionExpiresAt={sessionExpiresAt}
        onExpire={expireSession}
      >
        {children}
      </SessionClockProvider>
    </AuthContext.Provider>
  );
}

// --------------------------------------------------
// AUTH HOOK
// --------------------------------------------------

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}

// --------------------------------------------------
// SESSION TIMER HOOK
// --------------------------------------------------

export function useSessionTimer() {
  const context = useContext(SessionTimerContext);

  if (!context) {
    throw new Error("useSessionTimer must be used inside an AuthProvider");
  }

  return context;
}
