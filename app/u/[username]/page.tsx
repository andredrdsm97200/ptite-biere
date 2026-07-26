import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserMood, isCurseFresh } from "@/lib/mood";
import { getCircle, bestHosts, hottestStreaks, mostUnavailable, mostCursed } from "@/lib/leaderboard";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";
import MoodEffects from "@/components/MoodEffects";
import BadgeChip from "@/components/BadgeChip";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const profileUser = await prisma.user.findUnique({ where: { username: params.username } });
  if (!profileUser) notFound();

  const circle = await getCircle(me.id);
  if (!circle.includes(profileUser.id)) {
    // On ne montre un profil qu'à soi-même ou à ses amis directs.
    redirect("/friends");
  }

  const mood = await getUserMood(me.id, me.drinkStatus, me.drinkStatusDate);
  const intense = mood === "cursed" ? await isCurseFresh(me.id) : false;

  const [hosts, streaks, cold, cursed] = await Promise.all([
    bestHosts(circle),
    hottestStreaks(circle),
    mostUnavailable(circle),
    mostCursed(circle),
  ]);

  const badges = [
    hosts[0]?.userId === profileUser.id && { icon: "🏅", title: "Meilleur hôte", sub: `${hosts[0].value} "banco" reçus` },
    streaks[0]?.userId === profileUser.id && { icon: "🔥", title: "Le plus chaud sans interruption", sub: `${streaks[0].value} jour${streaks[0].value > 1 ? "s" : ""} d'affilée` },
    cold[0]?.userId === profileUser.id && { icon: "🥶", title: "Le moins chaud", sub: `${cold[0].value} refus déclarés` },
    cursed[0]?.userId === profileUser.id && { icon: "🔮", title: "Le plus maudit", sub: `${cursed[0].value} malédiction${cursed[0].value > 1 ? "s" : ""}` },
  ].filter(Boolean) as { icon: string; title: string; sub: string }[];

  const statRow = (label: string, rows: { userId: string; value: number }[]) =>
    rows.find((r) => r.userId === profileUser.id)?.value ?? 0;

  return (
    <div className={`screen ${intense ? "mood-intense" : ""}`} data-mood={mood}>
      <MoodEffects mood={mood} intense={intense} />
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">👤</span> {profileUser.username}
        </div>
        <LogoutButton />
      </div>

      <div className="container">
        <div className="section-title" style={{ marginTop: 0 }}>Trophées</div>
        {badges.length === 0 ? (
          <p className="empty">Aucun badge pour l'instant.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 6 }}>
            {badges.map((b, i) => (
              <BadgeChip key={i} icon={b.icon} title={b.title} sub={b.sub} />
            ))}
          </div>
        )}

        <div className="section-title">Statistiques</div>
        <div className="card">
          <div className="row" style={{ padding: "6px 0" }}>
            <span>🏅 Banco reçus (hôte)</span>
            <strong>{statRow("host", hosts)}</strong>
          </div>
          <div className="row" style={{ padding: "6px 0" }}>
            <span>🔥 Série en cours</span>
            <strong>{statRow("streak", streaks)}</strong>
          </div>
          <div className="row" style={{ padding: "6px 0" }}>
            <span>🥶 "Pas envie" déclarés</span>
            <strong>{statRow("cold", cold)}</strong>
          </div>
          <div className="row" style={{ padding: "6px 0" }}>
            <span>🔮 Malédictions reçues</span>
            <strong>{statRow("cursed", cursed)}</strong>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
