import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        {/* Logo / application name */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">GestAL</h1>

          <p className="text-sm text-blue-500">
            Gestion de consultations animales
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-blue-900">Connexion</h2>

            <p className="mt-1 text-sm text-blue-500">Espace professionnel.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              label="E-mail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <Input
              id="password"
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-blue-400 cursor-pointer">CGU · Lun-e · Création de compte</p>
      </div>
    </main>
  );
}
