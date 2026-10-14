import { useEffect, useMemo, useState } from "react";
import { techniqueCardColors } from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import PageHeader from "../ui/PageHeader.jsx";
import { CardZonage } from "../ui/Card.jsx";
import { getZonages } from "../../api/zonages.js";
import CommentaireZonageModal from "./CommentaireZonageModal.jsx";
import { Check } from "lucide-react";
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
  draftZonages = [],
  onDraftZonagesChange,
}) {
  const [search, setSearch] = useState("");
  const [zonages, setZonages] = useState([]);
  const [consultationZonages, setConsultationZonages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentModalZonageId, setCommentModalZonageId] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    if (!open) return;

    async function loadData() {
      try {
        setLoading(true);
        onError?.("");

        const zonagesData = await getZonages();
        setZonages(Array.isArray(zonagesData) ? zonagesData : []);

        if (consultationId) {
          const selected = await getConsultationZonages(consultationId);
          setConsultationZonages(Array.isArray(selected) ? selected : []);
        } else {
          setConsultationZonages(draftZonages);
        }

        setSearch("");
      } catch (err) {
        console.error(err);
        onError?.(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [open, consultationId]);

  function getZonageLabel(zonage) {
    return `${zonage.Nom_Zonage ?? ""}${zonage.Position_Zonage ?? ""}${
      zonage.Orientation_Zonage ? `-${zonage.Orientation_Zonage}` : ""
    }`;
  }

  const filteredZonages = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return zonages;
    }

    return zonages.filter((zonage) =>
      [
        getZonageLabel(zonage),
        zonage.Nom_Zonage,
        zonage.Position_Zonage,
        zonage.Orientation_Zonage,
        zonage.Technique_Zonage,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value)),
    );
  }, [zonages, search]);

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
    if (!consultationId) {
      onDraftZonagesChange?.(consultationZonages);
      onClose?.();
      return;
    }
    
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

  function openCommentModal(zonage) {
    const selected = consultationZonages.find(
      (item) => item.ID_Zonage === zonage.ID_Zonage,
    );

    if (!selected) return;

    setCommentDraft(selected.Commentaire_Zonage ?? "");
    setCommentModalZonageId(zonage.ID_Zonage);
  }

  function saveCommentDraft() {
    if (commentModalZonageId === null) return;

    setConsultationZonages((current) =>
      current.map((item) =>
        item.ID_Zonage === commentModalZonageId
          ? { ...item, Commentaire_Zonage: commentDraft }
          : item,
      ),
    );

    closeCommentModal();
  }

  function closeCommentModal() {
    setCommentModalZonageId(null);
    setCommentDraft("");
  }

  return (
    <>
      <Modal open={open} title="Zonages associés" onClose={onClose}>
        <div className="flex h-[min(600px,80vh)] flex-col p-6">
          {loading ? (
            <p className="text-sm text-blue-700">Chargement...</p>
          ) : (
            <>
              {/* Search + result count */}
              <div className="shrink-0">
                <PageHeader
                  search={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Rechercher un zonage..."
                  className="mb-4"
                />

                <div className="mb-3 text-sm text-blue-900">
                  {filteredZonages.length} résultat
                  {filteredZonages.length > 1 ? "s" : ""}
                </div>
              </div>

              {/* Cards */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredZonages.length === 0 ? (
                  <p className="p-6 text-center text-sm text-red-500 border bg-red-50 rounded-2xl w-fit">
                    Aucun zonage ne correspond à la recherche.
                  </p>
                ) : (
                  <div className="flex flex-wrap justify-center gap-2 px-1 py-2">
                    {filteredZonages.map((zonage) => {
                      const selected = consultationZonages.find(
                        (item) => item.ID_Zonage === zonage.ID_Zonage,
                      );

                      const title = `${zonage.Nom_Zonage ?? ""}${
                        zonage.Position_Zonage ?? ""
                      }${
                        zonage.Orientation_Zonage
                          ? `-${zonage.Orientation_Zonage}`
                          : ""
                      }`;

                      const colors = techniqueCardColors[
                        zonage.Technique_Zonage
                      ] ?? {
                        badge: "text-gray-500",
                        commentBorder: "border-gray-500",
                        commentBg: "bg-gray-50",
                      };

                      return (
                        <div
                          key={zonage.ID_Zonage}
                          className="relative flex flex-col items-center gap-2"
                        >
                          <CardZonage
                            title={title}
                            technique={zonage.Technique_Zonage}
                            onClick={() => {
                              if (!saving) {
                                handleToggle(zonage.ID_Zonage);
                              }
                            }}
                          />

                          {selected && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();

                                if (!saving) {
                                  openCommentModal(zonage);
                                }
                              }}
                              disabled={saving}
                              aria-label={`Commentaire du zonage ${title}`}
                              title={
                                selected.Commentaire_Zonage
                                  ? `Commentaire : ${selected.Commentaire_Zonage}`
                                  : "Ajouter un commentaire"
                              }
                              className={`absolute left-1/2 -bottom-1 z-10 flex h-5 max-w-24 -translate-x-1/2 items-center gap-1 rounded-full border px-1.5 cursor-pointer hover:brightness-95 disabled:cursor-not-allowed ${colors.commentBorder} ${colors.commentBg}`}
                            >
                              <Check
                                size={15}
                                strokeWidth={3}
                                className={`shrink-0 ${colors.badge}`}
                              />

                              <span
                                className={`truncate text-xs ${colors.badge}`}
                              >
                                {selected.Commentaire_Zonage || "..."}
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="mt-auto flex shrink-0 justify-end gap-3 border-t border-blue-100 pt-4">
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
              disabled={saving || loading}
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </Modal>

      <CommentaireZonageModal
        open={commentModalZonageId !== null}
        zonage={zonages.find((item) => item.ID_Zonage === commentModalZonageId)}
        comment={commentDraft}
        onCommentChange={setCommentDraft}
        onSave={saveCommentDraft}
        onClose={closeCommentModal}
        saving={saving}
        mode="input"
        onDeselect={() => {
          handleToggle(commentModalZonageId);
          closeCommentModal();
        }}
      />
    </>
  );
}
