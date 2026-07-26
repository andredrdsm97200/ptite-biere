import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserMood, isCurseFresh } from "@/lib/mood";
import { getCircle, bestHosts, hottestStreaks, mostUnavailable, mostCursed, RankRow } from "@/lib/leaderboard";
import { getBadgeMap, globalScores } from "@/lib/badges";
import { gameDayKey } from "@/lib/gameDay";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";
import MoodEffects from "@/components/MoodEffects";
import AutoRefresh from "@/components/AutoRefresh";
import BadgeChip from "@/components/BadgeChip";
import BadgeInline from "@/components/BadgeInline";
import CurseButton from "@/components/CurseButton";

function RankingList({
  rows,
  meId,
  unit,
  badgeMap,
  flame,
}: {
  rows: RankRow[];
  meId: string;
  unit: string;
  badgeMap: Record<string, { icon: string; title: string }[]>;
  flame?: boolean;
}) {
  if (rows.length === 0) return <p className="empty">Personne dans ce classement pour l'instant.</p>;
  return (
    <div className="card">
      {rows.slice(0, 5).map((r, i) => (
        <div key={r.userId} className={`leaderboard-row ${r.userId === meId ? "me" : ""}`}>
          <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="rank">#{i + 1}</span>
            <Link href={`/u/${r.username}`} style={{ textDecoration: "none", color: "inherit" }}>
              {r.username}
            </Link>
            <BadgeInline badges={badgeMap[r.userId]} />
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {flame && <span style={{ fontSize: 12 + Math.min(r.value, 10) * 2 }}>🔥</span>}
            {r.value} {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function LeaderboardPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const mood = await getUserMood(me.id, me.drinkStatus, me.drinkStatusDate);
  const intense = mood === "cursed" ? await isCurseFresh(me.id) : false;
  const circle = await getCircle(me.id);

  const [hosts, streaks, cold, cursed, global, badgeMap] = await Promise.all([
    bestHosts(circle),
    hottestStreaks(circle),
    mostUnavailable(circle),
    mostCursed(circle),
    globalScores(circle),
    getBadgeMap(circle),
  ]);

  const myBadges = badgeMap[me.id] || [];

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
    <div className={`screen ${intense ? "mood-intense" : ""}`} data-mood={mood}>
      <MoodEffects mood={mood} intense={intense} />
      <AutoRefresh />
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
              <BadgeChip key={i} icon={b.icon} title={b.title} sub="Tu détiens ce badge en ce moment" />
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

        <div className="section-title">🎲 Classement général</div>
        <p style={{ fontSize: 12, color: "var(--foam-dim)", marginTop: -6, marginBottom: 8 }}>
          +3 par banco reçu (hôte), +2 par jour de série, -1 par "pas envie", -5 par malédiction.
        </p>
        {global.length === 0 ? (
          <p className="empty">Personne n'a encore de score. Active "Chaud" pour te lancer.</p>
        ) : (
          <div className="card">
            {global.slice(0, 8).map((r, i) => (
              <div key={r.userId} className={`leaderboard-row ${r.userId === me.id ? "me" : ""}`}>
                <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="rank">#{i + 1}</span>
                  {i === 0 && <span>👑</span>}
                  <Link href={`/u/${r.username}`} style={{ textDecoration: "none", color: "inherit" }}>
                    {r.username}
                  </Link>
                  <BadgeInline badges={badgeMap[r.userId]} />
                </span>
                <span>{r.score} pts</span>
              </div>
            ))}
          </div>
        )}

        <div className="section-title">🏅 Meilleur hôte</div>
        <RankingList rows={hosts} meId={me.id} unit="banco" badgeMap={badgeMap} />

        <div className="section-title">🔥 Le plus chaud sans interruption</div>
        <RankingList rows={streaks} meId={me.id} unit="jours" badgeMap={badgeMap} flame />

        <div className="section-title">🥶 Le moins chaud</div>
        <RankingList rows={cold} meId={me.id} unit="refus" badgeMap={badgeMap} />

        <div className="section-title">🔮 Badge malédiction</div>
        <RankingList rows={cursed} meId={me.id} unit="malédictions" badgeMap={badgeMap} />
      </div>

      <BottomNav />
    </div>
  );
}
