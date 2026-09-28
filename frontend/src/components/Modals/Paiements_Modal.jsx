import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Modal from "../ui/Modal.jsx";
import {
  CalendarDays,
  File,
  CircleEuro,
  Tag,
  CalendarArrowUp,
  ReceiptText,
} from "lucide-react";

export default function PaiementsModal({
  open,
  editingId,
  form,

  saving,
  paiementComplete,
  onClose,
  onSubmit,
  onChange,
  onDelete,
}) {
  return (
    <Modal
      open={open}
      title={editingId ? "Modifier le paiement" : "Ajouter un paiement"}
      onClose={onClose}
    >

        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-blue-700">
                <File size={18} />
                Prestation
              </label>

              <div className="flex min-h-10 items-center rounded-md border border-blue-200 bg-blue-50 px-3 text-sm text-blue-900">
                Prestation #{form.ID_Prestation}
              </div>
            </div>

            <Input
              id="Date_Paiement"
              label="Date de reception"
              icon={CalendarDays}
              type="date"
              name="Date_Paiement"
              value={form.Date_Paiement}
              onChange={onChange}
            />

            <Input
              id="Montant_Paiement"
              label="Montant"
              icon={CircleEuro}
              type="number"
              step="0.01"
              min="0"
              name="Montant_Paiement"
              value={form.Montant_Paiement}
              onChange={onChange}
              suffix="€"
            />

            <Select
              id="Moyen_Paiement"
              label="Moyen de paiement"
              icon={Tag}
              name="Moyen_Paiement"
              value={form.Moyen_Paiement}
              onChange={onChange}
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
                  onChange={onChange}
                />
                <Input
                  id="E_Facture_Paiement"
                  label="E-Facture"
                  type="checkbox"
                  name="E_Facture_Paiement"
                  checked={form.E_Facture_Paiement}
                  onChange={onChange}
                />
                <Input
                  id="E_Other_Paiement"
                  label="E-Autre"
                  type="checkbox"
                  name="E_Other_Paiement"
                  checked={form.E_Other_Paiement}
                  onChange={onChange}
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
                  onChange={onChange}
                />
              ) : (
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-blue-700">
                    <CalendarArrowUp size={18} />
                    Date d'encaissement
                  </label>

                  <div className="flex items-center rounded-md border border-blue-200 bg-gray-100 px-3 py-2.5 text-sm text-blue-900">
                    Moyen et/ou type non renseignés.
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
