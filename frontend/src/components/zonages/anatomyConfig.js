// Concaténation du nom d'un zonage
export function getZonageKey(zonage) {
  return [
    zonage.Nom_Zonage,
    zonage.Position_Zonage,
    zonage.Orientation_Zonage,
    zonage.Technique_Zonage,
  ].join("|");
}

//Zonages des membres
export const memberZonesConfig = {
  anterior: [
    { label: "SH", name: "SH", orientation: true },
    { label: "Coude", name: "Coude", orientation: true },
    { label: "Carpe", name: "Carpe", orientation: true },
    { label: "Métacarpe / P1", name: "Méta/P1", orientation: true },
    { label: "P1 / P2", name: "P1/P2 a", orientation: true },
    { label: "P2 / P3", name: "P2/P3 a", orientation: true },
  ],
  posterior: [
    { label: "Iliun", name: "Ilium", orientation: true },
    { label: "Coxo", name: "Coxo", orientation: true },
    { label: "SP", name: "SP", orientation: true },
    { label: "Grasset", name: "Grasset", orientation: true },
    { label: "Jarret", name: "Jarret", orientation: true },
    { label: "Métatarse / P1", name: "Métat/P1", orientation: true },
    { label: "P1 / P2", name: "P1/P2 p", orientation: true },
    { label: "P2 / P3", name: "P2/P3 p", orientation: true },
  ],
};
