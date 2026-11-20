import { useState } from "react";
import AnatomicalSpine from "./AnatomicalSpine.jsx";
import AnatomicalMembers from "./AnatomicalMembers.jsx";
import { TabButton } from "../ui/Button.jsx";

export default function AnatomicalMap({
  zonages = [],
  selectedZonages = [],
  onToggle,
  disabled = false,
}) {
  const [activeTab, setActiveTab] = useState("spine");

  return (
    <div className="overflow-hidden rounded-xl border border-blue-100 bg-white">
      {/* TABS */}
      <div
        className="flex border-y border-blue-100 justify-around"
        role="tablist"
        aria-label="Région anatomique"
      >
        <TabButton
          label="Colonne vertébrale"
          tab="spine"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <TabButton
          label="Membres"
          tab="members"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* CONTENT */}
      <div className="p-3">
        <div role="tabpanel" hidden={activeTab !== "spine"}>
          <AnatomicalSpine
            zonages={zonages}
            selectedZonages={selectedZonages}
            onToggle={onToggle}
            disabled={disabled}
          />
        </div>

        <div role="tabpanel" hidden={activeTab !== "members"}>
          <AnatomicalMembers
            zonages={zonages}
            selectedZonages={selectedZonages}
            onToggle={onToggle}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
