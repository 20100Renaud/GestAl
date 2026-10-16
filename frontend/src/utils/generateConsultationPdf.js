import { jsPDF } from "jspdf";

function drawLogo(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(30, 58, 138);
  doc.text("GestAL", pageWidth / 2, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(59, 130, 246);
  doc.text("Gestion de consultations animales", pageWidth / 2, 26, {
    align: "center",
  });
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(displayValue).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    return "";
  }

  return String(value);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("fr-FR");
}

function calculateAge(birthDate, today = new Date()) {
  if (!birthDate) return "-";

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "-";

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (today.getDate() < birth.getDate()) months--;
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) return "-";
  if (years === 0 && months === 0) return `${months} mois`;

  const parts = [];
  if (years > 0) parts.push(`${years} an${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} mois`);

  return parts.join(" et ");
}

function drawInfoBlock(doc, title, record, x, y, width) {
  if (!record) return y;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text(title, x, y);

  let currentY = y + 6;
  const lineHeight = 4.5;
  const rowGap = 0.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);

  const isPrestataire = title === "Prestataire";

  // First row: Pratique or company information
  if (isPrestataire) {
    if (record.practice) {
      currentY = drawRow([String(record.practice).toUpperCase()], currentY);
    }
  } else if (record.Raison_sociale && record.Raison_sociale !== "Particulier") {
    currentY = drawRow(
      [record.Raison_sociale, record.Etablissement]
        .filter(Boolean)
        .map((value) => String(value).toUpperCase()),
      currentY,
    );
  } else if (record.Etablissement) {
    currentY = drawRow([String(record.Etablissement).toUpperCase()], currentY);
  }

  // Second row: Civilité, nom, prénom
  const civilite = isPrestataire
    ? record.civility
    : record.Civilite_Proprietaire;

  const nom = isPrestataire ? record.lastName : record.Nom_Proprietaire;

  const prenom = isPrestataire ? record.firstName : record.Prenom_Proprietaire;

  currentY = drawRow([civilite, nom, prenom], currentY);

  // Address
  const adresse = isPrestataire ? record.address : record.Adresse_Proprietaire;

  if (adresse) {
    currentY = drawRow([adresse], currentY);
  }

  // Postal code and city
  const cp = isPrestataire ? record.postalCode : record.CP_Proprietaire;

  const ville = isPrestataire ? record.city : record.Ville_Proprietaire;

  currentY = drawRow([cp, ville], currentY);

  // Email
  const email = isPrestataire ? record.email : record.Email_Proprietaire;

  if (email) {
    currentY = drawRow([email], currentY);
  }

  // Phone
  const telephone = isPrestataire ? record.phone : record.Tel_Proprietaire;

  if (telephone) {
    currentY = drawRow([telephone], currentY);
  }

  return currentY;

  // Draw one row of non-empty fields, wrapping long text when needed
  function drawRow(values, rowY) {
    const text = values
      .filter(
        (value) =>
          value !== null && value !== undefined && String(value).trim() !== "",
      )
      .map(String)
      .join(" ");

    if (!text) return rowY;

    const lines = doc.splitTextToSize(text, width);
    doc.text(lines, x, rowY);

    return rowY + lines.length * lineHeight + rowGap;
  }
}

function ensureSpace(doc, y, requiredHeight) {
  if (y + requiredHeight > 275) {
    doc.addPage();
    return 20;
  }

  return y;
}

function drawSectionTitle(doc, title, y, suffix = "") {
  const marginTop = 4.23;
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  const maxWidth = pageWidth - marginX * 2;

  y += marginTop;
  y = ensureSpace(doc, y, 20);

  // Main title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 64, 175);

  doc.text(title, marginX, y);

  const titleWidth = doc.getTextWidth(title);

  // Remaining text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);

  const suffixX = marginX + titleWidth;
  const remainingWidth = pageWidth - marginX - suffixX;

  const suffixLines = suffix ? doc.splitTextToSize(suffix, remainingWidth) : [];

  if (suffixLines.length > 0) {
    doc.text(suffixLines[0], suffixX + remainingWidth / 2, y, {
      align: "center",
    });

    // Continue to next line
    if (suffixLines.length > 1) {
      doc.text(suffixLines.slice(1), marginX, y + 5);
    }
  }

  const lineY = y + (suffixLines.length > 1 ? 7 : 3);

  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(0.3);
  doc.line(marginX, lineY, pageWidth - marginX, lineY);

  return lineY + 7;
}

function drawZonageCards(doc, zonages, startY) {
  let y = drawSectionTitle(doc, "Zones concernées", startY);

  if (!zonages.length) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Aucun zonage sélectionné.", 14, y + 2);
    return y + 9;
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 14;
  const gapX = 5;
  const gapY = 12;
  const columns = 5;
  const cardWidth = (pageWidth - marginX * 2 - gapX * (columns - 1)) / columns;
  const cardHeight = 20;

  const colorsByTechnique = {
    Articulaire: {
      top: [22, 163, 74],
      badge: [22, 163, 74],
      badgeBg: [240, 253, 244],
    },
    Tissulaire: {
      top: [37, 99, 235],
      badge: [37, 99, 235],
      badgeBg: [239, 246, 255],
    },
    Viscérale: {
      top: [147, 51, 234],
      badge: [147, 51, 234],
      badgeBg: [250, 245, 255],
    },
  };

  const fallbackColors = {
    top: [107, 114, 128],
    badge: [107, 114, 128],
    badgeBg: [249, 250, 251],
  };

  let rowY = y;
  let pageOffsetY = 0;

  zonages.forEach((zonage, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    if (column === 0) {
      rowY = y + row * (cardHeight + gapY) + pageOffsetY;

      if (rowY + cardHeight > pageHeight - 15) {
        doc.addPage();
        pageOffsetY = 20 - rowY;
        rowY = 20;
      }
    }

    const cardsInRow = Math.min(columns, zonages.length - row * columns);

    const rowWidth = cardsInRow * cardWidth + (cardsInRow - 1) * gapX;

    const rowStartX = (pageWidth - rowWidth) / 2;
    const x = rowStartX + column * (cardWidth + gapX);

    const colors = colorsByTechnique[zonage.Technique_Zonage] ?? fallbackColors;

    // Card
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...colors.top);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, rowY, cardWidth, cardHeight, 3, 3, "FD");

    // Technique badge
    const technique = zonage.Technique_Zonage || "Technique non renseignée";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    const pillWidth = Math.min(cardWidth - 4, doc.getTextWidth(technique) + 8);

    const pillX = x + (cardWidth - pillWidth) / 2;
    const pillY = rowY - 3;

    doc.setFillColor(...colors.badgeBg);
    doc.setDrawColor(...colors.badge);
    doc.roundedRect(pillX, pillY, pillWidth, 6, 3, 3, "FD");

    doc.setTextColor(...colors.badge);
    doc.text(technique, x + cardWidth / 2, pillY + 4, {
      align: "center",
    });

    // Zonage title
    const title =
      [
        zonage.Nom_Zonage,
        zonage.Position_Zonage,
        zonage.Orientation_Zonage ? `-${zonage.Orientation_Zonage}` : "",
      ]
        .filter(Boolean)
        .join("") || "Zonage sans intitulé";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);

    const titleLines = doc.splitTextToSize(title, cardWidth - 8);

    const hasComment =
      zonage.Commentaire_Zonage &&
      String(zonage.Commentaire_Zonage).trim() !== "";

    const titleY = rowY + cardHeight / 2 + (hasComment ? 0 : 2);

    doc.text(titleLines.slice(0, 2), x + cardWidth / 2, titleY, {
      align: "center",
    });

    // Comment badge
    const comment = zonage.Commentaire_Zonage;

    if (comment && String(comment).trim() !== "") {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);

      const badgeY = rowY + cardHeight / 2 + 3;

      doc.setFillColor(...colors.badgeBg);
      doc.setDrawColor(...colors.badge);
      doc.roundedRect(x + 2, badgeY, cardWidth - 4, 6, 3, 3, "FD");

      doc.setTextColor(...colors.badge);

      const commentLines = doc.splitTextToSize(
        String(comment).trim(),
        cardWidth - 8,
      );

      doc.text(commentLines[0], x + cardWidth / 2, badgeY + 4, {
        align: "center",
      });
    }
  });

  const rowCount = Math.ceil(zonages.length / columns);

  return y + rowCount * (cardHeight + gapY);
}

export function openConsultationPdf({
  user,
  prestation,
  consultation,
  animal,
  proprietaire,
  lieu,
  zonages = [],
  mode = "preview",
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const textIndent = 6;
  const textWidth = pageWidth - 28 - textIndent;

  // Logo
  drawLogo(doc);

  // Titre + Date + Animal
  const animalDescription = [
    animal?.Nom_Animal,
    animal?.Genre_Animal ? `- ${animal.Genre_Animal}` : "",
    animal?.Race_Animal ? `${animal.Race_Animal}` : "",
    animal?.Sexe_Animal,
    animal?.Date_Naissance_Animal
      ? `de ${calculateAge(animal.Date_Naissance_Animal)}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const reportPrefix = `Compte rendu du ${formatDate(
    prestation?.Date_Prestation,
  )} : `;

  const reportSuffix = `${animalDescription}.`;

  let y = drawSectionTitle(doc, reportPrefix, 38, reportSuffix);

  // Header
  const marginX = 20;
  const gapX = 5;
  const hasDifferentLieu =
    prestation?.ID_Lieu != null &&
    prestation?.ID_Proprietaire != null &&
    String(prestation.ID_Lieu) !== String(prestation.ID_Proprietaire);

  const colWidth = (pageWidth - marginX * 2 - gapX * 2) / 3;

  const headerBottoms = [
    drawInfoBlock(doc, "Prestataire", user, marginX, y, colWidth),
    drawInfoBlock(
      doc,
      "Propriétaire",
      proprietaire,
      marginX + 2 * (colWidth + gapX),
      y,
      colWidth,
    ),
  ];

  if (hasDifferentLieu) {
    headerBottoms.push(
      drawInfoBlock(
        doc,
        "Lieu de prestation",
        lieu,
        marginX + colWidth + gapX,
        y,
        colWidth,
      ),
    );
  }

  // Consultation
  let contentY = Math.max(...headerBottoms) + 6;
  contentY = drawSectionTitle(doc, "Consultation", contentY);

  const leftX = 14 + textIndent;
  const availableWidth = pageWidth - 28 - textIndent * 2;

  // Motif: label and value on the same line
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);

  const motifLabel = "Motif:";
  doc.text(motifLabel, leftX, contentY);

  const motifLabelWidth = doc.getTextWidth(motifLabel + " ");

  doc.setFont("helvetica", "normal");

  const motif = displayValue(consultation?.Motif_Consultation) || "-";

  const motifLines = doc.splitTextToSize(
    motif,
    availableWidth - motifLabelWidth,
  );

  doc.text(motifLines, leftX + motifLabelWidth, contentY);

  contentY += Math.max(motifLines.length * 4, 4);

  // Description block
  contentY = ensureSpace(doc, contentY + 4, 25);

  const boxIndent = 6;
  const boxX = leftX + boxIndent;
  const boxWidth = availableWidth - boxIndent;
  const boxPaddingX = 4;
  const boxPaddingY = 4;
  const lineHeight = 4.5;

  // Description title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);

  doc.text("Description :", leftX, contentY);

  const titleGap = 3;
  contentY += titleGap;

  // Description content
  const description =
    displayValue(consultation?.Description_Consultation) || "-";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);

  const descriptionWidth = boxWidth - boxPaddingX * 2;
  const descriptionLines = doc.splitTextToSize(description, descriptionWidth);

  const boxHeight = descriptionLines.length * lineHeight + boxPaddingY * 2;

  if (contentY + boxHeight > 275) {
    doc.addPage();
    contentY = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Description :", leftX, contentY);

    contentY += titleGap + 4;

    doc.setFont("helvetica", "normal");
  }

  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(0.4);
  doc.setFillColor(255, 255, 255);

  doc.roundedRect(boxX, contentY, boxWidth, boxHeight, 3, 3, "FD");

  doc.text(descriptionLines, boxX + boxPaddingX, contentY + boxPaddingY + 3);

  contentY += boxHeight + 8;

  // Zonage
  drawZonageCards(doc, zonages, contentY);

  // File
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  // File name
  const sanitize = (value) =>
    String(value ?? "")
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-");

  const animalName = sanitize(animal?.Nom_Animal || "Animal");
  const ownerName = sanitize(proprietaire?.Nom_Proprietaire || "Proprietaire");
  const prestationDate = formatDate(prestation?.Date_Prestation).replace(
    /\//g,
    "-",
  );

  const filename = `CR_${animalName}_${ownerName}_${prestationDate}.pdf`;

  if (mode === "download") {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  // Preview in a new tab
  const tab = window.open(url, "_blank");

  if (!tab) {
    URL.revokeObjectURL(url);
    throw new Error(
      "Le navigateur a bloqué l'ouverture du PDF. Autorisez les fenêtres contextuelles.",
    );
  }
}
