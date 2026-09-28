import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Modal from "../ui/Modal";
import {
  LayoutArrowRight,
  Eye,
  Move3d,
  Drone,
  GraduationCap,
  Crosshair,
} from "lucide-react";

export default function ZonageModal({
  open,
  editingId,
  form,
  saving,
  onChange,
  onSubmit,
  onClose,
  onDelete,
}) {
  return (
    <Modal
      open={open}
      title={editingId ? "Modifier le zonage" : "Ajouter un zonage"}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Input
            id="Nom_Zonage"
            label="Nom"
            icon={Crosshair}
            type="text"
            name="Nom_Zonage"
            value={form.Nom_Zonage}
            onChange={onChange}
            required
          />

          <Input
            id="Position_Zonage"
            label="Position"
            icon={LayoutArrowRight}
            type="text"
            name="Position_Zonage"
            value={form.Position_Zonage}
            onChange={onChange}
          />

          <Input
            id="Orientation_Zonage"
            label="Orientation"
            icon={Move3d}
            type="text"
            name="Orientation_Zonage"
            value={form.Orientation_Zonage}
            onChange={onChange}
          />

          <Input
            id="Technique_Zonage"
            label="Technique"
            icon={Drone}
            type="text"
            name="Technique_Zonage"
            value={form.Technique_Zonage}
            onChange={onChange}
          />

          <Input
            id="Pratique_Zonage"
            label="Pratique"
            icon={GraduationCap}
            type="text"
            name="Pratique_Zonage"
            value={form.Pratique_Zonage}
            onChange={onChange}
            required
          />
        </div>

        {/* Aperçu */}
        <div className="mt-6">
          <p className="flex items-center gap-2 mb-2 text-sm font-medium text-blue-700">
            <Eye size={18} />
            Aperçu
          </p>

          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <span className="text-md font-medium text-blue-900  flex flex-wrap gap-1">
              {form.Nom_Zonage || "Nom du zonage"}
              {form.Position_Zonage && `-${form.Position_Zonage}`}{" "}
              {form.Orientation_Zonage && (
                <span className="rounded-full bg-yellow-400 px-2 py-1 text-xs text-blue-900">
                  {form.Orientation_Zonage}
                </span>
              )}
              {form.Technique_Zonage && (
                <span className="rounded-full bg-green-600 px-2 py-1 text-xs text-white">
                  {form.Technique_Zonage}
                </span>
              )}
              {form.Pratique_Zonage && (
                <span className="rounded-full bg-blue-500 px-2 py-1 text-xs text-white">
                  {form.Pratique_Zonage}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Btns */}
        <div className="flex items-center justify-between gap-3 mt-6">
          <div>
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

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={saving}
            >
              Annuler
            </Button>

            <Button type="submit" disabled={saving}>
              {saving
                ? "Enregistrement..."
                : editingId
                  ? "Modifier"
                  : "Ajouter"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
