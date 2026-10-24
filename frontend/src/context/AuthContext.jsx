import { createContext, useContext, useEffect, useState } from "react";

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const data = await getCurrentUser();
        setUser(data?.user ?? null);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuthentication();
  }, []);

  async function login(email, password) {

    await loginRequest(email, password);

    const data = await getCurrentUser();
    const currentUser = data?.user ?? null;

    if (!currentUser) {
      setUser(null);
      throw new Error(
        "Login succeeded, but the authenticated session could not be loaded.",
      );
    }

    setUser(currentUser);

    return currentUser;
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
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
