import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Modal from "../ui/Modal.jsx";
import PrestationHeader from "../headers/PrestationHeader.jsx";

import {
  CalendarDays,
  CircleEuro,
  Tag,
  CalendarArrowUp,
  ReceiptText,
  CalendarCheck,
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
      if (!checked) return;

      setForm((current) => ({
        ...current,

        E_Reporting_Paiement: name === "E_Reporting_Paiement",
        E_Facture_Paiement: name === "E_Facture_Paiement",
        E_Other_Paiement: name === "E_Other_Paiement",
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
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
  const isDeclared = Boolean(editingId && form.Date_Declaration);

  function getToday() {
    const now = new Date();

    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  }

  return (
    <Modal
      open={open}
      title={editingId ? "Modifier le paiement" : "Ajouter un paiement"}
      onClose={onClose}
      className
    >
      <PrestationHeader
        prestation={prestation}
        className=" !border-none"
        onClick={onOpenPrestation}
      />

      <form onSubmit={onSubmit} className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Ligne 1 */}
          <div className="order-1">
            <Input
              id="Date_Paiement"
              label="Date de réception"
              icon={CalendarDays}
              type="date"
              name="Date_Paiement"
              value={form.Date_Paiement}
              onChange={handleChange}
            />
          </div>

          <div className="order-2">
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
              disabled={isDeclared}
            />
          </div>

          {/* Ligne 2 */}
          <div className="order-3">
            <Select
              id="Moyen_Paiement"
              label="Moyen de paiement"
              icon={Tag}
              name="Moyen_Paiement"
              value={form.Moyen_Paiement}
              onChange={handleChange}
              disabled={isDeclared}
            >
              <option value="">Sélectionner</option>
              <option value="Espèces">Espèces</option>
              <option value="Chèque">Chèque</option>
              <option value="Virement">Virement</option>
            </Select>
          </div>

          {/* Type de déclaration */}
          <div className="order-4">
            <label className="flex gap-2 text-sm font-medium text-blue-700 mb-2">
              <ReceiptText size={18} />
              Type de déclaration
            </label>

            <div className="flex justify-around">
              {[
                { name: "E_Reporting_Paiement", label: "E-Reporting" },
                { name: "E_Facture_Paiement", label: "E-Facturing" },
                { name: "E_Other_Paiement", label: "Autre" },
              ].map((item) => {
                const checked = form[item.name];

                return (
                  <label
                    key={item.name}
                    className={`
                      inline-flex items-center px-3 py-2 rounded-full
                      text-xs font-medium cursor-pointer
                      border transition-colors
                      ${
                        checked
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-blue-600 border-blue-300 hover:bg-blue-100/50"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      name={item.name}
                      checked={checked}
                      onChange={handleChange}
                      className="sr-only"
                      disabled={isDeclared}
                    />

                    {item.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="order-5">
            <Input
              id="Date_Encaissement"
              label="Date d'encaissement"
              icon={CalendarArrowUp}
              type="date"
              name="Date_Encaissement"
              value={form.Date_Encaissement || ""}
              onChange={handleChange}
              disabled={!paiementComplete}
            />
          </div>

          {/* Ligne 3 */}
          <div className="order-6">
            <Input
              id="Date_Declaration"
              label="Date de déclaration"
              icon={CalendarCheck}
              type="date"
              name="Date_Declaration"
              value={form.Date_Declaration || ""}
              onChange={handleChange}
              disabled={
                (!form.Date_Encaissement && !form.Date_Declaration) ||
                isDeclared
              }
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div>
            {editingId && (
              <Button
                variant="danger"
                onClick={() => onDelete(editingId)}
                disabled={saving}
              >
                Supprimer
              </Button>
            )}
          </div>

          {isDeclared && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 flex items-center gap-2 font-semibold">
              <ReceiptText size={18} />
              Paiement déclaré
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={onClose} variant="secondary" disabled={saving}>
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
