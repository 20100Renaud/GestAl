import { useEffect } from "react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Modal from "../ui/Modal.jsx";
import PrestationHeader from "../PrestationHeader.jsx";

import {
  CalendarDays,
  CircleEuro,
  Tag,
  CalendarArrowUp,
  ReceiptText,
} from "lucide-react";

export default function PaiementsModal({
  open,
  editingId,
  form,
  setForm,
  saving,
  prestation,
  onClose,
  onSubmit,
  onDelete,
  onOpenPrestation,
}) {
  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    if (type === "checkbox") {
      setForm((current) => {
        const next = {
          ...current,
          E_Reporting_Paiement: checked && name === "E_Reporting_Paiement",
          E_Facture_Paiement: checked && name === "E_Facture_Paiement",
          E_Other_Paiement: checked && name === "E_Other_Paiement",
        };

        const hasMoyen = Boolean(next.Moyen_Paiement?.trim());

        const hasType =
          next.E_Reporting_Paiement ||
          next.E_Facture_Paiement ||
          next.E_Other_Paiement;

        if (!hasMoyen || !hasType) {
          next.Date_Encaissement = "";
        }

        return next;
      });

      return;
    }

    setForm((current) => {
      const next = {
        ...current,
        [name]: value,
      };

      if (name === "Moyen_Paiement") {
        const hasMoyen = Boolean(value.trim());

        const hasType =
          next.E_Reporting_Paiement ||
          next.E_Facture_Paiement ||
          next.E_Other_Paiement;

        if (!hasMoyen || !hasType) {
          next.Date_Encaissement = "";
        }
      }

      return next;
    });
  }

  function isPaiementComplete(form) {
    return (
      Number(form.Montant_Paiement) > 0 &&
      Boolean(form.Moyen_Paiement?.trim()) &&
      (form.E_Reporting_Paiement ||
        form.E_Facture_Paiement ||
        form.E_Other_Paiement)
    );
  }

  const paiementComplete = isPaiementComplete(form);

  function getToday() {
    const now = new Date();

    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  }

  useEffect(() => {
    if (paiementComplete && !form.Date_Encaissement) {
      setForm((current) => ({
        ...current,
        Date_Encaissement: getToday(),
      }));
    }
  }, [paiementComplete, form.Date_Encaissement, setForm]);

  return (
    <Modal
      open={open}
      title={editingId ? "Modifier le paiement" : "Ajouter un paiement"}
      onClose={onClose}
    >
      <PrestationHeader
        prestation={prestation}
        className=" !border-none"
        onClick={onOpenPrestation}
      />

      <form onSubmit={onSubmit} className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            id="Date_Paiement"
            label="Date de reception"
            icon={CalendarDays}
            type="date"
            name="Date_Paiement"
            value={form.Date_Paiement}
            onChange={handleChange}
          />

          <Input
            id="Montant_Paiement"
            label="Montant"
            icon={CircleEuro}
            type="number"
            step="1"
            min="0"
            name="Montant_Paiement"
            value={form.Montant_Paiement}
            onChange={handleChange}
            suffix="€"
          />

          <Select
            id="Moyen_Paiement"
            label="Moyen de paiement"
            icon={Tag}
            name="Moyen_Paiement"
            value={form.Moyen_Paiement}
            onChange={handleChange}
          >
            <option value="">Sélectionner</option>
            <option value="Espèces">Espèces</option>
            <option value="Chèque">Chèque</option>
            <option value="Virement">Virement</option>
          </Select>

          <div>
            <label className="flex gap-2 text-sm font-medium text-blue-700 mb-2">
              <ReceiptText size={18} />
              Type de déclaration
            </label>

            <div className="ml-8">
              <Input
                id="E_Reporting_Paiement"
                label="E-Reporting"
                type="checkbox"
                name="E_Reporting_Paiement"
                checked={form.E_Reporting_Paiement}
                onChange={handleChange}
              />
              <Input
                id="E_Facture_Paiement"
                label="E-Facture"
                type="checkbox"
                name="E_Facture_Paiement"
                checked={form.E_Facture_Paiement}
                onChange={handleChange}
              />
              <Input
                id="E_Other_Paiement"
                label="E-Autre"
                type="checkbox"
                name="E_Other_Paiement"
                checked={form.E_Other_Paiement}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            {paiementComplete ? (
              <Input
                id="Date_Encaissement"
                label="Date d'encaissement"
                icon={CalendarArrowUp}
                type="date"
                name="Date_Encaissement"
                value={form.Date_Encaissement}
                onChange={handleChange}
              />
            ) : (
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-blue-700">
                  <CalendarArrowUp size={18} />
                  Date d'encaissement
                </label>

                <div className="flex items-center rounded-md border border-blue-200 bg-gray-100 px-3 py-2.5 text-sm text-blue-900 cursor-not-allowed">
                  Renseigner montant, moyen et/ou type.
                </div>
              </div>
            )}
          </div>
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
