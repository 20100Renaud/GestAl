import { useEffect, useState } from "react";

import { WorkflowModal } from "../ui/Modal.jsx";
import Alert from "../ui/Alert.jsx";

import PrestationWorkflowPrestation from "./PrestationWorkflow_Prestation.jsx";
import PrestationWorkflowConsultations from "./PrestationWorkflow_Consultations.jsx";
import PrestationWorkflowPaiements from "./PrestationWorkflow_Paiements.jsx";
import { getPrestation } from "../../api/prestations.js";
import { createAnimal } from "../../api/animaux.js";
import { createTarif } from "../../api/tarifs.js";
import AnimauxModal from "./Animaux_Modal.jsx";
import TarifsModal from "./Tarifs_Modal.jsx";
import { TabButton } from "../ui/Button.jsx";

const emptyAnimalForm = {
  ID_Proprietaire: "",
  Nom_Animal: "",
  Genre_Animal: "",
  Race_Animal: "",
  Date_Naissance_Animal: "",
  Sexe_Animal: "",
  Memo_Animal: "",
};

const emptyTarifForm = {
  Annee_Tarif: String(new Date().getFullYear()),
  Montant_Tarif: "",
  Denomination_Tarif: "",
};

export default function PrestationWorkflowModal({
  open,
  prestation: initialPrestation = null,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("prestation");
  const [prestationId, setPrestationId] = useState(null);
  const [prestation, setPrestation] = useState(null);
  const [hasConsultations, setHasConsultations] = useState(false);
  const [error, setError] = useState("");

  const [createdAnimal, setCreatedAnimal] = useState(null);
  const [createdTarif, setCreatedTarif] = useState(null);

  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [animalSaving, setAnimalSaving] = useState(false);
  const [animalForm, setAnimalForm] = useState(emptyAnimalForm);

  const [showTarifModal, setShowTarifModal] = useState(false);
  const [tarifSaving, setTarifSaving] = useState(false);
  const [tarifError, setTarifError] = useState("");
  const [tarifForm, setTarifForm] = useState(emptyTarifForm);

  const isEditing = Boolean(initialPrestation);

  useEffect(() => {
    if (!open) {
      setActiveTab("prestation");
      setPrestationId(null);
      setPrestation(null);
      setHasConsultations(false);
      setError("");
      return;
    }

    if (initialPrestation) {
      setPrestation(initialPrestation);
      setPrestationId(initialPrestation.ID_Prestation);
      setHasConsultations(
        (initialPrestation.Consultations_Prestation ?? []).length > 0,
      );

      setActiveTab("prestation");
      setError("");
    } else {
      setPrestation(null);
      setPrestationId(null);
      setHasConsultations(false);
      setActiveTab("prestation");
      setError("");
    }
  }, [open, initialPrestation]);

  function handleCreatedPrestation(newPrestation) {
    setPrestation(newPrestation);
    setPrestationId(newPrestation.ID_Prestation);

    setHasConsultations(
      (newPrestation.Consultations_Prestation ?? []).length > 0,
    );

    setActiveTab("consultations");
  }

  function handleUpdatedPrestation(updatedPrestation) {
    setPrestation(updatedPrestation);
    setPrestationId(updatedPrestation.ID_Prestation);

    setHasConsultations(
      (updatedPrestation.Consultations_Prestation ?? []).length > 0,
    );
  }

  async function refreshPrestation() {
    if (!prestationId) {
      return;
    }

    try {
      const updatedPrestation = await getPrestation(prestationId);

      setPrestation(updatedPrestation);

      setHasConsultations(
        (updatedPrestation.Consultations_Prestation ?? []).length > 0,
      );
    } catch (err) {
      setError(err.message);
    }
  }

  function handleAddAnimal(proprietaireId) {
    setError("");

    setAnimalForm({
      ...emptyAnimalForm,
      ID_Proprietaire: proprietaireId,
    });

    setCreatedAnimal(null);
    setShowAnimalModal(true);
  }

  function handleAddTarif() {
    setError("");
    setTarifError("");

    setTarifForm({
      ...emptyTarifForm,
      Annee_Tarif: String(new Date().getFullYear()),
    });

    setCreatedTarif(null);
    setShowTarifModal(true);
  }

  function handleAnimalChange(event) {
    const { name, value } = event.target;

    setAnimalForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleTarifChange(event) {
    const { name, value } = event.target;

    setTarifForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleAnimalSubmit(event) {
    event.preventDefault();

    try {
      setAnimalSaving(true);
      setError("");

      const newAnimal = await createAnimal(animalForm);

      setCreatedAnimal(newAnimal);
      setShowAnimalModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnimalSaving(false);
    }
  }


  async function handleTarifSubmit(event) {
    event.preventDefault();

    try {
      setTarifSaving(true);
      setTarifError("");
      setError("");

      const newTarif = await createTarif(tarifForm);

      setCreatedTarif(newTarif);
      setShowTarifModal(false);
    } catch (err) {
      setTarifError(err.message);
    } finally {
      setTarifSaving(false);
    }
  }


  function handleClose() {
    setActiveTab("prestation");
    setPrestationId(null);
    setPrestation(null);
    setHasConsultations(false);
    setError("");

    onClose();
  }

  function handleError(message) {
    setError(message);
  }

  return (
    <>
      <WorkflowModal
        open={open}
        title={isEditing ? "Modifier la prestation" : "Nouvelle prestation"}
        onClose={handleClose}
        tabs={
          <div className="relative z-10 flex overflow-x-auto justify-around mt-2">
            <TabButton
              number={1}
              label="Prestation"
              tab="prestation"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <TabButton
              number={2}
              label="Consultations"
              tab="consultations"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              disabled={!prestationId}
            />

            <TabButton
              number={3}
              label="Paiements"
              tab="paiements"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              disabled={!prestationId || !hasConsultations}
            />
          </div>
        }
      >
        <div className="py-4">
          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          {/* PRESTATION */}
          <div hidden={activeTab !== "prestation"}>
            <PrestationWorkflowPrestation
              prestation={prestation}
              onCreated={handleCreatedPrestation}
              onUpdated={handleUpdatedPrestation}
              onError={handleError}
            />
          </div>

          {/* CONSULTATIONS */}
          {prestationId && (
            <div hidden={activeTab !== "consultations"}>
              <PrestationWorkflowConsultations
                prestationId={prestationId}
                prestation={prestation}
                onError={handleError}
                onConsultationsChange={(items) => {
                  setHasConsultations(items.length > 0);
                }}
                onAddAnimal={handleAddAnimal}
                onAddTarif={handleAddTarif}
                createdAnimal={createdAnimal}
                createdTarif={createdTarif}
                onPrestationUpdated={refreshPrestation}
              />
            </div>
          )}

          {/* PAIEMENTS */}
          {prestationId && (
            <div hidden={activeTab !== "paiements"}>
              <PrestationWorkflowPaiements
                prestationId={prestationId}
                prestation={prestation}
                onError={handleError}
                onPrestationUpdated={refreshPrestation}
              />
            </div>
          )}
        </div>
      </WorkflowModal>

      <AnimauxModal
        open={showAnimalModal}
        editingId={null}
        form={animalForm}
        proprietaires={
          prestation?.Proprietaire_Prestation
            ? [prestation.Proprietaire_Prestation]
            : []
        }
        saving={animalSaving}
        onClose={() => setShowAnimalModal(false)}
        onSubmit={handleAnimalSubmit}
        onChange={handleAnimalChange}
        onDelete={() => {}}
      />

      <TarifsModal
        open={showTarifModal}
        editingId={null}
        form={tarifForm}
        saving={tarifSaving}
        error={tarifError}
        onClose={() => setShowTarifModal(false)}
        onSubmit={handleTarifSubmit}
        onChange={handleTarifChange}
        onDelete={() => {}}
      />
    </>
  );
}
