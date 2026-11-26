import { useEffect, useState } from "react";

import { WorkflowModal } from "../ui/Modal.jsx";
import Alert from "../alerts/Alert.jsx";
import ErrorModal from "../alerts/ErrorModal.jsx";
import useConfirm from "../../hooks/useConfirm.jsx";
import PrestationWorkflowPrestation from "./PrestationWorkflow_Prestation.jsx";
import { getConsultations } from "../../api/consultations.js";
import PrestationWorkflowConsultations from "./PrestationWorkflow_Consultations.jsx";
import PrestationWorkflowPaiements from "./PrestationWorkflow_Paiements.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getPrestation } from "../../api/prestations.js";
import {
  getAnimaux,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from "../../api/animaux.js";
import { createTarif } from "../../api/tarifs.js";
import AnimauxModal from "../modals/Animaux_Modal.jsx";
import TarifsModal from "../modals/Tarifs_Modal.jsx";
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
  onDeleted,
}) {
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("prestation");
  const [prestationId, setPrestationId] = useState(null);
  const [prestation, setPrestation] = useState(null);
  const [hasConsultations, setHasConsultations] = useState(false);
  const [consultations, setConsultations] = useState([]);

  const [createdAnimal, setCreatedAnimal] = useState(null);
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [animalSaving, setAnimalSaving] = useState(false);
  const [animalForm, setAnimalForm] = useState(emptyAnimalForm);
  const [editingAnimalId, setEditingAnimalId] = useState(null);
  const [animaux, setAnimaux] = useState([]);

  const [createdTarif, setCreatedTarif] = useState(null);
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

  // Create prestation
  function handleCreatedPrestation(newPrestation) {
    setPrestation(newPrestation);
    setPrestationId(newPrestation.ID_Prestation);

    setHasConsultations(
      (newPrestation.Consultations_Prestation ?? []).length > 0,
    );

    setActiveTab("consultations");
  }

  // Update prestation
  function handleUpdatedPrestation(updatedPrestation) {
    setPrestation(updatedPrestation);
    setPrestationId(updatedPrestation.ID_Prestation);

    setHasConsultations(
      (updatedPrestation.Consultations_Prestation ?? []).length > 0,
    );
  }

  // Delete prestation
  function handleDeletedPrestation(id) {
    setActiveTab("prestation");
    setPrestationId(null);
    setPrestation(null);
    setHasConsultations(false);
    setError("");

    onDeleted?.(id);
    onClose();
  }

  // Refresh prestation
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
      setShowErrorModal(true);
    }
  }

  // Create animal
  function handleAddAnimal(proprietaireId) {
    setError("");
    setEditingAnimalId(null);

    setAnimalForm({
      ...emptyAnimalForm,
      ID_Proprietaire: proprietaireId,
    });

    setCreatedAnimal(null);
    setShowAnimalModal(true);
  }

  // Edit animal
  async function handleEditAnimal(animal, options = {}) {
    if (!animal?.ID_Animal) {
      setError("Animal introuvable.");
      return;
    }

    setError("");
    setEditingAnimalId(animal.ID_Animal);

    setAnimalForm({
      ID_Proprietaire: animal.ID_Proprietaire ?? "",
      Nom_Animal: animal.Nom_Animal ?? "",
      Genre_Animal: animal.Genre_Animal ?? "",
      Race_Animal: animal.Race_Animal ?? "",
      Date_Naissance_Animal: animal.Date_Naissance_Animal
        ? String(animal.Date_Naissance_Animal).slice(0, 10)
        : "",
      Sexe_Animal: animal.Sexe_Animal ?? "",
      Memo_Animal: animal.Memo_Animal ?? "",
    });

    setCreatedAnimal(null);

    try {
      const data = await getConsultations();
      setConsultations(data);
      setShowAnimalModal(true);
    } catch (err) {
      setError(err.message || "Impossible de charger les consultations.");
      setShowErrorModal(true);
    }
  }

  // Update animal
  function handleAnimalChange(event) {
    const { name, value } = event.target;

    setAnimalForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // Delete animal
  async function handleDeleteAnimal(id) {
    const animal = animalForm.Nom_Animal || "cet animal";

    const consultationsCount = consultations.filter(
      (consultation) => String(consultation.ID_Animal) === String(id),
    ).length;

    await confirm({
      title: "Supprimer cet animal",

      message: `L'animal ${animal} va être définitivement supprimé.

      Attention : ${
        consultationsCount === 0
          ? "Aucune consultation n'est associée à cet animal."
          : consultationsCount === 1
            ? "La consultation associée va également être supprimée."
            : `Les ${consultationsCount} consultations associées vont également être supprimées.`
      }`,

      onConfirm: async () => {
        try {
          setAnimalSaving(true);
          setError("");

          await deleteAnimal(id);
          await refreshAnimaux();

          const updatedAnimaux = await getAnimaux();

          setAnimaux(updatedAnimaux);
          setCreatedAnimal(null);
          setShowAnimalModal(false);
          setEditingAnimalId(null);

          window.dispatchEvent(
            new CustomEvent("animal-deleted", {
              detail: { animalId: id },
            }),
          );
        } catch (err) {
          console.error("Erreur lors de la suppression de l'animal :", err);

          setError(err.message || "Impossible de supprimer cet animal.");

          setShowErrorModal(true);

          throw err;
        } finally {
          setAnimalSaving(false);
        }
      },
    });
  }

  // Save animal
  async function handleAnimalSubmit(event) {
    event.preventDefault();

    try {
      setAnimalSaving(true);
      setError("");

      const isEditingAnimal = editingAnimalId != null;

      const savedAnimal = isEditingAnimal
        ? await updateAnimal(editingAnimalId, animalForm)
        : await createAnimal(animalForm);

      const updatedAnimaux = await getAnimaux();

      setAnimaux(updatedAnimaux);

      const animalId = isEditingAnimal
        ? editingAnimalId
        : savedAnimal?.ID_Animal;

      const refreshedAnimal = updatedAnimaux.find(
        (item) => String(item.ID_Animal) === String(animalId),
      );

      if (!refreshedAnimal) {
        throw new Error(
          "L'animal a été enregistré, mais il est introuvable dans la liste.",
        );
      }

      setAnimaux(updatedAnimaux);
      setCreatedAnimal(refreshedAnimal);
      setShowAnimalModal(false);
      setEditingAnimalId(null);
    } catch (err) {
      setError(err.message);
      setShowErrorModal(true);
    } finally {
      setAnimalSaving(false);
    }
  }

  // Refresh animal
  async function refreshAnimaux() {
    try {
      const data = await getAnimaux();

      setAnimaux([...data]);

      return data;
    } catch (err) {
      console.error("Erreur lors du chargement des animaux :", err);
      throw err;
    }
  }

  // Create tarif
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

  // Update tarif
  function handleTarifChange(event) {
    const { name, value } = event.target;

    setTarifForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // Save tarif
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

  // On close form
  function handleClose() {
    setActiveTab("prestation");
    setPrestationId(null);
    setPrestation(null);
    setHasConsultations(false);
    setError("");

    onClose();
  }

  // Error
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
              number={"1. "}
              label="Prestation"
              tab="prestation"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <TabButton
              number={"2. "}
              label="Consultations"
              tab="consultations"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              disabled={!prestationId}
            />

            <TabButton
              number={"3. "}
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
              onDeleted={handleDeletedPrestation}
              onError={handleError}
              onProprietaireUpdated={refreshPrestation}
              onAnimalsChange={refreshAnimaux}
            />
          </div>

          {/* CONSULTATIONS */}
          {prestationId && (
            <div hidden={activeTab !== "consultations"}>
              <PrestationWorkflowConsultations
                currentUser={currentUser}
                prestationId={prestationId}
                prestation={prestation}
                onError={handleError}
                onConsultationsChange={(items) => {
                  setHasConsultations(items.length > 0);
                }}
                onAddAnimal={handleAddAnimal}
                onEditAnimal={handleEditAnimal}
                onAddTarif={handleAddTarif}
                createdAnimal={createdAnimal}
                createdTarif={createdTarif}
                onPrestationUpdated={refreshPrestation}
                animaux={animaux}
                refreshAnimaux={refreshAnimaux}
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
        editingId={editingAnimalId}
        form={animalForm}
        proprietaires={
          prestation?.Proprietaire_Prestation
            ? [prestation.Proprietaire_Prestation]
            : []
        }
        consultations={consultations}
        saving={animalSaving}
        onClose={() => {
          if (animalSaving) return;
          setShowAnimalModal(false);
          setEditingAnimalId(null);
        }}
        onSubmit={handleAnimalSubmit}
        onChange={handleAnimalChange}
        onDelete={handleDeleteAnimal}
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

      {ConfirmDialog}

      <ErrorModal
        open={showErrorModal}
        message={error}
        onClose={() => {
          setShowErrorModal(false);
          setError("");
        }}
      />
    </>
  );
}
