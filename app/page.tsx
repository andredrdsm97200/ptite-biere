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
import BottomNav from "@/components/BottomNav";
import DrinkStatusToggle from "@/components/DrinkStatusToggle";
import MoodEffects from "@/components/MoodEffects";
import AutoRefresh from "@/components/AutoRefresh";
import PlansSection from "@/components/PlansSection";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const mood = await getUserMood(user.id, user.drinkStatus, user.drinkStatusDate);
  const intense = mood === "cursed" ? await isCurseFresh(user.id) : false;
  const circle = await getCircle(user.id);
  const badgeMap = await getBadgeMap(circle);

  // La soirée du jour disparaît de l'accueil à 5h du matin (mais reste en
  // base pour les classements et les malédictions du lendemain).
  const { start, end } = gameDayRange();

  const receivedRows = await prisma.inviteRecipient.findMany({
    where: { userId: user.id, invite: { createdAt: { gte: start, lt: end } } },
    include: { invite: { include: { host: true } } },
    orderBy: { invite: { createdAt: "desc" } },
    take: 20,
  });

  const sent = await prisma.invite.findMany({
    where: { hostId: user.id, createdAt: { gte: start, lt: end } },
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
        <LogoutButton />
      </div>

      <div className="container">
        <p style={{ color: "var(--foam-dim)", marginBottom: 14 }}>
          Salut {user.username} 👋
        </p>

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
