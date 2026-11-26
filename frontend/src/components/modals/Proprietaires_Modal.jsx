import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAnimal, updateAnimal, deleteAnimal } from "../../api/animaux.js";
import useConfirm from "../../hooks/useConfirm.jsx";
import AnimauxModal from "./Animaux_Modal.jsx";
import { getConsultations } from "../../api/consultations.js";
import { calculateAge } from "../../utils/calculateAge";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Textarea from "../ui/Textarea.jsx";
import Modal from "../ui/Modal.jsx";
import {
  Warehouse,
  BuildingComplex,
  UserRound,
  UserRoundGroup,
  Mail,
  User,
  MapPin,
  MapPinned,
  Hash,
  Phone,
  AlertCircle,
} from "lucide-react";

export default function ProprietairesModal({
  open,
  editingId,
  allowDelete = true,
  form,
  proprietaires = [],
  animaux = [],
  saving,
  onClose,
  onSubmit,
  onChange,
  onDelete,
  onAnimalsChange,
  scrollToComment = false,
}) {
  const navigate = useNavigate();
  const formBottomRef = useRef(null);
  const { confirm, ConfirmDialog } = useConfirm();

  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [savingAnimal, setSavingAnimal] = useState(false);
  const [animalError, setAnimalError] = useState("");
  const [consultations, setConsultations] = useState([]);

  const onRaisonChange = (event) => {
    const { name, value } = event.target;

    onChange(event);
    if (name === "raisonSociale" && value === "Particulier") {
      onChange({
        target: {
          name: "etablissement",
          value: "",
        },
      });
    }
  };

  useEffect(() => {
    if (!open || !scrollToComment) return;

    requestAnimationFrame(() => {
      formBottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });

    return;
  }, [open, scrollToComment]);

  const animauxProprietaire = animaux.filter(
    (animal) => String(animal.ID_Proprietaire) === String(editingId),
  );

  const emptyAnimalForm = {
    ID_Proprietaire: "",
    Nom_Animal: "",
    Genre_Animal: "",
    Race_Animal: "",
    Date_Naissance_Animal: "",
    Sexe_Animal: "",
    Memo_Animal: "",
  };

  const [animalForm, setAnimalForm] = useState(emptyAnimalForm);

  useEffect(() => {
    if (!open || !editingId) return;

    getConsultations()
      .then(setConsultations)
      .catch((err) => {
        console.error("Erreur chargement consultations :", err);
      });
  }, [open, editingId]);

  async function loadConsultationData() {
    const consultationsData = await getConsultations();

    setConsultations(consultationsData);
  }

  async function handleOpenAnimal(animal) {
    setAnimalError("");
    setSelectedAnimal(animal);

    setAnimalForm({
      ID_Proprietaire: String(animal.ID_Proprietaire ?? ""),
      Nom_Animal: animal.Nom_Animal ?? "",
      Genre_Animal: animal.Genre_Animal ?? "",
      Race_Animal: animal.Race_Animal ?? "",
      Date_Naissance_Animal: animal.Date_Naissance_Animal?.slice(0, 10) ?? "",
      Sexe_Animal: animal.Sexe_Animal ?? "",
      Memo_Animal: animal.Memo_Animal ?? "",
    });

    setAnimalError("");

    try {
      await loadConsultationData();
      setShowAnimalModal(true);
    } catch (err) {
      setAnimalError(err.message);
    }
  }

  function handleAddAnimal() {
    setAnimalError("");
    setSelectedAnimal(null);

    setAnimalForm({
      ...emptyAnimalForm,
      ID_Proprietaire: editingId,
    });

    setShowAnimalModal(true);
  }

  async function handleAnimalSubmit(event) {
    event.preventDefault();

    try {
      setSavingAnimal(true);

      if (selectedAnimal?.ID_Animal) {
        await updateAnimal(selectedAnimal.ID_Animal, animalForm);
      } else {
        await createAnimal(animalForm);
      }

      await onAnimalsChange?.();

      setShowAnimalModal(false);
      setSelectedAnimal(null);
      setAnimalForm(emptyAnimalForm);
    } catch (err) {
      console.error("Erreur enregistrement animal :", err);
      setAnimalError(err.message);
    } finally {
      setSavingAnimal(false);
    }
  }

  async function handleAnimalDelete(id) {
    const animal = animaux.find(
      (item) => String(item.ID_Animal) === String(id),
    );

    if (!animal) return;

    const consultationCount = consultations.filter(
      (consultation) => String(consultation.ID_Animal) === String(id),
    ).length;

    const proprietaireName = form.etablissement?.trim()
      ? `${form.raisonSociale ?? ""} ${form.etablissement}`.trim()
      : `${form.prenom ?? ""} ${form.nom ?? ""}`.trim();

    await confirm({
      title: "Supprimer cet animal",

      message: [
        `${animal.Nom_Animal} (${animal.Genre_Animal || "-"}) appartenant à ${proprietaireName} va être définitivement supprimé.`,
        "",
        consultationCount === 0
          ? "Aucune consultation n'est associée à cet animal."
          : consultationCount === 1
            ? "Attention : 1 consultation associée sera également supprimée."
            : `Attention : ${consultationCount} consultations associées seront également supprimées.`,
      ].join("\n"),

      onConfirm: async () => {
        try {
          setSavingAnimal(true);
          setAnimalError("");

          await deleteAnimal(id);

          await onAnimalsChange?.();

          setShowAnimalModal(false);
          setSelectedAnimal(null);
          setAnimalForm(emptyAnimalForm);
        } catch (err) {
          setAnimalError(err.message);
          throw err;
        } finally {
          setSavingAnimal(false);
        }
      },
    });
  }

  function getConsultationCount() {
    if (!editingId) return 0;

    return consultations.filter((consultation) => {
      const proprietaire =
        consultation.Prestation_Consultation?.Proprietaire_Prestation;

      return String(proprietaire?.ID_Proprietaire) === String(editingId);
    }).length;
  }

  function getLieuPrestationCount() {
    if (!editingId) return 0;

    const prestationsIds = new Set(
      consultations
        .filter((consultation) => {
          const lieu = consultation.Prestation_Consultation?.Lieu_Prestation;

          return String(lieu?.ID_Proprietaire) === String(editingId);
        })
        .map(
          (consultation) =>
            consultation.ID_Prestation ??
            consultation.Prestation_Consultation?.ID_Prestation,
        )
        .filter(Boolean),
    );

    return prestationsIds.size;
  }

  function handleOpenConsultations() {
    const proprietaireName = form.etablissement?.trim()
      ? `${form.raisonSociale ?? ""} ${form.etablissement}`.trim()
      : `${form.prenom ?? ""} ${form.nom ?? ""}`.trim();

    navigate(`/consultations?search=${encodeURIComponent(proprietaireName)}`);
  }

  function handleOpenLieuPrestations() {
    let lieuName = "";

    if (form.raisonSociale !== "Particulier") {
      lieuName = `${form.raisonSociale ?? ""} ${
        form.etablissement ?? ""
      }`.trim();
    } else {
      lieuName = `${form.prenom ?? ""} ${form.nom ?? ""}`.trim();
    }

    navigate(`/consultations?search=${encodeURIComponent(lieuName)}`);
  }
  return (
    <>
      <Modal
        open={open}
        title={
          editingId ? "Modifier le propriétaire" : "Ajouter un propriétaire"
        }
        onClose={onClose}
      >
        <form ref={formBottomRef} onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              id="raisonSociale"
              label="Raison sociale"
              icon={BuildingComplex}
              name="raisonSociale"
              value={form.raisonSociale}
              onChange={onRaisonChange}
              required
            >
              <option value="Particulier">Particulier</option>
              <option value="Ecurie">Ecurie</option>
              <option value="Asso">Association</option>
            </Select>

            <Input
              id="etablissement"
              label="Établissement"
              icon={Warehouse}
              type="text"
              name="etablissement"
              value={form.etablissement}
              onChange={onChange}
              disabled={form.raisonSociale === "Particulier"}
            />

            <Select
              id="civilite"
              label="Civilité"
              icon={UserRoundGroup}
              name="civilite"
              value={form.civilite}
              onChange={onChange}
            >
              <option value="">Sélectionner</option>
              <option value="M.">M.</option>
              <option value="Mme.">Mme.</option>
            </Select>

            <Input
              id="nom"
              label="Nom"
              icon={UserRound}
              type="text"
              name="nom"
              value={form.nom}
              onChange={onChange}
              className="uppercase"
              required
            />

            <Input
              id="prenom"
              label="Prénom"
              icon={User}
              type="text"
              name="prenom"
              value={form.prenom}
              onChange={onChange}
              className="capitalize"
              required
            />

            <Input
              id="email"
              label="Email"
              icon={Mail}
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className="lowercase"
              required
            />

            <Input
              id="adresse"
              label="Adresse"
              icon={MapPin}
              type="text"
              name="adresse"
              value={form.adresse}
              onChange={onChange}
              required
            />

            <Input
              id="ville"
              label="Ville"
              icon={MapPinned}
              type="text"
              name="ville"
              value={form.ville}
              onChange={onChange}
              className="capitalize"
              required
            />

            <Input
              id="cp"
              label="Code postal"
              icon={Hash}
              type="text"
              name="cp"
              value={form.cp}
              onChange={onChange}
              required
            />

            <Input
              id="tel"
              label="Téléphone"
              icon={Phone}
              type="tel"
              name="tel"
              value={form.tel}
              onChange={onChange}
              required
            />
          </div>

          {/* Owner's animals */}
          {editingId && (
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-blue-700">
                  {animauxProprietaire.length === 0
                    ? "Aucun animal associé."
                    : `${animauxProprietaire.length} ${
                        animauxProprietaire.length > 1 ? "animaux" : "animal"
                      }`}
                </h3>

                <Button onClick={handleAddAnimal}>
                  + Ajouter un animal
                </Button>
              </div>

              {animauxProprietaire.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {animauxProprietaire.map((animal) => (
                    <button
                      key={animal.ID_Animal}
                      type="button"
                      onClick={() => handleOpenAnimal(animal)}
                      className="cursor-pointer rounded-full border border-blue-200 bg-white px-3 py-2 text-sm text-blue-800 hover:bg-blue-100"
                    >
                      {`${animal.Nom_Animal} - ${animal.Genre_Animal} ${
                        animal.Sexe_Animal ?? ""
                      } de ${calculateAge(animal.Date_Naissance_Animal)}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Owner's consultations */}
          {editingId && (
            <div className="flex items-center justify-between mt-6 rounded-xl border border-blue-200 bg-blue-50 p-3">
              <h3 className="text-sm font-semibold text-blue-700">
                {getConsultationCount() === 0
                  ? "Aucune consultation associée."
                  : `${getConsultationCount()} consultation${
                      getConsultationCount() > 1 ? "s" : ""
                    }`}
              </h3>

              {getConsultationCount() > 0 && (
                <div className="flex flex-1 flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenConsultations}
                    className="cursor-pointer rounded-full border border-blue-200 bg-white px-3 text-sm text-blue-800 hover:bg-blue-100"
                  >
                    Voir les consultations
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Lieux de prestation */}
          {editingId && (
            <div className="flex items-center justify-between mt-6 rounded-xl border border-blue-200 bg-blue-50 p-3">
              <h3 className="text-sm font-semibold text-blue-700">
                {getLieuPrestationCount() === 0
                  ? "Aucune prestation réalisée à ce lieu."
                  : `${getLieuPrestationCount()} prestation${
                      getLieuPrestationCount() > 1 ? "s" : ""
                    }`}
              </h3>

              {getLieuPrestationCount() > 0 && (
                <div className="flex flex-1 flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenLieuPrestations}
                    className="cursor-pointer rounded-full border border-blue-200 bg-white px-3 text-sm text-blue-800 hover:bg-blue-100"
                  >
                    Voir les prestations
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Commentaire perso */}
          <div className="mt-5">
            <Textarea
              id="commentaire"
              icon={AlertCircle}
              label="Notes personnelles"
              name="commentaire"
              value={form.commentaire}
              onChange={onChange}
              placeholder="ex. Préfère les rendez-vous le matin."
              rows={4}
              iconClassName={
                form.commentaire?.trim() ? "text-red-600" : "text-blue-700"
              }
              className="placeholder:text-gray-400"
            />
          </div>

          {/* Btns */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <div>
              {editingId && allowDelete && (
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

      {showAnimalModal && animalError && (
        <div className="fixed bottom-4 right-4 z-[100] max-w-md rounded-lg border border-red-200 bg-white p-4 text-sm text-red-700 shadow-lg">
          {animalError}
        </div>
      )}

      <AnimauxModal
        open={showAnimalModal}
        editingId={selectedAnimal?.ID_Animal ?? null}
        form={animalForm}
        proprietaires={proprietaires}
        consultations={consultations}
        saving={savingAnimal}
        onClose={() => {
          setShowAnimalModal(false);
          setSelectedAnimal(null);
          setAnimalError("");
        }}
        onChange={(event) => {
          const { name, value } = event.target;

          setAnimalForm((current) => ({
            ...current,
            [name]: value,
          }));
        }}
        onSubmit={handleAnimalSubmit}
        onDelete={handleAnimalDelete}
        onOpenConsultation={(consultation) => {
          const prestation = consultation.Prestation_Consultation;

          navigate("/consultations", {
            state: {
              openConsultationId: consultation.ID_Consultation,
            },
          });
        }}
      />

      {ConfirmDialog}
    </>
  );
}
