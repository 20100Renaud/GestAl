import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Modal from "../ui/Modal";
import Alert from "../ui/Alert.jsx";
import { CardZonage } from "../ui/Card.jsx";
import {
  LayoutArrowRight,
  Eye,
  Move3d,
  GraduationCap,
  Crosshair,
} from "lucide-react";

export default function ZonageModal({
  open,
  editingId,
  form,
  saving,
  error,
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
        <div className="flex justify-around gap-2">
          {/* Fields */}
          <div className="grid sm:grid-cols-2 gap-2">
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
            <Select
              id="Technique_Zonage"
              label="Technique"
              icon={GraduationCap}
              name="Technique_Zonage"
              value={form.Technique_Zonage ?? ""}
              onChange={onChange}
            >
              <option value="">Sélectionner une technique</option>
              <option value="Articulaire">Articulaire</option>
              <option value="Tissulaire">Tissulaire</option>
              <option value="Viscérale">Viscérale</option>
              <option value="Fascia">Fascia</option>
            </Select>
          </div>

          {/* Aperçu */}
          <div className="flex flex-col">
            <p className="mb-3 flex flex-start items-center gap-2 text-sm font-medium text-blue-700">
              <Eye size={18} />
              Aperçu
            </p>
            <div className="flex sm:my-auto">
              <CardZonage
                title={`${form.Nom_Zonage || "Nom du zonage"}${
                  form.Position_Zonage ? form.Position_Zonage : ""
                }${form.Orientation_Zonage ? `-${form.Orientation_Zonage}` : ""}`}
                technique={form.Technique_Zonage}
              />
            </div>
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

        {error && (
          <div className="mt-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}
      </form>
    </Modal>
  );
}
