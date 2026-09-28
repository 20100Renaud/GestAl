import { useEffect, useState } from "react";

import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import Alert from "../ui/Alert.jsx";

import PrestationWorkflowPrestation from "./PrestationWorkflow_Prestation.jsx";
import PrestationWorkflowConsultations from "./PrestationWorkflow_Consultations.jsx";
import PrestationWorkflowPaiements from "./PrestationWorkflow_Paiements.jsx";

export default function PrestationWorkflowModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState("prestation");
  const [prestationId, setPrestationId] = useState(null);
  const [prestation, setPrestation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setActiveTab("prestation");
      setPrestationId(null);
      setPrestation(null);
      setError("");
    }
  }, [open]);

  function handleCreatedPrestation(newPrestation) {
    setPrestation(newPrestation);
    setPrestationId(newPrestation.ID_Prestation);
    setActiveTab("consultations");
  }


  function handleClose() {
    setActiveTab("prestation");
    setPrestationId(null);
    setPrestation(null);
    setError("");
    onClose();
  }

  function handleError(message) {
    setError(message);
  }

  return (
    <Modal open={open} title="Nouvelle prestation" onClose={handleClose}>
      <div className="p-6">
        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {/* TABS */}
        <div className="mb-6 flex overflow-x-auto border-b border-blue-200">
          <button
            type="button"
            onClick={() => setActiveTab("prestation")}
            className={`
              whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium
              ${
                activeTab === "prestation"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-blue-500 hover:text-blue-700 cursor-pointer"
              }
            `}
          >
            1. Prestation
          </button>

          <button
            type="button"
            disabled={!prestationId}
            onClick={() => setActiveTab("consultations")}
            className={`
              whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium
              ${
                activeTab === "consultations"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-blue-500 cursor-pointer"
              }
              ${
                !prestationId
                  ? "cursor-not-allowed opacity-40"
                  : "hover:text-blue-700"
              }
            `}
          >
            2. Consultations
          </button>

          <button
            type="button"
            disabled={!prestationId}
            onClick={() => setActiveTab("paiements")}
            className={`
              whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium
              ${
                activeTab === "paiements"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-blue-500 cursor-pointer"
              }
              ${
                !prestationId
                  ? "cursor-not-allowed opacity-40"
                  : "hover:text-blue-700"
              }
            `}
          >
            3. Paiements
          </button>
        </div>

        {/* PRESTATION */}
        <div hidden={activeTab !== "prestation"}>
          <PrestationWorkflowPrestation
            onCreated={handleCreatedPrestation}
            onError={handleError}
          />
        </div>

        {/* CONSULTATIONS */}
        {prestationId && (
          <div hidden={activeTab !== "consultations"}>
            <PrestationWorkflowConsultations
              prestationId={prestationId}
              prestation={prestation}
              onNext={() => setActiveTab("paiements")}
              onError={handleError}
            />
          </div>
        )}

        {/* PAIEMENTS */}
        {prestationId && (
          <div hidden={activeTab !== "paiements"}>
            <PrestationWorkflowPaiements
              prestationId={prestationId}
              onError={handleError}
            />
          </div>
        )}

        {/* FOOTER */}
        {prestationId && (
          <div className="mt-6 flex justify-end border-t border-blue-100 pt-4">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Fermer
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
