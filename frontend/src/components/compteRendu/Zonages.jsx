const colorsByTechnique = {
  Articulaire: {
    border: "border-green-600",
    badge: "bg-green-50 text-green-700 border-green-600",
  },
  Tissulaire: {
    border: "border-blue-600",
    badge: "bg-blue-50 text-blue-700 border-blue-600",
  },
  Viscérale: {
    border: "border-purple-600",
    badge: "bg-purple-50 text-purple-700 border-purple-600",
  },
};

const fallback = {
  border: "border-gray-400",
  badge: "bg-gray-50 text-gray-600 border-gray-400",
};

export default function ConsultationZonages({ zonages = [] }) {
  return (
    <section className="mt-8 text-blue-900">
      <h2 className="mb-6 border-b border-blue-200 pb-2 text-base font-bold text-blue-800">
        Zones concernées
      </h2>

      {!zonages.length ? (
        <p className="text-xs italic text-gray-500">
          Aucun zonage sélectionné.
        </p>
      ) : (
        <div className="grid grid-cols-5 gap-x-3 gap-y-8">
          {zonages.map((zonage, index) => {
            const colors =
              colorsByTechnique[zonage.Technique_Zonage] ?? fallback;

            const title =
              [
                zonage.Nom_Zonage,
                zonage.Position_Zonage,
                zonage.Orientation_Zonage
                  ? `-${zonage.Orientation_Zonage}`
                  : "",
              ]
                .filter(Boolean)
                .join("") || "Zonage sans intitulé";

            return (
              <div
                key={zonage.ID_Zonage ?? index}
                className={`relative flex min-h-[80px] flex-col items-center justify-center rounded-lg border p-2 text-center ${colors.border}`}
              >
                <span
                  className={`absolute -top-3 max-w-[90%] truncate rounded-full border px-2 py-1 text-[9px] ${colors.badge}`}
                >
                  {zonage.Technique_Zonage || "Technique non renseignée"}
                </span>

                <p className="mt-1 text-[11px] font-bold">{title}</p>

                {zonage.Commentaire_Zonage && (
                  <p className="mt-2 w-full truncate rounded-full bg-blue-50 px-2 py-1 text-[9px] text-blue-700">
                    {zonage.Commentaire_Zonage}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
