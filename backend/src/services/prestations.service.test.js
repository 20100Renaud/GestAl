import { describe, it, expect, vi } from "vitest";
import { recalculatePrestationAmount } from "./prestations.service.js";

describe("recalculatePrestationAmount", () => {
  it("calcule et enregistre le montant de la prestation", async () => {
    const prestation = {
      ID_Prestation: "prestation-1",
      Remise_Prestation: 10,
      Deplacement_Prestation: {
        Montant_Deplacement: 15,
      },
      Consultations_Prestation: [
        {
          Quantite_Consultation: 1,
          Tarif_Consultation: { Montant_Tarif: 50 },
        },
        {
          Quantite_Consultation: 2,
          Tarif_Consultation: { Montant_Tarif: 30 },
        },
      ],
    };

    const prismaClient = {
      t_Prestations: {
        findUnique: vi.fn().mockResolvedValue(prestation),
        update: vi.fn().mockResolvedValue({
          ...prestation,
          Montant_Prestation: 115,
        }),
      },
    };

    const result = await recalculatePrestationAmount(
      "prestation-1",
      prismaClient,
    );

    expect(prismaClient.t_Prestations.findUnique).toHaveBeenCalledWith({
      where: { ID_Prestation: "prestation-1" },
      include: {
        Deplacement_Prestation: true,
        Consultations_Prestation: {
          include: { Tarif_Consultation: true },
        },
      },
    });

    expect(prismaClient.t_Prestations.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ID_Prestation: "prestation-1" },
        data: { Montant_Prestation: 115 },
      }),
    );

    expect(result.Montant_Prestation).toBe(115);
  });

  it("signale une prestation inexistante", async () => {
    const prismaClient = {
      t_Prestations: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
    };

    await expect(
      recalculatePrestationAmount("inconnu", prismaClient),
    ).rejects.toThrow("Prestation non trouvée");

    expect(prismaClient.t_Prestations.update).not.toHaveBeenCalled();
  });

  it("ne produit pas de montant négatif", async () => {
    const prestation = {
      Remise_Prestation: 100,
      Deplacement_Prestation: {
        Montant_Deplacement: 15,
      },
      Consultations_Prestation: [
        {
          Quantite_Consultation: 1,
          Tarif_Consultation: { Montant_Tarif: 50 },
        },
      ],
    };

    const prismaClient = {
      t_Prestations: {
        findUnique: vi.fn().mockResolvedValue(prestation),
        update: vi.fn().mockResolvedValue({
          Montant_Prestation: 0,
        }),
      },
    };

    await recalculatePrestationAmount("prestation-1", prismaClient);

    expect(prismaClient.t_Prestations.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { Montant_Prestation: 0 },
      }),
    );
  });

  it("calcule le montant avec le déplacement seul", async () => {
    const prestation = {
      Remise_Prestation: 5,
      Deplacement_Prestation: {
        Montant_Deplacement: 15,
      },
      Consultations_Prestation: [],
    };

    const prismaClient = {
      t_Prestations: {
        findUnique: vi.fn().mockResolvedValue(prestation),
        update: vi.fn().mockResolvedValue({
          Montant_Prestation: 10,
        }),
      },
    };

    await recalculatePrestationAmount("prestation-1", prismaClient);

    expect(prismaClient.t_Prestations.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { Montant_Prestation: 10 },
      }),
    );
  });
});
