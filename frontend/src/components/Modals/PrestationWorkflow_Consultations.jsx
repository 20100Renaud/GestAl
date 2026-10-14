import { useEffect, useState } from "react";

import ConsultationsModal from "./Consultations_Modal.jsx";
import PrestationHeader from "../PrestationHeader.jsx";
import PrestationWorkflowZonages from "./PrestationWorkflow_Zonages.jsx";
import { Crosshair, Plus } from "lucide-react";
import { getProprietaires } from "../../api/proprietaires.js";
import {
  getConsultations,
  createConsultation,
  updateConsultation,
} from "../../api/consultations.js";
import { getConsultationZonages } from "../../api/consultation-zonages.js";
import { getAnimaux } from "../../api/animaux.js";
import { getTarifs } from "../../api/tarifs.js";
import { getZonages } from "../../api/zonages.js";
import { openConsultationPdf } from "../../utils/generateConsultationPdf.js";

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
  currentUser,
  onError,
  onConsultationsChange,
  onAddAnimal,
  onAddTarif,
  createdAnimal,
  createdTarif,
  onPrestationUpdated,
  onOpenPrestation,
}) {
  const [proprietaires, setProprietaires] = useState([]);
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
  const [zonagesByConsultation, setZonagesByConsultation] = useState({});

  async function loadData() {
    try {
      const [
        proprietairesData,
        consultationsData,
        animauxData,
        tarifsData,
        zonagesData,
      ] = await Promise.all([
        getProprietaires(),
        getConsultations(),
        getAnimaux(),
        getTarifs(),
        getZonages(),
      ]);

      setProprietaires(proprietairesData);

      const filteredConsultations = consultationsData.filter(
        (item) => String(item.ID_Prestation) === String(prestationId),
      );

      const associations = await Promise.all(
        filteredConsultations.map(async (consultation) => {
          const selected = await getConsultationZonages(
            consultation.ID_Consultation,
          );

          const matchedZonages = selected
            .map((item) => {
              const zonage = zonagesData.find(
                (z) => String(z.ID_Zonage) === String(item.ID_Zonage),
              );

              return zonage
                ? {
                    ...zonage,
                    Commentaire_Zonage: item.Commentaire_Zonage ?? "",
                  }
                : null;
            })
            .filter(Boolean);

          return [consultation.ID_Consultation, matchedZonages];
        }),
      );

      setConsultations(filteredConsultations);
      setAnimaux(animauxData);
      setTarifs(tarifsData);
      setZonagesByConsultation(Object.fromEntries(associations));

      onConsultationsChange?.(filteredConsultations);
    } catch (err) {
      onError?.(err.message);
    }
  }

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

  const lieu =
    proprietaires.find(
      (item) => String(item.ID_Proprietaire) === String(prestation?.ID_Lieu),
    ) ?? null;

  function handleOpenPdf() {
    try {
      if (!editingId) {
        onError?.(
          "Enregistrez la consultation avant de générer son compte rendu.",
        );
        return;
      }

      const consultation = consultations.find(
        (item) => String(item.ID_Consultation) === String(editingId),
      );

      if (!consultation) {
        onError?.("Consultation introuvable.");
        return;
      }

      const animal = animaux.find(
        (item) => String(item.ID_Animal) === String(consultation.ID_Animal),
      );

      const tarif = tarifs.find(
        (item) => String(item.ID_Tarif) === String(consultation.ID_Tarif),
      );

      const zonages = zonagesByConsultation[editingId] ?? [];

      openConsultationPdf({
        user: currentUser,
        prestation,
        consultation,
        animal,
        tarif,
        proprietaire: prestation?.Proprietaire_Prestation ?? null,
        lieu,
        zonages,
      });
    } catch (err) {
      onError?.(err.message);
    }
  }

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

            const selectedZonages =
              zonagesByConsultation[consultation.ID_Consultation] ?? [];

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

                  {/* Zonages */}
                  <div className="absolute right-0 top-0 rounded-tr-md rounded-bl-md border border-blue-200 bg-green-100 px-2 py-1 text-green-700">
                    <Crosshair size={20} />

                    {selectedZonages.length > 0 && (
                      <span className="absolute w-6 h-6 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-green-100 border-[3.5px] border-green-700 border-double text-sm font-semibold text-green-900">
                        {selectedZonages.length}
                      </span>
                    )}
                  </div>
                </button>
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
        selectedZonages={
          editingId ? (zonagesByConsultation[editingId] ?? []) : []
        }
        onZonagesUpdated={loadData}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onDelete={() => {}}
        onOpenZonages={openZonages}
        onAddAnimal={handleAddAnimal}
        onAddTarif={() => onAddTarif?.()}
        onOpenPrestation={onOpenPrestation}
        onOpenPdf={handleOpenPdf}
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
