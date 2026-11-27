import { useEffect, useState } from "react";
import { getAnimaux } from "../../api/animaux.js";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import { ProprietaireOptions } from "../options/ProprietaireOptions.jsx";
import DeplacementsModal from "../modals/Deplacements_Modal.jsx";
import ProprietairesModal from "../modals/Proprietaires_Modal.jsx";
import useConfirm from "../../hooks/useConfirm.jsx";
import { formatDateShort } from "../../utils/formatDate.js";
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
  Trash2,
  AlertCircle,
  Pencil,
} from "lucide-react";

import {
  createPrestation,
  updatePrestation,
  deletePrestation,
} from "../../api/prestations.js";

import {
  getProprietaires,
  createProprietaire,
  updateProprietaire,
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
  commentaire: "",
};

export default function PrestationWorkflowPrestation({
  prestation,
  onCreated,
  onUpdated,
  onDeleted,
  onError,
  onProprietaireUpdated,
  onAnimalsChange,
}) {
  const { confirm, ConfirmDialog } = useConfirm();

  const [proprietaires, setProprietaires] = useState([]);
  const [deplacements, setDeplacements] = useState([]);
  const [animaux, setAnimaux] = useState([]);
  const [scrollToComment, setScrollToComment] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [customLieu, setCustomLieu] = useState(false);
  const [editingProprietaireId, setEditingProprietaireId] = useState(null);

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

  // Now()
  function getToday() {
    const now = new Date();

    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  }

  // Refresh data
  async function loadData() {
    try {
      const [proprietairesData, deplacementsData, animauxData] =
        await Promise.all([
          getProprietaires(),
          getDeplacements(),
          getAnimaux(),
        ]);

      setProprietaires(proprietairesData);
      setDeplacements(deplacementsData);
      setAnimaux(animauxData);
    } catch (err) {
      onError?.(err.message);
    }
  }

  // Refresh animaux
  async function refreshAnimaux() {
    try {
      const animauxData = await getAnimaux();

      setAnimaux([...animauxData]);

      await onAnimalsChange?.(animauxData);

      return animauxData;
    } catch (err) {
      onError?.(err.message);
    }
  }

  // Update
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // Update Propriétaire
  function handleProprietaireChange(event) {
    const value = String(event.target.value);

    setForm((current) => ({
      ...current,
      ID_Proprietaire: value,
      ...(customLieu ? {} : { ID_Lieu: value }),
    }));
  }

  // Update Lieu different
  function handleLieuDifferent() {
    setCustomLieu(true);

    setForm((current) => ({
      ...current,
      ID_Lieu:
        current.ID_Lieu === current.ID_Proprietaire ? "" : current.ID_Lieu,
    }));
  }

  // Update Prorpiétaire
  function handleLieuProprietaire() {
    setCustomLieu(false);

    setForm((current) => ({
      ...current,
      ID_Lieu: current.ID_Proprietaire,
    }));
  }

  // Open Propriétaire Form
  function openProprietaireForm() {
    setEditingProprietaireId(null);

    setProprietaireForm({
      ...emptyProprietaireForm,
    });

    setShowProprietaireForm(true);
  }

  // Open Propriétaire Form
  function openEditProprietaireForm(scroll = false) {
    const proprietaire = proprietaires.find(
      (item) => String(item.ID_Proprietaire) === String(form.ID_Proprietaire),
    );

    if (!proprietaire) return;

    setEditingProprietaireId(proprietaire.ID_Proprietaire);

    setProprietaireForm({
      raisonSociale: proprietaire.Raison_sociale ?? "",
      etablissement: proprietaire.Etablissement ?? "",
      civilite: proprietaire.Civilite_Proprietaire ?? "",
      nom: proprietaire.Nom_Proprietaire ?? "",
      prenom: proprietaire.Prenom_Proprietaire ?? "",
      email: proprietaire.Email_Proprietaire ?? "",
      adresse: proprietaire.Adresse_Proprietaire ?? "",
      ville: proprietaire.Ville_Proprietaire ?? "",
      cp: proprietaire.CP_Proprietaire ?? "",
      tel: proprietaire.Tel_Proprietaire ?? "",
      commentaire: proprietaire.Commentaire_Proprietaire ?? "",
    });

    setScrollToComment(scroll);
    setShowProprietaireForm(true);
  }

  // Close propriétaire Form
  function closeProprietaireForm() {
    if (savingProprietaire) return;

    setShowProprietaireForm(false);
    setEditingProprietaireId(null);
    setProprietaireForm(emptyProprietaireForm);
    setScrollToComment(false);
  }

  // Update Propriétaire Form
  function handleProprietaireFormChange(event) {
    const { name, value } = event.target;

    setProprietaireForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // Refresh propriétaire
  async function refreshProprietaires() {
    try {
      const data = await getProprietaires();
      setProprietaires(data);
      return data;
    } catch (err) {
      onError?.(err.message);
      throw err;
    }
  }

  // Save Propriétaire Form
  async function handleProprietaireSubmit(event) {
    event.preventDefault();

    try {
      setSavingProprietaire(true);
      onError?.("");

      if (editingProprietaireId) {
        await updateProprietaire(editingProprietaireId, proprietaireForm);
      } else {
        await createProprietaire(proprietaireForm);
      }

      const proprietairesData = await getProprietaires();

      setProprietaires([...proprietairesData]);

      await refreshAnimaux();

      if (editingProprietaireId) {
        await onProprietaireUpdated?.();
      }

      setShowProprietaireForm(false);
      setEditingProprietaireId(null);
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

  // Save btn
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

  // Delete btn
  async function handleDelete() {
    if (!prestation?.ID_Prestation) {
      return;
    }

    const proprietaire = proprietaires.find(
      (item) =>
        String(item.ID_Proprietaire) === String(prestation.ID_Proprietaire),
    );

    const proprietaireName = proprietaire
      ? proprietaire.Etablissement
        ? `${proprietaire.Raison_sociale} ${proprietaire.Etablissement}`.trim()
        : `${proprietaire.Prenom_Proprietaire} ${proprietaire.Nom_Proprietaire}`.trim()
      : "ce propriétaire";

    const lieu = proprietaires.find(
      (item) => String(item.ID_Proprietaire) === String(prestation.ID_Lieu),
    );

    await confirm({
      title: "Supprimer cette prestation",

      message: `La prestation de ${proprietaireName}
        ${
          prestation.Date_Prestation
            ? `- Date : ${formatDateShort(prestation.Date_Prestation)}`
            : ""
        }
        ${
          lieu
            ? `- Lieu : ${
                lieu.Etablissement
                  ? `${lieu.Raison_sociale} ${lieu.Etablissement}`.trim()
                  : `${lieu.Prenom_Proprietaire} ${lieu.Nom_Proprietaire}`.trim()
              }`
            : ""
        }
        - Montant total : ${prestation.Montant_Prestation} €

        Va être définitivement supprimée.`,

      onConfirm: async () => {
        try {
          setDeleting(true);
          onError?.("");

          await deletePrestation(prestation.ID_Prestation);

          onDeleted?.(prestation.ID_Prestation);
        } catch (err) {
          console.error("Erreur lors de la suppression :", err);
          onError?.(err.message);
          throw err;
        } finally {
          setDeleting(false);
        }
      },
    });
  }

  // Changement détectés
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
              disabled={Boolean(prestation?.ID_Prestation)}
            >
              <option value="">Sélectionner</option>

              <ProprietaireOptions proprietaires={proprietaires} />
            </Select>

            <div className="absolute right-0 top-0 flex items-center gap-1">
              {/* Modifier le propriétaire */}
              {form.ID_Proprietaire &&
                (() => {
                  const proprietaire = proprietaires.find(
                    (item) =>
                      String(item.ID_Proprietaire) ===
                      String(form.ID_Proprietaire),
                  );

                  const hasComment = Boolean(
                    proprietaire?.Commentaire_Proprietaire?.trim(),
                  );

                  return (
                    <Button
                      type="button"
                      variant={hasComment ? "danger_clear" : "secondary"}
                      onClick={() => openEditProprietaireForm(hasComment)}
                      disabled={saving || !proprietaire}
                      title={
                        hasComment
                          ? "Voir le commentaire du propriétaire"
                          : "Modifier le propriétaire"
                      }
                      aria-label="Modifier le propriétaire"
                      className="!p-1"
                    >
                      {hasComment ? (
                        <AlertCircle size={16} />
                      ) : (
                        <Pencil size={16} />
                      )}
                    </Button>
                  );
                })()}

              {/* Ajouter un propriétaire */}
              <Button
                type="button"
                variant="secondary"
                onClick={openProprietaireForm}
                disabled={saving || Boolean(prestation?.ID_Prestation)}
                className="!p-1"
              >
                <Plus size={16} />
              </Button>
            </div>
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
              <div className="flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 text-sm text-blue-900 h-full py-2">
                Sélectionner d'abord un propriétaire
              </div>
            ) : !customLieu ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleLieuDifferent}
                disabled={saving}
                className="h-full py-2"
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

              {deplacements
                .filter(
                  (deplacement) =>
                    Number(deplacement.Annee_Deplacement) ===
                    new Date().getFullYear(),
                )
                .map((deplacement) => (
                  <option
                    key={deplacement.ID_Deplacement}
                    value={deplacement.ID_Deplacement}
                  >
                    {deplacement.Denomination_Deplacement}
                    {" ("}
                    {deplacement.Montant_Deplacement}
                    {" €) - "}
                    {deplacement.Annee_Deplacement}
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

        <div className="mt-6 flex flex-col sm:flex-row justify-center sm:justify-between gap-3">
          {/* DELETE btn */}
          {prestation?.ID_Prestation && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="order-2 md:order-1"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "Suppression..." : "Supprimer la prestation"}
            </Button>
          )}

          {/* SAVE */}

          <Button
            type="submit"
            disabled={
              saving ||
              deleting ||
              (Boolean(prestation?.ID_Prestation) && !hasChanges)
            }
            className="order-1 md:order-2"
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

      {ConfirmDialog}

      <ProprietairesModal
        open={showProprietaireForm}
        editingId={editingProprietaireId}
        allowDelete={false}
        form={proprietaireForm}
        proprietaires={proprietaires}
        animaux={animaux}
        saving={savingProprietaire}
        onClose={closeProprietaireForm}
        onSubmit={handleProprietaireSubmit}
        onChange={handleProprietaireFormChange}
        onDelete={() => {}}
        onAnimalsChange={refreshAnimaux}
        scrollToComment={scrollToComment}
      />
    </>
  );
}
