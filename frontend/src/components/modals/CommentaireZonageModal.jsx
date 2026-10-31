import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Textarea from "../ui/Textarea.jsx";
import Modal from "../ui/Modal.jsx";
import { CardZonage, techniqueCardColors } from "../ui/Card.jsx";
import { ClipboardPen, Check } from "lucide-react";

export default function CommentaireZonageModal({
  open,
  zonage,
  comment,
  onCommentChange,
  onSave,
  onClose,
  saving = false,
  mode = "textarea",
  onDeselect,
}) {
  if (!zonage) return null;

  const title = `${zonage.Nom_Zonage ?? ""}${zonage.Position_Zonage ?? ""}${
    zonage.Orientation_Zonage ? `-${zonage.Orientation_Zonage}` : ""
  }`;

  const colors = techniqueCardColors[zonage.Technique_Zonage] ?? {
    badge: "text-gray-500",
    commentBorder: "border-gray-500",
    commentBg: "bg-gray-50",
  };

  return (
    <Modal open={open} title="Commentaire du zonage" onClose={onClose}>
      <div className="p-6">
        {/* Zonage preview */}
        <div className="relative mb-8 flex w-fit flex-col items-center mx-auto">
          <CardZonage
            title={title || "Nom du zonage"}
            technique={zonage.Technique_Zonage}
            className="cursor-default hover:bg-white"
          />

          {/* Selected badge */}
          <div
            className={`absolute -bottom-2 left-1/2 z-10 flex h-5 max-w-24 -translate-x-1/2 items-center gap-1 rounded-full border px-1.5 ${colors.commentBorder} ${colors.commentBg}`}
          >
            <Check
              size={15}
              strokeWidth={3}
              className={`shrink-0 ${colors.badge}`}
            />

            <span className={`truncate text-xs ${colors.badge}`}>
              {comment || "..."}
            </span>
          </div>
        </div>

        {/* Comment field */}
        {mode === "input" ? (
          <Input
            id="Commentaire_Zonage"
            label="Commentaire (facultatif)"
            icon={ClipboardPen}
            type="text"
            value={comment}
            onChange={(event) => onCommentChange(event.target.value)}
            disabled={saving}
          />
        ) : (
          <Textarea
            label="Commentaire (facultatif)"
            icon={ClipboardPen}
            name="Commentaire_Zonage"
            value={comment ?? ""}
            onChange={(event) => onCommentChange(event.target.value)}
            rows="4"
            disabled={saving}
          />
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-around gap-3">
          {onDeselect && (
            <Button
              type="button"
              variant="danger"
              onClick={onDeselect}
              disabled={saving}
            >
              Désélectionner
            </Button>
          )}

          <div className="ml-aut flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving}
              className="!hidden sm:!inline-flex"
            >
              Annuler
            </Button>

            <Button type="button" onClick={onSave} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
