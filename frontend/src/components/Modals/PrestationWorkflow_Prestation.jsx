import { useEffect, useState } from "react";

import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import ProprietaireOptions from "../ProprietaireOptions.jsx";
import DeplacementsModal from "./Deplacements_Modal.jsx";
import ProprietairesModal from "./Proprietaires_Modal.jsx";

import {
  File,
  CalendarDays,
  Car,
  Plus,
  BanknoteArrowDown,
  Undo2,
  House,
  Warehouse,
  SavePlus,
  Save,
} from "lucide-react";

import { createPrestation, updatePrestation } from "../../api/prestations.js";

import {
  getProprietaires,
  createProprietaire,
} from "../../api/proprietaires.js";

import { getDeplacements, createDeplacement } from "../../api/deplacements.js";

const emptyForm = {
  ID_Proprietaire: "",
  ID_Lieu: "",
  ID_Deplacement: "",
  Date_Prestation: "",
  Remise_Prestation: "0",
};

const emptyProprietaireForm = {
  raisonSociale: "Particulier",
  etablissement: "",
  civilite: "",
  nom: "",
  prenom: "",
  email: "",
  adresse: "",
  ville: "",
  cp: "",
  tel: "",
};

export default function PrestationWorkflowPrestation({
  prestation,
  onCreated,
  onUpdated,
  onError,
}) {
  const [proprietaires, setProprietaires] = useState([]);
  const [deplacements, setDeplacements] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [customLieu, setCustomLieu] = useState(false);

  const [showDeplacementForm, setShowDeplacementForm] = useState(false);
  const [savingDeplacement, setSavingDeplacement] = useState(false);

  const [showProprietaireForm, setShowProprietaireForm] = useState(false);
  const [savingProprietaire, setSavingProprietaire] = useState(false);

  const [proprietaireForm, setProprietaireForm] = useState(
    emptyProprietaireForm,
  );

  const [deplacementForm, setDeplacementForm] = useState({
    Annee_Deplacement: String(new Date().getFullYear()),
    Denomination_Deplacement: "",
    Montant_Deplacement: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (prestation) {
      const proprietaireId = prestation.ID_Proprietaire
        ? String(prestation.ID_Proprietaire)
        : "";

      const lieuId = prestation.ID_Lieu ? String(prestation.ID_Lieu) : "";

      const deplacementId = prestation.ID_Deplacement
        ? String(prestation.ID_Deplacement)
        : "";

      const prestationForm = {
        ID_Proprietaire: proprietaireId,
        ID_Lieu: lieuId,
        ID_Deplacement: deplacementId,
        Date_Prestation: prestation.Date_Prestation
          ? prestation.Date_Prestation.slice(0, 10)
          : "",
        Remise_Prestation: String(prestation.Remise_Prestation ?? "0"),
      };

      setForm(prestationForm);
      setInitialForm(prestationForm);

      setCustomLieu(Boolean(lieuId && lieuId !== proprietaireId));

      return;
    }

    const newForm = {
      ...emptyForm,
      Date_Prestation: getToday(),
    };

    setForm(newForm);
    setInitialForm(newForm);
    setCustomLieu(false);
  }, [prestation]);

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
    const value = String(event.target.value);

    setForm((current) => ({
      ...current,
      ID_Proprietaire: value,
      ...(customLieu ? {} : { ID_Lieu: value }),
    }));
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

  /* PROPRIETAIRE */

  function openProprietaireForm() {
    setProprietaireForm({
      ...emptyProprietaireForm,
    });

    setShowProprietaireForm(true);
  }

  function closeProprietaireForm() {
    if (savingProprietaire) {
      return;
    }

    setShowProprietaireForm(false);
  }

  function handleProprietaireFormChange(event) {
    const { name, value } = event.target;

    setProprietaireForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleProprietaireSubmit(event) {
    event.preventDefault();

    try {
      setSavingProprietaire(true);
      onError?.("");

      const newProprietaire = await createProprietaire(proprietaireForm);
      const newProprietaireId = String(
        newProprietaire.proprietaire.ID_Proprietaire,
      );

      const proprietairesData = await getProprietaires();

      setProprietaires(proprietairesData);

      setForm((current) => ({
        ...current,
        ID_Proprietaire: newProprietaireId,
        ID_Lieu: customLieu ? current.ID_Lieu : newProprietaireId,
      }));

      setShowProprietaireForm(false);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSavingProprietaire(false);
    }
  }

  /* DEPLACEMENT */

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

  /* PRESTATION */
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      onError?.("");

      if (prestation?.ID_Prestation) {
        const updatedPrestation = await updatePrestation(
          prestation.ID_Prestation,
          form,
        );

        setInitialForm(form);
        onUpdated?.(updatedPrestation);

        return;
      }

      const newPrestation = await createPrestation(form);

      onCreated?.(newPrestation);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Changes ?
  const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);

  return (
    <>
      <form onSubmit={handleSubmit} className="p-2 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* PROPRIETAIRE */}
          <div className="relative">
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

            <Button
              type="button"
              variant="secondary"
              onClick={openProprietaireForm}
              disabled={saving}
              className="absolute right-0 top-0 !p-1"
            >
              <Plus size={16} />
            </Button>
          </div>

          {/* LIEU */}
          <div className="flex flex-col gap-2">
            <label className="flex text-sm font-medium text-blue-700">
              <div className="flex items-center gap-2">
                {customLieu ? <Warehouse size={18} /> : <House size={18} />}

                {customLieu ? "Lieu de prestation" : "Prestation à domicile"}
              </div>
            </label>

            {!form.ID_Proprietaire ? (
              <div className="flex h-full items-center rounded-md border border-blue-200 bg-blue-50 px-3 text-sm text-blue-900">
                Sélectionner d'abord un propriétaire
              </div>
            ) : !customLieu ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleLieuDifferent}
                disabled={saving}
                className="h-full"
              >
                Changer de lieu
              </Button>
            ) : (
              <div className="relative">
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

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleLieuProprietaire}
                  disabled={saving}
                  title="Revenir à l'adresse du propriétaire"
                  aria-label="Revenir à l'adresse du propriétaire"
                  className="absolute right-0 -top-7 !p-1"
                >
                  <Undo2 size={16} />
                </Button>
              </div>
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

            <Button
              type="button"
              variant="secondary"
              onClick={openDeplacementForm}
              disabled={saving}
              className="absolute right-0 top-0 !p-1"
            >
              <Plus size={16} />
            </Button>
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
          <Button
            type="submit"
            disabled={
              saving || (Boolean(prestation?.ID_Prestation) && !hasChanges)
            }
          >
            {saving ? (
              <p className="mr-2 h-4 w-4 animate-pulse">Enregistrement...</p>
            ) : prestation?.ID_Prestation ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les modifications
              </>
            ) : (
              <>
                <SavePlus className="mr-2 h-4 w-4" />
                Créer la prestation
              </>
            )}
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

      <ProprietairesModal
        open={showProprietaireForm}
        editingId={null}
        form={proprietaireForm}
        saving={savingProprietaire}
        onClose={closeProprietaireForm}
        onSubmit={handleProprietaireSubmit}
        onChange={handleProprietaireFormChange}
        onDelete={() => {}}
      />
    </>
  );
}
