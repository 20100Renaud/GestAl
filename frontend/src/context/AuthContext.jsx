import { createContext, useContext, useEffect, useRef, useState } from "react";

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [sessionExpired, setSessionExpired] = useState(false);

  const expirationHandled = useRef(false);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const data = await getCurrentUser();

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

  // Mise à jour du temps restant
  useEffect(() => {
    if (!user || !sessionExpiresAt) return;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [user, sessionExpiresAt]);

  const sessionTimeLeft = sessionExpiresAt
    ? Math.max(0, Math.ceil((sessionExpiresAt - now) / 1000))
    : null;

  // Déconnexion automatique à expiration
  useEffect(() => {
    if (
      !user ||
      !sessionExpiresAt ||
      sessionTimeLeft === null ||
      sessionTimeLeft > 0 ||
      expirationHandled.current
    ) {
      return;
    }

    expirationHandled.current = true;

    async function expireSession() {
      try {
        await logoutRequest();
      } catch (error) {
        console.error("Automatic logout failed:", error);
      } finally {
        setUser(null);
        setSessionExpiresAt(null);
        setSessionExpired(true);
      }
    }

    expireSession();
  }, [user, sessionExpiresAt, sessionTimeLeft]);

  async function login(email, password) {
    expirationHandled.current = false;
    setSessionExpired(false);

    await loginRequest(email, password);

    const data = await getCurrentUser();
    const currentUser = data?.user ?? null;

    setUser(currentUser);
    setSessionExpiresAt(data?.expiresAt ?? null);
    setNow(Date.now());

    return currentUser;
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      expirationHandled.current = false;
      setUser(null);
      setSessionExpiresAt(null);
      setSessionExpired(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user !== null,
        login,
        logout,
        sessionExpiresAt,
        sessionTimeLeft,
        sessionExpired,
        setSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
