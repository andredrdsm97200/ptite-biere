import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { effectiveDrinkStatus } from "@/lib/drinkStatus";
import { getUserMood, isCurseFresh } from "@/lib/mood";
import { getCircle } from "@/lib/leaderboard";
import { getBadgeMap } from "@/lib/badges";
import { getChope } from "@/lib/chope";
import { gameDayRange } from "@/lib/gameDay";
import LogoutButton from "@/components/LogoutButton";
import NotificationBell from "@/components/NotificationBell";
import BottomNav from "@/components/BottomNav";
import DrinkStatusToggle from "@/components/DrinkStatusToggle";
import MoodEffects from "@/components/MoodEffects";
import AutoRefresh from "@/components/AutoRefresh";
import PlansSection from "@/components/PlansSection";
import AvailabilitySummary from "@/components/AvailabilitySummary";
import DeclicCard from "@/components/DeclicCard";
import ChopeArt from "@/components/ChopeArt";
import { IconSettings } from "@/components/icons";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const mood = await getUserMood(user.id, user.drinkStatus, user.drinkStatusDate);
  const intense = mood === "cursed" ? await isCurseFresh(user.id) : false;
  const circle = await getCircle(user.id);
  const badgeMap = await getBadgeMap(circle);
  const myChope = await getChope(user.id);

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
    };
  });

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
          <span className="brand-mark">🍺</span> P'tite bière ?
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Link href="/settings" className="nav-link" style={{ padding: "6px 8px", display: "flex", color: "var(--foam-dim)" }} title="Réglages"><IconSettings size={19} /></Link>
          <NotificationBell />
          <LogoutButton />
        </div>
      </div>

      <div className="container">
        <Link href={`/u/${user.username}`} style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <ChopeArt tier={myChope.tierIndex} size={26} seed="greeting" />
          <span style={{ color: "var(--foam-dim)" }}>
            Salut {user.username} 👋 <span style={{ textDecoration: "underline" }}>({myChope.name})</span>
          </span>
        </Link>

        <AvailabilitySummary friends={friendsWithStatus} />

        <DeclicCard hotCount={friendsWithStatus.filter((f) => f.status === "AVAILABLE").length} />

        <DrinkStatusToggle initialStatus={effectiveDrinkStatus(user.drinkStatus, user.drinkStatusDate)} />

        <Link href="/invite/new" className="btn btn-primary" style={{ marginBottom: 18, textDecoration: "none" }}>
          🍻 Lancer un appel
        </Link>

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

      <BottomNav />
    </div>
  );
}
