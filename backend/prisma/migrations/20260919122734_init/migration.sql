-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'ADMIN');

-- CreateTable
CREATE TABLE "T_Users" (
    "ID_User" TEXT NOT NULL,
    "Role_User" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "Pratique" TEXT,
    "Civilite_User" TEXT,
    "Nom_User" TEXT NOT NULL,
    "Prenom_User" TEXT NOT NULL,
    "Email_User" TEXT NOT NULL,
    "Password_Hash_User" TEXT NOT NULL,
    "Date_User" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Adresse_User" TEXT,
    "Ville_User" TEXT,
    "CP_User" TEXT,
    "Tel_User" TEXT,

    CONSTRAINT "T_Users_pkey" PRIMARY KEY ("ID_User")
);

-- CreateTable
CREATE TABLE "T_Proprietaires" (
    "ID_Proprietaire" TEXT NOT NULL,
    "ID_User" TEXT NOT NULL,
    "Date_User" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Raison_sociale" TEXT,
    "Etablissement" TEXT,
    "Civilite_Proprietaire" TEXT,
    "Nom_Proprietaire" TEXT NOT NULL,
    "Prenom_Proprietaire" TEXT NOT NULL,
    "Email_Proprietaire" TEXT NOT NULL,
    "Adresse_Proprietaire" TEXT NOT NULL,
    "Ville_Proprietaire" TEXT NOT NULL,
    "CP_Proprietaire" TEXT NOT NULL,
    "Tel_Proprietaire" TEXT NOT NULL,

    CONSTRAINT "T_Proprietaires_pkey" PRIMARY KEY ("ID_Proprietaire")
);

-- CreateTable
CREATE TABLE "T_Animaux" (
    "ID_Animal" TEXT NOT NULL,
    "ID_Proprietaire" TEXT NOT NULL,
    "Nom_Animal" TEXT NOT NULL,
    "Genre_Animal" TEXT NOT NULL,
    "Race_Animal" TEXT,
    "Date_Naissance_Animal" TIMESTAMP(3) NOT NULL,
    "Memo_Animal" TEXT,
    "Sexe_Animal" TEXT NOT NULL,

    CONSTRAINT "T_Animaux_pkey" PRIMARY KEY ("ID_Animal")
);

-- CreateTable
CREATE TABLE "T_Consultations" (
    "ID_Consultation" TEXT NOT NULL,
    "ID_Lieu" TEXT NOT NULL,
    "ID_Animal" TEXT NOT NULL,
    "Date_Consultation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Quantite_Consultation" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "Motif_Consultation" TEXT NOT NULL,
    "Description_Consultation" TEXT NOT NULL,
    "Commentaire_Consultation" TEXT,

    CONSTRAINT "T_Consultations_pkey" PRIMARY KEY ("ID_Consultation")
);

-- CreateTable
CREATE TABLE "T_Zonages" (
    "ID_Zonage" TEXT NOT NULL,
    "ID_Consultation" TEXT NOT NULL,
    "Nom_Zonage" TEXT NOT NULL,
    "Position_Zonage" TEXT,
    "Orientation_Zonage" TEXT,
    "Commentaire_Zonage" TEXT,

    CONSTRAINT "T_Zonages_pkey" PRIMARY KEY ("ID_Zonage")
);

-- CreateTable
CREATE TABLE "T_Paiements" (
    "ID_Paiement" TEXT NOT NULL,
    "ID_Consultation" TEXT NOT NULL,
    "ID_Tarif" TEXT NOT NULL,
    "ID_Deplacement" TEXT NOT NULL,
    "Date_Paiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Montant_Paiement" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "Remise_Paiement" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "Moyen_Paiement" TEXT,
    "Selection_Paiement" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "T_Paiements_pkey" PRIMARY KEY ("ID_Paiement")
);

-- CreateTable
CREATE TABLE "T_Tarifs" (
    "ID_Tarif" TEXT NOT NULL,
    "Annee_Tarif" TEXT NOT NULL,
    "Denomination_Tarif" TEXT NOT NULL,
    "Montant_Tarif" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "T_Tarifs_pkey" PRIMARY KEY ("ID_Tarif")
);

-- CreateTable
CREATE TABLE "T_Deplacements" (
    "ID_Deplacement" TEXT NOT NULL,
    "Annee_Deplacement" TEXT NOT NULL,
    "Denomination_Deplacement" TEXT NOT NULL,
    "Montant_Deplacement" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "T_Deplacements_pkey" PRIMARY KEY ("ID_Deplacement")
);

-- CreateIndex
CREATE UNIQUE INDEX "T_Users_Email_User_key" ON "T_Users"("Email_User");

-- AddForeignKey
ALTER TABLE "T_Proprietaires" ADD CONSTRAINT "T_Proprietaires_ID_User_fkey" FOREIGN KEY ("ID_User") REFERENCES "T_Users"("ID_User") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "T_Animaux" ADD CONSTRAINT "T_Animaux_ID_Proprietaire_fkey" FOREIGN KEY ("ID_Proprietaire") REFERENCES "T_Proprietaires"("ID_Proprietaire") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "T_Consultations" ADD CONSTRAINT "T_Consultations_ID_Animal_fkey" FOREIGN KEY ("ID_Animal") REFERENCES "T_Animaux"("ID_Animal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "T_Consultations" ADD CONSTRAINT "T_Consultations_ID_Lieu_fkey" FOREIGN KEY ("ID_Lieu") REFERENCES "T_Proprietaires"("ID_Proprietaire") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "T_Zonages" ADD CONSTRAINT "T_Zonages_ID_Consultation_fkey" FOREIGN KEY ("ID_Consultation") REFERENCES "T_Consultations"("ID_Consultation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "T_Paiements" ADD CONSTRAINT "T_Paiements_ID_Consultation_fkey" FOREIGN KEY ("ID_Consultation") REFERENCES "T_Consultations"("ID_Consultation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "T_Paiements" ADD CONSTRAINT "T_Paiements_ID_Tarif_fkey" FOREIGN KEY ("ID_Tarif") REFERENCES "T_Tarifs"("ID_Tarif") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "T_Paiements" ADD CONSTRAINT "T_Paiements_ID_Deplacement_fkey" FOREIGN KEY ("ID_Deplacement") REFERENCES "T_Deplacements"("ID_Deplacement") ON DELETE RESTRICT ON UPDATE CASCADE;
