import { useMemo } from "react";
import { getZonageKey, memberZonesConfig } from "./anatomyConfig.js";
import ForelimbSvg from "./ForelimbSvg.jsx";
import HindlimbSvg from "./HindlimbSvg.jsx";

const TECHNIQUES = {
  Tissulaire: {
    active: "fill-blue-600 stroke-blue-600",
    inactive: "fill-blue-100 stroke-blue-400",
    text: "fill-blue-700",
    selectedText: "fill-white",
  },
  Articulaire: {
    active: "fill-green-600 stroke-green-600",
    inactive: "fill-green-100 stroke-green-400",
    text: "fill-green-700",
    selectedText: "fill-white",
  },
};

// Dimensions
const CENTER = 220;
const BUTTON_WIDTH = 20;
const BUTTON_HEIGHT = 13;
const BUTTON_GAP = 4;

// Positions des btns membres
const MEMBER_LEFT_X = 70;
const MEMBER_RIGHT_X = 326;
const MEMBER_Y = {
  anterior: [90, 135, 210, 275, 295, 315],
  posterior: [40, 70, 100, 170, 250, 295, 310, 325],
};


// Bouton interactif
function InteractiveZone({
  x,
  y,
  zonage,
  available,
  selected,
  disabled,
  onToggle,
}) {
  const style = TECHNIQUES[zonage.Technique_Zonage];
  const unavailable = !available || disabled;

  function activate() {
    if (!unavailable) {
      onToggle?.(available);
    }
  }

  return (
    <g
      role="button"
      tabIndex={unavailable ? -1 : 0}
      aria-label={[
        zonage.Nom_Zonage,
        zonage.Orientation_Zonage === "G" ? "Gauche" : "Droite",
        zonage.Technique_Zonage,
      ].join(" ")}
      aria-pressed={selected}
      aria-disabled={unavailable}
      onClick={activate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      }}
      className={`
        transition-opacity focus:outline-none focus:ring-0
        ${unavailable ? "cursor-not-allowed opacity-[0.18]" : "cursor-pointer"}
      `}
    >
      <title>
        {zonage.Nom_Zonage} - {zonage.Orientation_Zonage} -{" "}
        {zonage.Technique_Zonage}
      </title>

      <rect
        x={x}
        y={y}
        width={BUTTON_WIDTH}
        height={BUTTON_HEIGHT}
        rx="8"
        className={`
          transition-all duration-150
          ${selected ? style.active : style.inactive}
          ${unavailable ? "" : "hover:brightness-90"}
        `}
        strokeWidth={selected ? 2 : 1}
      />

      <text
        x={x + BUTTON_WIDTH / 2}
        y={y + BUTTON_HEIGHT / 2 + 3}
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        pointerEvents="none"
        className={selected ? style.selectedText : style.text}
      >
        {zonage.Technique_Zonage === "Tissulaire" ? "T" : "A"}
      </text>
    </g>
  );
}

// Noms des articulations
function AnatomyLabel({ label, y }) {
  return (
    <g pointerEvents="none">
      <text
        x={CENTER}
        y={y + 2}
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#334155"
      >
        {label}
      </text>
    </g>
  );
}

// Diagramme d'un membre
function MemberDiagram({ type, zonages, selectedZonages, onToggle, disabled }) {
  const config = memberZonesConfig[type];
  const positions = MEMBER_Y[type];

  const availableZones = useMemo(
    () => new Map(zonages.map((item) => [getZonageKey(item), item])),
    [zonages],
  );

  const selectedZones = useMemo(
    () =>
      new Set(selectedZonages.map((item) => getZonageKey(item.Zonage ?? item))),
    [selectedZonages],
  );

  // Rendu des btns
  function renderZone(region, orientation, technique, x, y) {
    const candidate = {
      Nom_Zonage: region.name,
      Position_Zonage: "",
      Orientation_Zonage: orientation,
      Technique_Zonage: technique,
    };

    const key = getZonageKey(candidate);
    const available = availableZones.get(key);

    return (
      <InteractiveZone
        key={key}
        x={x}
        y={y}
        zonage={candidate}
        available={available}
        selected={selectedZones.has(key)}
        disabled={disabled}
        onToggle={onToggle}
      />
    );
  }


  // Positions x des btns
  function renderSide(orientation, side) {
    const x = side === "left" ? MEMBER_LEFT_X : MEMBER_RIGHT_X;

    return config.map((region, index) => {
      const y = positions[index];

      return (
        <g key={`${orientation}-${region.name}`}>
          {renderZone(region, orientation, "Tissulaire", x, y - 7)}

          {renderZone(
            region,
            orientation,
            "Articulaire",
            x + BUTTON_WIDTH + BUTTON_GAP,
            y - 7,
          )}
        </g>
      );
    });
  }

  return (
    <section className="rounded-xl border border-blue-100 bg-white md:p-3">
      {/* Titre */}
      <div className="text-center">
        <div className="flex flex-wrap justify-around gap-4 text-xs pt-2">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-blue-600" />
            Tissulaire
          </span>

          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-green-600" />
            Articulaire
          </span>
        </div>
      </div>

      {/* Diagramme anatomique */}
      <div className="w-full">
        <svg
          viewBox="0 0 440 340"
          width="100%"
          role="group"
          aria-label={`Sélection des ${
            type === "anterior" ? "membres antérieurs" : "membres postérieurs"
          }`}
          className="mx-auto block"
        >
          {/* Sections pointillées */}
          <rect
            x="5"
            y="10"
            width="430"
            height="325"
            rx="10"
            fill="#0452fa21"
            fillOpacity="0.12"
            stroke="#CBD5E1"
            strokeDasharray="3 4"
          />
          {/* Légendes gauche et droite */}
          <g
            fill="#64748B"
            fontSize="10"
            fontWeight="700"
            letterSpacing="1"
            textAnchor="middle"
          >
            <text x="35" y="25">
              GAUCHE
            </text>
            <text x="407" y="25">
              DROITE
            </text>
          </g>
          {/* Dessin anatomique */}
          {type === "anterior" ? <ForelimbSvg /> : <HindlimbSvg />}

          {/* Noms des articulations */}
          {config.map((region, index) => (
            <AnatomyLabel
              key={region.name}
              label={region.label}
              y={positions[index]}
            />
          ))}

          {/* Boutons gauche */}
          {renderSide("G", "left")}

          {/* Boutons droite */}
          {renderSide("D", "right")}
        </svg>
      </div>
    </section>
  );
}

export default function AnatomicalMembers({
  type,
  zonages = [],
  selectedZonages = [],
  onToggle,
  disabled = false,
}) {
  return (
    <MemberDiagram
      type={type}
      zonages={zonages}
      selectedZonages={selectedZonages}
      onToggle={onToggle}
      disabled={disabled}
    />
  );
}
