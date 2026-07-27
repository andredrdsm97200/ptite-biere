import { prisma } from "./db";
import { gameDayKey } from "./gameDay";

// Le classement se calcule uniquement parmi soi + ses amis acceptés —
// pas un classement mondial entre inconnus.
export async function getCircle(userId: string): Promise<string[]> {
  const friendships = await prisma.friendship.findMany({
    where: { status: "ACCEPTED", OR: [{ userAId: userId }, { userBId: userId }] },
  });
  const ids = friendships.map((f) => (f.userAId === userId ? f.userBId : f.userAId));
  return Array.from(new Set([userId, ...ids]));
}

export type RankRow = { userId: string; username: string; value: number };

async function usernamesById(ids: string[]): Promise<Record<string, string>> {
  const users = await prisma.user.findMany({ where: { id: { in: ids } } });
  return Object.fromEntries(users.map((u) => [u.id, u.username]));
}

// 🏆 Meilleur hôte : le plus de "banco" (JOINED) reçus sur ses propres appels, cumulé.
export async function bestHosts(circle: string[]): Promise<RankRow[]> {
  const recipients = await prisma.inviteRecipient.findMany({
    where: { status: "JOINED", invite: { hostId: { in: circle } } },
    include: { invite: true },
  });
  const counts = new Map<string, number>();
  for (const r of recipients) {
    counts.set(r.invite.hostId, (counts.get(r.invite.hostId) || 0) + 1);
  }
  const names = await usernamesById(circle);
  return circle
    .map((id) => ({ userId: id, username: names[id], value: counts.get(id) || 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

// 🙅 Le moins chaud : nombre de journées où la personne a dit "pas envie".
export async function mostUnavailable(circle: string[]): Promise<RankRow[]> {
  const logs = await prisma.statusLog.findMany({
    where: { userId: { in: circle }, status: "UNAVAILABLE" },
  });
  const counts = new Map<string, number>();
  for (const l of logs) counts.set(l.userId, (counts.get(l.userId) || 0) + 1);
  const names = await usernamesById(circle);
  return circle
    .map((id) => ({ userId: id, username: names[id], value: counts.get(id) || 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

// 🔮 Badge malédiction : nombre de fois où la personne a été maudite.
export async function mostCursed(circle: string[]): Promise<RankRow[]> {
  const curses = await prisma.curse.findMany({ where: { cursedUserId: { in: circle } } });
  const counts = new Map<string, number>();
  for (const c of curses) counts.set(c.cursedUserId, (counts.get(c.cursedUserId) || 0) + 1);
  const names = await usernamesById(circle);
  return circle
    .map((id) => ({ userId: id, username: names[id], value: counts.get(id) || 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

// 🙋 Participation réelle : nombre de fois où la personne a rejoint une invitation.
export async function participationCounts(circle: string[]): Promise<RankRow[]> {
  const rows = await prisma.inviteRecipient.findMany({
    where: { userId: { in: circle }, status: "JOINED" },
  });
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.userId, (counts.get(r.userId) || 0) + 1);
  const names = await usernamesById(circle);
  return circle
    .map((id) => ({ userId: id, username: names[id], value: counts.get(id) || 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

// 💨 Annulations tardives : dit "j'arrive" puis se rétracte.
export async function lateCancellationCounts(circle: string[]): Promise<RankRow[]> {
  const rows = await prisma.inviteRecipient.findMany({
    where: { userId: { in: circle }, status: "CANCELLED" },
  });
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.userId, (counts.get(r.userId) || 0) + 1);
  const names = await usernamesById(circle);
  return circle
    .map((id) => ({ userId: id, username: names[id], value: counts.get(id) || 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

// 🔥 Le plus chaud sans interruption : jours consécutifs où la personne
// était "chaude" ET a reçu une invitation ce jour-là ET y est allée (JOINED).
async function computeStreak(userId: string): Promise<number> {
  const [logs, joinedRecipients] = await Promise.all([
    prisma.statusLog.findMany({ where: { userId, status: "AVAILABLE" } }),
    prisma.inviteRecipient.findMany({
      where: { userId, status: "JOINED" },
      include: { invite: true },
    }),
  ]);

  const availableDays = new Set(logs.map((l) => l.gameDay.getTime()));
  const joinedDays = new Set(joinedRecipients.map((r) => gameDayKey(r.invite.createdAt).getTime()));

  let streak = 0;
  const cursor = gameDayKey();

  // Aujourd'hui compte en bonus s'il est déjà validé, sans casser la série
  // si la journée n'est simplement pas encore terminée.
  if (availableDays.has(cursor.getTime()) && joinedDays.has(cursor.getTime())) {
    streak++;
  }
  cursor.setDate(cursor.getDate() - 1);

  while (availableDays.has(cursor.getTime()) && joinedDays.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export async function hottestStreaks(circle: string[]): Promise<RankRow[]> {
  const names = await usernamesById(circle);
  const rows = await Promise.all(
    circle.map(async (id) => ({ userId: id, username: names[id], value: await computeStreak(id) }))
  );
  return rows.filter((r) => r.value > 0).sort((a, b) => b.value - a.value);
}
