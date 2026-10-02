import PrestationHeader from "./PrestationHeader.jsx";
import { MousePointer2 } from "lucide-react";

export function getMontantPaiements(prestation) {
  return (prestation?.Paiements_Prestation ?? []).reduce(
    (sum, paiement) => sum + Number(paiement.Montant_Paiement ?? 0),
    0,
  );
}

export function getStatutPaiement(prestation) {
  const montantPrestation = Number(prestation?.Montant_Prestation ?? 0);
  const montantPaiements = getMontantPaiements(prestation);
  const difference = montantPrestation - montantPaiements;

  if (montantPaiements === 0) {
    return {
      type: "aucun-paiement",
      montant: 0,
      montantPrestation,
      montantPaiements,
      label: "Aucun paiement",
    };
  }

  if (difference > 0) {
    return {
      type: "reste",
      montant: difference,
      montantPrestation,
      montantPaiements,
      label: "Reste",
    };
  }

  if (difference < 0) {
    return {
      type: "trop-percu",
      montant: Math.abs(difference),
      montantPrestation,
      montantPaiements,
      label: "Trop perçu",
    };
  }

  return {
    type: "soldee",
    montant: 0,
    montantPrestation,
    montantPaiements,
    label: "Soldée",
  };
}


export function formatAmount(value) {
  return `${Number(value ?? 0)
    .toFixed(2)
    .replace(".", ",")} €`;
}

export function formatAmountShort(value) {
  return `${Number(value ?? 0)
    .toFixed(0)
    .replace(".", ",")} €`;
}
export default function PrestationAmountHeader({ prestation }) {
  const statutPaiement = getStatutPaiement(prestation);

  const montantDeplacement = Number(
    prestation?.Deplacement_Prestation?.Montant_Deplacement ?? 0,
  );

  const consultations = prestation?.Consultations_Prestation ?? [];

  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 text-sm text-blue-700 shadow-lg">
      <PrestationHeader prestation={prestation} className=" !border-none" />
      <div className="p-4">
        <div className="space-y-2">
          {/* DÉPLACEMENT */}
          <div className="flex justify-between gap-4 font-medium">
            <span>Déplacement :</span>
            <span>{formatAmount(montantDeplacement)}</span>
          </div>
          {/* CONSULTATIONS */}
          <div>
            <div className="flex justify-between gap-4 font-medium">
              <span>Consultations :</span>
              <span className="">
                {formatAmount(
                  consultations.reduce(
                    (total, consultation) =>
                      total +
                      Number(
                        consultation?.Tarif_Consultation?.Montant_Tarif ?? 0,
                      ) *
                        Number(consultation?.Quantite_Consultation ?? 1),
                    0,
                  ),
                )}
              </span>
            </div>
            {consultations.length > 0 && (
              <div className="mt-2 space-y-1 border-x-2 border-blue-200 px-3">
                {consultations.map((consultation) => {
                  const montantTarif = Number(
                    consultation?.Tarif_Consultation?.Montant_Tarif ?? 0,
                  );
                  const quantite = Number(
                    consultation?.Quantite_Consultation ?? 1,
                  );
                  const montant = montantTarif * quantite;
                  return (
                    <div
                      key={consultation.ID_Consultation}
                      className="flex justify-between gap-4 text-xs text-blue-600"
                    >
                      <span className="flex flex-wrap flex-1">
                        <span>
                          {consultation?.Animal_Consultation?.Nom_Animal ??
                            "Animal inconnu"}
                        </span>

                        <span className="ml-1 flex">
                          <MousePointer2
                            size={10}
                            className="my-auto mr-1  transform rotate-135"
                          />
                          {consultation?.Tarif_Consultation
                            ?.Denomination_Tarif ?? "Tarif inconnu"}{" "}
                        </span>
                        <span className="rounded ml-2 px-1 bg-blue-100">
                          × {quantite}
                        </span>
                      </span>

                      <span>{formatAmount(montant)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* REMISE */}
          {Number(prestation?.Remise_Prestation ?? 0) > 0 && (
            <div className="flex justify-between gap-4 font-medium">
              <span>Remise :</span>
              <span className="">
                - {formatAmount(prestation.Remise_Prestation)}
              </span>
            </div>
          )}
          {/* TOTAL */}
          <div className="my-3 border-b border-blue-200 pb-3">
            <div className="flex justify-between gap-4 text-base text-blue-900">
              <span className="font-semibold">Total :</span>
              <span className="font-semibold border-t border-blue-700 pl-4">
                {formatAmount(prestation?.Montant_Prestation)}
              </span>
            </div>
          </div>

          {/* PAIEMENTS */}
          <div className="space-y-2">
            <div className="flex justify-between gap-4">
              <span>
                Paiement
                {(prestation?.Paiements_Prestation ?? []).length > 1
                  ? "s"
                  : ""}{" "}
                perçu
                {(prestation?.Paiements_Prestation ?? []).length > 1
                  ? "s"
                  : ""}{" "}
                ({(prestation?.Paiements_Prestation ?? []).length}) :
              </span>

              <span>{formatAmount(statutPaiement.montantPaiements)}</span>
            </div>

            {statutPaiement.type === "trop-percu" ? (
              <div className="flex justify-between gap-4 text-orange-600">
                <span>{statutPaiement.label} de :</span>
                <span>{formatAmount(statutPaiement.montant)}</span>
              </div>
            ) : statutPaiement.type === "reste" ? (
              <div className="flex justify-between gap-4 text-red-600">
                <span>{statutPaiement.label} à payer :</span>
                <span>{formatAmount(statutPaiement.montant)}</span>
              </div>
            ) : statutPaiement.type === "aucun-paiement" ? (
              <div className="flex justify-between gap-4 text-gray-500">
                <span>{statutPaiement.label}</span>
              </div>
            ) : (
              <div className="flex justify-between gap-4 text-green-600">
                <span>{statutPaiement.label}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
