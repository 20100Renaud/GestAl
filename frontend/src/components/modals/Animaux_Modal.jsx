import { useEffect, useState } from "react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Textarea from "../ui/Textarea.jsx";
import Modal from "../ui/Modal.jsx";
import {
  getProprietaireLabel,
  ProprietaireOptions,
} from "../options/ProprietaireOptions.jsx";
import {
  PawPrint,
  UserRound,
  CalendarDays,
  Ghost,
  VenusAndMars,
  Cat,
  ClipboardPen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AnimauxModal({
  open,
  editingId,
  form,
  proprietaires,
  consultations = [],
  saving,
  onClose,
  onSubmit,
  onChange,
  onDelete,
  onOpenConsultation,
}) {
  const [visibleConsultations, setVisibleConsultations] = useState(3);

  useEffect(() => {
    setVisibleConsultations(3);
  }, [editingId, open]);
  
  const consultationsAnimal = consultations
    .filter(
      (consultation) => String(consultation.ID_Animal) === String(editingId),
    )
    .sort((a, b) => {
      const dateA = new Date(
        a.Prestation_Consultation?.Date_Prestation ?? 0,
      ).getTime();

      const dateB = new Date(
        b.Prestation_Consultation?.Date_Prestation ?? 0,
      ).getTime();

      return dateB - dateA;
    });

  const displayedConsultations = consultationsAnimal.slice(
    0,
    visibleConsultations,
  );

  const hasMoreConsultations =
    visibleConsultations < consultationsAnimal.length;

  return (
    <Modal
      open={open}
      title={editingId ? `Modifier ${form.Nom_Animal}` : `Ajouter un animal`}
      onClose={onClose}
    >
      {proprietaires.length === 0 ? (
        <div className="p-6">
          <p className="text-blue-900">
            Un propriétaire doit exister avant de pouvoir créer un animal.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              id="Proprietaire"
              label="Propriétaire"
              icon={UserRound}
              name="ID_Proprietaire"
              value={form.ID_Proprietaire}
              onChange={onChange}
              disabled={Boolean(editingId)}
              required
            >
              <option value="">Sélectionner</option>
              <ProprietaireOptions proprietaires={proprietaires} />
            </Select>

            <Input
              id="Nom_Animal"
              label="Nom"
              icon={PawPrint}
              type="text"
              name="Nom_Animal"
              value={form.Nom_Animal}
              onChange={onChange}
              required
            />

            <Select
              id="Genre_Animal"
              label="Genre"
              icon={Cat}
              name="Genre_Animal"
              value={form.Genre_Animal}
              onChange={onChange}
              required
            >
              <option value="">Sélectionner</option>
              <option value="Chien">Chien</option>
              <option value="Chat">Chat</option>
              <option value="Cheval">Cheval</option>
              <option value="Mouton">Mouton</option>
              <option value="Chèvre">Chèvre</option>
              <option value="Oiseaux">Oiseaux</option>
              <option value="NAC">NAC</option>
              <option value="Autre">Autre</option>
            </Select>

            <Input
              id="Race_Animal"
              label="Race"
              icon={Ghost}
              type="text"
              name="Race_Animal"
              value={form.Race_Animal}
              onChange={onChange}
            />

            <Input
              id="Date_Naissance_Animal"
              label="Date de naissance"
              icon={CalendarDays}
              type="date"
              name="Date_Naissance_Animal"
              value={form.Date_Naissance_Animal}
              onChange={onChange}
              required
            />

            <Select
              id="Sexe_Animal"
              label="Sexe"
              icon={VenusAndMars}
              name="Sexe_Animal"
              value={form.Sexe_Animal}
              onChange={onChange}
              required
            >
              <option value="">Sélectionner</option>
              <option value="Mâle">Mâle</option>
              <option value="Femelle">Femelle</option>
            </Select>

            <div className="md:col-span-2">
              <Textarea
                label="Notes"
                icon={ClipboardPen}
                name="Memo_Animal"
                value={form.Memo_Animal}
                onChange={onChange}
                rows="4"
              />
            </div>
          </div>

          {/* Animal's consultations */}
          {editingId && (
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-3">
              <div className="flex text-sm font-semibold text-blue-700 justify-between">
                <h3 className="">
                  {consultationsAnimal.length === 0
                    ? "Aucune consultation associée à cet animal."
                    : "Dernières consultations"}
                </h3>

                {/* Show more / collapse button */}
                {consultationsAnimal.length > 3 && (
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleConsultations((current) =>
                        current >= consultationsAnimal.length
                          ? 3
                          : Math.min(current + 3, consultationsAnimal.length),
                      )
                    }
                    className="flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 text-blue-700 transition hover:bg-blue-100 cursor-pointer"
                    title={
                      visibleConsultations >= consultationsAnimal.length
                        ? "Réduire la liste"
                        : "Afficher les consultations suivantes"
                    }
                    aria-label={
                      visibleConsultations >= consultationsAnimal.length
                        ? "Réduire la liste"
                        : "Afficher les consultations suivantes"
                    }
                  >
                    {visibleConsultations >= consultationsAnimal.length ? (
                      <>
                        <span>Moins</span>
                        <ChevronUp size={18} />
                      </>
                    ) : (
                      <>
                        <span>Plus</span>
                        <ChevronDown size={18} />
                      </>
                    )}
                  </button>
                )}
              </div>

              {consultationsAnimal.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-1 md:gap-2">
                  {displayedConsultations.map((consultation) => {
                    const prestation = consultation.Prestation_Consultation;
                    const proprietaire = prestation?.Proprietaire_Prestation;

                    return (
                      <button
                        key={consultation.ID_Consultation}
                        type="button"
                        onClick={() => onOpenConsultation?.(consultation)}
                        className={`flex flex-col gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-left text-sm text-blue-800 transition w-32 ${
                          onOpenConsultation
                            ? "cursor-pointer hover:bg-blue-100"
                            : "cursor-default"
                        }`}
                      >
                        {/* Date */}
                        <span className="flex items-center gap-2">
                          <CalendarDays size={15} className="shrink-0" />
                          {prestation?.Date_Prestation
                            ? new Date(
                                prestation.Date_Prestation,
                              ).toLocaleDateString("fr-FR")
                            : "-"}
                        </span>

                        {/* Lieu */}
                        <span className="flex min-w-0 items-center gap-2">
                          <UserRound size={15} className="shrink-0" />

                          <span className="truncate">
                            {prestation?.ID_Lieu === prestation?.ID_Proprietaire
                              ? "À domicile"
                              : prestation?.Lieu_Prestation
                                ? getProprietaireLabel(
                                    prestation.Lieu_Prestation,
                                  )
                                : "Lieu inconnu"}
                          </span>
                        </span>

                        {/* Motif */}
                        <span className="font-medium truncate">
                          {consultation.Motif_Consultation ||
                            `Consultation #${consultation.ID_Consultation}`}
                        </span>
                      </button>
                    );
                  })}
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
      )}
    </Modal>
  );
}
