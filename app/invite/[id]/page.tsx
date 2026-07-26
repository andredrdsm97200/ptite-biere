import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserMood } from "@/lib/mood";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";
import InviteActions from "@/components/InviteActions";
import CurseButton from "@/components/CurseButton";
import MoodEffects from "@/components/MoodEffects";

const statusLabel: Record<string, { text: string; className: string }> = {
  SENT: { text: "Pas encore vu", className: "pill" },
  SEEN: { text: "Vu", className: "pill" },
  JOINED: { text: "J'y serai", className: "pill pill-cheers" },
  DECLINED: { text: "Décliné", className: "pill pill-decline" },
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
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invite.location)}`;
  const cursedIds = new Set(invite.curses.map((c) => c.cursedUserId));

  return (
    <div className="screen" data-mood={mood}>
      <MoodEffects mood={mood} />
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">🍺</span> Invitation
        </div>
        <LogoutButton />
      </div>

      <div className="container">
        <div className="coaster">
          <p className="coaster-message">"{invite.message}"</p>
          <p className="coaster-from">— {invite.host.username}</p>
        </div>

        <div className="card">
          <div className="section-title" style={{ margin: 0, marginBottom: 8 }}>
            📍 Lieu
          </div>
          <p style={{ marginBottom: 10 }}>{invite.location}</p>
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            Ouvrir dans Maps
          </a>
        </div>

        {!isHost && (
          <div className="card">
            <InviteActions inviteId={invite.id} currentStatus={myReceipt?.status ?? null} />
          </div>
        )}

        {(invite.showRecipients || isHost) && (
          <>
            <div className="section-title">Qui est invité</div>
            <div className="card">
              {invite.recipients.map((r) => (
                <div key={r.id} className="row" style={{ padding: "8px 0" }}>
                  <span>{r.user.username}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={statusLabel[r.status].className}>{statusLabel[r.status].text}</span>
                    {isHost && (
                      <CurseButton
                        inviteId={invite.id}
                        recipientUserId={r.userId}
                        alreadyCursed={cursedIds.has(r.userId)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            {isHost && (
              <p style={{ fontSize: 12, color: "var(--foam-dim)", marginTop: -6 }}>
                Un pote annoncé mais jamais venu ? Tu peux le maudire — son thème
                passera au poison jusqu'à demain 5h.
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
