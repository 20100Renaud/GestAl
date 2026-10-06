import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Textarea from "../ui/Textarea.jsx";
import Modal from "../ui/Modal.jsx";
import PrestationHeader from "../PrestationHeader.jsx";
import {
  PawPrint,
  Tag,
  SquarePlus,
  SquareMinus,
  Plus,
  TextInitial,
  TextAlignStart,
  ClipboardPen,
} from "lucide-react";


export default function ConsultationsModal({
  open,
  editingId,
  form,
  prestation,
  animaux,
  tarifs,
  saving,
  onClose,
  onSubmit,
  onChange,
  onDelete,
  onOpenZonages,
  onAddTarif,
  onAddAnimal,
  onOpenPrestation,
}) {
  return (
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
        <>
          <PrestationHeader
            prestation={prestation}
            className=" !border-none"
            onClick={onOpenPrestation}
          />
          <form onSubmit={onSubmit} className="p-6">
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

            {/* ACTIONS */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex gap-3">
                {editingId && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onOpenZonages?.(editingId)}
                      disabled={saving}
                    >
                      Zonages
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => onDelete(editingId)}
                      disabled={saving}
                    >
                      Supprimer
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
        </>
      )}
    </Modal>
  );
}
