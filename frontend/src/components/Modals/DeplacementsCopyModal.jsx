import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";

export default function DeplacementsCopyModal({
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
  if (!open) {
    return null;
  }

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
      <form onSubmit={onSubmit} className="space-y-6 p-6">
        <p className="text-sm text-blue-700">
          Copiez les déplacements vers une <u>nouvelle</u> année.
        </p>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="flex justify-around gap-4">
          <div className="min-w-0 flex-1">
            <Select
              id="sourceDeplacementYear"
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

          <div className="min-w-0 flex-1">
            <Input
              id="targetDeplacementYear"
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

        {targetYearExists && (
          <p role="alert" className="text-sm text-red-600">
            L'année de destination contient déjà des déplacements.
          </p>
        )}

        {invalidTargetYear && targetYear !== "" && (
          <p role="alert" className="text-sm text-red-600">
            L'année doit être comprise entre 2000 et 2100.
          </p>
        )}

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
