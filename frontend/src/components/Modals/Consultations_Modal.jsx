import { useState } from "react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Textarea from "../ui/Textarea.jsx";
import Modal from "../ui/Modal.jsx";
import PrestationHeader from "../PrestationHeader.jsx";
import { CardZonage, techniqueCardColors } from "../ui/Card.jsx";
import CommentaireZonageModal from "./CommentaireZonageModal.jsx";
import {
  updateConsultationZonage,
  deleteConsultationZonage,
} from "../../api/consultation-zonages.js";
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
  Eye,
  Download,
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
  onDraftZonagesChange,
  onZonagesUpdated,
  onClose,
  onSubmit,
  onChange,
  onDelete,
  onOpenZonages,
  onAddTarif,
  onAddAnimal,
  onOpenPrestation,
  onOpenPdf,
}) {
  const [commentModalZonage, setCommentModalZonage] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [savingComment, setSavingComment] = useState(false);

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

  return (
    <>
      <Modal
        open={open}
        title={
          editingId ? "Modifier la consultation" : "Ajouter une consultation"
        }
        onClose={onClose}
      >
        {!prestation || tarifs.length === 0 ? (
          <div className="p-6">
            <p className="text-blue-900">
              Une <u>prestation</u>, un <u>animal</u> et un <u>tarif</u> doivent
              exister avant de pouvoir créer une consultation.
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
              <div className="min-h-0 flex-1 overflow-y-auto p-6">
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
                          {animal.Genre_Animal}
                        </option>
                      ))}
                    </Select>

                    <div className="absolute right-0 top-0">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={onAddAnimal}
                        disabled={saving || !form.ID_Prestation}
                        className="!p-1"
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
                      {tarifs.map((tarif) => (
                        <option key={tarif.ID_Tarif} value={tarif.ID_Tarif}>
                          {tarif.Denomination_Tarif}
                          {" ("}
                          {tarif.Montant_Tarif}
                          {" €)"}
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

                  {/* COMMENTAIRE */}
                  <div className="md:col-span-2">
                    <Textarea
                      label="Commentaire personnel"
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
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <Crosshair size={18} />
                    <h3 className="text-sm font-semibold text-blue-700">
                      Zonages sélectionnés ({selectedZonages.length})
                    </h3>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 px-1 py-2">
                    {/* Add zonage card — first position */}
                    <button
                      type="button"
                      onClick={() => onOpenZonages?.(editingId ?? null)}
                      disabled={saving}
                      className="relative flex min-h-18 w-28 flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed border-t-4 border-green [border-top-style:solid] bg-green-50/50 p-3 text-green-600 transition-colors hover:border-green-500 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                      <Crosshair size={22} />
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
                            disabled={saving || savingComment}
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

            {/* FIXED ACTIONS — OUTSIDE THE SCROLLABLE DIV */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-blue-100 bg-blue-50 rounded-b-2xl px-6 py-4">
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

              <div className="flex gap-2">
                {editingId && (
                  <>
                    <Button
                      type="button"
                      variant="clear_green"
                      onClick={() => onOpenPdf("preview")}
                      disabled={saving}
                    >
                      <span className="flex items-center gap-2">
                        <Eye size={16} />
                      </span>
                    </Button>

                    <Button
                      type="button"
                      variant="clear_purple"
                      onClick={() => onOpenPdf("download")}
                      disabled={saving}
                    >
                      <span className="flex items-center gap-2">
                        <Download size={16} />
                      </span>
                    </Button>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="secondary"
                  disabled={saving}
                >
                  Annuler
                </Button>

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
        onDeselect={() => {
          removeSelectedZonage(commentModalZonage);
          closeCommentModal();
        }}
      />
    </>
  );
}
