import { useState } from "react";
import AnatomicalSpine from "./AnatomicalSpine.jsx";
import AnatomicalMembers from "./AnatomicalMembers.jsx";
import AnatomicalViscera from "./AnatomicalViscera.jsx";
import { TabButton } from "../ui/Button.jsx";

export default function AnatomicalMap({
  zonages = [],
  selectedZonages = [],
  onToggle,
  disabled = false,
  mode = "articular",
  onShowVisceralZones,
}) {
  const [activeTab, setActiveTab] = useState("spine");

  // Mode viscéral : panneau indépendant
  if (mode === "viscera") {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-blue-50">
          <AnatomicalViscera
            zonages={zonages}
            selectedZonages={selectedZonages}
            onToggle={onToggle}
            disabled={disabled}
            onShowVisceralZones={onShowVisceralZones}
          />
        </div>
      </div>
    );
  }

  // Mode articulaire existant
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className="flex shrink-0 justify-around border-b border-blue-100 bg-white"
        role="tablist"
        aria-label="Région anatomique"
      >
        <TabButton
          label="Rachis"
          tab="spine"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          className="!pt-1 !pb-2 mt-2"
        />

        <TabButton
          label="Antérieurs"
          tab="anterior"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          className="!pt-1 !pb-2 mt-2"
        />

        <TabButton
          label="Postérieurs"
          tab="posterior"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          className="!pt-1 !pb-2 mt-2"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-blue-50 p-3">
        {activeTab === "spine" && (
          <AnatomicalSpine
            zonages={zonages}
            selectedZonages={selectedZonages}
            onToggle={onToggle}
            disabled={disabled}
          />
        )}

        {activeTab === "anterior" && (
          <AnatomicalMembers
            type="anterior"
            zonages={zonages}
            selectedZonages={selectedZonages}
            onToggle={onToggle}
            disabled={disabled}
          />
        )}

        {activeTab === "posterior" && (
          <AnatomicalMembers
            type="posterior"
            zonages={zonages}
            selectedZonages={selectedZonages}
            onToggle={onToggle}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}
