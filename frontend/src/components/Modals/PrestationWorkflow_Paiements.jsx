import { useEffect, useState } from "react";
import PaiementsModal from "./Paiements_Modal.jsx";
import { formatDateInput, formatDateShort } from "../../utils/formatDate.js";
import PrestationAmountHeader from "../PrestationAmountHeader.jsx";
import { MOYENS_PAIEMENT } from "../../constants/paiement.js";
import { Plus } from "lucide-react";

import {
  getPaiements,
  createPaiement,
  updatePaiement,
  deletePaiement,
} from "../../api/paiements.js";

const emptyForm = {
  ID_Prestation: "",
  Date_Paiement: "",
  Montant_Paiement: "",
  Moyen_Paiement: "",
  E_Reporting_Paiement: false,
  E_Facture_Paiement: false,
  E_Other_Paiement: false,
  Date_Encaissement: "",
};

function getToday() {
  const now = new Date();

  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export default function PrestationWorkflowPaiements({
  prestationId,
  prestation,
  onError,
  onPrestationUpdated,
}) {
  const [paiements, setPaiements] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!prestationId) {
      return;
    }

    loadData();
  }, [prestationId]);

  async function loadData() {
    try {
      onError?.("");

      const data = await getPaiements();

      setPaiements(
        data.filter((paiement) => paiement.ID_Prestation === prestationId),
      );
    } catch (err) {
      onError?.(err.message);
    }
  }

  function openCreateForm() {
    setEditingId(null);

    setForm({
      ...emptyForm,
      ID_Prestation: prestationId,
      Date_Paiement: getToday(),
    });

    onError?.("");
    setShowForm(true);
  }

  function openEditForm(paiement) {
    setEditingId(paiement.ID_Paiement);

    setForm({
      ID_Prestation: paiement.ID_Prestation ?? prestationId,
      Date_Paiement: formatDateInput(paiement.Date_Paiement) ?? "",
      Montant_Paiement: paiement.Montant_Paiement ?? "",
      Moyen_Paiement: paiement.Moyen_Paiement ?? "",
      E_Reporting_Paiement: Boolean(paiement.E_Reporting_Paiement),
      E_Facture_Paiement: Boolean(paiement.E_Facture_Paiement),
      E_Other_Paiement: Boolean(paiement.E_Other_Paiement),
      Date_Encaissement: formatDateInput(paiement.Date_Encaissement) ?? "",
    });

    onError?.("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      onError?.("");

      const payload = {
        ...form,
        ID_Prestation: prestationId,
      };

      if (editingId) {
        await updatePaiement(editingId, payload);
      } else {
        await createPaiement(payload);
      }

      await loadData();
      await onPrestationUpdated?.();
      closeForm();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce paiement ?")) {
      return;
    }

    try {
      setSaving(true);
      onError?.("");

      await deletePaiement(id);

      if (editingId === id) {
        closeForm();
      }

      await loadData();
      await onPrestationUpdated?.();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <PrestationAmountHeader prestation={prestation} />

        <div className="flex flex-wrap justify-center gap-3">
          {/* Add a payment */}
          <button
            type="button"
            onClick={openCreateForm}
            disabled={saving}
            className="flex w-full max-w-[220px] min-h-[100px] items-center justify-center rounded-md border-2 border-dashed border-blue-300 p-4 text-blue-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed cursor-pointer disabled:opacity-50 shadow-lg"
          >
            <span className="flex flex-col items-center text-sm">
              <Plus size={58} strokeWidth={1} />
              <span>Ajouter un paiement</span>
            </span>
          </button>

          {paiements.map((paiement) => {
            const moyen = MOYENS_PAIEMENT[paiement.Moyen_Paiement];
            const MoyenIcon = moyen?.icon;

            return (
              <button
                key={paiement.ID_Paiement}
                type="button"
                onClick={() => openEditForm(paiement)}
                className="relative w-full max-w-[220px] min-h-[100px] rounded-md border border-blue-200 p-4 pt-6 transition hover:border-blue-400 hover:bg-blue-50 cursor-pointer  shadow-lg"
              >
                <div className="flex flex-col gap-1">
                  <div className="font-medium text-blue-900">
                    {paiement.Montant_Paiement}€
                    {moyen ? (
                      <span className="ml-1 inline-flex items-center gap-1 text-xs">
                        {"en "}
                        {moyen.label.toLowerCase()}
                      </span>
                    ) : (
                      <span className="ml-1 text-xs text-amber-600">
                        (pas de moyen sélectionné)
                      </span>
                    )}
                  </div>

                  {/* Badges */}
                  <div>
                    {moyen && (
                      <div className="absolute left-8 top-7">
                        {MoyenIcon && (
                          <MoyenIcon size={18} strokeWidth={1.25} />
                        )}
                      </div>
                    )}
                    <div className="absolute -right-0 top-0 flex">
                      {paiement.E_Reporting_Paiement && (
                        <span className="rounded-tr-md rounded-bl-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          E-Reporting
                        </span>
                      )}
                      {paiement.E_Facture_Paiement && (
                        <span className="rounded-tr-md rounded-bl-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          E-Facture
                        </span>
                      )}
                      {paiement.E_Other_Paiement && (
                        <span className="rounded-tr-md rounded-bl-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          E-Autre
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col text-sm text-blue-700">
                    <span>
                      Réception : {formatDateShort(paiement.Date_Paiement)}
                    </span>

                    <span>
                      Encaissement :{" "}
                      {formatDateShort(paiement.Date_Encaissement)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <PaiementsModal
        open={showForm}
        editingId={editingId}
        form={form}
        setForm={setForm}
        prestation={prestation}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </>
  );
}
