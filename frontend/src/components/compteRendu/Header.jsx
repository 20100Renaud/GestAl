import { formatDate, calculateAge } from "./utils";

export default function ConsultationHeader({ prestation, animal }) {
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
        <h2 className="text-xl font-bold text-blue-800">
          Compte rendu du {formatDate(prestation?.Date_Prestation)}
          <span className="ml-2 text-sm font-normal text-blue-900">
            {animalDescription}.
          </span>
        </h2>

        <div className="mt-2 border-b border-blue-200" />
      </div>
    </header>
  );
}
