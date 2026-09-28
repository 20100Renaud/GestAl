import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Textarea from "../ui/Textarea.jsx";
import Modal from "../ui/Modal.jsx";

import { formatDate } from "../../utils/formatDate";
import {
  PawPrint,
  File,
  Tag,
  SquarePlus,
  SquareMinus,
  Plus,
  TextInitial,
  TextAlignStart,
  Crosshair,
  ClipboardPen,
} from "lucide-react";

import { useMemo } from "react";

export default function ConsultationsModal({
  open,
  editingId,
  form,
  prestations,
  animaux,
  tarifs,
  zonages,
  consultationZonages,
  saving,
  onClose,
  onSubmit,
  onChange,
  onDelete,
  onZonageToggle,
  onZonageCommentChange,
  onAddTarif,
  onAddAnimal,
}) {
  const selectedPrestation = useMemo(() => {
    return prestations.find(
      (prestation) => prestation.ID_Prestation === form.ID_Prestation,
    );
  }, [prestations, form.ID_Prestation]);

  const filteredAnimaux = useMemo(() => {
    const proprietaireId = selectedPrestation?.ID_Proprietaire;

    if (!proprietaireId) {
      return [];
    }

    return animaux.filter(
      (animal) => animal.ID_Proprietaire === proprietaireId,
    );
  }, [animaux, selectedPrestation]);

  return (
    <Modal
      open={open}
      title={
        editingId ? "Modifier la consultation" : "Ajouter une consultation"
      }
      onClose={onClose}
    >
      {prestations.length === 0 ||
      animaux.length === 0 ||
      tarifs.length === 0 ? (
        <div className="p-6">
          <p className="text-blue-900">
            Une <u>prestation</u>, un <u>animal</u> et un <u>tarif</u> doivent
            exister avant de pouvoir créer une consultation.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* PRESTATION */}
            <Select
              id="Prestation"
              label="Prestation"
              icon={File}
              name="ID_Prestation"
              value={form.ID_Prestation}
              onChange={onChange}
              required
            >
              <option value="">Sélectionner une prestation</option>

              {prestations.map((prestation) => {
                const proprietaire = prestation.Proprietaire_Prestation;

                const proprietaireLabel = proprietaire?.Etablissement
                  ? `${proprietaire.Raison_sociale} ${proprietaire.Etablissement}`
                  : `${proprietaire?.Prenom_Proprietaire ?? ""} ${proprietaire?.Nom_Proprietaire ?? ""}`;

                return (
                  <option
                    key={prestation.ID_Prestation}
                    value={prestation.ID_Prestation}
                  >
                    {formatDate(prestation.Date_Prestation)}
                    {" - "}
                    {proprietaireLabel}
                  </option>
                );
              })}
            </Select>

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

                {filteredAnimaux.map((animal) => (
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

            {/* ZONAGES */}
            <div className="md:col-span-2">
              <div className="mb-2">
                <label className="flex gap-2 text-sm font-medium text-blue-700">
                  <Crosshair size={18} />
                  Zonages associés
                </label>
              </div>

              {zonages.length === 0 ? (
                <p className="text-sm text-blue-900">
                  Aucun zonage disponible.
                </p>
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
                            onChange={() => onZonageToggle(zonage.ID_Zonage)}
                            disabled={saving}
                          />

                          <span className="flex items-center gap-1 text-md font-medium text-blue-900">
                            {zonage.Nom_Zonage}

                            {zonage.Position_Zonage &&
                              `-${zonage.Position_Zonage}`}

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
                              onZonageCommentChange(
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
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex items-center justify-between gap-3">
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
      )}
    </Modal>
  );
}
