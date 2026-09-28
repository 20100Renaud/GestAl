export function getProprietaireLabel(proprietaire) {
  if (proprietaire.Etablissement) {
    return `${proprietaire.Raison_sociale} ${proprietaire.Etablissement}`;
  }

  return `${proprietaire.Civilite_Proprietaire || ""} ${
    proprietaire.Nom_Proprietaire
  } ${proprietaire.Prenom_Proprietaire}`.trim();
}

export default function ProprietaireOptions({ proprietaires = [] }) {
  const particuliers = [...proprietaires]
    .filter((p) => !p.Etablissement)
    .sort((a, b) =>
      getProprietaireLabel(a).localeCompare(getProprietaireLabel(b), "fr", {
        sensitivity: "base",
      }),
    );

  const etablissements = [...proprietaires]
    .filter((p) => p.Etablissement)
    .sort((a, b) =>
      getProprietaireLabel(a).localeCompare(getProprietaireLabel(b), "fr", {
        sensitivity: "base",
      }),
    );

  return (
    <>
      <optgroup label="Particuliers">
        {particuliers.map((proprietaire) => (
          <option
            key={proprietaire.ID_Proprietaire}
            value={proprietaire.ID_Proprietaire}
          >
            {getProprietaireLabel(proprietaire)}
          </option>
        ))}
      </optgroup>

      <optgroup label="Professionnels">
        {etablissements.map((proprietaire) => (
          <option
            key={proprietaire.ID_Proprietaire}
            value={proprietaire.ID_Proprietaire}
          >
            {getProprietaireLabel(proprietaire)}
          </option>
        ))}
      </optgroup>
    </>
  );
}
