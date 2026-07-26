import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserMood } from "@/lib/mood";
import { getCircle, bestHosts, hottestStreaks, mostUnavailable, mostCursed, RankRow } from "@/lib/leaderboard";
import { gameDayKey } from "@/lib/gameDay";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";
import MoodEffects from "@/components/MoodEffects";
import BadgeChip from "@/components/BadgeChip";
import CurseButton from "@/components/CurseButton";

function RankingList({ rows, meId, unit }: { rows: RankRow[]; meId: string; unit: string }) {
  if (rows.length === 0) return <p className="empty">Personne dans ce classement pour l'instant.</p>;
  return (
    <div className="card">
      {rows.slice(0, 5).map((r, i) => (
        <div key={r.userId} className={`leaderboard-row ${r.userId === meId ? "me" : ""}`}>
          <span style={{ display: "flex", gap: 10 }}>
            <span className="rank">#{i + 1}</span>
            <span>{r.username}</span>
          </span>
          <span>{r.value} {unit}</span>
        </div>
      ))}
    </div>
  );
}

export default async function LeaderboardPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const mood = await getUserMood(me.id, me.drinkStatus, me.drinkStatusDate);
  const circle = await getCircle(me.id);

  const [hosts, streaks, cold, cursed] = await Promise.all([
    bestHosts(circle),
    hottestStreaks(circle),
    mostUnavailable(circle),
    mostCursed(circle),
  ]);

  const myBadges = [
    hosts[0]?.userId === me.id && { icon: "🏅", title: "Meilleur hôte", sub: `${hosts[0].value} "banco" reçus sur tes appels` },
    streaks[0]?.userId === me.id && { icon: "🔥", title: "Le plus chaud sans interruption", sub: `${streaks[0].value} jour${streaks[0].value > 1 ? "s" : ""} d'affilée` },
    cold[0]?.userId === me.id && { icon: "🥶", title: "Le moins chaud", sub: `${cold[0].value} refus déclarés` },
    cursed[0]?.userId === me.id && { icon: "🔮", title: "Le plus maudit", sub: `${cursed[0].value} malédiction${cursed[0].value > 1 ? "s" : ""} reçue${cursed[0].value > 1 ? "s" : ""}` },
  ].filter(Boolean) as { icon: string; title: string; sub: string }[];

  // Invitations que j'ai hébergées ces 7 derniers jours, avec des invités
  // pas encore sanctionnés — pour l'action "Maudire" du lendemain.
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const pastInvites = await prisma.invite.findMany({
    where: { hostId: me.id, createdAt: { gte: weekAgo, lt: gameDayKey() } },
    include: { recipients: { include: { user: true } }, curses: true },
    orderBy: { createdAt: "desc" },
  });
  const toSanction = pastInvites
    .map((inv) => ({
      invite: inv,
      pending: inv.recipients.filter((r) => !inv.curses.some((c) => c.cursedUserId === r.userId)),
    }))
    .filter((x) => x.pending.length > 0);

  return (
    <div className="screen" data-mood={mood}>
      <MoodEffects mood={mood} />
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">🏆</span> Classement
        </div>
        <LogoutButton />
      </div>

      <div className="container">
        <div className="section-title" style={{ marginTop: 0 }}>Tes badges actuels</div>
        {myBadges.length === 0 ? (
          <p className="empty">Aucun badge pour l'instant — sois le plus chaud, le meilleur hôte, ou prends date pour le pire 😏</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 6 }}>
            {myBadges.map((b, i) => (
              <BadgeChip key={i} icon={b.icon} title={b.title} sub={b.sub} />
            ))}
          </div>
        )}

        {toSanction.length > 0 && (
          <>
            <div className="section-title">À sanctionner (7 derniers jours)</div>
            {toSanction.map(({ invite, pending }) => (
              <div key={invite.id} className="card">
                <p style={{ fontSize: 13, color: "var(--foam-dim)", marginBottom: 8 }}>
                  {invite.location} — {new Date(invite.createdAt).toLocaleDateString("fr-FR")}
                </p>
                {pending.map((r) => (
                  <div key={r.id} className="row" style={{ padding: "6px 0" }}>
                    <span>{r.user.username}</span>
                    <CurseButton inviteId={invite.id} recipientUserId={r.userId} alreadyCursed={false} />
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        <div className="section-title">🏅 Meilleur hôte</div>
        <RankingList rows={hosts} meId={me.id} unit="banco" />

        <div className="section-title">🔥 Le plus chaud sans interruption</div>
        <RankingList rows={streaks} meId={me.id} unit="jours" />

        <div className="section-title">🥶 Le moins chaud</div>
        <RankingList rows={cold} meId={me.id} unit="refus" />

        <div className="section-title">🔮 Badge malédiction</div>
        <RankingList rows={cursed} meId={me.id} unit="malédictions" />
      </div>

      <BottomNav />
    </div>
  );
}
