import { useEffect, useState } from "react";

import Button from "../ui/Button.jsx";
import ConsultationsModal from "./Consultations_Modal.jsx";

import {
  getConsultations,
  createConsultation,
} from "../../api/consultations.js";

import { getAnimaux } from "../../api/animaux.js";
import { getTarifs } from "../../api/tarifs.js";
import { getZonages } from "../../api/zonages.js";

import {
  getConsultationZonages,
  createConsultationZonage,
  updateConsultationZonage,
  deleteConsultationZonage,
} from "../../api/consultation-zonages.js";

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
  onNext,
  onError,
}) {
  const [consultations, setConsultations] = useState([]);
  const [animaux, setAnimaux] = useState([]);
  const [tarifs, setTarifs] = useState([]);
  const [zonages, setZonages] = useState([]);

  const [consultationZonages, setConsultationZonages] = useState([]);

  const [form, setForm] = useState({
    ...emptyForm,
    ID_Prestation: prestationId,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [prestationId]);

  async function loadData() {
    try {
      const [consultationsData, animauxData, tarifsData, zonagesData] =
        await Promise.all([
          getConsultations(),
          getAnimaux(),
          getTarifs(),
          getZonages(),
        ]);

      setConsultations(
        consultationsData.filter((item) => item.ID_Prestation === prestationId),
      );

      setAnimaux(animauxData);
      setTarifs(tarifsData);
      setZonages(zonagesData);
    } catch (err) {
      onError?.(err.message);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openCreateForm() {
    setEditingId(null);

    setForm({
      ...emptyForm,
      ID_Prestation: prestationId,
    });

    setConsultationZonages([]);
    setShowForm(true);
  }

  async function openEditForm(consultation) {
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

    try {
      const data = await getConsultationZonages(consultation.ID_Consultation);

      setConsultationZonages(data);
      setShowForm(true);
    } catch (err) {
      onError?.(err.message);
    }
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setConsultationZonages([]);
  }

  function handleZonageToggle(zonageId) {
    const existing = consultationZonages.find(
      (item) => item.ID_Zonage === zonageId,
    );

    if (existing) {
      setConsultationZonages((current) =>
        current.filter((item) => item.ID_Zonage !== zonageId),
      );

      return;
    }

    const zonage = zonages.find((item) => item.ID_Zonage === zonageId);

    if (!zonage) {
      return;
    }

    setConsultationZonages((current) => [
      ...current,
      {
        ID_Consultation_Zonage: `new-${zonageId}`,
        ID_Consultation: editingId,
        ID_Zonage: zonageId,
        Commentaire_Zonage: "",
        Zonage: zonage,
      },
    ]);
  }

  function handleZonageCommentChange(zonageId, value) {
    setConsultationZonages((current) =>
      current.map((item) =>
        item.ID_Zonage === zonageId
          ? {
              ...item,
              Commentaire_Zonage: value,
            }
          : item,
      ),
    );
  }

  async function saveConsultationZonages(consultationId) {
    const existing = await getConsultationZonages(consultationId);

    const existingIds = existing.map((item) => item.ID_Zonage);

    const selectedIds = consultationZonages.map((item) => item.ID_Zonage);

    const toDelete = existing.filter(
      (item) => !selectedIds.includes(item.ID_Zonage),
    );

    const toCreate = consultationZonages.filter(
      (item) => !existingIds.includes(item.ID_Zonage),
    );

    const toUpdate = consultationZonages.filter((item) => {
      if (!existingIds.includes(item.ID_Zonage)) {
        return false;
      }

      const existingItem = existing.find(
        (existingZonage) => existingZonage.ID_Zonage === item.ID_Zonage,
      );

      return (
        (existingItem?.Commentaire_Zonage ?? "") !==
        (item.Commentaire_Zonage ?? "")
      );
    });

    await Promise.all([
      ...toDelete.map((item) =>
        deleteConsultationZonage(consultationId, item.ID_Zonage),
      ),

      ...toCreate.map((item) =>
        createConsultationZonage(consultationId, {
          ID_Zonage: item.ID_Zonage,
          Commentaire_Zonage: item.Commentaire_Zonage || "",
        }),
      ),

      ...toUpdate.map((item) =>
        updateConsultationZonage(consultationId, item.ID_Zonage, {
          Commentaire_Zonage: item.Commentaire_Zonage || "",
        }),
      ),
    ]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      onError?.("");

      const consultation = await createConsultation(form);

      await saveConsultationZonages(consultation.ID_Consultation);

      await loadData();
      closeForm();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredAnimaux = animaux.filter(
    (animal) => animal.ID_Proprietaire === prestation.ID_Proprietaire,
  );

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">Prestation</p>

          <p className="font-medium text-blue-900">
            #{prestation.ID_Prestation}
          </p>
        </div>

        {consultations.length === 0 ? (
          <div className="rounded-md border border-blue-200 p-6 text-center">
            <p className="text-sm text-blue-700">
              Aucune consultation pour cette prestation.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {consultations.map((consultation) => {
              const animal = animaux.find(
                (item) => item.ID_Animal === consultation.ID_Animal,
              );

              const tarif = tarifs.find(
                (item) => item.ID_Tarif === consultation.ID_Tarif,
              );

              return (
                <button
                  key={consultation.ID_Consultation}
                  type="button"
                  onClick={() => openEditForm(consultation)}
                  className="w-full rounded-md border border-blue-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-medium text-blue-900">
                        {animal?.Nom_Animal ?? "Animal inconnu"}
                      </div>

                      <div className="text-sm text-blue-600">
                        {consultation.Motif_Consultation || "Sans motif"}
                      </div>
                    </div>

                    <div className="text-sm text-blue-700">
                      {tarif
                        ? `${tarif.Denomination_Tarif} (${tarif.Montant_Tarif} €)`
                        : "-"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="secondary" onClick={openCreateForm}>
            + Ajouter une consultation
          </Button>

          <Button
            type="button"
            onClick={onNext}
            disabled={consultations.length === 0}
          >
            Continuer vers les paiements →
          </Button>
        </div>
      </div>

      <ConsultationsModal
        open={showForm}
        editingId={editingId}
        form={form}
        prestations={[prestation]}
        animaux={filteredAnimaux}
        tarifs={tarifs}
        zonages={zonages}
        consultationZonages={consultationZonages}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onDelete={() => {}}
        onZonageToggle={handleZonageToggle}
        onZonageCommentChange={handleZonageCommentChange}
        onAddTarif={() => {
          onError?.("La création rapide d'un tarif sera ajoutée ensuite.");
        }}
      />
    </>
  );
}
