import { formatDate, calculateAge } from "./utils";

export default function ConsultationHeader({
  prestation,
  animal,
  consultation,
}) {
  const animalDescription = [
    animal?.Nom_Animal,
    animal?.Genre_Animal ? `- ${animal.Genre_Animal}` : "",
    animal?.Race_Animal,
    animal?.Sexe_Animal,
    animal?.Date_Naissance_Animal
      ? `de ${calculateAge(animal.Date_Naissance_Animal)}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className="text-center text-blue-900">
      <h1 className="text-3xl font-bold tracking-tight text-blue-900">
        GestAL
      </h1>

      <p className="text-sm text-blue-500">Gestion de consultations animales</p>

      <div className="mt-8 text-left">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-bold text-blue-800">
            Compte rendu du {formatDate(prestation?.Date_Prestation)}
          </h2>

          {consultation?.Date_Edition_Consultation && (
            <p className="shrink-0 text-[10px] text-blue-500">
              Édité le {formatDate(consultation.Date_Edition_Consultation)}
            </p>
          )}
        </div>

        <p className="mt-2 text-sm text-blue-900">{animalDescription}.</p>

        <div className="mt-2 border-b border-blue-200" />
      </div>
    </header>
  );
}
