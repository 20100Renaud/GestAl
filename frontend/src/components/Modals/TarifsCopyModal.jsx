import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import { FileOutput } from "lucide-react";

export default function TarifsCopyModal({
  open,
  availableYears,
  sourceYear,
  targetYear,
  copying,
  error,
  onSourceYearChange,
  onTargetYearChange,
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
      title="Copier les tarifs"
      onClose={() => {
        if (!copying) {
          onClose();
        }
      }}
    >
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <p className="text-sm text-blue-700 text-center pb-6">
          Copiez les tarifs vers une <u>nouvelle</u> année.
        </p>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="flex gap-1 sm:gap-4 items-end justify-center">
          <div className="min-w-0">
            <Select
              id="sourceYear"
              label="Année à copier"
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

          <div className="mb-2 text-blue-700">
            <FileOutput strokeWidth={1.5} style={{ transform: "scaleX(-1)" }}/>
          </div>

          <div className="min-w-0">
            <Input
              id="targetYear"
              label="Année destination"
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

        <div className="h-2">
          {targetYearExists && (
            <p className="text-sm text-red-600 text-right" role="alert">
              L'année de destination contient déjà des tarifs.
            </p>
          )}
          {invalidTargetYear && targetYear !== "" && (
            <p className="text-sm text-red-600 text-right" role="alert">
              L'année doit être comprise entre 2000 et 2100.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3">
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
            disabled={copying || invalidTargetYear || targetYearExists}
          >
            {copying ? "Copie en cours..." : "Confirmer la copie"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
