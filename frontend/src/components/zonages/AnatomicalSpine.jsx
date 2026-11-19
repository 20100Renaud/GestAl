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

const SECTIONS = [
  { label: "Cervicales", prefix: "C", count: 8, start: 0 },
  { label: "Thoraciques", prefix: "T", count: 18, start: 1 },
  { label: "Lombaires", prefix: "L", count: 7, start: 1 },
];

const CENTER = 220;
const ROW_HEIGHT = 20;
const SECTION_GAP = 24;

function buildAnatomy() {
  let y = 90;

  const vertebrae = [];
  const sections = [];

  SECTIONS.forEach((section) => {
    const startY = y;

    y += 24;

    for (let i = 0; i < section.count; i++) {
      const position = String(section.start + i);

      vertebrae.push({
        prefix: section.prefix,
        position,
        label: `${section.prefix}${position}`,
        y,
        section: section.prefix,
      });

      y += ROW_HEIGHT;
    }

    sections.push({
      ...section,
      startY,
      endY: y,
    });

    y += SECTION_GAP;
  });

  return {
    vertebrae,
    sections,
    height: y + 100,
  };
}

/**
 * Représentation stylisée des vertèbres.
 */
function VertebraBone({ y, index, section }) {
  const width = section === "C" ? 25 : section === "T" ? 31 : 38;

  const half = width / 2;

  return (
    <g transform={`translate(${CENTER}, ${y})`}>
      {/* Processus épineux */}
      <path
        d={`M -5 -5 L -7 -11 L 0 -15 L 7 -11 L 5 -5 Z`}
        fill="#D5DCE5"
        stroke="#8795A6"
        strokeWidth="1.5"
      />

      {/* Processus transverses */}
      <path
        d={`
          M ${-half} -5
          L ${-half - 17} -13
          L ${-half - 27} -8
          L ${-half - 20} 5
          L ${-half} 7
          Z
        `}
        fill="#E2E8F0"
        stroke="#94A3B8"
        strokeWidth="1.2"
      />

      <path
        d={`
          M ${half} -5
          L ${half + 17} -13
          L ${half + 27} -8
          L ${half + 20} 5
          L ${half} 7
          Z
        `}
        fill="#E2E8F0"
        stroke="#94A3B8"
        strokeWidth="1.2"
      />

      {/* Corps vertébral */}
      <rect
        x={-half}
        y={-5}
        width={width}
        height="17"
        rx="6"
        fill="#CBD5E1"
        stroke="#64748B"
        strokeWidth="1.4"
      />

      <path
        d={`M ${-half + 5} 0 H ${half - 5}`}
        stroke="#F8FAFC"
        strokeWidth="2"
        opacity="0.7"
      />
    </g>
  );
}

/**
 * Zones sélectionnables.
 */
function InteractiveZone({
  x,
  y,
  width,
  height,
  zonage,
  selected,
  available,
  disabled,
  onToggle,
}) {
  const style = TECHNIQUES[zonage.Technique_Zonage];

  const unavailable = !available || disabled;

  const fill = selected ? style.active : style.inactive;

  const stroke = selected ? style.active : style.stroke;

  function activate() {
    if (!unavailable && available) {
      onToggle?.(available);
    }
  }

  return (
    <g
      role="button"
      tabIndex={unavailable ? -1 : 0}
      aria-label={[
        zonage.Nom_Zonage,
        zonage.Position_Zonage,
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
      className={unavailable ? "" : "cursor-pointer"}
      opacity={available ? 1 : 0.18}
    >
      <title>
        {zonage.Nom_Zonage}
        {zonage.Position_Zonage} - {zonage.Orientation_Zonage} -{" "}
        {zonage.Technique_Zonage}
      </title>

      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="4"
        fill={fill}
        stroke={stroke}
        strokeWidth={selected ? 2 : 1}
        className={
          unavailable ? "" : "transition-all duration-150 hover:brightness-90"
        }
      />

      <text
        x={x + width / 2}
        y={y + height / 2 + 3}
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill={selected ? "#FFFFFF" : style.text}
        pointerEvents="none"
      >
        {zonage.Technique_Zonage === "Tissulaire" ? "T" : "A"}
      </text>
    </g>
  );
}

/**
 * Côtes thoraciques stylisées.
 */
function RibCage({ vertebrae }) {
  const thoracic = vertebrae.filter((vertebra) => vertebra.section === "T");

  return (
    <g fill="none" stroke="#CBD5E1" strokeWidth="2.5">
      {thoracic.map((vertebra, index) => {
        const y = vertebra.y;

        const width = 105 + Math.sin((index / 17) * Math.PI) * 30;

        return (
          <g key={vertebra.label}>
            <path
              d={`
                M ${CENTER - 17} ${y}
                C ${CENTER - width * 0.35} ${y - 3},
                  ${CENTER - width} ${y + 20},
                  ${CENTER - width + 10} ${y + 50}
              `}
            />

            <path
              d={`
                M ${CENTER + 17} ${y}
                C ${CENTER + width * 0.35} ${y - 3},
                  ${CENTER + width} ${y + 20},
                  ${CENTER + width - 10} ${y + 50}
              `}
            />
          </g>
        );
      })}
    </g>
  );
}

/**
 * Anatomie dorsale stylisée de la colonne vertébrale canine.
 */
export default function AnatomicalSpine({
  zonages = [],
  selectedZonages = [],
  onToggle,
  disabled = false,
}) {
  const anatomy = useMemo(() => buildAnatomy(), []);

  const availableZones = useMemo(() => {
    return new Map(zonages.map((zonage) => [getZonageKey(zonage), zonage]));
  }, [zonages]);

  const selectedZones = useMemo(() => {
    return new Set(
      selectedZonages.map((item) => getZonageKey(item.Zonage ?? item)),
    );
  }, [selectedZonages]);

  function renderZone(vertebra, orientation, technique, x) {
    const candidate = {
      Nom_Zonage: vertebra.prefix,
      Position_Zonage: vertebra.position,
      Orientation_Zonage: orientation,
      Technique_Zonage: technique,
    };

    const key = getZonageKey(candidate);

    const available = availableZones.get(key);

    return (
      <InteractiveZone
        key={key}
        x={x}
        y={vertebra.y - 6}
        width={31}
        height={13}
        zonage={candidate}
        selected={selectedZones.has(key)}
        available={available}
        disabled={disabled}
        onToggle={onToggle}
      />
    );
  }

  return (
    <div className="w-full rounded-xl border border-blue-100 bg-white p-3">
      <div className="mb-3 text-center">
        <h3 className="text-sm font-semibold text-blue-900">
          Colonne vertébrale canine
        </h3>
        <p className="text-xs text-gray-500">
          Vue dorsale · Sélection des zonages
        </p>
      </div>

      <div className="mb-2 flex justify-between px-5 text-xs font-semibold">
        <span className="text-blue-700">Gauche</span>
        <span className="text-blue-700">Droite</span>
      </div>

      <div className="max-h-[650px] overflow-y-auto">
        <svg
          viewBox={`0 0 440 ${anatomy.height}`}
          width="100%"
          role="group"
          aria-label="Sélection anatomique de la colonne vertébrale canine"
          className="mx-auto block"
        >
          <defs>
            <linearGradient id="canineBone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>

          {/* Silhouette dorsale stylisée */}
          <path
            d={`
              M 220 28
              C 180 30 160 65 170 100
              C 145 125 125 170 135 220
              C 105 290 105 400 135 470
              C 145 530 155 600 175 660
              L 195 720
              L 220 750
              L 245 720
              L 265 660
              C 285 600 295 530 305 470
              C 335 400 335 290 305 220
              C 315 170 295 125 270 100
              C 280 65 260 30 220 28
              Z
            `}
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="2"
          />

          {/* Tête / nuque */}
          <path
            d="
              M 220 28
              C 195 30 181 50 190 72
              L 220 92
              L 250 72
              C 259 50 245 30 220 28
            "
            fill="#E2E8F0"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          {/* Bassin */}
          <path
            d={`
              M 220 ${anatomy.height - 70}
              C 185 ${anatomy.height - 95},
                140 ${anatomy.height - 85},
                135 ${anatomy.height - 45}
              L 180 ${anatomy.height - 15}
              L 220 ${anatomy.height - 30}
              L 260 ${anatomy.height - 15}
              L 305 ${anatomy.height - 45}
              C 300 ${anatomy.height - 85},
                255 ${anatomy.height - 95},
                220 ${anatomy.height - 70}
              Z
            `}
            fill="#E2E8F0"
            stroke="#94A3B8"
            strokeWidth="2"
          />

          {/* Régions anatomiques */}
          {anatomy.sections.map((section) => (
            <g key={section.prefix}>
              <rect
                x="12"
                y={section.startY - 15}
                width="416"
                height={section.endY - section.startY + 12}
                rx="10"
                fill="#FFFFFF"
                fillOpacity="0.35"
                stroke="#CBD5E1"
                strokeDasharray="3 4"
              />

              <text
                x="220"
                y={section.startY}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                letterSpacing="1.2"
                fill="#64748B"
              >
                {section.label.toUpperCase()}
              </text>
            </g>
          ))}

          {/* Cage thoracique */}
          <RibCage vertebrae={anatomy.vertebrae} />

          {/* Axe vertébral */}
          <path
            d={`M 220 85 V ${anatomy.height - 100}`}
            stroke="#94A3B8"
            strokeWidth="2"
            strokeDasharray="4 5"
          />

          {/* Vertèbres et zones interactives */}
          {anatomy.vertebrae.map((vertebra) => (
            <g key={vertebra.label}>
              <VertebraBone y={vertebra.y} section={vertebra.section} />

              {/* Gauche */}
              {renderZone(vertebra, "G", "Tissulaire", 115)}

              {renderZone(vertebra, "G", "Articulaire", 150)}

              {/* Identification */}
              <rect
                x="202"
                y={vertebra.y - 7}
                width="36"
                height="15"
                rx="4"
                fill="#FFFFFF"
                stroke="#CBD5E1"
              />

              <text
                x="220"
                y={vertebra.y + 3}
                fontSize="8"
                fontWeight="700"
                textAnchor="middle"
                fill="#334155"
                pointerEvents="none"
              >
                {vertebra.label}
              </text>

              {/* Droite */}
              {renderZone(vertebra, "D", "Tissulaire", 259)}

              {renderZone(vertebra, "D", "Articulaire", 294)}
            </g>
          ))}
        </svg>
      </div>

      {/* Légende */}
      <div className="mt-3 flex flex-wrap justify-center gap-4 border-t border-gray-100 pt-3 text-xs">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-blue-600" />
          Tissulaire
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-green-600" />
          Articulaire
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-gray-300 bg-slate-100" />
          Non sélectionné
        </span>
      </div>

      <p className="mt-2 text-center text-xs text-gray-400">
        Les zones grisées correspondent aux zonages indisponibles.
      </p>
    </div>
  );
}
