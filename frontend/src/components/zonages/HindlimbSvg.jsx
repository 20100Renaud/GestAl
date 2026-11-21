const BONE_FILL = "#E2E8F0";
const BONE_STROKE = "#8795A6";

function Hindlimb({ flip = false }) {
  return (
    <g transform={flip ? "translate(440 0) scale(-1 1)" : undefined}>
      <g transform="translate(40 -24) scale(1)">
        {/* Ilium */}
        <g transform="translate(70 40) scale(1.2)">
          <path
            d="M 51.622 57.494
              C 42.749 32.22 25.2 33.84 15.637 38.068
              C 0.991 40.556 15.457 29.449 14.178 14.433
              C 13.258 9.872 33.659 0.562 42.727 14.861
              C 54.078 35.425 57.802 37.603 62.598 36.506
              C 70.024 34.884 71.431 44.536 87.096 59.533
              C 85.173 62.801 83.01 63.398 79.15 65.056
              C 75.599 66.196 68.206 63.379 61.552 60.848
              Z"
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="2"
          />
        </g>

        {/* SP */}
        <g transform="translate(170 85) scale(0.2)">
          <path
            d="M 16 127.5
            H 84
            A 6 6 0 0 1 90 133.5
            V 150.167
            A 6 6 0 0 1 84 156.167
            H 16
            A 6 6 0 0 1 10 150.167
            V 133.5
            A 6 6 0 0 1 16 127.5
            Z"
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="8"
          />
        </g>

        {/* Fémur */}
        <g transform="translate(110 5) scale(1.8 2)">
          <path
            d="M 8.3 66.289 C 20.43 50.349 9.21 44.878 18.102 46.108 C 27.816 48.95 20.67 53.584 19.252 56.123 C 18.049 59.292 14.58 65.906 12.602 67.882 C 8.186 73.675 -0.84 81.463 -3.84 85.439 C -9.573 90.098 -4.933 92.091 -9.945 94.387 C -13.869 96.358 -16.211 85.47 -11.628 85.151 C -8.857 83.274 -2.646 77.601 -0.142 74.128 Z"
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="1.2"
          />
        </g>

        {/* Fibula */}
        <g transform="translate(59.5 70) scale(1.6 2)">
          <path
            d="M 27.088 70.06 C 24.764 66.102 23.566 66.052 21.279 63.82 C 28.266 61.28 25.978 63.358 29.84 67.174 C 33.013 70.64 33.09 71.571 37.359 79.391 C 33.335 74.49 33.089 75.251 30.868 72.911 Z"
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="1.2"
          />
        </g>

        {/* Tibia */}
        <g transform="translate(85 37) scale(1.6 2)">
          <path
            d="M 7.118 86.763 C -0.513 79.688 3.584 80.339 5.495 80.029 C 10.192 79.672 8.19 82.657 13.24 87.508 C 16.145 90.21 22.253 95.319 32.056 111.173 C 33.456 113.571 37.717 114.599 33.712 116.413 C 27.365 119.818 29.063 114.52 28.365 112.546 C 27.376 109.585 27.208 109.451 25.444 106.471 C 18.127 95.815 12.662 91.882 10.653 90.07 Z"
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="1.2"
          />
        </g>

        {/* Jarret */}
        <g transform="translate(59 112) scale(1.6)">
          <path
            d="M 52.718 99.967 C 53.56 96.193 51.564 93.571 54.416 94.351 C 56.153 94.972 55.367 97.541 55.127 101.86 C 55.319 105.876 52.614 105.638 49.596 103.542 C 45.66 100.923 52.828 100.79 52.642 100.045 Z"
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="1.4"
          />
        </g>

        {/* Métatarse */}
        <g transform="translate(32 140) scale(1.6)">
          <path
            d="M 63.975 89.49 C 64.993 87.394 65.437 87.63 67.986 88.969 C 71.664 91.435 60.599 98.533 59.521 112.138 C 59.289 113.796 55.313 114.535 55.634 111.861 C 57.277 104.518 60.255 99.816 62.361 93.544 Z"
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="1.4"
          />
        </g>

        {/* P1 */}
        <g transform="translate(116 258) scale(0.8)">
          <path
            d="M 5.417 81.674
                C 6.275 82.159 8.832 83.057 12.417 82.23
                C 16.077 80.62 11.581 85.216 8.691 92.802
                C 7.09 98.13 0 93.868 1.733 91.241
                C 4.914 85.632 1.584 78.551 5.465 81.674"
            fill={BONE_FILL}
            stroke={BONE_STROKE}
            strokeWidth="2.4"
          />

          {/* P2 */}
          <g transform="translate(-6.5 8) scale(1)">
            <path
              d="M 6.767 88.62
              C 7.482 89.404 8.075 89.818 9.257 90.256
              C 12.204 90.794 14.552 87.773 7.964 98.787
              C 5.988 101.15 0 97.224 1.666 95.956
              C 6.264 92.578 3.549 84.887 6.815 88.62"
              fill={BONE_FILL}
              stroke={BONE_STROKE}
              strokeWidth="2"
            />
          </g>
        </g>

        {/* P3 */}
        <g transform="translate(47 270) scale(0.8)">
          <path
            d="
              M 79.389 94.166
              C 80.104 94.95 80.697 95.364 81.879 95.802
              C 84.198 96.567 88.313 93.778 78.353 102.574
              C 75.902 104.177 70.752 101.188 72.815 100.718
              C 78.886 98.124 76.171 90.433 79.437 94.166
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

export default function HindlimbSvg() {
  return (
    <g>
      <Hindlimb />
      <Hindlimb flip />
    </g>
  );
}
