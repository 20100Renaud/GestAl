import { useMemo } from "react";
import { getZonageKey } from "./anatomyConfig.js";

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

const SECTIONS = [
  { label: "Cervicales", prefix: "C", count: 7, start: 1 },
  { label: "Thoraciques", prefix: "T", count: 18, start: 1 },
  { label: "Lombaires", prefix: "L", count: 7, start: 1 },
];

const CENTER = 220;
const ROW_HEIGHT = 20;
const SECTION_GAP = 24;

function buildAnatomy() {
  let y = 140;

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

// Dessin des vertèbres
function VertebraBone({ y, index, section }) {
  const width = section === "C" ? 25 : section === "T" ? 31 : 38;

  const half = width / 2;

  return (
    <g transform={`translate(${CENTER}, ${y})`}>
      {/* Processus épineux */}
      <path
        d="
          M -5 0
          L -10 -10
          L 0 -15
          L 10 -10
          L 5 0
          Z
        "
        fill="#E2E8F0"
        stroke="#8795A6"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Processus transverse gauche */}
      <path
        d={`
          M ${-half} -4
          Q ${-half - 7} -7 ${-half - 15} -8
          Q ${-half - 20} -10 ${-half - 23} -9
          Q ${-half - 29} -7 ${-half - 27} -4
          Q ${-half - 23} 2 ${-half - 20} 5
          Q ${-half - 12} 9 ${-half} 7
          Z
        `}
        fill="#E2E8F0"
        stroke="#8795A6"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Processus transverse droit */}
      <path
        d={`
          M ${half} -4
          Q ${half + 7} -7 ${half + 15} -8
          Q ${half + 20} -10 ${half + 23} -9
          Q ${half + 29} -7 ${half + 27} -4
          Q ${half + 23} 2 ${half + 20} 5
          Q ${half + 12} 9 ${half} 7
          Z
        `}
        fill="#E2E8F0"
        stroke="#8795A6"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Corps vertébral */}
      <rect
        x={-half}
        y={-5}
        width={width}
        height="12"
        rx="5"
        ry="5"
        fill="#CBD5E1"
        stroke="#8795A6"
        strokeWidth="1.2"
      />
    </g>
  );
}

// Btns colonne
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
      className={`
        transition-opacity focus:outline-none focus:ring-0
        ${unavailable ? "cursor-not-allowed opacity-[0.18]" : "cursor-pointer"}
      `}
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
        rx="8"
        className={`
          transition-all duration-150
          ${selected ? style.active : style.inactive}
          ${unavailable ? "" : "hover:brightness-90"}
        `}
        strokeWidth={selected ? 2 : 1}
      />

      <text
        x={x + width / 2}
        y={y + height / 2 + 3}
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

// Dessin côtes thoraciques
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

// Dessin d'une moitier de la silhouette (gauche)
function buildSilhouette(points) {
  const { top, neck, thoraxStart, thoraxEnd, lumbarStart, bottom } = points;

  const CENTER = 220;

  const thoraxWidth = 155;
  const lumbarWidth = 112;
  const neckWidth = 42;
  const pelvisWidth = 105;

  return `
    M ${CENTER} ${top}

    C 185 ${top}
      160 ${top + 25}
      160 ${top + 55}

    C 160 ${neck - 35}
      185 ${neck - 80}
      ${CENTER - neckWidth} ${neck - 20}

    C 165 ${neck + 205}
      115 ${thoraxStart - 35}
      108 ${thoraxStart + 15}

    C 102 ${thoraxStart + 55}
      ${CENTER - thoraxWidth + 5} ${thoraxStart + 75}
      ${CENTER - thoraxWidth} ${thoraxStart + 125}

    C ${CENTER - thoraxWidth - 5} ${thoraxStart + 175}
      ${CENTER - thoraxWidth - 5} ${thoraxEnd - 100}
      ${CENTER - thoraxWidth + 2} ${thoraxEnd - 55}

    C ${CENTER - thoraxWidth + 5} ${thoraxEnd + 5}
      125 ${thoraxEnd + 55}
      115 ${thoraxEnd + 90}

    C 115 ${lumbarStart + 15}
      115 ${lumbarStart + 65}
      ${CENTER - lumbarWidth} ${lumbarStart + 145}

    C ${200 - lumbarWidth} ${lumbarStart + 180}
      ${200 - pelvisWidth} ${bottom + 50}
      ${CENTER} ${bottom + 15}
  `;
}

// Dessin d'une moitié du sacrum (droite)
function buildSacrum() {
  return `
    M 217 213
    C 273 213 247 224 239 231
    C 228 244 229 247 217 249
  `;
}

// Dessin de la colonne vertébrale.
export default function AnatomicalSpine({
  zonages = [],
  selectedZonages = [],
  onToggle,
  disabled = false,
}) {
  const anatomy = useMemo(() => buildAnatomy(), []);

  const anatomyPoints = useMemo(() => {
    const findY = (label) =>
      anatomy.vertebrae.find((v) => v.label === label)?.y;

    return {
      top: 8,
      neck: findY("C1"),
      thoraxStart: findY("T1"),
      thoraxEnd: findY("T18"),
      lumbarStart: findY("L1"),
      bottom: anatomy.height - 25,
    };
  }, [anatomy]);

  const vertebraY = useMemo(() => {
    const find = (label) => anatomy.vertebrae.find((v) => v.label === label)?.y;

    return {
      C0: find("C1"),
      T1: find("T1"),
      T16: find("T18"),
      L1: find("L1"),
    };
  }, [anatomy]);

  const availableZones = useMemo(() => {
    return new Map(zonages.map((zonage) => [getZonageKey(zonage), zonage]));
  }, [zonages]);

  const selectedZones = useMemo(() => {
    return new Set(
      selectedZonages.map((item) => getZonageKey(item.Zonage ?? item)),
    );
  }, [selectedZonages]);

  // Rendu des zones de la colonne
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
        y={vertebra.y}
        width={21}
        height={13}
        zonage={candidate}
        selected={selectedZones.has(key)}
        available={available}
        disabled={disabled}
        onToggle={onToggle}
      />
    );
  }

  // Rendu des zones du bassin
  function renderPelvisZone(nom, orientation, technique, x, y) {
    const candidate = {
      Nom_Zonage: nom,
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
        width={20}
        height={13}
        zonage={candidate}
        selected={selectedZones.has(key)}
        available={available}
        disabled={disabled}
        onToggle={onToggle}
      />
    );
  }

  // Bassin anatomique
  function Pelvis({ bottom }) {
    const offset = bottom - 255;

    return (
      <g transform={`translate(0, ${offset})`}>
        {/* ILIUM GAUCHE */}
        <path
          d="
          M 213 215
          C 202 205 185 190 166 184
          C 151 179 139 186 137 198
          C 135 211 148 224 162 237
          C 175 248 186 261 195 270
          L 216 250
          Z
        "
          fill="#E2E8F0"
          stroke="#8795A6"
          strokeWidth="1.2"
        />

        {/* ILIUM DROIT */}
        <path
          d="
          M 227 215
          C 238 205 255 190 274 184
          C 289 179 301 186 303 198
          C 305 211 292 224 278 237
          C 265 248 254 261 245 270
          L 224 250
          Z
        "
          fill="#E2E8F0"
          stroke="#8795A6"
          strokeWidth="1.2"
        />

        {/* Crêtes iliaques */}
        <g fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round">
          <path d="M 137 198 Q 140 177 166 184" />
          <path d="M 303 198 Q 300 177 274 184" />
        </g>

        {/* SACRUM */}
        <g fill="#CBD5E1" stroke="#8795A6" strokeWidth="1.22">
          <path d={buildSacrum()} />
          <path d={buildSacrum()} transform="translate(440 0) scale(-1 1)" />
        </g>

        {/* SACRO-ILIAQUES */}
        <g fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round">
          <path d="M 200 213 Q 173 215 199 231" />
          <path
            d="M 200 213 Q 173 215 199 231"
            transform="translate(440 0) scale(-1 1)"
          />
        </g>

        {/* COXO-FÉMORALES */}
        <g fill="#FFFFFF" stroke="#64748B" strokeWidth="2">
          <circle cx="169" cy="250" r="9" />
          <circle cx="271" cy="250" r="9" />
        </g>

        <g fill="#64748B">
          <circle cx="169" cy="250" r="3" />
          <circle cx="271" cy="250" r="3" />
        </g>

        {/* NOMS DES STRUCTURES ANATOMIQUES */}
        <g
          fill="#334155"
          fontSize="10"
          fontWeight="700"
          textAnchor="middle"
          pointerEvents="none"
        >
          {/* Ilium gauche et droit */}
          <g>
            <rect
              x="200"
              y="182"
              width="40"
              height="18"
              rx="4"
              fill="#F8FAFC"
              opacity="0.95"
            />

            <text
              x="220"
              y="195"
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#334155"
            >
              Ilium
            </text>
          </g>

          {/* Articulations sacro-iliaques */}
          <g>
            <rect
              x="200"
              y="213"
              width="40"
              height="20"
              rx="4"
              fill="#F8FAFC"
              opacity="0.65"
            />

            <text
              x="220"
              y="223"
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#334155"
            >
              Sacro-
            </text>
          </g>
          {/* Articulations sacro-iliaques */}
          <text x="220" y="232">
            Iliaque
          </text>

          {/* Articulations coxo-fémorales */}
          <g>
            <rect
              x="180"
              y="243"
              width="80"
              height="18"
              rx="4"
              fill="#F8FAFC"
              opacity="0.65"
            />

            <text
              x="220"
              y="255"
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#334155"
            >
              Coxo-fémorale
            </text>
          </g>
        </g>
      </g>
    );
  }

  return (
    <div className="w-full">
      {/* Légende */}
      <div className="rounded-xl border border-blue-100 bg-white p-3">
        <div className="flex flex-wrap justify-around gap-4 text-xs py-2">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-blue-600" />
            Tissulaire
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-green-600" />
            Articulaire
          </span>
        </div>

        {/* Zone de selection */}
        <div className="w-full">
          <svg
            viewBox={`0 0 440 ${anatomy.height}`}
            width="100%"
            role="group"
            aria-label="Sélection anatomique de la colonne vertébrale"
            className="mx-auto block"
          >
            <defs>
              <linearGradient id="Bone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>
            </defs>
            {/* ------- Silhouette ------ */}
            <g>
              <path
                d={buildSilhouette(anatomyPoints)}
                fill="#F8FAFC"
                stroke="#E2E8F0"
                strokeWidth="2"
              />
              <path
                d={buildSilhouette(anatomyPoints)}
                transform="translate(440 0) scale(-1 1)"
                fill="#F8FAFC"
                stroke="#E2E8F0"
                strokeWidth="2"
              />
            </g>
            {/* ------- Axe vertébral pointillé -------- */}
            <path
              d={`M 220 95 V ${anatomy.height - 30}`}
              stroke="#94A3B8"
              strokeWidth="2"
              strokeDasharray="4 5"
            />
            {/* ------- Tête ------- */}
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
            {/* Zones anatomiques de la tête */}
            <g>
              {/* ATM gauche */}
              <circle
                cx="190"
                cy="55"
                r="5"
                fill="#FFFFFF"
                stroke="#475569"
                strokeWidth="3"
              />
              {/* ATM droite */}
              <circle
                cx="250"
                cy="55"
                r="5"
                fill="#FFFFFF"
                stroke="#475569"
                strokeWidth="3"
              />
              {/* Os Hyoïd */}
              <path
                d="
                  M 207 76
                  Q 220 69 233 76
                  M 207 76
                  Q 220 84 233 76
                "
                fill="#FFFFFF"
                stroke="#475569"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* C0 */}
              <path
                d="
                  M 210 86
                  Q 220 94 230 86
                "
                fill="none"
                stroke="#475569"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
            {/* Noms */}
            <g
              fill="#334155"
              fontSize="10"
              fontWeight="700"
              textAnchor="middle"
              pointerEvents="none"
            >
              <text x="220" y="55">
                ATM
              </text>
              <text x="220" y="68">
                Os Hyoïd
              </text>
              <g>
                <rect
                  x="205"
                  y="95"
                  width="30"
                  height="12"
                  rx="4"
                  fill="#FFFFFF"
                />
                <text
                  x="220"
                  y="105"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#334155"
                >
                  C0
                </text>
              </g>
            </g>
            {/* Section pointillée de la tête */}
            <g>
              <rect
                x="12"
                y="3"
                width="416"
                height="110"
                rx="10"
                fill="#0452fa21"
                fillOpacity="0.12"
                stroke="#CBD5E1"
                strokeDasharray="3 4"
              />
              <text
                x="220"
                y="20"
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                letterSpacing="1.2"
                fill="#64748B"
              >
                TÊTE
              </text>
            </g>
            {/* Btns de la tête */}
            <g>
              {/* ATM */}
              {renderPelvisZone("ATM", "G", "Tissulaire", 125, 50)}
              {renderPelvisZone("ATM", "G", "Articulaire", 150, 50)}
              {renderPelvisZone("ATM", "D", "Tissulaire", 270, 50)}
              {renderPelvisZone("ATM", "D", "Articulaire", 295, 50)}
              {/* Os Hyoïd */}
              {renderPelvisZone("Os Hyoïd", "G", "Tissulaire", 125, 70)}
              {renderPelvisZone("Os Hyoïd", "G", "Articulaire", 150, 70)}
              {renderPelvisZone("Os Hyoïd", "D", "Tissulaire", 270, 70)}
              {renderPelvisZone("Os Hyoïd", "D", "Articulaire", 295, 70)}
              {/* C0 */}
              {renderPelvisZone("C0", "G", "Tissulaire", 125, 90)}
              {renderPelvisZone("C0", "G", "Articulaire", 150, 90)}
              {renderPelvisZone("C0", "D", "Tissulaire", 270, 90)}
              {renderPelvisZone("C0", "D", "Articulaire", 295, 90)}
            </g>
            {/* ------ Section anatomique du bassin ------ */}
            {(() => {
              const offset = anatomyPoints.bottom - 245;
              return (
                <g>
                  {/* Section pointillée du bassin*/}
                  <rect
                    x="12"
                    y={offset + 155}
                    width="416"
                    height="100"
                    rx="10"
                    fill="#0452fa21"
                    fillOpacity="0.20"
                    stroke="#CBD5E1"
                    strokeDasharray="3 4"
                  />
                  {/* Titre */}
                  <text
                    x="220"
                    y={offset + 170}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    letterSpacing="1.2"
                    fill="#64748B"
                  >
                    BASSIN
                  </text>
                </g>
              );
            })()}
            {/* Dessin anatomique du bassin */}
            <Pelvis bottom={anatomyPoints.bottom} />
            {/* Zones interactives du bassin */}
            {(() => {
              const offset = anatomyPoints.bottom - 255;
              const structures = [
                { nom: "Ilium", y: offset + 190 },
                { nom: "Sacro-iliaque", y: offset + 216 },
                { nom: "Coxo", y: offset + 242 },
              ];
              return (
                <g>
                  {structures.map(({ nom, y }) => (
                    <g key={nom}>
                      {renderPelvisZone(nom, "G", "Tissulaire", 85, y)}
                      {renderPelvisZone(nom, "G", "Articulaire", 110, y)}
                      {renderPelvisZone(nom, "D", "Tissulaire", 310, y)}
                      {renderPelvisZone(nom, "D", "Articulaire", 335, y)}
                    </g>
                  ))}
                </g>
              );
            })()}
            {/* Section pointillée de la colonne */}
            {anatomy.sections.map((section) => (
              <g key={section.prefix}>
                <rect
                  x="12"
                  y={section.startY - 15}
                  width="416"
                  height={section.endY - section.startY + 10}
                  rx="10"
                  fill="#0452fa21"
                  fillOpacity="0.20"
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
            {/* Vertèbres et zones interactives */}
            {anatomy.vertebrae.map((vertebra) => (
              <g key={vertebra.label}>
                <VertebraBone y={vertebra.y} section={vertebra.section} />
                {/* Gauche */}
                {renderZone(vertebra, "G", "Tissulaire", 125)}
                {renderZone(vertebra, "G", "Articulaire", 150)}
                {/* Identification */}
                <text
                  x="220"
                  y={vertebra.y + 5}
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                  fill="#334155"
                  pointerEvents="none"
                >
                  {vertebra.label}
                </text>
                {/* Droite */}
                {renderZone(vertebra, "D", "Tissulaire", 270)}
                {renderZone(vertebra, "D", "Articulaire", 294)}
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
