import { prisma } from "./db";

export const CHOPE_TIERS = [
  { icon: "🥤", name: "Gobelet plastique" },
  { icon: "🍺", name: "Demi" },
  { icon: "🍺", name: "Chope classique" },
  { icon: "🍻", name: "Chope gravée" },
  { icon: "⚒️", name: "Chope en cuivre" },
  { icon: "🛡️", name: "Chope Viking" },
  { icon: "👑", name: "Chope Royale" },
  { icon: "💎", name: "Chope Cristal" },
  { icon: "🌌", name: "Chope Cosmique" },
  { icon: "🔥", name: "Chope Légendaire" },
] as const;

// Seuils d'XP cumulée pour chaque palier. Jamais de pénalité : l'XP ne
// baisse jamais, elle ne fait que représenter l'ancienneté + la participation réelle.
const THRESHOLDS = [0, 20, 50, 100, 180, 300, 480, 750, 1200, 2000];

export type ChopeInfo = {
  tierIndex: number;
  icon: string;
  name: string;
  xp: number;
  progressPct: number; // 0-100 vers le prochain palier
  isMax: boolean;
  nextIcon?: string;
  nextName?: string;
};

function tierFromXP(xp: number): ChopeInfo {
  let tierIndex = 0;
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= THRESHOLDS[i]) {
      tierIndex = i;
      break;
    }
  }
  const isMax = tierIndex === CHOPE_TIERS.length - 1;
  const floor = THRESHOLDS[tierIndex];
  const ceiling = isMax ? floor : THRESHOLDS[tierIndex + 1];
  const progressPct = isMax ? 100 : Math.round(((xp - floor) / (ceiling - floor)) * 100);

  return {
    tierIndex,
    icon: CHOPE_TIERS[tierIndex].icon,
    name: CHOPE_TIERS[tierIndex].name,
    xp,
    progressPct,
    isMax,
    nextIcon: isMax ? undefined : CHOPE_TIERS[tierIndex + 1].icon,
    nextName: isMax ? undefined : CHOPE_TIERS[tierIndex + 1].name,
  };
}

// Calcule la Chope d'une seule personne (page profil).
export async function getChope(userId: string): Promise<ChopeInfo> {
  const [user, joinedCount, hostedInvites] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.inviteRecipient.count({ where: { userId, status: "JOINED" } }),
    prisma.invite.findMany({ where: { hostId: userId }, include: { recipients: true } }),
  ]);

  const hostedWithJoin = hostedInvites.filter((inv) => inv.recipients.some((r) => r.status === "JOINED")).length;
  const daysSinceSignup = user ? Math.floor((Date.now() - user.createdAt.getTime()) / 86_400_000) : 0;

  const xp = daysSinceSignup * 1 + joinedCount * 10 + hostedWithJoin * 15;
  return tierFromXP(xp);
}

// Version groupée, pour afficher la Chope de plusieurs personnes à la fois
// (liste d'amis, classement...) sans multiplier les requêtes.
export async function getChopeMap(userIds: string[]): Promise<Record<string, ChopeInfo>> {
  if (userIds.length === 0) return {};

  const [users, joinedRows, hostedInvites] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: userIds } } }),
    prisma.inviteRecipient.findMany({ where: { userId: { in: userIds }, status: "JOINED" } }),
    prisma.invite.findMany({ where: { hostId: { in: userIds } }, include: { recipients: true } }),
  ]);

  const joinedCounts = new Map<string, number>();
  for (const r of joinedRows) joinedCounts.set(r.userId, (joinedCounts.get(r.userId) || 0) + 1);

  const hostedWithJoinCounts = new Map<string, number>();
  for (const inv of hostedInvites) {
    if (inv.recipients.some((r) => r.status === "JOINED")) {
      hostedWithJoinCounts.set(inv.hostId, (hostedWithJoinCounts.get(inv.hostId) || 0) + 1);
    }
  }

  const map: Record<string, ChopeInfo> = {};
  for (const u of users) {
    const daysSinceSignup = Math.floor((Date.now() - u.createdAt.getTime()) / 86_400_000);
    const xp = daysSinceSignup * 1 + (joinedCounts.get(u.id) || 0) * 10 + (hostedWithJoinCounts.get(u.id) || 0) * 15;
    map[u.id] = tierFromXP(xp);
  }
  return map;
}
