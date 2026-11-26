import { useState } from "react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Textarea from "../ui/Textarea.jsx";
import Modal from "../ui/Modal.jsx";

import PrestationHeader from "../headers/PrestationHeader.jsx";
import { CardZonage, techniqueCardColors } from "../ui/Card.jsx";
import CommentaireZonageModal from "./CommentaireZonageModal.jsx";
import {
  updateConsultationZonage,
  deleteConsultationZonage,
} from "../../api/consultation-zonages.js";
import ConfirmModal from "../alerts/ConfirmModal.jsx";
import {
  PawPrint,
  Tag,
  SquarePlus,
  SquareMinus,
  Plus,
  TextInitial,
  TextAlignStart,
  ClipboardPen,
  Crosshair,
  Check,
  X,
  SquareX,
  Eye,
  Download,
  Pencil,
  ListOrdered,
} from "lucide-react";

export default function ConsultationsModal({
  open,
  editingId,
  form,
  prestation,
  animaux,
  tarifs,
  saving,
  selectedZonages = [],
  onZonagesUpdated,
  onClose,
  onSubmit,
  onChange,
  onDelete,
  onOpenZonages,
  onAddTarif,
  onAddAnimal,
  onEditAnimal,
  onOpenPrestation,
  onOpenPdf,
}) {
  const [commentModalZonage, setCommentModalZonage] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [clearingZonages, setClearingZonages] = useState(false);

  function openCommentModal(zonage) {
    setCommentModalZonage(zonage);
    setCommentDraft(zonage.Commentaire_Zonage ?? "");
  }

  function closeCommentModal() {
    setCommentModalZonage(null);
    setCommentDraft("");
  }

  async function saveComment() {
    if (!commentModalZonage || !editingId) return;

    try {
      setSavingComment(true);

      await updateConsultationZonage(editingId, commentModalZonage.ID_Zonage, {
        Commentaire_Zonage: commentDraft,
      });

      await onZonagesUpdated?.();
      closeCommentModal();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingComment(false);
    }
  }

  async function removeSelectedZonage(zonage) {
    if (!editingId || savingComment) return;

    try {
      await deleteConsultationZonage(editingId, zonage.ID_Zonage);
      await onZonagesUpdated?.();
    } catch (err) {
      console.error(err);
    }
  }

  async function removeAllSelectedZonages() {
    if (!editingId || clearingZonages || selectedZonages.length === 0) {
      return;
    }

    try {
      setClearingZonages(true);

      await Promise.all(
        selectedZonages.map((zonage) =>
          deleteConsultationZonage(editingId, zonage.ID_Zonage),
        ),
      );

      await onZonagesUpdated?.();

      setShowClearConfirmation(false);
    } catch (err) {
      console.error("Erreur lors de la désélection des zonages :", err);
    } finally {
      setClearingZonages(false);
    }
  }

  return (
    <>
      <Modal
        open={open}
        title={
          editingId ? "Modifier la consultation" : "Ajouter une consultation"
        }
        onClose={onClose}
      >
        {!prestation === 0 ? (
          <div className="p-6">
            <p className="text-blue-900">
              Une <u>prestation</u> doit exister avant de pouvoir créer une
              consultation.
            </p>
          </div>
        ) : (
          <div className="flex max-h-[80vh] min-h-0 flex-col overflow-hidden">
            {/* FIXED HEADER */}
            <div className="shrink-0">
              <PrestationHeader
                prestation={prestation}
                className="!rounded-b-none"
                onClick={onOpenPrestation}
              />
            </div>

            {/* SCROLLABLE FORM */}
            <form
              id="consultation-form"
              onSubmit={onSubmit}
              className="flex border-x border-blue-100 min-h-0 flex-1 flex-col overflow-hidden"
            >
              {/* ONLY THIS SECTION SCROLLS */}
              <div className="min-h-0 flex-1 overflow-y-auto p-6 shadow-[inset_6px_0_10px_-6px_rgba(0,0,0,0.2)]">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* ANIMAL */}
                  <div className="relative">
                    <Select
                      id="Animal"
                      label="Animal"
                      icon={PawPrint}
                      name="ID_Animal"
                      value={form.ID_Animal}
                      onChange={onChange}
                      required
                      disabled={!form.ID_Prestation}
                    >
                      <option value="">
                        {form.ID_Prestation
                          ? "Sélectionner un animal"
                          : "Sélectionner d'abord une prestation"}
                      </option>

                      {animaux.map((animal) => (
                        <option key={animal.ID_Animal} value={animal.ID_Animal}>
                          {animal.Nom_Animal}
                          {" - "}
                          {animal.Genre_Animal} {animal.Race_Animal}
                        </option>
                      ))}
                    </Select>

                    <div className="absolute right-0 top-0 flex gap-1">
                      {form.ID_Animal && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => onEditAnimal?.(form.ID_Animal)}
                          disabled={saving}
                          className="!p-1"
                          aria-label="Modifier l'animal sélectionné"
                          title="Modifier l'animal sélectionné"
                        >
                          <Pencil size={16} />
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={onAddAnimal}
                        disabled={saving || !form.ID_Prestation}
                        className="!p-1"
                        aria-label="Ajouter un animal"
                        title="Ajouter un animal"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* TARIF */}
                  <div className="relative">
                    <Select
                      id="Tarif"
                      name="ID_Tarif"
                      icon={Tag}
                      label="Tarif"
                      value={form.ID_Tarif}
                      onChange={onChange}
                      required
                    >
                      <option value="">Sélectionner un tarif</option>

                      {tarifs
                        .filter(
                          (tarif) =>
                            Number(tarif.Annee_Tarif) ===
                            new Date().getFullYear(),
                        )
                        .map((tarif) => (
                          <option key={tarif.ID_Tarif} value={tarif.ID_Tarif}>
                            {tarif.Denomination_Tarif}
                            {" ("}
                            {tarif.Montant_Tarif}
                            {" €) - "}
                            {tarif.Annee_Tarif}
                          </option>
                        ))}
                    </Select>

                    <div className="absolute right-0 top-0">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={onAddTarif}
                        disabled={saving}
                        className="!p-1"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* QUANTITE */}
                  <Input
                    id="Quantite_Consultation"
                    label="Quantité"
                    icon={[SquareMinus, SquarePlus]}
                    type="number"
                    name="Quantite_Consultation"
                    value={form.Quantite_Consultation}
                    onChange={onChange}
                    min="1"
                    step="1"
                    required
                  />

                  {/* MOTIF */}
                  <Input
                    id="Motif_Consultation"
                    label="Motif"
                    icon={TextInitial}
                    type="text"
                    name="Motif_Consultation"
                    value={form.Motif_Consultation}
                    onChange={onChange}
                    required
                  />

                  {/* DESCRIPTION */}
                  <div className="md:col-span-2">
                    <Textarea
                      label="Description"
                      icon={TextAlignStart}
                      name="Description_Consultation"
                      value={form.Description_Consultation}
                      onChange={onChange}
                      rows="4"
                      required
                    />
                  </div>

                  {/* PRECONISATION */}
                  <div className="md:col-span-2">
                    <Textarea
                      label="Préconisation"
                      icon={ListOrdered}
                      name="Preconisation_Consultation"
                      value={form.Preconisation_Consultation}
                      onChange={onChange}
                      rows="4"
                    />
                  </div>

                  {/* COMMENTAIRE PERSO */}
                  <div className="md:col-span-2">
                    <Textarea
                      label="Notes personnelles"
                      icon={ClipboardPen}
                      name="Commentaire_Consultation"
                      value={form.Commentaire_Consultation}
                      onChange={onChange}
                      rows="4"
                    />
                  </div>
                </div>

                {/* ZONAGES SÉLECTIONNÉS */}

                <div className="mt-6">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                      <Crosshair size={18} />

                      <h3 className="text-sm font-semibold text-blue-700">
                        Zonages sélectionnés ({selectedZonages.length})
                      </h3>
                    </div>

                    {editingId && selectedZonages.length > 0 && (
                      <Button
                        variant="danger_clear"
                        className="!px-2 !py-1 text-xs shadow-none mx-auto border border-red-300"
                        onClick={() => setShowClearConfirmation(true)}
                        disabled={saving || savingComment || clearingZonages}
                      >
                        <SquareX size={15} className="mr-1" />
                        Tout désélectionner
                      </Button>
                    )}
                    <Button
                      variant="clear_blue"
                      className="!px-2 !py-1 text-xs shadow-none mx-auto "
                      onClick={() => onOpenZonages?.(editingId ?? null)}
                      disabled={saving}
                    >
                      <Plus size={15} className="mr-1" />
                      Ajouter
                    </Button>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 px-1 py-2">
                    {/* Add zonage card — first position */}
                    <button
                      type="button"
                      onClick={() => onOpenZonages?.(editingId ?? null)}
                      disabled={saving}
                      className="relative flex min-h-18 w-28 flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed border-t-4 border-green [border-top-style:solid] bg-green-50/50 p-3 text-green-600 transition-colors hover:border-green-500 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                      <Plus size={22} />
                      <span className="text-xs font-medium">AJOUTER</span>

                      {/* Fake badge */}
                      <span className="absolute -bottom-2 left-1/2 z-10 flex h-5 -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-green-300 bg-green-50 px-1.5 text-xs text-green-500">
                        <Check size={15} strokeWidth={3} className="shrink-0" />
                        <span>...</span>
                      </span>
                    </button>

                    {/* Selected zonage cards */}
                    {selectedZonages.map((item) => {
                      const zonage = {
                        ...(item.Zonage ?? {}),
                        ...item,
                        ...(item.Zonage ?? {}),
                      };

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
                          className="relative flex flex-col items-center"
                        >
                          <CardZonage
                            title={title}
                            technique={zonage.Technique_Zonage}
                            onClick={(event) => {
                              event.stopPropagation();
                              openCommentModal(zonage);
                            }}
                          />

                          {/* Comment badge */}
                          <div className="absolute -bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                openCommentModal(zonage);
                              }}
                              disabled={saving || savingComment}
                              aria-label={`Commentaire du zonage ${title}`}
                              title={
                                zonage.Commentaire_Zonage
                                  ? `Commentaire : ${zonage.Commentaire_Zonage}`
                                  : "Ajouter un commentaire"
                              }
                              className={`flex h-5 max-w-24 cursor-pointer items-center gap-1 rounded-full border px-1.5 hover:brightness-95 disabled:cursor-not-allowed ${colors.commentBorder} ${colors.commentBg}`}
                            >
                              <Check
                                size={15}
                                strokeWidth={3}
                                className={`shrink-0 ${colors.badge}`}
                              />

                              <span
                                className={`truncate text-xs ${colors.badge}`}
                              >
                                {zonage.Commentaire_Zonage || "..."}
                              </span>
                            </button>
                          </div>

                          {/* Deselect button */}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeSelectedZonage(zonage);
                            }}
                            disabled={
                              saving || savingComment || clearingZonages
                            }
                            aria-label={`Désélectionner le zonage ${title}`}
                            title="Désélectionner ce zonage"
                            className="absolute -right-1 -top-1 z-20 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X size={13} strokeWidth={3} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </form>

            {/* ACTIONS BTNS */}
            <div className="flex shrink-0 items-center justify-between gap-3 border border-blue-200 bg-blue-100 rounded-b-2xl px-6 py-4 shadow-[0_-4px_10px_rgba(0,0,0,0.12)]">
              <div className="flex gap-3">
                {editingId && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => onDelete(editingId)}
                    disabled={saving}
                  >
                    Supprimer
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editingId && (
                  <>
                    <Button
                      type="button"
                      variant="clear_green"
                      onClick={() => onOpenPdf?.("preview")}
                      disabled={saving}
                      aria-label="Prévisualiser le compte rendu"
                      title="Prévisualiser le compte rendu"
                    >
                      <Eye size={16} />
                    </Button>

                    <Button
                      type="button"
                      variant="clear_purple"
                      onClick={() => onOpenPdf?.("download")}
                      disabled={saving}
                      aria-label="Télécharger le compte rendu"
                      title="Télécharger le compte rendu"
                    >
                      <Download size={16} />
                    </Button>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <div className="hidden md:block">
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="secondary"
                    disabled={saving}
                  >
                    Annuler
                  </Button>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  form="consultation-form"
                >
                  {saving
                    ? "Enregistrement..."
                    : editingId
                      ? "Modifier"
                      : "Ajouter"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <CommentaireZonageModal
        open={Boolean(commentModalZonage)}
        zonage={commentModalZonage}
        comment={commentDraft}
        onCommentChange={setCommentDraft}
        onSave={saveComment}
        onClose={closeCommentModal}
        saving={savingComment}
        mode="textarea"
      />

      <ConfirmModal
        type="clearZonages"
        open={showClearConfirmation}
        onConfirm={removeAllSelectedZonages}
        onClose={() => {
          if (!clearingZonages) {
            setShowClearConfirmation(false);
          }
        }}
      />
    </>
  );
}
