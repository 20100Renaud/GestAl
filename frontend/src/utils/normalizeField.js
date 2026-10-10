export function normalizeUpper(value) {
    return value.trim().toUpperCase();
  }

export function normalizeCamel(value) {
    return value
      .trim()
      .toLowerCase()
      .replace(/(^|[\s-])(\p{L})/gu, (_, separator, letter) => {
        return separator + letter.toUpperCase();
      });
  }
