import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import { ArrowRight, X } from "lucide-react";

function formatAmount(amount) {
  return (
    Number(amount).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

function DeplacementList({ items, onRemoveDeplacement, disabled }) {
  return (
    <div className="rounded-lg bg-blue-50">
      <span className="flex ml-1 text-xs font-normal text-blue-700 pr-4 py-1">
        Déplacements sélectionnés : {items.length}
      </span>

      <div className="max-h-56 overflow-y-auto space-y-1">
        {items.map((deplacement) => (
          <div
            key={deplacement.ID_Deplacement}
            className="flex items-center justify-between gap-2 rounded-lg border border-blue-100 bg-white px-3 py-2"
          >
            <span className="min-w-0 truncate text-xs text-blue-900">
              {deplacement.Denomination_Deplacement}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-blue-900">
                {formatAmount(deplacement.Montant_Deplacement)}
              </span>

              <button
                type="button"
                title="Désélectionner ce déplacement"
                onClick={() => onRemoveDeplacement(deplacement.ID_Deplacement)}
                disabled={disabled}
                className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DeplacementsCopyModal({
  open,
  deplacements = [],
  availableYears,
  sourceYear,
  targetYear,
  copying,
  error,
  onSourceYearChange,
  onTargetYearChange,
  onRemoveDeplacement,
  onClose,
  onSubmit,
}) {
  const targetYearExists = availableYears.includes(Number(targetYear));

  const invalidTargetYear =
    !targetYear ||
    !Number.isInteger(Number(targetYear)) ||
    Number(targetYear) < 2000 ||
    Number(targetYear) > 2100;

  return (
    <Modal
      open={open}
      title="Copier les déplacements"
      onClose={() => {
        if (!copying) onClose();
      }}
    >
      <form onSubmit={onSubmit} className="p-6">
        <p className="text-sm text-blue-700 text-center mb-4">
          Copiez les déplacements vers une <u>nouvelle</u> année.
        </p>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 items-start">
          <div className="min-w-0">
            <Select
              id="sourceDeplacementYear"
              label="Depuis"
              value={sourceYear}
              onChange={(event) => onSourceYearChange(event.target.value)}
              disabled={copying}
              required
            >
              {availableYears.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </Select>
          </div>

          <div className="min-w-0">
            <Input
              id="targetDeplacementYear"
              icon={ArrowRight}
              label="Vers"
              type="number"
              min="2000"
              max="2100"
              value={targetYear}
              onChange={(event) => onTargetYearChange(event.target.value)}
              disabled={copying}
              required
            />
          </div>
        </div>

        <div className="min-h-8 mt-2 text-right text-xs">
          {targetYearExists ? (
            <p role="alert" className="text-red-600">
              L'année de destination contient déjà des déplacements.
            </p>
          ) : invalidTargetYear ? (
            targetYear !== "" && (
              <p role="alert" className="text-red-600">
                L'année doit être comprise entre 2000 et 2100.
              </p>
            )
          ) : (
            <p className="text-green-700 font-medium">
              ✓ Année disponible à la copie
            </p>
          )}
        </div>

        <div className="w-full">
          <DeplacementList
            items={deplacements}
            onRemoveDeplacement={onRemoveDeplacement}
            disabled={copying}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="clear_blue"
            onClick={onClose}
            disabled={copying}
          >
            Annuler
          </Button>

          <Button
            type="submit"
            disabled={
              copying ||
              invalidTargetYear ||
              targetYearExists ||
              deplacements.length === 0
            }
          >
            {copying ? "Copie en cours..." : "Confirmer la copie"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
