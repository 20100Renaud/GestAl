import { useMemo } from "react";
import AnatomicalSpine from "./AnatomicalSpine.jsx";
import AnatomicalMembers from "./AnatomicalMembers.jsx";

function getSelectionCount(selectedZonages) {
  return selectedZonages.length;
}

export default function AnatomicalMap({
  zonages = [],
  selectedZonages = [],
  onToggle,
  disabled = false,
}) {
  const selectionCount = useMemo(
    () => getSelectionCount(selectedZonages),
    [selectedZonages],
  );

  return (
    <div className="space-y-4">

      {/* Colonne vertébrale */}
      <details className="group overflow-hidden rounded-xl border border-blue-100 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between bg-blue-50/50 px-4 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-50">
          <span>Colonne vertébrale</span>

          <svg
            className="h-4 w-4 transition-transform group-open:rotate-180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>

        <div className="border-t border-blue-100 p-3">
          <AnatomicalSpine
            zonages={zonages}
            selectedZonages={selectedZonages}
            onToggle={onToggle}
            disabled={disabled}
          />
        </div>
      </details>

      {/* Membres */}
      <details className="group overflow-hidden rounded-xl border border-blue-100 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between bg-blue-50/50 px-4 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-50">
          <span>Membres antérieurs et postérieurs</span>

          <svg
            className="h-4 w-4 transition-transform group-open:rotate-180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>

        <div className="border-t border-blue-100 p-3">
          <AnatomicalMembers
            zonages={zonages}
            selectedZonages={selectedZonages}
            onToggle={onToggle}
            disabled={disabled}
          />
        </div>
      </details>
    </div>
  );
}
