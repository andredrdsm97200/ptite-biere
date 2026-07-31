import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { effectiveDrinkStatus } from "@/lib/drinkStatus";
import { getUserMood, isCurseFresh } from "@/lib/mood";
import { getCircle } from "@/lib/leaderboard";
import { getBadgeMap } from "@/lib/badges";
import { gameDayRange } from "@/lib/gameDay";
import ProfileMenu from "@/components/ProfileMenu";
import BottomNav from "@/components/BottomNav";
import DrinkStatusToggle from "@/components/DrinkStatusToggle";
import MoodEffects from "@/components/MoodEffects";
import AutoRefresh from "@/components/AutoRefresh";
import PlansSection from "@/components/PlansSection";
import AvailabilitySummary from "@/components/AvailabilitySummary";
import QuickActionCards from "@/components/QuickActionCards";

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
        <ProfileMenu username={user.username} avatarUrl={user.avatarUrl} />
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
