// Normalise un numéro de téléphone pour pouvoir comparer deux numéros
// écrits différemment (espaces, tirets, parenthèses...).
// Limite connue : "0612345678" et "+33612345678" ne seront PAS reconnus
// comme identiques, faute d'une vraie librairie de parsing international.
export function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  if (digits.length < 6) return null;
  return (hasPlus ? "+" : "") + digits;
}
