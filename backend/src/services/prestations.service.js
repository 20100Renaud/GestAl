import prisma from "../lib/prisma.js";

export async function recalculatePrestationAmount(
  prestationId,
  prismaClient = prisma,
) {
  const prestation = await prismaClient.t_Prestations.findUnique({
    where: {
      ID_Prestation: prestationId,
    },
    include: {
      Deplacement_Prestation: true,

      Consultations_Prestation: {
        include: {
          Tarif_Consultation: true,
        },
      },
    },
  });

  if (!prestation) {
    throw new Error("Prestation non trouvée");
  }

  const montantDeplacement = Number(
    prestation.Deplacement_Prestation.Montant_Deplacement,
  );

  const montantConsultations = prestation.Consultations_Prestation.reduce(
    (total, consultation) => {
      const montantTarif = Number(
        consultation.Tarif_Consultation.Montant_Tarif,
      );

      const quantite = Number(consultation.Quantite_Consultation);

      return total + montantTarif * quantite;
    },
    0,
  );

  const remise = Number(prestation.Remise_Prestation);

  const montantPrestation = montantDeplacement + montantConsultations - remise;

  const montantFinal = Math.max(0, montantPrestation);

  return prismaClient.t_Prestations.update({
    where: {
      ID_Prestation: prestationId,
    },

    data: {
      Montant_Prestation: montantFinal,
    },

    include: {
      Deplacement_Prestation: true,
      Consultations_Prestation: {
        include: {
          Animal_Consultation: true,
          Tarif_Consultation: true,
          Zonages_Consultation: {
            include: {
              Zonage: true,
            },
          },
        },
      },
      Paiements_Prestation: true,
      Proprietaire_Prestation: true,
      Lieu_Prestation: true,
    },
  });
}
