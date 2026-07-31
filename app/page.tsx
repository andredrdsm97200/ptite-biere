import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { effectiveDrinkStatus } from "@/lib/drinkStatus";
import { getUserMood, isCurseFresh } from "@/lib/mood";
import { getCircle } from "@/lib/leaderboard";
import { getBadgeMap } from "@/lib/badges";
import { gameDayRange } from "@/lib/gameDay";
import LogoutButton from "@/components/LogoutButton";
import NotificationBell from "@/components/NotificationBell";
import BottomNav from "@/components/BottomNav";
import DrinkStatusToggle from "@/components/DrinkStatusToggle";
import MoodEffects from "@/components/MoodEffects";
import AutoRefresh from "@/components/AutoRefresh";
import PlansSection from "@/components/PlansSection";
import AvailabilitySummary from "@/components/AvailabilitySummary";
import QuickActionCards from "@/components/QuickActionCards";
import { IconSettings } from "@/components/icons";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const mood = await getUserMood(user.id, user.drinkStatus, user.drinkStatusDate);
  const intense = mood === "cursed" ? await isCurseFresh(user.id) : false;
  const circle = await getCircle(user.id);
  const badgeMap = await getBadgeMap(circle);

  const friendships = await prisma.friendship.findMany({
    where: { status: "ACCEPTED", OR: [{ userAId: user.id }, { userBId: user.id }] },
    include: { userA: true, userB: true },
  });
  const friendsWithStatus = friendships.map((f) => {
    const friend = f.userAId === user.id ? f.userB : f.userA;
    return {
      id: friend.id,
      username: friend.username,
      status: effectiveDrinkStatus(friend.drinkStatus, friend.drinkStatusDate),
      avatarUrl: friend.avatarUrl,
      drinkStatusDate: friend.drinkStatusDate,
    };
  });

  const myStatus = effectiveDrinkStatus(user.drinkStatus, user.drinkStatusDate);

  // "Tu es le Ne motivé" : rang parmi les chauds du jour, par ordre de déclaration.
  let myRank: number | null = null;
  if (myStatus === "AVAILABLE") {
    const hotWithDates = [
      ...friendsWithStatus
        .filter((f) => f.status === "AVAILABLE")
        .map((f) => ({ id: f.id, at: f.drinkStatusDate?.getTime() ?? 0 })),
      { id: user.id, at: user.drinkStatusDate?.getTime() ?? 0 },
    ].sort((a, b) => a.at - b.at);
    myRank = hotWithDates.findIndex((f) => f.id === user.id) + 1;
  }

  // La soirée du jour disparaît de l'accueil à 5h du matin (mais reste en
  // base pour les classements et les malédictions du lendemain).
  const { start, end } = gameDayRange();

  const receivedRows = await prisma.inviteRecipient.findMany({
    where: { userId: user.id, invite: { createdAt: { gte: start, lt: end }, cancelledAt: null } },
    include: { invite: { include: { host: true } } },
    orderBy: { invite: { createdAt: "desc" } },
    take: 20,
  });

  const sent = await prisma.invite.findMany({
    where: { hostId: user.id, createdAt: { gte: start, lt: end }, cancelledAt: null },
    include: { recipients: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className={`screen ${intense ? "mood-intense" : ""}`} data-mood={mood}>
      <MoodEffects mood={mood} intense={intense} />
      <AutoRefresh />
      <div className="topbar">
        <div className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="P'tite bière ?" className="brand-logo" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href={`/u/${user.username}`}
            title="Ton profil"
            style={
              user.avatarUrl
                ? { width: 34, height: 34, borderRadius: "50%", border: "2px solid var(--amber)", backgroundImage: `url(${user.avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                : { width: 34, height: 34, borderRadius: "50%", border: "2px solid var(--amber)", background: "var(--ink-3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton, sans-serif", fontSize: 13, color: "var(--foam)", textDecoration: "none" }
            }
          >
            {!user.avatarUrl && user.username.slice(0, 1).toUpperCase()}
          </Link>
          <Link href="/settings" className="nav-link" style={{ padding: "6px 8px", display: "flex", color: "var(--foam-dim)" }} title="Réglages"><IconSettings size={19} /></Link>
          <NotificationBell />
          <LogoutButton />
        </div>
      </div>

      <div className="container">
        <AvailabilitySummary friends={friendsWithStatus} />

        <DrinkStatusToggle initialStatus={myStatus} />

        {myRank && (
          <p className="rank-line">
            Tu es le <strong>{myRank}e</strong> motivé.
          </p>
        )}

        <QuickActionCards friends={friendsWithStatus} />

        <PlansSection
          received={receivedRows.map((r) => ({
            id: r.id,
            status: r.status,
            invite: { id: r.invite.id, host: { username: r.invite.host.username }, hostId: r.invite.hostId, message: r.invite.message },
          }))}
          sent={sent.map((s) => ({
            id: s.id,
            location: s.location,
            message: s.message,
            recipients: s.recipients.map((r) => ({ status: r.status })),
          }))}
          badgeMap={badgeMap}
        />
      </div>

      <BottomNav username={user.username} />
    </div>
  );
}
