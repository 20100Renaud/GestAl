const spineConfig = {
  cervicales: {
    label: "Cervicales",
    prefix: "C",
    count: 8,
  },
  thoraciques: {
    label: "Thoraciques",
    prefix: "T",
    count: 18,
  },
  lombaires: {
    label: "Lombaires",
    prefix: "L",
    count: 7,
  },
};

export const animalMapConfig = {
  Chien: {
    label: "Chien",
    view: "dorsal",
    spine: spineConfig,
    members: true,
  },

  Chat: {
    label: "Chat",
    view: "dorsal",
    spine: spineConfig,
    members: true,
  },

  Cheval: {
    label: "Cheval",
    view: "dorsal",
    spine: spineConfig,
    members: true,
  },

  Mouton: {
    label: "Mouton",
    view: "generic",
    spine: null,
    members: true,
  },

  Chèvre: {
    label: "Chèvre",
    view: "generic",
    spine: null,
    members: true,
  },

  Oiseaux: {
    label: "Oiseaux",
    view: null,
    spine: null,
    members: false,
  },

  NAC: {
    label: "NAC",
    view: "generic",
    spine: null,
    members: false,
  },

  Autre: {
    label: "Autre",
    view: null,
    spine: null,
    members: false,
  },
};

export function getAnimalMapConfig(animalGenre) {
  return animalMapConfig[animalGenre] ?? animalMapConfig.Autre;
}

// Construction des identifiants des cases vertébrales.

export function getSpineZones() {
  const zones = [];

  Object.values(spineConfig).forEach((section) => {
    for (let position = 0; position < section.count; position++) {
      const level =
        section.prefix === "C" ? String(position) : String(position + 1);

      ["G", "D"].forEach((orientation) => {
        ["Tissulaire", "Articulaire"].forEach((technique) => {
          zones.push({
            nom: section.prefix,
            position: level,
            orientation,
            technique,
            key: `${section.prefix}${level}-${orientation}-${technique}`,
          });
        });
      });
    }
  });

  return zones;
}

// Vérification d'un zonage correspondant à une case vertébrale.

export function isSpineZonage(zonage) {
  if (!zonage) return false;

  return (
    ["C", "T", "L"].includes(zonage.Nom_Zonage) &&
    zonage.Position_Zonage !== "" &&
    ["D", "G"].includes(zonage.Orientation_Zonage) &&
    ["Tissulaire", "Articulaire"].includes(zonage.Technique_Zonage)
  );
}

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
    { label: "Épaule", name: "SH", orientation: true },
    { label: "Coude", name: "Coude", orientation: true },
    { label: "Carpe", name: "Carpe", orientation: true },
    { label: "Métacarpe / P1", name: "Méta/P1", orientation: true },
    { label: "P1 / P2", name: "P1/P2 a", orientation: true },
    { label: "P2 / P3", name: "P2/P3 a", orientation: true },
  ],
  posterior: [
    { label: "Ilion", name: "Ilium", orientation: true },
    { label: "Hanche", name: "Coxo", orientation: true },
    { label: "Grasset", name: "Grasset", orientation: true },
    { label: "Jarret", name: "Jarret", orientation: true },
    { label: "Métatarse / P1", name: "Métat/P1", orientation: true },
    { label: "P1 / P2", name: "P1/P2 p", orientation: true },
    { label: "P2 / P3", name: "P2/P3 p", orientation: true },
  ],
};