import { useEffect, useMemo, useState } from "react";
import { techniqueCardColors } from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import PageHeader from "../ui/PageHeader.jsx";
import { CardZonage } from "../ui/Card.jsx";
import { getZonages } from "../../api/zonages.js";
import CommentaireZonageModal from "../modals/CommentaireZonageModal.jsx";
import { getZonageKey } from "../zonages/anatomyConfig.js";
import AnatomicalMap from "../zonages/AnatomicalMap.jsx";
import ConfirmModal from "../alerts/ConfirmModal.jsx";
import {
  Check,
  ChevronDown,
  LayoutGrid,
  Bone,
  Heart,
  SquareCheck,
  SquareX,
  RefreshCw,
} from "lucide-react";
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
  const [activePanel, setActivePanel] = useState("");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [clearingZonages, setClearingZonages] = useState(false);

  useEffect(() => {
    if (!open) return;
    setActivePanel("");

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

    return zonages.filter((zonage) => {
      const selected = consultationZonages.some(
        (item) => item.ID_Zonage === zonage.ID_Zonage,
      );

      if (showSelectedOnly && !selected) {
        return false;
      }

      if (!value) return true;

      return [
        getZonageLabel(zonage),
        zonage.Nom_Zonage,
        zonage.Position_Zonage,
        zonage.Orientation_Zonage,
        zonage.Technique_Zonage,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [zonages, search, consultationZonages, showSelectedOnly]);

  function handleClearAllZonages() {
  if (clearingZonages || consultationZonages.length === 0) {
    return;
  }

  setConsultationZonages([]);
  setShowClearConfirmation(false);
}

  function handleShowVisceralZones() {
    setActivePanel("cards");
    setSearch("Viscérale");
    setShowSelectedOnly(false);
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

  function handleAnatomicalToggle(zonage) {
    const existing = zonages.find(
      (item) => getZonageKey(item) === getZonageKey(zonage),
    );

    if (!existing) return;

    handleToggle(existing.ID_Zonage);
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
      <Modal
        open={open}
        title="Zonages associés"
        onClose={onClose}
        headerContent={
          <span className="rounded-full bg-blue-300/20 px-3 py-1 text-xs font-semibold text-blue-200">
            {consultationZonages.length} sélectionné
            {consultationZonages.length > 1 ? "s" : ""}
          </span>
        }
      >
        <div className="flex h-[min(750px,80vh)] min-h-0 flex-col px-4 sm:px-6">
          {loading ? (
            <p className="text-sm text-blue-700">Chargement...</p>
          ) : (
            <>
              {/* CONTENU DES PANNEAUX */}
              <div className="flex min-h-0 flex-1 flex-col gap-3">
                {/* 1. RECHERCHE PAR ZONAGES */}
                <section
                  className={`flex min-h-0 flex-col rounded-xl border border-blue-100 bg-white ${
                    activePanel === "cards" ? "flex-1" : "shrink-0"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActivePanel((current) =>
                        current === "cards" ? "null" : "cards",
                      )
                    }
                    aria-expanded={activePanel === "cards"}
                    className="flex shrink-0 cursor-pointer items-center justify-between rounded-xl bg-blue-300/50 pr-4 py-1 text-sm font-semibold text-blue-800 hover:bg-blue-500/60"
                  >
                    <div className="relative flex gap-4">
                      <span className="absolute -left-2 -top-2 z-0 h-10 w-10 rounded-full bg-blue-200"></span>
                      <LayoutGrid className="relative z-10" />
                      <span>Recherche par zonage</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${
                          activePanel === "cards" ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {activePanel === "cards" && (
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] p-1 sm:px-4">
                      {/* Barre de recherche et actions */}
                      <div className="mb-3 flex items-center gap-2">
                        {/* Barre de recherche */}
                        <div className="min-w-0 flex-1">
                          <PageHeader
                            search={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Rechercher un zonage..."
                          />
                        </div>

                        {/* Boutons de présélection */}
                        <div className="flex shrink-0 items-center gap-2 ">
                          {/* Filtrer les sélectionnés */}
                          <button
                            type="button"
                            onClick={() =>
                              setShowSelectedOnly((current) => !current)
                            }
                            title={
                              showSelectedOnly
                                ? "Afficher tous les zonages"
                                : "Afficher uniquement les zonages sélectionnés"
                            }
                            aria-label={
                              showSelectedOnly
                                ? "Afficher tous les zonages"
                                : "Afficher uniquement les zonages sélectionnés"
                            }
                            aria-pressed={showSelectedOnly}
                            className={`flex h-10 w-10 items-center justify-center rounded-md border transition-colors cursor-pointer shadow-lg ${
                              showSelectedOnly
                                ? "border-blue-500 bg-blue-100 text-blue-700"
                                : "border-blue-200 bg-white text-blue-500 hover:bg-blue-50"
                            }`}
                          >
                            {showSelectedOnly ? (
                              <RefreshCw size={18} />
                            ) : (
                              <SquareCheck size={20} />
                            )}
                          </button>

                          {/* Tout désélectionner */}
                          <Button
                            variant="danger_clear"
                            onClick={() => setShowClearConfirmation(true)}
                            disabled={
                              consultationZonages.length === 0 ||
                              saving ||
                              clearingZonages
                            }
                            title="Désélectionner tous les zonages"
                            aria-label="Désélectionner tous les zonages"
                            className="flex h-10 w-10 !px-0 items-center justify-center border border-red-200 bg-white text-red-500 transition-colors hover:bg-red-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <SquareX size={20} />
                          </Button>
                        </div>
                      </div>

                      {/* Compte des résultats */}
                      {filteredZonages.length > 0 && (
                        <div className="mb-3 text-sm text-blue-900">
                          {filteredZonages.length} résultat
                          {filteredZonages.length > 1 ? "s" : ""}
                        </div>
                      )}

                      {/* Message si recherche vide sinon liste des cards*/}
                      {filteredZonages.length === 0 ? (
                        <p className="rounded-2xl p-6 text-center text-sm text-blue-900">
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
                  )}
                </section>

                {/* 2. SCHEMAS ARTICULAIRES */}
                <section
                  className={`flex min-h-0 flex-col rounded-xl border border-blue-100 bg-white ${
                    activePanel === "anatomical" ? "flex-1" : "shrink-0"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActivePanel((current) =>
                        current === "anatomical" ? "null" : "anatomical",
                      )
                    }
                    aria-expanded={activePanel === "anatomical"}
                    className="relative flex shrink-0 cursor-pointer items-center justify-between rounded-xl bg-blue-300/50 pr-4 py-1 text-sm font-semibold text-blue-800 hover:bg-blue-500/60"
                  >
                    <div className="relative flex gap-4">
                      <span className="absolute -left-2 -top-2 z-0 h-10 w-10 rounded-full bg-blue-200"></span>

                      <Bone className="relative z-10" />

                      <span>Schémas articulaires</span>
                    </div>

                    <ChevronDown
                      size={18}
                      className={`transition-transform ${
                        activePanel === "anatomical" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {activePanel === "anatomical" && (
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                      <AnatomicalMap
                        zonages={zonages}
                        selectedZonages={consultationZonages}
                        onToggle={handleAnatomicalToggle}
                        disabled={saving}
                      />
                    </div>
                  )}
                </section>

                {/* 3. SCHEMAS VISCERAUX */}
                <section
                  className={`flex min-h-0 flex-col rounded-xl border border-blue-100 bg-white ${
                    activePanel === "viscera" ? "flex-1" : "shrink-0"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActivePanel((current) =>
                        current === "viscera" ? "null" : "viscera",
                      )
                    }
                    aria-expanded={activePanel === "viscera"}
                    className="flex shrink-0 cursor-pointer items-center justify-between rounded-xl bg-blue-300/50 py-1 text-sm font-semibold text-blue-800 hover:bg-blue-500/60 pr-4"
                  >
                    <div className="relative flex gap-4">
                      <span className="absolute -left-2 -top-2 z-0 h-10 w-10 rounded-full bg-blue-200"></span>
                      <Heart className="relative z-10" />
                      <span>Sélections viscérales</span>
                    </div>

                    <ChevronDown
                      size={18}
                      className={`transition-transform ${
                        activePanel === "viscera" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {activePanel === "viscera" && (
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                      <AnatomicalMap
                        mode="viscera"
                        zonages={zonages}
                        selectedZonages={consultationZonages}
                        onToggle={handleAnatomicalToggle}
                        disabled={saving}
                        onShowVisceralZones={handleShowVisceralZones}
                      />
                    </div>
                  )}
                </section>
              </div>
            </>
          )}

          {/* BOUTONS FIXES */}
          <div className="mt-3 flex shrink-0 justify-end gap-3 border-t border-blue-100 pt-2">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Annuler
            </Button>

            <Button onClick={handleSave} disabled={saving || loading}>
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

      <ConfirmModal
        type="clearZonages"
        open={showClearConfirmation}
        onConfirm={handleClearAllZonages}
        onClose={() => {
          if (!clearingZonages) {
            setShowClearConfirmation(false);
          }
        }}
      />
    </>
  );
}
