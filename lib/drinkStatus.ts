import { sameGameDay } from "./gameDay";

export type DrinkStatus = "AVAILABLE" | "UNAVAILABLE" | null;

// Un statut ne vaut que pour la journée de jeu (5h-5h) où il a été déclaré :
// passé l'heure de reset, on le considère comme "rien dit" (null).
export function effectiveDrinkStatus(
  status: string | null,
  statusDate: Date | null
): DrinkStatus {
  if (!status || !statusDate) return null;
  if (!sameGameDay(new Date(statusDate))) return null;
  return status as DrinkStatus;
}
