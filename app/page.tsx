import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { effectiveDrinkStatus } from "@/lib/drinkStatus";
import { getUserMood } from "@/lib/mood";
import { gameDayRange } from "@/lib/gameDay";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";
import NotificationsCta from "@/components/NotificationsCta";
import DrinkStatusToggle from "@/components/DrinkStatusToggle";
import FriendsMapWrapper from "@/components/FriendsMapWrapper";
import MoodEffects from "@/components/MoodEffects";

const statusLabel: Record<string, { text: string; className: string }> = {
  SENT: { text: "Envoyée", className: "pill" },
  SEEN: { text: "Vue", className: "pill" },
  JOINED: { text: "J'y serai 🍻", className: "pill pill-cheers" },
  DECLINED: { text: "Décliné", className: "pill pill-decline" },
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const mood = await getUserMood(user.id, user.drinkStatus, user.drinkStatusDate);

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
    <div className="screen" data-mood={mood}>
      <MoodEffects mood={mood} />
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">🍺</span> P'tite bière ?
        </div>
        <LogoutButton />
      </div>

      <div className="container">
        <p style={{ color: "var(--foam-dim)", marginBottom: 18 }}>
          Salut {user.username} 👋
        </p>

        <DrinkStatusToggle initialStatus={effectiveDrinkStatus(user.drinkStatus, user.drinkStatusDate)} />

        <FriendsMapWrapper />

        <NotificationsCta />

        <Link href="/invite/new" className="btn btn-primary" style={{ marginTop: 6, textDecoration: "none" }}>
          🍻 Lancer un appel
        </Link>

        <div className="section-title">Invitations reçues (ce soir)</div>
        {receivedRows.length === 0 && (
          <div className="empty">Aucune invitation pour l'instant. Ça ne va pas durer.</div>
        )}
        {receivedRows.map((r) => (
          <Link key={r.id} href={`/invite/${r.invite.id}`} className="card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
            <div className="row">
              <strong>{r.invite.host.username}</strong>
              <span className={statusLabel[r.status].className}>{statusLabel[r.status].text}</span>
            </div>
            <p style={{ marginTop: 8, fontSize: 14, color: "var(--foam-dim)" }}>
              {r.invite.message.length > 90 ? r.invite.message.slice(0, 90) + "…" : r.invite.message}
            </p>
          </Link>
        ))}

        <div className="section-title">Tes appels envoyés (ce soir)</div>
        {sent.length === 0 && <div className="empty">Tu n'as encore invité personne ce soir.</div>}
        {sent.map((invite) => (
          <Link key={invite.id} href={`/invite/${invite.id}`} className="card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
            <div className="row">
              <strong>{invite.location}</strong>
              <span className="pill">
                {invite.recipients.filter((r) => r.status === "JOINED").length}/{invite.recipients.length} ok
              </span>
            </div>
            <p style={{ marginTop: 8, fontSize: 14, color: "var(--foam-dim)" }}>
              {invite.message.length > 90 ? invite.message.slice(0, 90) + "…" : invite.message}
            </p>
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
