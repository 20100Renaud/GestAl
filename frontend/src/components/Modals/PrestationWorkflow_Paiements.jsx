import { useEffect, useState } from "react";

import Button from "../ui/Button.jsx";
import PaiementsModal from "./Paiements_Modal.jsx";

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

export default function PrestationWorkflowPaiements({ prestationId, onError }) {
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
      Date_Paiement: paiement.Date_Paiement ?? "",
      Montant_Paiement: paiement.Montant_Paiement ?? "",
      Moyen_Paiement: paiement.Moyen_Paiement ?? "",
      E_Reporting_Paiement: Boolean(paiement.E_Reporting_Paiement),
      E_Facture_Paiement: Boolean(paiement.E_Facture_Paiement),
      E_Other_Paiement: Boolean(paiement.E_Other_Paiement),
      Date_Encaissement: paiement.Date_Encaissement ?? "",
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

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
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
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  }

  const paiementComplete =
    Boolean(form.Moyen_Paiement) &&
    (form.E_Reporting_Paiement ||
      form.E_Facture_Paiement ||
      form.E_Other_Paiement);

  const prestations = [
    {
      ID_Prestation: prestationId,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">Prestation</p>

          <p className="font-medium text-blue-900">#{prestationId}</p>
        </div>

        {paiements.length === 0 ? (
          <div className="rounded-md border border-blue-200 p-8 text-center">
            <p className="text-blue-700">Aucun paiement ajouté.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paiements.map((paiement) => (
              <button
                key={paiement.ID_Paiement}
                type="button"
                onClick={() => openEditForm(paiement)}
                className="w-full rounded-md border border-blue-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50"
              >
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium text-blue-900">
                      {paiement.Montant_Paiement} €
                    </div>

                    <div className="text-sm text-blue-600">
                      {paiement.Moyen_Paiement || "Moyen non renseigné"}
                    </div>
                  </div>

                  <div className="text-sm text-blue-700">
                    {paiement.Date_Paiement || "-"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="button" onClick={openCreateForm} disabled={saving}>
            + Ajouter un paiement
          </Button>
        </div>
      </div>

      <PaiementsModal
        open={showForm}
        editingId={editingId}
        form={form}
        prestations={prestations}
        saving={saving}
        paiementComplete={paiementComplete}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onDelete={handleDelete}
      />
    </>
  );
}
