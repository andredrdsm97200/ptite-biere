import { prisma } from "./db";
import { gameDayRange } from "./gameDay";
import { effectiveDrinkStatus } from "./drinkStatus";

export type InviteBlockReason = "UNAVAILABLE" | "CURSED" | null;

// Un maudit du jour est en "quarantaine" : personne ne peut l'inviter tant
// que le poison n'est pas retombé (5h du matin). C'est la vraie conséquence
// de la malédiction, pas juste un habillage visuel.
export async function getInviteBlockReasons(
  userIds: string[]
): Promise<Record<string, InviteBlockReason>> {
  if (userIds.length === 0) return {};

  const users = await prisma.user.findMany({ where: { id: { in: userIds } } });
  const { start, end } = gameDayRange();
  const curses = await prisma.curse.findMany({
    where: { cursedUserId: { in: userIds }, createdAt: { gte: start, lt: end } },
  });
  const cursedTodayIds = new Set(curses.map((c) => c.cursedUserId));

  const reasons: Record<string, InviteBlockReason> = {};
  for (const u of users) {
    if (cursedTodayIds.has(u.id)) {
      reasons[u.id] = "CURSED";
    } else if (effectiveDrinkStatus(u.drinkStatus, u.drinkStatusDate) === "UNAVAILABLE") {
      reasons[u.id] = "UNAVAILABLE";
    } else {
      reasons[u.id] = null;
    }
  }
  return reasons;
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
