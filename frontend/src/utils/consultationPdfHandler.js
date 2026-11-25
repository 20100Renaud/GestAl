import { generateConsultationPdf } from "./generateConsultationPdf.js";
import { updateConsultation } from "../api/consultations.js";

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
  return async function handleOpenPdf(mode = "preview", consultationId) {
    try {
      if (!consultationId) {
        onError?.(
          "Enregistrez la consultation avant de générer son compte rendu.",
        );
        return;
      }

      const consultation = consultations.find(
        (item) =>
          String(item.ID_Consultation) ===
          String(consultationId),
      );

      if (!consultation) {
        onError?.("Consultation introuvable.");
        return;
      }

      // Date d'édition
      const dateEdition = new Date().toISOString();

      const updatedConsultation = await updateConsultation(consultationId, {
        Date_Edition_Consultation: dateEdition,
      });

      const consultationForPdf = {
        ...consultation,
        ...updatedConsultation,
        Date_Edition_Consultation: dateEdition,
      };

      const prestation =
        consultationForPdf.Prestation_Consultation ??
        prestations.find(
          (item) =>
            String(item.ID_Prestation) ===
            String(consultationForPdf.ID_Prestation),
        );

      if (!prestation) {
        onError?.("Prestation introuvable.");
        return;
      }

      const animal =
        consultationForPdf.Animal_Consultation ??
        animaux.find(
          (item) =>
            String(item.ID_Animal) === String(consultationForPdf.ID_Animal),
        );

      const tarif =
        consultationForPdf.Tarif_Consultation ??
        tarifs.find(
          (item) =>
            String(item.ID_Tarif) === String(consultationForPdf.ID_Tarif),
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

      await generateConsultationPdf({
        user: currentUser,
        prestation,
        consultation: consultationForPdf,
        animal,
        tarif,
        proprietaire,
        lieu,
        zonages,
        mode,
      });
    } catch (err) {
      console.error("Erreur génération PDF :", err);
      onError?.(err.message || "Erreur lors de la génération du PDF.");
    }
  };
}
