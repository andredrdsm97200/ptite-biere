// L'appli fonctionne sur une "journée de jeu" qui commence à 5h du matin,
// pas à minuit — une soirée qui déborde après minuit compte encore pour
// "aujourd'hui". Tout ce qui doit se réinitialiser chaque matin (statut,
// carte, invitations actives) se cale sur cette limite.
const RESET_HOUR = 5;

export function gameDayKey(date: Date = new Date()): Date {
  const d = new Date(date);
  if (d.getHours() < RESET_HOUR) {
    d.setDate(d.getDate() - 1);
  }
  d.setHours(RESET_HOUR, 0, 0, 0);
  return d;
}

export function gameDayRange(date: Date = new Date()) {
  const start = gameDayKey(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export function sameGameDay(a: Date | null, b: Date = new Date()): boolean {
  if (!a) return false;
  return gameDayKey(a).getTime() === gameDayKey(b).getTime();
}
