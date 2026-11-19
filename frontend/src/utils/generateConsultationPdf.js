import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { toCanvas } from "html-to-image";
import jsPDF from "jspdf";

import ConsultationPrintPage from "../components/compteRendu/PrintPage";

import { formatDate, sanitize } from "../components/compteRendu/utils";

export async function generateConsultationPdf({
  user,
  prestation,
  consultation,
  animal,
  tarif,
  proprietaire,
  lieu,
  zonages = [],
  mode = "preview",
}) {
  const container = document.createElement("div");

  Object.assign(container.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "794px",
    zIndex: "-1",
    backgroundColor: "#ffffff",
    color: "#1e3a8a",
    colorScheme: "light",
    isolation: "isolate",
  });

  container.className = "light";;

  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    flushSync(() => {
      root.render(
        createElement(ConsultationPrintPage, {
          user,
          prestation,
          consultation,
          animal,
          tarif,
          proprietaire,
          lieu,
          zonages,
        }),
      );
    });

    const element = container.firstElementChild;

    await document.fonts.ready;

    const canvas = await toCanvas(element, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      width: 794,
      cacheBust: true,
      skipFonts: false,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;

    const imgData = canvas.toDataURL("image/png");

    const imageHeight = (canvas.height * pageWidth) / canvas.width;

    const totalPages = Math.ceil(imageHeight / pageHeight);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      const position = -(page * pageHeight);

      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imageHeight);
    }

    const filename =
      [
        "CR",
        sanitize(animal?.Nom_Animal || "Animal"),
        sanitize(proprietaire?.Nom_Proprietaire || "Proprietaire"),
        formatDate(prestation?.Date_Prestation).replace(/\//g, "-"),
      ].join("_") + ".pdf";

    if (mode === "download") {
      pdf.save(filename);
    } else {
      const url = URL.createObjectURL(pdf.output("blob"));

      const tab = window.open(url, "_blank");

      if (!tab) {
        URL.revokeObjectURL(url);

        throw new Error(
          "Le navigateur a bloqué l'ouverture du PDF. Autorisez les fenêtres contextuelles.",
        );
      }

      tab.addEventListener("load", () => URL.revokeObjectURL(url), {
        once: true,
      });
    }
  } finally {
    flushSync(() => {
      root.unmount();
    });

    container.remove();
  }
}
