import { prisma } from "./db";
import { gameDayRange } from "./gameDay";
import { effectiveDrinkStatus } from "./drinkStatus";

export type Mood = "hot" | "cold" | "cursed" | "neutral";

// Une malédiction posée AUJOURD'HUI (journée de jeu) éclipse tout le reste :
// même "chaud", on reste maudit tant que le poison n'est pas retombé le
// lendemain matin.
export async function getUserMood(
  userId: string,
  drinkStatus: string | null,
  drinkStatusDate: Date | null
): Promise<Mood> {
  const { start, end } = gameDayRange();
  const curseToday = await prisma.curse.findFirst({
    where: { cursedUserId: userId, createdAt: { gte: start, lt: end } },
  });
  if (curseToday) return "cursed";

  const status = effectiveDrinkStatus(drinkStatus, drinkStatusDate);
  if (status === "AVAILABLE") return "hot";
  if (status === "UNAVAILABLE") return "cold";
  return "neutral";
}

// Le poison est plus virulent dans les 10 minutes qui suivent la malédiction,
// puis se calme — un petit "aïe" initial plutôt qu'un effet plat.
export async function isCurseFresh(userId: string): Promise<boolean> {
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
  const fresh = await prisma.curse.findFirst({
    where: { cursedUserId: userId, createdAt: { gte: tenMinAgo } },
  });
  return !!fresh;
}
