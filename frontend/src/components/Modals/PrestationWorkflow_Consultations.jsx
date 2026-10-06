import { useEffect, useState } from "react";

import ConsultationsModal from "./Consultations_Modal.jsx";
import PrestationHeader from "../PrestationHeader.jsx";
import PrestationWorkflowZonages from "./PrestationWorkflow_Zonages.jsx";
import { Crosshair, Plus } from "lucide-react";
import {
  getConsultations,
  createConsultation,
  updateConsultation,
} from "../../api/consultations.js";

import { getAnimaux } from "../../api/animaux.js";
import { getTarifs } from "../../api/tarifs.js";

const emptyForm = {
  ID_Prestation: "",
  ID_Animal: "",
  ID_Tarif: "",
  Quantite_Consultation: "1",
  Motif_Consultation: "",
  Description_Consultation: "",
  Commentaire_Consultation: "",
};

export default function PrestationWorkflowConsultations({
  prestationId,
  prestation,
  onError,
  onConsultationsChange,
  onAddAnimal,
  onAddTarif,
  createdAnimal,
  createdTarif,
  onPrestationUpdated,
  onOpenPrestation,
}) {
  const [consultations, setConsultations] = useState([]);
  const [animaux, setAnimaux] = useState([]);
  const [tarifs, setTarifs] = useState([]);

  const [form, setForm] = useState({
    ...emptyForm,
    ID_Prestation: prestationId,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showZonages, setShowZonages] = useState(false);
  const [zonageConsultationId, setZonageConsultationId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Initialize prestation
  useEffect(() => {
    loadData();
  }, [prestationId]);

  // New animal
  useEffect(() => {
    if (!createdAnimal?.ID_Animal) {
      return;
    }

    setAnimaux((current) => {
      const exists = current.some(
        (animal) =>
          String(animal.ID_Animal) === String(createdAnimal.ID_Animal),
      );

      return exists ? current : [...current, createdAnimal];
    });

    setForm((current) => ({
      ...current,
      ID_Animal: String(createdAnimal.ID_Animal),
    }));
  }, [createdAnimal]);

  // New tarif
  useEffect(() => {
    if (!createdTarif) {
      return;
    }

    setTarifs((current) => {
      const exists = current.some(
        (tarif) => String(tarif.ID_Tarif) === String(createdTarif.ID_Tarif),
      );

      return exists ? current : [...current, createdTarif];
    });

    setForm((current) => ({
      ...current,
      ID_Tarif: String(createdTarif.ID_Tarif),
    }));
  }, [createdTarif]);

  async function loadData() {
    try {
      const [consultationsData, animauxData, tarifsData] = await Promise.all([
        getConsultations(),
        getAnimaux(),
        getTarifs(),
      ]);

      const filteredConsultations = consultationsData.filter(
        (item) => item.ID_Prestation === prestationId,
      );

      setConsultations(filteredConsultations);
      setAnimaux(animauxData);
      setTarifs(tarifsData);

      onConsultationsChange?.(filteredConsultations);
    } catch (err) {
      onError?.(err.message);
    }
  }

  // Update
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // Add a consultation
  function openCreateForm() {
    setEditingId(null);

    setForm({
      ...emptyForm,
      ID_Prestation: prestationId,
    });

    setShowForm(true);
  }

  // Edit a consultation
  function openEditForm(consultation) {
    setEditingId(consultation.ID_Consultation);

    setForm({
      ID_Prestation: prestationId,
      ID_Animal: consultation.ID_Animal ?? "",
      ID_Tarif: consultation.ID_Tarif ?? "",
      Quantite_Consultation: String(consultation.Quantite_Consultation ?? "1"),
      Motif_Consultation: consultation.Motif_Consultation || "",
      Description_Consultation: consultation.Description_Consultation || "",
      Commentaire_Consultation: consultation.Commentaire_Consultation || "",
    });

    setShowForm(true);
  }

  // On close the consultation modal
  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
  }

  // Animal
  function handleAddAnimal() {
    const proprietaireId =
      prestation?.ID_Proprietaire ??
      prestation?.Proprietaire_Prestation?.ID_Proprietaire ??
      null;

    if (!proprietaireId) {
      onError?.("Le propriétaire de la prestation est introuvable.");
      return;
    }

    onAddAnimal?.(proprietaireId);
  }

  // Save btn
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      onError?.("");

      let consultation;

      if (editingId) {
        consultation = await updateConsultation(editingId, form);
      } else {
        consultation = await createConsultation(form);
      }

      await loadData();
      await onPrestationUpdated?.();
      closeForm();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  }
  // Zonages
  function openZonages(consultationId) {
    setZonageConsultationId(consultationId);
    setShowZonages(true);
  }

  function closeZonages() {
    setShowZonages(false);
    setZonageConsultationId(null);
  }

  // Helpers
  const proprietaireId =
    prestation?.ID_Proprietaire ??
    prestation?.Proprietaire_Prestation?.ID_Proprietaire ??
    null;

  const filteredAnimaux = proprietaireId
    ? animaux.filter(
        (animal) => String(animal.ID_Proprietaire) === String(proprietaireId),
      )
    : [];

  return (
    <>
      <div className="space-y-6">
        <PrestationHeader prestation={prestation} />

        <div className="flex flex-wrap justify-center gap-3">
          {/* Add a consultation */}
          <button
            type="button"
            onClick={openCreateForm}
            disabled={saving}
            className="flex w-full max-w-[220px] min-h-[100px] items-center justify-center rounded-md border-2 border-dashed border-blue-300 p-4 text-blue-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-lg"
          >
            <span className="flex flex-col items-center text-sm">
              <Plus size={58} strokeWidth={1} />
              <span>Ajouter une consultation</span>
            </span>
          </button>

          {consultations.map((consultation) => {
            const animal = animaux.find(
              (item) => item.ID_Animal === consultation.ID_Animal,
            );

            const tarif = tarifs.find(
              (item) => item.ID_Tarif === consultation.ID_Tarif,
            );

            return (
              <div
                key={consultation.ID_Consultation}
                className="relative w-full max-w-[220px] min-h-[100px] shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => openEditForm(consultation)}
                  disabled={saving}
                  className="w-full min-h-[100px] rounded-md border border-blue-200 p-4 pt-6 text-left transition hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-medium text-blue-900">
                      {animal?.Nom_Animal ?? "Animal inconnu"}
                    </div>

                    <div className="text-sm text-blue-700">
                      {tarif
                        ? `${tarif.Denomination_Tarif} (${tarif.Montant_Tarif} €)`
                        : "-"}
                    </div>

                    <div className="truncate text-sm text-blue-600">
                      {consultation.Motif_Consultation || "Sans motif"}
                    </div>
                  </div>
                </button>

                {/* Zonages */}
                <div className="absolute right-0 top-0">
                  <button
                    type="button"
                    onClick={() => openZonages(consultation.ID_Consultation)}
                    disabled={saving}
                    className="rounded-tr-md rounded-bl-md border-t border-r border-blue-200 bg-green-100 px-2 py-0.5 text-green-700 hover:bg-green-200 cursor-pointer"
                  >
                    <Crosshair size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConsultationsModal
        open={showForm}
        editingId={editingId}
        form={form}
        prestation={prestation}
        prestations={prestation ? [prestation] : []}
        animaux={filteredAnimaux}
        tarifs={tarifs}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onDelete={() => {}}
        onOpenZonages={openZonages}
        onAddAnimal={handleAddAnimal}
        onAddTarif={() => onAddTarif?.()}
        onOpenPrestation={onOpenPrestation}
      />

      <PrestationWorkflowZonages
        open={showZonages}
        consultationId={zonageConsultationId}
        onClose={closeZonages}
        onSaved={loadData}
        onError={onError}
      />
    </>
  );
}
