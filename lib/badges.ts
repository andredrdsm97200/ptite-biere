import { bestHosts, hottestStreaks, mostUnavailable, mostCursed, RankRow } from "./leaderboard";

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

// Score combiné, façon jeu de société : une seule note qui résume tout.
export type GlobalScoreRow = { userId: string; username: string; score: number };

export async function globalScores(circle: string[]): Promise<GlobalScoreRow[]> {
  const [hosts, streaks, cold, cursed] = await Promise.all([
    bestHosts(circle),
    hottestStreaks(circle),
    mostUnavailable(circle),
    mostCursed(circle),
  ]);

  const scores = new Map<string, { username: string; score: number }>();
  const bump = (rows: RankRow[], weight: number) => {
    for (const r of rows) {
      const entry = scores.get(r.userId) || { username: r.username, score: 0 };
      entry.score += r.value * weight;
      scores.set(r.userId, entry);
    }
  };

  bump(hosts, 3); // +3 par "banco" reçu en tant qu'hôte
  bump(streaks, 2); // +2 par jour de série en cours
  bump(cold, -1); // -1 par "pas envie" déclaré
  bump(cursed, -5); // -5 par malédiction reçue

  return Array.from(scores.entries())
    .map(([userId, v]) => ({ userId, username: v.username, score: v.score }))
    .sort((a, b) => b.score - a.score);
}
