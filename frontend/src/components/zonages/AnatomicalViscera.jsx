import { useMemo, useState } from "react";
import { getZonageKey } from "./anatomyConfig.js";
import { TabButton } from "../ui/Button.jsx";
import Button from "../ui/Button.jsx";

const SPECIES = {
  horse: {
    label: "Cheval",
    viewBox: "0 0 700 430",
    body: `
      M 100 145
      Q 105 105 155 100
      L 500 100
      Q 570 102 605 145
      L 620 230
      Q 615 285 570 305
      Q 500 335 420 325
      L 230 325
      Q 145 320 115 280
      Q 95 240 100 145 Z
    `,
    neck: `
      M 105 145
      Q 70 125 45 75
      Q 30 45 55 35
      Q 85 35 110 85
      L 155 100 Z
    `,
    forelegs: [
      "M 185 300 Q 170 340 175 385 L 185 390 L 200 385 L 210 315 Z",
      "M 225 305 Q 220 345 230 385 L 245 390 L 255 385 L 250 310 Z",
    ],
    hindlegs: [
      "M 500 305 Q 485 345 475 385 L 490 392 L 510 385 L 530 315 Z",
      "M 550 300 Q 550 340 555 385 L 570 390 L 585 380 L 575 310 Z",
    ],
    ribCount: 18,
    ribStart: 175,
    ribEnd: 440,
    ribWidth: 125,
    ribHeight: 155,
    organs: {
      Poumon: { x: 285, y: 185, rx: 105, ry: 65 },
      Foie: { x: 435, y: 205, rx: 48, ry: 38 },
      Estomac: { x: 350, y: 235, rx: 52, ry: 38 },
      Rate: { x: 250, y: 255, rx: 30, ry: 65 },
      Rein: { x: 475, y: 270, rx: 35, ry: 20 },
      "Gros intestin": { x: 355, y: 305, rx: 110, ry: 32 },
      "Intestin grêle": { x: 400, y: 280, rx: 65, ry: 30 },
      Pancréas: { x: 410, y: 245, rx: 35, ry: 13 },
      "Vésicule biliaire": { x: 452, y: 242, rx: 12, ry: 16 },
      Vessie: { x: 540, y: 335, rx: 25, ry: 20 },
      Ovaire: { x: 535, y: 290, rx: 13, ry: 9 },
      Testicule: { x: 565, y: 355, rx: 15, ry: 12 },
    },
  },

  dog: {
    label: "Chien",
    viewBox: "0 0 700 430",
    body: `
      M 130 135
      Q 145 105 205 105
      L 475 105
      Q 550 112 590 155
      Q 620 205 600 270
      Q 575 320 510 325
      L 220 325
      Q 145 310 125 255
      Q 115 190 130 135 Z
    `,
    neck: `
      M 135 145
      Q 100 120 75 75
      Q 55 45 75 35
      Q 110 40 140 90
      L 205 105 Z
    `,
    forelegs: [
      "M 220 300 Q 210 340 210 385 L 225 390 L 240 385 L 245 315 Z",
      "M 255 305 Q 250 345 260 385 L 275 390 L 290 385 L 285 315 Z",
    ],
    hindlegs: [
      "M 485 300 Q 465 340 460 385 L 475 390 L 490 385 L 515 315 Z",
      "M 535 300 Q 540 340 545 385 L 560 390 L 575 380 L 565 315 Z",
    ],
    ribCount: 13,
    ribStart: 190,
    ribEnd: 390,
    ribWidth: 110,
    ribHeight: 145,
    organs: {
      Poumon: { x: 295, y: 165, rx: 100, ry: 65 },
      Foie: { x: 440, y: 195, rx: 55, ry: 42 },
      Estomac: { x: 365, y: 235, rx: 50, ry: 35 },
      Rate: { x: 280, y: 265, rx: 28, ry: 65 },
      Rein: { x: 480, y: 275, rx: 32, ry: 19 },
      "Gros intestin": { x: 380, y: 310, rx: 85, ry: 28 },
      "Intestin grêle": { x: 410, y: 275, rx: 65, ry: 32 },
      Pancréas: { x: 430, y: 245, rx: 34, ry: 13 },
      "Vésicule biliaire": { x: 455, y: 225, rx: 11, ry: 15 },
      Vessie: { x: 545, y: 330, rx: 24, ry: 19 },
      Ovaire: { x: 530, y: 285, rx: 12, ry: 9 },
      Testicule: { x: 565, y: 355, rx: 14, ry: 11 },
    },
  },

  cat: {
    label: "Chat",
    viewBox: "0 0 700 430",
    body: `
      M 145 140
      Q 160 105 215 105
      L 470 105
      Q 540 115 575 155
      Q 600 205 585 265
      Q 560 310 500 315
      L 225 315
      Q 155 300 140 255
      Q 130 190 145 140 Z
    `,
    neck: `
      M 150 145
      Q 120 120 95 75
      Q 80 50 100 35
      Q 130 40 155 90
      L 215 105 Z
    `,
    forelegs: [
      "M 220 295 Q 210 335 210 380 L 225 385 L 240 380 L 245 310 Z",
      "M 255 300 Q 250 340 260 380 L 275 385 L 285 380 L 280 310 Z",
    ],
    hindlegs: [
      "M 475 295 Q 455 335 450 380 L 465 385 L 480 380 L 505 310 Z",
      "M 525 295 Q 530 335 535 380 L 550 385 L 565 375 L 555 310 Z",
    ],
    ribCount: 13,
    ribStart: 195,
    ribEnd: 380,
    ribWidth: 100,
    ribHeight: 135,
    organs: {
      Poumon: { x: 295, y: 165, rx: 92, ry: 60 },
      Foie: { x: 440, y: 195, rx: 48, ry: 38 },
      Estomac: { x: 360, y: 230, rx: 45, ry: 33 },
      Rate: { x: 285, y: 260, rx: 25, ry: 57 },
      Rein: { x: 480, y: 270, rx: 29, ry: 17 },
      "Gros intestin": { x: 380, y: 300, rx: 78, ry: 26 },
      "Intestin grêle": { x: 405, y: 270, rx: 58, ry: 29 },
      Pancréas: { x: 430, y: 240, rx: 30, ry: 12 },
      "Vésicule biliaire": { x: 455, y: 220, rx: 10, ry: 14 },
      Vessie: { x: 535, y: 325, rx: 22, ry: 17 },
      Ovaire: { x: 520, y: 280, rx: 11, ry: 8 },
      Testicule: { x: 555, y: 345, rx: 13, ry: 10 },
    },
  },
};

const ORGAN_COLORS = {
  Poumon: "#F0A6A6",
  Foie: "#A65D43",
  Estomac: "#E7A66A",
  Rate: "#9B6AA5",
  Rein: "#A75B65",
  "Gros intestin": "#D6A66C",
  "Intestin grêle": "#E9C28E",
  Pancréas: "#E9B9A0",
  "Vésicule biliaire": "#8DAF65",
  Vessie: "#E7C6A6",
  Ovaire: "#CE8EAF",
  Testicule: "#CE8EAF",
};

const BILATERAL = new Set(["Poumon", "Rein", "Ovaire", "Testicule"]);

const ORGAN_ORDER = [
  "Poumon",
  "Foie",
  "Estomac",
  "Rate",
  "Rein",
  "Ovaire",
  "Testicule",
  "Vessie",
  "Gros intestin",
  "Intestin grêle",
  "Pancréas",
  "Vésicule biliaire",
];

// Silhouette anatomique
function BodySilhouette({ species }) {
  return (
    <g>
      {species.forelegs.map((path, index) => (
        <path
          key={`fore-${index}`}
          d={path}
          fill="#F8FAFC"
          stroke="#94A3B8"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      ))}

      {species.hindlegs.map((path, index) => (
        <path
          key={`hind-${index}`}
          d={path}
          fill="#F8FAFC"
          stroke="#94A3B8"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      ))}

      <path
        d={species.neck}
        fill="#F8FAFC"
        stroke="#94A3B8"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d={species.body}
        fill="#F8FAFC"
        stroke="#94A3B8"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Axe dorsal */}
      <path
        d="M 155 105 Q 350 90 550 110"
        fill="none"
        stroke="#94A3B8"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Ligne sternale */}
      <path
        d="M 190 300 Q 350 340 530 305"
        fill="none"
        stroke="#CBD5E1"
        strokeWidth="2"
      />
    </g>
  );
}

// Vertèbres thoraciques
function VertebralAxis({ species }) {
  const cervicalCount = 7;
  const thoracicCount = species.ribCount;
  const lumbarCount = 6;

  const cervical = Array.from(
    { length: cervicalCount },
    (_, i) => ({
      x: 95 + i * 12,
      y: 105,
      type: "C",
    }),
  );

  const thoracic = Array.from(
    { length: thoracicCount },
    (_, i) => ({
      x:
        species.ribStart +
        (i / (thoracicCount - 1)) *
          (species.ribEnd - species.ribStart),
      y: 105,
      type: "T",
    }),
  );

  const lumbar = Array.from(
    { length: lumbarCount },
    (_, i) => ({
      x: 465 + i * 19,
      y: 105,
      type: "L",
    }),
  );

  const vertebrae = [...cervical, ...thoracic, ...lumbar];

  return (
    <g>
      {vertebrae.map((v, i) => (
        <g key={`${v.type}-${i}`}>
          <rect
            x={v.x - 5}
            y={v.y - 5}
            width="11"
            height="15"
            rx="3"
            fill="#CBD5E1"
            stroke="#8795A6"
            strokeWidth="1.3"
          />

          <path
            d={`M ${v.x} ${v.y - 5}
                L ${v.x - 3} ${v.y - 15}
                L ${v.x + 3} ${v.y - 15} Z`}
            fill="#E2E8F0"
            stroke="#8795A6"
            strokeWidth="1"
          />

          {v.type === "L" && (
            <path
              d={`M ${v.x} ${v.y + 3}
                  Q ${v.x + 12} ${v.y + 8}
                    ${v.x + 19} ${v.y + 10}`}
              fill="none"
              stroke="#8795A6"
              strokeWidth="2"
            />
          )}
        </g>
      ))}
    </g>
  );
}

// Cage thoracique en vue latérale
function RibCage({ species }) {
  const ribs = [];

  for (let i = 0; i < species.ribCount; i++) {
    const t = i / (species.ribCount - 1);

    const x = species.ribStart + t * (species.ribEnd - species.ribStart);

    const width = species.ribWidth * Math.sin((t * 0.85 + 0.1) * Math.PI);

    const height = species.ribHeight * Math.sin((t * 0.75 + 0.1) * Math.PI);

    const bottom = 285 + height * 0.05;

    ribs.push(
      <g key={i}>
        {/* Arc costal gauche */}
        <path
          d={`
            M ${x} 108
            C ${x - 20} 145,
              ${x - width * 0.45} 175,
              ${x - width * 0.55} 220
            C ${x - width * 0.55} 250,
              ${x - width * 0.25} ${bottom - 10},
              ${x + 5} ${bottom}
          `}
          fill="none"
          stroke="#A8B4C2"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>,
    );
  }

  return (
    <g pointerEvents="none">
      {ribs}
      <Sternum species={species} />
    </g>
  );
}

// Stermum
function Sternum({ species }) {
  const count = species.ribCount > 15 ? 7 : 6;

  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const x = 220 + i * 27;

        return (
          <g key={i}>
            <rect
              x={x}
              y="285"
              width="24"
              height="10"
              rx="4"
              fill="#CBD5E1"
              stroke="#8795A6"
              strokeWidth="1.4"
            />
          </g>
        );
      })}

      <path
        d="M 215 290 Q 310 305 405 290"
        fill="none"
        stroke="#8795A6"
        strokeWidth="2"
      />
    </g>
  );
}

// Scapulas
function Scapulas() {
  return (
    <g
      fill="#E2E8F0"
      stroke="#8795A6"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <path d="
        M 165 125
        Q 185 145 200 190
        Q 195 205 185 210
        L 155 155
        Z
      " />

      <path d="
        M 190 125
        Q 210 145 225 190
        Q 220 205 210 210
        L 180 155
        Z
      " />
    </g>
  );
}

// Formes de organes
function OrganShape({ name, organ, selected, available, disabled, onClick }) {
  const color = ORGAN_COLORS[name];
  const unavailable = !available || disabled;

  return (
    <g
      role="button"
      tabIndex={unavailable ? -1 : 0}
      aria-label={name}
      aria-pressed={selected}
      aria-disabled={unavailable}
      onClick={() => {
        if (!unavailable) onClick();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (!unavailable) onClick();
        }
      }}
      className={
        unavailable
          ? "cursor-not-allowed opacity-20"
          : "cursor-pointer transition-opacity hover:opacity-80"
      }
    >
      <title>
        {name} — {selected ? "Sélectionné" : "Non sélectionné"}
      </title>

      <ellipse
        cx={organ.x}
        cy={organ.y}
        rx={organ.rx}
        ry={organ.ry}
        fill={selected ? "#2563EB" : color}
        stroke={selected ? "#1D4ED8" : "#64748B"}
        strokeWidth={selected ? 4 : 2}
        opacity={selected ? 1 : 0.85}
      />

      <text
        x={organ.x}
        y={organ.y + organ.ry + 15}
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill={selected ? "#1D4ED8" : "#334155"}
        stroke="#FFFFFF"
        strokeWidth="3"
        paintOrder="stroke"
        pointerEvents="none"
      >
        {name}
      </text>
    </g>
  );
}

export default function AnatomicalViscera({
  zonages = [],
  selectedZonages = [],
  onToggle,
  disabled = false,
  onShowVisceralZones,
}) {
  const [speciesKey, setSpeciesKey] = useState("horse");
  const [activeFace, setActiveFace] = useState("D");

  const species = SPECIES[speciesKey];

  const availableZones = useMemo(() => {
    const map = new Map();

    zonages.forEach((zonage) => {
      const key = getZonageKey({
        ...zonage,
        Technique_Zonage: "",
      });

      if (!map.has(key)) {
        map.set(key, zonage);
      }
    });

    return map;
  }, [zonages]);

  const selectedZones = useMemo(
    () =>
      new Set(
        selectedZonages.map((item) =>
          getZonageKey({
            ...(item.Zonage ?? item),
            Technique_Zonage: "",
          }),
        ),
      ),
    [selectedZonages],
  );

  function getCandidate(name) {
    return {
      Nom_Zonage: name,
      Position_Zonage: "",
      Orientation_Zonage: BILATERAL.has(name) ? activeFace : "",
      Technique_Zonage: "",
    };
  }

  function isOrganSelected(name) {
    return selectedZones.has(getZonageKey(getCandidate(name)));
  }

  function getAvailableZone(name) {
    return availableZones.get(getZonageKey(getCandidate(name)));
  }

  function handleOrganToggle(name) {
    if (disabled) return;

    const available = getAvailableZone(name);

    if (!available) return;

    onToggle?.(available);
  }

  function renderOrgan(name) {
    const organ = species.organs[name];
    const available = getAvailableZone(name);

    return (
      <OrganShape
        key={name}
        name={name}
        organ={organ}
        selected={isOrganSelected(name)}
        available={Boolean(available)}
        disabled={disabled}
        onClick={() => handleOrganToggle(name)}
      />
    );
  }

  return (
    <div className="flex flex-col">
      {/* Espèces */}
      <div
        className="flex w-full shrink-0 justify-around border-b border-blue-100 bg-white"
        role="tablist"
        aria-label="Espèce animale"
      >
        {Object.entries(SPECIES).map(([key, item]) => (
          <TabButton
            key={key}
            label={item.label}
            tab={key}
            activeTab={speciesKey}
            setActiveTab={setSpeciesKey}
            className="!pt-1 !pb-2 mt-2"
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 p-3">
        {/* Faces */}
        <div
          className="flex justify-around rounded-lg border border-blue-100 bg-white p-1"
          role="tablist"
          aria-label="Face anatomique"
        >
          {[
            { key: "D", label: "Face droite" },
            { key: "G", label: "Face gauche" },
          ].map((face) => (
            <button
              key={face.key}
              type="button"
              role="tab"
              aria-selected={activeFace === face.key}
              onClick={() => setActiveFace(face.key)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${
                activeFace === face.key
                  ? "bg-blue-600 text-white"
                  : "text-blue-700 hover:bg-blue-50"
              }`}
            >
              {face.label}
            </button>
          ))}
        </div>

        {/* Schéma anatomique */}
        <div className="rounded-xl border border-blue-100 bg-white p-2 sm:p-4">
          <div className="mb-2 text-center text-sm font-semibold text-slate-600">
            {species.label} — Face {activeFace === "D" ? "droite" : "gauche"}
          </div>

          <svg
            viewBox={species.viewBox}
            width="100%"
            role="group"
            aria-label={`Schéma viscéral du ${species.label}, face ${activeFace}`}
            className="mx-auto block"
          >
            <defs>
              <linearGradient id="visceral-body" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
            </defs>

            {/* Silhouette */}
            <BodySilhouette species={species} />

            {/* Structures osseuses */}
            <VertebralAxis species={species} />
            <Scapulas />
            <RibCage species={species} />

            {/* Organes */}
            {ORGAN_ORDER.map(renderOrgan)}

            {/* Orientation */}
            <g
              fill="#64748B"
              fontSize="11"
              fontWeight="700"
              pointerEvents="none"
            >
              <text x="125" y="65">
                CRANIAL
              </text>
              <text x="520" y="65">
                CAUDAL
              </text>
              <text x="350" y="410" textAnchor="middle">
                RÉGION THORACO-ABDOMINALE
              </text>
            </g>
          </svg>
        </div>

        {/* Liste interactive des organes */}
        <div className="rounded-xl border border-blue-100 bg-white p-3">
          <div className="mb-2 text-sm font-semibold text-slate-700">
            Organes disponibles
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {ORGAN_ORDER.map((name) => {
              const available = Boolean(getAvailableZone(name));
              const selected = isOrganSelected(name);
              const unavailable = !available || disabled;

              return (
                <button
                  key={name}
                  type="button"
                  disabled={unavailable}
                  aria-pressed={selected}
                  onClick={() => handleOrganToggle(name)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                    selected
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : available
                        ? "border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-400 hover:bg-blue-100"
                        : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60"
                  }`}
                >
                  {name}
                  {BILATERAL.has(name) && ` ${activeFace}`}
                  {selected && " ✓"}
                </button>
              );
            })}
          </div>

          <Button
            onClick={onShowVisceralZones}
            className="w-full rounded-full border mx-auto mt-2 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
          >
            Voir la liste de tous les organes
          </Button>
        </div>
      </div>
    </div>
  );
}
