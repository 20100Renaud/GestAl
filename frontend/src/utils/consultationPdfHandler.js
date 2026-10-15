import { openConsultationPdf } from "./generateConsultationPdf.js";

export function createConsultationPdfHandler({
  consultations,
  animaux,
  tarifs,
  zonagesByConsultation,
  prestations,
  proprietaires,
  currentUser,
  onError,
}) {
  return function handleOpenPdf(mode = "preview", consultationId) {
    try {
      if (!consultationId) {
        onError?.(
          "Enregistrez la consultation avant de générer son compte rendu.",
        );
        return;
      }

      const consultation = consultations.find(
        (item) => String(item.ID_Consultation) === String(consultationId),
      );

      if (!consultation) {
        onError?.("Consultation introuvable.");
        return;
      }

      const prestation =
        consultation.Prestation_Consultation ??
        prestations.find(
          (item) =>
            String(item.ID_Prestation) === String(consultation.ID_Prestation),
        );

      if (!prestation) {
        onError?.("Prestation introuvable.");
        return;
      }

      const animal =
        consultation.Animal_Consultation ??
        animaux.find(
          (item) => String(item.ID_Animal) === String(consultation.ID_Animal),
        );

      const tarif =
        consultation.Tarif_Consultation ??
        tarifs.find(
          (item) => String(item.ID_Tarif) === String(consultation.ID_Tarif),
        );

      const proprietaire =
        prestation.Proprietaire_Prestation ??
        proprietaires.find(
          (item) =>
            String(item.ID_Proprietaire) === String(prestation.ID_Proprietaire),
        ) ??
        null;

      const lieu =
        proprietaires.find(
          (item) => String(item.ID_Proprietaire) === String(prestation.ID_Lieu),
        ) ?? null;

      const zonages =
        zonagesByConsultation?.[consultation.ID_Consultation] ?? [];

      openConsultationPdf({
        user: currentUser,
        prestation,
        consultation,
        animal,
        tarif,
        proprietaire,
        lieu,
        zonages,
        mode,
      });
    } catch (err) {
      onError?.(err.message);
    }
  };
}
