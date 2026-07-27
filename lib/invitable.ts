import { prisma } from "./db";
import { gameDayRange } from "./gameDay";
import { effectiveDrinkStatus } from "./drinkStatus";

export type FriendStatus = "UNAVAILABLE" | null;

// Purement informatif désormais : "pas envie" n'empêche plus d'inviter
// quelqu'un, c'est juste un indice pour aider à choisir qui convier.
export async function getFriendStatuses(userIds: string[]): Promise<Record<string, FriendStatus>> {
  if (userIds.length === 0) return {};
  const users = await prisma.user.findMany({ where: { id: { in: userIds } } });
  const statuses: Record<string, FriendStatus> = {};
  for (const u of users) {
    statuses[u.id] = effectiveDrinkStatus(u.drinkStatus, u.drinkStatusDate) === "UNAVAILABLE" ? "UNAVAILABLE" : null;
  }
  return statuses;
}

// Est-ce que cette personne est actuellement maudite (aujourd'hui) ?
// Purement informatif/cosmétique — n'empêche jamais d'être invité.
export async function getCursedTodayIds(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const { start, end } = gameDayRange();
  const curses = await prisma.curse.findMany({
    where: { cursedUserId: { in: userIds }, createdAt: { gte: start, lt: end } },
  });
  return new Set(curses.map((c) => c.cursedUserId));
}

// Un maudit non "remboursé" (tournée double pas encore payée) doit ce
// rappel à chaque fois qu'il rejoint une invitation, jusqu'à ce que l'hôte
// concerné le marque comme payé.
export async function getUnpaidCurse(userId: string) {
  return prisma.curse.findFirst({
    where: { cursedUserId: userId, redeemed: false },
    orderBy: { createdAt: "asc" },
  });
}
