import { bestHosts, hottestStreaks, mostUnavailable, mostCursed, participationCounts, lateCancellationCounts, RankRow } from "./leaderboard";

export type BadgeIcon = { icon: string; title: string };

// Icônes affichées à côté d'un pseudo, partout dans l'appli, pour qui tient
// actuellement le badge (1er du classement de la catégorie).
export async function getBadgeMap(circle: string[]): Promise<Record<string, BadgeIcon[]>> {
  const [hosts, streaks, cold, cursed] = await Promise.all([
    bestHosts(circle),
    hottestStreaks(circle),
    mostUnavailable(circle),
    mostCursed(circle),
  ]);

  const map: Record<string, BadgeIcon[]> = {};
  const add = (rows: RankRow[], icon: string, title: string) => {
    if (rows[0]) {
      (map[rows[0].userId] ||= []).push({ icon, title });
    }
  };
  add(hosts, "🏅", "Meilleur hôte");
  add(streaks, "🔥", "Le plus chaud sans interruption");
  add(cold, "🥶", "Le moins chaud");
  add(cursed, "🔮", "Le plus maudit");

  return map;
}

// Karma : une seule note qui résume la fiabilité et l'engagement dans la
// cercle d'amis. Dire honnêtement "pas envie" n'est jamais puni — seul le fait de
// se décommander après avoir dit "j'arrive" fait baisser le Karma.
export type GlobalScoreRow = { userId: string; username: string; score: number };

export async function globalScores(circle: string[]): Promise<GlobalScoreRow[]> {
  const [hosts, streaks, participation, lateCancels] = await Promise.all([
    bestHosts(circle),
    hottestStreaks(circle),
    participationCounts(circle),
    lateCancellationCounts(circle),
  ]);

  const scores = new Map<string, { username: string; score: number }>();
  const bump = (rows: RankRow[], weight: number) => {
    for (const r of rows) {
      const entry = scores.get(r.userId) || { username: r.username, score: 0 };
      entry.score += r.value * weight;
      scores.set(r.userId, entry);
    }
  };

  bump(hosts, 3); // +3 par invitation réussie en tant qu'hôte (banco reçu)
  bump(participation, 2); // +2 par invitation rejointe en tant qu'invité
  bump(streaks, 1); // +1 par jour de série "chaud" en cours
  bump(lateCancels, -3); // -3 par annulation tardive (après avoir dit "j'arrive")

  return Array.from(scores.entries())
    .map(([userId, v]) => ({ userId, username: v.username, score: v.score }))
    .sort((a, b) => b.score - a.score);
}
