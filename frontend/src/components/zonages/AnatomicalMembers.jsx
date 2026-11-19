import { useMemo } from "react";
import { getZonageKey } from "./anatomyConfig.js";

const TECHNIQUES = {
  Tissulaire: {
    active: "#2563EB",
    inactive: "#DBEAFE",
    stroke: "#60A5FA",
    text: "#1D4ED8",
  },
  Articulaire: {
    active: "#16A34A",
    inactive: "#DCFCE7",
    stroke: "#4ADE80",
    text: "#15803D",
  },
};

const DIAGRAMS = {
  anterior: {
    title: "Membres antérieurs",
    subtitle: "Épaule jusqu'aux doigts",
    regions: [
      { name: "SH", label: "Épaule", y: 65 },
      { name: "Coude", label: "Coude", y: 145 },
      { name: "Carpe", label: "Carpe", y: 225 },
      { name: "Méta/P1", label: "Méta / P1", y: 275 },
      { name: "P1/P2 a", label: "P1 / P2", y: 325 },
      { name: "P2/P3 a", label: "P2 / P3", y: 375 },
    ],
  },
  posterior: {
    title: "Membres postérieurs",
    subtitle: "Bassin jusqu'aux doigts",
    regions: [
      { name: "Ilium", label: "Ilion", y: 45 },
      { name: "Coxo", label: "Hanche", y: 105 },
      { name: "Grasset", label: "Grasset", y: 185 },
      { name: "Jarret", label: "Jarret", y: 265 },
      { name: "Métat/P1", label: "Métat / P1", y: 315 },
      { name: "P1/P2 p", label: "P1 / P2", y: 365 },
      { name: "P2/P3 p", label: "P2 / P3", y: 415 },
    ],
  },
};

function InteractiveZone({
  x,
  y,
  orientation,
  technique,
  zonage,
  selected,
  disabled,
  onToggle,
}) {
  const style = TECHNIQUES[technique];

  const active = selected;
  const available = Boolean(zonage);

  const unavailable = disabled || !available;

  return (
    <g
      role="button"
      tabIndex={unavailable ? -1 : 0}
      aria-label={`${orientation === "G" ? "Gauche" : "Droite"} - ${technique}`}
      aria-pressed={active}
      aria-disabled={unavailable}
      className={unavailable ? "" : "cursor-pointer"}
      opacity={available ? 1 : 0.2}
      onClick={() => {
        if (!unavailable) onToggle?.(zonage);
      }}
      onKeyDown={(event) => {
        if (!unavailable && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onToggle?.(zonage);
        }
      }}
    >
      <title>
        {orientation === "G" ? "Gauche" : "Droite"} - {technique}
      </title>

      <rect
        x={x}
        y={y}
        width="31"
        height="21"
        rx="5"
        fill={active ? style.active : style.inactive}
        stroke={active ? style.active : style.stroke}
        strokeWidth={active ? 2 : 1}
      />

      <text
        x={x + 15.5}
        y={y + 14}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={active ? "#FFFFFF" : style.text}
        pointerEvents="none"
      >
        {technique === "Tissulaire" ? "T" : "A"}
      </text>
    </g>
  );
}

function BoneStructure({ type, centerX }) {
  if (type === "anterior") {
    return (
      <g
        transform={`translate(${centerX}, 0)`}
        fill="#E2E8F0"
        stroke="#94A3B8"
        strokeWidth="1.5"
      >
        {/* Scapula */}
        <path d="M -20 45 Q -35 55 -24 88 L -8 110 L 10 85 L 16 53 Q 0 37 -20 45 Z" />

        {/* Humérus */}
        <path d="M -9 105 Q -18 120 -10 145 L -7 170 Q 0 182 7 170 L 10 145 Q 18 120 9 105 Z" />

        {/* Radius et ulna */}
        <path d="M -8 175 L -11 220 Q -10 235 -5 238 L 0 232 L 2 180 Z" />
        <path d="M 3 180 L 5 230 L 11 238 Q 17 230 13 215 L 9 175 Z" />

        {/* Métacarpe */}
        {[-9, -3, 3, 9].map((offset) => (
          <path
            key={offset}
            d={`M ${offset} 240 L ${offset - 2} 286 L ${offset + 1} 290 L ${offset + 3} 242 Z`}
          />
        ))}
      </g>
    );
  }

  return (
    <g
      transform={`translate(${centerX}, 0)`}
      fill="#E2E8F0"
      stroke="#94A3B8"
      strokeWidth="1.5"
    >
      {/* Os iliaque */}
      <path d="M -12 35 Q -38 35 -34 65 L -12 100 L 12 100 L 34 65 Q 38 35 12 35 L 0 55 Z" />

      {/* Fémur */}
      <path d="M -9 100 Q -17 120 -12 150 L -7 190 Q 0 200 7 190 L 12 150 Q 17 120 9 100 Z" />

      {/* Tibia et fibula */}
      <path d="M -8 195 L -12 240 L -7 275 L 0 280 L 4 240 L 8 195 Z" />
      <path d="M 5 195 L 10 245 L 12 275 L 16 270 L 13 220 L 9 195 Z" />

      {/* Métatarse */}
      {[-9, -3, 3, 9].map((offset) => (
        <path
          key={offset}
          d={`M ${offset} 278 L ${offset - 2} 326 L ${offset + 1} 330 L ${offset + 3} 280 Z`}
        />
      ))}
    </g>
  );
}

function MemberDiagram({ type, zonages, selectedZonages, onToggle, disabled }) {
  const config = DIAGRAMS[type];

  const availableZones = useMemo(
    () => new Map(zonages.map((item) => [getZonageKey(item), item])),
    [zonages],
  );

  const selectedZones = useMemo(
    () =>
      new Set(selectedZonages.map((item) => getZonageKey(item.Zonage ?? item))),
    [selectedZonages],
  );

  function renderRegion(region, orientation, centerX) {
    return (
      <g key={`${region.name}-${orientation}`}>
        {/* Fond de la région */}
        <rect
          x={centerX - 42}
          y={region.y - 10}
          width="84"
          height="34"
          rx="7"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeDasharray="3 2"
        />

        <text
          x={centerX}
          y={region.y + 1}
          textAnchor="middle"
          fontSize="8"
          fontWeight="600"
          fill="#475569"
          pointerEvents="none"
        >
          {region.label}
        </text>

        {["Tissulaire", "Articulaire"].map((technique, index) => {
          const candidate = {
            Nom_Zonage: region.name,
            Position_Zonage: "",
            Orientation_Zonage: orientation,
            Technique_Zonage: technique,
          };

          const key = getZonageKey(candidate);
          const zonage = availableZones.get(key);

          return (
            <InteractiveZone
              key={key}
              x={centerX - 34 + index * 37}
              y={region.y + 5}
              orientation={orientation}
              technique={technique}
              zonage={zonage}
              selected={selectedZones.has(key)}
              disabled={disabled}
              onToggle={onToggle}
            />
          );
        })}
      </g>
    );
  }

  return (
    <section className="rounded-xl border border-blue-100 bg-white p-3">
      <div className="mb-3 text-center">
        <h3 className="text-sm font-semibold text-blue-900">{config.title}</h3>
        <p className="text-xs text-gray-500">{config.subtitle}</p>
      </div>

      <svg
        viewBox="0 0 360 475"
        width="100%"
        role="group"
        aria-label={config.title}
        className="mx-auto block"
      >
        {/* Membres gauche et droite */}
        <BoneStructure type={type} centerX={90} />
        <BoneStructure type={type} centerX={270} />

        {/* Séparateur central */}
        <path d="M180 25 V455" stroke="#E2E8F0" strokeDasharray="4 5" />

        <text
          x="90"
          y="20"
          fontSize="11"
          textAnchor="middle"
          fontWeight="700"
          fill="#2563EB"
        >
          Gauche
        </text>

        <text
          x="270"
          y="20"
          fontSize="11"
          textAnchor="middle"
          fontWeight="700"
          fill="#2563EB"
        >
          Droite
        </text>

        {/* Zones interactives */}
        {config.regions.map((region) => (
          <g key={region.name}>
            {renderRegion(region, "G", 90)}
            {renderRegion(region, "D", 270)}
          </g>
        ))}
      </svg>
    </section>
  );
}

export default function AnatomicalMembers({
  zonages = [],
  selectedZonages = [],
  onToggle,
  disabled = false,
}) {
  return (
    <div className="space-y-4">
      <MemberDiagram
        type="anterior"
        zonages={zonages}
        selectedZonages={selectedZonages}
        onToggle={onToggle}
        disabled={disabled}
      />

      <MemberDiagram
        type="posterior"
        zonages={zonages}
        selectedZonages={selectedZonages}
        onToggle={onToggle}
        disabled={disabled}
      />

      <div className="flex flex-wrap justify-center gap-4 border-t border-gray-100 pt-3 text-xs">
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
  );
}
