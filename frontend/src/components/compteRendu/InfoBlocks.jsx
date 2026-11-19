function InfoBlock({ title, record, type }) {
  if (!record) return null;

  const isPrestataire = type === "prestataire";

  const values = isPrestataire
    ? [
        [record.practice?.toUpperCase()],
        [record.civility, record.lastName, record.firstName],
        [record.address],
        [record.postalCode, record.city],
        [record.email],
        [record.phone],
      ]
    : [
        [
          record.Raison_sociale !== "Particulier"
            ? record.Raison_sociale
            : null,
          record.Etablissement,
        ],
        [
          record.Civilite_Proprietaire,
          record.Nom_Proprietaire,
          record.Prenom_Proprietaire,
        ],
        [record.Adresse_Proprietaire],
        [record.CP_Proprietaire, record.Ville_Proprietaire],
        [record.Email_Proprietaire],
        [record.Tel_Proprietaire],
      ];

  return (
    <div className="min-w-0 text-blue-900">
      <h3 className="mb-2 text-sm font-bold text-blue-800">{title}</h3>

      <div className="space-y-1 text-[11px] leading-relaxed">
        {values.map((row, index) => {
          const text = row.filter(Boolean).join(" ");

          if (!text) return null;

          return <p key={index}>{text}</p>;
        })}
      </div>
    </div>
  );
}

export default function ConsultationInfoBlocks({
  user,
  proprietaire,
  lieu,
  prestation,
}) {
  const hasDifferentLieu =
    prestation?.ID_Lieu != null &&
    prestation?.ID_Proprietaire != null &&
    String(prestation.ID_Lieu) !== String(prestation.ID_Proprietaire);

  return (
    <section className="mt-6 grid grid-cols-3 gap-5">
      <InfoBlock title="Prestataire" record={user} type="prestataire" />

      {hasDifferentLieu && (
        <InfoBlock
          title="Lieu de prestation"
          record={lieu}
          type="proprietaire"
        />
      )}

      <InfoBlock
        title="Propriétaire"
        record={proprietaire}
        type="proprietaire"
      />
    </section>
  );
}
