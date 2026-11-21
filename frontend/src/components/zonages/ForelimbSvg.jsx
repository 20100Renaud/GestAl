const BONE_FILL = "#E2E8F0";
const BONE_STROKE = "#8795A6";

function Forelimb({ flip = false }) {
  return (
    <g transform={flip ? "translate(440 0) scale(-1 1)" : undefined}>
      <g transform="translate(40 -24) scale(0.9)">

        {/* Scapula */}
        <g transform="translate(0 0)">
          <path
            d="
              M 139.607 53.327 Q 152.535 29.67 181.691 69.639 Q 186.961 82.107 171.897 93.194 L 125.671 133.921 Q 119.818 120.078 110.909 121.841 C 96.36 117.173 112.016 110.899 118.751 102.496 Z
            "
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>

        {/* Humérus */}
        <g transform="translate(76 77) scale(0.8)">
          <path
            d="
              M 39.047 62.23 C 40.009 60.191 50.231 55.946 58.007 72.102 C 49.133 78.913 56.273 84.479 88.663 108.245 C 95.453 114.799 122.255 107.043 109.184 129.794 C 98.168 143.82 88.299 132.334 81.65 121.426 C 63.33 103.747 47.407 96.247 37.385 82.626 C 28.57 75.068 22.775 66.034 32.555 65.858 Z
            "
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>

        {/* Ulna */}
        <g transform="translate(181 184)">
          <path
            d="
              M -12.774 -2.259 C -11.315 -5.598 -2.945 -16.816 -11.503 12.7 C -17.339 29.684 -16.512 33.834 -16.356 40.834 C -16.742 52.957 -15.833 54.781 -20.942 64.385 C -19.539 65.431 -22.584 64.943 -21.86 59.198 C -20.349 41.981 -21.66 30.766 -19.141 20.082 C -16.896 6.457 -17.336 4.006 -13.657 -1.643 Z
            "
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>

        {/* Radius */}
        <g transform="translate(120 114)">
          <path
            d="
              M 35.269 74.698 C 43.165 74.619 52.466 58.635 42.723 85.644 C 40.594 98.155 43.209 111.237 42.661 124.437 C 43.643 135.532 45.342 139.848 38.336 142.183 C 34.507 142.701 28.62 147.911 30.899 133.986 C 33.756 111.865 33.807 103.904 30.945 92.749 C 24.012 74.989 22.548 73.13 35.269 74.698 Z
            "
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>

        {/* Carpe */}
        <g transform="translate(202 195) scale(0.9)">
          <path
            d="
              M -56.708 73.82 C -52.299 72.913 -50.751 72.634 -46.022 71.046 C -40.096 68.2 -40.706 71.87 -41.468 83.664 C -41.557 85.598 -55.958 84.688 -56.194 83.42 C -57.394 75.251 -57.81 74.284 -56.749 73.863
            "
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>

        {/* Métacarpe*/}
        <g transform="translate(165 589) scale(0.8)">
          <path
            d="
              M -6.427 -392.825 C -3.954 -392.765 -3.867 -392.94 -0.935 -393.483 C 9.66 -395.518 -9.743 -384.467 -6.411 -313.527 C -6.472 -311.263 -21.107 -307.285 -19.487 -314.62 C -8.011 -403.235 -28.037 -392.858 -6.351 -392.744 Z
          "
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>

        {/* P1 */}
        <g transform="translate(213 261) scale(1)">
          <path
            d="
            M -63.264 81.674 C -62.406 82.159 -59.849 83.057 -56.264 82.23 C -52.604 80.62 -57.1 85.216 -59.99 92.802 C -61.591 98.13 -68.681 93.868 -66.948 91.241 C -63.767 85.632 -67.097 78.551 -63.216 81.674
            "
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>

        {/* P2 */}
        <g transform="translate(218 269) scale(1)">
          <path
            d="
              M -72.297 88.62 C -71.582 89.404 -70.989 89.818 -69.807 90.256 C -66.86 90.794 -64.512 87.773 -71.1 98.787 C -73.076 101.15 -79.064 97.224 -77.398 95.956 C -72.8 92.578 -75.515 84.887 -72.249 88.62
            "
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>

        {/* P3 */}
        <g transform="translate(222.5 276.5) scale(1)">
          <path
            d="
            M -83.105 92.84 C -82.39 93.624 -81.797 94.038 -80.615 94.476 C -78.296 95.241 -74.181 92.452 -84.141 101.248 C -86.592 102.851 -91.742 99.862 -89.679 99.392 C -83.608 96.798 -86.323 89.107 -83.057 92.84
          "
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </g>
  );
}

export default function ForelimbSvg() {
  return (
    <g>
      <Forelimb />
      <Forelimb flip />
    </g>
  );
}
