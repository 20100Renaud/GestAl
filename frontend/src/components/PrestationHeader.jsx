import { getProprietaireLabel } from "./ProprietaireOptions.jsx";
import {
  UserRound,
  CalendarDays,
  House,
  Warehouse,
  ExternalLink,
} from "lucide-react";

export default function PrestationHeader({
  prestation,
  className = "",
  onClick,
}) {
  return (
    <div
      className={`relative flex justify-around gap-3 rounded-md border border-blue-200 bg-blue-100 p-4 text-center text-sm text-blue-700 shadow-lg ${className}`}
    >
      <p className="flex flex-col items-center">
        <span className="font-medium">
          <CalendarDays />
        </span>

        {prestation?.Date_Prestation
          ? new Date(prestation.Date_Prestation).toLocaleDateString("fr-FR")
          : "-"}
      </p>

      <p className="flex flex-col items-center">
        <span className="font-medium">
          <UserRound />
        </span>

        {prestation?.Proprietaire_Prestation
          ? getProprietaireLabel(prestation.Proprietaire_Prestation)
          : "Propriétaire inconnu"}
      </p>

      <p className="flex flex-col items-center">
        <span className="font-medium">
          {prestation?.ID_Proprietaire === prestation?.ID_Lieu ? (
            <House />
          ) : (
            <Warehouse />
          )}
        </span>

        {prestation?.ID_Proprietaire === prestation?.ID_Lieu
          ? "À domicile"
          : prestation?.Lieu_Prestation
            ? getProprietaireLabel(prestation.Lieu_Prestation)
            : "Lieu de prestation inconnu"}
      </p>

      {prestation?.ID_Prestation && onClick && (
        <button
          type="button"
          onClick={onClick}
          className="group absolute inset-0 rounded-md text-blue-600 transition hover:bg-blue-200 hover:text-blue-800 cursor-pointer"
          title="Ouvrir la prestation"
        >
          <span className="flex h-full w-full items-center justify-center text-sm font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Ouvrir la prestation
          </span>

          <ExternalLink size={18} className="absolute right-2 top-2" />
        </button>
      )}
    </div>
  );
}
