export function calculateAge(date) {
  if (!date) return "-";

  const birthDate = new Date(date);
  const today = new Date();

  if (birthDate > today) {
    return "Pas encore né ^^";
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0) {
    return `${months} mois`;
  }

  if (months === 0) {
    return `${years} an${years > 1 ? "s" : ""}`;
  }

  return `${years} an${years > 1 ? "s" : ""} et ${months} mois`;
}
