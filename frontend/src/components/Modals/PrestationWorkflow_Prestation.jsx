import { useEffect, useState } from "react";

import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import ProprietaireOptions from "../ProprietaireOptions.jsx";
import DeplacementsModal from "./Deplacements_Modal.jsx";

import {
  File,
  MapPin,
  CalendarDays,
  Car,
  Plus,
  BanknoteArrowDown,
} from "lucide-react";

import { createPrestation } from "../../api/prestations.js";
import { getProprietaires } from "../../api/proprietaires.js";
import { getDeplacements, createDeplacement } from "../../api/deplacements.js";

const emptyForm = {
  ID_Proprietaire: "",
  ID_Lieu: "",
  ID_Deplacement: "",
  Date_Prestation: "",
  Remise_Prestation: "0",
};

export default function PrestationWorkflowPrestation({ onCreated, onError }) {
  const [proprietaires, setProprietaires] = useState([]);
  const [deplacements, setDeplacements] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);

  const [customLieu, setCustomLieu] = useState(false);

  const [showDeplacementForm, setShowDeplacementForm] = useState(false);
  const [savingDeplacement, setSavingDeplacement] = useState(false);

  const [deplacementForm, setDeplacementForm] = useState({
    Annee_Deplacement: String(new Date().getFullYear()),
    Denomination_Deplacement: "",
    Montant_Deplacement: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  function getToday() {
    const now = new Date();

    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  }

  async function loadData() {
    try {
      const [proprietairesData, deplacementsData] = await Promise.all([
        getProprietaires(),
        getDeplacements(),
      ]);

      setProprietaires(proprietairesData);
      setDeplacements(deplacementsData);

      setForm({
        ...emptyForm,
        Date_Prestation: getToday(),
      });
    } catch (err) {
      onError?.(err.message);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleProprietaireChange(event) {
    const value = event.target.value;

    handleChange(event);

    if (!customLieu) {
      setForm((current) => ({
        ...current,
        ID_Proprietaire: value,
        ID_Lieu: value,
      }));
    }
  }

  function handleLieuDifferent() {
    setCustomLieu(true);

    setForm((current) => ({
      ...current,
      ID_Lieu:
        current.ID_Lieu === current.ID_Proprietaire ? "" : current.ID_Lieu,
    }));
  }

  function handleLieuProprietaire() {
    setCustomLieu(false);

    setForm((current) => ({
      ...current,
      ID_Lieu: current.ID_Proprietaire,
    }));
  }

  function openDeplacementForm() {
    setDeplacementForm({
      Annee_Deplacement: String(new Date().getFullYear()),
      Denomination_Deplacement: "",
      Montant_Deplacement: "",
    });

    setShowDeplacementForm(true);
  }

  function closeDeplacementForm() {
    if (savingDeplacement) {
      return;
    }

    setShowDeplacementForm(false);
  }

  function handleDeplacementChange(event) {
    const { name, value } = event.target;

    setDeplacementForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleDeplacementSubmit(event) {
    event.preventDefault();

    try {
      setSavingDeplacement(true);
      onError?.("");

      const newDeplacement = await createDeplacement(deplacementForm);

      const deplacementsData = await getDeplacements();

      setDeplacements(deplacementsData);

      setForm((current) => ({
        ...current,
        ID_Deplacement: newDeplacement.ID_Deplacement,
      }));

      setShowDeplacementForm(false);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSavingDeplacement(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      onError?.("");

      const prestation = await createPrestation(form);

      onCreated(prestation);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* PROPRIETAIRE */}
          <Select
            id="workflow-Proprietaire"
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

          {/* LIEU */}
          <div className="flex flex-col gap-2">
            <label className="flex text-sm font-medium text-blue-700">
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                Lieu de prestation
              </div>
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
                  className="cursor-pointer text-left text-sm text-blue-700 underline hover:text-blue-900 disabled:opacity-50"
                >
                  Choisir un autre lieu
                </button>
              </>
            ) : (
              <>
                <Select
                  id="workflow-Lieu"
                  label=""
                  name="ID_Lieu"
                  value={form.ID_Lieu}
                  onChange={handleChange}
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
                  className="cursor-pointer text-left text-sm text-blue-700 underline hover:text-blue-900 disabled:opacity-50"
                >
                  Revenir à l'adresse du propriétaire
                </button>
              </>
            )}
          </div>

          {/* DATE */}
          <Input
            id="workflow-Date"
            label="Date de prestation"
            icon={CalendarDays}
            type="date"
            name="Date_Prestation"
            value={form.Date_Prestation}
            onChange={handleChange}
            required
          />

          {/* DEPLACEMENT */}
          <div className="relative">
            <Select
              id="workflow-Deplacement"
              name="ID_Deplacement"
              icon={Car}
              label="Déplacement"
              value={form.ID_Deplacement}
              onChange={handleChange}
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
                onClick={openDeplacementForm}
                disabled={saving}
                className="!py-1"
              >
                <div className="flex items-center gap-2">
                  <Plus size={16} />
                  Ajouter
                </div>
              </Button>
            </div>
          </div>

          {/* REMISE */}
          <Input
            id="workflow-Remise"
            label="Remise"
            icon={BanknoteArrowDown}
            type="number"
            name="Remise_Prestation"
            value={form.Remise_Prestation}
            onChange={handleChange}
            min="0"
            step="1"
            suffix="€"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Création..." : "Créer la prestation →"}
          </Button>
        </div>
      </form>

      <DeplacementsModal
        open={showDeplacementForm}
        editingId={null}
        form={deplacementForm}
        saving={savingDeplacement}
        error=""
        onClose={closeDeplacementForm}
        onSubmit={handleDeplacementSubmit}
        onChange={handleDeplacementChange}
        onDelete={() => {}}
      />
    </>
  );
}
