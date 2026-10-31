import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, SearchX } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const defaultPath = user?.role === "ADMIN" ? "/users" : "/dashboard";

  function handleHome() {
    navigate(isAuthenticated ? defaultPath : "/login", {
      replace: true,
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-50 px-4 py-10">
      <div className="w-full max-w-xl text-center">

        <h1 className="text-8xl sm:text-9xl font-bold tracking-tight text-blue-900">
          404
        </h1>

        <h2 className="mt-4 text-xl sm:text-2xl font-semibold text-blue-800">
          Oups ! Page introuvable
        </h2>

        <p className="mt-4 text-sm sm:text-base leading-relaxed text-blue-600">
          La page que vous recherchez n'existe pas, a été déplacée ou n'est plus
          disponible.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button onClick={() => navigate(-1)} variant="clear_blue">
            <ArrowLeft size={17} className="mr-2" />
            Page précédente
          </Button>

          <Button onClick={handleHome}>
            <Home size={17} className="mr-2" />
            Retour à l'accueil
          </Button>
        </div>

        {/* Pied de page */}
        <p className="mt-12 text-xs text-blue-400">
          Erreur 404 · Page introuvable
        </p>
      </div>
    </main>
  );
}
