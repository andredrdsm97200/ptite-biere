import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserMood, isCurseFresh } from "@/lib/mood";
import { getCircle } from "@/lib/leaderboard";
import { getBadgeMap } from "@/lib/badges";
import { getChopeMap } from "@/lib/chope";
import LogoutButton from "@/components/LogoutButton";
import NotificationBell from "@/components/NotificationBell";
import BottomNav from "@/components/BottomNav";
import InviteActions from "@/components/InviteActions";
import CurseButton from "@/components/CurseButton";
import RedeemButton from "@/components/RedeemButton";
import MoodEffects from "@/components/MoodEffects";
import BadgeInline from "@/components/BadgeInline";
import CancelInviteButton from "@/components/CancelInviteButton";
import EventGauge from "@/components/EventGauge";
import ParticipantAvatars from "@/components/ParticipantAvatars";
import { IconSettings, IconPin } from "@/components/icons";

const statusLabel: Record<string, { text: string; className: string }> = {
  SENT: { text: "Pas encore vu", className: "pill" },
  SEEN: { text: "Vu", className: "pill" },
  JOINED: { text: "J'y serai", className: "pill pill-cheers" },
  DECLINED: { text: "Décliné", className: "pill pill-decline" },
  CANCELLED: { text: "A annulé", className: "pill pill-decline" },
};

export default async function InvitePage({ params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const invite = await prisma.invite.findUnique({
    where: { id: params.id },
    include: { host: true, recipients: { include: { user: true } }, curses: true },
  });
  if (!invite) notFound();

  const isHost = invite.hostId === me.id;
  const myReceipt = invite.recipients.find((r) => r.userId === me.id);
  if (!isHost && !myReceipt) redirect("/");

  if (myReceipt && myReceipt.status === "SENT") {
    await prisma.inviteRecipient.update({
      where: { id: myReceipt.id },
      data: { status: "SEEN" },
    });
  }

  const mood = await getUserMood(me.id, me.drinkStatus, me.drinkStatusDate);
  const intense = mood === "cursed" ? await isCurseFresh(me.id) : false;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invite.location)}`;
  const cursedIds = new Set(invite.curses.map((c) => c.cursedUserId));

  const circle = await getCircle(me.id);
  const badgeMap = await getBadgeMap(circle);
  const chopeMap = await getChopeMap([...circle, invite.hostId, ...invite.recipients.map((r) => r.userId)]);
  const joinedCount = invite.recipients.filter((r) => r.status === "JOINED").length;

  // Dettes de "tournée double" en cours, pour chaque invité présent.
  const joinedIds = invite.recipients.filter((r) => r.status === "JOINED").map((r) => r.userId);
  const unpaidCurses = joinedIds.length
    ? await prisma.curse.findMany({ where: { cursedUserId: { in: joinedIds }, redeemed: false } })
    : [];
  const debtorIds = new Set(unpaidCurses.map((c) => c.cursedUserId));

  return (
    <div className={`screen ${intense ? "mood-intense" : ""}`} data-mood={mood}>
      <MoodEffects mood={mood} intense={intense} />
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">🍺</span> Invitation
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Link href="/settings" className="nav-link" style={{ padding: "6px 8px", display: "flex", color: "var(--foam-dim)" }} title="Réglages"><IconSettings size={19} /></Link>
          <NotificationBell />
          <LogoutButton />
        </div>
      </div>

      <div className="container">
        {invite.cancelledAt && (
          <div className="error-banner">
            😢 {isHost ? "Tu as annulé" : `${invite.host.username} a annulé`} ce plan.
          </div>
        )}

        <div className="coaster">
          <p className="coaster-message">"{invite.message}"</p>
          <p className="coaster-from">
            — {invite.host.username}
            <BadgeInline badges={badgeMap[invite.hostId]} />
          </p>
        </div>

        {(invite.showRecipients || isHost) && (
          <div className="card event-gauge-card">
            <EventGauge joined={joinedCount} total={invite.recipients.length} />
            <ParticipantAvatars
              participants={invite.recipients.map((r) => ({ id: r.userId, username: r.user.username, status: r.status }))}
              chopeMap={chopeMap}
            />
          </div>
        )}

        <div className="card">
          <div className="section-title" style={{ margin: 0, marginBottom: 8 }}>
            <span style={{ color: "var(--copper)", display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}>
              <IconPin size={13} />
            </span>
            Lieu
          </div>
          <p style={{ marginBottom: 10 }}>{invite.location}</p>
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            Ouvrir dans Maps
          </a>
        </div>

        {isHost && !invite.cancelledAt && (
          <div className="card">
            <CancelInviteButton inviteId={invite.id} />
          </div>
        )}

        {!isHost && !invite.cancelledAt && (
          <div className="card">
            <InviteActions inviteId={invite.id} currentStatus={myReceipt?.status ?? null} />
          </div>
        )}

        {(invite.showRecipients || isHost) && (
          <>
            <div className="section-title">Qui est invité</div>
            <div className="card">
              {invite.recipients.map((r) => {
                const showNote = r.note && (r.noteVisibility === "PUBLIC" || isHost);
                const hasDebt = debtorIds.has(r.userId) && r.status === "JOINED";
                return (
                  <div key={r.id} style={{ padding: "8px 0" }}>
                    <div className="row">
                      <span>
                        {r.user.username}
                        <BadgeInline badges={badgeMap[r.userId]} />
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className={statusLabel[r.status].className}>{statusLabel[r.status].text}</span>
                        {isHost && !invite.cancelledAt && (
                          <CurseButton
                            inviteId={invite.id}
                            recipientUserId={r.userId}
                            alreadyCursed={cursedIds.has(r.userId)}
                          />
                        )}
                      </div>
                    </div>
                    {showNote && (
                      <p style={{ fontSize: 12, color: "var(--foam-dim)", fontStyle: "italic", marginTop: 4 }}>
                        "{r.note}" {r.noteVisibility === "HOST" && isHost ? "(visible par toi seul)" : ""}
                      </p>
                    )}
                    {hasDebt && (
                      <div className="row" style={{ marginTop: 4 }}>
                        <span className="pill pill-cursed">🍻🍻 Doit une tournée double (malédiction impayée)</span>
                        {isHost && <RedeemButton inviteId={invite.id} recipientUserId={r.userId} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {isHost && (
              <p style={{ fontSize: 12, color: "var(--foam-dim)", marginTop: -6 }}>
                Un pote annoncé mais jamais venu ? Tu peux le maudire — son thème
                passera au poison pour rire, sans aucune vraie conséquence.
              </p>
            )}
          </>
        )}
        {!invite.showRecipients && !isHost && (
          <p className="empty">{invite.host.username} a choisi de ne pas montrer qui d'autre est invité.</p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
