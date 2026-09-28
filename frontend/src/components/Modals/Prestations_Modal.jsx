import { useEffect, useState } from "react";

import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Modal from "../ui/Modal.jsx";
import ProprietaireOptions from "../ProprietaireOptions.jsx";
import {
  MapPin,
  File,
  CalendarDays,
  Car,
  Plus,
  BanknoteArrowDown,
} from "lucide-react";

export default function PrestationsModal({
  open,
  editingId,
  form,
  proprietaires,
  deplacements,
  saving,
  onClose,
  onSubmit,
  onChange,
  onDelete,
  onAddDeplacement,
  onAddProprietaire,
}) {
  const [customLieu, setCustomLieu] = useState(false);

  useEffect(() => {
    if (!form.ID_Proprietaire) {
      setCustomLieu(false);
      return;
    }

    setCustomLieu(
      Boolean(form.ID_Lieu && form.ID_Lieu !== form.ID_Proprietaire),
    );
  }, [form.ID_Proprietaire, form.ID_Lieu, open]);

  function handleProprietaireChange(event) {
    const value = event.target.value;

    onChange(event);

    if (!customLieu) {
      onChange({
        target: {
          name: "ID_Lieu",
          value,
        },
      });
    }
  }

  function handleLieuDifferent() {
    setCustomLieu(true);

    if (!form.ID_Lieu || form.ID_Lieu === form.ID_Proprietaire) {
      onChange({
        target: {
          name: "ID_Lieu",
          value: "",
        },
      });
    }
  }

  function handleLieuProprietaire() {
    setCustomLieu(false);

    onChange({
      target: {
        name: "ID_Lieu",
        value: form.ID_Proprietaire,
      },
    });
  }

  return (
    <Modal
      open={open}
      title={editingId ? "Modifier la prestation" : "Ajouter une prestation"}
      onClose={onClose}
    >
      {proprietaires.length === 0 || deplacements.length === 0 ? (
        <div className="p-6">
          <p className="text-blue-900">
            Un <u>propriétaire</u> et un <u>déplacement</u> doivent exister
            avant de pouvoir créer une prestation.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* PROPRIETAIRE */}
            <div className="relative">
              <Select
                id="Proprietaire"
                label="Propriétaire"
                icon={File}
                name="ID_Proprietaire"
                value={form.ID_Proprietaire}
                onChange={handleProprietaireChange}
                required
              >
                <option value="">Sélectionner</option>

                <ProprietaireOptions proprietaires={proprietaires} />
              </Select>

              <div className="absolute right-0 top-0">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onAddProprietaire}
                  disabled={saving}
                  className="!p-1"
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            {/* LIEU */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-blue-700 flex">
                <MapPin size={18} />
                Lieu de prestation
              </label>

              {!form.ID_Proprietaire ? (
                <div className="flex min-h-10 items-center rounded-md border border-blue-200 bg-blue-50 px-3 text-sm text-blue-900">
                  Sélectionner d'abord un propriétaire
                </div>
              ) : !customLieu ? (
                <>
                  <div className="flex min-h-10 items-center rounded-md border border-blue-200 bg-blue-50 px-3 text-sm text-blue-900">
                    Même adresse que le propriétaire
                  </div>

                  <button
                    type="button"
                    onClick={handleLieuDifferent}
                    disabled={saving}
                    className="text-left text-sm text-blue-700 underline hover:text-blue-900 disabled:opacity-50 cursor-pointer"
                  >
                    Choisir un autre lieu
                  </button>
                </>
              ) : (
                <>
                  <Select
                    id="Lieu"
                    label=""
                    name="ID_Lieu"
                    value={form.ID_Lieu}
                    onChange={onChange}
                    required
                    disabled={saving}
                  >
                    <option value="">Sélectionner un lieu</option>

                    <ProprietaireOptions proprietaires={proprietaires} />
                  </Select>

                  <button
                    type="button"
                    onClick={handleLieuProprietaire}
                    disabled={saving}
                    className="text-left text-sm text-blue-700 underline hover:text-blue-900 disabled:opacity-50 cursor-pointer"
                  >
                    Revenir à l'adresse du propriétaire
                  </button>
                </>
              )}
            </div>

            {/* DATE */}
            <Input
              id="Date_Prestation"
              label="Date de prestation"
              icon={CalendarDays}
              type="date"
              name="Date_Prestation"
              value={form.Date_Prestation}
              onChange={onChange}
              required
            />

            {/* DEPLACEMENT */}
            <div className="relative">
              <Select
                id="Deplacement"
                name="ID_Deplacement"
                icon={Car}
                label="Déplacement"
                value={form.ID_Deplacement}
                onChange={onChange}
                required
              >
                <option value="">Sélectionner un déplacement</option>
                {deplacements.map((deplacement) => (
                  <option
                    key={deplacement.ID_Deplacement}
                    value={deplacement.ID_Deplacement}
                  >
                    {deplacement.Denomination_Deplacement}
                    {" ("}
                    {deplacement.Montant_Deplacement}
                    {" €)"}
                  </option>
                ))}
              </Select>

              <div className="absolute right-0 top-0">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onAddDeplacement}
                  disabled={saving}
                  className="!p-1"
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            {/* REMISE */}
            <Input
              id="Remise_Prestation"
              label="Remise"
              icon={BanknoteArrowDown}
              type="number"
              name="Remise_Prestation"
              value={form.Remise_Prestation}
              onChange={onChange}
              min="0"
              step="1"
              suffix="€"
            />
          </div>

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
                variant="secondary"
                onClick={onClose}
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
