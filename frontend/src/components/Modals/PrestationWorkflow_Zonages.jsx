import { useEffect, useState } from "react";

import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Modal from "../ui/Modal.jsx";

import { Crosshair } from "lucide-react";

import { getZonages } from "../../api/zonages.js";

import {
  getConsultationZonages,
  createConsultationZonage,
  updateConsultationZonage,
  deleteConsultationZonage,
} from "../../api/consultation-zonages.js";

export default function PrestationWorkflowZonages({
  consultationId,
  open,
  onClose,
  onSaved,
  onError,
}) {
  const [zonages, setZonages] = useState([]);
  const [consultationZonages, setConsultationZonages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !consultationId) {
      return;
    }

    loadData();
  }, [open, consultationId]);

  async function loadData() {
    try {
      setLoading(true);
      onError?.("");

      const [zonagesData, consultationZonagesData] = await Promise.all([
        getZonages(),
        getConsultationZonages(consultationId),
      ]);

      setZonages(zonagesData);
      setConsultationZonages(consultationZonagesData);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleToggle(zonageId) {
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
        ID_Consultation: consultationId,
        ID_Zonage: zonageId,
        Commentaire_Zonage: "",
        Zonage: zonage,
      },
    ]);
  }

  function handleCommentChange(zonageId, value) {
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

  async function handleSave() {
    try {
      setSaving(true);
      onError?.("");

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

      await onSaved?.();
      onClose?.();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="Zonages associés" onClose={onClose}>
      <div className="p-6">
        {loading ? (
          <p className="text-sm text-blue-700">Chargement...</p>
        ) : zonages.length === 0 ? (
          <p className="text-sm text-blue-900">Aucun zonage disponible.</p>
        ) : (
          <div className="space-y-3 rounded border border-blue-300 p-3">
            {zonages.map((zonage) => {
              const selected = consultationZonages.find(
                (item) => item.ID_Zonage === zonage.ID_Zonage,
              );

              return (
                <div
                  key={zonage.ID_Zonage}
                  className="flex flex-col gap-3 rounded border border-blue-400 px-3 md:flex-row md:items-center"
                >
                  <label className="flex h-12 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={Boolean(selected)}
                      onChange={() => handleToggle(zonage.ID_Zonage)}
                      disabled={saving}
                    />

                    <span className="flex items-center gap-1 text-md font-medium text-blue-900">
                      {zonage.Nom_Zonage}

                      {zonage.Position_Zonage && `-${zonage.Position_Zonage}`}

                      {zonage.Orientation_Zonage && (
                        <span className="rounded-full bg-yellow-400 px-2 py-1 text-xs text-blue-900">
                          {zonage.Orientation_Zonage}
                        </span>
                      )}

                      {zonage.Technique_Zonage && (
                        <span className="rounded-full bg-green-600 px-2 py-1 text-xs text-white">
                          {zonage.Technique_Zonage}
                        </span>
                      )}

                      {zonage.Pratique_Zonage && (
                        <span className="rounded-full bg-blue-500 px-2 py-1 text-xs text-white">
                          {zonage.Pratique_Zonage}
                        </span>
                      )}
                    </span>
                  </label>

                  {selected && (
                    <Input
                      id={`Commentaire_Zonage_${zonage.ID_Zonage}`}
                      label=""
                      type="text"
                      value={selected.Commentaire_Zonage ?? ""}
                      onChange={(event) =>
                        handleCommentChange(
                          zonage.ID_Zonage,
                          event.target.value,
                        )
                      }
                      disabled={saving}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Annuler
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || !consultationId}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
