export function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("fr-FR");
}

export function calculateAge(birthDate, today = new Date()) {
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

  if (years === 0 && months === 0) return "0 mois";

  const parts = [];

  if (years > 0) {
    parts.push(`${years} an${years > 1 ? "s" : ""}`);
  }

  if (months > 0) {
    parts.push(`${months} mois`);
  }

  return parts.join(" et ");
}

export function sanitize(value) {
  return String(value ?? "")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-");
}
