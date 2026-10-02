import { getProprietaireLabel } from "./ProprietaireOptions.jsx";
import {
  UserRound,
  CalendarDays,
  House,
  Warehouse,

} from "lucide-react";

export default function PrestationHeader({ prestation, className = "" }) {
  return (
    <div
      className={`flex justify-around gap-3 rounded-md shadow border border-blue-200 bg-blue-100 p-4 text-center text-sm text-blue-700  shadow-lg ${className}`}
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
    </div>
  );
}
