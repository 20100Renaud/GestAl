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

export default function ConsultationContent({ consultation }) {
  const motif = displayValue(consultation?.Motif_Consultation) || "-";

  const description =
    displayValue(consultation?.Description_Consultation) || "-";

  const preconisation = displayValue(consultation?.Preconisation_Consultation);

  return (
    <section className="mt-8 text-blue-900">
      <h2 className="mb-3 border-b border-blue-200 pb-2 text-base font-bold text-blue-800">
        Consultation
      </h2>

      <div className="ml-6">
        <p className="text-xs leading-relaxed">
          <strong>Motif :</strong> {motif}
        </p>

        <div className="mt-5">
          <h3 className="mb-2 text-xs font-bold">Description :</h3>

          <div className="ml-6 rounded-lg border border-blue-200 p-4 text-xs leading-relaxed whitespace-pre-wrap">
            {description}
          </div>
        </div>

        {preconisation && (
          <div className="mt-5">
            <h3 className="mb-2 text-xs font-bold">Préconisation :</h3>

            <div className="ml-6 rounded-lg border border-blue-300 bg-blue-50 p-4 text-xs leading-relaxed whitespace-pre-wrap">
              {preconisation}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
