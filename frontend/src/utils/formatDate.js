export function formatDate(date) {
  if (!date) {
    return "-";
  }

  const formatted = new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
  });

  const [day, month] = formatted.split(" ");

  const displayMonth = month.length > 5 ? `${month.slice(0, 4)}.` : month;

  return `${day} ${displayMonth.charAt(0).toUpperCase()}${displayMonth.slice(1)}`;
}

export function formatDateInput(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}
