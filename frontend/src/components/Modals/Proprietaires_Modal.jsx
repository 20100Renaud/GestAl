import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateAnimal, deleteAnimal } from "../../api/animaux.js";
import AnimauxModal from "./Animaux_Modal.jsx";
import { getConsultations } from "../../api/consultations.js";
import { calculateAge } from "../../utils/calculateAge";
import { getPrestations } from "../../api/prestations.js";
import { getTarifs } from "../../api/tarifs.js";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
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
} from "lucide-react";

export default function ProprietairesModal({
  open,
  editingId,
  form,
  proprietaires = [],
  animaux = [],
  saving,
  onClose,
  onSubmit,
  onChange,
  onDelete,
}) {
  const navigate = useNavigate();
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [savingAnimal, setSavingAnimal] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [prestations, setPrestations] = useState([]);
  const [tarifs, setTarifs] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [savingConsultation, setSavingConsultation] = useState(false);

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
    const [consultationsData, prestationsData, tarifsData] = await Promise.all([
      getConsultations(),
      getPrestations(),
      getTarifs(),
    ]);

    setConsultations(consultationsData);
    setPrestations(prestationsData);
    setTarifs(tarifsData);
  }

  async function handleOpenAnimal(animal) {
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

    try {
      await loadConsultationData();
      setShowAnimalModal(true);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAnimalSubmit(event) {
    event.preventDefault();

    if (!selectedAnimal?.ID_Animal) return;

    try {
      setSavingAnimal(true);

      await updateAnimal(selectedAnimal.ID_Animal, animalForm);

      setShowAnimalModal(false);
      setSelectedAnimal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAnimal(false);
    }
  }

  async function handleAnimalDelete(id) {
    if (!window.confirm("Supprimer cet animal ?")) return;

    try {
      setSavingAnimal(true);

      await deleteAnimal(id);

      setShowAnimalModal(false);
      setSelectedAnimal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAnimal(false);
    }
  }

  function getConsultationCount() {
    if (!editingId) return 0;

    return consultations.filter((consultation) => {
      const proprietaire =
        consultation.Prestation_Consultation?.Proprietaire_Prestation;

      return String(proprietaire?.ID_Proprietaire) === String(editingId);
    }).length;
  }

  function handleOpenConsultations() {
    const proprietaireName = form.etablissement?.trim()
      ? `${form.raisonSociale ?? ""} ${form.etablissement}`.trim()
      : `${form.prenom ?? ""} ${form.nom ?? ""}`.trim();

    navigate(
      `/dashboard/consultations?search=${encodeURIComponent(proprietaireName)}`,
    );
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
        <form onSubmit={onSubmit} className="p-6">
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
              <h3 className="text-sm font-semibold text-blue-700">
                {animauxProprietaire.length === 0
                  ? "Aucun animal associé à ce propriétaire."
                  : `${animauxProprietaire.length} ${
                      animauxProprietaire.length > 1 ? "animaux" : "animal"
                    }`}
              </h3>

              {animauxProprietaire.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                  {animauxProprietaire.map((animal) => (
                    <button
                      key={animal.ID_Animal}
                      type="button"
                      onClick={() => handleOpenAnimal(animal)}
                      className="cursor-pointer rounded-full border border-blue-200 bg-white px-3 py-1 text-sm text-blue-800 hover:bg-blue-100"
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
                  ? "Aucune consultation associée à ce propriétaire."
                  : `${getConsultationCount()} consultation${
                      getConsultationCount() > 1 ? "s" : ""
                    }`}
              </h3>

              {getConsultationCount() > 0 && (
                <div className="flex flex-1 flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenConsultations}
                    className="cursor-pointer rounded-full border border-blue-200 bg-white px-3 py-1 text-sm text-blue-800 hover:bg-blue-100"
                  >
                    Voir les consultations
                  </button>
                </div>
              )}
            </div>
          )}

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
          setSelectedConsultation(consultation);
          setShowConsultationModal(true);
        }}
      />
    </>
  );
}
